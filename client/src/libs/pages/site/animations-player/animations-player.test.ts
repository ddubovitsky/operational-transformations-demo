import { describe, it } from 'node:test';

describe('Incoming animation player', () => {
  it('should play default animation', () => {
    const animationsPlayer = new AnimationsPlayer({
      playReceived: () => {
        return Promise.resolve();
      },
      playPreconditions: () => {
        return Promise.resolve();
      },
      playPending: () => {
        return Promise.resolve();
      },
      playTransform: () => {
        return Promise.resolve();
      },
      playApply: () => {
        return Promise.resolve();
      },
    });
  });
});
