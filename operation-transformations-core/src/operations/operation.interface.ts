import { StateVector } from '../utils/state-vector/state-vector.class.ts';
import { TimestampedOperation } from './timestamped-operation.ts';

export interface Operation {
  include(operation: Operation, originalSiteId?: number, operationSiteId?: number): Operation;

  exclude(operation: Operation): Operation;

  timestamp(vector: StateVector, siteId: number): TimestampedOperation;

  clone(): Operation;

  execute(string: string): string;
}

