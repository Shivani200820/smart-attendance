from pydantic import BaseModel, ConfigDict, Field


class ClassCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100
    )

    year: int = Field(
        ge=1,
        le=6
    )

    division: str = Field(
        min_length=1,
        max_length=10
    )

    department_id: int = Field(
        gt=0
    )

    academic_year: str = Field(
        min_length=4,
        max_length=20
    )

    semester: int = Field(
        ge=1,
        le=12
    )


class ClassUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    year: int | None = Field(
        default=None,
        ge=1,
        le=6
    )

    division: str | None = Field(
        default=None,
        min_length=1,
        max_length=10
    )

    department_id: int | None = Field(
        default=None,
        gt=0
    )

    academic_year: str | None = Field(
        default=None,
        min_length=4,
        max_length=20
    )

    semester: int | None = Field(
        default=None,
        ge=1,
        le=12
    )


class ClassResponse(BaseModel):
    id: int
    name: str
    year: int
    division: str
    department_id: int
    academic_year: str
    semester: int

    model_config = ConfigDict(
        from_attributes=True
    )