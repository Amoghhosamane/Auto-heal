import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy import select
from app.database import async_session
from app.models import IncidentModel
from app.config import settings
from app.websocket_manager import manager
from app.prometheus_client import prometheus_client
from app.recovery_engine import recovery_engine
from app.demo_engine import demo_engine

logger = logging.getLogger("autoheal.detector")

class DetectionEngine:
    def __init__(self):
        self._running = False
        self._consecutive_cpu_spikes = 0
        self._consecutive_mem_spikes = 0

    async def evaluate_telemetry(self, metrics: Dict[str, Any]):
        """Evaluates thresholds, consecutive checks, and deduplication."""
        cpu = metrics.get("cpu_utilization_pct", 0)
        mem = metrics.get("memory_utilization_pct", 0)
        err = metrics.get("error_rate_pct", 0)
        
        # 1. CPU saturation rule (>85%)
        if cpu > 85.0:
            self._consecutive_cpu_spikes += 1
            if self._consecutive_cpu_spikes >= 2:
                await self._raise_incident(
                    service="auth-session-worker",
                    failure_type="CPU Overload (>85%)",
                    severity="warning",
                    action="Scale Replicas (4 → 10)",
                    details=f"High CPU utilization observed ({cpu}%) across compute nodes."
                )
                self._consecutive_cpu_spikes = 0
        else:
            self._consecutive_cpu_spikes = 0

        # 2. Memory saturation rule (>90%)
        if mem > 90.0:
            self._consecutive_mem_spikes += 1
            if self._consecutive_mem_spikes >= 2:
                await self._raise_incident(
                    service="payment-gateway-svc",
                    failure_type="Memory Saturation (>90%)",
                    severity="critical",
                    action="Restart & Replace Pod",
                    details=f"Node memory approaching limit ({mem}%). Initiating proactive pod recycling."
                )
                self._consecutive_mem_spikes = 0
        else:
            self._consecutive_mem_spikes = 0

        # 3. Bad deployment / Error spike rule (>5% error rate)
        if err > 5.0:
            await self._raise_incident(
                service="checkout-api-v2",
                failure_type="Bad Deployment (500 Spikes)",
                severity="critical",
                action="Rollback Deployment (v2.4.1 → v2.4.0)",
                details=f"Canary error rate spike observed ({err}%). Golden signal threshold exceeded."
            )

    async def _raise_incident(
        self,
        service: str,
        failure_type: str,
        severity: str,
        action: str,
        details: str,
        is_simulation: bool = False
    ) -> IncidentModel:
        """Deduplicates against active incidents, creates DB record and triggers recovery."""
        async with async_session() as session:
            # Check for existing unresolved incident on this service
            stmt = select(IncidentModel).where(
                IncidentModel.service == service,
                IncidentModel.status.in_(["detected", "recovering"])
            )
            res = await session.execute(stmt)
            existing = res.scalar_one_or_none()
            if existing:
                logger.info(f"Deduplicating failure for {service}: Incident {existing.id} already active.")
                return existing

            import uuid
            inc_id = f"INC-{uuid.uuid4().hex[:6].upper()}"
            now_str = datetime.now(timezone.utc).strftime("%H:%M:%S")

            incident = IncidentModel(
                id=inc_id,
                service=service,
                type=failure_type,
                severity=severity,
                status="detected",
                action=action,
                duration="2.5s",
                details=details,
                is_simulation=is_simulation,
                timeline=[
                    {"timestamp": now_str, "stage": "detect", "message": f"Anomaly detected in {service}: {failure_type}"}
                ]
            )
            session.add(incident)
            await session.commit()

            # Broadcast new incident to WebSocket
            await manager.broadcast("new_incident", {
                "id": incident.id,
                "timestamp": "Just now",
                "service": incident.service,
                "type": incident.type,
                "status": "detected",
                "action": incident.action,
                "duration": incident.duration,
                "details": incident.details
            })

            # Trigger automated self-healing asynchronously
            asyncio.create_task(recovery_engine.execute_recovery(incident.id))
            return incident

    async def trigger_simulation_incident(self, scenario_data: Dict[str, Any]) -> IncidentModel:
        """Triggers a simulated incident by injecting synthetic telemetry and running detection rules."""
        scenario_id = scenario_data.get("scenario_id", "scenario-pod-crash")
        service_name = scenario_data.get("service", "payment-gateway-svc")

        # 1. Inject synthetic telemetry into DemoState
        demo_engine.inject_failure(scenario_id, service_name)
        
        # 2. Broadcast updated failure metrics and degraded service states to frontend
        await manager.broadcast("metrics_tick", demo_engine.get_metrics())
        await manager.broadcast("services_update", demo_engine.get_services())

        # 3. Create incident with full deterministic metadata and trigger recovery
        return await self._raise_incident(
            service=scenario_data["service"],
            failure_type=scenario_data["type"],
            severity="critical",
            action=scenario_data["action"],
            details=scenario_data["details"],
            is_simulation=True
        )

detection_engine = DetectionEngine()
