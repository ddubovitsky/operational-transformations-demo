// import { Operation } from './operation.ts';
import { DeleteOperation } from './operations/delete.operation.ts';
import { InsertOperation } from './operations/insert.operation.ts';
import { JointDeleteOperation } from './operations/joint-delete.operation.ts';
type Operation = DeleteOperation | InsertOperation | JointDeleteOperation;
class DoubleMap {
  map = new Map();

  set(keyA: any, keyB: any, data: any) {
    const secondMap = this.map.get(keyA) ?? new Map();
    secondMap.set(keyB, data);
  }

  get(keyA: any, keyB: any) {
    const secondMap = this.map.get(keyA) ?? new Map();
    return secondMap.get(keyB);
  }

  has(keyA: any, keyB: any) {
    const secondMap = this.map.get(keyA) ?? new Map();
    return secondMap.has(keyB);
  }
}

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
