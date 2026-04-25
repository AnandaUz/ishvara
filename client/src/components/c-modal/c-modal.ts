import "./c-modal.scss";
import template from "./c-modal.html?raw";

export class CModal extends HTMLElement {
  data: any = null;
  onOpen: (data: any) => void = () => {};
  onClose: (data: any) => void = () => {};

  private _onOutsideClick = (e: MouseEvent) => {
    if (e.target === this) this.close();
  };

  open(data?: any) {
    if (data !== undefined) this.data = data;
    this.setAttribute("open", "");
    this.onOpen(this.data);
    setTimeout(() => this.addEventListener("click", this._onOutsideClick), 0);
  }

  close() {
    this.removeAttribute("open");
    this.removeEventListener("click", this._onOutsideClick);
    this.onClose(this.data);
  }
  constructor() {
    super();
    // Сразу рендерим шаблон, но в скрытом состоянии
    // Это позволит .modalBox быть в DOM и иметь размеры, пока модал закрыт
    this.innerHTML = template;
  }
}

customElements.define("c-modal", CModal);
