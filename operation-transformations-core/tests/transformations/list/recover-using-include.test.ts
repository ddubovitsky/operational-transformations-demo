import { describe, it } from 'node:test';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import { listExcludeOperations, listIncludeOperations } from '../../../src/operations/list-include.util.ts';
import assert from 'node:assert';
import { Site } from '../../../src/site/site.ts';

describe('should recover using exclude', () => {
  it('should correctly restore using ', () => {
    const operation = new InsertOperation(3, '123');

    const operations = [
      new InsertOperation(2, 'JKL'),
    ];

    const result = listExcludeOperations(operation, operations);

    assert.deepEqual(result, new InsertOperation(1, '123'));
  });

  it('should correctly restore using 2', () => {
    const site1 = new Site(1);
    const site2 = new Site(2);

    const target = site1.addLocalOperation(new InsertOperation(3, '123'));

    const timestampedOperation = site2.addLocalOperation(new InsertOperation(2, 'JKL'));

    const excludedOperation = target.exclude(timestampedOperation);
    const includedOperations = excludedOperation.include(timestampedOperation);

    assert.deepEqual(includedOperations.operation, new InsertOperation(3, '123'));
  });
});
