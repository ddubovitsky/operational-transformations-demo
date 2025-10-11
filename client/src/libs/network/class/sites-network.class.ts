import { Site } from '@operations-transformations-core/src/site/site.ts';
import { TimestampedOperation } from '@operations-transformations-core/src/operations/timestamped-operation.ts';

enum Connectivity {
  Online = 1,
  Offline = 2
}

export class SitesNetworkClass {
  sitesConnectivity = new Map<string, Connectivity>();

  sites!: Site[];

  sitesPending = new Map<string, TimestampedOperation[]>();


  addSites(sites: Site[]) {
    this.sites = sites;
    for (let i = 0; i < sites.length; i++) {
      for (let j = i + 1; j < sites.length; j++) {
        this.sitesConnectivity.set(this.formKeyOrderless(sites[i].siteId, sites[j].siteId), Connectivity.Online);
      }
    }
  }

  private formKeyOrderless(siteId: number, siteId2: number) {
    return [siteId, siteId2].sort().join('-');
  }

  private formKey(siteId: number, siteId2: number) {
    return [siteId, siteId2].join('-');
  }

  send(operation: TimestampedOperation) {
    for (let site of this.sites) {
      if (this.sitesConnectivity.get(this.formKeyOrderless(operation.siteId, site.siteId)) === Connectivity.Online) {
        site.addRemoteOperation(operation);
        continue;
      }
      if (operation.siteId !== site.siteId) {
        this.addPending(operation.siteId, site.siteId, operation);
      }
    }
  }

  private addPending(siteId1: number, siteId2: number, operation: TimestampedOperation) {
    const key = this.formKey(siteId1, siteId2);
    const added = (this.sitesPending.get(key) || []);
    added.push(operation);
    this.sitesPending.set(key, added);
  }

  public getPending(site1: Site, site2: Site): TimestampedOperation[] {
    const key = this.formKey(site1.siteId, site2.siteId);
    return this.sitesPending.get(key) || [];
  }

  public clearPending(site1: Site, site2: Site) {
    const key = this.formKey(site1.siteId, site2.siteId);
    this.sitesPending.set(key, []);
  }

  disableConnection(S1: Site, S3: Site) {
    this.sitesConnectivity.set(this.formKeyOrderless(S1.siteId, S3.siteId), Connectivity.Offline);
  }

  enableConnection(S1: Site, S3: Site) {
    this.sitesConnectivity.set(this.formKeyOrderless(S1.siteId, S3.siteId), Connectivity.Online);

    const operationsToSecond = this.getPending(S1, S3);

    operationsToSecond.forEach((it) => {
      S3.addRemoteOperation(it);
    });

    this.clearPending(S1, S3);
    const operationsToFirst = this.getPending(S3, S1);

    operationsToFirst.forEach((it) => {
      S1.addRemoteOperation(it);
    });

    this.clearPending(S3, S1);

  }
}
