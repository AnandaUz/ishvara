# Анализ проекта Ishvara и Топ-10 рекомендаций

Документ сформирован по результатам глубокого аудита кодовой базы (архитектура, безопасность, стек, производительность БД, трекинг и интеграции).

---

## 1. Архитектурный и предметный анализ

### 1.1. Назначение системы
**Ishvara** — это CRM-платформа, трекер поведенческой аналитики и система сквозного маркетинга:
1. **Веб-трекинг**: Легковесный клиентский скрипт `tracker.ts`, работающий на внешних сайтах и собирающий глубину скролла, клики, время на странице и cookie Facebook.
2. **Telegram-мультибот**: Бот-модуль на базе Telegraf (`mastermind`, `meditation`, `vmeste`, `admin`) для регистрации пользователей и двусторонней связи администратора с лидами через реплаи.
3. **Meta Conversions API (CAPI)**: Серверная трансляция конверсий воронки (от первого просмотра до повторных оплат) в рекламный кабинет Facebook с хешированием данных (SHA-256).
4. **CRM и визуализация**: SPA-панель на базе Web Components с хронологией действий гостей (таймлайны), фильтрацией по проектам/тегам и воронке лидов.

### 1.2. Структура монорепозитория
- **`client/`** — SPA-интерфейс аналитики (Vite, чистый TypeScript, Web Components, SCSS) и независимый бандл трекера (`client/src/tracker.ts`).
- **`server/`** — Node.js / Express 5 API с контроллерами аналитики, Mongoose 9, SSE-стримингом фоновых процессов и Telegraf-ботами.
- **`shared/`** — Типизированные контракты (`IGuest.ts`, `GuestConst.ts`, `Tags.ts`, `ClientEvents.ts`) и статическая конфигурация проектов (`projects_config.ts`).
- **`_base/`** — Git-субмодуль с общими конфигурациями базы данных, окружения и базовыми классами.
- **`_tools/`** — Утилиты настройки вебхуков Telegram и вспомогательные скрипты синхронизации.
- **`GLOSSARY.md`** — Единый глоссарий терминов, моделей и связей проекта.
- **`AGENTS.md` / `GEMINI.md`** — Директивы и правила работы AI-ассистента в проекте.

---

## 2. Поток данных (Data Flow)

```
[Посетитель на лендинге]
        │
        ▼ (POST /api/tracker/start, push-events)
[Tracker Script (tracker.ts)] ──► [Express 5 API] ──► [MongoDB (Guests)]
        │                                                     ▲
        ▼ (Deep link ?start={mode}__{guestId})               │
[Telegram Bot (Telegraf)] ────────────────────────────────────┤
        │                                                     │
        ▼ (Уведомление в админский чат)                       │
[CRM Админка (Web Components)] ───────────────────────────────┘
        │
        ▼ (Переключение этапа воронки / Level 1..7)
[Meta Graph API (CAPI)]
```

---

## 3. Топ-10 приоритетных рекомендаций

