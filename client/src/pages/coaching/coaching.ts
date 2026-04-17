import type { Page } from '../../types';
import "./coaching.scss";
import html from "./coaching.html?raw";
import '@components/top/c-top';

export const coachingPage: Page = () => {
  return {
    html: html,
    init() {
      
      
    },
    title: 'Коучинг'
  };
}
