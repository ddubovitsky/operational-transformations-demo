import { registerComponent, WebComponent } from '../web-utils/web-component/web-component';
import { DeleteSampler, InputSampler, InsertSampler, Sampler } from './input-sampler/input-sampler.class.ts';
import { TimestampedOperation } from '@operations-transformations-core/src/operations/timestamped-operation.ts';
import { SiteOperationsRecorder } from './site-state/site-operations-recorder.ts';
import { InputMapper } from './util/input-mapper.class.ts';
import { AnimationsPlayer } from './animations-player/animations-player.ts';
import { Operation } from '@operations-transformations-core/src/operations/operation.interface.ts';
import { SiteNetworkInterface } from '../network/class/sites-network.class.ts';
import { InsertOperation } from '@operations-transformations-core/src/operations/insert.operation.ts';
import { DeleteOperation } from '@operations-transformations-core/src/operations/delete.operation.ts';
import { JointDeleteOperation } from '@operations-transformations-core/src/operations/joint-delete.operation.ts';

const templateString = `
<style>
   .step {
   background: #B6B6B6;
   border: 1px solid #979797;
   padding: 0px 16px;
   border-radius: 40px;
   font-size: 20px;
   font-weight: 500;
   }
   .socket-block {
   border: 1px solid #979797;
   padding: 4px 12px;
   font-size: 20px;
   background: #D8D8D8;
   font-weight: bold;
   }
   .main-container {
   border-top-left-radius: 0;
   }
   .top-container {
   border-bottom: 1px solid var(--ch-gray);
   margin-bottom: -1px;
   border-bottom-right-radius: 0;
   border-bottom-left-radius: 0;
   }
   .offline .top-container {
   border-color: red !important;
   border-bottom: none;
   }
   .offline.main-container {
   border-color: red !important;
   }
   
   #highlightBackdrop span {
    font-family: monospace;
   }
</style>
<div class="d-flex flex-row position-relative " style="z-index: 2" bindClass class.offline="notConnected">
   <div class="gap-2 bg-gray border-black rounded-1 top-container d-flex flex-row px-3" style="padding-top: 12px">
      <p class="m-0" bind-text="siteName"></p>
   </div>
   <div class="flex-fill top-container-ghost d-flex flex-row align-items-end justify-content-between">
      <div id="incoming" class="d-inline-block socket-block ms-2 rounded-1 mb-2">
      IN
      </div>
      <div id="outgoing" class="d-inline-block socket-block rounded-1 mb-2">
      OUT
      </div>
   </div>
</div>
</div>
<div class="bg-gray border-black rounded-1 p-3 main-container position-relative" bindClass class.offline="notConnected">
   <div class="d-flex flex-column gap-5">
      <div class="d-flex flex-row gap-6 mt-4 mb-3">
         <div style="min-width: 110px" id="pending" class="step text-center"><span class="" id="pendingAmount">Pending: 0</span></div>
         <div id="preconditions" class="step">preconditions</div>
         <div id="transform" class="step">transform</div>
      </div>
   </div>
   <p id="result"></p>
   <div class="position-relative" style="border: 1px solid black">
      <div style="padding: 4px; white-space: pre-wrap; font-size: 14px; width: 488px; height: 200px; z-index: 1; background: white; color: black; font-family: monospace" id="highlightBackdrop"></div>
      <textarea class="border: none; position-absolute top-0 left-0" style="font-size: 14px;
         font-family: monospace;
         width: 488px;
         height: 200px;
         outline: none;
         padding: 4px;
         z-index: 2;
         background: transparent;
         border: 0;
         overflow: auto;" id="mainInput"></textarea>
   </div>
   <div id="sampledEvents" class="d-flex flex-column"></div>
   <div class="position-absolute" style="left: 244px; top: 0;">
      <div class="position-relative">
         <img class="position-absolute top-0 left-0" src="/images/arrow-down-solid-full.svg">
         <img style="opacity: 0" id="arrowIncomingConditions" class="position-absolute top-0 left-0" src="/images/arrow-down-solid-green.svg">
      </div>
   </div>
   <div class="position-absolute" style="left: 346px; top: 29px;">
      <div class="position-relative">
         <img class="position-absolute top-0 left-0" src="/images/arrow-right-solid-full.svg">
         <img style="opacity: 0" id="arrowConditionsTransform" class="position-absolute top-0 left-0" src="/images/arrow-right-solid-green.svg">
      </div>
   </div>
   <div class="position-absolute" style="left: 422px;top: 58px;">
      <div class="position-relative">
         <img class="position-absolute top-0 left-0" src="/images/arrow-down-solid-full.svg">
         <img style="opacity: 0" id="arrowApply" class="position-absolute top-0 left-0" src="/images/arrow-down-solid-green.svg">
      </div>
   </div>
   
    <div class="position-absolute" style="left: 156px; top: 29px;">
      <div class="position-relative">
         <img class="position-absolute top-0 left-0" src="/images/arrows-left-right-solid-full.svg">
         <img style="opacity: 0" id="arrowPendingPreconditions" class="position-absolute top-0 left-0" src="/images/arrows-left-right-solid-green.svg">
      </div>
   </div>
</div>
`;

