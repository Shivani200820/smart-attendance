from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.attendance_session import AttendanceSession


class QRService:

    @staticmethod
    def validate_session_token(
        db: Session,
        session_token: str,
    ) -> AttendanceSession:

        session = db.scalar(
            select(AttendanceSession).where(
                AttendanceSession.session_token == session_token
            )
        )

        if not session:
            raise ValueError("Invalid QR token")

        # MySQL returns expires_at as timezone-naive.
        # Use naive local datetime for comparison.
        now = datetime.now()

        # Session already closed
        if session.status == "CLOSED":
            raise ValueError(
                "Attendance session is closed"
            )

        # Session expired
        if now >= session.expires_at:
            session.status = "EXPIRED"

            db.commit()

            raise ValueError(
                "QR token has expired"
            )

        # Session must be ACTIVE
        if session.status != "ACTIVE":
            raise ValueError(
                "Attendance session is not active"
            )

        return session