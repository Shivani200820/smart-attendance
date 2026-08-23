from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_database,
    require_teacher,
)
from app.models.teacher import Teacher
from app.schemas.attendance_session import (
    AttendanceSessionCreate,
    AttendanceSessionResponse,
)
from app.services.attendance_session_service import (
    AttendanceSessionService,
)

from app.models.attendance_session import AttendanceSession



router = APIRouter(
    prefix="/attendance/sessions",
    tags=["Attendance Sessions"],
)


@router.post(
    "",
    response_model=AttendanceSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_attendance_session(
    request: AttendanceSessionCreate,
    db: Session = Depends(get_database),
    current_teacher: Teacher = Depends(require_teacher),
):
    try:
        session = AttendanceSessionService.create_session(
            db=db,
            teacher=current_teacher,
            data=request,
        )

        return session

    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

@router.get(
    "/{session_id}",
    response_model=AttendanceSessionResponse,
)
def get_attendance_session(
    session_id: int,
    db: Session = Depends(get_database),
    current_teacher: Teacher = Depends(require_teacher),
):
    session = (
        db.query(AttendanceSession)
        .filter(
            AttendanceSession.id == session_id
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance session not found",
        )

    # Only session's teacher can access it
    if session.teacher_id != current_teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session",
        )

    return session

@router.post(
    "/{session_id}/close",
    response_model=AttendanceSessionResponse,
)
def close_session(
    session_id: int,
    db: Session = Depends(get_database),
    current_teacher: Teacher = Depends(require_teacher),
):
    session = (
        db.query(AttendanceSession)
        .filter(
            AttendanceSession.id == session_id
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance session not found",
        )

    try:
        return AttendanceSessionService.close_session(
            db=db,
            session=session,
            teacher=current_teacher,
        )

    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )