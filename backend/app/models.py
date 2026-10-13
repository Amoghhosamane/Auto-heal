from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, Boolean, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class IncidentModel(Base):
    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    service: Mapped[str] = mapped_column(String(128), index=True)
    type: Mapped[str] = mapped_column(String(128))
    severity: Mapped[str] = mapped_column(String(32), default="warning")  # info, warning, critical, fatal
    status: Mapped[str] = mapped_column(String(32), default="detected", index=True)  # detected, recovering, recovered, escalated
    action: Mapped[str] = mapped_column(String(128))
    duration: Mapped[str] = mapped_column(String(32), default="0.0s")
    details: Mapped[str] = mapped_column(Text)
    is_simulation: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    timeline: Mapped[list] = mapped_column(JSON, default=list)  # list of {timestamp, message, stage}

class RecoveryActionModel(Base):
    __tablename__ = "recovery_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    incident_id: Mapped[str] = mapped_column(String(64), index=True)
    service: Mapped[str] = mapped_column(String(128))
    action_type: Mapped[str] = mapped_column(String(128))
    command_executed: Mapped[str] = mapped_column(String(256))
    initiated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="executing")  # executing, success, failed, rejected
    verification_passed: Mapped[bool] = mapped_column(Boolean, default=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_simulation: Mapped[bool] = mapped_column(Boolean, default=False)

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    actor: Mapped[str] = mapped_column(String(64), default="autonomous-engine")
    event_type: Mapped[str] = mapped_column(String(64))
    details: Mapped[str] = mapped_column(Text)
