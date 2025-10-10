import { beforeEach, describe, it } from 'node:test';
import { Site } from '@operations-transformations-core/src/site/site.ts';
import { SitesNetworkClass } from './sites-network.class.ts';
import { DeleteOperation } from '@operations-transformations-core/src/operations/delete.operation.ts';
import assert from 'node:assert';

describe('Sites network', () => {
  let sites = {
    'S1': new Site(1),
    'S2': new Site(2),
    'S3': new Site(3),
  } as const;

  beforeEach(() => {
    sites = {
      'S1': new Site(1),
      'S2': new Site(2),
      'S3': new Site(3),
    } as const;
  });
  it('should deliver operation to both sites', () => {
    const network = new SitesNetworkClass();

    network.addSites(Object.values(sites));
    const operation = sites.S1.addLocalOperation(new DeleteOperation(0, 2));
    network.send(operation);
    assert.deepEqual(sites.S2.history.getList(), [operation]);
    assert.deepEqual(sites.S3.history.getList(), [operation]);
  });

  it('should not deliver operation to disabled site', () => {
    const network = new SitesNetworkClass();
    network.addSites(Object.values(sites));

    const operation = sites.S1.addLocalOperation(new DeleteOperation(0, 2));
    network.disableConnection(sites.S1, sites.S3);

    network.send(operation);

    assert.deepEqual(network.getPending(sites.S1, sites.S3).length, 1);

    assert.deepEqual(sites.S2.history.getList(), [operation]);
    assert.deepEqual(sites.S3.history.getList(), []);
  });

  it('should  deliver operation to newly connected site', () => {
    const network = new SitesNetworkClass();
    network.addSites(Object.values(sites));

    const operation = sites.S1.addLocalOperation(new DeleteOperation(0, 2));
    network.disableConnection(sites.S1, sites.S3);

    network.send(operation);


    assert.deepEqual(sites.S2.history.getList(), [operation]);
    assert.deepEqual(sites.S3.history.getList(), []);

    assert.deepEqual(network.getPending(sites.S1, sites.S3).length, 1);
    network.enableConnection(sites.S1, sites.S3);

    assert.deepEqual(sites.S2.history.getList(), [operation]);
    assert.deepEqual(sites.S3.history.getList(), [operation]);
    assert.deepEqual(network.getPending(sites.S1, sites.S3).length, 0);
  });
});
