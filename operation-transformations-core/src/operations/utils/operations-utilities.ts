// import { Operation } from './operation.ts';
import { DoubleMap } from './double-map.class.ts';
import { Operation } from '../operation.interface.ts';


let savedOps = new DoubleMap();

export function saveLi(originalOperation: Operation, transformOperation: Operation, resultingOperation: Operation) {
  savedOps.set(resultingOperation, transformOperation, originalOperation);
}

export function checkLi(transformOperation: Operation, resultingOperation: Operation) {
  return savedOps.has(resultingOperation, transformOperation);
}

export function recoverLi(transformOperation: Operation, resultingOperation: Operation) {
  return savedOps.get(resultingOperation, transformOperation);
}


let savedRelativeAddressing = new Map();


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


let savedIRelativeAddressing = new Map();

export function saveIRa(resultingOperation: Operation, originalOperation: Operation) {
  savedIRelativeAddressing.set(resultingOperation, originalOperation);
}


export function getIra(resultingOperation: Operation) {
  return savedIRelativeAddressing.get(resultingOperation);
}
//
// export function recoverLi(transformOperation: Operation, resultingOperation: Operation) {
//   return savedOps.get(resultingOperation, transformOperation);
// }

export function isDevMode(): boolean {
  return true;
}


export function reportError(error: string) {
  console.error(error);
}

export function resetState(){
  savedOps = new DoubleMap();
  savedRelativeAddressing = new Map();
}

export function logState(){
  console.log(savedOps.map);
  // console.dir(savedRelativeAddressing);
}
