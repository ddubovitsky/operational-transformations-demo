import { registerComponent, WebComponent } from '../../web-utils/web-component/web-component';
import { DeleteSampler, InputSampler, InsertSampler, Sampler } from '../../core/utils/input-sampler/input-sampler.class.ts';
import { TimestampedOperation } from '@operations-transformations-core/src/operations/timestamped-operation.ts';
import { SiteNetworkState } from './site-network/siteNetworkState.ts';
import { InputMapper } from './util/input-mapper.class.ts';

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
          // this.updateBackdrop(sampler);
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
    backdrop.innerHTML = createBackdropContent(
      sampler.eventSampler!,
      (this.getById('mainInput') as HTMLInputElement).value,
      (backdrop as HTMLDivElement)!,
    );
  }

  onRemoteEvent(event: TimestampedOperation) {
    this.state.addRemoteOperation(event);
  }

  emitRemoteEvent(event: TimestampedOperation) {
    this.dispatchEvent(new CustomEvent('remoteEvent', {
      detail: event,
    }));
  }
}

function createBackdropContent(sampler: Sampler, inputvalue: string, div: HTMLDivElement): string {
  let content = '';
  if (sampler instanceof InsertSampler) {
    const current = sampler.getCurrent();
    if (current) {
      content = '';
      content += inputvalue.substring(0, current.getPosition());
      content += `<span style="background: lawngreen">${inputvalue.substring(current.getPosition(), current.getPosition() + current.getInsertString().length)}</span>`;
      content += inputvalue.substring(current.getPosition() + current.getInsertString().length, inputvalue.length);
    } else {
      content = '';
    }
  }

  if (sampler instanceof DeleteSampler) {
    const current = sampler.getCurrent();
    if (current) {
      content = '';
      content += inputvalue.substring(0, current.getPositionStart());
      content += `<span currentString="${sampler.currentRemoveString}" class="delete-span" style="background: #FF4B4B; display: inline-block;width: 2px;height: 1rem;"></span>`;
      content += inputvalue.substring(current.getPositionStart(), inputvalue.length);
    } else {
      content = '';
    }
  }

  return content;
}
