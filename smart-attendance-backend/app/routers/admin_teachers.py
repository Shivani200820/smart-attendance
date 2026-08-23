from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.teacher import (
    TeacherCreate,
    TeacherUpdate,
    TeacherResponse,
    TeacherStatusUpdate,
)
from app.services.teacher_service import TeacherService
from app.core.dependencies import (
    get_database,
    require_admin,
)
from app.models.teacher import Teacher
from app.models.department import Department



router = APIRouter(
    prefix="/admin/teachers",
    tags=["Admin - Teachers"],
)

def teacher_to_response(teacher: Teacher) -> TeacherResponse:
    return TeacherResponse(
        id=teacher.id,
        user_id=teacher.user_id,
        name=teacher.user.name,
        email=teacher.user.email,
        employee_id=teacher.employee_id,
        department_id=teacher.department_id,
        is_active=teacher.is_active,
    )


@router.post(
    "",
    response_model=TeacherResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_teacher(
    request: TeacherCreate,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    try:
        teacher = TeacherService.create(
            db=db,
            name=request.name,
            email=request.email,
            password=request.password,
            employee_id=request.employee_id,
            department_id=request.department_id,
        )

        return teacher_to_response(teacher)

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.get(
    "",
    response_model=list[TeacherResponse],
)
def get_teachers(
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    teachers = db.query(Teacher).all()

    return [
        teacher_to_response(teacher)
        for teacher in teachers
    ]

@router.get(
    "/{teacher_id}",
    response_model=TeacherResponse,
)
def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    teacher = TeacherService.get_by_id(
        db,
        teacher_id,
    )

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )

    return teacher_to_response(teacher)

@router.put(
    "/{teacher_id}",
    response_model=TeacherResponse,
)
def update_teacher(
    teacher_id: int,
    request: TeacherUpdate,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    teacher = TeacherService.get_by_id(
        db,
        teacher_id,
    )

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )

    data = request.model_dump(
        exclude_unset=True
    )

    if "department_id" in data:
        department = db.query(Department).filter(
            Department.id == data["department_id"]
        ).first()

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

    if "name" in data:
        teacher.user.name = data["name"].strip()

    if "email" in data:
        teacher.user.email = data["email"]

    if "employee_id" in data:
        teacher.employee_id = data["employee_id"].strip()

    if "department_id" in data:
        teacher.department_id = data["department_id"]

    db.commit()
    db.refresh(teacher)

    return teacher_to_response(teacher)

@router.patch(
    "/{teacher_id}/status",
)
def update_teacher_status(
    teacher_id: int,
    request: TeacherStatusUpdate,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    teacher = TeacherService.get_by_id(
        db,
        teacher_id,
    )

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )

    teacher.is_active = request.is_active
    teacher.user.is_active = request.is_active

    db.commit()

    return {
        "success": True,
        "message": "Teacher status updated successfully",
        "data": {
            "teacher_id": teacher.id,
            "is_active": teacher.is_active,
        },
    }

@router.delete(
    "/{teacher_id}",
)
def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    teacher = TeacherService.get_by_id(
        db,
        teacher_id,
    )

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )

    teacher.is_active = False
    teacher.user.is_active = False

    db.commit()

    return {
        "success": True,
        "message": "Teacher deactivated successfully",
        "data": None,
    }