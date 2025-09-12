import { beforeEach, describe, it } from 'node:test';
import { InsertOperation } from '../../src/operations/insert.operation.ts';
import { Site } from '../../src/site/site.ts';
import { OperationTransformStrategy } from '../../src/got-control/operation-transform.strategy.ts';
import { TimestampedOperation } from '../../src/operations/timestamped-operation.ts';
import assert from 'node:assert';
import { OperationsPlayer } from '../player/operations-player.ts';

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
    private collectingOperationsParameter: { type: string; operation: TimestampedOperation }[],
  ) {
  }

  get operation() {
    return this.targetOperation.operation;
  }

  includeAll(operations: TimestampedOperation[]) {
    let operation: TimestampedOperation = this;
    operations.forEach((it) => {
      operation = operation.include(it);
    });
    return operation;
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


  excludeAll(operations: TimestampedOperation[]) {
    let operation: TimestampedOperation = this;
    operations.forEach((it) => {
      operation = operation.exclude(it);
    });
    return operation;
  }


  exclude(operation: TimestampedOperation): TimestampedOperation {
    this.collectingOperationsParameter.push({ type: 'exclude', operation: operation });
    return new TimestampedOperationObserveDecorator(this.targetOperation.exclude(operation), this.collectingOperationsParameter);
  }

  include(operation: TimestampedOperation): TimestampedOperation {
    this.collectingOperationsParameter.push({ type: 'include', operation: operation });
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

  const operations = {
    '1': new InsertOperation(1, 'let'),
    '2': new InsertOperation(1, 'ila'),
    '3': new InsertOperation(1, 'kor'),
    '4': new InsertOperation(1, 'ova'),
    '5': new InsertOperation(1, 'slo'),
    '6': new InsertOperation(1, 'vo'),
  };

  let operationTransformStrategy: OperationTransformStrategy = null;

  let sites: Record<string, Site>;

  let timestampedOperations: Record<string, TimestampedOperation>;

  beforeEach(() => {
    operationTransformStrategy = new OperationTransformStrategy();

    sites = {
      'S1': new Site(TestSites.Site1),
      'S2': new Site(TestSites.Site2),
    };

    timestampedOperations = {};
  });

  it('Should not perform any operations on site', () => {

    const operationEvents = [];

    const player = new OperationsPlayer();
    player.playOperations(
      `
      S1:--1--
      S2:-----
      `,
      (site, operationId) => {
        return sites[site].addLocalOperation(operations[operationId]);
      }, (site, operation) => {
        const fixtureOperation = new TimestampedOperationObserveDecorator(operation, operationEvents);
        operationTransformStrategy.transformOperation(sites[site], fixtureOperation);
      });

    assert.deepEqual(operationEvents, []);
  });

  it('should include parallel operations if such exists', () => {
    const operationEvents = [];

    // when 4 gets played on the S2, it needs to include 2 and 3
    new OperationsPlayer().playOperations(
      `
      S1:1-x-------4-
      S2:--x-2-3-o--
      `,
      (site, operationId) => {
        const timestamped = sites[site].addLocalOperation(operations[operationId]);
        timestampedOperations[operationId] = timestamped;
        return timestamped;
      }, (site, operation) => {
        if (operation === timestampedOperations['4']) {
          const fixtureOperation = new TimestampedOperationObserveDecorator(operation, operationEvents);
          operationTransformStrategy.transformOperation(sites[site], fixtureOperation);
          return;
        }
        sites[site].addRemoteOperation(operation);
      });

    assert.deepEqual(operationEvents, [{
      type: 'include',
      operation: timestampedOperations['2'],
    }, {
      type: 'include',
      operation: timestampedOperations['3'],
    }]);
  });


  it('If site has transformed operations, then should exclude them from target operation', () => {

    const operationEvents = [];

    // when 5 gets played on the S2, it needs first to take 4 that exists on the S2, exclude from 4 operations 2 and 3 to achieve original 4
    // then exclude original 4 from the 5 (so we can include 4 in it latel properly)
    // then include 2, 3, 4 in the 5 before performing 5
    new OperationsPlayer().playOperations(
      `
      S1:1-x-------4-5
      S2:--x-2-3-o----
      `,
      (site, operationId) => {
        const timestamped = sites[site].addLocalOperation(operations[operationId]);
        timestampedOperations[operationId] = timestamped;
        return timestamped;
      }, (site, operation) => {
        if (operation === timestampedOperations['5']) {
          const fixtureOperation = new TimestampedOperationObserveDecorator(operation, operationEvents);
          operationTransformStrategy.transformOperation(sites[site], fixtureOperation);
          return;
        }
        sites[site].addRemoteOperation(operation);
      });

    const expected = [
      {
        type: 'exclude',
        operation: timestampedOperations['4'],
      },
      {
        type: 'include',
        operation: timestampedOperations['2'],
      }, {
        type: 'include',
        operation: timestampedOperations['3'],
      }, {
        type: 'include',
        operation: timestampedOperations['4'],
      },
    ];

    assert.deepEqual(operationEvents, expected);
  });
});
