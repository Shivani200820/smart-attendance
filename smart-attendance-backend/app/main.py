from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.admin_departments import (
    router as admin_departments_router,
)
from app.routers.admin_classes import (
    router as admin_classes_router
)
from app.routers.admin_teachers import (
    router as admin_teachers_router
)
from app.routers.admin_students import (
    router as admin_students_router
)
from app.routers.admin_subjects import (
    router as admin_subjects_router,
)
from app.routers.admin_assignments import (
    router as admin_assignments_router,
)
from app.routers.admin_timetable import (
    router as admin_timetable_router,
)
from app.routers.attendance_sessions import (
    router as attendance_session_router,
)
from app.routers.attendance_qr import (
    router as attendance_qr_router,
)
from app.routers.attendance import router as attendance_router
from app.routers.teacher_dashboard import (
    router as teacher_dashboard_router,
)
from app.routers.student_attendance import (
    router as student_attendance_router
)
from app.routers.attendance_risk import (
    router as attendance_risk_router,
)
from app.routers.analytics import (
    router as analytics_router,
)
from app.routers.teacher_analytics import (
    router as teacher_analytics_router,
)
from app.routers.reports import router as reports_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "REST API backend for Smart Attendance Management System"
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    health_router,
    prefix="/api/v1"
)

app.include_router(
    auth_router,
    prefix="/api/v1",
)

app.include_router(
    admin_departments_router,
    prefix="/api/v1",
)

app.include_router(
    admin_classes_router,
    prefix="/api/v1"
)

app.include_router(
    admin_teachers_router,
    prefix="/api/v1",
)

app.include_router(
    admin_students_router,
    prefix="/api/v1",
)

app.include_router(
    admin_subjects_router,
    prefix="/api/v1",
)

app.include_router(
    admin_assignments_router,
    prefix="/api/v1",
)

app.include_router(
    admin_timetable_router,
    prefix="/api/v1",
)

app.include_router(
    attendance_session_router,
    prefix="/api/v1",
)

app.include_router(attendance_qr_router)
app.include_router(attendance_router)
app.include_router(teacher_dashboard_router)
app.include_router(student_attendance_router)
app.include_router(attendance_risk_router)
app.include_router(analytics_router)
app.include_router(
    teacher_analytics_router
)
app.include_router(reports_router)

@app.get("/")
def root():
    return {
        "success": True,
        "message": "Welcome to Smart Attendance Management System API",
        "data": {
            "version": settings.app_version,
            "environment": settings.environment
        }
    }

