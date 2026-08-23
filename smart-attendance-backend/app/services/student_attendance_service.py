from calendar import monthrange
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.models.attendance_session import AttendanceSession
from app.models.student import Student
from app.models.subject import Subject
from app.core.config import settings
from app.services.attendance_risk_service import (
    AttendanceRiskService,
)


class StudentAttendanceService:

    @staticmethod
    def get_summary(
        db: Session,
        student: Student,
    ) -> dict:

        # Total lectures for this student
        total_lectures = db.scalar(
            select(
                func.count(
                    func.distinct(
                        AttendanceSession.id
                    )
                )
            )
            .join(
                Attendance,
                Attendance.attendance_session_id
                == AttendanceSession.id
            )
            .where(
                Attendance.student_id == student.id
            )
        )

        # Present count
        present_count = db.scalar(
            select(
                func.count(Attendance.id)
            )
            .where(
                Attendance.student_id == student.id,
                Attendance.status == "PRESENT",
            )
        )

        # Leave count
        leave_count = db.scalar(
            select(
                func.count(Attendance.id)
            )
            .where(
                Attendance.student_id == student.id,
                Attendance.status == "LEAVE",
            )
        )

        total_lectures = total_lectures or 0
        present_count = present_count or 0
        leave_count = leave_count or 0

        # Absent is calculated automatically
        absent_count = (
            total_lectures
            - present_count
            - leave_count
        )

        if absent_count < 0:
            absent_count = 0

        # Attendance percentage
        if total_lectures > 0:
            percentage = round(
                (present_count / total_lectures) * 100,
                2,
            )
        else:
            percentage = 0.0

        risk_level = AttendanceRiskService.calculate_risk(
            percentage
        )

        return {
            "total_lectures": total_lectures,
            "present_count": present_count,
            "absent_count": absent_count,
            "leave_count": leave_count,
            "attendance_percentage": percentage,
            "required_percentage": (
                settings.ATTENDANCE_REQUIRED_PERCENTAGE
            ),
            "risk_level": risk_level,
        }

    @staticmethod
    def get_subject_attendance(
        db: Session,
        student: Student,
    ):

        result = db.execute(
            select(
                Subject.id.label("subject_id"),
                Subject.name.label("subject_name"),
                Subject.code.label("subject_code"),
                func.count(
                    Attendance.id
                ).label("total_lectures"),
                func.sum(
                    func.if_(
                        Attendance.status == "PRESENT",
                        1,
                        0,
                    )
                ).label("present_count"),
                func.sum(
                    func.if_(
                        Attendance.status == "LEAVE",
                        1,
                        0,
                    )
                ).label("leave_count"),
            )
            .join(
                AttendanceSession,
                AttendanceSession.subject_id
                == Subject.id,
            )
            .outerjoin(
                Attendance,
                (
                    Attendance.attendance_session_id
                    == AttendanceSession.id
                )
                & (
                    Attendance.student_id
                    == student.id
                ),
            )
            .where(
                AttendanceSession.class_id
                == student.class_id
            )
            .group_by(
                Subject.id,
                Subject.name,
                Subject.code,
            )
        )

        rows = result.all()

        response = []

        for row in rows:

            total = row.total_lectures or 0
            present = row.present_count or 0
            leave = row.leave_count or 0

            absent = total - present - leave

            if absent < 0:
                absent = 0

            percentage = (
                round(
                    (present / total) * 100,
                    2,
                )
                if total > 0
                else 0.0
            )

            risk_level = AttendanceRiskService.calculate_risk(
                percentage
            )

            response.append(
                {
                    "subject_id": row.subject_id,
                    "subject_name": row.subject_name,
                    "subject_code": row.subject_code,
                    "total_lectures": total,
                    "present_count": present,
                    "absent_count": absent,
                    "leave_count": leave,
                    "attendance_percentage": percentage,
                    "required_percentage": (
                        settings.ATTENDANCE_REQUIRED_PERCENTAGE
                    ),
                    "risk_level": risk_level,
                }
            )

        return response

    @staticmethod
    def get_history(
        db: Session,
        student: Student,
        limit: int = 50,
        offset: int = 0,
    ):

        result = db.execute(
            select(
                Attendance,
                AttendanceSession,
                Subject,
            )
            .join(
                AttendanceSession,
                AttendanceSession.id
                == Attendance.attendance_session_id,
            )
            .join(
                Subject,
                Subject.id
                == AttendanceSession.subject_id,
            )
            .where(
                Attendance.student_id == student.id
            )
            .order_by(
                AttendanceSession.date.desc(),
                AttendanceSession.start_time.desc(),
            )
            .offset(offset)
            .limit(limit)
        )

        return result.all()

    @staticmethod
    def get_monthly_attendance(
        db: Session,
        student: Student,
        year: int,
        month: int,
    ):

        if month < 1 or month > 12:
            raise ValueError(
                "Month must be between 1 and 12"
            )

        start_date = date(
            year,
            month,
            1,
        )

        last_day = monthrange(
            year,
            month,
        )[1]

        end_date = date(
            year,
            month,
            last_day,
        )

        # Total lectures
        total = db.scalar(
            select(
                func.count(
                    func.distinct(
                        AttendanceSession.id
                    )
                )
            )
            .join(
                Attendance,
                Attendance.attendance_session_id
                == AttendanceSession.id,
            )
            .where(
                Attendance.student_id == student.id,
                AttendanceSession.date >= start_date,
                AttendanceSession.date <= end_date,
            )
        )

        # Present
        present = db.scalar(
            select(
                func.count(Attendance.id)
            )
            .join(
                AttendanceSession,
                AttendanceSession.id
                == Attendance.attendance_session_id,
            )
            .where(
                Attendance.student_id == student.id,
                Attendance.status == "PRESENT",
                AttendanceSession.date >= start_date,
                AttendanceSession.date <= end_date,
            )
        )

        # Leave
        leave = db.scalar(
            select(
                func.count(Attendance.id)
            )
            .join(
                AttendanceSession,
                AttendanceSession.id
                == Attendance.attendance_session_id,
            )
            .where(
                Attendance.student_id == student.id,
                Attendance.status == "LEAVE",
                AttendanceSession.date >= start_date,
                AttendanceSession.date <= end_date,
            )
        )

        total = total or 0
        present = present or 0
        leave = leave or 0

        # Absent
        absent = total - present - leave

        if absent < 0:
            absent = 0

        # Percentage
        percentage = (
            round(
                (present / total) * 100,
                2,
            )
            if total > 0
            else 0.0
        )

        return {
            "year": year,
            "month": month,
            "total_lectures": total,
            "present_count": present,
            "absent_count": absent,
            "leave_count": leave,
            "attendance_percentage": percentage,
        }