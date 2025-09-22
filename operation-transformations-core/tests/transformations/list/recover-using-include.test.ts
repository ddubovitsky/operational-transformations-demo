import { describe, it } from 'node:test';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import { listExcludeOperations, listIncludeOperations } from '../../../src/operations/list-include.util.ts';
import assert from 'node:assert';

describe('should recover using exclude', () => {
  it('should correctly restore using ', () => {
    const operation = new InsertOperation(3, '123');

    const operations = [
      new InsertOperation(2, 'JKL'),
    ];

    const result = listExcludeOperations(operation, operations);

    assert.deepEqual(result, new InsertOperation(1, '123'));
  });

  it('should correctly restore using ', () => {
    const operation = new InsertOperation(3, '123');

    const operations = [
      new InsertOperation(2, 'JKL'),
    ];

    const excludedOperations = listExcludeOperations(operation, operations);
    const includedOperations = listIncludeOperations(excludedOperations, operations);

    assert.deepEqual(includedOperations, new InsertOperation(3, '123'));
  });
});
