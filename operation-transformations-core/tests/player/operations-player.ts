// S1: site start
// operations schedule notation
// - skip
// number - ID of operation
// x - site disconnected
// o - site connected;


export enum TokenType {
  Site = 'Site',
  Operation = 'Operation',
  Skip = 'Skip',
  Disconnect = 'Disconnect',
  Connect = 'Connect'
}

export class Token {
  constructor(
    public token: TokenType,
  ) {
  }
}

export class SiteToken extends Token {
  constructor(
    public siteId: string,
  ) {
    super(TokenType.Site);
  }
}


export class OperationToken extends Token {
  constructor(
    public operationId: string,
  ) {
    super(TokenType.Operation);
  }
}

export class OperationsParser {

  parseString(string: string): Map<SiteToken, Token[]> {
    const result = new Map<SiteToken, Token[]>();

    let currentSiteId = '';
    let currentSiteToken;
    let currentSiteOperations = [];
    for (const character of string) {
      if (character == '') {
        continue;
      }
      if (character == ' ') {
        continue;
      }

      if (character == ':') {
        continue;
      }

      if (character == '\n') {
        if (currentSiteId && currentSiteToken) {
          result.set(currentSiteToken, currentSiteOperations);
          currentSiteId = '';
          currentSiteToken = null;
          currentSiteOperations = [];
        }
        continue;
      }

      if (currentSiteId.length < 2) {
        currentSiteId += character;
        if (currentSiteId.length === 2) {
          currentSiteToken = new SiteToken(currentSiteId);
        }
        continue;
      }

      if (!currentSiteToken) {
        throw 'Site not initialised';
      }

      if (character === '-') {
        currentSiteOperations.push(new Token(TokenType.Skip));
        continue;
      }

      if (character === 'x') {
        currentSiteOperations.push(new Token(TokenType.Disconnect));
        continue;
      }

      if (character === 'o') {
        currentSiteOperations.push(new Token(TokenType.Connect));
        continue;
      }

      currentSiteOperations.push(new OperationToken(character));
    }

    if (currentSiteToken && !result.has(currentSiteToken)) {
      result.set(currentSiteToken, currentSiteOperations);
    }

    return result;
  }
}

export enum SiteState {
  Connected,
  Disconnected
}

export class OperationsPlayer {
  storedOperations = {};

  playOperations(
    operationsPlayback: string,
    playLocalOperation: (siteId: string, operationId: string) => any,
    playRemoteOperation: (siteId: string, operation: any) => void,
  ) {
    const operations = new OperationsParser().parseString(operationsPlayback);
    const maxOperationsLength = Math.max(...Array.from(operations.values()).map((it) => it.length));

    const sites = Array.from(operations.keys());

    const sitesState = sites.reduce((acc, it) => {
      acc.set(it, SiteState.Connected);
      return acc;
    }, new Map());

    for (let i = 0; i < maxOperationsLength; i++) {
      sites.forEach((site) => {
        const token = operations.get(site)[i];
        if (!token) {
          return;
        }

        if (token.token === TokenType.Skip) {
          return;
        }

        if (token.token === TokenType.Disconnect) {
          sitesState.set(site, SiteState.Disconnected);
          return;
        }

        if (token.token === TokenType.Connect) {
          sitesState.set(site, SiteState.Connected);

          if (this.storedOperations[site.siteId]?.length > 0) {
            console.log('play remotes');
            this.storedOperations[site.siteId].forEach((storedOperation) => {
              playRemoteOperation(site.siteId, storedOperation);
            });
            this.storedOperations[site.siteId] = [];
          }

          return;
        }

        if (token.token === TokenType.Operation) {
          const timestamped = playLocalOperation(site.siteId, (token as OperationToken).operationId);
          sites.filter((it) => it != site).forEach((remoteSite) => {
            if (sitesState.get(remoteSite) === SiteState.Connected) {
              playRemoteOperation(remoteSite.siteId, timestamped);
            } else {
              const stored = this.storedOperations[remoteSite.siteId] || [];
              stored.push(timestamped);
              this.storedOperations[remoteSite.siteId] = stored;
              console.log('store operation');
            }
          });
          return;
        }
      });
    }
  }
}
