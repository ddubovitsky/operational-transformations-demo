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
      const before = operation;
      operation = operation.include(it);
      console.log('include', before.operation.toString(),  it.operation.toString(), operation.operation.toString());
    });
    return operation;
  }

  include(operation: TimestampedOperation) {
    return new TimestampedOperation(
      this.operation.include(operation.operation, this.siteId, operation.siteId, this.vector, operation.vector),
      this.vector,
      this.siteId,
    );
  }

  excludeAll(operations: TimestampedOperation[]){
    let operation: TimestampedOperation = this;
    operations.forEach((it)=> {
      const before = operation;
      operation = operation.exclude(it);
      console.log('exclude', before.operation.toString(),  it.operation.toString(), operation.operation.toString());
    });
    return operation;
  }

  exclude(operation: TimestampedOperation) {
    return new TimestampedOperation(
      this.operation.exclude(operation.operation, this.vector, operation.vector),
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
