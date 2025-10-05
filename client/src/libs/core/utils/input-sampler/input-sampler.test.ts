import { describe, it } from 'node:test';
import { DeleteEvent, InputSampler, InsertEvent } from './input-sampler.class.ts';
import * as assert from 'node:assert';
import { InsertOperation } from '@operations-transformations-core/src/operations/insert.operation.ts';
import { DeleteOperation } from '@operations-transformations-core/src/operations/delete.operation.ts';

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

  it('should sample consecutive deletes as single delete event', () => {
    const sampler = new InputSampler();
    //
    const sampledEvents: any[] = [];
    const sub = sampler.sampled$.subscribe({
      next: (it: any) => {
        sampledEvents.push(it);
      },
    });

    sampler.inputEvent(new DeleteEvent(6, 1));
    sampler.inputEvent(new DeleteEvent(5, 1));
    sampler.inputEvent(new DeleteEvent(4, 1));
    sampler.inputEvent(new DeleteEvent(3, 1));
    sampler.inputEvent(new DeleteEvent(2, 1));
    sampler.inputEvent(new DeleteEvent(1, 1));
    sampler.inputEvent(new InsertEvent(1, 'helow'));
    sampler.inputEvent(new DeleteEvent(1, 1));
    sampler.inputEvent(new DeleteEvent(3, 1));
    sampler.unfocus();

    assert.deepEqual(sampledEvents, [
      new DeleteOperation(1, 6),
      new InsertOperation(1, 'helow'),
      new DeleteOperation(1, 1),
      new DeleteOperation(3, 1),
    ]);

    sub.unsubscribe();
  });

  it('should sample emit if more than 1 character deleted', () => {
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
    sampler.inputEvent(new DeleteEvent(1, 3));
    // sampler.unfocus();

    assert.deepEqual(sampledEvents, [
      new InsertOperation(0, 'hello'),
      new DeleteOperation(1, 3),
    ]);

    sub.unsubscribe();
  });

  it('should sample emit if more than 1 character deleted and previous too', () => {
    const sampler = new InputSampler();
    //
    const sampledEvents: any[] = [];
    const sub = sampler.sampled$.subscribe({
      next: (it: any) => {
        sampledEvents.push(it);
      },
    });


    sampler.inputEvent(new DeleteEvent(6, 1));
    sampler.inputEvent(new DeleteEvent(5, 1));
    sampler.inputEvent(new DeleteEvent(2, 3));

    assert.deepEqual(sampledEvents, [
      new DeleteOperation(5, 2),
      new DeleteOperation(2, 3),
    ]);

    sub.unsubscribe();
  });
});
