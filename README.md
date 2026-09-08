# ClothesTrade

Сайт-магазин для продажи одежды ручной работы. Заявки на заказ оформляются без онлайн-оплаты; уведомления мастеру приходят в Telegram.

## Стек

- **Backend**: FastAPI + SQLAlchemy + Alembic, PostgreSQL, Poetry, Ruff
- **Frontend**: React + TypeScript + Vite, ESLint + Prettier
- **Nginx**: раздаёт фронтенд, проксирует `/api` и `/uploads` на бэкенд
- **Docker Compose**: единая среда для разработки и продакшена

## Запуск (прод-сборка)

```bash
cp .env.example .env
docker compose up --build
```

Сайт будет на `http://localhost` (или на вашем статическом IP, когда домен ещё не подключён).

## Запуск (разработка, hot-reload)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

- Фронтенд (Vite dev server): http://localhost:5173
- Бэкенд (FastAPI): http://localhost:8000/docs

## Админка (API)

При первом старте бэкенд автоматически создаёт админ-пользователя из переменных окружения `ADMIN_EMAIL` / `ADMIN_PASSWORD` (см. `.env.example`) — обязательно смените пароль перед деплоем.

- `POST /api/v1/auth/login` — форма `username`/`password`, возвращает JWT (`access_token`)
- `/api/v1/admin/products`, `/api/v1/admin/categories`, `/api/v1/admin/orders` — CRUD, требуют заголовок `Authorization: Bearer <token>`
- `POST /api/v1/admin/products/{id}/images` — загрузка фото товара (`multipart/form-data`, поле `file`)

## Миграции БД

```bash
docker compose exec backend alembic revision --autogenerate -m "init"
docker compose exec backend alembic upgrade head
```

## Линтинг

```bash
# backend
cd backend && poetry install && poetry run ruff check . && poetry run ruff format .

# frontend
cd frontend && npm install && npm run lint && npm run format
```

## Структура проекта

```
backend/    FastAPI-приложение (app/), Alembic-миграции
frontend/   React SPA (src/)
nginx/      конфиг reverse proxy
```

## Roadmap

1. ✅ Скелет проекта (структура, docker-compose, Dockerfile'ы, Alembic)
2. ✅ Backend: CRUD товаров/категорий, JWT-авторизация админки, API заявок
3. Публичный фронт: каталог, карточка товара, форма заявки
4. Админка: логин, управление товарами (загрузка фото), список заявок
5. Уведомления через Telegram-бота
6. Полировка: адаптивность, SEO, оптимизация фото
7. Деплой: домен + TLS (Let's Encrypt) на статический IP
