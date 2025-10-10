import { Site } from '@operations-transformations-core/src/site/site.ts';
import { Operation } from '@operations-transformations-core/src/operations/operation.interface.ts';
import { Observable } from '../../web-utils/reactivity/observable';
import { TimestampedOperation } from '@operations-transformations-core/src/operations/timestamped-operation.ts';
import { EventType, OperationFrame } from '../animations-player/animations-player.ts';
import { proxyViewBound } from '../../web-utils/reactivity/signal-ui-bound';

export class SiteOperationsRecorder {

  site!: Site;

  state = proxyViewBound({
    siteName: '',
  });

  emitOperation$ = new Observable();

  siteUpdated$ = new Observable();

  events$ = new Observable();


  initSite(siteId: number) {
    this.state.siteName = 'Site ' + siteId;
    this.site = new Site(siteId);
  }

  onReceivedEvent?: Function;
  onSentEvent?: Function;

  sendEvent(it: TimestampedOperation, amountLeft: number) {
    this.onSentEvent?.(it, amountLeft);
    this.emitOperation$.next(it);
  }

  addLocalOperation(op: Operation) {
    this.runInRecordingEventsContext(() => {
      const added = this.site.addLocalOperation(op);

      this.sendEvent(added, 0);
    });
  }

  addRemoteOperation(operation: TimestampedOperation) {
    this.runInRecordingEventsContext(() => {

      this.onReceivedEvent?.();

      this.executeOperation(operation);
    });
  }


  private executeOperation(operation: TimestampedOperation) {
    this.site.addRemoteOperation(operation);
    this.siteUpdated$.next(this.site.produceResult());
  }

  runInRecordingEventsContext(func: () => void) {
    const events: OperationFrame[] = [];


    this.onSentEvent = (operation: any) => {
      events.push(
        {
          eventType: EventType.OperationSent,
          operation: operation,
        });
    };

    this.onReceivedEvent = (operation: any) => {
      events.push(
        {
          eventType: EventType.OperationReceived,
          operation: operation,
        });
    };


    this.site.onOperationExecuted = (operation, result) => {
      events.push({
        eventType: EventType.OperationExecuted,
        operation: operation,
        result: result,
      });
    };

    this.site.operationsBufferedFilter.onOperationRemoved = (operation) => {
      events.push({
        eventType: EventType.OperationRemovedFromStore,
        operation: operation,
      });
    };

    this.site.operationsBufferedFilter.onOperationStored = (operation) => {
      events.push({
        eventType: EventType.OperationStored,
        operation: operation,
      });
    };

    func();

    this.events$.next(events);
  }
}
