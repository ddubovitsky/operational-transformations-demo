import * as assert from 'assert';
import test from 'node:test';
import { InsertOperation } from '../../src/operations/insert.operation.ts';

test('Insert operation', (t) => {
  // This test passes because it does not throw an exception.
  const inputString = 'ABCD';
  const insertOperation = new InsertOperation('12', 1);
  const resultOperation = insertOperation.execute(inputString);
  assert.deepEqual(resultOperation, 'A12BCD');
});
