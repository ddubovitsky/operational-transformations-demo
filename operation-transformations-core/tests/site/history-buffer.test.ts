import { describe, it } from 'node:test';
import { OperationsList } from '../../src/site/operations-list.ts';
import { TimestampedOperation } from '../../src/operations/timestamped-operation.ts';
import { StateVector } from '../../src/utils/state-vector/state-vector.class.ts';
import assert from 'node:assert';


enum TestSites {
  Site1 = 1,
  Site2 = 2,
  Site3 = 3,
  Site4 = 4,
  Site5 = 5,
  Site6 = 6,
}

describe('HistoryBuffer', (t) => {
  it('should return ture if independent operation exists', () => {
    const historyBuffer = new OperationsList();

    historyBuffer.add(
      new TimestampedOperation(
        null,
        StateVector.create({
          [TestSites.Site2]: 6,
        }),
        TestSites.Site1,
      ),
    );

    assert.ok(historyBuffer.hasParallelOperationsToVector(StateVector.create({
      [TestSites.Site1]: 1,
    }), TestSites.Site1));
  });

  it('should return false if independent operation does not exist', () => {
    const historyBuffer = new OperationsList();

    historyBuffer.add(
      new TimestampedOperation(
        null,
        StateVector.create({
          [TestSites.Site1]: 1,
        }),
        TestSites.Site1,
      ),
    );


    assert.ok(!historyBuffer.hasParallelOperationsToVector(StateVector.create({
      [TestSites.Site1]: 2,
    }), TestSites.Site1));

  });
});
