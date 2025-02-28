import { DeleteOperation } from '../../../operations/delete.operation.ts';
import { InsertOperation } from '../../../operations/insert.operation.ts';
import { JointDeleteOperation } from '../../../operations/joint-delete.operation.ts';


export function includeDeleteInInsert(target: InsertOperation, operation: DeleteOperation): InsertOperation {
  // "ABCDEFG", target delete range "[ABC]DEFG", operation delete range "ABC[DEFG]", no need to transform
  if (target.getPosition() + target.getInsertString().length < operation.getPositionStart()) {
    return new InsertOperation(target.getPosition(), target.getInsertString());
  }
  // "ABCDEFG", target delete range "ABC[DEFG]", operation delete range "[ABC]DEFG", start has to be shifted by [ABC]
  if (operation.getPositionStart() + operation.getAmount() < target.getPosition()) {
    return new InsertOperation(target.getPosition() - operation.getAmount(), target.getInsertString());
  }
  // if we are here it means that ranges overlap, in this case we need to substract operation range from target range
  // "ABCDEFG", target delete range "AB[CDE]FG", operation range "ABCD[EFG]"
  // OR target delete range "ABCD[EF]G", operation range "AB[CDE]FG", result should be AB[F]G
  const position = Math.min(operation.getPositionStart(), target.getPosition());
  const totalDeleteEnd = Math.max(operation.getAmount() + operation.getPositionStart(), target.getPosition() + target.getInsertString().length);
  const totalRange = totalDeleteEnd - position;
  const amount = totalRange - operation.getAmount();
  return new InsertOperation(position, target.getInsertString());
}


export function includeInsertInInsert(target: InsertOperation, operation: InsertOperation): InsertOperation {
  // "ABCDEFG", target delete range "[ABC]DEFG", operation insert is "ABCDEFG[aaa]", no need to transform
  if (target.getPosition() <= operation.getPosition()) {
    return new InsertOperation(target.getPosition(), target.getInsertString());
  }

  // "ABCDEFG", target delete range "ABC[DEFG]", operation insert is "[aaa]ABCDEFG", start has to be shifted by [aaa]
  if (operation.getPosition() <= target.getPosition()) {
    console.log('second');
    return new InsertOperation(target.getPosition() + operation.getInsertString().length, target.getInsertString());
  }

  return new InsertOperation(target.getPosition(), target.getInsertString());
}

