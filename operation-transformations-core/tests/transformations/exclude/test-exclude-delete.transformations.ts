import { describe, it } from 'node:test';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import { includeDeleteInDelete } from '../../../src/transformations/include/include-delete/include-delete.transformations.ts';
import assert from 'node:assert';
import { excludeDeleteFromDelete } from '../../../src/transformations/exlude/exclude-delete/exclude-delete.transformations.ts';

describe('Exclude delete from delete', (t) => {

  it('Exclude delete to the right', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(4, 2);
    const target = new DeleteOperation(0, 2);
    const includedTarget = includeDeleteInDelete(target, operation);
    const excludedTarget = excludeDeleteFromDelete(includedTarget, operation);

    assert.deepEqual(excludedTarget, target);
  });

  it('Exclude delete to the left', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(0, 2);
    const target = new DeleteOperation(4, 2);
    const includedTarget = includeDeleteInDelete(target, operation);
    const excludedTarget = excludeDeleteFromDelete(includedTarget, operation);
    assert.deepEqual(excludedTarget, target);
  });

  it('Exclude delete overlaps to the right', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(2, 3);
    const target = new DeleteOperation(4, 2);
    const includedTarget = includeDeleteInDelete(target, operation);
    const excludedTarget = excludeDeleteFromDelete(includedTarget, operation);
    assert.deepEqual(excludedTarget, target);
  });

  it('Exclude delete overlaps to the left', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(4, 2);
    const target = new DeleteOperation(2, 3);
    const includedTarget = includeDeleteInDelete(target, operation);
    const excludedTarget = excludeDeleteFromDelete(includedTarget, operation);
    assert.deepEqual(excludedTarget, target);
  });

  it('Exclude delete overlaps in the center', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(1, 5);
    const target = new DeleteOperation(2, 3);
    const includedTarget = includeDeleteInDelete(target, operation);
    const excludedTarget = excludeDeleteFromDelete(includedTarget, operation);
    assert.deepEqual(excludedTarget, target);
  });

  it('Exclude delete overlaps in the center inverted', () => {
    const initialString = 'ABCDEFG';
    const operation = new DeleteOperation(2, 3);
    const target = new DeleteOperation(1, 5);
    const includedTarget = includeDeleteInDelete(target, operation);
    const excludedTarget = excludeDeleteFromDelete(includedTarget, operation);
    assert.deepEqual(excludedTarget, target);
  });
});


describe('Exclude delete from insert', (t) => {

});