### 1. Критический баг: двойное чтение ответа (`result.json()`) в Meta CAPI
* **Расположение:** [guests.controller.ts:82-87](file:///d:/_sites/ishvara/server/src/controllers/guests.controller.ts#L82-L87)
* **Проблема:** В методе `sendMetaEvent` при ошибке Meta Graph API выполняется:
  ```ts
  const json = await result.json(); // Тело ответа уже прочитано
  if (!result.ok) {
    const error = await result.json(); // ОШИБКА: Body has already been consumed!
    throw new Error(`Meta CAPI error: ${JSON.stringify(error)}`);
  }
  ```
  Код падает с необработанным исключением `TypeError: Already read`, маскируя реальную причину ошибки Facebook API.
* **Решение:** Использовать уже распарсенную переменную `json`:
  ```ts
  const json = await result.json();
  if (!result.ok) {
    throw new Error(`Meta CAPI error: ${JSON.stringify(json)}`);
  }
  ```

---

### 2. Утечка оперативной памяти при операциях без курсора (`.cursor()`)
* **Расположение:** [statistics.controller.ts:98](file:///d:/_sites/ishvara/server/src/controllers/statistics.controller.ts#L98), [server.controller.ts:48](file:///d:/_sites/ishvara/server/src/controllers/server.controller.ts#L48)
* **Проблема:** В функциях `findUnregistredEvents`, `setTags` и `arhive1` выполняется `Guest.find().lean()`. Загрузка всей базы гостей (десятки тысяч документов с большими массивами `events`) целиком в память сервера приводит к всплескам RAM (OOM-kill на Cloud Run) и долгой блокировке Event Loop.
* **Решение:** Переписать выборки на потоковые курсоры:
  ```ts
  const cursor = Guest.find({ b: { $exists: false } }).cursor({ batchSize: 500 });
  for await (const guest of cursor) {
    // потоковая обработка без накопления в памяти
  }
  ```

---

### 3. Ошибочный индекс в Mongoose-схеме `Guest`
* **Расположение:** [models/Guest.ts:55](file:///d:/_sites/ishvara/server/src/models/Guest.ts#L55)
* **Проблема:** В схеме прописано `GuestSchema.index({ pid: 1 });`. Поля `pid` не существует — во всей кодовой базе и фильтрах используется `projectId`. В итоге создается бесполезный индекс, а запросы с фильтром по проекту сканируют коллекцию целиком (COLLSCAN).
* **Решение:** Заменить на составной индекс:
  ```ts
  GuestSchema.index({ projectId: 1, createdAt: -1 });
  ```

---

### 4. Некорректный экспорт типов (`IGuest.ts` vs `Guest.ts`)
* **Расположение:** [shared/types/index.ts:3](file:///d:/_sites/ishvara/shared/types/index.ts#L3)
* **Проблема:** Экспорт объявлен как `export * from "./Guest";`, но файл на диске называется `IGuest.ts`. В Linux-окружении (Docker, Cloud Run, Jenkins) сборка ломается из-за чувствительности файловой системы к регистру (Case Sensitivity).
* **Решение:** Заменить на:
  ```ts
  export * from "./IGuest.js";
  ```

---

### 5. N+1 сетевые запросы при архивации
* **Расположение:** [server.controller.ts:108](file:///d:/_sites/ishvara/server/src/controllers/server.controller.ts#L108)
* **Проблема:** В цикле архивации для каждой записи вызывается индивидуальный `await Guest.replaceOne(...)`. Для 10 000 записей это означает 10 000 отдельных синхронных сетевых обращений к базе данных, растягивающих операцию на десятки минут.
* **Решение:** Накапливать операции чанками по 500 штук и сбрасывать через `bulkWrite`:
  ```ts
  await Guest.bulkWrite(batchOperations);
  ```

---

### 6. Неэффективный `rateLimit` на эндпоинте трекера
* **Расположение:** [tracker.controller.ts:8-14](file:///d:/_sites/ishvara/server/src/controllers/tracker.controller.ts#L8-L14)
* **Проблема:** В комментарии заявлено «10 штук в час с одного IP», а в параметре указано `max: 10000`. Лимит в 10 тыс. запросов в час фактически не обеспечивает защиту от накрутки сессий и атак на исчерпание ресурсов MongoDB.
* **Решение:** Скорректировать лимит (например, 100 запросов в час) и включить `app.set("trust proxy", 1)` для правильного распознавания клиентских IP за прокси Cloud Run.

---

### 7. Жестко зашитый URL продакшена в клиенте трекера
* **Расположение:** [tracker.ts:1-4](file:///d:/_sites/ishvara/client/src/tracker.ts#L1-L4)
* **Проблема:** В исходном коде трекера прописан статический URL `https://ishvara-api-7097239392.europe-west1.run.app`, а локальный адрес закомментирован. При разработке приходится вручную переключать строки.
* **Решение:** Использовать переменные окружения сборщика Vite:
  ```ts
  const API_URL = import.meta.env.VITE_API_URL || "/api/tracker";
  ```

---

### 8. Абсолютные Windows-пути в скрипте деплоя
* **Расположение:** [deploy_project.ts:5-6](file:///d:/_sites/ishvara/deploy_project.ts#L5-L6)
* **Проблема:** Константы `DEPLOY = "D:/_sites/worked/ishvara"` и `SOURCE = "D:/_sites/ishvara"` привязаны к конкретному диску и структуре папок локальной машины.
* **Решение:** Использовать переменные среды (`process.env.DEPLOY_PATH`) или относительные пути `path.resolve(...)`.

---

### 9. Отсутствие валидации входящих контрактов через Zod
* **Расположение:** [tracker.controller.ts](file:///d:/_sites/ishvara/server/src/controllers/tracker.controller.ts), [guests.controller.ts](file:///d:/_sites/ishvara/server/src/controllers/guests.controller.ts)
* **Проблема:** Пакет `zod` подключен в проекте, но в роутах трекера данные `req.body` читаются напрямую без верификации структуры. Любой некорректный пейлоад (например, не массив в `events`) приводит к падению сервера.
* **Решение:** Добавить мидлвар с Zod-валидацией на эндпоинты `/api/tracker/start`, `/push-events`, `/save-cookies`.

---

### 10. Очистка репозитория от мусорных файлов
* **Расположение:** [server/src/controllers/](file:///d:/_sites/ishvara/server/src/controllers/)
* **Проблема:** В коде присутствуют файлы-дубликаты (`tgbot_admin.controller copy.ts`), системные файлы Windows (`desktop.ini`), а также брошенные закомментированные маршруты `authRoutes` / `userRoutes`.
* **Решение:** Удалить дубликаты, внести `desktop.ini` в `.gitignore` и зафиксировать структуру модулей.
