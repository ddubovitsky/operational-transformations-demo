import { describe, it } from 'node:test';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import assert from 'node:assert';

describe('Include insert in insert', (t) => {

  it('Include insert to the right', () => {
    const operation = new InsertOperation(4, 'jkl');
    const target = new InsertOperation(3, '123');
    const transformed = target.include(operation);
    assert.deepEqual(transformed, new InsertOperation(3, '123'), 'should not change');
  });

  it('Include insert to the left', () => {
    const operation = new InsertOperation(2, 'jkl');
    const target = new InsertOperation(3, '123');
    const transformed = target.include(operation);
    assert.deepEqual(transformed, new InsertOperation(6, '123'), 'should move 3 points');
  });

  it('Include insert overlaps in the insertion point', () => {
    const operation = new InsertOperation(3, 'jkl');
    const target = new InsertOperation(3, '123');
    const transformed = target.include(operation, 1, 2);
    assert.deepEqual(transformed, new InsertOperation(3, '123'), );
  });

  // it('Include insert overlaps in the insertion point 2', () => {
  //   const operation = new InsertOperation(3, 'jkl');
  //   const target = new InsertOperation(3, '123');
  //   const transformed = target.include(operation, 2, 1);
  //   assert.deepEqual(transformed, new InsertOperation(6, '123'), );
  // });
});
