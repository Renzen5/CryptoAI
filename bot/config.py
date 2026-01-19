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

# Bot Messages (Ukrainian)
MESSAGES = {
    "welcome": """
🤖 <b>Ласкаво просимо до AI Trade!</b>

Це бот для отримання AI-сигналів для торгівлі бінарними опціонами.

📊 <b>Можливості:</b>
• Точні торгові сигнали
• AI аналіз ринку
• Економічний календар
• Чат з AI асистентом

Натисніть кнопку нижче, щоб відкрити додаток 👇
""",
    
    "access_denied": """
⛔️ <b>Доступ закрито</b>

На жаль, у вас немає доступу до цього сервісу.

Для отримання доступу зверніться до адміністратора: @ai_trade_support
""",
    
    "admin_welcome": """
🔐 <b>Панель адміністратора</b>

👥 Користувачів у whitelist: {whitelist_count}
📊 Всього користувачів: {total_count}

Оберіть дію:
""",
    
    "user_added": "✅ Користувач {user} успішно доданий до whitelist!",
    "user_removed": "❌ Користувач {user} видалений з whitelist!",
    "user_not_found": "⚠️ Користувача не знайдено.",
    "enter_user": "Введіть @username або Telegram ID користувача:",
    "whitelist_empty": "📭 Whitelist порожній.",
}
