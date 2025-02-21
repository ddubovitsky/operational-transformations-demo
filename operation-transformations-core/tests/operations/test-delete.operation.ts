import * as assert from 'assert';
import test from 'node:test';
import { DeleteOperation } from '../../src/operations/delete.operation.ts';

test('Test delete operation', (t) => {
  // This test passes because it does not throw an exception.
  const inputString = 'ABCD';
  const insertOperation = new DeleteOperation(2, 2);
  const resultOperation = insertOperation.execute(inputString);
  assert.deepEqual(resultOperation, 'AB');
});
