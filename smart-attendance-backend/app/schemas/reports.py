from datetime import date

from pydantic import BaseModel


class DailyReportResponse(BaseModel):
    report_date: date
    total_students: int
    present_students: int
    absent_students: int
    leave_students: int
    attendance_percentage: float


class MonthlyReportResponse(BaseModel):
    year: int
    month: int
    total_students: int
    total_attendance_records: int
    present_count: int
    absent_count: int
    leave_count: int
    attendance_percentage: float


class StudentReportResponse(BaseModel):
    student_id: int
    student_name: str
    enrollment_number: str
    total_lectures: int
    present_count: int
    absent_count: int
    leave_count: int
    attendance_percentage: float


class SubjectReportResponse(BaseModel):
    subject_id: int
    subject_name: str
    subject_code: str
    total_lectures: int
    total_records: int
    present_count: int
    absent_count: int
    leave_count: int
    attendance_percentage: float


class ClassReportResponse(BaseModel):
    class_id: int
    class_name: str
    total_students: int
    total_records: int
    present_count: int
    absent_count: int
    leave_count: int
    attendance_percentage: float


class LowAttendanceReportResponse(BaseModel):
    student_id: int
    student_name: str
    enrollment_number: str
    class_id: int
    attendance_percentage: float
    required_percentage: float
    risk_level: str