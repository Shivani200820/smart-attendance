from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_database,
    require_admin,
)
from app.models.user import User
from app.models.subject import Subject
from app.models.department import Department
from app.schemas.subject import (
    SubjectCreate,
    SubjectUpdate,
    SubjectResponse,
)
from app.services.subject_service import SubjectService


router = APIRouter(
    prefix="/admin/subjects",
    tags=["Admin - Subjects"],
)


@router.post(
    "",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_subject(
    request: SubjectCreate,
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

    try:
        subject = SubjectService.create(
            db=db,
            name=request.name,
            code=request.code,
            department_id=request.department_id,
        )

        return subject

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.get(
    "",
    response_model=list[SubjectResponse],
)
def get_subjects(
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    return SubjectService.get_all(db)


@router.get(
    "/{subject_id}",
    response_model=SubjectResponse,
)
def get_subject(
    subject_id: int,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    subject = SubjectService.get_by_id(
        db=db,
        subject_id=subject_id,
    )

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )

    return subject


@router.put(
    "/{subject_id}",
    response_model=SubjectResponse,
)
def update_subject(
    subject_id: int,
    request: SubjectUpdate,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    subject = SubjectService.get_by_id(
        db=db,
        subject_id=subject_id,
    )

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )

    data = request.model_dump(
        exclude_unset=True
    )

    # Validate department if being changed
    if "department_id" in data:

        department = (
            db.query(Department)
            .filter(
                Department.id == data["department_id"]
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

    try:
        return SubjectService.update(
            db=db,
            subject=subject,
            data=data,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.delete(
    "/{subject_id}",
)
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    subject = SubjectService.get_by_id(
        db=db,
        subject_id=subject_id,
    )

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )

    SubjectService.delete(
        db=db,
        subject=subject,
    )

    return {
        "success": True,
        "message": "Subject deactivated successfully",
        "data": None,
    }