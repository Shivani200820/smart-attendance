import math

from app.core.config import settings


class AttendancePredictionService:

    @staticmethod
    def calculate_required_lectures(
        present_count: int,
        total_lectures: int,
        required_percentage: float | None = None,
    ) -> int | None:

        if present_count < 0:
            raise ValueError(
                "Present count cannot be negative"
            )

        if total_lectures < 0:
            raise ValueError(
                "Total lectures cannot be negative"
            )

        if present_count > total_lectures:
            raise ValueError(
                "Present count cannot exceed total lectures"
            )

        required = (
            required_percentage
            if required_percentage is not None
            else settings.ATTENDANCE_REQUIRED_PERCENTAGE
        )

        if required <= 0 or required > 100:
            raise ValueError(
                "Required percentage must be between 0 and 100"
            )

        # Already at or above required attendance
        if total_lectures > 0:

            current_percentage = (
                present_count / total_lectures
            ) * 100

            if current_percentage >= required:
                return 0

        # Special case: 100% requirement
        if required == 100:

            if present_count == total_lectures:
                return 0

            return None

        required_ratio = required / 100

        numerator = (
            required_ratio * total_lectures
            - present_count
        )

        denominator = 1 - required_ratio

        lectures_required = math.ceil(
            numerator / denominator
        )

        return max(0, lectures_required)

    @staticmethod
    def build_prediction(
        present_count: int,
        total_lectures: int,
    ) -> dict:

        required = (
            settings.ATTENDANCE_REQUIRED_PERCENTAGE
        )

        if total_lectures > 0:
            current_percentage = round(
                (present_count / total_lectures) * 100,
                2
            )
        else:
            current_percentage = 0.0

        lectures_required = (
            AttendancePredictionService
            .calculate_required_lectures(
                present_count=present_count,
                total_lectures=total_lectures,
                required_percentage=required,
            )
        )

        return {
            "current_percentage": current_percentage,
            "required_percentage": required,
            "present_count": present_count,
            "total_lectures": total_lectures,
            "lectures_required": lectures_required,
            "achievable": lectures_required is not None,
        }

    @staticmethod
    def calculate_recovery_scenarios(
        present_count: int,
        total_lectures: int,
        scenarios: list[int],
    ) -> list[dict]:

        results = []

        for future_lectures in scenarios:

            if future_lectures < 0:
                continue

            predicted_present = (
                present_count + future_lectures
            )

            predicted_total = (
                total_lectures + future_lectures
            )

            if predicted_total > 0:
                predicted_percentage = round(
                    (
                        predicted_present
                        / predicted_total
                    ) * 100,
                    2
                )
            else:
                predicted_percentage = 0.0

            reaches_required = (
                predicted_percentage
                >= settings.ATTENDANCE_REQUIRED_PERCENTAGE
            )

            results.append(
                {
                    "future_lectures": future_lectures,
                    "predicted_present": predicted_present,
                    "predicted_total": predicted_total,
                    "predicted_percentage":
                        predicted_percentage,
                    "reaches_required":
                        reaches_required,
                }
            )

        return results