import { StateVector } from '../utils/state-vector/state-vector.class.ts';
import { TimestampedOperation } from '../operations/timestamped-operation.ts';
import { Operation } from '../operations/operation.interface.ts';
import { OperationsBufferedFilter } from './operations-buffered-filter.ts';
import { OperationsList } from './operations-list.ts';
import { OperationTransformStrategy } from '../got-control/operation-transform.strategy.ts';

export class Site {
  operationsBufferedFilter = new OperationsBufferedFilter();

  constructor(public siteId: number) {
  }

  history = new OperationsList();

  stateVector = StateVector.create();
  transformStrategy = new OperationTransformStrategy();

  onOperationExecuted: (operation: TimestampedOperation, result: string) => void;

  addLocalOperation(operation1: Operation): TimestampedOperation {
    this.stateVector = this.stateVector.increment(this.siteId);
    const operation = operation1.timestamp(this.stateVector, this.siteId);
    this.history.add(operation);

    return operation;
  }

  addRemoteOperation(addedOperation: TimestampedOperation) {
    this.operationsBufferedFilter.addAndExecutePending(
      addedOperation,
      this.stateVector,
      (operation) => {
        const transformed = this.transformStrategy.transformOperation(this, operation);

        return this.executeOperation(transformed);
      },
    );
  }

  private executeOperation(addedOperation: TimestampedOperation): StateVector {
    this.history.add(addedOperation);
    this.stateVector = this.stateVector.setSiteCounter(
      addedOperation.siteId,
      addedOperation.vector.getSiteCounter(addedOperation.siteId), // next since this one is accounted already
    );
    this.onOperationExecuted?.(addedOperation, this.produceResult());
    return this.stateVector;
  }

  public produceResult(): string {
    return this.history.getListCopy().reduce((acc, it) => it.operation.execute(acc), '');
  }
}
