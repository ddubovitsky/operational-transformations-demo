import test, { describe } from 'node:test';
import assert from 'node:assert';
import { StateVector } from '../../src/state-vector/state-vector.class.ts';

enum TestSites {
  Site1 = 1,
  Site2 = 2,
  Site3 = 3,
  Site4 = 4,
  Site5 = 5,
  Site6 = 6,
}

describe('State Vector', (t) => {

  test('State vector counter should support increasing site known operation', () => {
    const stateVector = StateVector.create();
    const resultStateVector = stateVector.increment(TestSites.Site1);
    assert.deepEqual(resultStateVector, StateVector.create(({ [TestSites.Site1]: 1 })));
  });

  test('State vector counter should preserve other known operations', () => {
    const stateVector = StateVector.create(({ [TestSites.Site1]: 3 }));
    const resultStateVector = stateVector.increment(TestSites.Site2);
    assert.deepEqual(resultStateVector, StateVector.create(({ [TestSites.Site1]: 3, [TestSites.Site2]: 1 })));
  });
});
