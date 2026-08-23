from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.attendance_session import AttendanceSession
from app.models.class_model import ClassModel
from app.models.student import Student
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.models.timetable import Timetable


class TeacherDashboardService:

    @staticmethod
    def get_today_classes(
        db: Session,
        teacher: Teacher,
    ):
        today = datetime.now().strftime("%A").upper()

        result = db.execute(
            select(
                Timetable,
                ClassModel,
                Subject,
                AttendanceSession,
            )
            .join(
                ClassModel,
                Timetable.class_id == ClassModel.id,
            )
            .join(
                Subject,
                Timetable.subject_id == Subject.id,
            )
            .outerjoin(
                AttendanceSession,
                (
                    AttendanceSession.class_id
                    == Timetable.class_id
                )
                & (
                    AttendanceSession.subject_id
                    == Timetable.subject_id
                )
                & (
                    AttendanceSession.teacher_id
                    == teacher.id
                )
                & (
                    AttendanceSession.date
                    == func.current_date()
                )
            )
            .where(
                Timetable.teacher_id == teacher.id,
                Timetable.day_of_week == today,
                Timetable.is_active == True,
            )
            .order_by(
                Timetable.start_time
            )
        )

        return result.all()

    @staticmethod
    def get_teacher_classes(
        db: Session,
        teacher: Teacher,
    ):
        result = db.execute(
            select(
                ClassModel.id,
                ClassModel.name,
                ClassModel.year,
                ClassModel.division,
                ClassModel.academic_year,
                ClassModel.semester,
            )
            .join(
                Timetable,
                Timetable.class_id == ClassModel.id,
            )
            .where(
                Timetable.teacher_id == teacher.id,
                Timetable.is_active == True,
            )
            .distinct()
        )

        return result.all()

    @staticmethod
    def get_teacher_subjects(
        db: Session,
        teacher: Teacher,
    ):
        result = db.execute(
            select(
                Subject.id,
                Subject.name,
                Subject.code,
            )
            .join(
                Timetable,
                Timetable.subject_id == Subject.id,
            )
            .where(
                Timetable.teacher_id == teacher.id,
                Timetable.is_active == True,
            )
            .distinct()
        )

        return result.all()

    @staticmethod
    def get_teacher_sessions(
        db: Session,
        teacher: Teacher,
        limit: int = 20,
    ):
        result = db.execute(
            select(
                AttendanceSession,
                ClassModel,
                Subject,
            )
            .join(
                ClassModel,
                AttendanceSession.class_id
                == ClassModel.id,
            )
            .join(
                Subject,
                AttendanceSession.subject_id
                == Subject.id,
            )
            .where(
                AttendanceSession.teacher_id
                == teacher.id
            )
            .order_by(
                AttendanceSession.date.desc(),
                AttendanceSession.start_time.desc(),
            )
            .limit(limit)
        )

        return result.all()

    @staticmethod
    def get_dashboard_summary(
        db: Session,
        teacher: Teacher,
    ):
        today = datetime.now().strftime("%A").upper()

        total_classes = db.scalar(
            select(
                func.count(Timetable.id)
            ).where(
                Timetable.teacher_id == teacher.id,
                Timetable.day_of_week == today,
                Timetable.is_active == True,
            )
        )

        active_sessions = db.scalar(
            select(
                func.count(AttendanceSession.id)
            ).where(
                AttendanceSession.teacher_id
                == teacher.id,
                AttendanceSession.status
                == "ACTIVE",
            )
        )

        total_students = db.scalar(
            select(
                func.count(
                    func.distinct(Student.id)
                )
            )
            .join(
                Timetable,
                Timetable.class_id
                == Student.class_id,
            )
            .where(
                Timetable.teacher_id
                == teacher.id,
                Student.is_active == True,
                Timetable.is_active == True,
            )
        )

        return {
            "total_classes_today": total_classes or 0,
            "active_sessions": active_sessions or 0,
            "total_students": total_students or 0,
            "average_attendance_percentage": 0.0,
            "low_attendance_students": 0,
        }

    @staticmethod
    def get_teacher_classes(
        db: Session,
        teacher: Teacher,
    ):
        result = db.execute(
            select(
                ClassModel.id,
                ClassModel.name,
                ClassModel.year,
                ClassModel.division,
                ClassModel.academic_year,
                ClassModel.semester,
            )
            .join(
                Timetable,
                Timetable.class_id == ClassModel.id,
            )
            .where(
                Timetable.teacher_id == teacher.id,
                Timetable.is_active == True,
            )
            .distinct()
        )

        return result.all()

    @staticmethod
    def get_teacher_subjects(
        db: Session,
        teacher: Teacher,
    ):
        result = db.execute(
            select(
                Subject.id,
                Subject.name,
                Subject.code,
            )
            .join(
                Timetable,
                Timetable.subject_id == Subject.id,
            )
            .where(
                Timetable.teacher_id == teacher.id,
                Timetable.is_active == True,
            )
            .distinct()
        )

        return result.all()

    @staticmethod
    def get_teacher_sessions(
        db: Session,
        teacher: Teacher,
        limit: int = 20,
    ):
        result = db.execute(
            select(
                AttendanceSession,
                ClassModel,
                Subject,
            )
            .join(
                ClassModel,
                AttendanceSession.class_id == ClassModel.id,
            )
            .join(
                Subject,
                AttendanceSession.subject_id == Subject.id,
            )
            .where(
                AttendanceSession.teacher_id == teacher.id,
            )
            .order_by(
                AttendanceSession.date.desc(),
                AttendanceSession.start_time.desc(),
            )
            .limit(limit)
        )

        return result.all()

    @staticmethod
    def get_dashboard_summary(
        db: Session,
        teacher: Teacher,
    ):
        today = datetime.now().strftime("%A").upper()

        total_classes = db.scalar(
            select(
                func.count(Timetable.id)
            ).where(
                Timetable.teacher_id == teacher.id,
                Timetable.day_of_week == today,
                Timetable.is_active == True,
            )
        )

        active_sessions = db.scalar(
            select(
                func.count(AttendanceSession.id)
            ).where(
                AttendanceSession.teacher_id == teacher.id,
                AttendanceSession.status == "ACTIVE",
            )
        )

        total_students = db.scalar(
            select(
                func.count(
                    func.distinct(Student.id)
                )
            )
            .join(
                Timetable,
                Timetable.class_id == Student.class_id,
            )
            .where(
                Timetable.teacher_id == teacher.id,
                Student.is_active == True,
                Timetable.is_active == True,
            )
        )

        return {
            "total_classes_today": total_classes or 0,
            "active_sessions": active_sessions or 0,
            "total_students": total_students or 0,
            "average_attendance_percentage": 0.0,
            "low_attendance_students": 0,
        }