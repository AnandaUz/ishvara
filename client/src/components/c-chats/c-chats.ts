import "./c-chats.scss";
import template from "./c-chats.html?raw";
import type { IGuest } from "../../../../shared/types/IGuest";
import { api } from "@/services/api";
import { MessageDirection, type IMessage } from "@shared/types/IMessage";
import { getBProjectCompanyById } from "@shared/projects_config";
import { getTimeStr } from "@/services/tools";
export let chat: CChats;
export class CChats extends HTMLElement {
  userNameEl!: HTMLDivElement;
  messageEl!: HTMLDivElement;
  guest!: IGuest;
  constructor() {
    super();
    this.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }
  async connectedCallback() {
    this.innerHTML = template;
    chat = this;
    this.userNameEl = this.querySelector(".user-name") as HTMLDivElement;
    this.messageEl = this.querySelector(".messages-bl") as HTMLDivElement;

    const input = this.querySelector(".input-div") as HTMLDivElement;
    input.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const text = input.textContent?.trim();
        let chatData = this.guest.chat;
        let chatId = Number(this.guest.chat?.id);
        if (!chatId) {
          const projectId = this.guest.projectId!;
          const companyId = Number(this.guest.instagram?.comp_name!);
          const tgbotName =
            getBProjectCompanyById(projectId, companyId)?.tgbotName || "";
          chatData = await api.chats.createNewChatFor(
            this.guest._id!.toString(),
            tgbotName,
          );
          if (chatData) this.guest.chat = chatData;
        }

        chatId = Number(this.guest.chat?.id);

        if (text && chatId) {
          try {
            const message = await api.chats.sendMessage(chatId, text);
            if (message) {
              this.addMessageToChat(message);
              input.textContent = "";
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    });
  }
  addMessageToChat(message: IMessage) {
    const messageEl = document.createElement("div");
    messageEl.classList.add(
      "message",
      message.direction === MessageDirection.IN ? "in" : "out",
    );
    messageEl.innerHTML = `
    <div class="body">
    <div class="time">${getTimeStr(new Date(message.createdAt))}</div>
    <div class="text">${message.text}</div>
    </div>`;
    this.messageEl.appendChild(messageEl);
  }
  async initForGuest(guest: IGuest) {
    if (!guest) return;
    this.guest = guest;
    this.userNameEl.textContent =
      guest.name || guest.tg?.first_name || guest.tg?.username || "";

    this.messageEl.innerHTML = "";
    const chatId = Number(this.guest.chat?.id);
    if (!chatId) return;

    const messages = await api.chats.getMessages(chatId);

    messages.forEach((message: IMessage) => {
      this.addMessageToChat(message);
    });
  }
}

customElements.define("c-chats", CChats);
