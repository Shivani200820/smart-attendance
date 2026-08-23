from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_teacher
from app.db.session import get_db

from app.services.analytics_service import (
    AnalyticsService,
)


router = APIRouter(
    prefix="/api/v1/teacher/analytics",
    tags=["Teacher Analytics"],
)


@router.get("")
def teacher_analytics(
    db: Session = Depends(get_db),
    current_teacher=Depends(require_teacher),
):

    return AnalyticsService.get_teacher_analytics(
        db,
        current_teacher.id,
    )