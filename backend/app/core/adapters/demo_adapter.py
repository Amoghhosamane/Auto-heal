from typing import List, Dict, Any, Optional
from app.core.interfaces import MetricsProvider, ClusterProvider, RecoveryExecutor, TelemetrySnapshot, ServiceInfo, ActionResult
from app.demo_engine import demo_engine
import logging

logger = logging.getLogger("autoheal.adapters.demo")

class DemoMetricsProvider(MetricsProvider):
    async def is_available(self) -> bool:
        return True

    async def get_metrics(self) -> TelemetrySnapshot:
        m = demo_engine.get_metrics()
        return TelemetrySnapshot(
            cpu_utilization_pct=m["cpu_utilization_pct"],
            memory_utilization_pct=m["memory_utilization_pct"],
            p99_latency_ms=m["p99_latency_ms"],
            error_rate_pct=m["error_rate_pct"],
            raw_metrics=m.get("metrics", [])
        )

class DemoClusterProvider(ClusterProvider):
    def get_provider_name(self) -> str:
        return "demo"

    async def validate_connection(self) -> Dict[str, Any]:
        return {
            "connected": True,
            "provider": "demo",
            "cluster": "synthetic-local-cluster",
            "status": "ready",
            "message": "Demo mode active - operating safely without live cloud infrastructure."
        }

    async def list_services(self, namespace: Optional[str] = None) -> List[ServiceInfo]:
        services = demo_engine.get_services()
        return [
            ServiceInfo(
                name=s["name"],
                namespace=s["namespace"],
                replicas=s["replicas"],
                cpu_usage=s["cpuUsage"],
                mem_usage=s["memUsage"],
                status=s["status"],
                last_healed=s["lastHealed"]
            )
            for s in services
        ]

class DemoRecoveryExecutor(RecoveryExecutor):
    def is_action_permitted(self, action_type: str, namespace: str) -> bool:
        return True

    async def restart_workload(self, namespace: str, workload_name: str) -> ActionResult:
        logger.info(f"[Demo Mode] Synthetic restart/replace for workload: {workload_name} in {namespace}")
        demo_engine.clear_failure(workload_name)
        return ActionResult(
            success=True,
            command=f"autoheal-actuator dispatch --workload={workload_name} --action='Restart & Replace Pod'",
            action_type="Restart & Replace Pod",
            verification_passed=True,
            metadata={"mode": "demo", "namespace": namespace}
        )

    async def scale_workload(self, namespace: str, workload_name: str, target_replicas: int) -> ActionResult:
        logger.info(f"[Demo Mode] Synthetic scaling for workload: {workload_name} to {target_replicas} replicas")
        demo_engine.clear_failure(workload_name)
        return ActionResult(
            success=True,
            command=f"autoheal-actuator dispatch --workload={workload_name} --action='Scale Replicas (4 → {target_replicas})'",
            action_type=f"Scale Replicas (4 → {target_replicas})",
            verification_passed=True,
            metadata={"mode": "demo", "target_replicas": target_replicas}
        )

    async def rollback_workload(self, namespace: str, workload_name: str) -> ActionResult:
        logger.info(f"[Demo Mode] Synthetic rollback for workload: {workload_name} in {namespace}")
        demo_engine.clear_failure(workload_name)
        return ActionResult(
            success=True,
            command=f"autoheal-actuator dispatch --workload={workload_name} --action='Rollback Deployment'",
            action_type="Rollback Deployment (v2.4.1 → v2.4.0)",
            verification_passed=True,
            metadata={"mode": "demo", "revision": "v2.4.0"}
        )
