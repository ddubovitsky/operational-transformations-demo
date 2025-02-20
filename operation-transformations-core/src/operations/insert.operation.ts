export class InsertOperation {

  private insertString: string;
  private position: number;

  constructor(insertString: string, position: number) {
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
}
