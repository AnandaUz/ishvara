import "./c-tags-tree.scss";
import template from "./c-tags-tree.html?raw";
import { TAGS } from "@shared/types/Tags"; 

interface ITagItem {
  code: number;
  name: string;
  description?: string;
  bgColor: string;
  fontColor?: string;
}

type TagsGroup = Record<string, ITagItem>;
type TagsTree = Record<string, TagsGroup>;

export class CTagsTree extends HTMLElement {
  private tags: TagsTree = TAGS as unknown as TagsTree;
  private selected = new Map<number, ITagItem>();

  private fieldEl!: HTMLElement;
  private treeEl!: HTMLElement;

  onChange: (selected: ITagItem[]) => void = () => {};

  connectedCallback() {
    this.innerHTML = template;
    this.fieldEl = this.querySelector("[data-field]")!;
    this.treeEl = this.querySelector("[data-tree]")!;
    this.renderTree();
    this.renderField();
  }

  private renderTree() {
    this.treeEl.innerHTML = "";

    for (const groupKey in this.tags) {
      const group = this.tags[groupKey];

      const groupEl = document.createElement("details");
      groupEl.className = "tag-picker__group";
      groupEl.open = true;

      const summary = document.createElement("summary");
      summary.className = "tag-picker__group-title";
      summary.textContent = groupKey;
      groupEl.appendChild(summary);

      const list = document.createElement("div");
      list.className = "tag-picker__items";

      for (const itemKey in group) {
        const item = group[itemKey];

        const itemEl = document.createElement("button");
        itemEl.type = "button";
        itemEl.className = "tag-picker__item";
        itemEl.dataset.code = String(item.code);
        itemEl.style.setProperty("--bg", item.bgColor);
        itemEl.style.setProperty("--fg", item.fontColor ?? "#ffffff");
        itemEl.title = item.description ?? item.name;
        itemEl.innerHTML = `
          <span class="tag-picker__dot"></span>
          <span class="tag-picker__label">${item.name}</span>
        `;

        if (this.selected.has(item.code)) itemEl.classList.add("is-selected");

        itemEl.addEventListener("click", () => this.toggleItem(item));

        list.appendChild(itemEl);
      }

      groupEl.appendChild(list);
      this.treeEl.appendChild(groupEl);
    }
  }

  private toggleItem(item: ITagItem) {
    if (this.selected.has(item.code)) {
      this.selected.delete(item.code);
    } else {
      this.selected.set(item.code, item);
    }
    this.renderField();
    this.updateItemStates();
    this.emitChange();
  }

  private updateItemStates() {
    this.treeEl
      .querySelectorAll<HTMLElement>(".tag-picker__item")
      .forEach((el) => {
        const code = Number(el.dataset.code);
        el.classList.toggle("is-selected", this.selected.has(code));
      });
  }

  private renderField() {
    this.fieldEl.innerHTML = "";

    if (this.selected.size === 0) {
      const placeholder = document.createElement("span");
      placeholder.className = "tag-picker__placeholder";
      placeholder.textContent = "Выберите теги...";
      this.fieldEl.appendChild(placeholder);
      return;
    }

    this.selected.forEach((item) => {
      const chip = document.createElement("span");
      chip.className = "tag-picker__chip";
      chip.style.setProperty("--bg", item.bgColor);
      chip.style.setProperty("--fg", item.fontColor ?? "#ffffff");
      chip.innerHTML = `
        <span>${item.name}</span>
        <button type="button" class="tag-picker__chip-remove" aria-label="Удалить">×</button>
      `;

      chip
        .querySelector(".tag-picker__chip-remove")!
        .addEventListener("click", (e) => {
          e.stopPropagation();
          this.selected.delete(item.code);
          this.renderField();
          this.updateItemStates();
          this.emitChange();
        });

      this.fieldEl.appendChild(chip);
    });
  }

  private emitChange() {
    const values = Array.from(this.selected.values());
    this.onChange(values);
    this.dispatchEvent(
      new CustomEvent("tags-change", {
        detail: { codes: values.map((v) => v.code), items: values },
        bubbles: true,
      }),
    );
  }

  get value(): number[] {
    return Array.from(this.selected.keys());
  }

  setValue(codes: number[]) {
    this.selected.clear();
    const flat = this.flattenTags();
    codes.forEach((code) => {
      const found = flat.find((i) => i.code === code);
      if (found) this.selected.set(code, found);
    });
    this.renderField();
    this.updateItemStates();
  }

  private flattenTags(): ITagItem[] {
    const result: ITagItem[] = [];
    for (const groupKey in this.tags) {
      for (const itemKey in this.tags[groupKey]) {
        result.push(this.tags[groupKey][itemKey]);
      }
    }
    return result;
  }
}

customElements.define("c-tag-tree", CTagsTree);