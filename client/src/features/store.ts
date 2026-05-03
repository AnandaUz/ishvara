import { EventEmitter } from "@base/client/features/event-emitter";

export const DESC_EVENTS = {
  project: {
    Changed: "project:changed",
  },
  guests: {
    Filter: {
      LevelChanged: "guests:filter:level:changed",
    },
  },
} as const;

export type DeskEvents = {
  [DESC_EVENTS.project.Changed]: string;
  [DESC_EVENTS.guests.Filter.LevelChanged]: number;
};

export class Store extends EventEmitter<DeskEvents> {}

export const store = new Store();
