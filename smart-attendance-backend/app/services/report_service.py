from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings

from app.models.student import Student
from app.models.user import User
from app.models.class_model import ClassModel
from app.models.subject import Subject
from app.models.attendance import Attendance
from app.models.attendance_session import AttendanceSession

from datetime import date



class ReportService:

    @staticmethod
    def calculate_counts(records):

        total = len(records)

        present = records.count("PRESENT")
        leave = records.count("LEAVE")

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

        return {
            "total": total,
            "present": present,
            "absent": absent,
            "leave": leave,
            "percentage": percentage,
        }


    @staticmethod
    def get_daily_report(
        db: Session,
        report_date: date,
    ):
        # Get attendance records for the selected date
        records = (
            db.query(Attendance.status)
            .join(
                AttendanceSession,
                AttendanceSession.id
                == Attendance.attendance_session_id,
            )
            .filter(
                AttendanceSession.date == report_date
            )
            .all()
        )

        statuses = [
            status
            for (status,) in records
        ]

        # Calculate present / leave / attendance percentage
        counts = ReportService.calculate_counts(
            statuses
        )

        # Get total active students
        total_students = (
            db.query(func.count(Student.id))
            .filter(
                Student.is_active == True
            )
            .scalar()
            or 0
        )

        # IMPORTANT:
        # Absent students are students who do not have
        # PRESENT or LEAVE attendance for this date.
        absent_students = (
            total_students
            - counts["present"]
            - counts["leave"]
        )

        if absent_students < 0:
            absent_students = 0

        return {
            "report_date": report_date,
            "total_students": total_students,
            "present_students": counts["present"],
            "absent_students": absent_students,
            "leave_students": counts["leave"],
            "attendance_percentage": counts["percentage"],
        }

    @staticmethod
    def get_monthly_report(
        db: Session,
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

        if month == 12:
            end_date = date(
                year + 1,
                1,
                1,
            )
        else:
            end_date = date(
                year,
                month + 1,
                1,
            )

        records = (
            db.query(Attendance.status)
            .join(
                AttendanceSession,
                AttendanceSession.id
                == Attendance.attendance_session_id,
            )
            .filter(
                AttendanceSession.date >= start_date,
                AttendanceSession.date < end_date,
            )
            .all()
        )

        statuses = [
            status
            for (status,) in records
        ]

        counts = ReportService.calculate_counts(
            statuses
        )

        total_students = (
            db.query(func.count(Student.id))
            .filter(
                Student.is_active == True
            )
            .scalar()
            or 0
        )

        return {
            "year": year,
            "month": month,
            "total_students": total_students,
            "total_attendance_records":
                counts["total"],
            "present_count":
                counts["present"],
            "absent_count":
                counts["absent"],
            "leave_count":
                counts["leave"],
            "attendance_percentage":
                counts["percentage"],
        }

    @staticmethod
    def get_student_report(
        db: Session,
        student_id: int,
        start_date: date | None = None,
        end_date: date | None = None,
    ):
        # Get student + user information
        row = (
            db.query(Student, User)
            .join(
                User,
                User.id == Student.user_id,
            )
            .filter(
                Student.id == student_id
            )
            .first()
        )

        if not row:
            return None

        student, user = row

        # Get attendance records
        query = (
            db.query(Attendance.status)
            .join(
                AttendanceSession,
                AttendanceSession.id
                == Attendance.attendance_session_id,
            )
            .filter(
                Attendance.student_id == student_id
            )
        )

        # Optional date filtering
        if start_date is not None:
            query = query.filter(
                AttendanceSession.date >= start_date
            )

        if end_date is not None:
            query = query.filter(
                AttendanceSession.date <= end_date
            )

        records = query.all()

        statuses = [
            status
            for (status,) in records
        ]

        counts = ReportService.calculate_counts(
            statuses
        )

        return {
            "student_id": student.id,
            "student_name": user.name,
            "enrollment_number":
                student.enrollment_number,
            "total_lectures":
                counts["total"],
            "present_count":
                counts["present"],
            "absent_count":
                counts["absent"],
            "leave_count":
                counts["leave"],
            "attendance_percentage":
                counts["percentage"],
        }

    @staticmethod
    def get_subject_report(
        db: Session,
        subject_id: int,
        start_date: date | None = None,
        end_date: date | None = None,
    ):
        # Get subject
        subject = (
            db.query(Subject)
            .filter(
                Subject.id == subject_id
            )
            .first()
        )

        if not subject:
            return None

        # Get attendance records for subject
        query = (
            db.query(Attendance.status)
            .join(
                AttendanceSession,
                AttendanceSession.id
                == Attendance.attendance_session_id,
            )
            .filter(
                AttendanceSession.subject_id
                == subject_id
            )
        )

        # Optional date filtering
        if start_date is not None:
            query = query.filter(
                AttendanceSession.date >= start_date
            )

        if end_date is not None:
            query = query.filter(
                AttendanceSession.date <= end_date
            )

        records = query.all()

        statuses = [
            status
            for (status,) in records
        ]

        counts = ReportService.calculate_counts(
            statuses
        )

        # Count actual attendance sessions/lectures
        lecture_query = (
            db.query(
                func.count(
                    func.distinct(
                        AttendanceSession.id
                    )
                )
            )
            .filter(
                AttendanceSession.subject_id
                == subject_id
            )
        )

        if start_date is not None:
            lecture_query = lecture_query.filter(
                AttendanceSession.date >= start_date
            )

        if end_date is not None:
            lecture_query = lecture_query.filter(
                AttendanceSession.date <= end_date
            )

        total_lectures = (
            lecture_query.scalar() or 0
        )

        return {
            "subject_id": subject.id,
            "subject_name": subject.name,
            "subject_code": subject.code,
            "total_lectures": total_lectures,
            "total_records": counts["total"],
            "present_count": counts["present"],
            "absent_count": counts["absent"],
            "leave_count": counts["leave"],
            "attendance_percentage":
                counts["percentage"],
        }

    @staticmethod
    def get_class_report(
        db: Session,
        class_id: int,
        start_date: date | None = None,
        end_date: date | None = None,
    ):
        # Get class
        class_obj = (
            db.query(ClassModel)
            .filter(
                ClassModel.id == class_id
            )
            .first()
        )

        if not class_obj:
            return None

        # Get attendance records for this class
        query = (
            db.query(Attendance.status)
            .join(
                AttendanceSession,
                AttendanceSession.id
                == Attendance.attendance_session_id,
            )
            .filter(
                AttendanceSession.class_id
                == class_id
            )
        )

        # Optional date filtering
        if start_date is not None:
            query = query.filter(
                AttendanceSession.date >= start_date
            )

        if end_date is not None:
            query = query.filter(
                AttendanceSession.date <= end_date
            )

        records = query.all()

        statuses = [
            status
            for (status,) in records
        ]

        counts = ReportService.calculate_counts(
            statuses
        )

        # Count active students in this class
        total_students = (
            db.query(func.count(Student.id))
            .filter(
                Student.class_id == class_id,
                Student.is_active == True,
            )
            .scalar()
            or 0
        )

        # IMPORTANT:
        # Attendance rows contain only marked records.
        # Therefore absent students must be derived
        # from total class students.
        absent_students = (
            total_students
            - counts["present"]
            - counts["leave"]
        )

        if absent_students < 0:
            absent_students = 0

        return {
            "class_id": class_obj.id,
            "class_name": class_obj.name,
            "total_students": total_students,
            "total_records": counts["total"],
            "present_count": counts["present"],
            "absent_count": absent_students,
            "leave_count": counts["leave"],
            "attendance_percentage":
                counts["percentage"],
        }

    @staticmethod
    def get_low_attendance_report(
        db: Session,
        class_id: int | None = None,
        subject_id: int | None = None,
        department_id: int | None = None,
    ):
        query = (
            db.query(Student, User)
            .join(
                User,
                User.id == Student.user_id,
            )
            .filter(
                Student.is_active == True
            )
        )

        # Optional class filter
        if class_id is not None:
            query = query.filter(
                Student.class_id == class_id
            )

        # Optional department filter
        if department_id is not None:
            query = query.filter(
                Student.department_id
                == department_id
            )

        students = query.all()

        response = []

        for student, user in students:

            attendance_query = (
                db.query(Attendance.status)
                .join(
                    AttendanceSession,
                    AttendanceSession.id
                    == Attendance.attendance_session_id,
                )
                .filter(
                    Attendance.student_id
                    == student.id
                )
            )

            # Optional subject filter
            if subject_id is not None:
                attendance_query = (
                    attendance_query.filter(
                        AttendanceSession.subject_id
                        == subject_id
                    )
                )

            records = attendance_query.all()

            statuses = [
                status
                for (status,) in records
            ]

            # No attendance records
            if not statuses:
                continue

            counts = (
                ReportService.calculate_counts(
                    statuses
                )
            )

            percentage = counts["percentage"]

            required_percentage = (
                settings.ATTENDANCE_REQUIRED_PERCENTAGE
            )

            # Only students below required percentage
            if percentage >= required_percentage:
                continue

            # Risk classification
            if percentage < 65:
                risk_level = "CRITICAL"
            elif percentage < 75:
                risk_level = "WARNING"
            else:
                risk_level = "NORMAL"

            response.append(
                {
                    "student_id": student.id,
                    "student_name": user.name,
                    "enrollment_number":
                        student.enrollment_number,
                    "class_id":
                        student.class_id,
                    "attendance_percentage":
                        percentage,
                    "required_percentage":
                        required_percentage,
                    "risk_level":
                        risk_level,
                }
            )

        return response