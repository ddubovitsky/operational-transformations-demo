import {
  getOperationStartEnd,
  intersectIncludeDelete,
  intersectInsertExcludeDelete,
  IntersectionType,
} from './utils/operations-intersections.util.ts';
import { DeleteOperation } from './delete.operation.ts';
import {
  checkLi,
  getIra, getIra2,
  getRa,
  isDevMode,
  recoverLi,
  reportError,
  saveIRa,
  saveIRa2,
  saveLi,
  saveRa,
} from './utils/operations-utilities.ts';
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
    if (getRa(operationSiteId, originalSv)?.isEqual(transformSv)) {
      console.log('restore', this.toString(), operation.toString());
      return this.moveRightBy(getOperationStartEnd(operation).start);
    }

    if (operation instanceof InsertOperation) {
      return this.includeInsertInsert(operation, originalSiteId, operationSiteId, originalSv, transformSv);
    }

    if (operation instanceof DeleteOperation) {
      return this.includeInsertDelete(operation, originalSiteId, operationSiteId, originalSv, transformSv);
    }

    if (operation instanceof JointDeleteOperation) {
      return this.includeJointDelete(operation, originalSiteId, operationSiteId, originalSv, transformSv);
    }

    throw 'include ' + operation.constructor.name + ' hot handled';
  }

  exclude(operation: Operation, originalSiteId: number, originalVector?: StateVector, transformSv?: StateVector) {
    if (checkLi(originalSiteId, transformSv, originalVector)) {
      return recoverLi(originalSiteId, transformSv, originalVector);
    }

    if (operation instanceof InsertOperation) {
      return this.excludeInsertInsert(operation, originalSiteId, originalVector, transformSv);
    }

    if (operation instanceof DeleteOperation) {
      return this.excludeInsertDelete(operation, originalSiteId, originalVector, transformSv);
    }

    if (operation instanceof JointDeleteOperation) {
      return this.insertExcludeJointDelete(operation, originalSiteId, originalVector, transformSv);
    }

    throw 'Unexpected Exclude';
  }

  private insertExcludeJointDelete(operation: JointDeleteOperation, siteId: number, originalVector: StateVector, transformVector: StateVector) {

    if (operation.first.getPositionStart() > this.position) {
      return this.moveRightBy(0);
    }

    if (operation.second.getPositionStart() + operation.second.getAmount() <= this.position) {

      return this.moveRightBy((operation.first.getAmount() + operation.second.getAmount()));
    }

    return this.excludeInsertDelete(operation.first, siteId, originalVector, transformVector).excludeInsertDelete(operation.second, originalVector, transformVector);
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


    if (getIra(originalSiteId, originalVector)) { // for cases when initial include was to the right of this include, but undefined range happened
      const og: InsertOperation = getIra(originalSiteId, originalVector);
      if (og.position > operationStartEnd.start) {
        return this.moveRightBy(operationStartEnd.lengthDiff);
      }
      return this.moveRightBy(0);
    }

    if (originalSiteId === operationSiteId) { // thats for sure

      if(getIra2(originalSiteId, originalVector)){
        return this.moveRightBy(operationStartEnd.lengthDiff);
      }
      return this.moveRightBy(0);
    }
    if (originalSiteId > operationSiteId) {
      return this.moveRightBy(operationStartEnd.lengthDiff);
    }
    return this.moveRightBy(0);
  }

  private excludeInsertInsert(operation: InsertOperation, siteId: number, operationSv: StateVector, transformSv: StateVector) {
    const operationStartEnd = getOperationStartEnd(operation);

    if (this.position <= operation.position) {
      return this.moveRightBy(0);
    }

    if (operation.position <= this.position && operationStartEnd.end <= this.position) {
      if(this.position - operationStartEnd.lengthDiff === operation.position){
        saveIRa2(siteId, operationSv, this);
      }
      return this.moveRightBy(-operationStartEnd.lengthDiff);
    }

    const result = new InsertOperation(this.position - operation.position, this.insertString);
    console.log('%csave ra', 'color:red', operationSv, transformSv, operation);
    saveRa(siteId, operationSv, transformSv);
    return result;
  }


  private includeJointDelete(operation: JointDeleteOperation, originalSiteId: number, transformSiteId: number, originalVector: StateVector, transformVector: StateVector) {
    if (operation.first.getPositionStart() > this.position) {
      return this.moveRightBy(0);
    }

    if (operation.second.getPositionStart() + operation.second.getAmount() <= this.position) {

      return this.moveRightBy(-(operation.first.getAmount() + operation.second.getAmount()));
    }

    return this.includeInsertDelete(operation.first, originalSiteId, transformSiteId, originalVector, transformVector).includeInsertDelete(operation.second, originalSiteId, transformSiteId, originalVector, transformVector);
  }

  private includeInsertDelete(operation: DeleteOperation, originalSiteId: number, transformSiteId: number, originalVector: StateVector, transformVector: StateVector) {
    let overlapType = intersectIncludeDelete(this, operation);
    const operationStartEnd = getOperationStartEnd(operation);

    if (overlapType === IntersectionType.OnTheLeft) {
      if (operationStartEnd.end === this.getPosition() && originalSiteId != transformSiteId) {
        saveIRa(originalSiteId, originalVector, this);
      }
      return this.moveRightBy(operationStartEnd.lengthDiff);
    }

    if (overlapType === IntersectionType.OnTheRight) {
      return this.moveRightBy(0);
    }

    const position = operation.getPositionStart();
    const result = new InsertOperation(position, this.getInsertString());
    saveLi(originalSiteId, this, transformVector, originalVector);
    saveIRa(originalSiteId, originalVector, this);
    return result;
  }

  private excludeInsertDelete(operation: DeleteOperation, siteId: number, originalVector: StateVector, transformVector: StateVector) {
    if (checkLi(siteId, transformVector, originalVector)) {
      return recoverLi(siteId, transformVector, originalVector);
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
