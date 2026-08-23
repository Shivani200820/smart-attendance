from enum import Enum


class AttendanceSessionStatus(str, Enum):
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"
    EXPIRED = "EXPIRED"


class AttendanceStatus(str, Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LEAVE = "LEAVE"


class AttendanceSource(str, Enum):
    QR = "QR"
    MANUAL = "MANUAL"
    CORRECTION = "CORRECTION"