import { DeleteOperation } from '../../../operations/delete.operation.ts';
import { InsertOperation } from '../../../operations/insert.operation.ts';
import { JointDeleteOperation } from '../../../operations/joint-delete.operation.ts';
import { saveLi } from '../../../utilities.ts';


export function includeDeleteInDelete(target: DeleteOperation, operation: DeleteOperation): DeleteOperation {
  // "ABCDEFG", target delete range "[ABC]DEFG", operation delete range "ABC[DEFG]", no need to transform
  if (target.getPositionStart() + target.getAmount() < operation.getPositionStart()) {
    return new DeleteOperation(target.getPositionStart(), target.getAmount());
  }
  // "ABCDEFG", target delete range "ABC[DEFG]", operation delete range "[ABC]DEFG", start has to be shifted by [ABC]
  if (operation.getPositionStart() + operation.getAmount() < target.getPositionStart()) {
    return new DeleteOperation(target.getPositionStart() - operation.getAmount(), target.getAmount());
  }
  // if we are here it means that ranges overlap, in this case we need to substract operation range from target range
  // "ABCDEFG", target delete range "AB[CDE]FG", operation range "ABCD[EFG]"
  // OR target delete range "ABCD[EF]G", operation range "AB[CDE]FG", result should be AB[F]G
  const position = Math.min(operation.getPositionStart(), target.getPositionStart());
  const totalDeleteEnd = Math.max(operation.getAmount() + operation.getPositionStart(), target.getPositionStart() + target.getAmount());
  const totalRange = totalDeleteEnd - position;
  const amount = totalRange - operation.getAmount();
  const result = new DeleteOperation(position, amount);
  saveLi( target,operation, result);
  return result;
}


export function includeInsertInDelete(target: DeleteOperation, operation: InsertOperation): DeleteOperation | JointDeleteOperation {
  // "ABCDEFG", target delete range "[ABC]DEFG", operation insert is "ABCDEFG[aaa]", no need to transform
  if (target.getPositionStart() + target.getAmount() <= operation.getPosition()) {
    return new DeleteOperation(target.getPositionStart(), target.getAmount());
  }

  // "ABCDEFG", target delete range "ABC[DEFG]", operation insert is "[aaa]ABCDEFG", start has to be shifted by [aaa]
  if (operation.getPosition() <= target.getPositionStart()) {
    console.log('second');
    return new DeleteOperation(target.getPositionStart() + operation.getInsertString().length, target.getAmount());
  }
  console.log('none');
  // if we are here it means that ranges overlap, in this case we need to substract operation range from target range
  // "ABCDEFG", target delete range "AB[CDE]FG", insert range "ABCD[aaa]EFG"
  // OR target delete range "AB[CDE]FG", operation range "ABC[aaa]DEFG", result should be AB[F]G
  const firstDeleteRange = new DeleteOperation(target.getPositionStart(), operation.getPosition() - target.getPositionStart());
  const secondDeleteRange = new DeleteOperation(operation.getPosition() + operation.getInsertString().length, target.getAmount() - firstDeleteRange.getAmount());

  return new JointDeleteOperation(
    firstDeleteRange,
    secondDeleteRange,
  );
}
