import { Site } from '@operations-transformations-core/src/site/site.ts';
import { Operation } from '@operations-transformations-core/src/operations/operation.interface.ts';
import { Observable } from '../../web-utils/reactivity/observable';
import { TimestampedOperation } from '@operations-transformations-core/src/operations/timestamped-operation.ts';
import { EventType, OperationFrame } from '../animations-player/animations-player.ts';
import { proxyViewBound } from '../../web-utils/reactivity/signal-ui-bound';

export class SiteNetworkState {

  site!: Site;

  state = proxyViewBound({
    siteName: '',
    outConnected: true,
    outNotConnected: false,

    inConnected: true,
    inNotConnected: false,
  });

  storedOutgoingEvents: TimestampedOperation[] = [];
  storedIncomingEvents: TimestampedOperation[] = [];

  emitOperation$ = new Observable();

  siteUpdated$ = new Observable();

  events$ = new Observable();


  initSite(siteId: number) {
    this.state.siteName = 'Site ' + siteId;
    this.site = new Site(siteId);
  }

  onReceivedEvent?: Function;
  onSentEvent?: Function;

  onStoredSentEvent?: Function;
  onStoredReceivedEvent?: Function;

  toggleConnectivityIn(b: boolean) {
    this.state.inConnected = b;
    this.state.inNotConnected = !b;

    this.runInRecordingEventsContext(() => {
      if (this.state.inConnected) {
        this.storedIncomingEvents.forEach((it) => this.executeOperation(it));
        this.storedIncomingEvents = [];
      }
    });
  }

  toggleConnectivityOut(b: boolean) {
    this.state.outConnected = b;
    this.state.outNotConnected = !b;

    this.runInRecordingEventsContext(() => {
      if (this.state.outConnected) {
        this.storedOutgoingEvents.forEach((it, amountLeft) => this.sendEvent(it, this.storedOutgoingEvents.length - amountLeft));
        this.storedOutgoingEvents = [];
      }
    });
  }

  sendEvent(it: TimestampedOperation, amountLeft: number) {
    this.onSentEvent?.(it, amountLeft);
    this.emitOperation$.next(it);
  }

  addLocalOperation(op: Operation) {
    this.runInRecordingEventsContext(() => {
      const added = this.site.addLocalOperation(op);

      if (!this.state.outConnected) {
        this.storedOutgoingEvents.push(added);
        return null;
      }

      this.sendEvent(added, 0);
    });
  }

  addRemoteOperation(operation: TimestampedOperation) {
    this.runInRecordingEventsContext(() => {

      if (!this.state.inConnected) {
        this.storedIncomingEvents.push(operation);
        return;
      }

      this.onReceivedEvent?.();

      this.executeOperation(operation);
    });
  }


  private executeOperation(operation: TimestampedOperation) {
    console.log(operation);
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
