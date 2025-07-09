import { Operation } from '../operation.ts';
import {
  getOperationStartEnd,
  intersectInsertOperations,
  IntersectionType,
  intersectOperations,
} from '../utils/operations-intersections.util.ts';
import { DeleteOperation } from './delete.operation.ts';
import { saveLi } from '../utils/operations-utilities.ts';

export class InsertOperation {

  private insertString: string;
  private position: number;

  constructor(position: number, insertString: string) {
    this.insertString = insertString;
    this.position = position;
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

  include(operation: Operation) {
    let overlapType = intersectOperations(this, operation);

    if(operation instanceof InsertOperation){
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

        if(operation instanceof InsertOperation){
          console.log('overlap')
          return new InsertOperation(operation.getPosition(), operation.getInsertString());
        }

        throw 'Unexpected operation type';
        break;
    }
  }
}
