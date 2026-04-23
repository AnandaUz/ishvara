import type { Page, Routes } from './types';

import { notFoundPage } from './pages/notFound';


const routes: Routes = {
  '/':               (params) => import('./pages/home/home').then(m => m.homePage(params)),
  '/ad':          (params) => import('./pages/admin/admin').then(m => m.adminPage(params)),
};

function matchRoute(routes: Routes, path: string): { page: Page; params: Record<string, string> } {
  // Сначала ищем точное совпадение
  if (routes[path]) {
    return { page: routes[path], params: {} };
  }

  // Затем ищем по паттерну
  for (const pattern in routes) {
    const paramNames: string[] = [];
    const regexStr = pattern.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });

    const match = path.match(new RegExp(`^${regexStr}$`));
    if (match) {
      const params: Record<string, string> = {};
      paramNames.forEach((name, i) => {
        params[name] = match[i + 1] as string;
      });
      return { page: routes[pattern] as Page, params };
    }
  }

  return { page: notFoundPage, params: {} };
}

export async function render(): Promise<void> {
  const path = window.location.pathname;
  const { page, params } = matchRoute(routes, path);

  try {
    const main = document.querySelector('main');
    if (!main) throw new Error('Элемент main не найден в DOM');

    const result = await page(params);
    const { html, title, init, pageClass } = result;
    main.innerHTML = html;
    document.title = 'Ишвара' + (title ? ' | ' + title : ' Шадрин');
    init?.();
    document.body.className = '';
    if (pageClass) {
      document.body.classList.add(pageClass);
    }
  } catch (e) {
    console.error('Ошибка роутера:', e);
  }
}
