import { describe, it } from 'node:test';
import { InputSampler, InsertEvent } from './input-sampler.class.ts';
import * as assert from 'node:assert';
import { InsertOperation } from '@operations-transformations-core/src/operations/insert.operation.ts';

describe('it', () => {
  it('should combine consequential inputs as one word', () => {
    const sampler = new InputSampler();

    const sampledEvents: any[] = [];
    const sub = sampler.sampled$.subscribe({
      next: (it: any) => {
        sampledEvents.push(it);
      },
    });

    sampler.inputEvent(new InsertEvent(0, 'h'));
    sampler.inputEvent(new InsertEvent(1, 'e'));
    sampler.inputEvent(new InsertEvent(2, 'l'));
    sampler.inputEvent(new InsertEvent(3, 'l'));
    sampler.inputEvent(new InsertEvent(4, 'o'));
    sampler.inputEvent(new InsertEvent(5, ' '));

    sampler.inputEvent(new InsertEvent(6, 'w'));
    sampler.inputEvent(new InsertEvent(7, 'o'));
    sampler.inputEvent(new InsertEvent(8, ' '));

    assert.deepEqual(sampledEvents, [new InsertOperation(0, 'hello '), new InsertOperation(6, 'wo ')]);
    sub.unsubscribe();
  });

  it('should break when next input is not consecutive', () => {
    const sampler = new InputSampler();
    //
    const sampledEvents: any[] = [];
    const sub = sampler.sampled$.subscribe({
      next: (it: any) => {
        sampledEvents.push(it);
      },
    });

    sampler.inputEvent(new InsertEvent(0, 'h'));
    sampler.inputEvent(new InsertEvent(1, 'e'));
    sampler.inputEvent(new InsertEvent(2, 'l'));
    sampler.inputEvent(new InsertEvent(3, 'l'));
    sampler.inputEvent(new InsertEvent(4, 'o'));
    sampler.inputEvent(new InsertEvent(0, 'n'));
    sampler.inputEvent(new InsertEvent(1, 'o'));
    sampler.inputEvent(new InsertEvent(2, ' '));

    assert.deepEqual(sampledEvents, [new InsertOperation(0, 'hello'), new InsertOperation(0, 'no ')]);

    sub.unsubscribe();
  });
});
