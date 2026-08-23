from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AttendanceCorrection(Base):
    __tablename__ = "attendance_corrections"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    attendance_id: Mapped[int] = mapped_column(
        ForeignKey(
            "attendances.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    corrected_by: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    previous_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    new_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    correction_reason: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    corrected_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    attendance = relationship(
        "Attendance",
        back_populates="corrections",
    )

    corrected_by_user = relationship(
        "User",
        foreign_keys=[corrected_by],
    )