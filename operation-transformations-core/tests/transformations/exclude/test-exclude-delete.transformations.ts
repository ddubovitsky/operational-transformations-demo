import { describe, it } from 'node:test';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import {
  includeDeleteInDelete,
  includeInsertInDelete,
} from '../../../src/transformations/include/include-delete/include-delete.transformations.ts';
import assert from 'node:assert';
import {
  excludeDeleteFromDelete,
  excludeInsertFromDelete,
} from '../../../src/transformations/exlude/exclude-delete/exclude-delete.transformations.ts';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';

describe('Exclude delete from delete', (t) => {

  it('Exclude delete to the right', () => {
    const operation = new DeleteOperation(4, 2);
    const target = new DeleteOperation(0, 2);
    const includedTarget = includeDeleteInDelete(target, operation);
    const excludedTarget = excludeDeleteFromDelete(includedTarget, operation);

    assert.deepEqual(excludedTarget, target);
  });

  it('Exclude delete to the left', () => {
    const operation = new DeleteOperation(0, 2);
    const target = new DeleteOperation(4, 2);
    const includedTarget = includeDeleteInDelete(target, operation);
    const excludedTarget = excludeDeleteFromDelete(includedTarget, operation);
    assert.deepEqual(excludedTarget, target);
  });

  it('Exclude delete overlaps to the right', () => {
    const operation = new DeleteOperation(2, 3);
    const target = new DeleteOperation(4, 2);
    const includedTarget = includeDeleteInDelete(target, operation);
    const excludedTarget = excludeDeleteFromDelete(includedTarget, operation);
    assert.deepEqual(excludedTarget, target);
  });

  it('Exclude delete overlaps to the left', () => {
    const operation = new DeleteOperation(4, 2);
    const target = new DeleteOperation(2, 3);
    const includedTarget = includeDeleteInDelete(target, operation);
    const excludedTarget = excludeDeleteFromDelete(includedTarget, operation);
    assert.deepEqual(excludedTarget, target);
  });

  it('Exclude delete overlaps in the center', () => {
    const operation = new DeleteOperation(1, 5);
    const target = new DeleteOperation(2, 3);
    const includedTarget = includeDeleteInDelete(target, operation);
    const excludedTarget = excludeDeleteFromDelete(includedTarget, operation);
    assert.deepEqual(excludedTarget, target);
  });

  it('Exclude delete overlaps in the center inverted', () => {
    const operation = new DeleteOperation(2, 3);
    const target = new DeleteOperation(1, 5);
    const includedTarget = includeDeleteInDelete(target, operation);
    const excludedTarget = excludeDeleteFromDelete(includedTarget, operation);
    assert.deepEqual(excludedTarget, target);
  });
});


describe('Exclude insert from delete', (t) => {
  it('Exclude insert to the right', () => {
    const operation = new InsertOperation(4, '123');
    const target = new DeleteOperation(2, 2);
    const includedTarget = includeInsertInDelete(target, operation);
    const excludedTarget = excludeInsertFromDelete(includedTarget, operation);
    assert.deepEqual(target, excludedTarget);
  });

  it('Exclude insert to the left', () => {
    const operation = new InsertOperation(2, '123');
    const target = new DeleteOperation(4, 2);
    const includedTarget = includeInsertInDelete(target, operation);
    const excludedTarget = excludeInsertFromDelete(includedTarget, operation);
    assert.deepEqual(target, excludedTarget);
  });

  it('Exclude insert overlaps to the right', () => {
    const operation = new InsertOperation(3, '123');
    const target = new DeleteOperation(1, 4);
    const includedTarget = includeInsertInDelete(target, operation);
    const excludedTarget = excludeInsertFromDelete(includedTarget, operation);
    assert.deepEqual(target, excludedTarget);
  });

  it('Exclude insert overlaps to the left', () => {
    const operation = new InsertOperation(1, '123');
    const target = new DeleteOperation(0, 3);
    const includedTarget = includeInsertInDelete(target, operation);
    const excludedTarget = excludeInsertFromDelete(includedTarget, operation);
    assert.deepEqual(target, excludedTarget);
  });

  it('Exclude insert overlaps in the center', () => {
    const operation = new InsertOperation(3, '123');
    const target = new DeleteOperation(2, 4);
    const includedTarget = includeInsertInDelete(target, operation);
    const excludedTarget = excludeInsertFromDelete(includedTarget, operation);
    assert.deepEqual(target, excludedTarget);
  });
});
