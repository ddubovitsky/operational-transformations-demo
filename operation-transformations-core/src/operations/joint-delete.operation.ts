import { DeleteOperation } from './delete.operation.ts';
import { Operation } from '../operation.ts';
import { InsertOperation } from './insert.operation.ts';

export class JointDeleteOperation {
  private first: DeleteOperation;
  private second: DeleteOperation;

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

  exclude(operation: Operation) {
    if (operation instanceof JointDeleteOperation) {
      throw 'Cannot exclude delete from  joint operation';
    }
    if (operation instanceof DeleteOperation) {
      throw 'not yer support exclude from delete operation';
    }

    operation = operation as InsertOperation;

    let newFirst = this.first;
    let newSecond = this.second;

    if (this.first.getPositionStart() >= operation.getPosition()) {
      newFirst = new DeleteOperation(newFirst.getPositionStart() - operation.getInsertString().length, newFirst.getAmount());
    }

    if (this.second.getPositionStart() >= operation.getPosition()) {
      newSecond = new DeleteOperation(newSecond.getPositionStart() - operation.getInsertString().length, newSecond.getAmount());
    }

    if (newFirst.getPositionStart() + newFirst.getAmount() === newSecond.getPositionStart()) {
      return new DeleteOperation(newFirst.getPositionStart(), newFirst.getAmount() + newSecond.getAmount());
    }
  }
}

function isInsideRange(start: number, end: number, target: number): boolean {
  return target >= start && target < end;
}
