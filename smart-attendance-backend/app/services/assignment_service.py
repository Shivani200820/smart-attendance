from sqlalchemy.orm import Session

from app.models.teacher_subject import TeacherSubject
from app.models.class_subject import ClassSubject


class AssignmentService:

    @staticmethod
    def assign_teacher_subject(
        db: Session,
        teacher_id: int,
        subject_id: int,
    ) -> TeacherSubject:

        existing = (
            db.query(TeacherSubject)
            .filter(
                TeacherSubject.teacher_id == teacher_id,
                TeacherSubject.subject_id == subject_id,
            )
            .first()
        )

        if existing:
            raise ValueError(
                "Teacher is already assigned to this subject"
            )

        assignment = TeacherSubject(
            teacher_id=teacher_id,
            subject_id=subject_id,
        )

        db.add(assignment)
        db.commit()
        db.refresh(assignment)

        return assignment

    @staticmethod
    def assign_class_subject(
        db: Session,
        class_id: int,
        subject_id: int,
    ) -> ClassSubject:

        existing = (
            db.query(ClassSubject)
            .filter(
                ClassSubject.class_id == class_id,
                ClassSubject.subject_id == subject_id,
            )
            .first()
        )

        if existing:
            raise ValueError(
                "Subject is already assigned to this class"
            )

        assignment = ClassSubject(
            class_id=class_id,
            subject_id=subject_id,
        )

        db.add(assignment)
        db.commit()
        db.refresh(assignment)

        return assignment