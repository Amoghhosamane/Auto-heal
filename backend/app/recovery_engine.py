import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy import select
from app.database import async_session
from app.models import IncidentModel, RecoveryActionModel
from app.config import settings
from app.websocket_manager import manager
from app.kubernetes_client import k8s_client
from app.demo_engine import demo_engine
from app.core.factory import ProviderFactory

logger = logging.getLogger("autoheal.recovery")

class RecoveryEngine:
    def __init__(self):
        self._last_recovery_time: Dict[str, float] = {}

    def get_policy_action(self, failure_type: str) -> str:
        f = failure_type.lower()
        if "oom" in f or "crash" in f:
            return "Restart & Replace Pod"
        elif "cpu" in f or "load" in f:
            return "Scale Replicas (4 → 10)"
        elif "memory" in f or "saturation" in f:
            return "Restart & Replace Pod"
        elif "bad deployment" in f or "regression" in f or "500" in f:
            return "Rollback Deployment (v2.4.1 → v2.4.0)"
        elif "partition" in f or "network" in f or "ingress" in f:
            return "Reroute Traffic (Zone B → Zone A)"
        else:
            return "Circuit Breaker & Admin Alert"

    async def execute_recovery(
        self,
        incident_id: str,
        force: bool = False,
        action_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """Validates policy, executes recovery, verifies health probe, and persists outcome."""
        async with async_session() as session:
            stmt = select(IncidentModel).where(IncidentModel.id == incident_id)
            res = await session.execute(stmt)
            incident = res.scalar_one_or_none()
            
            if not incident:
                return {
                    "success": False,
                    "error": f"Incident {incident_id} not found."
                }

            if incident.status == "recovered" and not force:
                return {
                    "success": True,
                    "already_recovered": True,
                    "message": f"Incident {incident_id} has already been verified and resolved."
                }

            # Anti-flapping cooldown check
            now_ts = datetime.now(timezone.utc).timestamp()
            last_ts = self._last_recovery_time.get(incident.service, 0)
            if (now_ts - last_ts < settings.ACTION_COOLDOWN_SECONDS) and not force:
                return {
                    "success": False,
                    "error": f"Cooldown active for service '{incident.service}'. Wait {int(settings.ACTION_COOLDOWN_SECONDS - (now_ts - last_ts))}s."
                }

            chosen_action = action_override or incident.action or self.get_policy_action(incident.type)

            # Record initiating recovery in timeline
            incident.status = "recovering"
            timeline = list(incident.timeline or [])
            timeline.append({
                "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S"),
                "stage": "decide",
                "message": f"Remediation policy authorized: {chosen_action}"
            })
            incident.timeline = timeline
            await session.commit()

            # Broadcast status update
            await manager.broadcast("incident_update", {
                "id": incident.id,
                "status": "recovering",
                "service": incident.service,
                "action": chosen_action
            })

            # Execute action using the cloud-agnostic RecoveryExecutor
            executor = ProviderFactory.get_recovery_executor()
            action_result = None

            if "Restart" in chosen_action or "Replace" in chosen_action:
                action_result = await executor.restart_workload(settings.KUBE_TARGET_NAMESPACE, incident.service)
            elif "Scale" in chosen_action:
                action_result = await executor.scale_workload(settings.KUBE_TARGET_NAMESPACE, incident.service, target_replicas=10)
            elif "Rollback" in chosen_action:
                action_result = await executor.rollback_workload(settings.KUBE_TARGET_NAMESPACE, incident.service)
            else:
                # Fallback / quarantine action
                action_result = await executor.restart_workload(settings.KUBE_TARGET_NAMESPACE, incident.service)

            command_str = action_result.command
            execution_success = action_result.success
            verification_passed = action_result.verification_passed
            
            # Clear synthetic failure condition in Demo Mode
            if settings.OPERATING_MODE == "demo":
                demo_engine.clear_failure(incident.service)
            
            # Update incident in DB
            self._last_recovery_time[incident.service] = datetime.now(timezone.utc).timestamp()
            final_status = "recovered" if verification_passed else "escalated"
            
            new_timeline = list(incident.timeline or [])
            new_timeline.append({
                "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S"),
                "stage": "recover",
                "message": f"Actuator executed: {command_str}"
            })
            new_timeline.append({
                "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S"),
                "stage": "verify",
                "message": "Healthcheck 200 OK. Zero 502 errors observed." if verification_passed else "Probe failed. Escalating to SRE."
            })
            
            incident.status = final_status
            incident.timeline = new_timeline
            
            # Persist recovery action record
            rec_action = RecoveryActionModel(
                incident_id=incident.id,
                service=incident.service,
                action_type=chosen_action,
                command_executed=command_str,
                status="success" if verification_passed else "failed",
                verification_passed=verification_passed,
                completed_at=datetime.now(timezone.utc),
                is_simulation=incident.is_simulation
            )
            session.add(rec_action)
            await session.commit()

            # Broadcast final event to WebSockets
            await manager.broadcast("incident_update", {
                "id": incident.id,
                "status": final_status,
                "service": incident.service,
                "duration": incident.duration,
                "verification_passed": verification_passed
            })

            # Broadcast updated services and metrics to reflect recovered state
            await manager.broadcast("services_update", demo_engine.get_services())
            await manager.broadcast("metrics_tick", demo_engine.get_metrics())

            return {
                "success": verification_passed,
                "status": final_status,
                "action": chosen_action,
                "command": command_str,
                "verification_passed": verification_passed,
                "incident_id": incident.id
            }

recovery_engine = RecoveryEngine()
