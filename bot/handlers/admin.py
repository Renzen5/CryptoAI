"""
Admin panel handlers
"""
from telegram import Update
from telegram.ext import ContextTypes, CommandHandler, CallbackQueryHandler, Application

from config import ADMIN_IDS, MESSAGES
from database import get_stats
from keyboards import get_admin_keyboard

def is_admin(user_id: int) -> bool:
    """Check if user is admin"""
    return user_id in ADMIN_IDS

async def admin_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /admin command"""
    user = update.effective_user
    
    if not user or not is_admin(user.id):
        await update.message.reply_text("⛔️ У вас немає доступу до панелі адміністратора.")
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
        await query.answer("⛔️ Доступ заборонено", show_alert=True)
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

👥 Всього користувачів: <b>{stats['total']}</b>
✅ У whitelist: <b>{stats['whitelisted']}</b>
❌ Без доступу: <b>{stats['total'] - stats['whitelisted']}</b>
"""
        await query.message.edit_text(
            stats_text,
            parse_mode="HTML",
            reply_markup=get_admin_keyboard(),
        )

def setup_admin_handlers(app: Application):
    """Register admin handlers"""
    app.add_handler(CommandHandler("admin", admin_command))
    app.add_handler(CallbackQueryHandler(admin_callback, pattern="^admin_"))
