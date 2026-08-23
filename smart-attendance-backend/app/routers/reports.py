from datetime import date

from fastapi import (
    APIRouter,
    Depends,
    Query,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.dependencies import require_admin

from app.services.report_service import ReportService

from app.schemas.reports import (
    DailyReportResponse,
    MonthlyReportResponse,
    StudentReportResponse,
    SubjectReportResponse,
    ClassReportResponse,
    LowAttendanceReportResponse,
)


router = APIRouter(
    prefix="/api/v1/reports",
    tags=["Reports"],
)

@router.get(
    "/daily",
    response_model=DailyReportResponse,
)
def daily_report(
    report_date: date = Query(...),

    db: Session = Depends(get_db),

    current_admin=Depends(require_admin),
):
    return ReportService.get_daily_report(
        db,
        report_date,
    )

@router.get(
    "/monthly",
    response_model=MonthlyReportResponse,
)
def monthly_report(
    year: int = Query(
        ...,
        ge=2020,
        le=2100,
    ),
    month: int = Query(
        ...,
        ge=1,
        le=12,
    ),

    db: Session = Depends(get_db),

    current_admin=Depends(require_admin),
):
    return ReportService.get_monthly_report(
        db,
        year,
        month,
    )

@router.get(
    "/student/{student_id}",
    response_model=StudentReportResponse,
)
def student_report(
    student_id: int,

    start_date: date | None = Query(None),
    end_date: date | None = Query(None),

    db: Session = Depends(get_db),

    current_admin=Depends(require_admin),
):
    result = ReportService.get_student_report(
        db,
        student_id,
        start_date,
        end_date,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    return result

@router.get(
    "/subject/{subject_id}",
    response_model=SubjectReportResponse,
)
def subject_report(
    subject_id: int,

    start_date: date | None = Query(None),
    end_date: date | None = Query(None),

    db: Session = Depends(get_db),

    current_admin=Depends(require_admin),
):
    result = ReportService.get_subject_report(
        db,
        subject_id,
        start_date,
        end_date,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )

    return result

@router.get(
    "/class/{class_id}",
    response_model=ClassReportResponse,
)
def class_report(
    class_id: int,

    start_date: date | None = Query(None),
    end_date: date | None = Query(None),

    db: Session = Depends(get_db),

    current_admin=Depends(require_admin),
):
    result = ReportService.get_class_report(
        db,
        class_id,
        start_date,
        end_date,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )

    return result

@router.get(
    "/low-attendance",
    response_model=list[
        LowAttendanceReportResponse
    ],
)
def low_attendance_report(
    class_id: int | None = Query(None),
    subject_id: int | None = Query(None),
    department_id: int | None = Query(None),

    db: Session = Depends(get_db),

    current_admin=Depends(require_admin),
):
    return ReportService.get_low_attendance_report(
        db,
        class_id=class_id,
        subject_id=subject_id,
        department_id=department_id,
    )