from datetime import date, datetime, time

from pydantic import BaseModel


class TodayClassResponse(BaseModel):
    timetable_id: int
    class_id: int
    class_name: str
    subject_id: int
    subject_name: str
    subject_code: str
    start_time: time
    end_time: time
    room: str | None
    session_id: int | None
    session_status: str | None


class TeacherDashboardResponse(BaseModel):
    total_classes_today: int
    active_sessions: int
    total_students: int
    average_attendance_percentage: float
    low_attendance_students: int


class TeacherSessionResponse(BaseModel):
    session_id: int
    class_id: int
    class_name: str
    subject_id: int
    subject_name: str
    date: date
    start_time: time
    end_time: time
    status: str
    expires_at: datetime


class TeacherClassResponse(BaseModel):
    class_id: int
    class_name: str
    year: int
    division: str
    academic_year: str
    semester: int


class TeacherSubjectResponse(BaseModel):
    subject_id: int
    subject_name: str
    subject_code: str