import { describe, it } from 'node:test';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import { listExcludeOperations, listIncludeOperations } from '../../../src/operations/list-include.util.ts';
import assert from 'node:assert';
import { JointDeleteOperation } from '../../../src/operations/joint-delete.operation.ts';

describe('Test recoverability of joint delete include delete', () => {
  describe('simple list include 1', () => {
    const operation = new DeleteOperation(2, 2);

    const operations = [
      new InsertOperation(3, '123'),
    ];

    const result = listIncludeOperations(operation, operations);

    assert.deepEqual(result, new JointDeleteOperation(
      new DeleteOperation(2, 1),
      new DeleteOperation(6, 1),
    ));
  });

  describe('simple list include 2', () => {
    const operation = new DeleteOperation(2, 2);

    const operations = [
      new InsertOperation(3, '123'),
      new DeleteOperation(1, 3),
    ];

    const result = listIncludeOperations(operation, operations);

    assert.deepEqual(result, new DeleteOperation(3, 1));
  });

  describe('simple list exclude 1', () => {
    const operation = new DeleteOperation(2, 2);

    const operations = [
      new InsertOperation(3, '123'),
    ];

    const includedResult = listIncludeOperations(operation, operations);

    const excludedResult = listExcludeOperations(includedResult, operations.reverse());
    assert.deepEqual(excludedResult, operation);
  });

  describe('simple list exclude 2', () => {
    const operation = new DeleteOperation(2, 2);

    const operations = [
      new InsertOperation(3, '123'),
      new DeleteOperation(1, 3),
    ];

    const includedResult = listIncludeOperations(operation, operations);

    const excludedResult = listExcludeOperations(includedResult, operations.reverse());
    assert.deepEqual(excludedResult, new DeleteOperation(2, 2));
  });
});


describe('Test recoverability of overlapping delete include delete', () => {
  describe('simple list include 1 delete', () => {
    const operation = new DeleteOperation(2, 2);

    const operations = [
      new DeleteOperation(0, 3),
    ];

    const result = listIncludeOperations(operation, operations);

    assert.deepEqual(result, new DeleteOperation(0, 1));
  });

  describe('simple list overlap exclude 1', () => {
    const operation = new DeleteOperation(2, 2);

    const operations = [
      new DeleteOperation(0, 3),
    ];

    const includedResult = listIncludeOperations(operation, operations);

    const excludedResult = listExcludeOperations(includedResult, operations.reverse());
    assert.deepEqual(excludedResult, new DeleteOperation(2, 2));
  });
});


describe('Test recoverability of insert + delete', () => {
  describe('simple list include 1 delete', () => {
    const operation = new InsertOperation(2, '123');

    const operations = [
      new DeleteOperation(0, 3),
    ];

    const result = listIncludeOperations(operation, operations);

    assert.deepEqual(result, new InsertOperation(0, '123'));
  });

  describe('simple list overlap exclude 2', () => {
    const operation = new InsertOperation(2, '123');

    const operations = [
      new DeleteOperation(0, 3),
    ];

    const includedResult = listIncludeOperations(operation, operations);

    const excludedResult = listExcludeOperations(includedResult, operations.reverse());
    assert.deepEqual(excludedResult, new InsertOperation(2, '123'));
  });
});

describe('ET DI recoverability using exclude then include', () => {
  it('should recover', () => {
    const operation = new DeleteOperation(3, 3);

    const operations = [
      new InsertOperation(2, 'CDE'),
    ];

    const includedResult = listIncludeOperations(operation, operations);

    const excludedResult = listExcludeOperations(includedResult, operations.reverse());
    assert.deepEqual(excludedResult, new DeleteOperation(3, 3));
  });
});



describe('weird case', () => {
  it('correctly work', () => {
    const operation4 = new InsertOperation(10, 'porkhala ');
    const operation2 = new DeleteOperation(0, 7);

    const operation4Transformed = operation4.include(operation2);
    assert.deepEqual(operation4Transformed.exclude(operation2), operation4)
    // assert.deepEqual(excludedResult, new DeleteOperation(3, 3));
  });
});
