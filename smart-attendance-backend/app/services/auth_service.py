from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User, UserRole


class AuthService:

    @staticmethod
    def get_user_by_email(
        db: Session,
        email: str,
    ) -> User | None:

        stmt = select(User).where(
            User.email == email.lower().strip()
        )

        return db.scalar(stmt)

    @staticmethod
    def register_user(
        db: Session,
        name: str,
        email: str,
        password: str,
        role: UserRole,
    ) -> User:

        existing_user = AuthService.get_user_by_email(
            db,
            email,
        )

        if existing_user:
            raise ValueError(
                "A user with this email already exists."
            )

        user = User(
            name=name.strip(),
            email=email.lower().strip(),
            password_hash=hash_password(password),
            role=role,
            is_active=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def authenticate_user(
        db: Session,
        email: str,
        password: str,
    ) -> User | None:

        user = AuthService.get_user_by_email(
            db,
            email,
        )

        if not user:
            return None

        if not verify_password(
            password,
            user.password_hash,
        ):
            return None

        if not user.is_active:
            return None

        return user

    @staticmethod
    def create_user_token(
        user: User,
    ) -> str:

        token_data = {
            "sub": str(user.id),
            "role": user.role.value,
        }

        return create_access_token(token_data)