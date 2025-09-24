import { describe, it } from 'node:test';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import assert from 'node:assert';

describe('Exclude delete from insert', (t) => {

  it('Exclude delete to the right', () => {
    const operation = new DeleteOperation(3, 2);
    const target = new InsertOperation(3, '123');
    const includedTarget = target.include(operation);
    const excludedTarget = includedTarget.exclude(operation);
    assert.deepEqual(excludedTarget, target);
  });

  it('Exclude delete to the left', () => {
    const operation = new DeleteOperation(1, 2);
    const target = new InsertOperation(3, '123');
    const includedTarget = target.include(operation);
    const excludedTarget = includedTarget.exclude(operation);
    assert.deepEqual(excludedTarget, target);
  });

  it('Exclude delete just at the start', () => {
    const operation = new DeleteOperation(0, 7);
    const target = new InsertOperation(0, 'porkhala');
    assert.deepEqual(target.exclude(operation), new InsertOperation(7, 'porkhala'));
  });

  it('Exclude delete just at the start 2', () => {
    const operation = new DeleteOperation(0, 7);
    const target = new InsertOperation(0, 'ochen ')
    assert.deepEqual(target.exclude(operation), new InsertOperation(7, 'ochen '));
  });


  it('Exclude delete overlaps', () => {
    const operation = new DeleteOperation(2, 3);
    const target = new InsertOperation(4, "test");
    const includedTarget = target.include(operation);
    const excludedTarget = includedTarget.exclude(operation);
    assert.deepEqual(excludedTarget, target);
  });
});

