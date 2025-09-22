import { describe, it } from 'node:test';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import assert from 'node:assert';
import { getRa } from '../../../src/operations/utils/operations-utilities.ts';
import { JointDeleteOperation } from '../../../src/operations/joint-delete.operation.ts';

// TODO:
// Secondly, in ET DI(Oa, Ob), when the deleting range of Oa covers some
// characters inserted by Ob and some characters outside the string inserted
// by Ob, the outcome will consist of two Delete operations: O a1 with a relative
// address for deleting these characters inserted by Ob, and O a2 with an
// absolute address for deleting the characters outside the string inserted by
// Ob. The relationship among O a1, O a2, and Ob is that Ob is the base
// operation of O a1, and Ob ⊔ O a2. The higher-level list transformation
// functions will handle th
describe('Exclude insert from delete', (t) => {
  it('Exclude insert to the right', () => {
    const operation = new InsertOperation(4, 'jkl');
    const target = new DeleteOperation(1, 2);
    const included = target.include(operation);
    assert.deepEqual(included.exclude(operation), target);
  });

  it('Exclude insert to the left', () => {
    const operation = new InsertOperation(2, 'jkl');
    const target = new DeleteOperation(2, 2);
    const included = target.include(operation);
    assert.deepEqual(included.exclude(operation), target);
  });

  it('Exclude insert overlaps in the insertion point and divided range', () => {
    const operation = new InsertOperation(3, 'jkl');
    const target = new DeleteOperation(1, 3);
    const included = target.include(operation);
    assert.deepEqual(included.exclude(operation), target);
  });

  it('Exclude insert that is already part of the deletion range overlaps on the right', () => {
    const operation = new InsertOperation(3, 'jkl');
    const target = new DeleteOperation(2, 3);
    assert.deepEqual(target.exclude(operation), new DeleteOperation(2, 1));
    assert.deepEqual(getRa(target.exclude(operation)), operation);
  });

  it('Exclude insert that is fully overlapped by the delete', () => {
    const operation = new InsertOperation(3, 'jkl');
    const target = new DeleteOperation(2, 5);
    assert.deepEqual(target.exclude(operation), new DeleteOperation(2, 2));
    assert.deepEqual(getRa(target.exclude(operation)), operation);
  });

  it('Exclude insert that is fully overlaps delete', () => {
    const operation = new InsertOperation(1, 'jkl');
    const target = new DeleteOperation(2, 1);
    assert.deepEqual(target.exclude(operation), new DeleteOperation(2, 0));
    assert.deepEqual(getRa(target.exclude(operation)), operation);
  });

});
