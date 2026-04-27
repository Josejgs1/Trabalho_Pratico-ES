from app.api.auth import router as auth_router
from app.api.venues import router as venues_router
from app.api.record import router as record_router

__all__ = ["auth_router", "venues_router", "record_router"]
