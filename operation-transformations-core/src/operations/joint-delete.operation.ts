import { DeleteOperation } from './delete.operation.ts';

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
}

function isInsideRange(start: number, end: number, target: number): boolean {
  return target >= start && target < end;
}
