import { describe, it } from 'node:test';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import { IncludeDeleteInDelete } from '../../../src/transformations/include/include-delete/include-delete.transformations.ts';
import assert from 'node:assert';

describe('Include delete in delete', (t) => {

  it('Include delete to the right', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(4, 2);
    const target = new DeleteOperation(0, 2);
    const transformed = IncludeDeleteInDelete(target, operation);
    assert.equal(transformed.execute(operation.execute(initialString)), "CDG");
  });

  it('Include delete to the left', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(0, 2);
    const target = new DeleteOperation(4, 2);
    const transformed = IncludeDeleteInDelete(target, operation);
    assert.equal(transformed.execute(operation.execute(initialString)), "CDG");
  });

  it('Include delete overlaps to the right', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(2, 3);
    const target = new DeleteOperation(4, 2);
    const transformed = IncludeDeleteInDelete(target, operation);
    assert.equal(transformed.execute(operation.execute(initialString)), "ABG");
  });

  it('Include delete overlaps to the left', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(4, 2);
    const target = new DeleteOperation(2, 3);
    const transformed = IncludeDeleteInDelete(target, operation);
    assert.equal(transformed.execute(operation.execute(initialString)), "ABG");
  });

  it('Include delete overlaps in the center', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(1, 5);
    const target = new DeleteOperation(2, 3);
    const transformed = IncludeDeleteInDelete(target, operation);
    assert.equal(transformed.execute(operation.execute(initialString)), "AG");
  });

  it('Include delete overlaps in the center inverted', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(2, 3);
    const target = new DeleteOperation(1, 5);
    const transformed = IncludeDeleteInDelete(target, operation);
    assert.equal(transformed.execute(operation.execute(initialString)), "AG");
  });
});
