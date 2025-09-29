import { Site } from '../site/site.ts';
import { TimestampedOperation } from '../operations/timestamped-operation.ts';
import { OperationsList } from '../site/operations-list.ts';
import { InsertOperation } from '../operations/insert.operation.ts';

let shouldLog = false;

export class OperationTransformStrategy {
  transformOperation(site: Site, operation: TimestampedOperation) {
    shouldLog = operation.operation instanceof InsertOperation && operation.operation.getInsertString() === 'ochen ';

    if (site.stateVector.isContextuallyEqual(operation.vector)) {
      return operation;
    }

    const independentOperationIndex = site.history.indexOfFirstIndependentOperation(operation.vector);
    if (independentOperationIndex === -1) {
      // no independent operations in HB mean that we should not do any additional transformations
      return operation;
    }

    const operationsAfterFirstIndependent = site.history.slice(independentOperationIndex);
    const allAfterIndependentAreIndependent = operationsAfterFirstIndependent.allOperationsIndependentOf(operation.vector);

    if (allAfterIndependentAreIndependent) {
      return operation.includeAll(operationsAfterFirstIndependent.getList());
    }


    const transformed = this.transformOperationIncludingDependantOperations(operation, operationsAfterFirstIndependent);
    console.log(transformed);
    return transformed;
  }

  private transformOperationIncludingDependantOperations(
    operation: TimestampedOperation,
    mixedOperationsList: OperationsList,
  ) {
    const listOfDependentOperations = mixedOperationsList.getDependent(operation);

    const originalIncludedOperations = this.restoreOriginalIncludedOperations(listOfDependentOperations, mixedOperationsList.getListCopy());

    return operation.excludeAll(originalIncludedOperations.reverse()).includeAll(mixedOperationsList.getList());
  }

  public restoreOriginalIncludedOperations(
    listOfDependentOperations: TimestampedOperation[],
    listOfOperations: TimestampedOperation[],
  ) {

    const originalOperations: TimestampedOperation[] = [];
    while (listOfDependentOperations.length > 0) {
      const dependentOperation = listOfDependentOperations.shift();
      const operationsPrecedingCurrent =
        listOfOperations.slice(0, listOfOperations.indexOf(dependentOperation))
          .reverse();
      const excludedOperation = dependentOperation.excludeAll(operationsPrecedingCurrent);
      const includedOgOperation = excludedOperation.includeAll(originalOperations);
      originalOperations.push(includedOgOperation);
    }
    return originalOperations;
  }
}
