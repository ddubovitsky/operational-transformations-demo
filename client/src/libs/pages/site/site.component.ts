import { registerComponent, WebComponent } from '../../web-utils/web-component/web-component';
import { DeleteSampler, InputSampler, InsertSampler, Sampler } from '../../core/utils/input-sampler/input-sampler.class.ts';
import { TimestampedOperation } from '@operations-transformations-core/src/operations/timestamped-operation.ts';
import { SiteNetworkState } from './site-network/siteNetworkState.ts';
import { InputMapper } from './util/input-mapper.class.ts';
import { AnimationsPlayer } from './animations-player/animations-player.ts';
import { Operation } from '@operations-transformations-core/src/operations/operation.interface.ts';

const templateString = `

<div>
<p bind-if="connected" id="state">on</p>
<p bind-if="notConnected">off</p>
</div>


<div class="d-flex flex-column gap-5">
<div id="incoming" class="operation-div">incoming</div>
<div class="d-flex flex-row gap-5">
<div id="pending" class="operation-div">pending</div>
<div id="preconditions" class="operation-div">preconditions</div>
<div id="transform" class="operation-div">transform</div>
</div>
</div>
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


  networkState = new SiteNetworkState();
  state = this.networkState.state;

  static register() {
    registerComponent({
      tagName: 'app-site',
      templateString: templateString,
      componentClass: SiteComponent,
    });
  }

  connectedCallback() {
    super.connectedCallback();

    this.getById('togglestate')!.onclick = () => {
      this.networkState.toggleConnectivity(!this.state.connected);
    };
    this.networkState.initSite(+this.getAttribute('siteId')!);

    const sampler = new InputSampler();
    const inputMapper = new InputMapper(this.getById('mainInput')! as HTMLInputElement);

    inputMapper.events$.subscribe({
      next: (it: any) => {
        if (it === null) {
          sampler.unfocus();
          this.updateBackdrop(sampler);
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
        this.networkState.addLocalOperation(sampledEvent);
      },
    });

    this.networkState.emitOperation$.subscribe({
      next: (it: any) => {
        this.emitRemoteEvent(it);
      },
    });

    this.networkState.siteUpdated$.subscribe(({
      next: (it: any) => {
        // (this.getById('mainInput')! as HTMLInputElement).value = it;
      },
    }));


    const player = new AnimationsPlayer({
      playReceived: (operation: Operation) => {
        return animateScale(
          this.getById('incoming')!,
        );
      },
      playPreconditions: (operation: Operation) => {
        return animateScale(
          this.getById('preconditions')!,
        );
      },
      playStored: (operation: Operation) => {
        return animateScale(
          this.getById('pending')!,
        );
      },
      playUnstored: (operation: Operation) => {
        return animateScale(
          this.getById('pending')!,
        );
      },
      playTransform: (operation: Operation) => {
        return animateScale(
          this.getById('transform')!,
        );
      },
      playApply: (operation: Operation, result: string) => {
        (this.getById('mainInput')! as HTMLInputElement).value = result;
        return Promise.resolve();
      },
    });

    this.networkState.events$.subscribe({
      next: (newEvents) => {
        player.playEvents(newEvents);
      },
    });

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
    this.networkState.addRemoteOperation(event);
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

function animateScale(element: HTMLElement, scale = 1.2, duration = 300): Promise<void> {
  return new Promise((resolve) => {
    const animation = element.animate(
      [
        { transform: 'scale(1)', offset: 0 },
        { transform: `scale(${scale})`, offset: 0.5 },
        { transform: 'scale(1)', offset: 1 },
      ],
      {
        duration,
        easing: 'ease-in-out',
      },
    );

    animation.onfinish = () => resolve();
  });
}
