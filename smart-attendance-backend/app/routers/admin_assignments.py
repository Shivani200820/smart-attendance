from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_database,
    require_admin,
)
from app.models.user import User
from app.models.teacher import Teacher
from app.models.subject import Subject
from app.models.class_model import ClassModel

from app.schemas.assignment import (
    TeacherSubjectCreate,
    TeacherSubjectResponse,
    ClassSubjectCreate,
    ClassSubjectResponse,
)

from app.services.assignment_service import AssignmentService


router = APIRouter(
    prefix="/admin/assignments",
    tags=["Admin - Assignments"],
)


# =========================================================
# Teacher → Subject
# =========================================================

@router.post(
    "/teacher-subject",
    response_model=TeacherSubjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def assign_teacher_subject(
    request: TeacherSubjectCreate,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    # Validate teacher
    teacher = (
        db.query(Teacher)
        .filter(
            Teacher.id == request.teacher_id
        )
        .first()
    )

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )

    if not teacher.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teacher is inactive",
        )

    # Validate subject
    subject = (
        db.query(Subject)
        .filter(
            Subject.id == request.subject_id
        )
        .first()
    )

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )

    if not subject.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject is inactive",
        )

    # Teacher and Subject should belong to same department
    if teacher.department_id != subject.department_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Teacher and subject must belong "
                "to the same department"
            ),
        )

    try:
        assignment = AssignmentService.assign_teacher_subject(
            db=db,
            teacher_id=request.teacher_id,
            subject_id=request.subject_id,
        )

        return assignment

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


# =========================================================
# Class → Subject
# =========================================================

@router.post(
    "/class-subject",
    response_model=ClassSubjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def assign_class_subject(
    request: ClassSubjectCreate,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
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

    # Validate subject
    subject = (
        db.query(Subject)
        .filter(
            Subject.id == request.subject_id
        )
        .first()
    )

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )

    if not subject.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject is inactive",
        )

    # Class and Subject should belong to same department
    if class_obj.department_id != subject.department_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Class and subject must belong "
                "to the same department"
            ),
        )

    try:
        assignment = AssignmentService.assign_class_subject(
            db=db,
            class_id=request.class_id,
            subject_id=request.subject_id,
        )

        return assignment

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )