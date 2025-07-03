// import { DeleteOperation } from '../operations/delete.operation.ts';
// import { InsertOperation } from '../operations/insert.operation.ts';
//
// export type Operation = DeleteOperation | InsertOperation;
//
// export class GotControl {
//   getReadyOperation(historyBuffer: Operation[], operation: Operation): Operation {
//     let foundParallelOperationAtIndex = -1;
//     for (let i = 0; i < historyBuffer.length; i++) {
//       if (compareOperations(historyBuffer[i], operation) == OperationRelation.Parallel) {
//         foundParallelOperationAtIndex = i;
//         return restoreOperation(historyBuffer, operation, foundParallelOperationAtIndex);
//       }
//     }
//     return operation;
//   }
// }
//
// function restoreOperation(historyBuffer: Operation[], operation: Operation, separationPoint: number) {
//
//   const transformedOriginalExecutionContext = historyBuffer.slice(separationPoint).filter((bufferOperation) => compareOperations(
//     bufferOperation,
//     operation,
//   ) === OperationRelation.Preceding);
//
//   const seed = transformedOriginalExecutionContext[0];
//   const seedIndex = historyBuffer.indexOf(seed);
//
//   const transformedSeed = listExclude(historyBuffer.slice(separationPoint, seedIndex), seed);
//
//   const originalContext = [transformedSeed];
//
//   for (let i = 1; i < transformedOriginalExecutionContext.length; i++) {
//     const trOperation = transformedOriginalExecutionContext[i];
//     const bufferHistory = historyBuffer.indexOf(trOperation);
//     const parallelToSeparationPoint = listExclude(historyBuffer.slice(separationPoint, bufferHistory), trOperation);
//     originalContext.push(
//       listInclude(originalContext, parallelToSeparationPoint)
//     );
//   }
//
//   const originalExcluded = listExclude(originalContext, operation);
//   return listInclude(historyBuffer.slice(separationPoint), originalExcluded);
// }
//
// function listInclude(list: Operation[], operation: Operation): Operation {
//
// }
//
// function listExclude(list: Operation[], operation: Operation): Operation {
//
// }
//
// enum OperationRelation {
//   Preceding,
//   Parallel
// }
//
// function isContextPreceding() {
//   return OperationRelation.Parallel;
// }
//
// function compareOperations(operationA: Operation, operationB: Operation): OperationRelation {
//
// }