export class SiteComponent extends WebComponent implements SiteNetworkInterface {


  networkState = new SiteOperationsRecorder();
  state = this.networkState.state;

  static register() {
    registerComponent({
      tagName: 'app-site',
      templateString: templateString,
      componentClass: SiteComponent,
    });
  }

  get siteId() {
    return +this.getAttribute('siteId')!;
  }

  playOperation(operation: TimestampedOperation): void {
    this.networkState.addRemoteOperation(operation);
  }

  connectedCallback() {
    super.connectedCallback();

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
      playReceived: (operation: Operation, amount: number) => {
        return delay(200).then(
          () => {
            return animateScale(
              this.getById('incoming')!,
            );
          },
        );
      },
      playSent: (operation: Operation, amount) => {
        return animateScale(
          this.getById('outgoing')!,
        );
      },

      playPreconditions: (operation: Operation) => {
        return animateRevealFromTop(this.getById('arrowIncomingConditions')!).then(() => {
          return animateScale(
            this.getById('preconditions')!,
          );
        });
      },
      playStored: (operation: Operation, amount) => {
        animateRevealFromRight(this.getById('arrowPendingPreconditions')).then(() => {
          this.getById('pendingAmount').innerText = `Pending: ${amount}`;
          return animateScale(
            this.getById('pending')!,
          );
        });
      },
      playPreconditionsFromStore: (operation: Operation) => {
        return animateRevealFromLeft(this.getById('arrowPendingPreconditions'));
      },
      playUnstored: (operation: Operation, amount: number) => {
        this.getById('pendingAmount').innerText = `Pending: ${amount}`;
        return animateScale(
          this.getById('pending')!,
        );
      },
      playTransform: (operation: Operation) => {
        return animateRevealFromLeft(this.getById('arrowConditionsTransform')!).then(() => {
          return animateScale(
            this.getById('transform')!,
          );
        });

      },
      playApply: (operation: TimestampedOperation, result: string) => {
        return animateRevealFromTop(this.getById('arrowApply')!).then(() => {
          this.updateBackdropOperation(operation.operation);
          return delay(500).then(() => {
            (this.getById('mainInput')! as HTMLInputElement).value = result;
            this.resetBackdrop();
            return Promise.resolve();
          })

        });
      },
    });

    this.networkState.events$.subscribe({
      next: (newEvents) => {
        player.playEvents(newEvents);
      },
    });

  }

  updateBackdropOperation(operation: Operation) {
    const backdrop = this.getById('highlightBackdrop')!;
    backdrop.innerHTML = createBackdropContentForOperation(
      operation!,
      (this.getById('mainInput') as HTMLInputElement).value,
    );
  }

  resetBackdrop() {
    const backdrop = this.getById('highlightBackdrop')!;
    backdrop.innerHTML = (this.getById('mainInput') as HTMLInputElement).value;
  }

  updateBackdrop(sampler: InputSampler) {
    const backdrop = this.getById('highlightBackdrop')!;
    backdrop.innerHTML = createBackdropContent(
      sampler.eventSampler!,
      (this.getById('mainInput') as HTMLInputElement).value,
    );
  }

  emitRemoteEvent(event: TimestampedOperation) {
    this.dispatchEvent(new CustomEvent('remoteEvent', {
      detail: event,
    }));
  }
}

