from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.models.attendance_session import AttendanceSession
from app.models.student import Student


class AttendanceCalculationService:

    @staticmethod
    def calculate_session_stats(
        db: Session,
        session_id: int,
    ) -> dict:

        session = (
            db.query(AttendanceSession)
            .filter(
                AttendanceSession.id == session_id
            )
            .first()
        )

        if not session:
            raise ValueError(
                "Attendance session not found"
            )

        # Total active students in the class
        total_students = (
            db.query(func.count(Student.id))
            .filter(
                Student.class_id == session.class_id,
                Student.is_active == True,
            )
            .scalar()
        ) or 0

        # Present students
        present_students = (
            db.query(func.count(Attendance.id))
            .filter(
                Attendance.attendance_session_id == session_id,
                Attendance.status == "PRESENT",
            )
            .scalar()
        ) or 0

        # Leave students
        leave_students = (
            db.query(func.count(Attendance.id))
            .filter(
                Attendance.attendance_session_id == session_id,
                Attendance.status == "LEAVE",
            )
            .scalar()
        ) or 0

        # Absent is calculated automatically
        absent_students = (
            total_students
            - present_students
            - leave_students
        )

        if absent_students < 0:
            absent_students = 0

        # Attendance percentage
        if total_students > 0:
            percentage = (
                Decimal(present_students)
                / Decimal(total_students)
                * Decimal("100")
            )

            percentage = percentage.quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP,
            )
        else:
            percentage = Decimal("0.00")

        return {
            "total_students": total_students,
            "present_students": present_students,
            "absent_students": absent_students,
            "leave_students": leave_students,
            "attendance_percentage": float(
                percentage
            ),
        }