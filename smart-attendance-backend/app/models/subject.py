from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    department_id: Mapped[int] = mapped_column(
        ForeignKey(
            "departments.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        index=True,
    )

    # Relationships
    department = relationship(
        "Department",
        back_populates="subjects",
    )

    teacher_assignments = relationship(
        "TeacherSubject",
        back_populates="subject",
        cascade="all, delete-orphan",
    )

    class_assignments = relationship(
        "ClassSubject",
        back_populates="subject",
        cascade="all, delete-orphan",
    )

    timetables = relationship(
        "Timetable",
        back_populates="subject",
    )

    attendance_sessions = relationship(
        "AttendanceSession",
        back_populates="subject",
    )