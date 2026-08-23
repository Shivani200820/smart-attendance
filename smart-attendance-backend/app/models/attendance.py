from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base



class Attendance(Base):
    __tablename__ = "attendances"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    attendance_session_id: Mapped[int] = mapped_column(
        ForeignKey("attendance_sessions.id"),
        nullable=False,
        index=True
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id"),
        nullable=False,
        index=True
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="PRESENT"
    )

    marked_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    source: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="QR"
    )

    corrected_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True
    )

    correction_reason: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "attendance_session_id",
            "student_id",
            name="uq_attendance_session_student"
        ),
    )

    attendance_session = relationship(
        "AttendanceSession",
        back_populates="attendances"
    )

    student = relationship(
        "Student",
        back_populates="attendances"
    )

    corrections = relationship(
        "AttendanceCorrection",
        back_populates="attendance",
        cascade="all, delete-orphan",
    )