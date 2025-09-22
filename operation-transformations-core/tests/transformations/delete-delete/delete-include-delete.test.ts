import { describe, it } from 'node:test';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import assert from 'node:assert';


describe('Include delete in delete', (t) => {

  it('Include delete to the right', () => {
    const operation = new DeleteOperation(2, 2);
    const target = new DeleteOperation(0, 2);
    const transformed = target.include(operation);
    assert.deepEqual(transformed, new DeleteOperation(0 ,2));
  });

  it('Include delete to the left', () => {
    const operation = new DeleteOperation(0, 2);
    const target = new DeleteOperation(2, 2);
    const transformed = target.include(operation);
    assert.deepEqual(transformed, new DeleteOperation(0 ,2));
  });
  //1234[56]
  //126
  it('Include delete overlaps to the right', () => {
    const operation = new DeleteOperation(2, 3);
    const target = new DeleteOperation(0, 3);
    const transformed = target.include(operation);
    assert.deepEqual(transformed, new DeleteOperation(0 ,2));
  });

  it('Include delete overlaps to the left', () => {
    const operation = new DeleteOperation(0, 3);
    const target = new DeleteOperation(2, 3);
    const transformed = target.include(operation);
    assert.deepEqual(transformed, new DeleteOperation(0 ,2));
  });


  it('Include delete overlaps to the right', () => {
    const operation = new DeleteOperation(0, 6);
    const target = new DeleteOperation(2, 3);
    const transformed = target.include(operation);
    assert.deepEqual(transformed, new DeleteOperation(0 ,0));
  });


  it('Include delete overlaps to the right', () => {
    const operation = new DeleteOperation(3, 1);
    const target = new DeleteOperation(2, 3);
    const transformed = target.include(operation);
    assert.deepEqual(transformed, new DeleteOperation(2 ,2));
  });

});
