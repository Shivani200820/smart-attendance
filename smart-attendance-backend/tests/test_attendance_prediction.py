from app.services.attendance_prediction_service import (
    AttendancePredictionService,
)


def test_prediction_34_of_50():

    result = (
        AttendancePredictionService
        .calculate_required_lectures(
            present_count=34,
            total_lectures=50,
            required_percentage=75,
        )
    )

    assert result == 14


def test_already_above_required():

    result = (
        AttendancePredictionService
        .calculate_required_lectures(
            present_count=40,
            total_lectures=50,
            required_percentage=75,
        )
    )

    assert result == 0


def test_zero_present():

    result = (
        AttendancePredictionService
        .calculate_required_lectures(
            present_count=0,
            total_lectures=10,
            required_percentage=75,
        )
    )

    assert result == 30


def test_exactly_required():

    result = (
        AttendancePredictionService
        .calculate_required_lectures(
            present_count=3,
            total_lectures=4,
            required_percentage=75,
        )
    )

    assert result == 0


def test_prediction_rounding():

    result = (
        AttendancePredictionService
        .calculate_required_lectures(
            present_count=7,
            total_lectures=10,
            required_percentage=75,
        )
    )

    assert result == 2


def test_100_percent_already_achieved():

    result = (
        AttendancePredictionService
        .calculate_required_lectures(
            present_count=10,
            total_lectures=10,
            required_percentage=100,
        )
    )

    assert result == 0


def test_100_percent_impossible():

    result = (
        AttendancePredictionService
        .calculate_required_lectures(
            present_count=9,
            total_lectures=10,
            required_percentage=100,
        )
    )

    assert result is None


def test_recovery_scenarios():

    result = (
        AttendancePredictionService
        .calculate_recovery_scenarios(
            present_count=34,
            total_lectures=50,
            scenarios=[5, 8, 10, 14],
        )
    )

    assert result[0]["predicted_percentage"] == 70.91
    assert result[1]["predicted_percentage"] == 72.41
    assert result[2]["predicted_percentage"] == 73.33
    assert result[3]["predicted_percentage"] == 75.0

    assert result[3]["reaches_required"] is True