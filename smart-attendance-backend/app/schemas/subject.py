from pydantic import BaseModel, ConfigDict, Field


class SubjectCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100,
    )

    code: str = Field(
        min_length=2,
        max_length=50,
    )

    department_id: int = Field(
        gt=0,
    )


class SubjectUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    code: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
    )

    department_id: int | None = Field(
        default=None,
        gt=0,
    )

    is_active: bool | None = None


class SubjectResponse(BaseModel):
    id: int
    name: str
    code: str
    department_id: int
    is_active: bool

    model_config = ConfigDict(
        from_attributes=True,
    )