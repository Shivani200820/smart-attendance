from pydantic import BaseModel, ConfigDict, EmailStr, Field


class TeacherCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128
    )

    employee_id: str = Field(
        min_length=2,
        max_length=50
    )

    department_id: int = Field(
        gt=0
    )


class TeacherUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    email: EmailStr | None = None

    employee_id: str | None = Field(
        default=None,
        min_length=2,
        max_length=50
    )

    department_id: int | None = Field(
        default=None,
        gt=0
    )


class TeacherResponse(BaseModel):
    id: int
    user_id: int
    name: str
    email: EmailStr
    employee_id: str
    department_id: int
    is_active: bool


class TeacherStatusUpdate(BaseModel):
    is_active: bool