import { describe, it } from 'node:test';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import { listExcludeOperations, listIncludeOperations } from '../../../src/operations/list-include.util.ts';
import assert from 'node:assert';
import { JointDeleteOperation } from '../../../src/operations/joint-delete.operation.ts';
import { logState, resetState } from '../../../src/operations/utils/operations-utilities.ts';
import { Site } from '../../../src/site/site.ts';

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
    const site1 = new Site(1);
    const site2 = new Site(2);

    const operation = new DeleteOperation(3, 3);
    const transformedOperation = site1.addLocalOperation(operation)
    const operations = [
      site2.addLocalOperation(new InsertOperation(2, 'CDE')),
    ];

    const includedResult = listIncludeOperations(transformedOperation, operations);

    const excludedResult = listExcludeOperations(includedResult, operations.reverse());
    assert.deepEqual(excludedResult.operation, new DeleteOperation(3, 3));
  });
});


describe('weird case', () => {
  it('correctly work 2', () => {
    const site1 = new Site(1);
    const site2 = new Site(2);

    const operation4 =  site1.addLocalOperation(new InsertOperation(10, 'porkhala '));
    const operation2 =  site2.addLocalOperation(new DeleteOperation(0, 7));

    const operation4Transformed = operation4.include(operation2);

    assert.deepEqual(operation4Transformed.exclude(operation2).operation, operation4.operation);
  });
});


describe('delete full overlap should be restored correctly case', () => {
  it('correctly work', () => {
    const transform = new DeleteOperation(0, 7);
    const target = new DeleteOperation(0, 7);
    const included = target.include(transform);
    assert.deepEqual(included, new DeleteOperation(0, 0));
    assert.deepEqual(included.exclude(transform), new DeleteOperation(0, 7));
    // assert.deepEqual(excludedResult, new DeleteOperation(3, 3));
  });
});



