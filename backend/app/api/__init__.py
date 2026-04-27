from app.api.auth import router as auth_router
from app.api.venue import router as venue_router
from app.api.record import router as record_router

__all__ = ["auth_router", "venue_router", "record_router"]
