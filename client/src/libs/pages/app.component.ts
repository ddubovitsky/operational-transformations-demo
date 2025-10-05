import { registerComponent, WebComponent } from '../web-utils/web-component/web-component';
import { SiteComponent } from './site.component.ts';

const templateString = `
<div class="d-flex flex-row w-100">
<app-site id="site1" siteId="1"></app-site>
<app-site id="site2" siteId="2"></app-site>
</div>

`;

export class AppComponent extends WebComponent {

  static register() {
    registerComponent({
      tagName: 'app-main',
      templateString: templateString,
      componentClass: AppComponent,
    });
  }

  connectedCallback() {
    super.connectedCallback();
    const sites = [this.getById('site1'), this.getById('site2')];

    sites.forEach((it) => {
      it?.addEventListener('remoteEvent', (event) => {
        sites.forEach((otherSite) => {
          if (otherSite !== it) {
            (otherSite as SiteComponent).remoteEvent((event as CustomEvent).detail);
          }
        });
      });
    });
  }
}
