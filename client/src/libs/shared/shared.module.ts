import { ToggleComponent } from './components/toggle.component.ts';

export class SharedModule {
  static register() {
    [
      ToggleComponent,
    ].forEach((it) => it.register());
  }
}
