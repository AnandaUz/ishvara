# Directives for AI Agent (Ishvara)

# Core Directives

- **Zero fluff:** No conversational fillers or prompt echoing. Maximum brevity.
- **Code edits:** Minimal targeted diffs/patches only. Never rewrite entire files.
- **Tool usage:** On file modifications, output only file path and a 1-line summary.
- **Explanations:** Max 1-2 sentences only when required. Default to code only. Always respond in Russian.

# Project Keywords


# Glossary Contribution Rules

When adding or updating terms in `GLOSSARY.md`:

- Heading format: `## <Russian Term> / <English Term>`.
- One-line definition highlighting core purpose.
- Compact term/code mapping list.
- Exact code references (Logic, View, DB/Manager). Avoid enumerating all methods.
- 3-5 concise lifecycle steps.

## 1. Project Context

Ishvara — маркетинговая CRM-система, легковесный поведенческий трекер (`client/src/tracker.ts`), мультибот-модуль на Telegraf (`server/src/controllers/tgbots/`) и серверный мост в Meta Conversions API (CAPI).

- Архитектура: npm workspaces (`client`, `server`, `shared`), общий сабмодуль `_base`, утилиты `_tools`.
- Стек: Vanilla TypeScript, Web Components (Custom Elements), SCSS, Vite, Express 5, Mongoose 9, Telegraf 4.

## 2. Terminology & Glossary Rule

- **При появлении терминов проекта** («гость», «эдсет», «кампания», «пиксель», «трекер», «уровень воронки/мета-уровень», «теги», «архивация», «боты») — **обращайся к [GLOSSARY.md](file:///d:/_sites/ishvara/GLOSSARY.md)** вместо долгого поиска по репозиторию.

## 4. Coding & Architecture Guidelines

- **Zero fluff:** Никакой лишней вежливости, повторения промпта или воды. Будь лаконичен и точен.
- **Минимальные точечные правки:** Предоставляй только точечные изменения или diff. Никогда не переписывай файлы целиком, если меняется несколько строк.
- **Стек фронтенда:** Использовать чистый TypeScript, Web Components (`HTMLElement`, `customElements.define`) и чистый SCSS. **Не внедрять React, Vue или TailwindCSS**, если об этом прямо не попросил пользователь.
- **Стек бэкенда:** Express 5 + Mongoose. В импортах на сервере всегда сохранять расширения `.js` (ES Modules Node.js).
- **Слой Shared:** Изменения типов в `shared/types/` (`IGuest`, `GuestConst`, `Tags`, `ClientEvents`) должны сохранять обратную совместимость, так как они используются синхронно и на клиенте, и на сервере, и в трекере.
- **Производительность БД:** При работе с коллекцией `Guests` (содержит тысячи записей событий) **запрещено** делать `find()` без лимита или курсора (`.cursor()`). Любые массовые изменения должны выполняться через `bulkWrite`.
- **Защита Meta CAPI:** При отправке серверных событий в Meta Graph API никогда не вызывать `result.json()` дважды для одного `Response`.
- **Инструменты и ссылки:** Всегда форматируй пути к файлам и сущностям как кликабельные markdown-ссылки (`[file.ts](file:///path/to/file.ts)`).
