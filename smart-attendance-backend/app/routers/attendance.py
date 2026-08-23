from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_database,
    require_student,
    require_teacher,
)

from app.models.user import User
from app.models.student import Student
from app.models.attendance_session import AttendanceSession

from app.schemas.attendance import (
    AttendanceMarkRequest,
    AttendanceMarkResponse,
    AttendanceStatsResponse,
)

from app.services.attendance_service import AttendanceService
from app.services.attendance_calculation_service import (
    AttendanceCalculationService,
)

from fastapi import HTTPException, status
from sqlalchemy import select

from app.models.attendance import Attendance
from app.models.attendance_session import AttendanceSession
from app.models.teacher import Teacher


from app.services.attendance_correction_service import (
    AttendanceCorrectionService,
)
from app.core.dependencies import get_current_user
from app.core.dependencies import get_db
from app.schemas.attendance_correction import (
    AttendanceCorrectionHistoryResponse,
)
from app.schemas.attendance_correction import (
    AttendanceCorrectionRequest,
    AttendanceCorrectionResponse,
    AttendanceCorrectionHistoryResponse,
)



router = APIRouter(
    prefix="/api/v1/attendance",
    tags=["Attendance"],
)


@router.post(
    "/mark",
    response_model=AttendanceMarkResponse,
    status_code=status.HTTP_201_CREATED,
)
def mark_attendance(
    data: AttendanceMarkRequest,
    db: Session = Depends(get_database),
    current_student: Student = Depends(require_student),
):

    try:
        attendance = AttendanceService.mark_attendance(
            db=db,
            student=current_student,
            session_token=data.session_token,
        )

        return AttendanceMarkResponse(
            message="Attendance marked successfully",
            attendance_id=attendance.id,
            status=attendance.status,
            marked_at=attendance.marked_at,
        )

    except ValueError as exc:

        message = str(exc)

        if message == "Attendance already marked":
            code = status.HTTP_409_CONFLICT

        elif message == "Student does not belong to this class":
            code = status.HTTP_403_FORBIDDEN

        else:
            code = status.HTTP_400_BAD_REQUEST

        raise HTTPException(
            status_code=code,
            detail=message,
        )


@router.get(
    "/sessions/{session_id}/stats",
    response_model=AttendanceStatsResponse,
)
def get_session_stats(
    session_id: int,
    db: Session = Depends(get_database),
    current_user: User = Depends(require_teacher),
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

    if session.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this session",
        )

    try:

        stats = (
            AttendanceCalculationService
            .calculate_session_stats(
                db=db,
                session_id=session_id,
            )
        )

        return stats

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.patch(
    "/{attendance_id}",
    response_model=AttendanceCorrectionResponse,
)
def correct_attendance(
    attendance_id: int,
    request: AttendanceCorrectionRequest,

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user),
):
    # Student cannot correct attendance
    if current_user.role == "STUDENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Students are not allowed "
                "to correct attendance"
            ),
        )

    # Only ADMIN and TEACHER
    if current_user.role not in {
        "ADMIN",
        "TEACHER",
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )

    # Teacher ownership check
    if current_user.role == "TEACHER":

        result = (
            db.query(Attendance)
            .join(
                AttendanceSession,
                AttendanceSession.id
                == Attendance.attendance_session_id,
            )
            .join(
                Teacher,
                Teacher.id
                == AttendanceSession.teacher_id,
            )
            .filter(
                Attendance.id == attendance_id,
                Teacher.user_id
                == current_user.id,
            )
            .first()
        )

        if result is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You can only correct "
                    "your own attendance sessions"
                ),
            )

    return AttendanceCorrectionService.correct_attendance(
        db=db,
        attendance_id=attendance_id,
        new_status=request.status,
        correction_reason=request.correction_reason,
        corrected_by_user_id=current_user.id,
    )

@router.get(
    "/{attendance_id}/corrections",
    response_model=list[
        AttendanceCorrectionHistoryResponse
    ],
)
def get_correction_history(
    attendance_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user),
):
    # Students cannot view correction history
    if current_user.role == "STUDENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Students cannot view "
                "correction history"
            ),
        )

    # Only ADMIN and TEACHER
    if current_user.role not in {
        "ADMIN",
        "TEACHER",
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )

    # Teacher ownership check
    if current_user.role == "TEACHER":

        attendance = (
            db.query(Attendance)
            .join(
                AttendanceSession,
                AttendanceSession.id
                == Attendance.attendance_session_id,
            )
            .join(
                Teacher,
                Teacher.id
                == AttendanceSession.teacher_id,
            )
            .filter(
                Attendance.id == attendance_id,
                Teacher.user_id
                == current_user.id,
            )
            .first()
        )

        if attendance is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You can only view correction "
                    "history for your own sessions"
                ),
            )

    # Check attendance exists for ADMIN
    if current_user.role == "ADMIN":

        attendance = (
            db.query(Attendance)
            .filter(
                Attendance.id == attendance_id
            )
            .first()
        )

        if attendance is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Attendance record not found",
            )

    return (
        AttendanceCorrectionService
        .get_correction_history(
            db=db,
            attendance_id=attendance_id,
        )
    )