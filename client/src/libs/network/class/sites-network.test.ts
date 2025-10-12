import { beforeEach, describe, it } from 'node:test';
import { SiteNetworkInterface, SitesNetworkClass } from './sites-network.class.ts';
import assert from 'node:assert';
import { TimestampedOperation } from '@operations-transformations-core/src/operations/timestamped-operation.ts';
import { InsertOperation } from '@operations-transformations-core/src/operations/insert.operation.ts';
import { StateVector } from '@operations-transformations-core/src/utils/state-vector/state-vector.class.ts';

class SiteNetwork implements SiteNetworkInterface {
  history: TimestampedOperation[] = [];

  constructor(public siteId: number) {
  }

  playOperation(operation: TimestampedOperation): void {
    this.history.push(operation);
  }

}

describe('Sites network', () => {
  let sites = {
    'S1': new SiteNetwork(1),
    'S2': new SiteNetwork(2),
    'S3': new SiteNetwork(3),
  } as const;

  beforeEach(() => {
    sites = {
      'S1': new SiteNetwork(1),
      'S2': new SiteNetwork(2),
      'S3': new SiteNetwork(3),
    } as const;
  });
  it('should deliver operation to both sites', () => {
    const network = new SitesNetworkClass();

    network.addSites(Object.values(sites));
    const operation = new TimestampedOperation(new InsertOperation(1, '123'), StateVector.create(), 1);
    network.send(operation);
    assert.deepEqual(sites.S2.history, [operation]);
    assert.deepEqual(sites.S3.history, [operation]);
  });

  it('should not deliver operation to disabled site', () => {
    const network = new SitesNetworkClass();
    network.addSites(Object.values(sites));

    const operation = new TimestampedOperation(new InsertOperation(1, '123'), StateVector.create(), 1);
    network.disableConnection(sites.S1, sites.S3);

    network.send(operation);

    assert.deepEqual(network.getPending(sites.S1, sites.S3).length, 1);

    assert.deepEqual(sites.S2.history, [operation]);
    assert.deepEqual(sites.S3.history, []);
  });

  it('should  deliver operation to newly connected site', () => {
    const network = new SitesNetworkClass();
    network.addSites(Object.values(sites));

    const operation = new TimestampedOperation(new InsertOperation(1, '123'), StateVector.create(), 1);
    network.disableConnection(sites.S1, sites.S3);

    network.send(operation);


    assert.deepEqual(sites.S2.history, [operation]);
    assert.deepEqual(sites.S3.history, []);

    assert.deepEqual(network.getPending(sites.S1, sites.S3).length, 1);
    network.enableConnection(sites.S1, sites.S3);

    assert.deepEqual(sites.S2.history, [operation]);
    assert.deepEqual(sites.S3.history, [operation]);
    assert.deepEqual(network.getPending(sites.S1, sites.S3).length, 0);
  });
});
