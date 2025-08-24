import { Site } from '../site/site.ts';
import { TimestampedOperation } from '../operations/timestamped-operation.ts';

export class OperationTransformStrategy {
  transformOperation(site: Site, operation: TimestampedOperation) {
    if(site.stateVector.isContextuallyEqual(operation.vector)){
      return operation;
    }
    return operation.include(site.history[0]);
  }
}
