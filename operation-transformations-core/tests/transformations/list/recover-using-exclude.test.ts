import { describe, it } from 'node:test';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import { listExcludeOperations, listIncludeOperations } from '../../../src/operations/list-include.util.ts';
import assert from 'node:assert';
import { JointDeleteOperation } from '../../../src/operations/joint-delete.operation.ts';
import { logState, resetState } from '../../../src/operations/utils/operations-utilities.ts';

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
    assert.deepEqual(operation4Transformed.exclude(operation2), operation4);
    // assert.deepEqual(excludedResult, new DeleteOperation(3, 3));
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


describe('GOT manual control should correctly restore values', () => {
  it('should correctly handle consequentual deletes', () => {
    resetState();
    logState();
    //testing for this scenario:
    //S1:--2-------
    //S2:-x---4-5-6--
    const operations = {
      '2': new DeleteOperation(0, 7), //remove letila
      '4': new InsertOperation(7, 'porkhala '),
      '5': new DeleteOperation(0, 7),// remove letila
      '6': new InsertOperation(0, 'ochen '),
    } as const;
    const transformedOperation4 = operations['4'].include(operations['2']);
    assert.deepEqual(transformedOperation4, new InsertOperation(0, 'porkhala ')); // moved to 0 bc of 2

    const restoredOperation4 = transformedOperation4.exclude(operations['2']); // moved back to 7
    assert.deepEqual(restoredOperation4, new InsertOperation(7, 'porkhala '));

    const restoredOperation5 = operations['5'].exclude(restoredOperation4); // unchanged

    assert.deepEqual(restoredOperation5, new DeleteOperation(0, 7));

    let transformedOperation5 = restoredOperation5.include(operations['2']); //
    assert.deepEqual(transformedOperation5, new DeleteOperation(0, 0));

    transformedOperation5 = transformedOperation5.include(transformedOperation4);

    assert.deepEqual(transformedOperation5, new DeleteOperation(9, 0));

    let operation6Transformed = operations['6'];
    operation6Transformed = operation6Transformed.exclude(restoredOperation5);
    assert.deepEqual(operation6Transformed, new InsertOperation(7, 'ochen '));

    operation6Transformed = operation6Transformed.exclude(restoredOperation4);
    assert.deepEqual(operation6Transformed, new InsertOperation(7, 'ochen '));

    operation6Transformed = operation6Transformed.include(operations['2']);
    assert.deepEqual(operation6Transformed, new InsertOperation(0, 'ochen '));

    operation6Transformed = operation6Transformed.include(transformedOperation4);
    assert.deepEqual(operation6Transformed, new InsertOperation(0, 'ochen '));
  });
});
