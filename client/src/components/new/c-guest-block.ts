import "./c-guest-block.scss";
import template from "./c-guest-block.html?raw";


export class CGuestBlock extends HTMLElement {    
  async connectedCallback() {
    const guest = this.getAttribute('data-guest') || '';
    this.innerHTML = template.replace('{{guest}}', guest);
  }
}
customElements.define('c-guest-block', CGuestBlock);