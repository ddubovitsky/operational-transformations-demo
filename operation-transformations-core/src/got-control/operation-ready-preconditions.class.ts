import { StateVector } from '../utils/state-vector/state-vector.class.ts';

export class CanExecuteOperationStrategy {
  canExecuteOperation(
    currentState: StateVector,
    operationStateVector: StateVector,
    siteId: number,
  ): boolean {
    const precondition1 = this.siteContextIsPrecedingOperationContext(
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

  private siteContextIsPrecedingOperationContext(
    currentState: StateVector,
    operationStateVector: StateVector,
    targetSiteId: number,
  ): boolean {
    return currentState.isPrecedingForSite(operationStateVector, targetSiteId);
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
