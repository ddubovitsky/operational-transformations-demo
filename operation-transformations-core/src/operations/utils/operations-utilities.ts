// import { Operation } from './operation.ts';
import { DoubleMap } from './double-map.class.ts';
import { Operation } from '../operation.interface.ts';


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
