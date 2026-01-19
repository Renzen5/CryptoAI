"""
Start command handler
"""
from telegram import Update
from telegram.ext import ContextTypes, CommandHandler, Application

from config import MESSAGES
from database import check_whitelist, add_user
from keyboards import get_main_keyboard, get_access_denied_keyboard

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command"""
    user = update.effective_user
    
    if not user:
        return
    
    # Save user to database
    add_user(
        telegram_id=user.id,
        username=user.username,
        first_name=user.first_name,
    )
    
    # Check if user is whitelisted
    is_whitelisted = check_whitelist(user.id)
    
    if is_whitelisted:
        # User has access - show Mini App button
        await update.message.reply_text(
            MESSAGES["welcome"],
            parse_mode="HTML",
            reply_markup=get_main_keyboard(),
        )
    else:
        # User doesn't have access
        await update.message.reply_text(
            MESSAGES["access_denied"],
            parse_mode="HTML",
            reply_markup=get_access_denied_keyboard(),
        )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /help command"""
    help_text = """
📚 <b>Довідка AI Trade Bot</b>

<b>Команди:</b>
/start - Почати роботу з ботом
/help - Показати цю довідку

<b>Як користуватися:</b>
1. Натисніть кнопку "Відкрити AI Trade"
2. Оберіть валютну пару та таймфрейм
3. Отримайте AI сигнал
4. Відкрийте угоду у вашому брокері

<b>Підтримка:</b>
@ai_trade_support
"""
    await update.message.reply_text(help_text, parse_mode="HTML")

def setup_start_handlers(app: Application):
    """Register start handlers"""
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
