import { CanExecuteOperationStrategy } from '../got-control/operation-ready-preconditions.class.ts';
import { TimestampedOperation } from '../operations/timestamped-operation.ts';
import { StateVector } from '../utils/state-vector/state-vector.class.ts';


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


export class OperationsBufferedFilter {
  private strategy = new CanExecuteOperationStrategy();

  private pendingOperations = new PendingOperations();

  public onOperationStored: (op: TimestampedOperation, amount: number) => void;
  public onOperationRemoved: (op: TimestampedOperation, amount: number) => void;

  addAndExecutePending(
    operation: TimestampedOperation,
    currentStateVector: StateVector,
    executeOperation: (operation: TimestampedOperation) => StateVector,
  ) {
    if (!this.strategy.canExecuteOperation(currentStateVector, operation.vector, operation.siteId)) {
      this.onOperationStored?.(operation, this.pendingOperations.getOperationsList().length + 1);
      this.pendingOperations.storeOperation(operation);
      return;
    }

    let newStateVector = executeOperation(operation);

    for (const storedOperation of this.pendingOperations.getOperationsList()) {
      if (this.strategy.canExecuteOperation(newStateVector, storedOperation.vector, storedOperation.siteId)) {
        this.pendingOperations.removeOperation(storedOperation);
        this.onOperationRemoved?.(storedOperation, this.pendingOperations.getOperationsList().length);
        newStateVector = executeOperation(storedOperation);
      }
    }

  }
}
