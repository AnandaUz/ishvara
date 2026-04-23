import type { Page } from '../../types';
import html from "@pages/home/home.html?raw"
import '@components/c-guest-block/c-guest-block';
import '@components/c-guests-block/c-guests-block';
import '@components/c-project-tabs/c-project-tabs';
import { projectsManager } from '@/features/projectsManager';
import { store } from '@/features/store';
import { DESC_EVENTS } from '@/features/events';


export const homePage: Page = () => {
  return {
    html: html,
    pageClass: 'home-page',
    init() {

      

      store.on(DESC_EVENTS.project.Changed, (_id: string) => {
           const h1 = document.querySelector('h1');
           h1!.textContent = projectsManager.activeProject!.config.name;
      });    

      projectsManager.init();



      

    }
  };
}

