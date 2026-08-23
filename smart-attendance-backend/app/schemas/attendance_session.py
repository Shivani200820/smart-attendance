from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict


class AttendanceSessionCreate(BaseModel):
    timetable_id: int


class AttendanceSessionResponse(BaseModel):
    id: int
    class_id: int
    subject_id: int
    teacher_id: int

    date: date

    start_time: time
    end_time: time

    session_token: str
    expires_at: datetime

    status: str

    created_at: datetime
    closed_at: datetime | None

    model_config = ConfigDict(
        from_attributes=True
    )