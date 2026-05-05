import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.recommendation import router as recommendation_router
from app.api.record import router as record_router
from app.api.venue import router as venue_router
from app.api.wishlist import router as wishlist_router

app = FastAPI(title="KULTI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(recommendation_router)
app.include_router(record_router)
app.include_router(venue_router)
app.include_router(wishlist_router)


@app.get("/health", tags=["health"])
def read_health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/seed", tags=["admin"])
def run_seed():
    from seed import seed
    seed()
    return {"status": "seeded"}
