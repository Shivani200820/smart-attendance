from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ClassModel(Base):
    __tablename__ = "classes"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    year: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    division: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    department_id: Mapped[int] = mapped_column(
        ForeignKey(
            "departments.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    academic_year: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
    )

    semester: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # Relationships
    department = relationship(
        "Department",
        back_populates="classes",
    )

    students = relationship(
        "Student",
        back_populates="class_obj",
    )

    subject_assignments = relationship(
        "ClassSubject",
        back_populates="class_obj",
        cascade="all, delete-orphan",
    )

    timetables = relationship(
        "Timetable",
        back_populates="class_",
    )

    attendance_sessions = relationship(
        "AttendanceSession",
        back_populates="class_",
    )