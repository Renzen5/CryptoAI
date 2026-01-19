"""
Keyboards for AI Trade Bot
"""
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from config import MINI_APP_URL

def get_main_keyboard() -> InlineKeyboardMarkup:
    """Main keyboard with Mini App button"""
    keyboard = [
        [InlineKeyboardButton(
            text="🚀 Открыть AI Trade",
            web_app=WebAppInfo(url=MINI_APP_URL)
        )],
        [InlineKeyboardButton(
            text="📊 Поддержка",
            url="https://t.me/ai_trade_support"
        )],
    ]
    return InlineKeyboardMarkup(keyboard)

def get_access_denied_keyboard() -> InlineKeyboardMarkup:
    """Keyboard for users without access"""
    keyboard = [
        [InlineKeyboardButton(
            text="📝 Подать заявку",
            url="https://t.me/ai_trade_support"
        )],
    ]
    return InlineKeyboardMarkup(keyboard)

def get_admin_keyboard() -> InlineKeyboardMarkup:
    """Admin panel keyboard"""
    keyboard = [
        [
            InlineKeyboardButton(text="➕ Добавить", callback_data="admin_add"),
            InlineKeyboardButton(text="➖ Удалить", callback_data="admin_remove"),
        ],
        [
            InlineKeyboardButton(text="📋 Whitelist", callback_data="admin_list"),
            InlineKeyboardButton(text="📊 Статистика", callback_data="admin_stats"),
        ],
        [
            InlineKeyboardButton(text="🔙 Закрыть", callback_data="admin_close"),
        ],
    ]
    return InlineKeyboardMarkup(keyboard)

def get_back_keyboard() -> InlineKeyboardMarkup:
    """Back button keyboard"""
    keyboard = [
        [InlineKeyboardButton(text="🔙 Назад", callback_data="admin_back")],
    ]
    return InlineKeyboardMarkup(keyboard)

def get_confirm_keyboard(action: str, user_id: str) -> InlineKeyboardMarkup:
    """Confirmation keyboard"""
    keyboard = [
        [
            InlineKeyboardButton(text="✅ Подтвердить", callback_data=f"confirm_{action}_{user_id}"),
            InlineKeyboardButton(text="❌ Отменить", callback_data="admin_back"),
        ],
    ]
    return InlineKeyboardMarkup(keyboard)
