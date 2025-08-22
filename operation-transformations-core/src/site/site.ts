import { StateVector } from '../state-vector/state-vector.class.ts';
import { TimestampedOperation } from '../operations/timestamped-operation.ts';
import { Operation } from '../operations/operation.interface.ts';
import { PreconditionStrategy } from '../got-control/operation-ready-preconditions.class.ts';

const preconditionStrategy = new PreconditionStrategy();

class PendingOperations {
  private pendingSiteOperations = new Set<TimestampedOperation>();

  storeOperation(operation: TimestampedOperation) {
    this.pendingSiteOperations.add(operation);
  }

  removeOperation(operation: TimestampedOperation) {
    this.pendingSiteOperations.delete(operation);
  }

  getOperationsList(): TimestampedOperation[] | null {
    return Array
      .from(this.pendingSiteOperations)
      .sort((a, b) => a.compare(b));
  }
}

export class Site {
  constructor(private siteId: number) {
  }

  history: TimestampedOperation[] = [];

  stateVector = StateVector.create();

  private pendingSiteOperations = new PendingOperations();

  addLocalOperation(operation1: Operation) {
    const operation = operation1.timestamp(this.stateVector, this.siteId);
    this.history.push(operation);
    this.stateVector = this.stateVector.increment(this.siteId);

    return operation;
  }

  addRemoteOperation(addedOperation: TimestampedOperation) {
    if (!preconditionStrategy.canExecuteOperation(this.stateVector, addedOperation.vector, addedOperation.siteId)) {
      console.log('store operation', addedOperation.siteId);
      this.pendingSiteOperations.storeOperation(addedOperation);
      return;
    }

    this.history.push(addedOperation);

    this.stateVector = this.stateVector.setSiteCounter(
      addedOperation.siteId,
      addedOperation.vector.getSiteCounter(addedOperation.siteId) + 1, // next since this one is accounted already
    );

    this.executePendingOperations();
  }

  private executePendingOperations() {
    const pendingOperations = this.pendingSiteOperations.getOperationsList();
    pendingOperations.forEach((operation)=>{
      this.pendingSiteOperations.removeOperation(operation);
      this.addRemoteOperation(operation);
    })
  }
}
