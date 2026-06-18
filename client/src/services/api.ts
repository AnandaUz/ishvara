import type { IGuest } from "@shared/types/IGuest";
import type { IMessage } from "@shared/types/IMessage";
import type { IPixelEventData } from "@shared/types/Is";

export const api = {
  guest: {
    loadNext: async (
      projectId: number,
      limit: number = 20,
      skip: number = 0,
    ) => {
      const response = await fetch(
        import.meta.env.VITE_API_URL +
          `/api/guests/get?skip=${skip}&limit=${limit}&projectId=${projectId}`,
      );
      const text = await response.text();
      console.log(
        `Размер загрузки ${(new Blob([text]).size / 1024).toFixed(2)} KB`,
      );
      // console.log(text);
      const data = JSON.parse(text);
      return data;
    },
    delete: async (id: string) => {
      return fetch(import.meta.env.VITE_API_URL + "/api/guests/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: id }),
      });
    },
    clearEvents: async (id: string) => {
      return fetch(import.meta.env.VITE_API_URL + "/api/guests/clear-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: id }),
      });
    },
    addTag: async (id: string, tag: number) => {
      return fetch(import.meta.env.VITE_API_URL + "/api/guests/add-tag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: id, tag: tag }),
      });
    },
    sendMetaEvent: async (eventData: IPixelEventData[], pixelData: any) => {
      return fetch(
        import.meta.env.VITE_API_URL + "/api/guests/send-meta-event",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: eventData, pixelData }),
        },
      );
    },
    getOne: async (id: string) => {
      return fetch(import.meta.env.VITE_API_URL + "/api/guests/one/" + id);
    },
    patchOne: async (id: string, data: Partial<IGuest>) => {
      return fetch(import.meta.env.VITE_API_URL + "/api/guests/one/" + id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
  },

  chats: {
    getMessages: async (chatId: number): Promise<IMessage[]> => {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/chats/messages/" + chatId,
      );
      return response.json();
    },
    sendMessage: async (chatId: number, text: string): Promise<IMessage> => {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/chats/message/" + chatId,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        },
      );
      const res = await response.json();
      return res.message as IMessage;
    },
    createNewChatFor: async (guestId: string, tgbotName: string) => {
      const res = await fetch(
        import.meta.env.VITE_API_URL + "/api/chats/create/" + guestId,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tgbotName }),
        },
      );
      const data = await res.json();
      return data;
    },
  },
};
