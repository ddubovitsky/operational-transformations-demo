import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert';
import { OperationsParser, OperationsPlayer, OperationToken, SiteToken, Token, TokenType } from './operations-player.ts';

describe('Operations parser', () => {
  let parser: OperationsParser;
  beforeEach(() => {
    parser = new OperationsParser();
  });

  it('should parse site name, skip token', () => {
    const result = parser.parseString(`
    S1:--1-x--o-2
    S2:345
    `);

    const keys = Array.from(result.keys());
    assert.deepEqual(keys.length, 2);

    const site1Key = keys[0];
    assert.deepEqual(site1Key, new SiteToken('S1'));

    assert.deepEqual(result.get(site1Key), [
      new Token(TokenType.Skip),
      new Token(TokenType.Skip),
      new OperationToken('1'),
      new Token(TokenType.Skip),
      new Token(TokenType.Disconnect),
      new Token(TokenType.Skip),
      new Token(TokenType.Skip),
      new Token(TokenType.Connect),
      new Token(TokenType.Skip),
      new OperationToken('2'),
    ]);

    const site2Key = keys[1];
    assert.deepEqual(site2Key, new SiteToken('S2'));

    assert.deepEqual(result.get(site2Key), [
      new OperationToken('3'),
      new OperationToken('4'),
      new OperationToken('5'),
    ]);
  });
});


describe('Operations player', () => {
  let player: OperationsPlayer;
  beforeEach(() => {
    player = new OperationsPlayer();
  });

  it('should play local site operations', () => {
    const localOperationsRecord = [];
    player.playOperations(
      `S1:1-2-3`,
      (siteId, operationId) => {
        localOperationsRecord.push({ siteId, operationId });
        return {
          type: 'remote',
          siteId, operationId,
        };
      },
      () => {

      },
    );

    assert.deepEqual(localOperationsRecord, [
      { siteId: 'S1', operationId: '1' },
      { siteId: 'S1', operationId: '2' },
      { siteId: 'S1', operationId: '3' },
    ]);
  });
  it('should play remote site operations', () => {
    const remoteOperationsRecord = [];
    player.playOperations(
      `
      S1:-----
      S2:1-2-3
    `,
      (siteId, operationId) => {
        return {
          type: 'remote',
          siteId,
          operationId,
        };
      },
      (siteId, remoteOperation) => {
        remoteOperationsRecord.push({
          targetSiteId: siteId,
          ...remoteOperation,
        });
      },
    );

    assert.deepEqual(remoteOperationsRecord, [
      { type: 'remote', targetSiteId: 'S1', siteId: 'S2', operationId: '1' },
      { type: 'remote', targetSiteId: 'S1', siteId: 'S2', operationId: '2' },
      { type: 'remote', targetSiteId: 'S1', siteId: 'S2', operationId: '3' },
    ]);
  });

  it('should skip operations until site is offline', () => {
    const remoteOperationsRecord = [];
    player.playOperations(
      `
    S1:x-------
    S2:-1-2----3
    `,
      (siteId, operationId) => {
        return {
          type: 'remote',
          siteId,
          operationId,
        };
      },
      (siteId, remoteOperation) => {
        remoteOperationsRecord.push({
          targetSiteId: siteId,
          ...remoteOperation,
        });
      },
    );

    assert.deepEqual(remoteOperationsRecord, [
    ]);
  });

  it('should replay operations once site is online', () => {
    const remoteOperationsRecord = [];
    player.playOperations(
      `
    S1:x--------o
    S2:-1-2----3-
    `,
      (siteId, operationId) => {
        return {
          type: 'remote',
          siteId,
          operationId,
        };
      },
      (siteId, remoteOperation) => {
        remoteOperationsRecord.push({
          targetSiteId: siteId,
          ...remoteOperation,
        });
      },
    );

    assert.deepEqual(remoteOperationsRecord, [
      { type: 'remote', targetSiteId: 'S1', siteId: 'S2', operationId: '1' },
      { type: 'remote', targetSiteId: 'S1', siteId: 'S2', operationId: '2' },
      { type: 'remote', targetSiteId: 'S1', siteId: 'S2', operationId: '3' },
    ]);
  });
});
