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
      let y = rect.bottom + 6;
      let x = rect.left;

      if (x + this.offsetWidth > window.innerWidth)
        x = window.innerWidth - this.offsetWidth;
      if (y + this.offsetHeight > window.innerHeight)
        y = window.innerHeight - this.offsetHeight;
      this.style.top = `${y}px`;
      this.style.left = `${x}px`;
    }
    this.onOpen(this.targetElement);

    setTimeout(
      () => {
        document.addEventListener("click", this._onOutsideClick);
        document.addEventListener("contextmenu", this._onOutsideClick);
      },
      0,
    );
  }

  openAt(x: number, y: number, targetElement: any = null) {
    if (targetElement) {
      this.targetElement = targetElement;
    }
    this.setAttribute("open", "");
    this.style.position = "fixed";

    let posX = x;
    let posY = y;

    if (posX + this.offsetWidth > window.innerWidth) {
      posX = Math.max(10, window.innerWidth - this.offsetWidth - 10);
    }
    if (posY + this.offsetHeight > window.innerHeight) {
      posY = Math.max(10, window.innerHeight - this.offsetHeight - 10);
    }

    this.style.top = `${posY}px`;
    this.style.left = `${posX}px`;
    this.onOpen(this.targetElement);

    setTimeout(
      () => {
        document.addEventListener("click", this._onOutsideClick);
        document.addEventListener("contextmenu", this._onOutsideClick);
      },
      0,
    );
  }

  close() {
    this.removeAttribute("open");
    document.removeEventListener("click", this._onOutsideClick);
    document.removeEventListener("contextmenu", this._onOutsideClick);
    this.onClose(this.targetElement);
  }

  toggle(anchor?: HTMLElement, targetElement: any = null) {
    if (targetElement) {
      this.targetElement = targetElement;
    }
    this.hasAttribute("open") ? this.close() : this.open(anchor);
  }
  connectedCallback() {
    this.classList.add("c-popup");
  }
}

customElements.define("c-popup", CPopup);
