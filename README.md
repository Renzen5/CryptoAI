# 🤖 Крипто AI - Telegram Mini App

**AI-powered trading signals для бінарних опціонів**

Telegram Mini App з використанням штучного інтелекту для генерації торгових сигналів, аналізу ринку та AI-чату.

---

## 📋 Зміст

- [Вимоги](#-вимоги)
- [Структура проекту](#-структура-проекту)
- [Встановлення](#-встановлення)
- [Налаштування](#-налаштування)
- [Запуск локально](#-запуск-локально)
- [Деплой](#-деплой)
- [Telegram BotFather](#-telegram-botfather)
- [Тестування](#-тестування)

---

## 📦 Вимоги

### Mini App (Next.js)
- Node.js 18+
- npm або yarn

### Telegram Bot (Python)
- Python 3.11+
- pip

### Сервіси
- [Supabase](https://supabase.com) - база даних
- [OpenAI](https://platform.openai.com) - AI генерація сигналів
- [Vercel](https://vercel.com) - хостинг Mini App
- [Railway](https://railway.app) - хостинг бота (опціонально)

---

## 📁 Структура проекту

```
Крипто AI/
├── mini-app/                 # Next.js Mini App
│   ├── app/                  # App Router pages
│   │   ├── api/              # API endpoints
│   │   │   ├── auth/         # Telegram авторизація
│   │   │   ├── chat/         # AI чат
│   │   │   └── signal/       # Генерація сигналів
│   │   ├── chat/             # AI чат сторінка
│   │   ├── history/          # Історія сигналів
│   │   ├── news/             # Економічні новини
│   │   └── more/             # Підтримка
│   ├── components/           # React компоненти
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Утиліти та API клієнти
│   └── supabase/             # Міграції бази даних
│       └── migrations/
│
└── bot/                      # Python Telegram Bot
    ├── handlers/             # Обробники команд
    ├── main.py               # Точка входу
    └── requirements.txt
```

---

## 🔧 Встановлення

### 1. Клонування репозиторію

```bash
git clone <repository-url>
cd "Крипто AI"
```

### 2. Mini App (Next.js)

```bash
cd mini-app
npm install
```

### 3. Telegram Bot (Python)

```bash
cd bot
pip install -r requirements.txt
```

---

## ⚙️ Налаштування

### 1. Створіть Supabase проект

1. Зайдіть на [supabase.com](https://supabase.com)
2. Створіть новий проект
3. Перейдіть до **SQL Editor**
4. Виконайте міграції з `mini-app/supabase/migrations/`:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_functions.sql`

### 2. Отримайте API ключі

| Сервіс | Де отримати |
|--------|-------------|
| Supabase URL & Keys | Project Settings → API |
| OpenAI API Key | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Telegram Bot Token | [@BotFather](https://t.me/BotFather) |
| Finnhub API Key | [finnhub.io/register](https://finnhub.io/register) (опціонально) |

### 3. Налаштуйте змінні оточення

#### Mini App (`mini-app/.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Telegram Bot (`bot/.env`)

```env
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
ADMIN_IDS=123456789,987654321
MINI_APP_URL=https://your-app.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

---

## 🚀 Запуск локально

### Mini App

```bash
cd mini-app
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000)

### Telegram Bot

```bash
cd bot
python main.py
```

---

## ☁️ Деплой

### Vercel (Mini App)

1. **Підключіть репозиторій до Vercel**
   ```bash
   npx vercel
   ```

2. **Налаштуйте змінні оточення в Vercel Dashboard:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `NEXT_PUBLIC_APP_URL` (ваш Vercel домен)

3. **Задеплойте**
   ```bash
   npx vercel --prod
   ```

### Railway (Telegram Bot)

1. **Створіть новий проект на Railway**
   - Підключіть репозиторій
   - Оберіть папку `bot/`

2. **Додайте змінні оточення:**
   - `BOT_TOKEN`
   - `ADMIN_IDS`
   - `MINI_APP_URL`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`

3. **Railway автоматично використає `Procfile`**

---

## 🤖 Telegram BotFather

### 1. Створіть бота

1. Відкрийте [@BotFather](https://t.me/BotFather)
2. Відправте `/newbot`
3. Введіть назву та username
4. Збережіть токен

### 2. Налаштуйте Menu Button

1. Відправте `/mybots` → Оберіть бота
2. **Bot Settings** → **Menu Button**
3. **Configure menu button**
4. Введіть URL вашого Mini App:
   ```
   https://your-app.vercel.app
   ```

### 3. Налаштуйте Web App

1. `/mybots` → Оберіть бота
2. **Bot Settings** → **Configure Mini App**
3. Введіть URL Mini App

---

## 🧪 Тестування

### Чек-ліст перед продакшеном

#### ✅ Авторизація
- [ ] Mini App відкривається в Telegram
- [ ] Користувач авторизується автоматично
- [ ] `initData` валідується на сервері
- [ ] Токен зберігається в sessionStorage

#### ✅ Whitelist
- [ ] Користувачі в whitelist мають доступ
- [ ] Користувачі не в whitelist бачать "Доступ заборонено"
- [ ] Адмін може додавати користувачів через бота

#### ✅ Генерація сигналів
- [ ] Сигнали генеруються через OpenAI API
- [ ] Відображається валютна пара, напрямок, точність
- [ ] Працює таймер зворотного відліку
- [ ] Результат (WIN/LOSE) показується коректно

#### ✅ AI Чат
- [ ] Повідомлення відправляються
- [ ] AI відповідає коректно
- [ ] Історія чату зберігається в сесії

#### ✅ Інше
- [ ] Історія сигналів завантажується
- [ ] Новини відображаються
- [ ] Графік TradingView працює
- [ ] Навігація працює коректно

---

## 📝 Ліцензія

MIT License

---

## 🆘 Підтримка

Якщо виникли питання, зверніться до адміністратора.
