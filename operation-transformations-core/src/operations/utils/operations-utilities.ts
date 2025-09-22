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


const savedRelativeAddressing = new Map();


export function saveRa(resultingOperation: Operation, transformOperation: Operation) {
  savedRelativeAddressing.set(resultingOperation, transformOperation);
}

//
export function getRa(resultingOperation: Operation) {
  return savedRelativeAddressing.get(resultingOperation);
}


export function recoverRa(operation: Operation, baseOperation, resultingOperation: Operation) {
  return savedRelativeAddressing.get(resultingOperation);
}
//
// export function recoverLi(transformOperation: Operation, resultingOperation: Operation) {
//   return savedOps.get(resultingOperation, transformOperation);
// }

export function isDevMode(): boolean {
  return false;
}


export function reportError(error: string) {
  console.error(error);
}
