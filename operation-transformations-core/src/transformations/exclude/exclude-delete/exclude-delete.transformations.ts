import { DeleteOperation } from '../../../operations/delete.operation.ts';
import { JointDeleteOperation } from '../../../operations/joint-delete.operation.ts';
import { InsertOperation } from '../../../operations/insert.operation.ts';
import { checkLi, recoverLi } from '../../../utilities.ts';

export function excludeDeleteFromDelete(target: DeleteOperation, operation: DeleteOperation): DeleteOperation {
  if (checkLi(operation, target)) {
    return recoverLi(operation, target);
  }
  if (operation.getPositionStart() + operation.getAmount() <= target.getPositionStart()) {
    return new DeleteOperation(target.getPositionStart() + operation.getAmount(), target.getAmount());
  }

  if (target.getPositionStart() + target.getAmount() <= operation.getPositionStart()) {
    return new DeleteOperation(target.getPositionStart(), target.getAmount());
  }

  console.log('gibberish');
}


export function excludeInsertFromDelete(target: DeleteOperation | JointDeleteOperation, operation: InsertOperation): DeleteOperation {
  if (target instanceof JointDeleteOperation) {
    return null;
  }

  if (operation.getPosition() + operation.getInsertString().length <= target.getPositionStart()) {
    return new DeleteOperation(target.getPositionStart() - operation.getInsertString().length, target.getAmount());
  }

  if (target.getPositionStart() + target.getAmount() <= operation.getPosition()) {
    return new DeleteOperation(target.getPositionStart(), target.getAmount());
  }
}
