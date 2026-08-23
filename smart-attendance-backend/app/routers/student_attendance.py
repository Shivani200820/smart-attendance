from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import require_student
from app.db.session import get_db
from app.models.student import Student
from app.schemas.student_attendance import (
    StudentAttendanceSummaryResponse,
    StudentAttendanceRecordResponse,
    StudentSubjectAttendanceResponse,
    StudentMonthlyAttendanceResponse,
    StudentDashboardResponse,
)
from app.services.student_attendance_service import (
    StudentAttendanceService,
)
from app.services.attendance_prediction_service import (
    AttendancePredictionService,
)
from app.schemas.attendance_prediction import (
    AttendancePredictionResponse,
    AttendanceRecoveryResponse,
)
from app.core.config import settings

router = APIRouter(
    prefix="/api/v1/student",
    tags=["Student"],
)


@router.get(
    "/dashboard",
    response_model=StudentDashboardResponse,
)
def get_student_dashboard(
    db: Session = Depends(get_db),
    current_student: Student = Depends(require_student),
):
    summary = StudentAttendanceService.get_summary(
        db,
        current_student,
    )

    subjects = StudentAttendanceService.get_subject_attendance(
        db,
        current_student,
    )

    return {
        "summary": summary,
        "subjects": subjects,
    }


@router.get(
    "/attendance/summary",
    response_model=StudentAttendanceSummaryResponse,
)
def get_student_summary(
    db: Session = Depends(get_db),
    current_student: Student = Depends(require_student),
):
    return StudentAttendanceService.get_summary(
        db,
        current_student,
    )


@router.get(
    "/attendance/subjects",
    response_model=list[
        StudentSubjectAttendanceResponse
    ],
)
def get_subject_attendance(
    db: Session = Depends(get_db),
    current_student: Student = Depends(require_student),
):
    return StudentAttendanceService.get_subject_attendance(
        db,
        current_student,
    )


@router.get(
    "/attendance",
    response_model=list[
        StudentAttendanceRecordResponse
    ],
)
def get_student_attendance(
    limit: int = Query(
        50,
        ge=1,
        le=100,
    ),
    offset: int = Query(
        0,
        ge=0,
    ),
    db: Session = Depends(get_db),
    current_student: Student = Depends(require_student),
):
    rows = StudentAttendanceService.get_history(
        db,
        current_student,
        limit,
        offset,
    )

    return [
        StudentAttendanceRecordResponse(
            attendance_id=attendance.id,
            session_id=session.id,
            date=session.date,
            subject_id=subject.id,
            subject_name=subject.name,
            subject_code=subject.code,
            status=attendance.status,
            marked_at=attendance.marked_at,
        )
        for attendance, session, subject in rows
    ]


@router.get(
    "/attendance/monthly",
    response_model=StudentMonthlyAttendanceResponse,
)
def get_monthly_attendance(
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
    current_student: Student = Depends(require_student),
):
    try:
        return StudentAttendanceService.get_monthly_attendance(
            db,
            current_student,
            year,
            month,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

@router.get(
    "/attendance/prediction",
    response_model=AttendancePredictionResponse,
)
def get_attendance_prediction(
    db: Session = Depends(get_db),
    current_student: Student = Depends(require_student),
):

    summary = StudentAttendanceService.get_summary(
        db,
        current_student,
    )

    return AttendancePredictionService.build_prediction(
        present_count=summary["present_count"],
        total_lectures=summary["total_lectures"],
    )

@router.get(
    "/attendance/recovery",
    response_model=AttendanceRecoveryResponse,
)
def get_attendance_recovery(
    db: Session = Depends(get_db),
    current_student: Student = Depends(require_student),
):

    summary = StudentAttendanceService.get_summary(
        db,
        current_student,
    )

    present = summary["present_count"]
    total = summary["total_lectures"]

    required_lectures = (
        AttendancePredictionService
        .calculate_required_lectures(
            present_count=present,
            total_lectures=total,
        )
    )

    scenarios = [5, 8, 10]

    if (
        required_lectures is not None
        and required_lectures not in scenarios
    ):
        scenarios.append(required_lectures)

    scenarios = sorted(set(scenarios))

    results = (
        AttendancePredictionService
        .calculate_recovery_scenarios(
            present_count=present,
            total_lectures=total,
            scenarios=scenarios,
        )
    )

    current_percentage = (
        round(
            (present / total) * 100,
            2,
        )
        if total > 0
        else 0.0
    )

    return {
        "current_percentage": current_percentage,
        "required_percentage":
            settings.ATTENDANCE_REQUIRED_PERCENTAGE,
        "scenarios": results,
    }