import {
  getOperationStartEnd,
  intersectIncludeDelete,
  intersectInsertExcludeDelete,
  IntersectionType,
} from './utils/operations-intersections.util.ts';
import { DeleteOperation } from './delete.operation.ts';
import { checkLi, getIra, getRa, isDevMode, recoverLi, reportError, saveIRa, saveLi, saveRa } from './utils/operations-utilities.ts';
import { Operation } from './operation.interface.ts';
import { StateVector } from '../utils/state-vector/state-vector.class.ts';
import { TimestampedOperation } from './timestamped-operation.ts';
import { JointDeleteOperation } from './joint-delete.operation.ts';

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
      throw 'Unexpected position ' + this.position + ' ' + input.length;
    }

    return input.substring(0, this.position) + this.insertString + input.substring(this.position, input.length);
  }


  include(operation: Operation, originalSiteId?: number, operationSiteId?: number, originalSv?: StateVector, transformSv?: StateVector) {
    if (getRa(originalSv)?.isEqual(transformSv)) {
      console.log('restore', this.toString(), operation.toString());
      return this.moveRightBy(getOperationStartEnd(operation).start);
    }

    if (operation instanceof InsertOperation) {
      return this.includeInsertInsert(operation, originalSiteId, operationSiteId, originalSv, transformSv);
    }

    if (operation instanceof DeleteOperation) {
      return this.includeInsertDelete(operation, originalSv, transformSv);
    }

    if (operation instanceof JointDeleteOperation) {
      return this.includeJointDelete(operation, originalSv, transformSv);
    }

    throw 'include ' + operation.constructor.name + ' hot handled';
  }

  exclude(operation: Operation, originalVector?: StateVector, transformSv?: StateVector) {
    if (checkLi(operation, this)) {
      return recoverLi(operation, this);
    }

    if (operation instanceof InsertOperation) {
      return this.excludeInsertInsert(operation, originalVector,transformSv);
    }

    if (operation instanceof DeleteOperation) {
      return this.excludeInsertDelete(operation);
    }

    if (operation instanceof JointDeleteOperation) {
      return this.insertExcludeJointDelete(operation);
    }

    throw 'Unexpected Exclude';
  }

  private insertExcludeJointDelete(operation: JointDeleteOperation) {

    if (operation.first.getPositionStart() > this.position) {
      return this.moveRightBy(0);
    }

    if (operation.second.getPositionStart() + operation.second.getAmount() <= this.position) {

      return this.moveRightBy((operation.first.getAmount() + operation.second.getAmount()));
    }

    return this.excludeInsertDelete(operation.first).excludeInsertDelete(operation.second);
  }

  private moveRightBy(amount: number) {
    return new InsertOperation(this.position + amount, this.insertString);
  }

  private includeInsertInsert(operation: InsertOperation, originalSiteId?: number, operationSiteId?: number, originalVector?: StateVector, transformSv?: StateVector) {
    const operationStartEnd = getOperationStartEnd(operation);
    // const overlapType = intersectInsertOperations(this, operation);

    if (operation.position > this.position) {
      return this.moveRightBy(0);
    }

    if (operation.position < this.position) {
      return this.moveRightBy(operationStartEnd.lengthDiff);
    }


    if (getIra(originalVector)) { // for cases when initial include was to the right of this include, but undefined range happened
      console.log('get ira');
      const og: InsertOperation = getIra(originalVector);
      console.log(og, og.position, operationStartEnd.start)
      if (og.position > operationStartEnd.start) {
        return this.moveRightBy(operationStartEnd.lengthDiff);
      }
      return this.moveRightBy(0);
    }

    if (originalSiteId === operationSiteId) { // thats for sure
      return this.moveRightBy(0);
    }

    return this.moveRightBy(0);
  }

  private excludeInsertInsert(operation: InsertOperation, operationSv: StateVector, transformSv: StateVector) {
    const operationStartEnd = getOperationStartEnd(operation);

    if (this.position <= operation.position) {
      return this.moveRightBy(0);
    }

    if (operation.position <= this.position && operationStartEnd.end <= this.position) {
      return this.moveRightBy(-operationStartEnd.lengthDiff);
    }

    const result = new InsertOperation(this.position - operation.position, this.insertString);
    console.log('%csave ra', 'color:red', operationSv, transformSv, operation);
    saveRa(operationSv, transformSv);
    return result;
  }


  private includeJointDelete(operation: JointDeleteOperation, originalVector: StateVector,transformVector: StateVector) {
    if (operation.first.getPositionStart() > this.position) {
      return this.moveRightBy(0);
    }

    if (operation.second.getPositionStart() + operation.second.getAmount() <= this.position) {

      return this.moveRightBy(-(operation.first.getAmount() + operation.second.getAmount()));
    }

    return this.includeInsertDelete(operation.first, originalVector, transformVector).includeInsertDelete(operation.second, originalVector, transformVector);
  }

  private includeInsertDelete(operation: DeleteOperation, originalVector: StateVector, transformVector: StateVector) {
    let overlapType = intersectIncludeDelete(this, operation);
    const operationStartEnd = getOperationStartEnd(operation);

    if (overlapType === IntersectionType.OnTheLeft) {
      return this.moveRightBy(operationStartEnd.lengthDiff);
    }

    if (overlapType === IntersectionType.OnTheRight) {
      return this.moveRightBy(0);
    }

    const position = operation.getPositionStart();
    const result = new InsertOperation(position, this.getInsertString());
    saveLi(this, transformVector, originalVector);
    console.log("SAVE IRA");
    console.log("SAVE LI");
    saveIRa(originalVector, this);
    return result;
  }

  private excludeInsertDelete(operation: DeleteOperation) {
    if (checkLi(operation, this)) {
      return recoverLi(operation, this);
    }

    let overlapType = intersectInsertExcludeDelete(this, operation);

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
    return '[I' + ` ${this.position} ${this.insertString}]`;
  }
}
