from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
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
    classes = relationship(
        "ClassModel",
        back_populates="department",
        cascade="all, delete-orphan",
    )

    students = relationship(
        "Student",
        back_populates="department",
    )

    teachers = relationship(
        "Teacher",
        back_populates="department",
    )

    subjects = relationship(
        "Subject",
        back_populates="department",
        cascade="all, delete-orphan",
    )