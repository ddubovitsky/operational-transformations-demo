import { addBindings } from '../dom/create-mapped-template.js';


const TAG_NAME_TO_FRAGMENT_MAP = new Map()

export class WebComponent extends HTMLElement {
    constructor() {
        super()
        this.shadow = this.attachShadow({ mode: "open" })
        // console.log(TAG_NAME_TO_FRAGMENT_MAP, this.tagName)
        // console.log("tagName = ", this.tagName)
        this.shadow.appendChild(
            TAG_NAME_TO_FRAGMENT_MAP.get(
                this.tagName.toLowerCase()
            ).parsedTemplate.content.cloneNode(true)
        )
    }

    controller = new AbortController();
    destroyedSignal = this.controller.signal;

    connectedCallback() {
        console.log("connected element")
        addBindings(this.shadow, this.state)
    }

    disconnectedCallback() {
        console.log("disconnected element")
        this.controller.abort('Component has been disconnected');
    }

    adoptedCallback() {
        console.log("adoptedCallback element")
    }

    attributeChangedCallback() {
        console.log("attributeChangedCallback element")
    }

    getById(id) {
        return this.shadowRoot.getElementById(id)
    }

}

const globalStyles = document.createElement('link');
globalStyles.type = 'text/css';
globalStyles.rel = 'stylesheet';
globalStyles.href = 'style/style.css'

export function registerComponent(config) {
    const templateElement = document.createElement("template")
    templateElement.innerHTML = config.templateString
    templateElement.content.prepend(globalStyles.cloneNode(true));
    const registryEntry = {
        ...config,
        parsedTemplate: templateElement
    }

    TAG_NAME_TO_FRAGMENT_MAP.set(config.tagName, registryEntry)
    customElements.define(config.tagName, config.componentClass)
}
