import { Site } from '../site/site.ts';
import { TimestampedOperation } from '../operations/timestamped-operation.ts';
import { OperationsList } from '../site/operations-list.ts';

export class OperationTransformStrategy {
  transformOperation(site: Site, operation: TimestampedOperation) {
    console.log('start transform');
    if (site.stateVector.isContextuallyEqual(operation.vector)) {
      console.log('literally same')
      return operation;
    }
    console.log(site.history.getList().map((it)=> it.vector));
    console.log(operation.vector);
    const independentOperationIndex = site.history.indexOfFirstIndependentOperation(operation.vector);
    console.log('index of first independent operation', independentOperationIndex);
    if(independentOperationIndex === -1){
      console.log('no independent');
      // no independent operations in HB mean that we should not do any additional transformations
      return operation;
    }

    const operationsAfterFirstIndependent = site.history.slice(independentOperationIndex);
    const allAfterIndependentAreIndependent = operationsAfterFirstIndependent.allOperationsIndependentOf(operation.vector);

    console.log('allAfterIndependentAreIndependent', allAfterIndependentAreIndependent);

    if(allAfterIndependentAreIndependent){
      return operation.includeAll(operationsAfterFirstIndependent.getList());
    }

    console.log('transform');
    return this.transformOperationIncludingDependantOperations(operation, operationsAfterFirstIndependent);
  }

  private transformOperationIncludingDependantOperations(
    operation: TimestampedOperation,
    mixedOperationsList: OperationsList,
  ){
    const listOfDependentOperations = mixedOperationsList.getDependent(operation);
    console.log('dependent', listOfDependentOperations[0]);
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

    console.log('original operations', originalOperations[0]);
    console.log(mixedOperationsList.getList().map((it)=> it.operation))
    return operation.excludeAll(originalOperations).includeAll(mixedOperationsList.getList());
  }
}
