from pydantic import BaseModel, EmailStr, Field


class StudentCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128
    )

    enrollment_number: str = Field(
        min_length=2,
        max_length=50
    )

    roll_number: int = Field(
        gt=0
    )

    department_id: int = Field(
        gt=0
    )

    class_id: int = Field(
        gt=0
    )

    year: int = Field(
        gt=0,
        le=6
    )

    division: str = Field(
        min_length=1,
        max_length=10
    )

    academic_year: str = Field(
        min_length=4,
        max_length=20
    )

    semester: int = Field(
        gt=0,
        le=12
    )


class StudentUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    email: EmailStr | None = None

    enrollment_number: str | None = Field(
        default=None,
        min_length=2,
        max_length=50
    )

    roll_number: int | None = Field(
        default=None,
        gt=0
    )

    department_id: int | None = Field(
        default=None,
        gt=0
    )

    class_id: int | None = Field(
        default=None,
        gt=0
    )

    year: int | None = Field(
        default=None,
        gt=0,
        le=6
    )

    division: str | None = Field(
        default=None,
        min_length=1,
        max_length=10
    )

    academic_year: str | None = Field(
        default=None,
        min_length=4,
        max_length=20
    )

    semester: int | None = Field(
        default=None,
        gt=0,
        le=12
    )


class StudentResponse(BaseModel):
    id: int
    user_id: int
    name: str
    email: EmailStr
    enrollment_number: str
    roll_number: int
    department_id: int
    class_id: int
    year: int
    division: str
    academic_year: str
    semester: int
    is_active: bool


class StudentStatusUpdate(BaseModel):
    is_active: bool