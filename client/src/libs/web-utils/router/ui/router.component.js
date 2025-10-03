import { registerComponent, WebComponent } from '../../web-component/web-component.js';
import { ROUTER_SERVICE } from '../service/router.service.js';

const templateString = `
<div class="h-100" id="router-outlet">
<!--Router init-->
</div>
`

export class AppRouterComponent extends WebComponent {
    static register() {
        registerComponent({
            tagName: "app-router",
            templateString: templateString,
            componentClass: AppRouterComponent
        })
    }

    connectedCallback() {
        super.connectedCallback()
        const outlet = this.getById("router-outlet")
        ROUTER_SERVICE.onInitialized.subscribe({
            next: () => {
                this.subscription = ROUTER_SERVICE.selectedComponentTag$.subscribe({
                    next: tag => {
                        outlet.childNodes[0].replaceWith(document.createElement(tag))
                    }
                })
            }
        })
    }

    disconnectedCallback() {
        this.subscription.unsubscribe()
    }
}
