from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.department import Department


class DepartmentService:

    @staticmethod
    def create(
        db: Session,
        name: str,
        code: str,
    ) -> Department:

        name = name.strip()
        code = code.strip().upper()

        existing = db.scalar(
            select(Department).where(
                (Department.name == name)
                | (Department.code == code)
            )
        )

        if existing:
            raise ValueError(
                "Department name or code already exists."
            )

        department = Department(
            name=name,
            code=code,
            is_active=True,
        )

        db.add(department)
        db.commit()
        db.refresh(department)

        return department

    @staticmethod
    def get_by_id(
        db: Session,
        department_id: int,
    ) -> Department | None:

        return db.scalar(
            select(Department).where(
                Department.id == department_id
            )
        )

    @staticmethod
    def update(
        db: Session,
        department: Department,
        name: str | None,
        code: str | None,
    ) -> Department:

        if name is not None:
            department.name = name.strip()

        if code is not None:
            department.code = code.strip().upper()

        db.commit()
        db.refresh(department)

        return department