from datetime import date, datetime

from pydantic import BaseModel


class StudentAttendanceSummaryResponse(BaseModel):
    total_lectures: int
    present_count: int
    absent_count: int
    leave_count: int
    attendance_percentage: float
    required_percentage: float
    risk_level: str


class StudentAttendanceRecordResponse(BaseModel):
    attendance_id: int
    session_id: int
    date: date
    subject_id: int
    subject_name: str
    subject_code: str
    status: str
    marked_at: datetime | None


class StudentSubjectAttendanceResponse(BaseModel):
    subject_id: int
    subject_name: str
    subject_code: str
    total_lectures: int
    present_count: int
    absent_count: int
    leave_count: int
    attendance_percentage: float
    required_percentage: float
    risk_level: str


class StudentMonthlyAttendanceResponse(BaseModel):
    year: int
    month: int
    total_lectures: int
    present_count: int
    absent_count: int
    leave_count: int
    attendance_percentage: float


class StudentDashboardResponse(BaseModel):
    summary: StudentAttendanceSummaryResponse
    subjects: list[StudentSubjectAttendanceResponse]