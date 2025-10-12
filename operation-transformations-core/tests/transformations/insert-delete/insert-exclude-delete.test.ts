import { describe, it } from 'node:test';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import assert from 'node:assert';
import { Site } from '../../../src/site/site.ts';

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
    const site1 = new Site(1);
    const site2 = new Site(2);

    const operation = new DeleteOperation(0, 7);
    const target = new InsertOperation(0, 'porkhala');

    const timestampedOperation = site2.addLocalOperation(operation);
    const timestampedTarget = site1.addLocalOperation(target);

    const transformed = timestampedTarget.exclude(timestampedOperation);

    assert.deepEqual(transformed.operation, new InsertOperation(7, 'porkhala'));
  });

  it('Exclude delete just at the start 2', () => {
    const site1 = new Site(1);
    const site2 = new Site(2);

    const operation = new DeleteOperation(0, 7);
    const target = new InsertOperation(0, 'ochen ')

    const timestampedOperation = site2.addLocalOperation(operation);
    const timestampedTarget = site1.addLocalOperation(target);

    const transformed = timestampedTarget.exclude(timestampedOperation);

    assert.deepEqual(transformed.operation, new InsertOperation(7, 'ochen '));
  });

  it('Exclude delete just at the start 2 3', () => {
    const operation = new DeleteOperation(0, 7);
    const target = new InsertOperation(0, 'ochen ')
    const included = target.include(operation);
    assert.deepEqual(included, new InsertOperation(0, 'ochen '));
    const excluded = included.exclude(operation);
    assert.deepEqual(excluded, new InsertOperation(0, 'ochen '));
  });


  it('Exclude delete overlaps', () => {
    const operation = new DeleteOperation(2, 3);
    const target = new InsertOperation(4, "test");
    const includedTarget = target.include(operation);
    const excludedTarget = includedTarget.exclude(operation);
    assert.deepEqual(excludedTarget, target);
  });
});

