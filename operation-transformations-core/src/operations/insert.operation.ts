import {
  getOperationStartEnd, intersectDeleteInsertOperations,
  intersectInsertOperations,
  IntersectionType,
  intersectOperations,
} from './utils/operations-intersections.util.ts';
import { DeleteOperation } from './delete.operation.ts';
import { checkLi, recoverLi, saveLi } from './utils/operations-utilities.ts';
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
    if (operation instanceof InsertOperation) {
      return this.includeInsertInsert(operation, originalSiteId, operationSiteId);
    }

    if (operation instanceof DeleteOperation) {
      return this.includeInsertDelete(operation);
    }
  }

  exclude(operation: Operation, originalSiteId?: number, operationSiteId?: number) {

    if (operation instanceof InsertOperation) {
      return this.excludeInsertInsert(operation, originalSiteId, operationSiteId);
    }

    if (operation instanceof DeleteOperation) {
      return this.excludeInsertDelete(operation);
    }
  }

  private moveRightBy(amount: number) {
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

    if (originalSiteId < operationSiteId) {
      return this.moveRightBy(0);
    } else {
      return this.moveRightBy(operationStartEnd.lengthDiff);
    }
  }

  private excludeInsertInsert(operation: InsertOperation, originalSiteId?: number, operationSiteId?: number) {
    const operationStartEnd = getOperationStartEnd(operation);
    const overlapType = intersectInsertOperations(this, operation);

    if (overlapType === IntersectionType.OnTheLeft) {
      return this.moveRightBy(-operationStartEnd.lengthDiff);
    }

    if (overlapType === IntersectionType.OnTheRight) {
      return this.moveRightBy(0);
    }

    if (originalSiteId < operationSiteId) {
      return this.moveRightBy(0);
    } else {
      return this.moveRightBy(-operationStartEnd.lengthDiff);
    }
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

    let overlapType = intersectDeleteInsertOperations(operation, this);

    const operationStartEnd = getOperationStartEnd(operation);

    if (overlapType === IntersectionType.OnTheLeft) {
      return this.moveRightBy(-operationStartEnd.lengthDiff);
    }

    if (overlapType === IntersectionType.OnTheRight) {
      return this.moveRightBy(0);
    }

    throw 'Insert Exclude overlap is not handled :(';
  }

  toString() {
    return this.constructor.name + `${this.position} ${this.insertString}`;
  }
}
