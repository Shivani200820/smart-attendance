from fastapi import APIRouter
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi import Depends

from app.core.dependencies import get_database


router = APIRouter(
    prefix="/health",
    tags=["Health"]
)


@router.get("")
def health_check():
    return {
        "success": True,
        "message": "Smart Attendance API is running",
        "data": {
            "status": "healthy"
        }
    }


@router.get("/database")
def database_health_check(
    db: Session = Depends(get_database)
):
    try:
        db.execute(text("SELECT 1"))

        return {
            "success": True,
            "message": "Database connection is healthy",
            "data": {
                "database": "connected"
            }
        }

    except Exception:
        return {
            "success": False,
            "message": "Database connection failed",
            "data": {
                "database": "disconnected"
            }
        }