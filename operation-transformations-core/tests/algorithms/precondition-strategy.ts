import { describe, it } from 'node:test';
import assert from 'node:assert';
import { StateVector } from '../../src/state-vector/state-vector.class.ts';
import { PreconditionStrategy } from '../../src/got-control/operation-ready-preconditions.class.ts';


enum TestSites {
  Site1 = 1,
  Site2 = 2
}

const preconditionStrategy = new PreconditionStrategy();

describe('Precondition 1', () => {
  it('Operation is ready when state vector is empty', () => {
    const siteStateVector = StateVector.create();
    const operationStateVector = StateVector.create();

    assert.ok(preconditionStrategy.canExecuteOperation(siteStateVector, operationStateVector, TestSites.Site1));
  });

  it('Operation is ready when operation has same context as the site', () => {
    const siteStateVector = StateVector.create({ [TestSites.Site1]: 1 });
    const operationStateVector = StateVector.create({ [TestSites.Site1]: 1 });

    assert.ok(preconditionStrategy.canExecuteOperation(siteStateVector, operationStateVector, TestSites.Site1));
  });

  it('Operation is not ready when operation is not contextually succeeding', () => {
    const siteStateVector = StateVector.create({ [TestSites.Site1]: 1 });
    const operationStateVector = StateVector.create({ [TestSites.Site1]: 3 });

    assert.ok(!preconditionStrategy.canExecuteOperation(siteStateVector, operationStateVector, TestSites.Site1));
  });

  it('Operation is not ready when there are missing operation from other sites', () => {
    const siteStateVector = StateVector.create({ [TestSites.Site1]: 1, [TestSites.Site2]: 1 });
    const operationStateVector = StateVector.create({ [TestSites.Site1]: 2, [TestSites.Site2]: 2 });

    assert.ok(!preconditionStrategy.canExecuteOperation(siteStateVector, operationStateVector, TestSites.Site1));
  });

  it('Operation is ready when there are exist future operation from other sites on the target site', () => {
    const siteStateVector = StateVector.create({ [TestSites.Site1]: 2, [TestSites.Site2]: 6 });
    const operationStateVector = StateVector.create({ [TestSites.Site1]: 2, [TestSites.Site2]: 2 });

    assert.ok(preconditionStrategy.canExecuteOperation(siteStateVector, operationStateVector, TestSites.Site1));
  });

  it('Operation is not ready when it is already accounted for in the site', () => {
    const siteStateVector = StateVector.create({ [TestSites.Site1]: 2 });
    const operationStateVector = StateVector.create({ [TestSites.Site1]: 1 });

    assert.ok(!preconditionStrategy.canExecuteOperation(siteStateVector, operationStateVector, TestSites.Site1));
  });

  it('should be able to perform if current context is null, and next is null too', () => {
    const siteStateVector = StateVector.create();
    const operationStateVector = StateVector.create();

    assert.ok(preconditionStrategy.canExecuteOperation(siteStateVector, operationStateVector, TestSites.Site1));
  });

  it('should not immediately perform if context are missing first operation', () => {
    const siteStateVector = StateVector.create();
    const operationStateVector = StateVector.create({[TestSites.Site1]: 2});

    assert.ok(!preconditionStrategy.canExecuteOperation(siteStateVector, operationStateVector, TestSites.Site1));  });
});
