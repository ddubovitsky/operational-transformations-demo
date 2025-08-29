import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Site } from '../../src/site/site.ts';
import { InsertOperation } from '../../src/operations/insert.operation.ts';
import { StateVector } from '../../src/utils/state-vector/state-vector.class.ts';


enum TestSites {
  Site1 = 1,
  Site2 = 2,
  Site3 = 3,
  Site4 = 4,
  Site5 = 5,
  Site6 = 6,
}

describe('Site', () => {

  describe('Local operations', () => {
    it('should immediately perform local operation', () => {
      const site1 = new Site(TestSites.Site1);
      const operation = new InsertOperation(1, 'abs');
      site1.addLocalOperation(operation);
      assert.deepEqual(site1.history, [operation.timestamp(StateVector.create(), TestSites.Site1)]);
    });

    it('should increase state vector after performed local operation', () => {
      const site1 = new Site(TestSites.Site1);
      const operation = new InsertOperation(1, 'abs');
      site1.addLocalOperation(operation);
      assert.deepEqual(site1.stateVector, StateVector.create({ [TestSites.Site1]: 1 }));

      const operation2 = new InsertOperation(1, 'abs');
      site1.addLocalOperation(operation2);
      assert.deepEqual(site1.stateVector, StateVector.create({ [TestSites.Site1]: 2 }));
    });
  });

  describe('Remote operations', () => {
    it('should immediately perform if context are equally empty', () => {
      const site1 = new Site(TestSites.Site1);
      const site2 = new Site(TestSites.Site2);

      const operation = new InsertOperation(1, 'abs');
      const addedOperation = site1.addLocalOperation(operation);

      site2.addRemoteOperation(addedOperation);

      assert.deepEqual(site2.history, [addedOperation]);
    });

    it('should immediately perform if context are equivalent and have 1 operation', () => {
      const site1 = new Site(TestSites.Site1);
      const site2 = new Site(TestSites.Site2);

      const site1LocalOperations = [new InsertOperation(1, 'abs'), new InsertOperation(2, '123')];
      const site1GeneratedOperations = [];

      site1LocalOperations.forEach((operation) => {
        site1GeneratedOperations.push(site1.addLocalOperation(operation));
      });

      site1GeneratedOperations.forEach((site1GeneratedOperation) => {
        site2.addRemoteOperation(site1GeneratedOperation);
      });

      assert.deepEqual(site2.history, site1GeneratedOperations);
    });
  });


  it('Operations should be performed only after preceding operations from same site are received', () => {
    const site1 = new Site(TestSites.Site1);
    const site2 = new Site(TestSites.Site2);

    const site1GeneratedOperations = [
      new InsertOperation(1, 'abs'),
      new InsertOperation(2, '123'),
      new InsertOperation(1, 'abs'),
    ].map((it) => site1.addLocalOperation(it));

    // take all operations except first
    site1GeneratedOperations.slice(1).forEach((operation) => {
      site2.addRemoteOperation(operation);
      assert.deepEqual(site2.history, [], 'Operations should remain empty until 1 operations is received');
    });

    site2.addRemoteOperation(site1GeneratedOperations[0]);
    assert.deepEqual(site2.history, site1GeneratedOperations, 'After 1st operation received, all pending should be executed too');
  });

  it('should not immediately perform if site misses operations from other sites', () => {
    const site1 = new Site(TestSites.Site1);
    const site2 = new Site(TestSites.Site2);
    const site3 = new Site(TestSites.Site3);

    const site1GeneratedOperation = site1.addLocalOperation(new InsertOperation(1, '123'));
    const site3GeneratedOperation = site3.addLocalOperation(new InsertOperation(1, '123'));

    site1.addRemoteOperation(site3GeneratedOperation);

    const site1DependantOperation = site1.addLocalOperation(new InsertOperation(1, 'Korova'));

    site2.addRemoteOperation(site1GeneratedOperation);
    assert.deepEqual(site2.history, [site1GeneratedOperation], 'Site2 adds first operations since context are equivalent');

    site2.addRemoteOperation(site1DependantOperation);
    assert.deepEqual(site2.history, [site1GeneratedOperation], 'Site2 does not add second operation, since it depends on the site3 operation to be present too' + `${site2.history.length} should be 1`);
    site2.addRemoteOperation(site3GeneratedOperation);

    assert.deepEqual(site2.history, [site1GeneratedOperation, site3GeneratedOperation, site1DependantOperation], 'After Site3 receives third operation, dependant operation is ready and they both should be added to the history list');
  });

});
