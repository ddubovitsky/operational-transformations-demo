import { Operation } from './operation.interface.ts';
import { StateVector } from '../utils/state-vector/state-vector.class.ts';

export class TimestampedOperation {
  constructor(
    public operation: Operation,
    public vector: StateVector,
    public siteId: number,
  ) {
  }

  compare(operation: TimestampedOperation): number {
    if (this.siteId !== operation.siteId) {
      throw 'Cross site operations are not comparable';
    }

    return this.vector.getSiteCounter(this.siteId) - operation.vector.getSiteCounter(operation.siteId);
  }

  includeAll(operations: TimestampedOperation[]){
    let operation: TimestampedOperation = this;
    operations.forEach((it)=> {
      operation = operation.include(it);
    });
    return operation;
  }

  include(operation: TimestampedOperation) {
    return new TimestampedOperation(
      this.operation.include(operation.operation),
      this.vector,
      this.siteId,
    );
  }

  excludeAll(operations: TimestampedOperation[]){
    let operation: TimestampedOperation = this;
    operations.forEach((it)=> {
      operation = operation.exclude(it);
    });
    return operation;
  }

  exclude(operation: TimestampedOperation) {
    return new TimestampedOperation(
      this.operation.include(operation.operation),
      this.vector,
      this.siteId,
    );
  }

  clone() {
    return new TimestampedOperation(
      this.operation.clone(),
      this.vector,
      this.siteId,
    );
  }
}
