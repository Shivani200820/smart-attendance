from datetime import datetime

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.models.attendance_session import AttendanceSession
from app.models.student import Student


class AttendanceService:

    @staticmethod
    def mark_attendance(
        db: Session,
        student: Student,
        session_token: str,
    ):

        # 1. Find attendance session using QR token
        session = db.scalar(
            select(AttendanceSession).where(
                AttendanceSession.session_token == session_token
            )
        )

        if not session:
            raise ValueError("Invalid QR token")

        # 2. Check session status
        if session.status == "CLOSED":
            raise ValueError(
                "Attendance session is closed"
            )

        if session.status == "EXPIRED":
            raise ValueError(
                "Attendance session has expired"
            )

        # 3. Check expiry time
        now = datetime.now()
        if now >= session.expires_at:

            session.status = "EXPIRED"

            db.commit()

            raise ValueError(
                "Attendance session has expired"
            )

        # 4. Session must be ACTIVE
        if session.status != "ACTIVE":
            raise ValueError(
                "Attendance session is not active"
            )

        # 5. Check student account
        if not student.is_active:
            raise ValueError(
                "Student account is inactive"
            )

        # 6. Check student belongs to session class
        if student.class_id != session.class_id:
            raise ValueError(
                "Student does not belong to this class"
            )

        # 7. Check duplicate attendance
        existing = db.scalar(
            select(Attendance).where(
                Attendance.attendance_session_id
                == session.id,

                Attendance.student_id
                == student.id,
            )
        )

        if existing:
            raise ValueError(
                "Attendance already marked"
            )

        # 8. Create attendance record
        attendance = Attendance(
            attendance_session_id=session.id,
            student_id=student.id,
            status="PRESENT",
            marked_at=now,
            source="QR",
            created_at=now,
            updated_at=now,
        )

        db.add(attendance)

        try:
            db.commit()

        except IntegrityError:
            db.rollback()

            raise ValueError(
                "Attendance already marked"
            )

        db.refresh(attendance)

        return attendance