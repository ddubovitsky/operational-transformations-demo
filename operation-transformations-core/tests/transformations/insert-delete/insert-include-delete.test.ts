import { describe, it } from 'node:test';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import assert from 'node:assert';
import { checkLi, recoverLi } from '../../../src/operations/utils/operations-utilities.ts';

describe('Include delete in insert', (t) => {

  it('Include delete to the right', () => {
    const operation = new DeleteOperation(3, 2);
    const target = new InsertOperation(3, '123');
    const transformed = target.include(operation);
    assert.deepEqual(transformed, new InsertOperation(3, '123'));
  });

  it('Include delete to the left', () => {
    const operation = new DeleteOperation(1, 2);
    const target = new InsertOperation(3, '123');
    const transformed = target.include(operation);
    assert.deepEqual(transformed, new InsertOperation(1, '123'));
  });

  it('Include delete overlaps to the right', () => {
    const operation = new DeleteOperation(1, 3);
    const target = new InsertOperation(3, '123');
    const transformed = target.include(operation);
    assert.deepEqual(transformed, new InsertOperation(1, '123'));
    assert.deepEqual(recoverLi(operation, transformed), target);
  });
});
