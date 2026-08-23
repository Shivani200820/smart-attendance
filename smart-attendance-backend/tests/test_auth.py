import pytest
from fastapi import HTTPException

from app.core.dependencies import (
    require_admin,
    require_teacher,
    require_student,
)
from app.models.user import User, UserRole


def create_mock_user(role, is_active=True):
    user = User(
        id=1,
        name="Test User",
        email="test@example.com",
        password_hash="dummy_hash",
        role=role,
        is_active=is_active,
    )
    return user


def test_admin_role_allowed():
    user = create_mock_user(UserRole.ADMIN)

    result = require_admin(user)

    assert result == user


def test_teacher_cannot_access_admin():
    user = create_mock_user(UserRole.TEACHER)

    with pytest.raises(HTTPException) as exc:
        require_admin(user)

    assert exc.value.status_code == 403
    assert exc.value.detail == "Admin access required"


def test_student_cannot_access_admin():
    user = create_mock_user(UserRole.STUDENT)

    with pytest.raises(HTTPException) as exc:
        require_admin(user)

    assert exc.value.status_code == 403
    assert exc.value.detail == "Admin access required"

def test_teacher_wrong_role_blocked():
    user = create_mock_user(UserRole.STUDENT)

    with pytest.raises(HTTPException) as exc:
        require_teacher(user, None)

    assert exc.value.status_code == 403
    assert exc.value.detail == "Teacher access required"


def test_student_wrong_role_blocked():
    user = create_mock_user(UserRole.TEACHER)

    with pytest.raises(HTTPException) as exc:
        require_student(user, None)

    assert exc.value.status_code == 403
    assert exc.value.detail == "Student access required"