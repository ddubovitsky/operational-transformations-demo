import { describe, it } from 'node:test';
import { InsertOperation } from '../../../src/operations/insert.operation.ts';
import assert from 'node:assert';
import { getRa } from '../../../src/operations/utils/operations-utilities.ts';
import { Site } from '../../../src/site/site.ts';


describe('Exclude insert from insert', (t) => {
  it('Exclude insert to the right', () => {
    const operation = new InsertOperation(4, 'jkl');
    const target = new InsertOperation(3, '123');
    const included = target.include(operation);

    assert.deepEqual(included.exclude(operation), target);
  });

  it('Exclude insert to the left', () => {
    const operation = new InsertOperation(2, 'jkl');
    const target = new InsertOperation(3, '123');
    const included = target.include(operation);
    assert.deepEqual(included.exclude(operation), target);
  });

  it('Exclude insert overlaps in the insertion point', () => {
    const operation = new InsertOperation(3, 'jkl');
    const target = new InsertOperation(3, '123');
    const included = target.include(operation, 1, 2);
    assert.deepEqual(included.exclude(operation), target);
  });

  it('Exclude insert overlaps in the insertion point 2', () => {
    const operation = new InsertOperation(3, 'jkl');
    const target = new InsertOperation(3, '123');
    const included = target.include(operation, 2, 1);
    assert.deepEqual(included.exclude(operation), target);
  });

  it('Exclude insert where insert is inside exclusion range', () => {
    const site1 = new Site(1);
    const site2 = new Site(2);
    const operation = new InsertOperation(3, 'jkl');
    const target = new InsertOperation(4, '123');

    const timestampedOperation = site2.addLocalOperation(operation);
    const timestampedTarget = site1.addLocalOperation(target);

    const transformed = timestampedTarget.exclude(timestampedOperation);

    assert.deepEqual(transformed.operation, new InsertOperation(1, '123'));
    assert.deepEqual(getRa(site1.siteId, transformed.vector), timestampedOperation.vector);
  });
});
