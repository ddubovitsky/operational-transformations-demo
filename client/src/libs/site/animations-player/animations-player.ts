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
  amount?: number;
}

export class AnimationsPlayer {
  constructor(private config: {
    playReceived: (operation: TimestampedOperation) => Promise<void>,
    playPreconditions: (operation: TimestampedOperation) => Promise<void>,
    playStored: (operation: TimestampedOperation, amount: number) => Promise<void>,
    playSent: (operation: TimestampedOperation) => Promise<void>,
    playUnstored: (operation: TimestampedOperation, amount: number) => Promise<void>,
    playPreconditionsFromStore: (operation: TimestampedOperation) => Promise<void>,
    playTransform: (operation: TimestampedOperation) => Promise<void>,
    playApply: (operation: TimestampedOperation, result?: string) => Promise<void>,
  }) {
    window.playEvents = (events) => {
      this.playEvents(events);
    };
  }

  current = Promise.resolve();

  prevState: EventType | null = null;

  playEvents(events: OperationFrame[]) {
    this.prevState = null;
    console.log(events);
    events.forEach((it) => {
      this.current = this.current.then(() => {
        return this.playEvent(it.eventType, it.operation, it.result, it.amount).then(() => {
          this.prevState = it.eventType;
          return Promise.resolve();
        });
      });
    });
  }

  playEvent(event: EventType, operation: TimestampedOperation, result?: string, amount?: number): Promise<void> {
    if (event === EventType.OperationExecuted && this.prevState !== EventType.OperationRemovedFromStore) {
      console.log('executed');
      return this.config.playPreconditions(operation)
        .then(() => this.config.playTransform(operation))
        .then(() => this.config.playApply(operation, result));
    }

    if(event === EventType.OperationExecuted && this.prevState === EventType.OperationRemovedFromStore){
      return this.config.playPreconditionsFromStore(operation)
        .then(() => this.config.playTransform(operation))
        .then(() => this.config.playApply(operation, result));
    }

    if (event === EventType.OperationReceived) {
      return this.config.playReceived(operation);
    }

    if (event === EventType.OperationStored) {
      return this.config.playPreconditions(operation)
        .then(() => this.config.playStored(operation, amount!));
    }

    if (event === EventType.OperationRemovedFromStore) {
      return this.config.playUnstored(operation, amount);
    }

    if (event === EventType.OperationSent) {
      return this.config.playSent(operation);
    }

    console.log(event);
    throw 'unknown event type';
  }
}
