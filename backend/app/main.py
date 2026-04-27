from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.record import router as record_router

app = FastAPI(title="KULTI API")
app.include_router(auth_router)
app.include_router(record_router)


@app.get("/health", tags=["health"])
def read_health() -> dict[str, str]:
    return {"status": "ok"}