from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_database, require_teacher
from app.models.teacher import Teacher
from app.schemas.teacher_dashboard import (
    TodayClassResponse,
    TeacherClassResponse,
    TeacherSubjectResponse,
    TeacherSessionResponse,
    TeacherDashboardResponse,
)
from app.services.teacher_dashboard_service import (
    TeacherDashboardService,
)


router = APIRouter(
    prefix="/api/v1/teacher",
    tags=["Teacher"],
)


@router.get(
    "/today-classes",
    response_model=list[TodayClassResponse],
)
def get_today_classes(
    db: Session = Depends(get_database),
    current_teacher: Teacher = Depends(require_teacher),
):
    rows = TeacherDashboardService.get_today_classes(
        db,
        current_teacher,
    )

    response = []

    for timetable, class_obj, subject, session in rows:
        response.append(
            TodayClassResponse(
                timetable_id=timetable.id,
                class_id=class_obj.id,
                class_name=class_obj.name,
                subject_id=subject.id,
                subject_name=subject.name,
                subject_code=subject.code,
                start_time=timetable.start_time,
                end_time=timetable.end_time,
                room=timetable.room,
                session_id=session.id if session else None,
                session_status=(
                    session.status
                    if session
                    else None
                ),
            )
        )

    return response

@router.get(
    "/classes",
    response_model=list[TeacherClassResponse],
)
def get_teacher_classes(
    db: Session = Depends(get_database),
    current_teacher: Teacher = Depends(require_teacher),
):
    rows = TeacherDashboardService.get_teacher_classes(
        db,
        current_teacher,
    )

    return [
        TeacherClassResponse(
            class_id=row.id,
            class_name=row.name,
            year=row.year,
            division=row.division,
            academic_year=row.academic_year,
            semester=row.semester,
        )
        for row in rows
    ]

@router.get(
    "/subjects",
    response_model=list[TeacherSubjectResponse],
)
def get_teacher_subjects(
    db: Session = Depends(get_database),
    current_teacher: Teacher = Depends(require_teacher),
):
    rows = TeacherDashboardService.get_teacher_subjects(
        db,
        current_teacher,
    )

    return [
        TeacherSubjectResponse(
            subject_id=row.id,
            subject_name=row.name,
            subject_code=row.code,
        )
        for row in rows
    ]

@router.get(
    "/sessions",
    response_model=list[TeacherSessionResponse],
)
def get_teacher_sessions(
    limit: int = 20,
    db: Session = Depends(get_database),
    current_teacher: Teacher = Depends(require_teacher),
):
    if limit < 1 or limit > 100:
        limit = 20

    rows = TeacherDashboardService.get_teacher_sessions(
        db,
        current_teacher,
        limit,
    )

    return [
        TeacherSessionResponse(
            session_id=session.id,
            class_id=class_obj.id,
            class_name=class_obj.name,
            subject_id=subject.id,
            subject_name=subject.name,
            date=session.date,
            start_time=session.start_time,
            end_time=session.end_time,
            status=session.status,
            expires_at=session.expires_at,
        )
        for session, class_obj, subject in rows
    ]

@router.get(
    "/dashboard",
    response_model=TeacherDashboardResponse,
)
def get_teacher_dashboard(
    db: Session = Depends(get_database),
    current_teacher: Teacher = Depends(require_teacher),
):
    return TeacherDashboardService.get_dashboard_summary(
        db,
        current_teacher,
    )