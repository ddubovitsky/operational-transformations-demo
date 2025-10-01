import { DeleteOperation } from './delete.operation.ts';
import { InsertOperation } from './insert.operation.ts';
import { Operation } from './operation.interface.ts';
import { StateVector } from '../utils/state-vector/state-vector.class.ts';
import { TimestampedOperation } from './timestamped-operation.ts';
import { getOperationStartEnd } from './utils/operations-intersections.util.ts';
import { saveLi } from './utils/operations-utilities.ts';

export class JointDeleteOperation implements Operation {
   readonly first: DeleteOperation;
   readonly second: DeleteOperation;

  constructor(first: DeleteOperation, second: DeleteOperation) {
    this.first = first;
    this.second = second;
  }

  execute(input: string) {
    let resultString = '';
    for (let i = 0; i < input.length; i++) {
      if (isInsideRange(this.first.getPositionStart(), this.first.getPositionStart() + this.first.getAmount(), i)) {
        continue;
      }

      if (isInsideRange(this.second.getPositionStart(), this.second.getPositionStart() + this.second.getAmount(), i)) {
        continue;
      }

      resultString += input[i];
    }
    return resultString;
  }


  includeDeleteOperation(deleteOperation: DeleteOperation) {
    const first = this.first.include(deleteOperation);
    const second = this.second.include(deleteOperation);


    if (getOperationStartEnd(first).lengthDiff === 0) {
      saveLi(this, deleteOperation, second);
      return second;
    }
    if (getOperationStartEnd(second).lengthDiff === 0) {
      saveLi(this, deleteOperation, first);
      return first;
    }

    return new JointDeleteOperation(
      first as any, second as any,
    );
  }

  include(operation: Operation): Operation {
    if (operation instanceof DeleteOperation) {
      return this.includeDeleteOperation(operation);
    }

    throw 'Joint Delete include insert not included';
  }

  exclude(operation: Operation) {
    if (operation instanceof JointDeleteOperation) {
      throw 'Cannot exclude delete from  joint operation';
    }
    if (operation instanceof DeleteOperation) {
      throw 'not yer support exclude from delete operation';
    }

    const insertOperation = operation as InsertOperation;

    let newFirst = this.first;
    let newSecond = this.second;

    if (this.first.getPositionStart() >= insertOperation.getPosition()) {
      newFirst = new DeleteOperation(newFirst.getPositionStart() - insertOperation.getInsertString().length, newFirst.getAmount());
    }

    if (this.second.getPositionStart() >= insertOperation.getPosition()) {
      newSecond = new DeleteOperation(newSecond.getPositionStart() - insertOperation.getInsertString().length, newSecond.getAmount());
    }

    if (newFirst.getPositionStart() + newFirst.getAmount() === newSecond.getPositionStart()) {
      return new DeleteOperation(newFirst.getPositionStart(), newFirst.getAmount() + newSecond.getAmount());
    }

    throw 'Joint Delete include exclude not included';
  }

  clone(): Operation {
    return new JointDeleteOperation(
      this.first,
      this.second,
    );
  }


  timestamp(vector: StateVector, siteId: number): TimestampedOperation {
    return new TimestampedOperation(
      this, vector,
      siteId,
    );
  }

  toString(){
    return '[Joined' + this.first.toString() + ' & ' + this.second.toString() +']'
  }
}

function isInsideRange(start: number, end: number, target: number): boolean {
  return target >= start && target < end;
}
