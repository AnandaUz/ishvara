import { api } from "@/services/api";
import "./c-guest-card.scss";
import type { IGuest } from "@shared/types/IGuest";
import type { CModal } from "@components/c-modal/c-modal";
import type { CGuestBlock } from "@/components/c-guest-block/c-guest-block";
import template from "./c-guest-card.html?raw";
import { projects_configs } from "@/tabs_config";

export class CGuestCard extends HTMLElement {
  private _id: string = "";
  private guest: IGuest = {};
  private ownerElement: CModal | null = null;
  private guestBlock: CGuestBlock | null = null;

  async init(guestBlock: CGuestBlock, owner: CModal) {
    this.ownerElement = owner;
    this.guestBlock = guestBlock;
    this._id = guestBlock.data._id!;
    const res = await api.guest.getOne(this._id);
    this.guest = await res.json();
    this.render();
  }

  private render() {
    const guest = this.guest;

    this.innerHTML = template;
    // let div = document.createElement("div");
    // div.className = "bl-00";
    // this.appendChild(div);

    const initInputBlock = (
      className: string,
      getValue: () => string,
      setValue: (v: any) => void,
    ) => {
      let inp = this.querySelector("." + className) as HTMLInputElement;
      inp.value = getValue();
      inp.addEventListener("input", () => setValue(inp.value));
    };
    const initTextBlock = (className: string, getValue: () => string) => {
      let div = this.querySelector("." + className) as HTMLElement;
      div.textContent = getValue();
    };

    initInputBlock(
      "guest-name",
      () => guest.name || "",
      (v: string) => (guest.name = v),
    );
    initInputBlock(
      "guest-tg-username",
      () => guest.tg?.username || "",
      (v: string) => {
        if (!guest.tg) guest.tg = {};
        guest.tg.username = v;
      },
    );
    initInputBlock(
      "guest-tg-id",
      () => guest.tg?.id || "",
      (v: string) => {
        if (!guest.tg) guest.tg = {};
        guest.tg.id = v;
      },
    );
    initInputBlock(
      "guest-tg-first_name",
      () => guest.tg?.first_name || "",
      (v: string) => {
        if (!guest.tg) guest.tg = {};
        guest.tg.first_name = v;
      },
    );
    initInputBlock(
      "guest-tg-last_name",
      () => guest.tg?.last_name || "",
      (v: string) => {
        if (!guest.tg) guest.tg = {};
        guest.tg.last_name = v;
      },
    );

    initInputBlock(
      "params-string",
      () => guest.paramsString || "",
      (v: string) => {
        guest.paramsString = v;
      },
    );

    const company = this.querySelector(".company") as HTMLSelectElement;
    let lastOption: HTMLOptionElement | null = null;
    projects_configs.forEach((project) => {
      if (project.isOff) return;
      const option = document.createElement("option");
      option.value = project.id;
      option.textContent = project.name;
      company.appendChild(option);

      if (this.guest.companyId === project.id) {
        option.selected = true;
      }
      lastOption = option;
    });
    if (!this.guest.companyId) {
      lastOption!.selected = true;
      this.guest.companyId = lastOption!.value;
    }
    company.addEventListener("change", (e) => {
      this.guest.companyId = (e.target as HTMLSelectElement).value;

      let i = 0;
      i++;
    });

    initTextBlock("ip", () => guest.ip || "");
    initTextBlock("user-agent-string", () => guest.userAgentString || "");

    let btn = this.querySelector(".btn-big") as HTMLButtonElement;
    btn.addEventListener("click", async () => {
      await api.guest.patchOne(this._id, guest);
      const res = await api.guest.getOne(this._id);
      this.guest = await res.json();
      this.ownerElement?.close();

      const guestBlock = this.guestBlock;
      guestBlock!.data = guest;
      guestBlock!.render();
    });
  }
}

customElements.define("c-guest-card", CGuestCard);
