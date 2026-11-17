import "./c-project-modal.scss";
import template from "./c-project-modal.html?raw";
import { api } from "@/services/api";
import type { IProjectEntity } from "@shared/types/IProjectEntity";
import { CModal } from "@/components/c-modal/c-modal";

export class CProjectModal extends HTMLElement {
  private modal: CModal;
  private projects: IProjectEntity[] = [];
  public onChange: () => void = () => {};

  constructor() {
    super();
    this.modal = new CModal();
    this.modal.classList.add("project-modal-dialog");

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

    const btnAdd = this.querySelector(".btn-add-project");
    btnAdd?.addEventListener("click", () => this.showForm());

    const btnCancel = this.querySelector(".btn-cancel");
    btnCancel?.addEventListener("click", () => this.hideForm());

    const btnSave = this.querySelector(".btn-save");
    btnSave?.addEventListener("click", () => this.saveProject());
  }

  async open() {
    this.hideForm();
    await this.loadProjects();
    this.modal.open();
  }

  close() {
    this.modal.close();
  }

  private async loadProjects() {
    try {
      const res = await api.project.getAll();
      this.projects = Array.isArray(res) ? res : [];
    } catch {
      this.projects = [];
    }
    this.renderProjects();
  }

  private renderProjects() {
    const listEl = this.querySelector(".projects-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    if (this.projects.length === 0) {
      listEl.innerHTML = `<div class="empty-notice">Проектов пока нет. Нажмите «+ Создать проект».</div>`;
      return;
    }

    this.projects.forEach((proj) => {
      const item = document.createElement("div");
      item.className = `project-item ${proj.isOff ? "is-off" : ""}`;

      const originsPreview = (proj.allowedOrigins || []).join(", ");

      const metaTags: string[] = [];
      if (proj.url) metaTags.push(`URL: ${proj.url}`);
      if (proj.city || proj.country)
        metaTags.push(`Локация: ${[proj.city, proj.country].filter(Boolean).join(", ")}`);
      if (proj.pixelId) metaTags.push(`Pixel: ${proj.pixelId}`);
      if (proj.tgbotName) metaTags.push(`Bot: ${proj.tgbotName}`);

      item.innerHTML = `
        <div class="project-info">
          <div class="project-title-row">
            <span class="project-title">${proj.name}</span>
            <span class="project-id-badge">ID: ${proj.projectId}</span>
            ${proj.isOff ? `<span class="off-badge">Отключен</span>` : ""}
          </div>
          ${
            metaTags.length > 0
              ? `<div class="project-meta-row">${metaTags.map((t) => `<span>${t}</span>`).join("")}</div>`
              : ""
          }
          ${
            originsPreview
              ? `<span class="project-origins-preview" title="${originsPreview}">Домены: ${originsPreview}</span>`
              : ""
          }
        </div>
        <div class="project-actions">
          <button class="btn-edit" type="button" title="Редактировать">✎</button>
          <button class="btn-delete" type="button" title="Удалить">🗑</button>
        </div>
      `;

      item.querySelector(".btn-edit")?.addEventListener("click", () => {
        this.showForm(proj);
      });

      item.querySelector(".btn-delete")?.addEventListener("click", async () => {
        if (confirm(`Удалить проект "${proj.name}" (ID: ${proj.projectId})?`)) {
          if (proj._id) {
            await api.project.delete(proj._id);
            await this.loadProjects();
            this.onChange();
          }
        }
      });

      listEl.appendChild(item);
    });
  }

