import "./c-popup.scss";

export class CPopup extends HTMLElement {
  targetElement: HTMLElement | null = null;
  private _onOutsideClick = (e: MouseEvent) => {
    if (!this.contains(e.target as Node)) this.close();
  };
  onOpen: (owner: any) => void = () => {};
  onClose: (owner: any) => void = () => {};

  open(anchor?: HTMLElement) {
    this.setAttribute("open", "");

    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      this.style.position = "fixed";
      this.style.top = `${rect.bottom + 6}px`;
      this.style.left = `${rect.left}px`;
    }
    this.onOpen(this.targetElement);

    setTimeout(
      () => document.addEventListener("click", this._onOutsideClick),
      0,
    );
  }

  close() {
    this.removeAttribute("open");
    document.removeEventListener("click", this._onOutsideClick);
  }

  toggle(anchor?: HTMLElement, targetElement: any = null) {
    if (targetElement) {
      this.targetElement = targetElement;
    }
    this.hasAttribute("open") ? this.close() : this.open(anchor);
  }
}

customElements.define("c-popup", CPopup);
