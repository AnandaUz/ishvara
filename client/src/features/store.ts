import { EventEmitter } from "@base/client/features/event-emitter";

export const EVENTS = {
  project: {
    Changed: "project:changed",
  },
  guests: {
    Filter: {
      LevelChanged: "guests:filter:level:changed",
    },
  },
  options: {
    Changed: "options:changed",
  },
} as const;

export type DeskEvents = {
  [EVENTS.project.Changed]: number;
  [EVENTS.guests.Filter.LevelChanged]: number;
  [EVENTS.options.Changed]: any;
};

export class Store extends EventEmitter<DeskEvents> {}
