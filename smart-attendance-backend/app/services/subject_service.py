from sqlalchemy.orm import Session

from app.models.subject import Subject


class SubjectService:

    @staticmethod
    def create(
        db: Session,
        name: str,
        code: str,
        department_id: int,
    ) -> Subject:

        # Check duplicate subject code
        existing = (
            db.query(Subject)
            .filter(Subject.code == code)
            .first()
        )

        if existing:
            raise ValueError(
                "Subject code already exists"
            )

        subject = Subject(
            name=name.strip(),
            code=code.strip().upper(),
            department_id=department_id,
        )

        db.add(subject)
        db.commit()
        db.refresh(subject)

        return subject

    @staticmethod
    def get_by_id(
        db: Session,
        subject_id: int,
    ) -> Subject | None:

        return (
            db.query(Subject)
            .filter(Subject.id == subject_id)
            .first()
        )

    @staticmethod
    def get_all(
        db: Session,
    ) -> list[Subject]:

        return (
            db.query(Subject)
            .order_by(Subject.id.desc())
            .all()
        )

    @staticmethod
    def update(
        db: Session,
        subject: Subject,
        data: dict,
    ) -> Subject:

        if "code" in data:
            existing = (
                db.query(Subject)
                .filter(
                    Subject.code == data["code"],
                    Subject.id != subject.id,
                )
                .first()
            )

            if existing:
                raise ValueError(
                    "Subject code already exists"
                )

        for key, value in data.items():

            if isinstance(value, str):
                value = value.strip()

            if key == "code":
                value = value.upper()

            setattr(subject, key, value)

        db.commit()
        db.refresh(subject)

        return subject

    @staticmethod
    def delete(
        db: Session,
        subject: Subject,
    ) -> None:

        subject.is_active = False

        db.commit()