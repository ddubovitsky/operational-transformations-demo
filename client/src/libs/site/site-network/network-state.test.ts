import { beforeEach, describe, it } from 'node:test';
import { SiteNetworkState } from './siteNetworkState.ts';
import assert from 'node:assert';
import { InsertOperation } from '@operations-transformations-core/src/operations/insert.operation.ts';
import { StateVector } from '@operations-transformations-core/src/utils/state-vector/state-vector.class.ts';

describe('site component state', () => {
  let state: SiteNetworkState;

  beforeEach(() => {
    state = new SiteNetworkState();
  });

  it('should change state on toggle connectivity on', () => {
    state.toggleConnectivity(true);
    assert.deepEqual(state.state.connected, true);
  });

  it('should change state on toggle connectivity of', () => {
    state.toggleConnectivity(false);
    assert.deepEqual(state.state.connected, false);
  });

  it('should store local operation if state is offline', () => {
    state.toggleConnectivity(false);
    state.addLocalOperation(new InsertOperation(0, '123'));
    assert.deepEqual(state.storedOutgoingEvents, [new InsertOperation(0, '123')]);
  });

  it('should store remote operation if state is offline', () => {
    state.toggleConnectivity(false);
    const operation = new InsertOperation(0, '123').timestamp(StateVector.create(), 1);
    state.addRemoteOperation(operation);
    assert.deepEqual(state.storedIncomingEvents, [operation]);
  });

  it('should not store local operation if state is offline', () => {
    state.toggleConnectivity(true);
    state.addLocalOperation(new InsertOperation(0, '123'));
    assert.deepEqual(state.storedOutgoingEvents, []);
  });

  it('should not store remote operation if state is offline', () => {
    state.toggleConnectivity(true);
    const operation = new InsertOperation(0, '123').timestamp(StateVector.create(), 1);
    state.addRemoteOperation(operation);
    assert.deepEqual(state.storedIncomingEvents, []);
  });
});
