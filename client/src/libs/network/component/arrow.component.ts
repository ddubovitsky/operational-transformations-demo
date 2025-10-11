import { registerComponent, WebComponent } from '../../web-utils/web-component/web-component';
import { proxyViewBound } from '../../web-utils/reactivity/signal-ui-bound';

const templateString = `
<div class="lh-1" id="arrows-container" style=" height: 22px;   width: 16px;
    overflow: hidden;
}">
     <img style="margin-left: -4px; margin-top: -1px" bind-if="red" id="redArrow" src="/images/arrow-down-solid-red.svg">
     <img style="margin-left: -4px; margin-top: -1px" bind-if="green" id="greenArrow" src="/images/arrow-down-solid-green.svg">
</div>
`;

export class ArrowComponent extends WebComponent {

  state = proxyViewBound({
    green: true,
    red: false,
  });

  static register() {
    registerComponent({
      tagName: 'app-arrow',
      templateString: templateString,
      componentClass: ArrowComponent,
    });
  }

  playScaleAnimation(): Promise<void> {
    return animateScale(this.getById('arrows-container')!);
  }

  enable() {
    this.toggleGreen(true)
  }

  disable() {
    this.toggleGreen(false)
  }

  public toggleGreen(isGreen: boolean) {
    this.state.green = isGreen;
    this.state.red = !isGreen;
  }
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
