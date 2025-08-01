import { Operation } from '../operation.ts';
import {
  getOperationStartEnd,
  intersectDeleteInsertOperations,
  IntersectionType,
  intersectOperations,
} from '../utils/operations-intersections.util.ts';
import { checkLi, recoverLi, saveLi } from '../utils/operations-utilities.ts';
import { JointDeleteOperation } from './joint-delete.operation.ts';
import { InsertOperation } from './insert.operation.ts';

export class DeleteOperation {
  private amount: number;
  private positionStart: number;

  constructor(positionStart: number, amount: number) {
    this.amount = amount;
    this.positionStart = positionStart;
  }

  getAmount() {
    return this.amount;
  }

  getPositionStart() {
    return this.positionStart;
  }

  execute(input: string) {
    return input.substring(0, this.positionStart) + input.substring(this.positionStart + this.amount, input.length);
  }

  exclude(operation: Operation) {
    if (checkLi(operation, this)) {
      return recoverLi(operation, this);
    }
    const overlapType = intersectOperations(this, operation);

    const operationStartEnd = getOperationStartEnd(operation);

    switch (overlapType) {
      case IntersectionType.OnTheLeft:
        return new DeleteOperation(this.getPositionStart() - operationStartEnd.lengthDiff, this.getAmount());
      case IntersectionType.OnTheRight:
        return new DeleteOperation(this.getPositionStart(), this.getAmount());
      case IntersectionType.Overlap:
        throw 'Exclude overlap is not handled :(';
    }
  }

  include(operation: Operation) {
    let overlapType = intersectOperations(this, operation);
    if(operation instanceof InsertOperation){
      overlapType = intersectDeleteInsertOperations(this, operation);
    }

    const operationStartEnd = getOperationStartEnd(operation);

    switch (overlapType) {
      case IntersectionType.OnTheLeft:
        return new DeleteOperation(this.getPositionStart() + operationStartEnd.lengthDiff, this.getAmount());
      case IntersectionType.OnTheRight:
        return new DeleteOperation(this.getPositionStart(), this.getAmount());
      case IntersectionType.Overlap:


        if (operation instanceof DeleteOperation) {
          // if we are here it means that ranges overlap, in this case we need to substract operation range from target range
          // "ABCDEFG", target delete range "AB[CDE]FG", operation range "ABCD[EFG]"
          // OR target delete range "ABCD[EF]G", operation range "AB[CDE]FG", result should be AB[F]G
          const position = Math.min(operation.getPositionStart(), this.getPositionStart());
          const totalDeleteEnd = Math.max(operation.getAmount() + operation.getPositionStart(), this.getPositionStart() + this.getAmount());
          const totalRange = totalDeleteEnd - position;
          const amount = totalRange - operation.getAmount();
          const result = new DeleteOperation(position, amount);
          saveLi(this, operation, result);
          return result;
        }

        if (operation instanceof InsertOperation) {
          // if we are here it means that ranges overlap, in this case we need to substract operation range from target range
          // "ABCDEFG", target delete range "AB[CDE]FG", insert range "ABCD[aaa]EFG"
          // OR target delete range "AB[CDE]FG", operation range "ABC[aaa]DEFG", result should be AB[F]G
          const firstDeleteRange = new DeleteOperation(this.getPositionStart(), operation.getPosition() - this.getPositionStart());
          const secondDeleteRange = new DeleteOperation(operation.getPosition() + operation.getInsertString().length, this.getAmount() - firstDeleteRange.getAmount());

          return new JointDeleteOperation(
            firstDeleteRange,
            secondDeleteRange,
          );
        }

        throw 'unexpected operation';
    }
  }

  toString() {
    return this.constructor.name + `${this.positionStart} ${this.amount}`;
  }
}
