import { ArrowComponent } from './component/arrow.component.ts';
import { NetworkConnectionComponent } from './component/network-connection.component.ts';

export class NetworkModule {
  static register() {
    [
      ArrowComponent,
      NetworkConnectionComponent,
    ].forEach((it) => it.register());
  }
}
