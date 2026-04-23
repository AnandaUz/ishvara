export const DESC_EVENTS = {
     project: {
          Changed: 'project:changed',
     }
} as const;

export type DeskEvents = {
     [DESC_EVENTS.project.Changed]: string;
}
