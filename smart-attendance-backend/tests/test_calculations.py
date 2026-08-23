def test_attendance_percentage():
    present = 35
    total = 75

    percentage = round(
        (present / total) * 100,
        2,
    )

    assert percentage == 46.67


def test_absent_calculation():
    total = 75
    present = 35
    leave = 0

    absent = total - present - leave

    assert absent == 40


def test_absent_with_leave():
    total = 75
    present = 35
    leave = 2

    absent = total - present - leave

    assert absent == 38


def test_zero_students():
    total = 0
    present = 0

    percentage = (
        round((present / total) * 100, 2)
        if total > 0
        else 0.0
    )

    assert percentage == 0.0