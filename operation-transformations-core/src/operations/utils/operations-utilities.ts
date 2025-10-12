// import { Operation } from './operation.ts';
import { DoubleMap } from './double-map.class.ts';
import { Operation } from '../operation.interface.ts';
import { StateVector } from '../../utils/state-vector/state-vector.class.ts';

const sitesState = {
  state: new Map(),
  getSiteState(siteId: number) {
    if (this.state.has(siteId)) {
      return this.state.get(siteId);
    }

    const siteState = {
      savedOps: new DoubleMap(),
      savedRelativeAddressing: new Map(),
      savedIRelativeAddressing: new Map(),
      savedIRelativeAddressing2: new Map(),

    };
    this.state.set(siteId, siteState);
    return siteState;
  },
  clear() {
    this.state = new Map();
  },
};

export function saveLi(siteId: number, originalOperation: Operation, transformOperation: StateVector, resultingOperation: StateVector) {
  console.log('save li', siteId, transformOperation, resultingOperation);
  return sitesState.getSiteState(siteId).savedOps.set(resultingOperation, transformOperation, originalOperation);
}

export function checkLi(siteId: number, transformOperation: StateVector, resultingOperation: StateVector) {
  return sitesState.getSiteState(siteId).savedOps.has(resultingOperation, transformOperation);
}

export function recoverLi(siteId: number, transformOperation: StateVector, resultingOperation: StateVector) {
  console.log('recover li', siteId, transformOperation, resultingOperation);
  return sitesState.getSiteState(siteId).savedOps.get(resultingOperation, transformOperation);
}

export function saveRa(siteId: number, resultingSv: StateVector, transformSv: StateVector) {
  console.log('saveRa', siteId);
  return sitesState.getSiteState(siteId).savedRelativeAddressing.set(resultingSv, transformSv);
}

//
export function getRa(siteId: number, resultingSv: StateVector): StateVector {
  console.log('getRa', sitesState.getSiteState(siteId).savedRelativeAddressing.get(resultingSv));
  return sitesState.getSiteState(siteId).savedRelativeAddressing.get(resultingSv);
}


export function saveIRa(siteId: number, resultingOperation: StateVector, originalOperation: Operation) {
  console.log(' saveIRa', siteId);
  return sitesState.getSiteState(siteId).savedIRelativeAddressing.set(resultingOperation, originalOperation);
}


export function getIra(siteId: number, resultingOperation: StateVector) {
  console.log('get ira', sitesState.getSiteState(siteId).savedIRelativeAddressing.get(resultingOperation));
  return sitesState.getSiteState(siteId).savedIRelativeAddressing.get(resultingOperation);
}


export function saveIRa2(siteId: number, resultingOperation: StateVector, originalOperation: Operation) {
  return sitesState.getSiteState(siteId).savedIRelativeAddressing2.set(resultingOperation, originalOperation);
}


export function getIra2(siteId: number, resultingOperation: StateVector) {
  return sitesState.getSiteState(siteId).savedIRelativeAddressing2.get(resultingOperation);
}

export function isDevMode(): boolean {
  return true;
}


export function reportError(error: string) {
  console.error(error);
}

export function resetState() {
  sitesState.clear();
}

export function logState() {
  console.log(sitesState.state);
}
