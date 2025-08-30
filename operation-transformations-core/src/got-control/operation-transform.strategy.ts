import { Site } from '../site/site.ts';
import { TimestampedOperation } from '../operations/timestamped-operation.ts';

export class OperationTransformStrategy {
  transformOperation(site: Site, operation: TimestampedOperation) {
    console.log('start transform');
    if (site.stateVector.isContextuallyEqual(operation.vector)) {
      console.log('literally same')
      return operation;
    }
    const independentOperationIndex = site.history.findIndex((it) => it.vector.isIndependentOf(operation.vector, operation.siteId));
    console.log('independent op index', independentOperationIndex);
    const allAfterIndependentAreIndependent = site.history.slice(independentOperationIndex).every((it) => it.vector.isIndependentOf(operation.vector, operation.siteId));
    if(allAfterIndependentAreIndependent){
      console.log('include all');
      return operation.includeAll(site.history.slice(independentOperationIndex));
    }
  }
}
