import {
  getOperationStartEnd,
  intersectDeleteInsertOperations,
  intersectInsertOperations,
  IntersectionType,
  intersectOperations,
} from './utils/operations-intersections.util.ts';
import { DeleteOperation } from './delete.operation.ts';
import { saveLi } from './utils/operations-utilities.ts';
import { Operation } from './operation.interface.ts';
import { StateVector } from '../state-vector/state-vector.class.ts';
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

  exclude(operation: Operation) {
    let overlapType = intersectOperations(this, operation);

    if (operation instanceof DeleteOperation) {
      overlapType = intersectDeleteInsertOperations(operation, this);
    }
    const operationStartEnd = getOperationStartEnd(operation);

    switch (overlapType) {
      case IntersectionType.OnTheLeft:
        return new InsertOperation(this.position - operationStartEnd.lengthDiff, this.getInsertString());
      case IntersectionType.OnTheRight:
        return new InsertOperation(this.position, this.getInsertString());
      case IntersectionType.Overlap:
        throw 'Insert Exclude overlap is not handled :(';
    }
  }

  include(operation: Operation) {
    let overlapType = intersectOperations(this, operation);

    if (operation instanceof InsertOperation) {
      overlapType = intersectInsertOperations(this, operation);
    }

    const operationStartEnd = getOperationStartEnd(operation);

    switch (overlapType) {
      case IntersectionType.OnTheLeft:
        return new InsertOperation(this.getPosition() + operationStartEnd.lengthDiff, this.getInsertString());
      case IntersectionType.OnTheRight:
        return new InsertOperation(this.getPosition(), this.getInsertString());
      case IntersectionType.Overlap:
        if (operation instanceof InsertOperation) {
          return new InsertOperation(this.getPosition(), this.getInsertString());
        }

        if (operation instanceof DeleteOperation) {
          // we are now inserting in the middle of the string that was deleted;
          const position = Math.min(operation.getPositionStart(), this.getPosition());
          const result = new InsertOperation(position, this.getInsertString());
          saveLi(this, operation, result);
          return result;
        }

        if (operation instanceof InsertOperation) {
          return new InsertOperation(operation.getPosition(), operation.getInsertString());
        }

        throw 'Unexpected operation type';
        break;
    }
  }

  toString() {
    return this.constructor.name + `${this.position} ${this.insertString}`;
  }
}
