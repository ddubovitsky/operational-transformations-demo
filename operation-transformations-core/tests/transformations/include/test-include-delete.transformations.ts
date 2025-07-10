import { describe, it } from 'node:test';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import {
  includeDeleteInDelete,
  includeInsertInDelete,
} from '../../../src/transformations/include/include-delete/include-delete.transformations.ts';
import assert from 'node:assert';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';

describe('Include delete in delete', (t) => {

  it('Include delete to the right', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(4, 2);
    const target = new DeleteOperation(0, 2);
    const transformed = target.include(operation);
    assert.equal(transformed.execute(operation.execute(initialString)), 'CDG');
  });

  it('Include delete to the left', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(0, 2);
    const target = new DeleteOperation(4, 2);
    const transformed = target.include(operation);
    assert.equal(transformed.execute(operation.execute(initialString)), 'CDG');
  });

  it('Include delete overlaps to the right', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(2, 3);
    const target = new DeleteOperation(4, 2);
    const transformed = target.include(operation);
    assert.equal(transformed.execute(operation.execute(initialString)), 'ABG');
  });

  it('Include delete overlaps to the left', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(4, 2);
    const target = new DeleteOperation(2, 3);
    const transformed = target.include(operation);
    assert.equal(transformed.execute(operation.execute(initialString)), 'ABG');
  });

  it('Include delete overlaps in the center', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(1, 5);
    const target = new DeleteOperation(2, 3);
    const transformed = target.include(operation);
    assert.equal(transformed.execute(operation.execute(initialString)), 'AG');
  });

  it('Include delete overlaps in the center inverted', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(2, 3);
    const target = new DeleteOperation(1, 5);
    const transformed = target.include(operation);
    assert.equal(transformed.execute(operation.execute(initialString)), 'AG');
  });
});


describe('Include insert in delete', (t) => {

  it('Include insert to the right', () => {
    const initialString = 'ABCDEFG';
    const operation = new InsertOperation(4, '123');
    const target = new DeleteOperation(2, 2);
    const transformed = target.include(operation);
    assert.equal(transformed.execute(operation.execute(initialString)), 'AB123EFG');
  });

  it('Include insert to the left', () => {
    const initialString = 'ABCDEFG';
    const operation = new InsertOperation(2, '123');
    const target = new DeleteOperation(4, 2);
    const transformed = target.include(operation);
    assert.equal(transformed.execute(operation.execute(initialString)), 'AB123CDG');
  });

  it('Include insert overlaps to the right', () => {
    const initialString = 'ABCDEFG';
    const operation = new InsertOperation(3,'123' );
    const target = new DeleteOperation(1, 4);
    const transformed = target.include(operation);
    assert.equal(transformed.execute(operation.execute(initialString)), 'A123FG');
  });
  //
  it('Include insert overlaps to the left', () => {
    const initialString = 'ABCDEFG';
    const operation = new InsertOperation(1, '123');
    const target = new DeleteOperation(0, 3);
    const transformed = target.include(operation);
    assert.equal(transformed.execute(operation.execute(initialString)), '123DEFG');
  });
  //
  it('Include insert overlaps in the center', () => {
    const initialString = 'ABCDEFG';
    const operation = new InsertOperation(3, '123');
    const target = new DeleteOperation(2, 4);
    const transformed = target.include(operation);
    assert.equal(transformed.execute(operation.execute(initialString)), 'AB123G');
  });
});
