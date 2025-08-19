import { StateVector } from '../state-vector/state-vector.class.ts';

export class PreconditionStrategy {
  canExecuteOperation(
    currentState: StateVector,
    operationStateVector: StateVector,
    siteId: number,
  ): boolean {
    const precondition1 = this.hasContextuallyPrecedingOperationForSite(
      currentState,
      operationStateVector,
      siteId,
    );

    const precondition2 = this.hasAllKnownOperationsForOtherSites(
      currentState,
      operationStateVector,
      siteId,
    );

    return precondition1 && precondition2;
  }

  private hasContextuallyPrecedingOperationForSite(
    currentState: StateVector,
    operationStateVector: StateVector,
    targetSiteId: number,
  ): boolean {
    return currentState.isContextuallyPreceding(operationStateVector, targetSiteId);
  }

  private hasAllKnownOperationsForOtherSites(
    currentState: StateVector,
    operationStateVector: StateVector,
    targetSiteId: number,
  ) {
    const operationKnownSites = operationStateVector.getSites();

    operationKnownSites.delete(targetSiteId);

    return Array.from(operationKnownSites).every((siteId) => {
      return currentState.hasAllKnownOperationsFor(operationStateVector, siteId);
    });
  }
}
