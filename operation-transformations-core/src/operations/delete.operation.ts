import {
  getOperationStartEnd, intersectDeleteExcludeDeleteOperation,
  intersectDeleteInsertOperations,
  IntersectionType,
  intersectOperations,
} from './utils/operations-intersections.util.ts';
import { checkLi, recoverLi, saveLi, saveRa } from './utils/operations-utilities.ts';
import { JointDeleteOperation } from './joint-delete.operation.ts';
import { InsertOperation } from './insert.operation.ts';
import { Operation } from './operation.interface.ts';
import { StateVector } from '../utils/state-vector/state-vector.class.ts';
import { TimestampedOperation } from './timestamped-operation.ts';

export class DeleteOperation implements Operation {
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


  private moveRightBy(amount: number) {
    return new DeleteOperation(this.positionStart + amount, this.amount);
  }

  execute(input: string) {
    return input.substring(0, this.positionStart) + input.substring(this.positionStart + this.amount, input.length);
  }

  private newAmount(newAmount: number) {
    return new DeleteOperation(this.positionStart, newAmount);
  }

  includeDeleteInsert(operation: InsertOperation) {
    let overlapType = intersectDeleteInsertOperations(this, operation);

    const operationStartEnd = getOperationStartEnd(operation);

    if (overlapType === IntersectionType.OnTheLeft) {
      return this.moveRightBy(operationStartEnd.lengthDiff);
    }
    if (overlapType === IntersectionType.OnTheRight) {
      return this.moveRightBy(0);
    }

    const firstDeleteRange = this.newAmount(operation.getPosition() - this.getPositionStart());
    const secondDeleteRange = this
      .moveRightBy(this.positionStart - firstDeleteRange.positionStart + firstDeleteRange.amount + operation.getInsertString().length)
      .newAmount(this.getAmount() - firstDeleteRange.getAmount());

    return new JointDeleteOperation(
      firstDeleteRange,
      secondDeleteRange,
    );
  }


  includeDeleteDelete(operation: DeleteOperation) {
    let overlapType = intersectOperations(this, operation);

    const operationStartEnd = getOperationStartEnd(operation);

    if (overlapType === IntersectionType.OnTheLeft) {
      return this.moveRightBy(operationStartEnd.lengthDiff);
    }

    if (overlapType === IntersectionType.OnTheRight) {
      return this.moveRightBy(0);
    }

    const position = Math.min(operation.getPositionStart(), this.getPositionStart());
    const totalDeleteEnd = Math.max(operation.getAmount() + operation.getPositionStart(), this.getPositionStart() + this.getAmount());
    const totalRange = totalDeleteEnd - position;
    const amount = totalRange - operation.getAmount();
    const result = new DeleteOperation(position, amount);
    saveLi(this, operation, result);
    return result;
  }

  exclude(operation: Operation) {
    if (operation instanceof InsertOperation) {
      return this.excludeDeleteInsert(operation);
    }

    if(operation instanceof DeleteOperation){
     return this.excludeDeleteDelete(operation);
    }

  }

  excludeDeleteDelete(operation: DeleteOperation){
    if (checkLi(operation, this)) {
      return recoverLi(operation, this);
    }

    const overlapType = intersectDeleteExcludeDeleteOperation(this, operation);

    const operationStartEnd = getOperationStartEnd(operation);

    switch (overlapType) {
      case IntersectionType.OnTheLeft:
        return new DeleteOperation(this.getPositionStart() - operationStartEnd.lengthDiff, this.getAmount());
      case IntersectionType.OnTheRight:
        return new DeleteOperation(this.getPositionStart(), this.getAmount());
      case IntersectionType.Overlap:
        const firstDeleteRange = this.newAmount(operation.getPositionStart() - this.getPositionStart());
        const secondDeleteRange = this
          .moveRightBy(this.positionStart - firstDeleteRange.positionStart + firstDeleteRange.amount + operation.getAmount())
          .newAmount(this.getAmount() - firstDeleteRange.getAmount());

        return new JointDeleteOperation(
          firstDeleteRange,
          secondDeleteRange,
        );
    }
  }

  excludeDeleteInsert(operation: InsertOperation) {
    if (checkLi(operation, this)) {
      return recoverLi(operation, this);
    }
    const overlapType = intersectOperations(this, operation);

    const operationStartEnd = getOperationStartEnd(operation);

    if (overlapType === IntersectionType.OnTheLeft) {
      return this.moveRightBy(-operationStartEnd.lengthDiff);
    }

    if (overlapType === IntersectionType.OnTheRight) {
      return this.moveRightBy(0);
    }

    const currentEnd = this.positionStart + this.amount;

    let result: Operation;
    if (this.positionStart < operationStartEnd.start && currentEnd < operationStartEnd.end) {
      const insertionStart = operationStartEnd.start;
      const newAmount = insertionStart - this.positionStart;
      result = new DeleteOperation(this.positionStart, newAmount);
    }

    if (this.positionStart > operationStartEnd.start && currentEnd > operationStartEnd.end) {
      result = new DeleteOperation(operationStartEnd.start, this.positionStart + this.amount - operationStartEnd.end);
    }

    if (this.positionStart <= operationStartEnd.start && currentEnd >= operationStartEnd.end) {
      result = new DeleteOperation(this.positionStart, this.amount - operationStartEnd.lengthDiff);
    }

    if (this.positionStart > operationStartEnd.start && currentEnd < operationStartEnd.end) {
      result = new DeleteOperation(this.positionStart, 0);
    }

    saveRa(result, operation);
    return result;
  }

  include(operation: Operation): DeleteOperation | JointDeleteOperation {
    if (operation instanceof InsertOperation) {
      return this.includeDeleteInsert(operation);
    }

    if (operation instanceof DeleteOperation) {
      return this.includeDeleteDelete(operation);
    }

    throw 'Unexpected operation type ' + operation;
  }

  timestamp(vector: StateVector, siteId: number): TimestampedOperation {
    return new TimestampedOperation(
      this,
      vector,
      siteId,
    );
  }

  clone(): Operation {
    return new DeleteOperation(this.positionStart, this.amount);
  }

  toString() {
    return this.constructor.name + `${this.positionStart} ${this.amount}`;
  }
}
