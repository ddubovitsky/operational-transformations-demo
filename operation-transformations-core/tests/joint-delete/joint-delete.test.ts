import { describe, it } from 'node:test';
import { DeleteOperation } from '../../src/operations/delete.operation.ts';
import { InsertOperation } from '../../src/operations/insert.operation.ts';
import assert from 'node:assert';
import { JointDeleteOperation } from '../../src/operations/joint-delete.operation.ts';

describe('Joint delete tests', () => {
  it('should recover to the initial operation before split from insert', () => {
    const initialDeleteOperation = new DeleteOperation(2, 2);
    const insertOperation = new InsertOperation(3, '123');
    const jointDeleteOperation = initialDeleteOperation.include(insertOperation);
    assert.deepEqual(jointDeleteOperation, new JointDeleteOperation(
      new DeleteOperation(2, 1),
      new DeleteOperation(6, 1),
    ));

    const excluded = jointDeleteOperation.exclude(insertOperation);

    assert.deepEqual(excluded, new DeleteOperation(2, 2));
  });

  it('should recover to the split, even if part of the split was removed', () => {
    const initialDeleteOperation = new DeleteOperation(2, 2);
    const insertOperation = new InsertOperation(3, '123');
    const jointDeleteOperation = initialDeleteOperation.include(insertOperation);
    assert.deepEqual(jointDeleteOperation, new JointDeleteOperation(
      new DeleteOperation(2, 1),
      new DeleteOperation(6, 1),
    ));

    const deleteHalfOfSplit = new DeleteOperation(1, 3);
    const halfJointSplit = jointDeleteOperation.include(deleteHalfOfSplit);

    assert.deepEqual(halfJointSplit, new DeleteOperation(3, 1));

    const restoredFullSplit = halfJointSplit.exclude(deleteHalfOfSplit);
    assert.deepEqual(restoredFullSplit, jointDeleteOperation)
  });
});
