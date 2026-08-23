from pydantic import BaseModel, Field


class QRValidationRequest(BaseModel):
    session_token: str = Field(
        ...,
        min_length=20,
        max_length=128
    )


class QRValidationResponse(BaseModel):
    valid: bool
    message: str
    session_id: int | None = None
    class_id: int | None = None
    subject_id: int | None = None
    expires_at: str | None = None

class QRSessionResponse(BaseModel):
    session_id: int
    qr_token: str
    expires_at: str
    status: str