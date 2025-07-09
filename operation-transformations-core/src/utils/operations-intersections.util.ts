import { Operation } from '../operation.ts';
import { InsertOperation } from '../operations/insert.operation.ts';
import { DeleteOperation } from '../operations/delete.operation.ts';
import { JointDeleteOperation } from '../operations/joint-delete.operation.ts';

export enum IntersectionType {
  OnTheLeft = 'OnTheLeft',
  OnTheRight = 'OnTheRight',
  Overlap = 'Overlap'
}

export function intersectOperations(operationA: Operation, operationB: Operation): IntersectionType {
  const operationARange = getOperationStartEnd(operationA);
  const operationBRange = getOperationStartEnd(operationB);

  if (operationARange.end <= operationBRange.start) {
    return IntersectionType.OnTheRight;
  }

  if (operationARange.start >= operationBRange.end) {
    return IntersectionType.OnTheLeft;
  }

  return IntersectionType.Overlap;
}

export function intersectInsertOperations(operationA: Operation, operationB: Operation): IntersectionType {
  const operationARange = getOperationStartEnd(operationA);
  const operationBRange = getOperationStartEnd(operationB);

  if (operationARange.start <= operationBRange.start) {
    return IntersectionType.OnTheRight;
  }

  if (operationARange.start >= operationBRange.start) {
    return IntersectionType.OnTheLeft;
  }

  return IntersectionType.Overlap;
}

export function getOperationStartEnd(operation: Operation): { start: number, end: number, lengthDiff: number } {
  if (operation instanceof InsertOperation) {
    return { start: operation.getPosition(), end: operation.getPosition() + operation.getInsertString().length, lengthDiff: operation.getInsertString().length };
  }

  if (operation instanceof DeleteOperation) {
    return { start: operation.getPositionStart(), end: operation.getPositionStart() + operation.getAmount(), lengthDiff: -operation.getAmount() };
  }

  if (operation instanceof JointDeleteOperation) {
    throw 'I have no idea what to do with joint delete operation';
  }

  throw 'Unexpected operation';
}
