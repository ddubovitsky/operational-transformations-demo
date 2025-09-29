import { StateVector } from '../utils/state-vector/state-vector.class.ts';
import { TimestampedOperation } from '../operations/timestamped-operation.ts';
import { Operation } from '../operations/operation.interface.ts';
import { OperationsBufferedFilter } from './operations-buffered-filter.ts';
import { OperationsList } from './operations-list.ts';
import { OperationTransformStrategy } from '../got-control/operation-transform.strategy.ts';
import { InsertOperation } from '../operations/insert.operation.ts';

export class Site {
  private operationsBufferedFilter =  new OperationsBufferedFilter();

  constructor(public siteId: number) {
  }

  history = new OperationsList();

  stateVector = StateVector.create();
  transformStrategy = new OperationTransformStrategy();

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
        const log = operation.operation instanceof InsertOperation && operation.operation.getInsertString() === 'ochen ';

        const transformed = this.transformStrategy.transformOperation(this, operation);

        if(log){
          // console.log(operation.operation);
          // console.log(transformed.operation);
        }

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
    return this.stateVector;
  }

  public produceResult(): string{
    return this.history.getListCopy().reduce((acc, it)=> it.operation.execute(acc), '')
  }
}
