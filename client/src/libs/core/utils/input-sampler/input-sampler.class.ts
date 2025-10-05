import { Observable } from '../../../web-utils/reactivity/observable.js';
import { InsertOperation } from '@operations-transformations-core/src/operations/insert.operation.ts';
import { DeleteOperation } from '@operations-transformations-core/src/operations/delete.operation.ts';

enum SampleEventType {
  Insert,
  Delete
}

type Operation = InsertOperation | DeleteOperation;

interface Sampler {
  sampleEventType: SampleEventType;

  inputEvent(event: DeleteEvent | InsertEvent): Operation | Operation[] | null;

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


  unfocus() {
    if (this.eventSampler) {
      this.sampled$.next(this.eventSampler.getCurrent());
      this.eventSampler = null;
    }
  }

  inputEvent(event: DeleteEvent | InsertEvent) {
    if (this.eventSampler == null) {
      this.eventSampler = createSampler(event.type);
      this.addEvent(event);
      return;
    }

    if (this.eventSampler.sampleEventType !== event.type) {
      if (this.eventSampler.getCurrent()) {
        this.sampled$.next(this.eventSampler.getCurrent());
      }
      this.eventSampler = createSampler(event.type);
      this.addEvent(event);
      return;
    }

    this.addEvent(event);
  }

  private addEvent(event: DeleteEvent | InsertEvent) {
    const sampled = this.eventSampler!.inputEvent(event);
    if (sampled) {
      if (sampled instanceof Array) {
        sampled.forEach((it) => this.sampled$.next(it));
      } else {
        this.sampled$.next(sampled);
      }
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
    this.currentSamplingPosition = event.position;
    this.currentSampledCharacters.push(event.insertString);
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


  currentSamplingPosition: number | null = null;
  currentDeleteCounter: number | null = null;

  inputEvent(event: DeleteEvent): DeleteOperation | DeleteOperation[] | null {
    console.log('delete sampler here');

    if (event.amount > 1) {
      const current = this.getCurrent();
      this.clear();
      const newOperation = new DeleteOperation(event.position, event.amount);
      if (current) {
        return [current, newOperation];
      }
      return newOperation;
    }

    if (this.currentSamplingPosition == null) {
      this.beginSampling(event);
      return null;
    }

    const isPreviousCharacter = event.position + event.amount === (this.currentSamplingPosition);
    const isEmptySpace = event.deleteString === ' ';
    if (isPreviousCharacter) {
      this.currentDeleteCounter! += event.amount;
      this.currentSamplingPosition = event.position;
      if (isEmptySpace) {
        const operation = this.getCurrent();
        this.clear();
        return operation;
      }
      return null;
    }


    const operation = this.getCurrent();
    this.clear();
    this.beginSampling(event);
    return operation;
  }

  private beginSampling(event: DeleteEvent) {
    this.currentSamplingPosition = event.position;
    this.currentDeleteCounter = 1;
  }

  clear() {
    this.currentSamplingPosition = null;
    this.currentDeleteCounter = null;
  }

  getCurrent(): DeleteOperation | null {
    if (this.currentSamplingPosition == null) {
      return null;
    }
    return new DeleteOperation(this.currentSamplingPosition, this.currentDeleteCounter!);
  }
}

export class DeleteEvent {
  public type = SampleEventType.Delete;

  constructor(
    public position: number,
    public amount: number,
    public deleteString?: string,
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
