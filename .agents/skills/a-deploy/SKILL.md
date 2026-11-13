---
name: a-deploy
description: >-
  Управление сервисами Google Cloud (Cloud Run, Cloud Scheduler, Cloud Build) в проекте liner-486905.
  Активируется при /a-deploy, фразах "задеплой", "деплой в облако", "cloud scheduler", "триггер в облаке", !деплой.
---

# Google Cloud и Cloud Scheduler (/a-deploy)

Регламент работы с инфраструктурой Google Cloud Platform для проекта.

## Параметры GCP
- **GCP Project:** `liner-486905`
- **Region:** `europe-west1`
- **Аккаунт:** `angel.yarkiy@gmail.com`
- **GCloud CLI:** `C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd`

## Управление Cloud Scheduler

### 1. Просмотр задач
```powershell
& "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" scheduler jobs list --project=liner-486905 --location=europe-west1
```

### 2. Запуск задачи вручную (проверка)
```powershell
& "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" scheduler jobs run <JOB_ID> --project=liner-486905 --location=europe-west1
```

### 3. Создание / обновление HTTP-триггера
```powershell
& "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" scheduler jobs create http <JOB_ID> `
  --project=liner-486905 `
  --location=europe-west1 `
  --schedule="0 12 * * *" `
  --time-zone="Asia/Tashkent" `
  --uri="<TARGET_URL>" `
  --http-method=GET `
  --attempt-deadline=600s
```

## Cloud Run & Cloud Build
- **Сервисы:**
  - `ishvara-api`: `https://ishvara-api-7097239392.europe-west1.run.app` (ветка `master`)
  - `a-nodes`: `https://a-nodes-7097239392.europe-west1.run.app` (ветка `main`)
- **Cloud Scheduler триггеры:**
  - `ishvara-daily-archive`: 12:00 (`Asia/Tashkent`), вызывает `GET /api/server/cron-daily-arhive`
  - `daily-morning-run`: 08:00 (`Asia/Samarkand`)
- **Просмотр билдов:**
  ```powershell
  & "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" builds list --project=liner-486905 --limit=5
  ```
