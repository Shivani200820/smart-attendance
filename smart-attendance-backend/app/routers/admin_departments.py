from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.department import Department
from app.models.user import User
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
)
from app.services.department_service import DepartmentService
from app.core.dependencies import (
    get_database,
    require_admin,
)


router = APIRouter(
    prefix="/admin/departments",
    tags=["Admin - Departments"],
)


@router.post(
    "",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_department(
    request: DepartmentCreate,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    try:
        department = DepartmentService.create(
            db=db,
            name=request.name,
            code=request.code,
        )

        return department

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.get(
    "",
    response_model=list[DepartmentResponse],
)
def get_departments(
    search: str | None = None,
    is_active: bool | None = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    if page < 1:
        raise HTTPException(
            status_code=400,
            detail="Page must be greater than or equal to 1",
        )

    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 100",
        )

    query = select(Department)

    if search:
        search_value = f"%{search.strip()}%"

        query = query.where(
            (Department.name.ilike(search_value))
            | (Department.code.ilike(search_value))
        )

    if is_active is not None:
        query = query.where(
            Department.is_active == is_active
        )

    query = query.order_by(
        Department.id.desc()
    )

    offset = (page - 1) * limit

    query = query.offset(offset).limit(limit)

    departments = db.scalars(query).all()

    return departments


@router.get(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def get_department(
    department_id: int,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    department = DepartmentService.get_by_id(
        db=db,
        department_id=department_id,
    )

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    return department


@router.patch(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def update_department(
    department_id: int,
    request: DepartmentUpdate,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    department = DepartmentService.get_by_id(
        db=db,
        department_id=department_id,
    )

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    try:
        department = DepartmentService.update(
            db=db,
            department=department,
            name=request.name,
            code=request.code,
        )

        return department

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.patch(
    "/{department_id}/status",
)
def update_department_status(
    department_id: int,
    is_active: bool,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    department = DepartmentService.get_by_id(
        db=db,
        department_id=department_id,
    )

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    department.is_active = is_active

    db.commit()
    db.refresh(department)

    return {
        "success": True,
        "message": "Department status updated successfully",
        "data": {
            "id": department.id,
            "is_active": department.is_active,
        },
    }


@router.delete(
    "/{department_id}",
)
def delete_department(
    department_id: int,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    department = DepartmentService.get_by_id(
        db=db,
        department_id=department_id,
    )

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    try:
        db.delete(department)
        db.commit()

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Department cannot be deleted because "
                "it is being used by other records."
            ),
        )

    return {
        "success": True,
        "message": "Department deleted successfully",
        "data": None,
    }