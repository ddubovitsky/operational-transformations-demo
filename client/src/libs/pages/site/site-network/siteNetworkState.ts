import { Site } from '@operations-transformations-core/src/site/site.ts';
import { Operation } from '@operations-transformations-core/src/operations/operation.interface.ts';
import { Observable } from '../../../web-utils/reactivity/observable';
import { TimestampedOperation } from '@operations-transformations-core/src/operations/timestamped-operation.ts';
import { EventType, OperationFrame } from '../animations-player/animations-player.ts';
import { proxyViewBound } from '../../../web-utils/reactivity/signal-ui-bound';

export class SiteNetworkState {

  site!: Site;

  state = proxyViewBound({
    siteName: '',
    connected: true,
    notConnected: false,
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

  toggleConnectivity(b: boolean) {
    this.state.connected = b;
    this.state.notConnected = !b;

    this.runInRecordingEventsContext(() => {
      if (this.state.connected) {
        this.storedOutgoingEvents.forEach((it) => this.emitOperation$.next(it));
        this.storedOutgoingEvents = [];

        this.storedIncomingEvents.forEach((it) => this.executeOperation(it));
        this.storedIncomingEvents = [];
      }
    });
  }

  addLocalOperation(op: Operation) {
    const added = this.site.addLocalOperation(op);

    if (!this.state.connected) {
      this.storedOutgoingEvents.push(added);
      return null;
    }

    this.emitOperation$.next(added);
  }

  addRemoteOperation(operation: TimestampedOperation) {
    this.runInRecordingEventsContext(() => {
      this.onReceivedEvent?.();

      if (!this.state.connected) {
        this.storedIncomingEvents.push(operation);
        return;
      }

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
