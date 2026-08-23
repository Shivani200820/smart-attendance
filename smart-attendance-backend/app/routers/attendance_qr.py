from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_database,
    require_teacher,
)
from app.models.attendance_session import AttendanceSession
from app.models.user import User
from app.schemas.attendance_qr import (
    QRSessionResponse,
    QRValidationRequest,
    QRValidationResponse,
)
from app.services.qr_service import QRService


router = APIRouter(
    prefix="/api/v1/attendance/qr",
    tags=["Attendance - QR"],
)


@router.post(
    "/validate",
    response_model=QRValidationResponse,
)
def validate_qr(
    data: QRValidationRequest,
    db: Session = Depends(get_database),
    current_user: User = Depends(require_teacher),
):
    try:
        session = QRService.validate_session_token(
            db=db,
            session_token=data.session_token,
        )

        return QRValidationResponse(
            valid=True,
            message="QR token is valid",
            session_id=session.id,
            class_id=session.class_id,
            subject_id=session.subject_id,
            expires_at=session.expires_at.isoformat(),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get(
    "/sessions/{session_id}/qr",
    response_model=QRSessionResponse,
)
def get_qr_data(
    session_id: int,
    db: Session = Depends(get_database),
    current_user: User = Depends(require_teacher),
):
    session = db.scalar(
        select(AttendanceSession).where(
            AttendanceSession.id == session_id
        )
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance session not found",
        )

    if session.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this session",
        )

    if session.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance session is not active",
        )

    return QRSessionResponse(
        session_id=session.id,
        qr_token=session.session_token,
        expires_at=session.expires_at.isoformat(),
        status=session.status,
    )