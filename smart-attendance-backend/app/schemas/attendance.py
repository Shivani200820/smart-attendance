from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AttendanceMarkRequest(BaseModel):
    session_token: str = Field(
        ...,
        min_length=20,
        max_length=128,
    )


class AttendanceMarkResponse(BaseModel):
    message: str
    attendance_id: int
    status: str
    marked_at: datetime


class AttendanceResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    attendance_session_id: int
    student_id: int
    status: str
    marked_at: datetime
    source: str

class AttendanceStatsResponse(BaseModel):
    total_students: int
    present_students: int
    absent_students: int
    leave_students: int
    attendance_percentage: float