export type StateLiteral = Record<number, number>;

// VALUE-OBJECT. Is immutable.
export class StateVector {
  private readonly state: StateLiteral = {};

  public static create(state: StateLiteral = {}): StateVector {
    return Object.freeze(new StateVector(state)) as StateVector;
  }

  private constructor(state: StateLiteral) {
    this.state = state;
  }

  increment(site: number): StateVector {
    return this.setSiteCounter(site, (this.getSiteCounter(site) || 0) + 1);
  }

  getSiteCounter(site: number) {
    return this.state[site] || 0;
  }

  getSites(): Set<number> {
    return new Set(
      Array.from(Object.keys(this.state),
      ).map(Number));
  }

  isEmpty() {
    return Object.keys(this.state).length === 0;
  }

  setSiteCounter(siteId: number, counter: number): StateVector {
    return new StateVector({
      ...this.state,
      [siteId]: counter,
    });
  }

  isContextuallyPreceding(
    otherState: StateVector,
    targetSiteId: number,
  ): boolean {
    if (this.isEmpty() && otherState.isEmpty()) {
      return true;
    }

    return this.getSiteCounter(targetSiteId) == otherState.getSiteCounter(targetSiteId) - 1;
  }

  hasAllKnownOperationsFor(
    otherState: StateVector,
    targetSiteId: number,
  ): boolean {
    if (this.isEmpty() && otherState.isEmpty()) {
      return true;
    }
    return this.getSiteCounter(targetSiteId) >= otherState.getSiteCounter(targetSiteId);
  }

  isEqualForSite(stateVector2: StateVector, targetSiteId: number) {
    return this.getSiteCounter(targetSiteId) == stateVector2.getSiteCounter(targetSiteId);
  }
}
