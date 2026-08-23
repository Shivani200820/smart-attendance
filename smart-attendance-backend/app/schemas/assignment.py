from pydantic import BaseModel, ConfigDict, Field


class TeacherSubjectCreate(BaseModel):
    teacher_id: int = Field(
        gt=0,
    )

    subject_id: int = Field(
        gt=0,
    )


class TeacherSubjectResponse(BaseModel):
    id: int
    teacher_id: int
    subject_id: int

    model_config = ConfigDict(
        from_attributes=True,
    )


class ClassSubjectCreate(BaseModel):
    class_id: int = Field(
        gt=0,
    )

    subject_id: int = Field(
        gt=0,
    )


class ClassSubjectResponse(BaseModel):
    id: int
    class_id: int
    subject_id: int

    model_config = ConfigDict(
        from_attributes=True,
    )