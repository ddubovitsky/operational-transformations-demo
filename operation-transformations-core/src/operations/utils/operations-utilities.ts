// import { Operation } from './operation.ts';
import { DoubleMap } from './double-map.class.ts';
import { Operation } from '../operation.interface.ts';
import { StateVector } from '../../utils/state-vector/state-vector.class.ts';


let savedOps = new DoubleMap();

export function saveLi(originalOperation: Operation, transformOperation: StateVector, resultingOperation: StateVector) {
  console.log('save li');
  savedOps.set(resultingOperation, transformOperation, originalOperation);
}

export function checkLi(transformOperation: StateVector, resultingOperation: StateVector) {
  return savedOps.has(resultingOperation, transformOperation);
}

export function recoverLi(transformOperation: StateVector, resultingOperation: StateVector) {
  console.log('recover li');
  return savedOps.get(resultingOperation, transformOperation);
}


let savedRelativeAddressing = new Map();


export function saveRa(resultingSv: StateVector, transformSv: StateVector) {
  savedRelativeAddressing.set(resultingSv, transformSv);
}

//
export function getRa(resultingSv: StateVector):StateVector {
  return savedRelativeAddressing.get(resultingSv);
}


export function recoverRa(operation: Operation, baseOperation, resultingOperation: Operation) {
  return savedRelativeAddressing.get(resultingOperation);
}


let savedIRelativeAddressing = new Map();

export function saveIRa(resultingOperation: StateVector, originalOperation: Operation) {
  console.log('save ira');
  savedIRelativeAddressing.set(resultingOperation, originalOperation);
}


export function getIra(resultingOperation: StateVector) {
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