function createBackdropContent(sampler: Sampler, inputvalue: string): string {
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
      content += `<span currentString="${sampler.currentRemoveString}" class="delete-span" style="background: #FF4B4B; display: inline-block;width: 2px;"></span>`;
      content += inputvalue.substring(current.getPositionStart(), inputvalue.length);
    } else {
      content = '';
    }
  }

  return content;
}


function createBackdropContentForOperation(operation: Operation, inputvalue: string): string {
  let content = '';
  if (operation instanceof DeleteOperation) {
    if (operation) {
      content = '';
      content += inputvalue.substring(0, operation.getPositionStart());
      content += `<span style="background: #FF4B4B">${inputvalue.substring(operation.getPositionStart(), operation.getPositionStart() + operation.getAmount())}</span>`;
      content += inputvalue.substring(operation.getPositionStart() + operation.getAmount(), inputvalue.length);
    } else {
      content = '';
    }
  }

  if (operation instanceof InsertOperation) {
    const current = operation.getInsertString();
    if (current) {
      content = '';
      content += inputvalue.substring(0, operation.getPosition());
      content += `<span currentString="${current}" class="insert-span" style="background: lawngreen; display: inline-block;width: 2px;"></span>`;
      content += inputvalue.substring(operation.getPosition(), inputvalue.length);
    } else {
      content = '';
    }
  }

  if (operation instanceof JointDeleteOperation) {
    let current = operation.first;
    if (current) {
      content = '';
      content += inputvalue.substring(0, operation.first.getPositionStart());
      content += `<span style="background: #FF4B4B">${inputvalue.substring(operation.first.getPositionStart(), operation.first.getPositionStart() + operation.first.getAmount())}</span>`;
      content += inputvalue.substring(operation.first.getPositionStart() + operation.first.getAmount(), operation.second.getPositionStart());
      content += `<span style="background: #FF4B4B">${inputvalue.substring(operation.second.getPositionStart(), operation.second.getPositionStart() + operation.second.getAmount())}</span>`;
      content += inputvalue.substring(operation.second.getPositionStart() + operation.second.getAmount(), inputvalue.length);
    } else {
      content = '';
    }
  }

  return content;
}

function animateScale(element: HTMLElement, scale = 1.2, duration = 200): Promise<void> {
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

function animateRevealFromLeft(element: HTMLElement, duration = 150) {
  return new Promise((resolve) => {
    // Ensure element is visible and clipping is enabled
    element.style.opacity = 1 + '';

    const animation = element.animate(
      [
        { clipPath: 'inset(0 100% 0 0)' }, // Fully hidden (covered from right)
        { clipPath: 'inset(0 0% 0 0)', offset: 1 },
      ],
      {
        duration: duration,
        easing: 'ease-out',
        fill: 'forwards',
      },
    );

    animation.onfinish = () => {
      element.style.opacity = 0 + '';
      resolve(true);
    };
  });
}


function animateRevealFromRight(element: HTMLElement, duration = 150) {
  return new Promise((resolve) => {
    // Ensure element is visible and clipping is enabled
    element.style.opacity = 1 + '';

    const animation = element.animate(
      [
        { clipPath: 'inset(0 0 0 100%)' }, // Fully hidden (covered from right)
        { clipPath: 'inset(0 0 0 0%)', offset: 1 },
      ],
      {
        duration: duration,
        easing: 'ease-out',
        fill: 'forwards',
      },
    );

    animation.onfinish = () => {
      element.style.opacity = 0 + '';
      resolve(true);
    };
  });
}

function animateRevealFromTop(element: HTMLElement, duration = 200) {
  return new Promise((resolve) => {
    // Ensure element is visible and clipping is enabled
    element.style.opacity = 1 + '';

    const animation = element.animate(
      [
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', offset: 1 },
      ],
      {
        duration: duration,
        easing: 'ease-out',
        fill: 'forwards',
      },
    );

    animation.onfinish = () => {
      element.style.opacity = 0 + '';
      resolve(true);
    };
  });
}

function delay(timeout: number) {
  return new Promise(resolve => setTimeout(() => resolve(null), timeout));
}
