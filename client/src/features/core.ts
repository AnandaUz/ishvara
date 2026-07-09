import "@styles/style.scss";
import "@/main.ts";

import { EVENTS, Store } from "./store";
import type { CGuestsList } from "@/components/c-guests/c-guests-list/c-guests-list";
import { ProjectsManager } from "@features/projectsManager";
import { ServerPersistence } from "./server-persistence";
import { LocalPersistence } from "./local-persistence";

class Core {
  options = {
    isShowTimeLine: true,
  };
  cGuestList!: CGuestsList;

  projectsManager!: ProjectsManager;
  serverPersistence!: ServerPersistence;
  localPersistence!: LocalPersistence;
  protected unsubscribers: Array<() => void> = [];

  store = new Store();

  init() {
    this.projectsManager = new ProjectsManager();
    this.serverPersistence = new ServerPersistence();
    this.localPersistence = new LocalPersistence();

    this.localPersistence.init();
    this.projectsManager.init();

    document.addEventListener("DOMContentLoaded", () => {
      core.store.emit(EVENTS.page.loaded, null);
    });

    this.unsubscribers.push(
      this.store.on(EVENTS.options.MainTabsChanged, async () => {
        core.serverPersistence.init();
        // core.projectsManager.activeProject.guests =
        //   (await core.serverPersistence.loadNextGuests()) as IGuest[];

        // core.store.emit(
        //   EVENTS.guests.loadNext,
        //   core.projectsManager.activeProject.guests,
        // );
      }),
    );

    // this.store.on(EVENTS.options.Changed, () => {});

    //- options ------
    const d = localStorage.getItem("guests-show-timeline");
    if (d !== null) this.options.isShowTimeLine = d === "true";
  }
}

export const core = new Core();
