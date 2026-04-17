import type { Page } from '../types';
import '@components/top/c-top';

export const notFoundPage: Page = () => {
  return {
    html: `
    <c-top></c-top>
    <h1>404</h1>
    <div class="cont">
      
        <h3>Страница не найдена</h3>
        <a href="/">Вернуться на главную</a>
      
    </div>
    `,
    init() {

    }
  };
}