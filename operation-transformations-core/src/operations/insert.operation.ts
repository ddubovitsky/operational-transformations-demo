import {
  getOperationStartEnd,
  intersectDeleteInsertOperations, intersectDeleteInsertOperations2,
  intersectInsertOperations,
  IntersectionType,
  intersectOperations,
} from './utils/operations-intersections.util.ts';
import { DeleteOperation } from './delete.operation.ts';
import { checkLi, getRa, isDevMode, recoverLi, reportError, saveLi, saveRa } from './utils/operations-utilities.ts';
import { Operation } from './operation.interface.ts';
import { StateVector } from '../utils/state-vector/state-vector.class.ts';
import { TimestampedOperation } from './timestamped-operation.ts';

export class InsertOperation implements Operation {

  private readonly insertString: string;
  private readonly position: number;

  constructor(position: number, insertString: string) {
    this.insertString = insertString;
    this.position = position;
  }

  timestamp(vector: StateVector, siteId: number): TimestampedOperation {
    return new TimestampedOperation(
      this, vector,
      siteId,
    );
  }

  clone(): Operation {
    return new InsertOperation(this.position, this.insertString);
  }

  getInsertString() {
    return this.insertString;
  }

  getPosition() {
    return this.position;
  }

  execute(input: string): string {
    if (input.length < this.position) {
      throw 'Unexpected position';
    }

    return input.substring(0, this.position) + this.insertString + input.substring(this.position, input.length);
  }


  include(operation: Operation, originalSiteId?: number, operationSiteId?: number) {
    if (getRa(this) === operation) {
      return this.moveRightBy(getOperationStartEnd(operation).start);
    }

    if (operation instanceof InsertOperation) {
      return this.includeInsertInsert(operation, originalSiteId, operationSiteId);
    }

    if (operation instanceof DeleteOperation) {
      return this.includeInsertDelete(operation);
    }
  }

  exclude(operation: Operation) {
    if (operation instanceof InsertOperation) {
      return this.excludeInsertInsert(operation);
    }

    if (operation instanceof DeleteOperation) {
      return this.excludeInsertDelete(operation);
    }

    throw 'Unexpected Exclude';
  }

  private moveRightBy(amount: number) {
    // console.log(this, 'moved by', amount);
    return new InsertOperation(this.position + amount, this.insertString);
  }

  private includeInsertInsert(operation: InsertOperation, originalSiteId?: number, operationSiteId?: number) {
    const operationStartEnd = getOperationStartEnd(operation);
    const overlapType = intersectInsertOperations(this, operation);

    if (overlapType === IntersectionType.OnTheLeft) {
      return this.moveRightBy(operationStartEnd.lengthDiff);
    }

    if (overlapType === IntersectionType.OnTheRight) {
      return this.moveRightBy(0);
    }
    //
    // if (originalSiteId < operationSiteId) {
    //   return
    // } else {
    //   return this.moveRightBy(operationStartEnd.lengthDiff);
    // }

    return this.moveRightBy(0);
  }

  private excludeInsertInsert(operation: InsertOperation) {
    const operationStartEnd = getOperationStartEnd(operation);

    if (this.position <= operation.position) {
      return this.moveRightBy(0);
    }

    if (operation.position <= this.position && operationStartEnd.end <= this.position) {
      return this.moveRightBy(-operationStartEnd.lengthDiff);
    }

    const result = new InsertOperation(this.position - operation.position, this.insertString);
    saveRa(result, operation);
    return result;
  }


  private includeInsertDelete(operation: DeleteOperation) {
    let overlapType = intersectOperations(this, operation);
    const operationStartEnd = getOperationStartEnd(operation);

    if (overlapType === IntersectionType.OnTheLeft) {
      return this.moveRightBy(operationStartEnd.lengthDiff);
    }

    if (overlapType === IntersectionType.OnTheRight) {
      return this.moveRightBy(0);
    }

    const position = Math.min(operation.getPositionStart(), this.getPosition());
    const result = new InsertOperation(position, this.getInsertString());
    saveLi(this, operation, result);
    return result;
  }

  private excludeInsertDelete(operation: DeleteOperation) {
    if (checkLi(operation, this)) {
      return recoverLi(operation, this);
    }

    let overlapType = intersectDeleteInsertOperations2(this, operation);

    const operationStartEnd = getOperationStartEnd(operation);

    if (overlapType === IntersectionType.OnTheLeft) {
      return this.moveRightBy(-operationStartEnd.lengthDiff);
    }

    if (overlapType === IntersectionType.OnTheRight) {
      return this.moveRightBy(0);
    }

    if (isDevMode()) {
      throw 'Insert Exclude overlap is not handled :(';
    }

    reportError('Insert exclude overlap is not handled properly');
    return this.moveRightBy(0);
  }

  toString() {
    return this.constructor.name + `${this.position} ${this.insertString}`;
  }
}
