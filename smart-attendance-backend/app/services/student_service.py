from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.student import Student
from app.models.user import User, UserRole


class StudentService:

    @staticmethod
    def create(
        db: Session,
        name: str,
        email: str,
        password: str,
        enrollment_number: str,
        roll_number: int,
        department_id: int,
        class_id: int,
        year: int,
        division: str,
        academic_year: str,
        semester: int,
    ) -> Student:

        # Check email
        existing_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_user:
            raise ValueError(
                "Email already registered"
            )

        # Check enrollment number
        existing_student = (
            db.query(Student)
            .filter(
                Student.enrollment_number
                == enrollment_number
            )
            .first()
        )

        if existing_student:
            raise ValueError(
                "Enrollment number already exists"
            )

        # Create User
        user = User(
            name=name.strip(),
            email=email,
            password_hash=hash_password(password),
            role=UserRole.STUDENT,
            is_active=True,
        )

        db.add(user)
        db.flush()

        # Create Student profile
        student = Student(
            user_id=user.id,
            enrollment_number=enrollment_number.strip(),
            roll_number=roll_number,
            department_id=department_id,
            class_id=class_id,
            year=year,
            division=division.strip(),
            academic_year=academic_year.strip(),
            semester=semester,
            is_active=True,
        )

        db.add(student)
        db.commit()
        db.refresh(student)

        return student

    @staticmethod
    def get_by_id(
        db: Session,
        student_id: int,
    ) -> Student | None:

        return (
            db.query(Student)
            .filter(Student.id == student_id)
            .first()
        )