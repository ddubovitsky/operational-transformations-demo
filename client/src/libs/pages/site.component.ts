import { registerComponent, WebComponent } from '../web-utils/web-component/web-component';
import { InputSampler, InsertSampler } from '../core/utils/input-sampler/input-sampler.class.ts';
import { TimestampedOperation } from '@operations-transformations-core/src/operations/timestamped-operation.ts';
import { SiteNetworkState } from './siteNetworkState.ts';
import { InputMapper } from './input-mapper.class.ts';

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


  state = new SiteNetworkState();

  static register() {
    registerComponent({
      tagName: 'app-site',
      templateString: templateString,
      componentClass: SiteComponent,
    });
  }

  connectedCallback() {
    super.connectedCallback();

    this.state.initSite(+this.getAttribute('siteId')!);

    const sampler = new InputSampler();
    const inputMapper = new InputMapper(this.getById('mainInput')! as HTMLInputElement);

    inputMapper.events$.subscribe({
      next: (it: any) => {
        if (it === null) {
          sampler.unfocus();
          return;
        }
        sampler.inputEvent(it);
        this.updateBackdrop(sampler);
      },
    });

    sampler.sampled$.subscribe({
      next: (sampledEvent: any) => {
        if (!sampledEvent) {
          return;
        }
        this.state.addLocalOperation(sampledEvent);
      },
    });

    this.state.emitOperation$.subscribe({
      next: (it: any) => {
        this.emitRemoteEvent(it);
      },
    });

    this.state.siteUpdated$.subscribe(({
      next: (it: any) => {
        (this.getById('mainInput')! as HTMLInputElement).value = it;
      },
    }));
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

  remoteEvent(event: TimestampedOperation) {
    this.state.addRemoteOperation(event);
  }

  emitRemoteEvent(event: TimestampedOperation) {
    this.dispatchEvent(new CustomEvent('remoteEvent', {
      detail: event,
    }));
  }
}
