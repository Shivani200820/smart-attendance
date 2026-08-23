from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.class_model import ClassModel
from app.models.department import Department
from app.schemas.class_schema import (
    ClassCreate,
    ClassUpdate,
    ClassResponse,
)
from app.core.dependencies import get_database, require_admin


router = APIRouter(
    prefix="/admin/classes",
    tags=["Admin - Classes"],
)


@router.post(
    "",
    response_model=ClassResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_class(
    request: ClassCreate,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    department = db.query(Department).filter(
        Department.id == request.department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    if not department.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create class under inactive department",
        )

    class_obj = ClassModel(
        name=request.name.strip(),
        year=request.year,
        division=request.division.strip().upper(),
        department_id=request.department_id,
        academic_year=request.academic_year.strip(),
        semester=request.semester,
    )

    db.add(class_obj)
    db.commit()
    db.refresh(class_obj)

    return class_obj


@router.get(
    "",
    response_model=list[ClassResponse],
)
def get_classes(
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    return db.query(ClassModel).all()


@router.get(
    "/{class_id}",
    response_model=ClassResponse,
)
def get_class(
    class_id: int,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    class_obj = db.query(ClassModel).filter(
        ClassModel.id == class_id
    ).first()

    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )

    return class_obj


@router.put(
    "/{class_id}",
    response_model=ClassResponse,
)
def update_class(
    class_id: int,
    request: ClassUpdate,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    class_obj = db.query(ClassModel).filter(
        ClassModel.id == class_id
    ).first()

    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )

    data = request.model_dump(exclude_unset=True)

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
                detail="Cannot assign class to inactive department",
            )

    for field, value in data.items():
        if field == "division" and value:
            value = value.strip().upper()
        elif isinstance(value, str):
            value = value.strip()

        setattr(class_obj, field, value)

    db.commit()
    db.refresh(class_obj)

    return class_obj


@router.delete(
    "/{class_id}",
)
def delete_class(
    class_id: int,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    class_obj = db.query(ClassModel).filter(
        ClassModel.id == class_id
    ).first()

    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )

    try:
        db.delete(class_obj)
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Class cannot be deleted because "
                "students or other records are using it."
            ),
        )

    return {
        "success": True,
        "message": "Class deleted successfully",
        "data": None,
    }