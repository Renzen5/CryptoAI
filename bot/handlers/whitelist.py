"""
Whitelist management handlers
"""
from telegram import Update
from telegram.ext import (
    ContextTypes, 
    CallbackQueryHandler, 
    MessageHandler,
    ConversationHandler,
    filters,
    Application,
)

from config import ADMIN_IDS, MESSAGES
from database import add_to_whitelist, remove_from_whitelist, get_all_users
from keyboards import get_admin_keyboard, get_back_keyboard

# Conversation states
WAITING_ADD_USER = 1
WAITING_REMOVE_USER = 2

def is_admin(user_id: int) -> bool:
    """Check if user is admin"""
    return user_id in ADMIN_IDS

async def add_user_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Start adding user to whitelist"""
    query = update.callback_query
    user = update.effective_user
    
    if not user or not is_admin(user.id):
        await query.answer("⛔️ Доступ заборонено", show_alert=True)
        return ConversationHandler.END
    
    await query.answer()
    await query.message.edit_text(
        "➕ <b>Додавання користувача</b>\n\n" + MESSAGES["enter_user"],
        parse_mode="HTML",
        reply_markup=get_back_keyboard(),
    )
    return WAITING_ADD_USER

async def add_user_finish(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Finish adding user to whitelist"""
    user_input = update.message.text.strip()
    
    result = add_to_whitelist(user_input)
    
    if result:
        await update.message.reply_text(
            MESSAGES["user_added"].format(user=result),
            parse_mode="HTML",
            reply_markup=get_admin_keyboard(),
        )
    else:
        await update.message.reply_text(
            MESSAGES["user_not_found"],
            parse_mode="HTML",
            reply_markup=get_admin_keyboard(),
        )
    
    return ConversationHandler.END

async def remove_user_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Start removing user from whitelist"""
    query = update.callback_query
    user = update.effective_user
    
    if not user or not is_admin(user.id):
        await query.answer("⛔️ Доступ заборонено", show_alert=True)
        return ConversationHandler.END
    
    await query.answer()
    await query.message.edit_text(
        "➖ <b>Видалення користувача</b>\n\n" + MESSAGES["enter_user"],
        parse_mode="HTML",
        reply_markup=get_back_keyboard(),
    )
    return WAITING_REMOVE_USER

async def remove_user_finish(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Finish removing user from whitelist"""
    user_input = update.message.text.strip()
    
    result = remove_from_whitelist(user_input)
    
    if result:
        await update.message.reply_text(
            MESSAGES["user_removed"].format(user=result),
            parse_mode="HTML",
            reply_markup=get_admin_keyboard(),
        )
    else:
        await update.message.reply_text(
            MESSAGES["user_not_found"],
            parse_mode="HTML",
            reply_markup=get_admin_keyboard(),
        )
    
    return ConversationHandler.END

async def show_whitelist(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show whitelist users"""
    query = update.callback_query
    user = update.effective_user
    
    if not user or not is_admin(user.id):
        await query.answer("⛔️ Доступ заборонено", show_alert=True)
        return
    
    await query.answer()
    
    users = get_all_users(whitelisted_only=True)
    
    if not users:
        await query.message.edit_text(
            MESSAGES["whitelist_empty"],
            parse_mode="HTML",
            reply_markup=get_admin_keyboard(),
        )
        return
    
    # Build user list
    user_lines = []
    for i, u in enumerate(users[:20], 1):  # Limit to 20 users
        username = f"@{u['username']}" if u.get('username') else f"ID: {u['telegram_id']}"
        name = u.get('first_name', '')
        user_lines.append(f"{i}. {username} {name}")
    
    text = "📋 <b>Whitelist</b>\n\n" + "\n".join(user_lines)
    
    if len(users) > 20:
        text += f"\n\n... та ще {len(users) - 20}"
    
    await query.message.edit_text(
        text,
        parse_mode="HTML",
        reply_markup=get_admin_keyboard(),
    )

async def cancel_conversation(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Cancel current conversation"""
    query = update.callback_query
    await query.answer()
    
    from database import get_stats
    stats = get_stats()
    
    message = MESSAGES["admin_welcome"].format(
        whitelist_count=stats["whitelisted"],
        total_count=stats["total"],
    )
    
    await query.message.edit_text(
        message,
        parse_mode="HTML",
        reply_markup=get_admin_keyboard(),
    )
    return ConversationHandler.END

def setup_whitelist_handlers(app: Application):
    """Register whitelist handlers"""
    
    # Add user conversation
    add_conv = ConversationHandler(
        entry_points=[CallbackQueryHandler(add_user_start, pattern="^admin_add$")],
        states={
            WAITING_ADD_USER: [MessageHandler(filters.TEXT & ~filters.COMMAND, add_user_finish)],
        },
        fallbacks=[CallbackQueryHandler(cancel_conversation, pattern="^admin_back$")],
    )
    
    # Remove user conversation
    remove_conv = ConversationHandler(
        entry_points=[CallbackQueryHandler(remove_user_start, pattern="^admin_remove$")],
        states={
            WAITING_REMOVE_USER: [MessageHandler(filters.TEXT & ~filters.COMMAND, remove_user_finish)],
        },
        fallbacks=[CallbackQueryHandler(cancel_conversation, pattern="^admin_back$")],
    )
    
    app.add_handler(add_conv)
    app.add_handler(remove_conv)
    app.add_handler(CallbackQueryHandler(show_whitelist, pattern="^admin_list$"))
