import { Operation } from './operation.interface.ts';
import { StateVector } from '../state-vector/state-vector.class.ts';

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

  include(operation: TimestampedOperation) {
    return new TimestampedOperation(
      this.operation.include(operation.operation),
      this.vector,
      this.siteId,
    );
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
