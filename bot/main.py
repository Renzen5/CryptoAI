import asyncio
import logging
import os
from dotenv import load_dotenv
from supabase import create_client, Client

from aiogram import Bot, Dispatcher, Router, F
from aiogram.filters import Command, CommandStart
from aiogram.types import (
    Message, CallbackQuery, 
    InlineKeyboardMarkup, InlineKeyboardButton,
    WebAppInfo
)
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

# Load environment
load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
ADMIN_IDS = [int(x) for x in os.getenv("ADMIN_IDS", "").split(",") if x]
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://your-app.vercel.app")

# Init Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Router
router = Router()

# States
class AddUserState(StatesGroup):
    waiting_for_id = State()

class RemoveUserState(StatesGroup):
    waiting_for_id = State()


def is_admin(user_id: int) -> bool:
    return user_id in ADMIN_IDS


def get_main_keyboard() -> InlineKeyboardMarkup:
    """Main menu keyboard for regular users"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="🚀 Открыть INSIDER.AI",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ])


def get_admin_keyboard() -> InlineKeyboardMarkup:
    """Admin panel keyboard"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="➕ Добавить", callback_data="admin_add"),
            InlineKeyboardButton(text="➖ Удалить", callback_data="admin_remove")
        ],
        [
            InlineKeyboardButton(text="📋 Whitelist", callback_data="admin_whitelist"),
            InlineKeyboardButton(text="📊 Статистика", callback_data="admin_stats")
        ],
        [InlineKeyboardButton(text="🔙 Закрыть", callback_data="admin_close")]
    ])


async def get_whitelist_count() -> int:
    """Get count of users in whitelist"""
    result = supabase.table("telegram_whitelist").select("id", count="exact").execute()
    return result.count if result.count else 0


async def get_total_users() -> int:
    """Get total profiles count"""
    result = supabase.table("profiles").select("id", count="exact").execute()
    return result.count if result.count else 0


async def check_whitelist(telegram_id: int) -> bool:
    """Check if user is in whitelist"""
    result = supabase.table("telegram_whitelist").select("id").eq("telegram_id", telegram_id).execute()
    return len(result.data) > 0


async def add_to_whitelist(telegram_id: int, username: str = None, first_name: str = None, added_by: int = None):
    """Add user to whitelist"""
    supabase.table("telegram_whitelist").upsert({
        "telegram_id": telegram_id,
        "username": username,
        "first_name": first_name,
        "added_by": added_by,
        "is_active": True
    }).execute()


async def remove_from_whitelist(telegram_id: int):
    """Remove user from whitelist"""
    supabase.table("telegram_whitelist").delete().eq("telegram_id", telegram_id).execute()


async def get_whitelist() -> list:
    """Get all whitelisted users"""
    result = supabase.table("telegram_whitelist").select("*").order("created_at", desc=True).limit(50).execute()
    return result.data


# ========== HANDLERS ==========

@router.message(CommandStart())
async def cmd_start(message: Message):
    """Start command - show main menu or access denied"""
    user_id = message.from_user.id
    
    # Check if user is in whitelist
    if await check_whitelist(user_id):
        await message.answer(
            "🚀 <b>Добро пожаловать в INSIDER.AI!</b>\n\n"
            "Нажмите кнопку ниже, чтобы открыть приложение:",
            reply_markup=get_main_keyboard(),
            parse_mode="HTML"
        )
    else:
        await message.answer(
            "⛔ <b>Доступ запрещён</b>\n\n"
            "Ваш аккаунт не активирован.\n"
            f"Ваш Telegram ID: <code>{user_id}</code>\n\n"
            "Обратитесь к администратору для получения доступа.",
            parse_mode="HTML"
        )


@router.message(Command("admin"))
async def cmd_admin(message: Message):
    """Admin panel command"""
    if not is_admin(message.from_user.id):
        await message.answer("⛔ У вас нет доступа к админ-панели.")
        return
    
    whitelist_count = await get_whitelist_count()
    total_users = await get_total_users()
    
    await message.answer(
        "🔐 <b>Панель администратора</b>\n\n"
        f"👥 Пользователей в whitelist: <b>{whitelist_count}</b>\n"
        f"📊 Всего пользователей: <b>{total_users}</b>\n\n"
        "Выберите действие:",
        reply_markup=get_admin_keyboard(),
        parse_mode="HTML"
    )


