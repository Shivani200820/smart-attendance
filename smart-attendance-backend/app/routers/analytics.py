from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db.session import get_db

from app.schemas.analytics import (
    AdminDashboardAnalyticsResponse,
    ClassAnalyticsResponse,
    SubjectAnalyticsResponse,
    DepartmentAnalyticsResponse,
    MonthlyAnalyticsResponse,
)

from app.services.analytics_service import (
    AnalyticsService,
)


router = APIRouter(
    prefix="/api/v1/admin/analytics",
    tags=["Analytics"],
)

@router.get(
    "/dashboard",
    response_model=AdminDashboardAnalyticsResponse,
)
def admin_dashboard_analytics(
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
):
    return AnalyticsService.get_admin_dashboard(db)

@router.get(
    "/class",
    response_model=list[ClassAnalyticsResponse],
)
def class_analytics(
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
):
    return AnalyticsService.get_class_analytics(db)

@router.get(
    "/subject",
    response_model=list[SubjectAnalyticsResponse],
)
def subject_analytics(
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
):
    return AnalyticsService.get_subject_analytics(db)

@router.get(
    "/department",
    response_model=list[DepartmentAnalyticsResponse],
)
def department_analytics(
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
):
    return AnalyticsService.get_department_analytics(db)

@router.get(
    "/monthly",
    response_model=MonthlyAnalyticsResponse,
)
def monthly_analytics(
    year: int = Query(
        ...,
        ge=2020,
        le=2100,
    ),
    month: int = Query(
        ...,
        ge=1,
        le=12,
    ),
    db: Session = Depends(get_db),
    current_admin=Depends(require_admin),
):
    return AnalyticsService.get_monthly_analytics(
        db,
        year,
        month,
    )