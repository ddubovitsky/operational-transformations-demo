import { registerComponent, WebComponent } from '../web-utils/web-component/web-component';

const templateString = `
helow
`;

export class AppComponent extends WebComponent {

  static register() {
    registerComponent({
      tagName: 'app-main',
      templateString: templateString,
      componentClass: AppComponent,
    });
  }
}
