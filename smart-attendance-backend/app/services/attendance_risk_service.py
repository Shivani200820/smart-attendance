from app.core.config import settings


class AttendanceRiskService:

    @staticmethod
    def calculate_risk(
        percentage: float,
    ) -> str:

        if percentage >= settings.ATTENDANCE_SAFE_PERCENTAGE:
            return "SAFE"

        if percentage >= settings.ATTENDANCE_NORMAL_PERCENTAGE:
            return "NORMAL"

        if percentage >= settings.ATTENDANCE_WARNING_PERCENTAGE:
            return "WARNING"

        return "CRITICAL"

    @staticmethod
    def is_low_attendance(
        percentage: float,
    ) -> bool:

        return (
            percentage
            < settings.ATTENDANCE_REQUIRED_PERCENTAGE
        )