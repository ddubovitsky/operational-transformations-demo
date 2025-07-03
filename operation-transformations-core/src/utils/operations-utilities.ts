// import { Operation } from './operation.ts';
import { DeleteOperation } from '../operations/delete.operation.ts';
import { InsertOperation } from '../operations/insert.operation.ts';
import { JointDeleteOperation } from '../operations/joint-delete.operation.ts';
import { DoubleMap } from './double-map.class.ts';
type Operation = DeleteOperation | InsertOperation | JointDeleteOperation;

const savedOps = new DoubleMap();

export function saveLi(originalOperation: Operation, transformOperation: Operation, resultingOperation: Operation) {
  savedOps.set(resultingOperation, transformOperation, originalOperation);
}

export function checkLi(transformOperation: Operation, resultingOperation: Operation) {
  return savedOps.has(resultingOperation, transformOperation);
}

export function recoverLi(transformOperation: Operation, resultingOperation: Operation) {
  return savedOps.get(resultingOperation, transformOperation);
}
