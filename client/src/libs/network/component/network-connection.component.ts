import { registerComponent, WebComponent } from '../../web-utils/web-component/web-component';
import { ArrowComponent } from './arrow.component.ts';

const templateStringHorizontal = `
<div  class="d-flex flex-row align-items-center gap-3">
<span id="leftCounter" class="fs-20 fw-normal text-secondary">1</span>
<div class="d-flex flex-row">
<app-arrow id="leftArrow"></app-arrow>
<app-arrow id="rightArrow" class="rotate-180"></app-arrow>
</div>

<span id="rightCounter" class="fs-20 fw-normal text-secondary">2</span>
<app-toggle class="ms-2" id="toggle"></app-toggle>
</div>
`;

const templateStringVertical = `
<div  class="d-flex flex-column align-items-center gap-3">
<span id="leftCounter" class="fs-20 fw-normal text-secondary">1</span>
<div class="d-flex flex-row rotate-90">
<app-arrow id="leftArrow"></app-arrow>
<app-arrow id="rightArrow" class="rotate-180"></app-arrow>
</div>

<span id="rightCounter" class="fs-20 fw-normal text-secondary">2</span>
<app-toggle class="ms-2" id="toggle"></app-toggle>
</div>
`;


const templateStringDiagonal = `
<div  class="d-flex flex-column align-items-center gap-3 rotate-m-45">
<span id="leftCounter" class="fs-20 fw-normal text-secondary rotate-45">1</span>
<div class="d-flex flex-row rotate-90">
<app-arrow id="leftArrow"></app-arrow>
<app-arrow id="rightArrow" class="rotate-180"></app-arrow>
</div>

<span id="rightCounter" class="fs-20 fw-normal text-secondary rotate-45">2</span>
<app-toggle class="ms-2" id="toggle"></app-toggle>
</div>
`;

export class NetworkConnectionComponent extends WebComponent {


  static register() {
    registerComponent({
      tagName: 'app-network-connection',
      templateString: '<div id="content"></div>',
      componentClass: NetworkConnectionComponent,
    });
  }

  connectedCallback() {
    super.connectedCallback();

    const position = this.getAttribute('position');
    if (position == 'horizontal') {
      this.getById('content')!.innerHTML = templateStringHorizontal;
    }

    if (position == 'vertical') {
      this.getById('content')!.innerHTML = templateStringVertical;
    }

    if (position == 'diagonal') {
      this.getById('content')!.innerHTML = templateStringDiagonal;
    }

    this.getById('toggle')!.addEventListener('toggled', (event) => {
      const customEvent = event as CustomEvent;
      (this.getById('leftArrow') as ArrowComponent)!.toggleGreen(customEvent.detail);
      (this.getById('rightArrow') as ArrowComponent)!.toggleGreen(customEvent.detail);
      this.dispatchEvent(new CustomEvent('connectionStateChange', { detail: customEvent.detail }));
    });
  }
}
