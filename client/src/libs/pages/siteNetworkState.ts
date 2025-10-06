import { Site } from '@operations-transformations-core/src/site/site.ts';
import { Operation } from '@operations-transformations-core/src/operations/operation.interface.ts';
import { Observable } from '../web-utils/reactivity/observable';
import { TimestampedOperation } from '@operations-transformations-core/src/operations/timestamped-operation.ts';

export class SiteNetworkState {

  site!: Site;

  state = {
    connected: true,
  };

  storedOutgoingEvents: Operation[] = [];
  storedIncomingEvents: TimestampedOperation[] = [];

  emitOperation$ = new Observable();

  initSite(siteId: number) {
    this.site = new Site(siteId);
  }

  toggleConnectivity(b: boolean) {
    this.state.connected = b;

    if (this.state.connected) {
      this.storedOutgoingEvents.forEach((it) => this.emitOperation$.next(it));
      this.storedOutgoingEvents = [];

      this.storedIncomingEvents.forEach((it) => this.site.addRemoteOperation(it));
      this.storedIncomingEvents = [];
    }
  }

  addLocalOperation(op: Operation) {
    if (!this.state.connected) {
      this.storedOutgoingEvents.push(op);
      return null;
    }
    const added = this.site.addLocalOperation(op);
    this.emitOperation$.next(added);
  }

  addRemoteOperation(operation: TimestampedOperation) {
    if (!this.state.connected) {
      this.storedIncomingEvents.push(operation);
      return;
    }
    this.site.addRemoteOperation(operation);
  }

}
