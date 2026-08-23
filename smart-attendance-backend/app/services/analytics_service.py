from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings

from app.models.student import Student
from app.models.teacher import Teacher
from app.models.class_model import ClassModel
from app.models.subject import Subject
from app.models.attendance import Attendance
from app.models.attendance_session import AttendanceSession
from app.models.department import Department
from calendar import monthrange
from datetime import date

class AnalyticsService:

    @staticmethod
    def get_admin_dashboard(
        db: Session,
    ):

        total_students = (
            db.query(func.count(Student.id))
            .filter(
                Student.is_active == True
            )
            .scalar()
            or 0
        )

        total_teachers = (
            db.query(func.count(Teacher.id))
            .filter(
                Teacher.is_active == True
            )
            .scalar()
            or 0
        )

        total_classes = (
            db.query(func.count(ClassModel.id))
            .scalar()
            or 0
        )

        total_subjects = (
            db.query(func.count(Subject.id))
            .filter(
                Subject.is_active == True
            )
            .scalar()
            or 0
        )

        # Actual attendance analytics
        average_attendance = (
            AnalyticsService.get_average_attendance(db)
        )

        low_attendance_count = (
            AnalyticsService.get_low_attendance_count(db)
        )

        return {
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_classes": total_classes,
            "total_subjects": total_subjects,
            "average_attendance":
                average_attendance,
            "low_attendance_count":
                low_attendance_count,
        }

    @staticmethod
    def get_overall_attendance(
        db: Session,
    ):

        records = (
            db.query(Attendance.status)
            .all()
        )

        statuses = [
            status
            for (status,) in records
        ]

        total = len(statuses)

        present = statuses.count("PRESENT")
        leave = statuses.count("LEAVE")

        absent = (
            total
            - present
            - leave
        )

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
            "total_lectures": total,
            "present_count": present,
            "absent_count": absent,
            "leave_count": leave,
            "attendance_percentage": percentage,
        }

    @staticmethod
    def get_average_attendance(
        db: Session,
    ):

        students = (
            db.query(Student.id)
            .filter(
                Student.is_active == True
            )
            .all()
        )

        percentages = []

        for (student_id,) in students:

            records = (
                db.query(Attendance.status)
                .filter(
                    Attendance.student_id
                    == student_id
                )
                .all()
            )

            statuses = [
                status
                for (status,) in records
            ]

            if not statuses:
                continue

            total = len(statuses)

            present = statuses.count(
                "PRESENT"
            )

            percentage = (
                present / total
            ) * 100

            percentages.append(
                percentage
            )

        if not percentages:
            return 0.0

        return round(
            sum(percentages)
            / len(percentages),
            2,
        )

    @staticmethod
    def get_low_attendance_count(
        db: Session,
    ):

        students = (
            db.query(Student.id)
            .filter(
                Student.is_active == True
            )
            .all()
        )

        count = 0

        for (student_id,) in students:

            records = (
                db.query(Attendance.status)
                .filter(
                    Attendance.student_id
                    == student_id
                )
                .all()
            )

            statuses = [
                status
                for (status,) in records
            ]

            if not statuses:
                continue

            total = len(statuses)

            present = statuses.count(
                "PRESENT"
            )

            percentage = (
                present / total
            ) * 100

            if (
                percentage
                < settings.ATTENDANCE_REQUIRED_PERCENTAGE
            ):
                count += 1

        return count

    @staticmethod
    def get_class_analytics(
        db: Session,
    ):

        classes = (
            db.query(ClassModel)
            .all()
        )

        response = []

        for class_obj in classes:

            students = (
                db.query(Student.id)
                .filter(
                    Student.class_id
                    == class_obj.id,
                    Student.is_active == True,
                )
                .all()
            )

            student_ids = [
                student_id
                for (student_id,) in students
            ]

            percentages = []

            for student_id in student_ids:

                records = (
                    db.query(Attendance.status)
                    .join(
                        AttendanceSession,
                        AttendanceSession.id == Attendance.attendance_session_id,
                    )
                    .filter(
                        Attendance.student_id == student_id,
                        AttendanceSession.class_id == class_obj.id,
                    )
                    .all()
                )

                statuses = [
                    status
                    for (status,) in records
                ]

                if not statuses:
                    continue

                total = len(statuses)

                present = statuses.count(
                    "PRESENT"
                )

                percentage = (
                    present / total
                ) * 100

                percentages.append(
                    percentage
                )

            average = (
                round(
                    sum(percentages)
                    / len(percentages),
                    2,
                )
                if percentages
                else 0.0
            )

            low_count = sum(
                1
                for percentage in percentages
                if percentage
                < settings.ATTENDANCE_REQUIRED_PERCENTAGE
            )

            response.append(
                {
                    "class_id": class_obj.id,
                    "class_name": class_obj.name,
                    "total_students":
                        len(student_ids),
                    "average_attendance":
                        average,
                    "low_attendance_count":
                        low_count,
                }
            )

        return response


    @staticmethod
    def get_subject_analytics(
        db: Session,
    ):

        subjects = (
            db.query(Subject)
            .filter(
                Subject.is_active == True
            )
            .all()
        )

        response = []

        for subject in subjects:

            records = (
                db.query(Attendance.status)
                .join(
                    AttendanceSession,
                    AttendanceSession.id
                    == Attendance.attendance_session_id,
                )
                .filter(
                    AttendanceSession.subject_id
                    == subject.id
                )
                .all()
            )

            statuses = [
                status
                for (status,) in records
            ]

            total = len(statuses)

            present = statuses.count(
                "PRESENT"
            )

            leave = statuses.count(
                "LEAVE"
            )

            absent = (
                total
                - present
                - leave
            )

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

            total_students = (
                db.query(
                    func.count(
                        func.distinct(
                            Attendance.student_id
                        )
                    )
                )
                .join(
                    AttendanceSession,
                    AttendanceSession.id
                    == Attendance.attendance_session_id,
                )
                .filter(
                    AttendanceSession.subject_id
                    == subject.id
                )
                .scalar()
                or 0
            )

            response.append(
                {
                    "subject_id": subject.id,
                    "subject_name": subject.name,
                    "subject_code": subject.code,
                    "total_students":
                        total_students,
                    "total_lectures":
                        total,
                    "present_count":
                        present,
                    "absent_count":
                        absent,
                    "leave_count":
                        leave,
                    "attendance_percentage":
                        percentage,
                }
            )

        return response

    @staticmethod
    def get_department_analytics(
        db: Session,
    ):

        departments = (
            db.query(Department)
            .filter(
                Department.is_active == True
            )
            .all()
        )

        response = []

        for department in departments:

            students = (
                db.query(Student.id)
                .filter(
                    Student.department_id
                    == department.id,
                    Student.is_active == True,
                )
                .all()
            )

            student_ids = [
                student_id
                for (student_id,) in students
            ]

            percentages = []

            for student_id in student_ids:

                records = (
                    db.query(Attendance.status)
                    .filter(
                        Attendance.student_id
                        == student_id
                    )
                    .all()
                )

                statuses = [
                    status
                    for (status,) in records
                ]

                if not statuses:
                    continue

                total = len(statuses)

                present = statuses.count(
                    "PRESENT"
                )

                percentage = (
                    present / total
                ) * 100

                percentages.append(
                    percentage
                )

            average = (
                round(
                    sum(percentages)
                    / len(percentages),
                    2,
                )
                if percentages
                else 0.0
            )

            low_count = sum(
                1
                for percentage in percentages
                if percentage
                < settings.ATTENDANCE_REQUIRED_PERCENTAGE
            )

            response.append(
                {
                    "department_id":
                        department.id,

                    "department_name":
                        department.name,

                    "department_code":
                        department.code,

                    "total_students":
                        len(student_ids),

                    "average_attendance":
                        average,

                    "low_attendance_count":
                        low_count,
                }
            )

        return response

    @staticmethod
    def get_monthly_analytics(
        db: Session,
        year: int,
        month: int,
    ):

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

        records = (
            db.query(Attendance.status)
            .join(
                AttendanceSession,
                AttendanceSession.id
                == Attendance.attendance_session_id,
            )
            .filter(
                AttendanceSession.date >= start_date,
                AttendanceSession.date <= end_date,
            )
            .all()
        )

        statuses = [
            status
            for (status,) in records
        ]

        total = len(statuses)

        present = statuses.count(
            "PRESENT"
        )

        leave = statuses.count(
            "LEAVE"
        )

        absent = (
            total
            - present
            - leave
        )

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
            "year": year,
            "month": month,
            "total_lectures": total,
            "present_count": present,
            "absent_count": absent,
            "leave_count": leave,
            "attendance_percentage":
                percentage,
        }

    @staticmethod
    def get_teacher_analytics(
        db: Session,
        teacher_id: int,
    ):

        records = (
            db.query(Attendance.status)
            .join(
                AttendanceSession,
                AttendanceSession.id
                == Attendance.attendance_session_id,
            )
            .filter(
                AttendanceSession.teacher_id
                == teacher_id
            )
            .all()
        )

        statuses = [
            status
            for (status,) in records
        ]

        total = len(statuses)

        present = statuses.count(
            "PRESENT"
        )

        leave = statuses.count(
            "LEAVE"
        )

        absent = (
            total
            - present
            - leave
        )

        if absent < 0:
            absent = 0

        average_attendance = (
            round(
                (present / total) * 100,
                2,
            )
            if total > 0
            else 0.0
        )

        # Students belonging to this teacher's sessions
        student_ids = (
            db.query(
                Attendance.student_id
            )
            .join(
                AttendanceSession,
                AttendanceSession.id
                == Attendance.attendance_session_id,
            )
            .filter(
                AttendanceSession.teacher_id
                == teacher_id
            )
            .distinct()
            .all()
        )

        total_students = len(student_ids)

        low_attendance_count = 0

        for (student_id,) in student_ids:

            student_records = (
                db.query(Attendance.status)
                .join(
                    AttendanceSession,
                    AttendanceSession.id
                    == Attendance.attendance_session_id,
                )
                .filter(
                    Attendance.student_id
                    == student_id,
                    AttendanceSession.teacher_id
                    == teacher_id,
                )
                .all()
            )

            student_statuses = [
                status
                for (status,) in student_records
            ]

            if not student_statuses:
                continue

            student_total = len(
                student_statuses
            )

            student_present = (
                student_statuses.count(
                    "PRESENT"
                )
            )

            student_percentage = (
                student_present
                / student_total
            ) * 100

            if (
                student_percentage
                < settings.ATTENDANCE_REQUIRED_PERCENTAGE
            ):
                low_attendance_count += 1

        return {
            "total_students":
                total_students,

            "total_lectures":
                total,

            "present_count":
                present,

            "absent_count":
                absent,

            "leave_count":
                leave,

            "average_attendance":
                average_attendance,

            "low_attendance_count":
                low_attendance_count,
        }