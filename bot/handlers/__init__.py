"""
Handlers package for AI Trade Bot
"""
from handlers.start import setup_start_handlers
from handlers.admin import setup_admin_handlers
from handlers.whitelist import setup_whitelist_handlers

__all__ = [
    "setup_start_handlers",
    "setup_admin_handlers", 
    "setup_whitelist_handlers",
]
