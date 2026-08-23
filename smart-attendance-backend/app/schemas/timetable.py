from datetime import time

from pydantic import BaseModel, ConfigDict, Field, model_validator


VALID_DAYS = {
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
}


class TimetableCreate(BaseModel):
    class_id: int = Field(gt=0)
    subject_id: int = Field(gt=0)
    teacher_id: int = Field(gt=0)

    day_of_week: str = Field(
        min_length=3,
        max_length=20,
    )

    start_time: time
    end_time: time

    room: str | None = Field(
        default=None,
        max_length=50,
    )

    @model_validator(mode="after")
    def validate_timing(self):
        self.day_of_week = self.day_of_week.strip().upper()

        if self.day_of_week not in VALID_DAYS:
            raise ValueError("Invalid day of week")

        if self.start_time >= self.end_time:
            raise ValueError(
                "Start time must be before end time"
            )

        return self


class TimetableUpdate(BaseModel):
    class_id: int | None = Field(
        default=None,
        gt=0,
    )

    subject_id: int | None = Field(
        default=None,
        gt=0,
    )

    teacher_id: int | None = Field(
        default=None,
        gt=0,
    )

    day_of_week: str | None = Field(
        default=None,
        min_length=3,
        max_length=20,
    )

    start_time: time | None = None
    end_time: time | None = None

    room: str | None = Field(
        default=None,
        max_length=50,
    )

    is_active: bool | None = None

    @model_validator(mode="after")
    def validate_timing(self):
        if self.day_of_week is not None:
            self.day_of_week = (
                self.day_of_week.strip().upper()
            )

            if self.day_of_week not in VALID_DAYS:
                raise ValueError(
                    "Invalid day of week"
                )

        if (
            self.start_time is not None
            and self.end_time is not None
            and self.start_time >= self.end_time
        ):
            raise ValueError(
                "Start time must be before end time"
            )

        return self


class TimetableResponse(BaseModel):
    id: int
    class_id: int
    subject_id: int
    teacher_id: int
    day_of_week: str
    start_time: time
    end_time: time
    room: str | None
    is_active: bool

    model_config = ConfigDict(
        from_attributes=True
    )