import * as assert from 'assert';
import test from 'node:test';
import { InsertOperation } from '../../src/operations/insert.operation.ts';

test('Test insert operation', (t) => {
  // This test passes because it does not throw an exception.
  const inputString = 'ABCD';
  const insertOperation = new InsertOperation(1, '12');
  const resultOperation = insertOperation.execute(inputString);
  assert.deepEqual(resultOperation, 'A12BCD');
});
