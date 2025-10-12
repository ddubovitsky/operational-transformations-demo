import { TimestampedOperation } from './timestamped-operation.ts';

export function listIncludeOperations(operation: TimestampedOperation, operations: TimestampedOperation[]) {
  return operations.reduce((acc, it) => {
    return acc.include(it);
  }, operation);
}


export function listExcludeOperations(operation: TimestampedOperation, operations: TimestampedOperation[]) {
  return operations.reduce((acc, it) => {
    return acc.exclude(it);
  }, operation);
}
