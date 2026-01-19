"""
AI Trade Bot Configuration
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Telegram Bot Token
BOT_TOKEN = os.getenv("BOT_TOKEN", "")

# Admin IDs (comma-separated in .env)
ADMIN_IDS_STR = os.getenv("ADMIN_IDS", "")
ADMIN_IDS = [int(id.strip()) for id in ADMIN_IDS_STR.split(",") if id.strip()]

# Mini App URL
MINI_APP_URL = os.getenv("MINI_APP_URL", "https://t.me/ai_trade_bot/app")

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# Bot Messages (Russian)
MESSAGES = {
    "welcome": """
🤖 <b>Добро пожаловать в AI Trade!</b>

Это бот для получения AI-сигналов для торговли бинарными опционами.

📊 <b>Возможности:</b>
• Точные торговые сигналы
• AI анализ рынка
• Экономический календарь
• Чат с AI ассистентом

Нажмите кнопку ниже, чтобы открыть приложение 👇
""",
    
    "access_denied": """
⛔️ <b>Доступ закрыт</b>

К сожалению, у вас нет доступа к этому сервису.

Для получения доступа обратитесь к администратору: @ai_trade_support
""",
    
    "admin_welcome": """
🔐 <b>Панель администратора</b>

👥 Пользователей в whitelist: {whitelist_count}
📊 Всего пользователей: {total_count}

Выберите действие:
""",
    
    "user_added": "✅ Пользователь {user} успешно добавлен в whitelist!",
    "user_removed": "❌ Пользователь {user} удалён из whitelist!",
    "user_not_found": "⚠️ Пользователь не найден.",
    "enter_user": "Введите @username или Telegram ID пользователя:",
    "whitelist_empty": "📭 Whitelist пуст.",
}
