import { TimestampedOperation } from '@operations-transformations-core/src/operations/timestamped-operation.ts';

export enum EventType {
  OperationExecuted,
  OperationReceived,
  OperationStored,
  OperationRemovedFromStore,
  OperationSent,
}

export interface OperationFrame {
  eventType: EventType,
  operation: TimestampedOperation,
  result?: string;
}

export class AnimationsPlayer {
  constructor(private config: {
    playReceived: (operation: TimestampedOperation) => Promise<void>,
    playPreconditions: (operation: TimestampedOperation) => Promise<void>,
    playStored: (operation: TimestampedOperation) => Promise<void>,
    playSent: (operation: TimestampedOperation) => Promise<void>,
    playUnstored: (operation: TimestampedOperation) => Promise<void>,
    playTransform: (operation: TimestampedOperation) => Promise<void>,
    playApply: (operation: TimestampedOperation, result?: string) => Promise<void>,
  }) {
  }

  current = Promise.resolve();

  playEvents(events: OperationFrame[]) {
    events.forEach((it) => {
      this.current = this.current.then(() => this.playEvent(it.eventType, it.operation, it.result));
    });
  }

  playEvent(event: EventType, operation: TimestampedOperation, result?: string): Promise<void> {
    if (event === EventType.OperationExecuted) {
      return this.config.playPreconditions(operation)
        .then(() => this.config.playTransform(operation))
        .then(() => this.config.playApply(operation, result));
    }

    if (event === EventType.OperationReceived) {
      return this.config.playReceived(operation);
    }

    if (event === EventType.OperationStored) {
      return this.config.playPreconditions(operation)
        .then(() => this.config.playStored(operation));
    }

    if (event === EventType.OperationRemovedFromStore) {
      return this.config.playUnstored(operation);
    }

    if (event === EventType.OperationSent) {
      return this.config.playSent(operation);
    }

    throw 'unknown event type';
  }
}