@router.callback_query(F.data == "admin_add")
async def admin_add(callback: CallbackQuery, state: FSMContext):
    """Add user to whitelist"""
    if not is_admin(callback.from_user.id):
        await callback.answer("⛔ Нет доступа", show_alert=True)
        return
    
    await callback.message.edit_text(
        "➕ <b>Добавление пользователя</b>\n\n"
        "Отправьте Telegram ID пользователя:",
        parse_mode="HTML"
    )
    await state.set_state(AddUserState.waiting_for_id)
    await callback.answer()


@router.message(AddUserState.waiting_for_id)
async def process_add_user(message: Message, state: FSMContext):
    """Process adding user"""
    if not is_admin(message.from_user.id):
        return
    
    try:
        telegram_id = int(message.text.strip())
        await add_to_whitelist(telegram_id, added_by=message.from_user.id)
        await message.answer(
            f"✅ Пользователь <code>{telegram_id}</code> добавлен в whitelist!",
            reply_markup=get_admin_keyboard(),
            parse_mode="HTML"
        )
    except ValueError:
        await message.answer(
            "❌ Неверный формат ID. Отправьте число.",
            reply_markup=get_admin_keyboard()
        )
    
    await state.clear()


@router.callback_query(F.data == "admin_remove")
async def admin_remove(callback: CallbackQuery, state: FSMContext):
    """Remove user from whitelist"""
    if not is_admin(callback.from_user.id):
        await callback.answer("⛔ Нет доступа", show_alert=True)
        return
    
    await callback.message.edit_text(
        "➖ <b>Удаление пользователя</b>\n\n"
        "Отправьте Telegram ID пользователя:",
        parse_mode="HTML"
    )
    await state.set_state(RemoveUserState.waiting_for_id)
    await callback.answer()


@router.message(RemoveUserState.waiting_for_id)
async def process_remove_user(message: Message, state: FSMContext):
    """Process removing user"""
    if not is_admin(message.from_user.id):
        return
    
    try:
        telegram_id = int(message.text.strip())
        await remove_from_whitelist(telegram_id)
        await message.answer(
            f"✅ Пользователь <code>{telegram_id}</code> удалён из whitelist!",
            reply_markup=get_admin_keyboard(),
            parse_mode="HTML"
        )
    except ValueError:
        await message.answer(
            "❌ Неверный формат ID. Отправьте число.",
            reply_markup=get_admin_keyboard()
        )
    
    await state.clear()


@router.callback_query(F.data == "admin_whitelist")
async def admin_show_whitelist(callback: CallbackQuery):
    """Show whitelist"""
    if not is_admin(callback.from_user.id):
        await callback.answer("⛔ Нет доступа", show_alert=True)
        return
    
    users = await get_whitelist()
    
    if not users:
        text = "📋 <b>Whitelist пуст</b>"
    else:
        text = "📋 <b>Whitelist:</b>\n\n"
        for i, user in enumerate(users[:20], 1):
            username = f"@{user['username']}" if user.get('username') else "—"
            name = user.get('first_name') or "—"
            text += f"{i}. <code>{user['telegram_id']}</code> | {username} | {name}\n"
        
        if len(users) > 20:
            text += f"\n... и ещё {len(users) - 20}"
    
    await callback.message.edit_text(
        text,
        reply_markup=get_admin_keyboard(),
        parse_mode="HTML"
    )
    await callback.answer()


@router.callback_query(F.data == "admin_stats")
async def admin_stats(callback: CallbackQuery):
    """Show statistics"""
    if not is_admin(callback.from_user.id):
        await callback.answer("⛔ Нет доступа", show_alert=True)
        return
    
    whitelist_count = await get_whitelist_count()
    total_users = await get_total_users()
    
    # Get trade history count
    trades_result = supabase.table("trade_history").select("id", count="exact").execute()
    trades_count = trades_result.count if trades_result.count else 0
    
    await callback.message.edit_text(
        "📊 <b>Статистика</b>\n\n"
        f"👥 Пользователей в whitelist: <b>{whitelist_count}</b>\n"
        f"📊 Всего профилей: <b>{total_users}</b>\n"
        f"📈 Всего сделок: <b>{trades_count}</b>",
        reply_markup=get_admin_keyboard(),
        parse_mode="HTML"
    )
    await callback.answer()


@router.callback_query(F.data == "admin_close")
async def admin_close(callback: CallbackQuery):
    """Close admin panel"""
    await callback.message.delete()
    await callback.answer()


# ========== MAIN ==========

async def main():
    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher()
    dp.include_router(router)
    
    logger.info("Bot starting...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
