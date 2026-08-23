from app.services.attendance_risk_service import AttendanceRiskService


tests = [
    85.00,
    84.99,
    75.00,
    74.99,
    65.00,
    64.99,
]


for percentage in tests:

    risk = AttendanceRiskService.calculate_risk(
        percentage
    )

    low = AttendanceRiskService.is_low_attendance(
        percentage
    )

    print(
        f"{percentage}% → "
        f"{risk} | "
        f"Low Attendance: {low}"
    )