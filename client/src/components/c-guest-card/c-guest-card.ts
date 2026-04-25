import { api } from "@/services/api";
import "./c-guest-card.scss";
import type { IGuest } from "@shared/types/IGuest";
import type { CModal } from "../c-modal/c-modal";

export class CGuestCard extends HTMLElement {
  private _id: string = "";
  private guest: IGuest = {};
  private ownerElement: CModal | null = null;

  async init(id: string, owner: CModal) {
    this.ownerElement = owner;
    this._id = id;
    const res = await api.guest.getOne(id);
    this.guest = await res.json();
    this.render();
  }

  private render() {
    const guest = this.guest;

    this.innerHTML = `    
    `;
    let div = document.createElement("div");
    div.className = "bl-00";
    this.appendChild(div);

    const addInputBlock = (
      labelValue: string,
      getValue: () => string,
      setValue: (v: any) => void,
    ) => {
      let div_input = document.createElement("div");
      div_input.className = "bl-input";
      div.appendChild(div_input);

      let lbl = document.createElement("label");
      lbl.textContent = labelValue;
      div_input.appendChild(lbl);

      let inp = document.createElement("input");
      inp.type = "text";
      inp.value = getValue();
      inp.addEventListener("input", () => setValue(inp.value));
      div_input.appendChild(inp);
    };
    const addValueItem = (labelValue: string, getValue: () => string) => {
      let div_line = document.createElement("div");
      div_line.className = "bl-value-item";
      div.appendChild(div_line);

      let lbl = document.createElement("div");
      lbl.className = "bl-value-item__label";
      lbl.textContent = labelValue;
      div_line.appendChild(lbl);

      let val = document.createElement("div");
      val.className = "bl-value-item__value";
      val.textContent = getValue();
      div_line.appendChild(val);
    };

    addInputBlock(
      "Имя",
      () => guest.name || "",
      (v: string) => (guest.name = v),
    );
    addInputBlock(
      "Телефон",
      () => guest.phone || "",
      (v: string) => (guest.phone = v),
    );

    // addValueItem("Дата регистрации", () => {
    //   if (guest.createdAt) {
    //     const d = new Date(guest.createdAt);
    //     return d.toLocaleString();
    //   }
    //   return "";
    // });

    // addValueItem("Юзер агент", () => guest.userAgentString || "");

    let btn = document.createElement("button");
    btn.className = "btn-big";
    btn.textContent = "Сохранить";
    div.appendChild(btn);

    btn.addEventListener("click", async () => {
      await api.guest.patchOne(this._id, guest);
      const res = await api.guest.getOne(this._id);
      this.guest = await res.json();
      this.ownerElement?.close();
    });
  }
}

customElements.define("c-guest-card", CGuestCard);
