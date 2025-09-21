import { describe, it } from 'node:test';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import assert from 'node:assert';

describe('Include insert from delete', (t) => {
  it('Exclude insert to the right', () => {
    const operation = new InsertOperation(4, 'jkl');
    const target = new DeleteOperation(1, 2);
    const included = target.include(operation);
    assert.deepEqual(included.exclude(operation), target);
  });

  it('Exclude insert to the left', () => {
    const operation = new InsertOperation(2, 'jkl');
    const target = new DeleteOperation(2, 2);
    const included = target.include(operation);
    assert.deepEqual(included.exclude(operation), target);
  });

  it('Exclude insert overlaps in the insertion point and divided range', () => {
    const operation = new InsertOperation(3, 'jkl');
    const target = new DeleteOperation(1, 3);
    const included = target.include(operation);
    assert.deepEqual(included.exclude(operation), target);
  });

  it('Exclude insert that is already part of the deletion range', () => {
    const operation = new InsertOperation(3, 'jkl');
    const target = new DeleteOperation(2, 3);
    assert.deepEqual(target.exclude(operation), new DeleteOperation(1, 1));
  });

});
