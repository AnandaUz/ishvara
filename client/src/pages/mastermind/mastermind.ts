import type { Page } from '../../types';
import "./mastermind.scss";
import html from "./mastermind.html?raw";
import '@components/top/c-top';

export const mastermindPage: Page = () => {
  return {
    html: html,
    init() {
      
      
    },
    title: 'Мастермайнд'
  };
}
