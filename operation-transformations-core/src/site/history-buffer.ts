import { TimestampedOperation } from '../operations/timestamped-operation.ts';
import { StateVector } from '../utils/state-vector/state-vector.class.ts';

export class HistoryBuffer {
  private history: TimestampedOperation[] = [];

  add(operation: TimestampedOperation) {
    this.history.push(operation);
  }

  hasParallelOperationsToVector(stateVector: StateVector, originSiteId: number) {
    return this.history.some((it)=> it.vector.isIndependentOf(stateVector, originSiteId))
  }
}
