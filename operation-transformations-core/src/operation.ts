import { DeleteOperation } from './operations/delete.operation.ts';
import { InsertOperation } from './operations/insert.operation.ts';
import { JointDeleteOperation } from './operations/joint-delete.operation.ts';

export type Operation = DeleteOperation | InsertOperation | JointDeleteOperation;
