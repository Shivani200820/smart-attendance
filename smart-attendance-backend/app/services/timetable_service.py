from sqlalchemy.orm import Session

from app.models.class_subject import ClassSubject
from app.models.teacher_subject import TeacherSubject
from app.models.timetable import Timetable


class TimetableService:

    @staticmethod
    def validate_assignments(
        db: Session,
        class_id: int,
        subject_id: int,
        teacher_id: int,
    ) -> None:

        # Check Class → Subject assignment
        class_subject = (
            db.query(ClassSubject)
            .filter(
                ClassSubject.class_id == class_id,
                ClassSubject.subject_id == subject_id,
            )
            .first()
        )

        if not class_subject:
            raise ValueError(
                "Subject is not assigned to this class"
            )

        # Check Teacher → Subject assignment
        teacher_subject = (
            db.query(TeacherSubject)
            .filter(
                TeacherSubject.teacher_id == teacher_id,
                TeacherSubject.subject_id == subject_id,
            )
            .first()
        )

        if not teacher_subject:
            raise ValueError(
                "Teacher is not assigned to this subject"
            )

    @staticmethod
    def check_conflict(
        db: Session,
        class_id: int,
        teacher_id: int,
        day_of_week: str,
        start_time,
        end_time,
        exclude_id: int | None = None,
    ) -> None:

        query = (
            db.query(Timetable)
            .filter(
                Timetable.is_active.is_(True),
                Timetable.day_of_week == day_of_week,

                # Time overlap:
                # existing start < new end
                # AND existing end > new start
                Timetable.start_time < end_time,
                Timetable.end_time > start_time,

                # Conflict if same class OR same teacher
                (
                    (Timetable.class_id == class_id)
                    |
                    (Timetable.teacher_id == teacher_id)
                ),
            )
        )

        # During update, don't compare with itself
        if exclude_id is not None:
            query = query.filter(
                Timetable.id != exclude_id
            )

        conflict = query.first()

        if conflict:
            raise ValueError(
                "Timetable conflict detected"
            )

    @staticmethod
    def create(
        db: Session,
        data,
    ) -> Timetable:

        # 1. Validate Class → Subject
        # 2. Validate Teacher → Subject
        TimetableService.validate_assignments(
            db=db,
            class_id=data.class_id,
            subject_id=data.subject_id,
            teacher_id=data.teacher_id,
        )

        # 3. Check timetable conflict
        TimetableService.check_conflict(
            db=db,
            class_id=data.class_id,
            teacher_id=data.teacher_id,
            day_of_week=data.day_of_week,
            start_time=data.start_time,
            end_time=data.end_time,
        )

        timetable = Timetable(
            class_id=data.class_id,
            subject_id=data.subject_id,
            teacher_id=data.teacher_id,
            day_of_week=data.day_of_week,
            start_time=data.start_time,
            end_time=data.end_time,
            room=data.room,
            is_active=True,
        )

        db.add(timetable)
        db.commit()
        db.refresh(timetable)

        return timetable

    @staticmethod
    def get_by_id(
        db: Session,
        timetable_id: int,
    ) -> Timetable | None:

        return (
            db.query(Timetable)
            .filter(
                Timetable.id == timetable_id
            )
            .first()
        )