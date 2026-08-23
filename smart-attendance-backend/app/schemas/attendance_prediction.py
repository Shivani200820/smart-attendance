from pydantic import BaseModel


class AttendancePredictionResponse(BaseModel):
    current_percentage: float
    required_percentage: float
    present_count: int
    total_lectures: int
    lectures_required: int | None
    achievable: bool


class RecoveryScenario(BaseModel):
    future_lectures: int
    predicted_present: int
    predicted_total: int
    predicted_percentage: float
    reaches_required: bool


class AttendanceRecoveryResponse(BaseModel):
    current_percentage: float
    required_percentage: float
    scenarios: list[RecoveryScenario]