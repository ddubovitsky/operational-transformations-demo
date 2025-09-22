import { describe, it } from 'node:test';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import assert from 'node:assert';
import { JointDeleteOperation } from '../../../src/operations/joint-delete.operation.ts';

describe('Exclude delete from delete', (t) => {

  it('Exclude delete to the right', () => {
    const operation = new DeleteOperation(2, 2);
    const target = new DeleteOperation(0, 2);
    const includedTarget = target.include(operation);
    const excludedTarget = includedTarget.exclude(operation);
    assert.deepEqual(excludedTarget, new DeleteOperation(0, 2));
  });

  it('Exclude delete to the left', () => {
    const operation = new DeleteOperation(0, 2);
    const target = new DeleteOperation(2, 2);
    const includedTarget = target.include(operation);
    console.log(includedTarget);
    const excludedTarget = includedTarget.exclude(operation);
    assert.deepEqual(excludedTarget, new DeleteOperation(2, 2));
  });

  it('Exclude delete overlaps in the middle', () => {
    const operation = new DeleteOperation(1, 3);
    const target = new DeleteOperation(0, 2);
    assert.deepEqual(target.exclude(operation), new JointDeleteOperation(
      new DeleteOperation(0, 1),
      new DeleteOperation(4, 1)
    ));
  });

  it('Exclude delete overlaps to the left', () => {
    const operation = new DeleteOperation(4, 2);
    const target = new DeleteOperation(2, 3);
    const includedTarget = target.include(operation);
    const excludedTarget = includedTarget.exclude(operation);
    assert.deepEqual(excludedTarget, target);
  });

  it('Exclude delete overlaps in the center', () => {
    const operation = new DeleteOperation(1, 5);
    const target = new DeleteOperation(2, 3);
    const includedTarget = target.include(operation);
    const excludedTarget = includedTarget.exclude(operation);
    assert.deepEqual(excludedTarget, target);
  });

  it('Exclude delete overlaps in the center inverted', () => {
    const operation = new DeleteOperation(2, 3);
    const target = new DeleteOperation(1, 5);
    const includedTarget = target.include(operation);
    const excludedTarget = includedTarget.exclude(operation);
    assert.deepEqual(excludedTarget, target);
  });
});
