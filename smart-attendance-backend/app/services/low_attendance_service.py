from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.attendance import Attendance
from app.models.attendance_session import AttendanceSession
from app.models.class_model import ClassModel
from app.models.student import Student
from app.models.user import User
from app.services.attendance_risk_service import (
    AttendanceRiskService,
)


class LowAttendanceService:

    @staticmethod
    def get_low_attendance_students(
        db: Session,
        class_id: int | None = None,
        subject_id: int | None = None,
        department_id: int | None = None,
    ):

        query = (
            select(
                Student,
                User,
                ClassModel,
            )
            .join(
                User,
                User.id == Student.user_id,
            )
            .join(
                ClassModel,
                ClassModel.id == Student.class_id,
            )
            .where(
                Student.is_active == True,
            )
        )

        if class_id is not None:
            query = query.where(
                Student.class_id == class_id
            )

        if department_id is not None:
            query = query.where(
                Student.department_id == department_id
            )

        result = db.execute(query)

        students = result.all()

        response = []

        for student, user, class_obj in students:

            attendance_query = (
                select(
                    Attendance.status
                )
                .join(
                    AttendanceSession,
                    AttendanceSession.id
                    == Attendance.attendance_session_id,
                )
                .where(
                    Attendance.student_id
                    == student.id,
                )
            )

            if subject_id is not None:
                attendance_query = attendance_query.where(
                    AttendanceSession.subject_id
                    == subject_id
                )

            attendance_result = db.execute(
                attendance_query
            )

            records = attendance_result.scalars().all()

            total_lectures = len(records)

            present_count = records.count("PRESENT")
            leave_count = records.count("LEAVE")

            absent_count = (
                total_lectures
                - present_count
                - leave_count
            )

            if absent_count < 0:
                absent_count = 0

            if total_lectures > 0:

                percentage = round(
                    (
                        present_count
                        / total_lectures
                    ) * 100,
                    2,
                )

            else:

                percentage = 0.0

            # Student with zero lectures
            # should not appear in low attendance
            if total_lectures == 0:
                continue

            if not AttendanceRiskService.is_low_attendance(
                percentage
            ):
                continue

            risk_level = (
                AttendanceRiskService.calculate_risk(
                    percentage
                )
            )

            response.append(
                {
                    "student_id": student.id,
                    "enrollment_number": student.enrollment_number,
                    "roll_number": str(student.roll_number),
                    "student_name": user.name,

                    "class_id": class_obj.id,
                    "class_name": class_obj.name,

                    "total_lectures": total_lectures,
                    "present_count": present_count,
                    "absent_count": absent_count,
                    "leave_count": leave_count,

                    "attendance_percentage": percentage,

                    "required_percentage":
                        settings.ATTENDANCE_REQUIRED_PERCENTAGE,

                    "risk_level": risk_level,
                }
            )

        return response