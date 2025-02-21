import * as assert from 'assert';
import test from 'node:test';
import { DeleteOperation } from '../../src/operations/delete.operation.ts';
import { JointDeleteOperation } from '../../src/operations/joint-delete.operation.ts';

test('Test joint delete operation', (t) => {
  const inputString = 'ABCDEFG';
  const deleteOperation1 = new DeleteOperation(0, 2);
  const deleteOperation2 = new DeleteOperation(4, 2);

  const jointDeleteOperation = new JointDeleteOperation(deleteOperation1, deleteOperation2);
  const resultOperation = jointDeleteOperation.execute(inputString);
  assert.deepEqual(resultOperation, 'CDG');
});
