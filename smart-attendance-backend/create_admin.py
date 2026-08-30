from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password


def create_admin():
    db = SessionLocal()

    try:
        email = "admin@smartattendance.com"

        existing_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_user:
            print("Admin already exists!")
            print("Email:", email)
            return

        admin = User(
            name="System Admin",
            email=email,
            password_hash=hash_password("Admin@123"),
            role=UserRole.ADMIN,
            is_active=True,
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("\nAdmin created successfully!")
        print("ID:", admin.id)
        print("Email:", email)
        print("Password: Admin@123")
        print("Role:", admin.role.value)

    except Exception as e:
        db.rollback()
        print("Error creating admin:", e)

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()