  private showForm(proj?: IProjectEntity) {
    const formSec = this.querySelector(".project-form-section") as HTMLElement;
    const listSec = this.querySelector(".project-list-section") as HTMLElement;
    const titleEl = this.querySelector(".form-title") as HTMLElement;

    const idInput = this.querySelector(".project-mongo-id") as HTMLInputElement;
    const projectIdInput = this.querySelector(".input-project-id") as HTMLInputElement;
    const nameInput = this.querySelector(".input-name") as HTMLInputElement;
    const originsTextarea = this.querySelector(".textarea-origins") as HTMLTextAreaElement;
    const urlInput = this.querySelector(".input-url") as HTMLInputElement;
    const cityInput = this.querySelector(".input-city") as HTMLInputElement;
    const countryInput = this.querySelector(".input-country") as HTMLInputElement;
    const pixelIdInput = this.querySelector(".input-pixel-id") as HTMLInputElement;
    const pixelTokenInput = this.querySelector(".input-pixel-token") as HTMLInputElement;
    const tgbotNameInput = this.querySelector(".input-tgbot-name") as HTMLInputElement;
    const tgbotTokenInput = this.querySelector(".input-tgbot-token") as HTMLInputElement;
    const isOffInput = this.querySelector(".input-is-off") as HTMLInputElement;

    if (!formSec || !listSec) return;

    listSec.style.display = "none";
    formSec.style.display = "flex";

    if (proj) {
      titleEl.textContent = "Редактировать проект";
      idInput.value = proj._id || "";
      projectIdInput.value = proj.projectId ? String(proj.projectId) : "";
      nameInput.value = proj.name || "";
      originsTextarea.value = (proj.allowedOrigins || []).join("\n");
      urlInput.value = proj.url || "";
      cityInput.value = proj.city || "";
      countryInput.value = proj.country || "";
      pixelIdInput.value = proj.pixelId || "";
      pixelTokenInput.value = proj.pixelToken || "";
      tgbotNameInput.value = proj.tgbotName || "";
      tgbotTokenInput.value = proj.tgbotToken || "";
      isOffInput.checked = Boolean(proj.isOff);
    } else {
      titleEl.textContent = "Новый проект";
      idInput.value = "";
      projectIdInput.value = "";
      nameInput.value = "";
      originsTextarea.value = "";
      urlInput.value = "";
      cityInput.value = "";
      countryInput.value = "";
      pixelIdInput.value = "";
      pixelTokenInput.value = "";
      tgbotNameInput.value = "";
      tgbotTokenInput.value = "";
      isOffInput.checked = false;
    }
  }

  private hideForm() {
    const formSec = this.querySelector(".project-form-section") as HTMLElement;
    const listSec = this.querySelector(".project-list-section") as HTMLElement;
    if (formSec && listSec) {
      formSec.style.display = "none";
      listSec.style.display = "flex";
    }
  }

  private async saveProject() {
    const idInput = this.querySelector(".project-mongo-id") as HTMLInputElement;
    const projectIdInput = this.querySelector(".input-project-id") as HTMLInputElement;
    const nameInput = this.querySelector(".input-name") as HTMLInputElement;
    const originsTextarea = this.querySelector(".textarea-origins") as HTMLTextAreaElement;
    const urlInput = this.querySelector(".input-url") as HTMLInputElement;
    const cityInput = this.querySelector(".input-city") as HTMLInputElement;
    const countryInput = this.querySelector(".input-country") as HTMLInputElement;
    const pixelIdInput = this.querySelector(".input-pixel-id") as HTMLInputElement;
    const pixelTokenInput = this.querySelector(".input-pixel-token") as HTMLInputElement;
    const tgbotNameInput = this.querySelector(".input-tgbot-name") as HTMLInputElement;
    const tgbotTokenInput = this.querySelector(".input-tgbot-token") as HTMLInputElement;
    const isOffInput = this.querySelector(".input-is-off") as HTMLInputElement;

    const name = nameInput.value.trim();
    if (!name) {
      alert("Введите название проекта");
      return;
    }

    const origins = originsTextarea.value
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const payload: Partial<IProjectEntity> = {
      name,
      allowedOrigins: origins,
      url: urlInput.value.trim(),
      city: cityInput.value.trim(),
      country: countryInput.value.trim(),
      pixelId: pixelIdInput.value.trim(),
      pixelToken: pixelTokenInput.value.trim(),
      tgbotName: tgbotNameInput.value.trim(),
      tgbotToken: tgbotTokenInput.value.trim(),
      isOff: isOffInput.checked,
    };

    if (projectIdInput.value.trim()) {
      payload.projectId = Number(projectIdInput.value.trim());
    }

    const mongoId = idInput.value;
    try {
      if (mongoId) {
        await api.project.update(mongoId, payload);
      } else {
        await api.project.create(payload);
      }
      this.hideForm();
      await this.loadProjects();
      this.onChange();
    } catch (err) {
      alert("Ошибка при сохранении проекта");
      console.error(err);
    }
  }
}

customElements.define("c-project-modal", CProjectModal);
