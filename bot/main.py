"""
AI Trade Telegram Bot
Main entry point
"""
import logging
from telegram.ext import Application

from config import BOT_TOKEN
from database import init_database
from handlers import setup_start_handlers, setup_admin_handlers, setup_whitelist_handlers

# Configure logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

def main():
    """Start the bot"""
    
    # Check if BOT_TOKEN is set
    if not BOT_TOKEN:
        logger.error("❌ BOT_TOKEN not set! Please set it in .env file")
        print("\n⚠️  Створіть файл .env з наступним вмістом:")
        print("BOT_TOKEN=your_bot_token_here")
        print("ADMIN_IDS=your_telegram_id")
        print("MINI_APP_URL=https://t.me/your_bot/app")
        print("SUPABASE_URL=your_supabase_url")
        print("SUPABASE_KEY=your_supabase_key")
        return
    
    # Initialize database
    init_database()
    
    # Create application
    app = Application.builder().token(BOT_TOKEN).build()
    
    # Register handlers
    setup_start_handlers(app)
    setup_admin_handlers(app)
    setup_whitelist_handlers(app)
    
    # Start polling
    logger.info("🤖 Bot starting...")
    print("\n" + "="*50)
    print("🤖 AI Trade Bot запущено!")
    print("="*50)
    print("\nКоманди:")
    print("  /start - Почати роботу")
    print("  /admin - Панель адміністратора")
    print("  /help  - Довідка")
    print("\nДля зупинки натисніть Ctrl+C")
    print("="*50 + "\n")
    
    app.run_polling(allowed_updates=["message", "callback_query"])

if __name__ == "__main__":
    main()
