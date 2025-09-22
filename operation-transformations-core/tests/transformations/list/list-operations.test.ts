import { describe } from 'node:test';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import { listExcludeOperations, listIncludeOperations } from '../../../src/operations/list-include.util.ts';
import assert from 'node:assert';
import { JointDeleteOperation } from '../../../src/operations/joint-delete.operation.ts';

describe('list operations include', () => {
  describe('simple list include 1', () => {
    const operation = new DeleteOperation(2, 2);

    const operations = [
      new InsertOperation(3, '123'),
    ];

    const result = listIncludeOperations(operation, operations);

    assert.deepEqual(result, new JointDeleteOperation(
      new DeleteOperation(2, 1),
      new DeleteOperation(6, 1),
    ))
  });

  describe('simple list include 2', () => {
    const operation = new DeleteOperation(2, 2);

    const operations = [
      new InsertOperation(3, '123'),
      new DeleteOperation(1, 3),
    ];

    const result = listIncludeOperations(operation, operations);

    assert.deepEqual(result, new DeleteOperation(3, 1))
  });
});


describe('list operations exclude', () => {
  describe('simple list exclude 1', () => {
    const operation = new DeleteOperation(2, 2);

    const operations = [
      new InsertOperation(3, '123'),
    ];

    const includedResult = listIncludeOperations(operation, operations);

    const excludedResult = listExcludeOperations(includedResult, operations.reverse());
    assert.deepEqual(excludedResult, operation)
  });

  describe('simple list exclude 2', () => {
    const operation = new DeleteOperation(2, 2);

    const operations = [
      new InsertOperation(3, '123'),
      new DeleteOperation(1, 3),
    ];

    const includedResult = listIncludeOperations(operation, operations);

    const excludedResult = listExcludeOperations(includedResult, operations.reverse());
    assert.deepEqual(excludedResult, operation);
  });
});
