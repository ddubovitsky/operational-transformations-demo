import { registerComponent, WebComponent } from '../../web-utils/web-component/web-component';

const templateString = `
<style>
body {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #2f3a4a;
}

/* Outer toggle track */
.toggle {
  position: relative;
  width: 40px;
  height: 24px;
  border: 1px solid #979797;
  background: #ccc;
  border-radius: 16px;
  transition: background 0.3s ease;
  cursor: pointer;
}

/* Knob inside toggle */
.toggle-knob {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transition: left 0.3s ease, background 0.3s ease;
}

/* ON state */
.toggle.active {
  background: #4caf50;
}

.toggle.active .toggle-knob {
  left: 20px;
  background: #fff;
}

</style>
<div class="toggle active" id="toggle">
    <div class="toggle-knob"></div>
  </div>
`;

export class ToggleComponent extends WebComponent {

  static register() {
    registerComponent({
      tagName: 'app-toggle',
      templateString: templateString,
      componentClass: ToggleComponent,
    });
  }

  connectedCallback() {
    super.connectedCallback();
    const toggle = this.getById('toggle')!;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      this.dispatchEvent(new CustomEvent('toggled', { detail: toggle.classList.contains('active') }));
    });
  }
}
