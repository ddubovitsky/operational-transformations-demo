import { StateVector } from '../utils/state-vector/state-vector.class.ts';
import { TimestampedOperation } from './timestamped-operation.ts';

export interface Operation {
  include(operation: Operation, originalSiteId?: number, operationSiteId?: number, originalSv?: StateVector, operationSv?: StateVector): Operation;

  exclude(operation: Operation, originalSiteId?: number, originalSv?: StateVector, operationSv?: StateVector): Operation;

  timestamp(vector: StateVector, siteId: number): TimestampedOperation;

  clone(): Operation;

  execute(string: string): string;
}

