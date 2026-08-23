from datetime import datetime

from pydantic import BaseModel, Field


class AttendanceCorrectionRequest(BaseModel):
    status: str = Field(
        ...,
        min_length=1,
        max_length=20,
    )

    correction_reason: str = Field(
        ...,
        min_length=5,
        max_length=500,
    )


class AttendanceCorrectionResponse(BaseModel):
    attendance_id: int
    previous_status: str
    new_status: str
    corrected_by: int
    correction_reason: str
    corrected_at: datetime


class AttendanceCorrectionHistoryResponse(BaseModel):
    id: int
    attendance_id: int
    previous_status: str
    new_status: str
    corrected_by: int
    correction_reason: str
    corrected_at: datetime