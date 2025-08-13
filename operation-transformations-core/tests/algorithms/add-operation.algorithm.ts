import test from 'node:test';
import { InsertOperation } from '../../src/operations/insert.operation.ts';

const operations = [
  new InsertOperation(1, 'A'),
  new InsertOperation(2, 'B'),
  new InsertOperation(3, 'C'),
  new InsertOperation(4, 'D'),
];

const divergingOperation = new InsertOperation(1, 'Q');

test('OperationsList test', (t) => {
  const context2Operation = new InsertOperation(2, 'B');
  const context2 = [operations[0], operations[2], context2Operation];

  const context1 = new OperationsList([operations[0], divergingOperation, operations[2]]);

  context1.isOperationReady(context2Operation);
  const firstDiverging = context1.firstDivergingOperationIndex(context2Operation);
  const firstCommon = context1.firstDivergingOperationIndex(context2Operation);

  context1.restoreOperationsList({
    range: [2, 3],
    excludeRange: [1, 1],
  });

});
