"""
Database operations for AI Trade Bot
Uses Supabase as backend
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY

# Initialize Supabase client
supabase: Client = None

def init_database():
    """Initialize Supabase connection"""
    global supabase
    if SUPABASE_URL and SUPABASE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase connected")
    else:
        print("⚠️ Supabase not configured, using local mode")

def get_user(telegram_id: int) -> Optional[Dict[str, Any]]:
    """Get user by Telegram ID"""
    if not supabase:
        return None
    
    try:
        result = supabase.table("users").select("*").eq("telegram_id", str(telegram_id)).execute()
        if result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error getting user: {e}")
        return None

def add_user(
    telegram_id: int,
    username: Optional[str] = None,
    first_name: Optional[str] = None,
    is_whitelisted: bool = False
) -> bool:
    """Add or update user in database"""
    if not supabase:
        return False
    
    try:
        existing = get_user(telegram_id)
        
        if existing:
            # Update existing user - DO NOT overwrite is_whitelisted!
            user_data = {
                "username": username,
                "first_name": first_name,
                "updated_at": datetime.utcnow().isoformat(),
            }
            supabase.table("users").update(user_data).eq("telegram_id", str(telegram_id)).execute()
        else:
            # Insert new user
            user_data = {
                "telegram_id": str(telegram_id),
                "username": username,
                "first_name": first_name,
                "is_whitelisted": is_whitelisted,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }
            supabase.table("users").insert(user_data).execute()
        
        return True
    except Exception as e:
        print(f"Error adding user: {e}")
        return False

def check_whitelist(telegram_id: int) -> bool:
    """Check if user is whitelisted"""
    if not supabase:
        # If no database, deny access by default
        return False
    
    user = get_user(telegram_id)
    return user.get("is_whitelisted", False) if user else False

def add_to_whitelist(identifier: str) -> Optional[str]:
    """Add user to whitelist by username or ID"""
    if not supabase:
        return None
    
    try:
        # Check if it's a Telegram ID or username
        if identifier.startswith("@"):
            username = identifier[1:]
            result = supabase.table("users").select("*").eq("username", username).execute()
        else:
            try:
                telegram_id = int(identifier)
                result = supabase.table("users").select("*").eq("telegram_id", str(telegram_id)).execute()
            except ValueError:
                # Treat as username without @
                result = supabase.table("users").select("*").eq("username", identifier).execute()
        
        if result.data:
            user = result.data[0]
            supabase.table("users").update({"is_whitelisted": True}).eq("id", user["id"]).execute()
            return user.get("username") or user.get("telegram_id")
        else:
            # Create new user entry if it looks like a Telegram ID
            try:
                telegram_id = int(identifier.replace("@", ""))
                add_user(telegram_id, is_whitelisted=True)
                return identifier
            except ValueError:
                return None
    except Exception as e:
        print(f"Error adding to whitelist: {e}")
        return None

def remove_from_whitelist(identifier: str) -> Optional[str]:
    """Remove user from whitelist by username or ID"""
    if not supabase:
        return None
    
    try:
        # Check if it's a Telegram ID or username
        if identifier.startswith("@"):
            username = identifier[1:]
            result = supabase.table("users").select("*").eq("username", username).execute()
        else:
            try:
                telegram_id = int(identifier)
                result = supabase.table("users").select("*").eq("telegram_id", str(telegram_id)).execute()
            except ValueError:
                result = supabase.table("users").select("*").eq("username", identifier).execute()
        
        if result.data:
            user = result.data[0]
            supabase.table("users").update({"is_whitelisted": False}).eq("id", user["id"]).execute()
            return user.get("username") or user.get("telegram_id")
        return None
    except Exception as e:
        print(f"Error removing from whitelist: {e}")
        return None

def get_all_users(whitelisted_only: bool = False) -> List[Dict[str, Any]]:
    """Get all users from database"""
    if not supabase:
        return []
    
    try:
        query = supabase.table("users").select("*")
        if whitelisted_only:
            query = query.eq("is_whitelisted", True)
        result = query.order("created_at", desc=True).execute()
        return result.data or []
    except Exception as e:
        print(f"Error getting users: {e}")
        return []

def get_stats() -> Dict[str, int]:
    """Get user statistics"""
    if not supabase:
        return {"total": 0, "whitelisted": 0}
    
    try:
        all_users = supabase.table("users").select("is_whitelisted").execute()
        total = len(all_users.data) if all_users.data else 0
        whitelisted = sum(1 for u in (all_users.data or []) if u.get("is_whitelisted"))
        return {"total": total, "whitelisted": whitelisted}
    except Exception as e:
        print(f"Error getting stats: {e}")
        return {"total": 0, "whitelisted": 0}
