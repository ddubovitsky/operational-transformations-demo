import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Site } from '../../src/site/site.ts';
import { InsertOperation } from '../../src/operations/insert.operation.ts';
import { StateVector } from '../../src/state-vector/state-vector.class.ts';


enum TestSites {
  Site1 = 1,
  Site2 = 2,
  Site3 = 3,
  Site4 = 4,
  Site5 = 5,
  Site6 = 6,
}

describe('Site', () => {
  it('should immediately perform local operation', () => {
    const site1 = new Site(TestSites.Site1);
    const operation = new InsertOperation(1, 'abs');
    site1.addLocalOperation(operation);
    assert.deepEqual(site1.history, [operation.timestamp(StateVector.create())]);
  });

  it('should increase state vector after performed local operation', () => {
    const site1 = new Site(TestSites.Site1);
    const operation = new InsertOperation(1, 'abs');
    site1.addLocalOperation(operation);
    assert.deepEqual(site1.stateVector, StateVector.create({ [TestSites.Site1]: 1 }));
  });

  it('should immediately perform if context are equally empty', () => {
    const site1 = new Site(TestSites.Site1);
    const site2 = new Site(TestSites.Site2);

    const operation = new InsertOperation(1, 'abs');
    const addedOperation = site1.addLocalOperation(operation);

    site2.addRemoteOperation(addedOperation);

    assert.deepEqual(site2.history, [operation.timestamp(StateVector.create(), TestSites.Site1)]);
  });

  it('should immediately perform if context are equivalent and have 1 operation', () => {
    const site1 = new Site(TestSites.Site1);
    const site2 = new Site(TestSites.Site2);

    const operation = new InsertOperation(1, 'abs');
    const addedOperation = site1.addLocalOperation(operation);
    site2.addRemoteOperation(addedOperation);


    const target = new InsertOperation(2, '123');
    const site1GeneratedOperation = site1.addLocalOperation(target);

    site2.addRemoteOperation(site1GeneratedOperation);

    assert.deepEqual(site2.history, [addedOperation, site1GeneratedOperation]);
  });


  it('should not immediately perform if context are missing first operation', () => {
    // event if state is empty, and we are received 3d operation for site, we should wait for all other operations to arrive
  });

  it('should only store and perform operation when intermediate operations are received', () => {
    const site1 = new Site(TestSites.Site1);
    const site2 = new Site(TestSites.Site2);

    const operation = new InsertOperation(1, 'abs');
    const operation1 = new InsertOperation(2, '123');
    const operation2 = new InsertOperation(3, '567');
    const operation3 = new InsertOperation(3, '567');

    const initialOperation = site1.addLocalOperation(operation);

    const intermediateOperation = site1.addLocalOperation(operation1);
    const intermediateOperation2 = site1.addLocalOperation(operation2);

    const finalOperation = site1.addLocalOperation(operation3);

    site2.addRemoteOperation(initialOperation);
    site2.addRemoteOperation(finalOperation);

    assert.deepEqual(site2.history, [initialOperation]);

    site2.addRemoteOperation(intermediateOperation2);
    site2.addRemoteOperation(intermediateOperation);

    assert.deepEqual(site2.history, [initialOperation, intermediateOperation, intermediateOperation2, finalOperation]);
  });

  it('should include and perform perform if context have independent operations', () => {
    const site1 = new Site();
    const site2 = new Site();

    const operation1 = new Operation();
    const operation2 = new Operation();

    const site1addedOperation = site1.addLocalOperation(operation1);
    const site2AddedOperation = site2.addLocalOperation(operation2);

    site2.addRemoteOperation(site1addedOperation);

    assert.deepEqual(site2.history, [site2AddedOperation, site1addedOperation.include(site2AddedOperation)]);
  });


  it('should exclude, include and perform if context have independent AND transformed operations', () => {
    const site1 = new Site();
    const site2 = new Site();

    const operation1 = new Operation();
    const operation2 = new Operation();

    const site1addedOperation = site1.addLocalOperation(operation1);
    const site1addedOperation2 = site1.addLocalOperation(operation2);

    const site2AddedOperation = site2.addLocalOperation(operation2);

    site2.addRemoteOperation(site1addedOperation);
    site2.addRemoteOperation(site1addedOperation2);

    assert.deepEqual(site2.history, [
      site2AddedOperation,
      site1addedOperation.include(site2AddedOperation),
      site1addedOperation2
        .exclude(site1addedOperation)
        .include(site2AddedOperation, site1addedOperation2)],
    );
  });
});
