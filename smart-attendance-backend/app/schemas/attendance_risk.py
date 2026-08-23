from pydantic import BaseModel


class LowAttendanceStudentResponse(BaseModel):
    student_id: int
    enrollment_number: str
    roll_number: str
    student_name: str

    class_id: int
    class_name: str

    total_lectures: int
    present_count: int
    absent_count: int
    leave_count: int

    attendance_percentage: float
    required_percentage: float
    risk_level: str