from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ClassSubject(Base):
    __tablename__ = "class_subjects"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    class_id: Mapped[int] = mapped_column(
        ForeignKey(
            "classes.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    subject_id: Mapped[int] = mapped_column(
        ForeignKey(
            "subjects.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    __table_args__ = (
        UniqueConstraint(
            "class_id",
            "subject_id",
            name="uq_class_subject",
        ),
    )

    # Relationships
    class_obj = relationship(
        "ClassModel",
        back_populates="subject_assignments",
    )

    subject = relationship(
        "Subject",
        back_populates="class_assignments",
    )