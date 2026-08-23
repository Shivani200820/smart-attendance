from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.attendance_session import AttendanceSession
from app.models.timetable import Timetable
from app.models.teacher import Teacher
from app.schemas.attendance_session import AttendanceSessionCreate
from app.utils.attendance_enums import AttendanceSessionStatus
from app.utils.token_generator import generate_session_token
from app.core.config import settings


class AttendanceSessionService:

    @staticmethod
    def create_session(
        db: Session,
        teacher: Teacher,
        data: AttendanceSessionCreate,
    ):

        # 1. Find timetable
        timetable = (
            db.query(Timetable)
            .filter(
                Timetable.id == data.timetable_id,
                Timetable.is_active == True,
            )
            .first()
        )

        if not timetable:
            raise ValueError(
                "Timetable entry not found"
            )

        # 2. Check teacher authorization
        if timetable.teacher_id != teacher.id:
            raise PermissionError(
                "You are not assigned to this timetable"
            )

        # 3. Current date and time
        now = datetime.now()

        current_day = now.strftime("%A").upper()
        current_time = now.time()

        # 4. Check today's day
        if current_day != timetable.day_of_week:
            raise ValueError(
                "This lecture is not scheduled for today"
            )

        # 5. Check lecture time
        if not (
            timetable.start_time
            <= current_time
            <= timetable.end_time
        ):
            raise ValueError(
                "Current time is outside the scheduled lecture"
            )

        # 6. Prevent duplicate active session
        active_session = (
            db.query(AttendanceSession)
            .filter(
                AttendanceSession.class_id
                == timetable.class_id,

                AttendanceSession.subject_id
                == timetable.subject_id,

                AttendanceSession.status
                == AttendanceSessionStatus.ACTIVE.value,
            )
            .first()
        )

        if active_session:
            raise ValueError(
                "An active attendance session already exists"
            )

        # 7. Generate secure token
        token = generate_session_token()

        # 8. Calculate expiry
        expires_at = now + timedelta(
            seconds=settings.QR_EXPIRY_SECONDS
        )

        # 9. Create session
        session = AttendanceSession(
            class_id=timetable.class_id,
            subject_id=timetable.subject_id,
            teacher_id=timetable.teacher_id,
            date=now.date(),
            start_time=timetable.start_time,
            end_time=timetable.end_time,
            session_token=token,
            expires_at=expires_at,
            status=AttendanceSessionStatus.ACTIVE.value,
            created_at=now,
        )

        db.add(session)
        db.commit()
        db.refresh(session)

        return session

    @staticmethod
    def close_session(
        db: Session,
        session: AttendanceSession,
        teacher: Teacher,
    ):

        # 1. Check teacher authorization
        if session.teacher_id != teacher.id:
            raise PermissionError(
                "You are not authorized to close this session"
            )

        # 2. Check session status
        if session.status != AttendanceSessionStatus.ACTIVE.value:
            raise ValueError(
                "Attendance session is not active"
            )

        # 3. Close session
        now = datetime.now()

        session.status = AttendanceSessionStatus.CLOSED.value
        session.closed_at = now

        db.commit()
        db.refresh(session)

        return session

