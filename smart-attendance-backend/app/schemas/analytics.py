from pydantic import BaseModel


class AttendanceStatsResponse(BaseModel):
    total_lectures: int
    present_count: int
    absent_count: int
    leave_count: int
    attendance_percentage: float


class ClassAnalyticsResponse(BaseModel):
    class_id: int
    class_name: str
    total_students: int
    average_attendance: float
    low_attendance_count: int


class SubjectAnalyticsResponse(BaseModel):
    subject_id: int
    subject_name: str
    subject_code: str
    total_students: int
    total_lectures: int
    present_count: int
    absent_count: int
    leave_count: int
    attendance_percentage: float


class DepartmentAnalyticsResponse(BaseModel):
    department_id: int
    department_name: str
    department_code: str
    total_students: int
    average_attendance: float
    low_attendance_count: int


class MonthlyAnalyticsResponse(BaseModel):
    year: int
    month: int
    total_lectures: int
    present_count: int
    absent_count: int
    leave_count: int
    attendance_percentage: float


class AdminDashboardAnalyticsResponse(BaseModel):
    total_students: int
    total_teachers: int
    total_classes: int
    total_subjects: int
    average_attendance: float
    low_attendance_count: int


class TeacherAnalyticsResponse(BaseModel):
    total_students: int
    total_lectures: int
    present_count: int
    absent_count: int
    leave_count: int
    average_attendance: float
    low_attendance_count: int