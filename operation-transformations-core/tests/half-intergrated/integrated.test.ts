import { beforeEach, describe, it } from 'node:test';
import { InsertOperation } from '../../src/operations/insert.operation.ts';
import { Site } from '../../src/site/site.ts';
import { OperationsPlayer } from '../player/operations-player.ts';
import assert from 'node:assert';
import { DeleteOperation } from '../../src/operations/delete.operation.ts';



enum TestSites {
  Site1 = 1,
  Site2 = 2,
  Site3 = 3,
  Site4 = 4,
  Site5 = 5,
  Site6 = 6,
}

describe('Integrated test', () => {
  let sites: Record<string, Site>;

  beforeEach(() => {
    sites = {
      'S1': new Site(TestSites.Site1),
      'S2': new Site(TestSites.Site2),
    };
  });

  it('should construct korova on both sites', () => {
    const operations = {
      '1': new InsertOperation(0, 'let'),
      '2': new InsertOperation(3, 'ila'),
    };

    new OperationsPlayer().playOperations(
      `
      S1:1--2--
      S2:------
      `,
      (site, operationId) => {
        return sites[site].addLocalOperation(operations[operationId]);
      }, (site, operation) => {
        sites[site].addRemoteOperation(operation);
      });

    assert.deepEqual(sites['S1'].produceResult(), 'letila');
    assert.deepEqual(sites['S2'].produceResult(), 'letila');
  });


  it('should construct correctly move operation 3 to remove ova in both sites', () => {
    const operations = {
      '1': new InsertOperation(0, 'letila korova'),
      '2': new DeleteOperation(0, 3),
      '3': new DeleteOperation(10, 3),
    };

    new OperationsPlayer().playOperations(
      `
      S1:1--2----
      S2:-x--3--
      `,
      (site, operationId) => {
        return sites[site].addLocalOperation(operations[operationId]);
      }, (site, operation) => {
        sites[site].addRemoteOperation(operation);
      });

    assert.deepEqual(sites['S1'].produceResult(), 'ila kor');
    assert.deepEqual(sites['S2'].produceResult(), 'letila kor');
  });

  it('should correctly handle overlapping operations', () => {
    const operations = {
      '1': new InsertOperation(0, 'letila korova'),
      '2': new DeleteOperation(3, 7),
      '3': new InsertOperation(6, ' malenkaya'),
    };

    new OperationsPlayer().playOperations(
      `
      S1:1--2----
      S2:-x-3----
      `,
      (site, operationId) => {
        return sites[site].addLocalOperation(operations[operationId]);
      }, (site, operation) => {
        sites[site].addRemoteOperation(operation);
      });

    assert.deepEqual(sites['S1'].produceResult(), 'let malenkayaova');
    assert.deepEqual(sites['S2'].produceResult(), 'letila malenkaya korova');
  });

  it('should correctly handle consequentual deletes', () => {
    const operations = {
      '1': new InsertOperation(0, 'letila korova'),
      '2': new DeleteOperation(0, 7), //remove letila
      '4': new InsertOperation(7, 'porkhala '),
      '5': new DeleteOperation(0, 7),// remove letila
      '6': new InsertOperation(0, 'ochen '),
    };

    new OperationsPlayer().playOperations(
      `
      S1:1--2-------
      S2:-x---4-5-6--
      `,
      (site, operationId) => {
        return sites[site].addLocalOperation(operations[operationId]);
      }, (site, operation) => {
        sites[site].addRemoteOperation(operation);
      });

    assert.deepEqual(sites['S1'].produceResult(), 'ochen porkhala korova');
    assert.deepEqual(sites['S2'].produceResult(), 'ochen porkhala korova');
  });

  it('should correctly handle consequentual deletes 2', () => {
    const operations = {
      '1': new InsertOperation(0, 'letila korova'),
      '2': new DeleteOperation(0, 7),
      '3': new InsertOperation(0, 'ne '),
      '4': new InsertOperation(10, 'porkhala '),
      '5': new DeleteOperation(3, 7),
      '6': new InsertOperation(3, 'ochen '),
    };

    new OperationsPlayer().playOperations(
      `
      S1:1--2--------
      S2:-x--3-4-
      `,
      (site, operationId) => {
        return sites[site].addLocalOperation(operations[operationId]);
      }, (site, operation) => {
        sites[site].addRemoteOperation(operation);
      });

    assert.deepEqual(sites['S1'].produceResult(), 'ne porkhala korova');
    assert.deepEqual(sites['S2'].produceResult(), 'ne letila porkhala korova');
  });
});
