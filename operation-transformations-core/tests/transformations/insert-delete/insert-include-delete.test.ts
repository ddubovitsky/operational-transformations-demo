import { describe, it } from 'node:test';
import { DeleteOperation } from '../../../src/operations/delete.operation.ts';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import assert from 'node:assert';
import { checkLi, recoverLi } from '../../../src/operations/utils/operations-utilities.ts';
import { Site } from '../../../src/site/site.ts';

describe('Include delete in insert', (t) => {

  it('Include delete to the right', () => {
    const operation = new DeleteOperation(3, 2);
    const target = new InsertOperation(3, '123');
    const transformed = target.include(operation);
    assert.deepEqual(transformed, new InsertOperation(3, '123'));
  });

  it('Include delete to the left', () => {
    const operation = new DeleteOperation(1, 2);
    const target = new InsertOperation(3, '123');
    const transformed = target.include(operation);
    assert.deepEqual(transformed, new InsertOperation(1, '123'));
  });

  it('Include delete overlaps to the right', () => {
    const site1 = new Site(1);
    const site2 = new Site(2);

    const operation = new DeleteOperation(1, 3);
    const target = new InsertOperation(3, '123');

    const timestampedOperation = site2.addLocalOperation(operation);
    const timestampedTarget = site1.addLocalOperation(target);

    const transformed = timestampedTarget.include(timestampedOperation);

    assert.deepEqual(transformed.operation, new InsertOperation(1, '123'));
    assert.deepEqual(recoverLi(site1.siteId, timestampedOperation.vector, transformed.vector), timestampedTarget.operation);
  });
});
