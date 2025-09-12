import { Site } from '../site/site.ts';
import { TimestampedOperation } from '../operations/timestamped-operation.ts';
import { OperationsList } from '../site/operations-list.ts';

export class OperationTransformStrategy {
  transformOperation(site: Site, operation: TimestampedOperation) {
    if (site.stateVector.isContextuallyEqual(operation.vector)) {
      return operation;
    }

    const independentOperationIndex = site.history.indexOfFirstIndependentOperation(operation.vector);
    if(independentOperationIndex === -1){
      // no independent operations in HB mean that we should not do any additional transformations
      return operation;
    }

    const operationsAfterFirstIndependent = site.history.slice(independentOperationIndex);
    const allAfterIndependentAreIndependent = operationsAfterFirstIndependent.allOperationsIndependentOf(operation.vector);

    if(allAfterIndependentAreIndependent){
      return operation.includeAll(operationsAfterFirstIndependent.getList());
    }

    return this.transformOperationIncludingDependantOperations(operation, operationsAfterFirstIndependent);
  }

  private transformOperationIncludingDependantOperations(
    operation: TimestampedOperation,
    mixedOperationsList: OperationsList,
  ){
    const listOfDependentOperations = mixedOperationsList.getDependent(operation);

    const operations = mixedOperationsList.getListCopy();
    const originalOperations: TimestampedOperation[] = [];

    while (listOfDependentOperations.length > 0){
      const operation = listOfDependentOperations.shift();
      const excludedOperation = operation.excludeAll(
        operations.slice(0, operations.indexOf(operation))
      );
      const includedOgOperation = excludedOperation.includeAll(originalOperations);
      originalOperations.push(includedOgOperation);
    }

    return operation.excludeAll(originalOperations).includeAll(mixedOperationsList.getList());
  }
}
