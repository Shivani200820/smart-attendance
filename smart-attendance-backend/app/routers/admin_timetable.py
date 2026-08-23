from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_database,
    require_admin,
)
from app.models.user import User
from app.models.timetable import Timetable
from app.schemas.timetable import (
    TimetableCreate,
    TimetableUpdate,
    TimetableResponse,
)
from app.services.timetable_service import TimetableService


router = APIRouter(
    prefix="/admin/timetable",
    tags=["Admin - Timetable"],
)


@router.post(
    "",
    response_model=TimetableResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_timetable(
    request: TimetableCreate,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    try:
        timetable = TimetableService.create(
            db=db,
            data=request,
        )

        return timetable

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get(
    "",
    response_model=list[TimetableResponse],
)
def get_timetables(
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    return (
        db.query(Timetable)
        .order_by(
            Timetable.day_of_week,
            Timetable.start_time,
        )
        .all()
    )


@router.get(
    "/{timetable_id}",
    response_model=TimetableResponse,
)
def get_timetable(
    timetable_id: int,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    timetable = TimetableService.get_by_id(
        db=db,
        timetable_id=timetable_id,
    )

    if not timetable:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timetable entry not found",
        )

    return timetable


@router.put(
    "/{timetable_id}",
    response_model=TimetableResponse,
)
def update_timetable(
    timetable_id: int,
    request: TimetableUpdate,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    timetable = TimetableService.get_by_id(
        db=db,
        timetable_id=timetable_id,
    )

    if not timetable:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timetable entry not found",
        )

    data = request.model_dump(
        exclude_unset=True
    )

    class_id = data.get(
        "class_id",
        timetable.class_id,
    )

    subject_id = data.get(
        "subject_id",
        timetable.subject_id,
    )

    teacher_id = data.get(
        "teacher_id",
        timetable.teacher_id,
    )

    day_of_week = data.get(
        "day_of_week",
        timetable.day_of_week,
    )

    start_time = data.get(
        "start_time",
        timetable.start_time,
    )

    end_time = data.get(
        "end_time",
        timetable.end_time,
    )

    if day_of_week:
        day_of_week = day_of_week.upper()

    if start_time >= end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start time must be before end time",
        )

    try:
        TimetableService.validate_assignments(
            db=db,
            class_id=class_id,
            subject_id=subject_id,
            teacher_id=teacher_id,
        )

        TimetableService.check_conflict(
            db=db,
            class_id=class_id,
            teacher_id=teacher_id,
            day_of_week=day_of_week,
            start_time=start_time,
            end_time=end_time,
            exclude_id=timetable_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    timetable.class_id = class_id
    timetable.subject_id = subject_id
    timetable.teacher_id = teacher_id
    timetable.day_of_week = day_of_week
    timetable.start_time = start_time
    timetable.end_time = end_time

    if "room" in data:
        timetable.room = data["room"]

    if "is_active" in data:
        timetable.is_active = data["is_active"]

    db.commit()
    db.refresh(timetable)

    return timetable


@router.patch(
    "/{timetable_id}/status",
    response_model=TimetableResponse,
)
def update_timetable_status(
    timetable_id: int,
    is_active: bool,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    timetable = TimetableService.get_by_id(
        db=db,
        timetable_id=timetable_id,
    )

    if not timetable:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timetable entry not found",
        )

    timetable.is_active = is_active

    db.commit()
    db.refresh(timetable)

    return timetable


@router.delete(
    "/{timetable_id}",
)
def delete_timetable(
    timetable_id: int,
    db: Session = Depends(get_database),
    _: User = Depends(require_admin),
):
    timetable = TimetableService.get_by_id(
        db=db,
        timetable_id=timetable_id,
    )

    if not timetable:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timetable entry not found",
        )

    timetable.is_active = False

    db.commit()

    return {
        "success": True,
        "message": "Timetable deactivated successfully",
        "data": None,
    }