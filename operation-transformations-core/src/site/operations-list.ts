import { TimestampedOperation } from '../operations/timestamped-operation.ts';
import { StateVector } from '../utils/state-vector/state-vector.class.ts';

export class OperationsList {
  private readonly history: TimestampedOperation[] = [];

  constructor(operations: TimestampedOperation[] = []) {
    this.history = operations;
  }

  getList() {
    return this.history;
  }


  getListCopy() {
    return [...this.history];
  }

  add(operation: TimestampedOperation) {
    this.history.push(operation);
  }

  hasParallelOperationsToVector(stateVector: StateVector, originSiteId: number) {
    return this.history.some((it) => it.vector.isIndependentOf(stateVector, originSiteId));
  }

  indexOfFirstIndependentOperation(stateVector: StateVector, originSiteId: number) {
    return this.history.findIndex((it) => it.vector.isIndependentOf(stateVector, originSiteId));
  }

  allOperationsIndependentOf(stateVector: StateVector, originSiteId: number){
    return this.history.every((it) => it.vector.isIndependentOf(stateVector, originSiteId));
  }

  slice(indexStart: number, indexEnd?: number): OperationsList {
    return new OperationsList(
      this.history.slice(indexStart, indexEnd),
    );
  }

  // list of operations that operation depends on
  getDependent(operation: TimestampedOperation) {
    return this.history.filter((historyOperation)=> {
      return operation.vector.isDependentOn(historyOperation.vector)
    });
  }
}
