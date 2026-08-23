from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.models.attendance_correction import AttendanceCorrection


class AttendanceCorrectionService:

    VALID_STATUSES = {
        "PRESENT",
        "ABSENT",
        "LEAVE",
    }

    @staticmethod
    def correct_attendance(
        db: Session,
        attendance_id: int,
        new_status: str,
        correction_reason: str,
        corrected_by_user_id: int,
    ):

        # Get attendance record
        attendance = (
            db.query(Attendance)
            .filter(
                Attendance.id == attendance_id
            )
            .with_for_update()
            .first()
        )

        if attendance is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Attendance record not found",
            )

        # Normalize input
        new_status = new_status.strip().upper()
        correction_reason = (
            correction_reason.strip()
        )

        # Validate status
        if new_status not in AttendanceCorrectionService.VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid attendance status. "
                    "Allowed values: PRESENT, ABSENT, LEAVE"
                ),
            )

        # Validate correction reason
        if not correction_reason:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Correction reason is required",
            )

        if len(correction_reason) < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Correction reason must be "
                    "at least 5 characters"
                ),
            )

        if len(correction_reason) > 500:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Correction reason must not "
                    "exceed 500 characters"
                ),
            )

        previous_status = (
            attendance.status.strip().upper()
        )

        # Prevent same-status correction
        if previous_status == new_status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "New attendance status must be "
                    "different from the current status"
                ),
            )

        now = datetime.now(timezone.utc)

        # Create audit record
        correction = AttendanceCorrection(
            attendance_id=attendance.id,
            corrected_by=corrected_by_user_id,
            previous_status=previous_status,
            new_status=new_status,
            correction_reason=correction_reason,
            corrected_at=now,
        )

        # Update current attendance record
        attendance.status = new_status
        attendance.corrected_by = (
            corrected_by_user_id
        )
        attendance.correction_reason = (
            correction_reason
        )
        attendance.updated_at = now

        db.add(correction)

        try:
            db.commit()

        except Exception:
            db.rollback()
            raise

        return {
            "attendance_id": attendance.id,
            "previous_status": previous_status,
            "new_status": new_status,
            "corrected_by": corrected_by_user_id,
            "correction_reason": correction_reason,
            "corrected_at": now,
        }

    @staticmethod
    def get_correction_history(
        db: Session,
        attendance_id: int,
    ):

        corrections = (
            db.query(AttendanceCorrection)
            .filter(
                AttendanceCorrection.attendance_id
                == attendance_id
            )
            .order_by(
                AttendanceCorrection.corrected_at.desc()
            )
            .all()
        )

        return [
            {
                "id": correction.id,
                "attendance_id":
                    correction.attendance_id,
                "previous_status":
                    correction.previous_status,
                "new_status":
                    correction.new_status,
                "corrected_by":
                    correction.corrected_by,
                "correction_reason":
                    correction.correction_reason,
                "corrected_at":
                    correction.corrected_at,
            }
            for correction in corrections
        ]