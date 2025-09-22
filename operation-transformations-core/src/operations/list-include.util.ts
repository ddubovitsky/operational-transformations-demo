import { Operation } from './operation.interface.ts';

export function listIncludeOperations(operation: Operation, operations: Operation[]) {
  return operations.reduce((acc, it) => {
    return acc.include(it);
  }, operation);
}


export function listExcludeOperations(operation: Operation, operations: Operation[]) {
  return operations.reduce((acc, it) => {
    return acc.exclude(it);
  }, operation);
}
