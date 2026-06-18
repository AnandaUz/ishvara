import { EventEmitter } from "@base/client/features/event-emitter";
import type { IGuest } from "@shared/types/IGuest";

export const EVENTS = {
  page: {
    loaded: "page:loaded",
  },
  project: {
    Changed: "project:changed",
  },
  guests: {
    Filter: {
      LevelChanged: "guests:filter:level:changed",
    },
    loadNext: "guests:load-next",
  },
  options: {
    Changed: "options:changed",
  },
} as const;

export type DeskEvents = {
  [EVENTS.page.loaded]: null;
  [EVENTS.project.Changed]: number;
  [EVENTS.guests.Filter.LevelChanged]: number;
  [EVENTS.guests.loadNext]: IGuest[];
  [EVENTS.options.Changed]: any;
};

export class Store extends EventEmitter<DeskEvents> {}
