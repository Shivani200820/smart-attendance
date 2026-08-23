from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_database,
    require_admin,
)
from app.models.user import User
from app.models.student import Student
from app.models.department import Department
from app.models.class_model import ClassModel
from app.schemas.student import (
    StudentCreate,
    StudentResponse,
)
from app.services.student_service import StudentService


router = APIRouter(
    prefix="/admin/students",
    tags=["Admin - Students"],
)


def student_to_response(student: Student) -> StudentResponse:
    return StudentResponse(
        id=student.id,
        user_id=student.user_id,
        name=student.user.name,
        email=student.user.email,
        enrollment_number=student.enrollment_number,
        roll_number=student.roll_number,
        department_id=student.department_id,
        class_id=student.class_id,
        year=student.year,
        division=student.division,
        academic_year=student.academic_year,
        semester=student.semester,
        is_active=student.is_active,
    )


@router.post(
    "",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_student(
    request: StudentCreate,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    # Validate department
    department = (
        db.query(Department)
        .filter(
            Department.id == request.department_id
        )
        .first()
    )

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    if not department.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department is inactive",
        )

    # Validate class
    class_obj = (
        db.query(ClassModel)
        .filter(
            ClassModel.id == request.class_id
        )
        .first()
    )

    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )

    # Class must belong to selected department
    if class_obj.department_id != request.department_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Class does not belong to the selected department",
        )

    try:
        student = StudentService.create(
            db=db,
            name=request.name,
            email=request.email,
            password=request.password,
            enrollment_number=request.enrollment_number,
            roll_number=request.roll_number,
            department_id=request.department_id,
            class_id=request.class_id,
            year=request.year,
            division=request.division,
            academic_year=request.academic_year,
            semester=request.semester,
        )

        return student_to_response(student)

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.get(
    "",
    response_model=list[StudentResponse],
)
def get_students(
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    students = (
        db.query(Student)
        .all()
    )

    return [
        student_to_response(student)
        for student in students
    ]


@router.get(
    "/{student_id}",
    response_model=StudentResponse,
)
def get_student(
    student_id: int,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    student = StudentService.get_by_id(
        db=db,
        student_id=student_id,
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    return student_to_response(student)