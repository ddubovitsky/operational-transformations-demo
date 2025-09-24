import { describe, it } from 'node:test';
import { logState, resetState } from '../../../src/operations/utils/operations-utilities.ts';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import assert from 'node:assert';

describe('various GOT manual control should correctly restore values', () => {
  // it('should correctly handle consequentual deletes', () => {
  //   resetState();
  //   logState();
  //   //testing for this scenario:
  //   //S1:--2-------
  //   //S2:-x---4-5-6--
  //   const operations = {
  //     '2': new DeleteOperation(0, 7), //remove letila
  //     '4': new InsertOperation(7, 'porkhala '),
  //     '5': new DeleteOperation(0, 7),// remove letila
  //     '6': new InsertOperation(0, 'ochen '),
  //   } as const;
  //   const transformedOperation4 = operations['4'].include(operations['2']);
  //   assert.deepEqual(transformedOperation4, new InsertOperation(0, 'porkhala ')); // moved to 0 bc of 2
  //
  //   const restoredOperation4 = transformedOperation4.exclude(operations['2']); // moved back to 7
  //   assert.deepEqual(restoredOperation4, new InsertOperation(7, 'porkhala '));
  //
  //   const restoredOperation5 = operations['5'].exclude(restoredOperation4); // unchanged
  //
  //   assert.deepEqual(restoredOperation5, new DeleteOperation(0, 7));
  //
  //   let transformedOperation5 = restoredOperation5.include(operations['2']); //
  //   assert.deepEqual(transformedOperation5, new DeleteOperation(0, 0));
  //
  //   transformedOperation5 = transformedOperation5.include(transformedOperation4);
  //
  //   assert.deepEqual(transformedOperation5, new DeleteOperation(9, 0));
  //
  //   let operation6Transformed = operations['6'];
  //   operation6Transformed = operation6Transformed.exclude(restoredOperation5);
  //   assert.deepEqual(operation6Transformed, new InsertOperation(7, 'ochen '));
  //
  //   operation6Transformed = operation6Transformed.exclude(restoredOperation4);
  //   assert.deepEqual(operation6Transformed, new InsertOperation(7, 'ochen '));
  //
  //   operation6Transformed = operation6Transformed.include(operations['2']);
  //   assert.deepEqual(operation6Transformed, new InsertOperation(0, 'ochen '));
  //
  //   operation6Transformed = operation6Transformed.include(transformedOperation4);
  //   assert.deepEqual(operation6Transformed, new InsertOperation(0, 'ochen '));
  // });

  it('should correctly handle consequentual deletes 2 yes', () => {
    resetState();
    logState();
    //testing for this scenario:
    //S1:--2-------
    //S2:-x--3-4-
    const operations = {
      '2': new DeleteOperation(0, 7), //remove letila
      '3': new InsertOperation(0, 'ne '),
      '4': new InsertOperation(7, 'porkhala '),
    } as const;

    const transformedOperation3 = operations['3'].include(operations['2']);
    assert.deepEqual(transformedOperation3, new InsertOperation(0, 'ne '));

    const restoredOperation3 = transformedOperation3.exclude(operations['2']);
    assert.deepEqual(restoredOperation3, new InsertOperation(0, 'ne '));

    let transformedOperation4 = operations['4'];

    transformedOperation4 = transformedOperation4.exclude(restoredOperation3)

    assert.deepEqual(transformedOperation4, new InsertOperation(4, 'porkhala '));

    transformedOperation4 = transformedOperation4.include(operations['2']) // here we got undefined range
    assert.deepEqual(transformedOperation4, new InsertOperation(0, 'porkhala '));
    //
    transformedOperation4 = transformedOperation4.include(transformedOperation3)
    assert.deepEqual(transformedOperation4, new InsertOperation(3, 'porkhala '));
  });
});
