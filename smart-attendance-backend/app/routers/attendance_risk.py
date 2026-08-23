from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db.session import get_db
from app.schemas.attendance_risk import (
    LowAttendanceStudentResponse,
)
from app.services.low_attendance_service import (
    LowAttendanceService,
)


router = APIRouter(
    prefix="/api/v1/attendance",
    tags=["Analytics"],
)


@router.get(
    "/low-attendance",
    response_model=list[
        LowAttendanceStudentResponse
    ],
)
def get_low_attendance(
    class_id: int | None = Query(
        default=None,
        ge=1,
    ),
    subject_id: int | None = Query(
        default=None,
        ge=1,
    ),
    department_id: int | None = Query(
        default=None,
        ge=1,
    ),
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
):
    return LowAttendanceService.get_low_attendance_students(
        db=db,
        class_id=class_id,
        subject_id=subject_id,
        department_id=department_id,
    )