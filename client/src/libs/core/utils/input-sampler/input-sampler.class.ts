import { Observable } from '../../../web-utils/reactivity/observable.js';
import { InsertOperation } from '@operations-transformations-core/src/operations/insert.operation.ts';
import { DeleteOperation } from '@operations-transformations-core/src/operations/delete.operation.ts';

enum SampleEventType {
  Insert,
  Delete
}

interface Sampler {
  sampleEventType: SampleEventType;

  inputEvent(event: DeleteEvent | InsertEvent): InsertOperation | DeleteOperation | null;

  getCurrent(): InsertOperation | DeleteOperation | null;
}

function createSampler(type: SampleEventType): Sampler {
  if (type === SampleEventType.Insert) {
    return new InsertSampler();
  }

  if (type === SampleEventType.Delete) {
    return new DeleteSampler();
  }
  throw 'unexpected sampler type';
}

export class InputSampler {
  sampled$ = new Observable();


  eventSampler: Sampler | null = null;

  inputEvent(event: DeleteEvent | InsertEvent) {
    if (this.eventSampler == null) {
      this.eventSampler = createSampler(event.type);
      this.eventSampler.inputEvent(event);
      return;
    }

    if (this.eventSampler.sampleEventType !== event.type) {
      if (this.eventSampler.getCurrent()) {
        this.sampled$.next(this.eventSampler.getCurrent());
      }
      this.eventSampler = createSampler(event.type);
      this.eventSampler.inputEvent(event);
      return;
    }

    const sampled = this.eventSampler.inputEvent(event);
    if (sampled) {
      this.sampled$.next(sampled);
    }
  }
}

class InsertSampler implements Sampler {
  public sampleEventType = SampleEventType.Insert;

  currentSamplingPosition: number | null = null;
  currentSampledCharacters: string[] = [];

  inputEvent(event: InsertEvent): InsertOperation | null {
    if (this.currentSamplingPosition == null) {
      this.beginSampling(event);
      return null;
    }

    const isNextCharacter = event.position === (this.currentSamplingPosition + this.currentSampledCharacters.length);
    if (event.insertString === ' ' && isNextCharacter) {
      this.currentSampledCharacters.push(event.insertString);
      const operation = this.getCurrent();
      this.clear();
      console.log('return operation', operation);
      return operation;
    }

    if (isNextCharacter) {
      this.currentSampledCharacters.push(event.insertString);
      return null;
    }

    const operation = this.getCurrent();
    this.clear();
    this.beginSampling(event);
    return operation;
  }

  private beginSampling(event: InsertEvent) {
    console.log('begin');
    this.currentSamplingPosition = event.position;
    this.currentSampledCharacters.push(event.insertString);
    console.log(this.currentSamplingPosition, event.position);
  }

  clear() {
    this.currentSamplingPosition = null;
    this.currentSampledCharacters = [];
  }

  getCurrent(): InsertOperation | null {
    if (this.currentSamplingPosition == null) {
      return null;
    }
    return new InsertOperation(this.currentSamplingPosition, this.currentSampledCharacters.join(''));
  }
}


class DeleteSampler implements Sampler {
  public sampleEventType = SampleEventType.Delete;

  inputEvent(event: DeleteEvent): DeleteOperation | null {
    return null;
  }

  getCurrent(): DeleteOperation | null {
    return null;
  }

}

export class DeleteEvent {
  public type = SampleEventType.Delete;

  constructor(
    public position: number,
    public amount: number,
  ) {
  }


}

export class InsertEvent {
  public type = SampleEventType.Insert;

  constructor(
    public position: number,
    public insertString: string,
  ) {
  }
}
