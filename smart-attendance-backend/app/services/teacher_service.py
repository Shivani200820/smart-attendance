from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.department import Department
from app.models.teacher import Teacher
from app.models.user import User, UserRole


class TeacherService:

    @staticmethod
    def create(
        db: Session,
        name: str,
        email: str,
        password: str,
        employee_id: str,
        department_id: int,
    ) -> Teacher:

        # Check email
        existing_user = db.scalar(
            select(User).where(
                User.email == email
            )
        )

        if existing_user:
            raise ValueError(
                "Email already exists."
            )

        # Check employee ID
        existing_teacher = db.scalar(
            select(Teacher).where(
                Teacher.employee_id == employee_id
            )
        )

        if existing_teacher:
            raise ValueError(
                "Employee ID already exists."
            )

        # Check department
        department = db.scalar(
            select(Department).where(
                Department.id == department_id
            )
        )

        if not department:
            raise ValueError(
                "Department not found."
            )

        if not department.is_active:
            raise ValueError(
                "Department is inactive."
            )

        # Create User
        user = User(
            name=name.strip(),
            email=email,
            password_hash=hash_password(password),
            role=UserRole.TEACHER,
            is_active=True,
        )

        db.add(user)
        db.flush()

        # Create Teacher profile
        teacher = Teacher(
            user_id=user.id,
            employee_id=employee_id.strip(),
            department_id=department_id,
            is_active=True,
        )

        db.add(teacher)

        db.commit()
        db.refresh(teacher)

        return teacher

    @staticmethod
    def get_by_id(
        db: Session,
        teacher_id: int,
    ) -> Teacher | None:

        return db.scalar(
            select(Teacher).where(
                Teacher.id == teacher_id
            )
        )