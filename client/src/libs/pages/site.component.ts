import { registerComponent, WebComponent } from '../web-utils/web-component/web-component';
import { DeleteEvent, InputSampler, InsertEvent, InsertSampler } from '../core/utils/input-sampler/input-sampler.class.ts';
import { Site } from '@operations-transformations-core/src/site/site.ts';
import { TimestampedOperation } from '@operations-transformations-core/src/operations/timestamped-operation.ts';

const templateString = `
<p id="state">on</p>
<p id="result"></p>
<div class="position-relative" style="border: 1px solid black">
<div  style="font-size: 14px; width: 300px; height: 200px; z-index: 1; color: transparent; font-family: monospace"  id="highlightBackdrop"></div>
<textarea class="border: none; position-absolute top-0 left-0" style="font-size: 14px;
    font-family: monospace;
    width: 300px;
    height: 200px;
    outline: none;
    padding: 0;
    z-index: 2;
    background: transparent;
    border: 0;
    overflow: auto;"  id="mainInput"></textarea>
</div>

<div id="sampledEvents" class="d-flex flex-column"></div>

<button id="togglestate">disconnect</button>
`;

export class SiteComponent extends WebComponent {

  site!: Site;

  state = true;

  storedOutgoingEvents: any[] = [];
  storedIncomingEvents: any[] = [];

  static register() {
    registerComponent({
      tagName: 'app-site',
      templateString: templateString,
      componentClass: SiteComponent,
    });
  }

  connectedCallback() {
    super.connectedCallback();

    this.getById('togglestate').onclick = () => {
      this.state = !this.state;
      if (this.state) {
        this.reemitEvents();
        this.replayEvents();
        this.getById('state').textContent = 'on';
        this.getById('togglestate').textContent = 'disconnect';
      }

      if (!this.state) {
        this.getById('state').textContent = 'off';
        this.getById('togglestate').textContent = 'connect';
      }
    };
    this.site = new Site(+this.getAttribute('siteId')!);
    // const sampledEvents = this.getById('sampledEvents');
    const sampler = new InputSampler();

    sampler.sampled$.subscribe({
      next: (sampledEvent: any) => {
        // sampledEvents!.textContent += (`${
        //   JSON.stringify(sampledEvent)
        // }`);
        if (!sampledEvent) {
          return;
        }
        this.emitRemoteEvent(this.site.addLocalOperation(sampledEvent));
        this.getById('result')!.innerText = this.site.produceResult();
      },
    });

    let prevValue: string | null = null;
    const input = this.getById('mainInput') as HTMLInputElement;


    let prevSelection: [number, number] | any = null;
    input.onbeforeinput = () => {
      prevSelection = [input.selectionStart, input.selectionEnd];
      prevValue = input.value;
    };

    (input!.oninput as any) = (event: InputEvent) => {
      const currentSelection = [input.selectionStart, input.selectionEnd];
      if (event.inputType === 'insertText') {
        sampler.inputEvent(new InsertEvent(prevSelection[0]!, event.data!));
        this.updateBackdrop(sampler);
      }

      if (event.inputType === 'deleteContentBackward') {
        sampler.inputEvent(new DeleteEvent(currentSelection[0]!, prevSelection[1]! - currentSelection[1]!, prevValue!.substring(prevSelection[1]!, currentSelection[1]!)));
      }

      if (event.inputType === 'insertFromPaste') {

      }

      if (event.inputType === 'insertReplacementText') {

      }
    };

    input.onblur = () => {
      sampler.unfocus();
    };
  }

  updateBackdrop(sampler: InputSampler) {
    const backdrop = this.getById('highlightBackdrop')!;
    const input = this.getById('mainInput') as HTMLInputElement;

    if (sampler.eventSampler instanceof InsertSampler) {
      const current = sampler.eventSampler.getCurrent();
      const inputvalue = input.value!;
      if (current) {
        backdrop.innerHTML = '';
        backdrop.innerHTML += inputvalue.substring(0, current.getPosition());
        backdrop.innerHTML += `<span style="background: lawngreen">${inputvalue.substring(current.getPosition(), current.getPosition() + current.getInsertString().length)}</span>`;
        backdrop.innerHTML += inputvalue.substring(current.getPosition() + current.getInsertString().length, inputvalue.length);
      } else {
        backdrop.innerHTML = '';
      }
    }
  }

  replayEvents() {
    this.storedIncomingEvents.forEach((it) => this.remoteEvent(it));
    this.storedIncomingEvents = [];

  }

  reemitEvents() {
    this.storedOutgoingEvents.forEach((event) => this.emitRemoteEvent(event));
    this.storedOutgoingEvents = [];
  }

  remoteEvent(event: TimestampedOperation) {
    if (!this.state) {
      this.storedIncomingEvents.push(event);
      return;
    }

    this.site.addRemoteOperation(event);
    this.getById('result')!.innerText = this.site.produceResult();
    (this.getById('mainInput') as HTMLInputElement)!.value = this.site.produceResult();
  }

  emitRemoteEvent(event: TimestampedOperation) {
    if (!this.state) {
      this.storedOutgoingEvents.push(event);
      return;
    }

    this.dispatchEvent(new CustomEvent('remoteEvent', {
      detail: event,
    }));
  }
}
