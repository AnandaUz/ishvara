import "./c-company-modal.scss";
import template from "./c-company-modal.html?raw";
import { api } from "@/services/api";
import type { ICompanyEntity } from "@shared/types/ICompanyEntity";
import { CModal } from "@/components/c-modal/c-modal";

export class CCompanyModal extends HTMLElement {
  private modal: CModal;
  private projectId: number = 0;
  private companies: ICompanyEntity[] = [];
  public onChange: () => void = () => {};

  constructor() {
    super();
    this.modal = new CModal();
    this.modal.classList.add("company-modal-dialog");

    const container = document.createElement("div");
    container.innerHTML = template;
    const content = container.firstElementChild as HTMLElement;

    const modalBox = this.modal.querySelector(".c-modal__box");
    if (modalBox && content) {
      modalBox.appendChild(content);
    }
    this.appendChild(this.modal);
  }

  connectedCallback() {
    const btnClose = this.querySelector(".btn-close");
    btnClose?.addEventListener("click", () => this.close());

    const btnAdd = this.querySelector(".btn-add-company");
    btnAdd?.addEventListener("click", () => this.showForm());

    const btnCancel = this.querySelector(".btn-cancel");
    btnCancel?.addEventListener("click", () => this.hideForm());

    const btnSave = this.querySelector(".btn-save");
    btnSave?.addEventListener("click", () => this.saveCompany());
  }

  async open(projectId: number) {
    this.projectId = projectId;
    this.hideForm();
    await this.loadCompanies();
    this.modal.open();
  }

  close() {
    this.modal.close();
  }

  private async loadCompanies() {
    if (!this.projectId) return;
    try {
      const res = await api.company.getByProject(this.projectId);
      this.companies = Array.isArray(res) ? res : [];
    } catch {
      this.companies = [];
    }
    this.renderCompanies();
  }

  private renderCompanies() {
    const listEl = this.querySelector(".companies-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    if (this.companies.length === 0) {
      listEl.innerHTML = `<div class="empty-notice">В этом проекте пока нет созданных компаний (гипотез).</div>`;
      return;
    }

    this.companies.forEach((comp) => {
      const item = document.createElement("div");
      item.className = "company-item";

      const urlsPreview = (comp.urls || []).join(", ");
      const pagesCount = (comp.urls || []).length;

      item.innerHTML = `
        <div class="company-info">
          <span class="company-title">${comp.name}</span>
          <span class="company-pages-badge">Страниц: ${pagesCount}</span>
          ${urlsPreview ? `<span class="company-urls-preview" title="${urlsPreview}">${urlsPreview}</span>` : ""}
        </div>
        <div class="company-actions">
          <button class="btn-edit" type="button">✎</button>
          <button class="btn-delete" type="button">🗑</button>
        </div>
      `;

      item.querySelector(".btn-edit")?.addEventListener("click", () => {
        this.showForm(comp);
      });

      item.querySelector(".btn-delete")?.addEventListener("click", async () => {
        if (confirm(`Удалить компанию "${comp.name}"?`)) {
          if (comp._id) {
            await api.company.delete(comp._id);
            await this.loadCompanies();
            this.onChange();
          }
        }
      });

      listEl.appendChild(item);
    });
  }

  private showForm(company?: ICompanyEntity) {
    const formSec = this.querySelector(".company-form-section") as HTMLElement;
    const listSec = this.querySelector(".company-list-section") as HTMLElement;
    const titleEl = this.querySelector(".form-title") as HTMLElement;
    const idInput = this.querySelector(".company-id") as HTMLInputElement;
    const nameInput = this.querySelector(".input-name") as HTMLInputElement;
    const urlsTextarea = this.querySelector(".textarea-urls") as HTMLTextAreaElement;

    if (!formSec || !listSec) return;

    listSec.style.display = "none";
    formSec.style.display = "flex";

    if (company) {
      titleEl.textContent = "Редактировать компанию";
      idInput.value = company._id || "";
      nameInput.value = company.name || "";
      urlsTextarea.value = (company.urls || []).join("\n");
    } else {
      titleEl.textContent = "Новая компания";
      idInput.value = "";
      nameInput.value = "";
      urlsTextarea.value = "";
    }
  }

  private hideForm() {
    const formSec = this.querySelector(".company-form-section") as HTMLElement;
    const listSec = this.querySelector(".company-list-section") as HTMLElement;
    if (formSec && listSec) {
      formSec.style.display = "none";
      listSec.style.display = "flex";
    }
  }

  private async saveCompany() {
    const idInput = this.querySelector(".company-id") as HTMLInputElement;
    const nameInput = this.querySelector(".input-name") as HTMLInputElement;
    const urlsTextarea = this.querySelector(".textarea-urls") as HTMLTextAreaElement;

    const name = nameInput.value.trim();
    if (!name) {
      alert("Укажите название компании");
      return;
    }

    const urls = urlsTextarea.value
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    const id = idInput.value;
    if (id) {
      await api.company.update(id, { name, urls });
    } else {
      await api.company.create({
        projectId: this.projectId,
        name,
        urls,
      });
    }

    this.hideForm();
    await this.loadCompanies();
    this.onChange();
  }
}

customElements.define("c-company-modal", CCompanyModal);

