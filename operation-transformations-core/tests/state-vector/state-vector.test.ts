import test, { describe } from 'node:test';
import assert from 'node:assert';
import { StateVector } from '../../src/utils/state-vector/state-vector.class.ts';

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


  describe('State vector comparison', () => {
    test('State vector counter should treat empty state as 0, and 1 is contextually succeeding', () => {
      const stateVector = StateVector.create();
      const stateVector2 = StateVector.create({ [TestSites.Site1]: 1 });
      assert.ok(stateVector.isContextuallyPreceding(stateVector2, TestSites.Site1));
    });

    test('State vector should have same site context equal if they are equal', () => {
      const stateVector = StateVector.create({ [TestSites.Site1]: 1 });
      const stateVector2 = StateVector.create({ [TestSites.Site1]: 1 });
      assert.ok(stateVector.isEqualForSite(stateVector2, TestSites.Site1));
    });
  });


  describe('State Vector operations independence', () => {
    test('State vector should tell true if operations are independent on empty states', () => {
      const stateVector = StateVector.create({
        [TestSites.Site1]: 1,
        [TestSites.Site2]: 1,
      });
      const stateVector2 = StateVector.create({
        [TestSites.Site1]: 1,
      });
      assert.ok(stateVector.isIndependentOf(stateVector2, TestSites.Site1));
    });
    test('State vector should tell false if operations are  not independent  on empty states', () => {
      const stateVector = StateVector.create({ [TestSites.Site1]: 1 });
      const stateVector2 = StateVector.create({ [TestSites.Site1]: 1 });
      assert.ok(!stateVector.isIndependentOf(stateVector2, TestSites.Site1));
    });


    test('State vector should tell true if operations are independent on populated states', () => {
      const stateVector = StateVector.create({
        [TestSites.Site1]: 1,
        [TestSites.Site5]: 5,
        [TestSites.Site6]: 3,
      });
      const stateVector2 = StateVector.create({
        [TestSites.Site1]: 1,
        [TestSites.Site5]: 2,
        [TestSites.Site6]: 1,
      });
      assert.ok(stateVector.isIndependentOf(stateVector2, TestSites.Site1));
    });

    test('State vector should tell false if operations are  not independent  on populated states', () => {
      const stateVector = StateVector.create({
        [TestSites.Site1]: 1,
        [TestSites.Site5]: 5,
        [TestSites.Site6]: 3,
      });
      const stateVector2 = StateVector.create({
        [TestSites.Site2]: 2,
        [TestSites.Site5]: 5,
        [TestSites.Site6]: 3,
      });
      assert.ok(!stateVector.isIndependentOf(stateVector2, TestSites.Site1));
    });

    test('State vector depends on other operation if it knows about all the operations of other vector', () => {
      const stateVector = StateVector.create({
        [TestSites.Site1]: 2,
        [TestSites.Site5]: 6,
        [TestSites.Site6]: 3,
      });

      const stateVector2 = StateVector.create({
        [TestSites.Site1]: 1,
        [TestSites.Site5]: 5,
        [TestSites.Site6]: 3,
      });

      assert.ok(stateVector.isDependentOn(stateVector2));
    });

    test('State vector does not depends on other operation if it there are opeations in other SV that origial SV does not know', () => {
      const stateVector = StateVector.create({
        [TestSites.Site1]: 2,
        [TestSites.Site5]: 6,
        [TestSites.Site6]: 3,
      });

      const stateVector2 = StateVector.create({
        [TestSites.Site1]: 1,
        [TestSites.Site2]: 1,
        [TestSites.Site5]: 5,
        [TestSites.Site6]: 3,
      });

      assert.ok(!stateVector.isDependentOn(stateVector2));
    });

    test('State vector does not depends on other operation if it there are opeations in other SV that origial SV does not know', () => {
      const stateVector = StateVector.create({
        [TestSites.Site1]: 2,
        [TestSites.Site5]: 6,
        [TestSites.Site6]: 3,
      });

      const stateVector2 = StateVector.create({
        [TestSites.Site1]: 1,
        [TestSites.Site2]: 1,
        [TestSites.Site5]: 5,
        [TestSites.Site6]: 8,
      });

      assert.ok(!stateVector.isDependentOn(stateVector2));
    });
  });

});
