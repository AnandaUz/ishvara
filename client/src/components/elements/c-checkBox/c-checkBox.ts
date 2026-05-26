import "./c-checkBox.scss";
import template from "./c-checkBox.html?raw";

export class CCheckBox extends HTMLElement {
  private _checked = false;
  private wrap: HTMLElement | null = null;
  private storeKey: string | null = null;

  get checked() {
    return this._checked;
  }

  set checked(val: boolean) {
    this._checked = val;
    this.wrap?.classList.toggle("checked", val);
    this.setAttribute("data-checked", String(val));

    if (this.storeKey) {
      localStorage.setItem(this.storeKey, String(val));
    }
  }

  async connectedCallback() {
    const label = this.getAttribute("data-label") || "";
    this.storeKey = this.getAttribute("data-store-key");

    let initial = this.getAttribute("data-checked") === "true";

    if (this.storeKey) {
      const stored = localStorage.getItem(this.storeKey);
      if (stored !== null) {
        initial = stored === "true";
      }
    }

    this.innerHTML = template.replace("{{label}}", label);
    this.wrap = this.querySelector(".cb-wrap");

    this._checked = initial;
    if (initial) this.wrap?.classList.add("checked");

    this.wrap?.addEventListener("click", () => {
      this.checked = !this._checked;

      this.dispatchEvent(
        new CustomEvent("c-change", {
          detail: { checked: this._checked },
          bubbles: true,
        }),
      );
    });

    // при старте запускаем событие с текущим значением
    // setTimeout(() => {
    //   this.dispatchEvent(
    //     new CustomEvent("c-change", {
    //       detail: { checked: this._checked },
    //       bubbles: true,
    //     }),
    //   );
    // }, 0);
  }

  // публичный метод для внешнего вызова
  onChange(fn: (checked: boolean) => void) {
    this.addEventListener("c-change", (e) => {
      fn((e as CustomEvent).detail.checked);
    });
  }
}

customElements.define("c-check-box", CCheckBox);
