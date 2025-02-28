import { describe, it } from 'node:test';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import assert from 'node:assert';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import {
  includeDeleteInInsert,
  includeInsertInInsert,
} from '../../../src/transformations/include/include-insert/include-insert.transformations.ts';

describe('Include delete in insert', (t) => {

  it('Include delete to the right', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(4, 2);
    const target = new InsertOperation(0, '123');
    const transformed = includeDeleteInInsert(target, operation);
    assert.equal(transformed.execute(operation.execute(initialString)), '123ABCDG');
  });

  it('Include delete to the left', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(0, 2);
    const target = new InsertOperation(4, '123');
    const transformed = includeDeleteInInsert(target, operation);
    assert.equal(transformed.execute(operation.execute(initialString)), 'CD123EFG');
  });

  it('Include delete overlaps to the right', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(2, 4);
    const target = new InsertOperation(3, '123');
    const transformed = includeDeleteInInsert(target, operation);
    assert.equal(transformed.execute(operation.execute(initialString)), 'AB123G');
  });
});


describe('Include insert in insert', (t) => {

  it('Include insert to the right', () => {
    const initialString = 'ABCDEFG';
    const operation = new InsertOperation(4, 'abc');
    const target = new InsertOperation(0, '123');
    const transformed = includeInsertInInsert(target, operation);
    assert.equal(transformed.execute(operation.execute(initialString)), '123ABCDabcEFG');
  });

  it('Include insert to the left', () => {
    const initialString = 'ABCDEFG';
    const operation = new InsertOperation(0, 'abc');
    const target = new InsertOperation(3, '123');
    const transformed = includeInsertInInsert(target, operation);
    assert.equal(transformed.execute(operation.execute(initialString)), 'abcABC123DEFG');
  });

  it('Include insert overlaps to the right', () => {
    const initialString = 'ABCDEFG';
    const operation = new InsertOperation(2, 'abc');
    const target = new InsertOperation(3, '123');
    const transformed = includeInsertInInsert(target, operation);
    assert.equal(transformed.execute(operation.execute(initialString)), 'ABabcC123DEFG');
  });

  it('Include insert overlaps to the left', () => {
    const initialString = 'ABCDEFG';
    const operation = new InsertOperation(3, 'abc');
    const target = new InsertOperation(2, '123');
    const transformed = includeInsertInInsert(target, operation);
    assert.equal(transformed.execute(operation.execute(initialString)), 'AB123CabcDEFG');
  });

  it('Include insert overlaps in the center', () => {
    const initialString = 'ABCDEFG';
    const operation = new InsertOperation(3, 'abc');
    const target = new InsertOperation(3, '123');
    const transformed = includeInsertInInsert(target, operation);
    assert.equal(transformed.execute(operation.execute(initialString)), 'ABC123abcDEFG');
  });
});
