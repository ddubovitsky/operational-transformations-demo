import { StateVector } from '../state-vector/state-vector.class.ts';
import { TimestampedOperation } from './timestamped-operation.ts';

export interface Operation {
  include(operation: Operation): Operation;

  exclude(operation: Operation): Operation;

  timestamp(vector: StateVector, siteId: number): TimestampedOperation
}

