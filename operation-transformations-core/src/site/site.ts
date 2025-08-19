import { StateVector } from '../state-vector/state-vector.class.ts';
import { TimestampedOperation } from '../operations/timestamped-operation.ts';
import { Operation } from '../operations/operation.interface.ts';
import { PreconditionStrategy } from '../got-control/operation-ready-preconditions.class.ts';

const preconditionStrategy = new PreconditionStrategy();

class PendingOperations {
  private pendingSiteOperationsMap: Record<number, Set<TimestampedOperation>> = {};

  storeOperation(operation: TimestampedOperation) {
    const pendingSet = this.pendingSiteOperationsMap[operation.siteId] ?? new Set();
    pendingSet.add(operation);
    this.pendingSiteOperationsMap[operation.siteId] = pendingSet;
  }

  removeOperation(operation: TimestampedOperation) {
    const pendingSet = this.pendingSiteOperationsMap[operation.siteId] ?? new Set();
    pendingSet.delete(operation);
    this.pendingSiteOperationsMap[operation.siteId] = pendingSet;
  }

  popSiteOperation(siteId: number): TimestampedOperation | null {
    const pendingSet = this.pendingSiteOperationsMap[siteId] ?? new Set();

    if (!pendingSet.size) {
      return null;
    }

    const newestOperation = Array.from(pendingSet).sort((a, b) => a.compare(b))[0];
    this.removeOperation(newestOperation);
    return newestOperation;
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
      this.pendingSiteOperations.storeOperation(addedOperation);
      return;
    }

    this.history.push(addedOperation);

    this.stateVector = this.stateVector.setSiteCounter(
      addedOperation.siteId,
      addedOperation.vector.getSiteCounter(addedOperation.siteId),
    );

    this.executePendingOperations(addedOperation.siteId);
  }

  private executePendingOperations(siteId: number) {
    const operation = this.pendingSiteOperations.popSiteOperation(siteId);
    if (operation) {
      this.addRemoteOperation(operation);
    }
  }
}
