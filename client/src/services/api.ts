import type { IPixelEventData } from "@shared/types/Is";

const guest = {
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
  sendMetaEvent: async (eventData: IPixelEventData[]) => {
    return fetch(import.meta.env.VITE_API_URL + "/api/guests/send-meta-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: eventData }),
    });
  },
};

export const api = {
  guest,
};
