"""
Admin panel handlers
"""
from telegram import Update
from telegram.ext import ContextTypes, CommandHandler, CallbackQueryHandler, Application

from config import ADMIN_IDS, MESSAGES
from database import get_stats, get_all_users, add_to_whitelist, remove_from_whitelist
from keyboards import get_admin_keyboard, get_back_keyboard

def is_admin(user_id: int) -> bool:
    """Check if user is admin"""
    return user_id in ADMIN_IDS

async def admin_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /admin command"""
    user = update.effective_user
    
    if not user or not is_admin(user.id):
        await update.message.reply_text("⛔️ У вас нет доступа к панели администратора.")
        return
    
    stats = get_stats()
    
    message = MESSAGES["admin_welcome"].format(
        whitelist_count=stats["whitelisted"],
        total_count=stats["total"],
    )
    
    await update.message.reply_text(
        message,
        parse_mode="HTML",
        reply_markup=get_admin_keyboard(),
    )

async def admin_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle admin panel callbacks"""
    query = update.callback_query
    user = update.effective_user
    
    if not user or not is_admin(user.id):
        await query.answer("⛔️ Доступ запрещён", show_alert=True)
        return
    
    await query.answer()
    data = query.data
    
    if data == "admin_close":
        await query.message.delete()
        
    elif data == "admin_back":
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
        
    elif data == "admin_stats":
        stats = get_stats()
        stats_text = f"""
📊 <b>Статистика</b>

👥 Всего пользователей: <b>{stats['total']}</b>
✅ В whitelist: <b>{stats['whitelisted']}</b>
❌ Без доступа: <b>{stats['total'] - stats['whitelisted']}</b>
"""
        await query.message.edit_text(
            stats_text,
            parse_mode="HTML",
            reply_markup=get_back_keyboard(),
        )

    elif data == "admin_list":
        # Show whitelist
        users = get_all_users(whitelisted_only=True)
        if users:
            users_text = "📋 <b>Whitelist:</b>\n\n"
            for i, user in enumerate(users[:20], 1):  # Limit to 20
                username = user.get("username") or "N/A"
                tid = user.get("telegram_id")
                name = user.get("first_name") or ""
                users_text += f"{i}. @{username} ({tid}) - {name}\n"
            if len(users) > 20:
                users_text += f"\n... и ещё {len(users) - 20} пользователей"
        else:
            users_text = "📋 <b>Whitelist пуст</b>"
        
        await query.message.edit_text(
            users_text,
            parse_mode="HTML",
            reply_markup=get_back_keyboard(),
        )
    
    elif data == "admin_add":
        # Prompt to add user
        context.user_data["admin_action"] = "add"
        await query.message.edit_text(
            "➕ <b>Добавить пользователя</b>\n\n"
            "Отправьте username (с @) или Telegram ID:\n\n"
            "Пример: <code>@username</code> или <code>123456789</code>\n\n"
            "Для отмены нажмите /admin",
            parse_mode="HTML",
            reply_markup=get_back_keyboard(),
        )
    
    elif data == "admin_remove":
        # Prompt to remove user
        context.user_data["admin_action"] = "remove"
        await query.message.edit_text(
            "➖ <b>Удалить пользователя</b>\n\n"
            "Отправьте username (с @) или Telegram ID:\n\n"
            "Пример: <code>@username</code> или <code>123456789</code>\n\n"
            "Для отмены нажмите /admin",
            parse_mode="HTML",
            reply_markup=get_back_keyboard(),
        )

async def admin_text_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle text input from admin for adding/removing users"""
    user = update.effective_user
    
    if not user or not is_admin(user.id):
        return
    
    action = context.user_data.get("admin_action")
    if not action:
        return
    
    text = update.message.text.strip()
    
    if action == "add":
        result = add_to_whitelist(text)
        if result:
            await update.message.reply_text(
                f"✅ Пользователь <b>{result}</b> добавлен в whitelist!",
                parse_mode="HTML",
            )
        else:
            await update.message.reply_text(
                f"❌ Не удалось добавить пользователя. Проверьте данные.",
                parse_mode="HTML",
            )
    elif action == "remove":
        result = remove_from_whitelist(text)
        if result:
            await update.message.reply_text(
                f"✅ Пользователь <b>{result}</b> удалён из whitelist!",
                parse_mode="HTML",
            )
        else:
            await update.message.reply_text(
                f"❌ Не удалось удалить пользователя. Проверьте данные.",
                parse_mode="HTML",
            )
    
    # Clear action
    context.user_data.pop("admin_action", None)

def setup_admin_handlers(app: Application):
    """Register admin handlers"""
    from telegram.ext import MessageHandler, filters
    
    app.add_handler(CommandHandler("admin", admin_command))
    app.add_handler(CallbackQueryHandler(admin_callback, pattern="^admin_"))
    # Text handler for admin input (lower priority)
    app.add_handler(MessageHandler(
        filters.TEXT & ~filters.COMMAND & filters.ChatType.PRIVATE,
        admin_text_handler
    ), group=1)
