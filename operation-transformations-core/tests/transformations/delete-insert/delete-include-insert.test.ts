import { describe, it } from 'node:test';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import assert from 'node:assert';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import { JointDeleteOperation } from '../../../src/operations/joint-delete.operation.ts';

describe('Include insert in delete', (t) => {
  it('Include insert to the right', () => {
    const operation = new InsertOperation(4, 'jkl');
    const target = new DeleteOperation(1, 2);
    const included = target.include(operation);
    assert.deepEqual(included, new DeleteOperation(1, 2));
  });

  it('Include insert to the left', () => {
    const operation = new InsertOperation(2, 'jkl');
    const target = new DeleteOperation(2, 2);
    const included = target.include(operation);
    assert.deepEqual(included, new DeleteOperation(5, 2));
  });

  it('Include insert overlaps in the insertion point', () => {
    const operation = new InsertOperation(3, 'jkl');
    const target = new DeleteOperation(1, 3);
    const included = target.include(operation);
    assert.deepEqual(included, new JointDeleteOperation(new DeleteOperation(1, 2), new DeleteOperation(6, 1)));
  });
});
