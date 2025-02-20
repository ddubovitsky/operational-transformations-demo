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
}
