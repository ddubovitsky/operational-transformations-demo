import { DeleteOperation } from '../../../operations/delete.operation.ts';
import { InsertOperation } from '../../../operations/insert.operation.ts';


export function IncludeDeleteInDelete(target: DeleteOperation, operation: DeleteOperation): DeleteOperation {
  // "ABCDEFG", target delete range "[ABC]DEFG", operation delete range "ABC[DEFG]", no need to transform
  if (target.getPositionStart() + target.getAmount() < operation.getPositionStart()) {
    return new DeleteOperation(target.getPositionStart(), target.getAmount());
  }
  // "ABCDEFG", target delete range "ABC[DEFG]", operation delete range "[ABC]DEFG", start has to be shifted by [ABC]
  if (operation.getPositionStart() + operation.getAmount() < target.getPositionStart()) {
    return new DeleteOperation(target.getPositionStart()-operation.getAmount(), target.getAmount());
  }
  // if we are here it means that ranges overlap, in this case we need to substract operation range from target range
  // "ABCDEFG", target delete range "AB[CDE]FG", operation range "ABCD[EFG]"
  // OR target delete range "ABCD[EF]G", operation range "AB[CDE]FG", result should be AB[F]G
  const position = Math.min(operation.getPositionStart(), target.getPositionStart());
  const totalDeleteEnd = Math.max(operation.getAmount() + operation.getPositionStart(), target.getPositionStart() + target.getAmount());
  const totalRange = totalDeleteEnd - position;
  const amount = totalRange - operation.getAmount();
  return new DeleteOperation(position, amount);

}


export function IncludeInsertInDelete(target: DeleteOperation, operation: InsertOperation): DeleteOperation {

}
