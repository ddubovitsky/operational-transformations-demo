import { beforeEach, describe, it } from 'node:test';
import { InsertOperation } from '../../src/operations/insert.operation.ts';
import { Site } from '../../src/site/site.ts';
import { OperationTransformStrategy } from '../../src/got-control/operation-transform.strategy.ts';
import { TimestampedOperation } from '../../src/operations/timestamped-operation.ts';
import assert from 'node:assert';

enum TestSites {
  Site1 = 1,
  Site2 = 2,
  Site3 = 3,
  Site4 = 4,
  Site5 = 5,
  Site6 = 6,
}

const divergingOperation = new InsertOperation(1, 'Q');

class TimestampedOperationObserveDecorator implements TimestampedOperation {

  constructor(
    private targetOperation: TimestampedOperation,
    private collectingOperationsParameter: string[],
  ) {
  }

  get operation() {
    return this.targetOperation.operation;
  }

  get vector() {
    return this.targetOperation.vector;
  }

  get siteId() {
    return this.targetOperation.siteId;
  }

  compare(operation: TimestampedOperation): number {
    return 0;
  }

  exclude(operation: TimestampedOperation): TimestampedOperation {
    this.collectingOperationsParameter.push('exclude');
    return new TimestampedOperationObserveDecorator(this.targetOperation.exclude(operation), this.collectingOperationsParameter);
  }

  include(operation: TimestampedOperation): TimestampedOperation {
    this.collectingOperationsParameter.push('include');
    return new TimestampedOperationObserveDecorator(this.targetOperation.include(operation), this.collectingOperationsParameter);
  }

  clone(): TimestampedOperation {
    return new TimestampedOperationObserveDecorator(
      this.targetOperation,
      this.collectingOperationsParameter,
    );
  }
}

describe('OperationTransform strategy', (t) => {

  let operationTransformStrategy: OperationTransformStrategy = null;

  beforeEach(() => {
    operationTransformStrategy = new OperationTransformStrategy();
  });

  it('Should not perform any operations on site', () => {
    const originSite = new Site(TestSites.Site1);
    const targetSite = new Site(TestSites.Site2);

    const generatedOperation = originSite.addLocalOperation(new InsertOperation(1, 'abc'));
    const operationEvents = [];
    const fixtureOperation = new TimestampedOperationObserveDecorator(generatedOperation, operationEvents);

    operationTransformStrategy.transformOperation(targetSite, fixtureOperation);
    assert.deepEqual(operationEvents, []);
  });

  it('should include parallel operation if such exists', () => {
    const originSite = new Site(TestSites.Site1);
    const targetSite = new Site(TestSites.Site2);
    const targetSiteParallelOperation = targetSite.addLocalOperation(new InsertOperation(1, 'abc'));

    const generatedOperation = originSite.addLocalOperation(new InsertOperation(1, 'abc'));
    const operationEvents = [];
    const fixtureOperation = new TimestampedOperationObserveDecorator(generatedOperation, operationEvents);

    operationTransformStrategy.transformOperation(targetSite, fixtureOperation);
    assert.deepEqual(operationEvents, ['include']);
  });


  it('If site has transformed operations, then should exclude them from target operation', () => {
    const originSite = new Site(TestSites.Site1);
    const targetSite = new Site(TestSites.Site2);
    targetSite.addLocalOperation(new InsertOperation(1, 'abc'));

    const generatedOperation = originSite.addLocalOperation(new InsertOperation(1, 'abc'));
    targetSite.addRemoteOperation(operationTransformStrategy.transformOperation(targetSite, generatedOperation));

    const generatedOperation2 = originSite.addLocalOperation(new InsertOperation(1, 'abc'));
    const operationEvents = [];
    const fixtureOperation = new TimestampedOperationObserveDecorator(generatedOperation2, operationEvents);

    operationTransformStrategy.transformOperation(targetSite, fixtureOperation);
    assert.deepEqual(operationEvents, ['exclude', 'include', 'include']);
  });
});
