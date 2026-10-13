import random
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

logger = logging.getLogger("autoheal.demo")

class DemoState:
    def __init__(self):
        self.services: List[Dict[str, Any]] = [
            {"name": "payment-gateway-svc", "namespace": "prod-fintech", "replicas": "8/8", "cpuUsage": "28%", "memUsage": "62%", "status": "healthy", "lastHealed": "Just now"},
            {"name": "auth-session-worker", "namespace": "prod-core", "replicas": "10/10", "cpuUsage": "44%", "memUsage": "58%", "status": "healthy", "lastHealed": "18 min ago"},
            {"name": "checkout-api-v2", "namespace": "prod-commerce", "replicas": "12/12", "cpuUsage": "36%", "memUsage": "51%", "status": "healthy", "lastHealed": "1 hr ago"},
            {"name": "order-processing-queue", "namespace": "prod-commerce", "replicas": "16/16", "cpuUsage": "49%", "memUsage": "64%", "status": "healthy", "lastHealed": "2 days ago"},
            {"name": "inventory-data-sync", "namespace": "prod-data", "replicas": "6/6", "cpuUsage": "22%", "memUsage": "47%", "status": "healthy", "lastHealed": "Yesterday"},
            {"name": "notification-dispatcher", "namespace": "prod-core", "replicas": "4/4", "cpuUsage": "18%", "memUsage": "38%", "status": "healthy", "lastHealed": "4 days ago"},
        ]
        
        self.base_metrics = {
            "system_health": "99.98%",
            "active_services": 42,
            "healthy_pods": "184 / 186",
            "incidents_24h": 14,
            "recovery_rate": "100%",
            "mttd": "1.4s",
            "mttr": "3.8s",
            "downtime_prevented": "48.5 hrs",
            "cpu_utilization_pct": 34.2,
            "memory_utilization_pct": 56.8,
            "p99_latency_ms": 38.5,
            "error_rate_pct": 0.02
        }

        # Active failure simulation overrides
        self.active_failure: Optional[Dict[str, Any]] = None

    def get_services(self) -> List[Dict[str, Any]]:
        return self.services

    def inject_failure(self, scenario_id: str, service_name: str | None = None) -> Dict[str, Any]:
        """Injects deterministic synthetic failure conditions into Demo Mode telemetry."""
        info = self.get_scenario_definition(scenario_id, service_name)
        svc_name = info["service"]

        if scenario_id == "scenario-cpu-overload":
            self.active_failure = {
                "scenario_id": scenario_id,
                "service": svc_name,
                "cpu_utilization_pct": 94.5,
                "p99_latency_ms": 285.0,
                "error_rate_pct": 1.2
            }
            self._update_service_status(svc_name, status="degraded", cpuUsage="94%", memUsage="68%")
        elif scenario_id == "scenario-memory-saturation":
            self.active_failure = {
                "scenario_id": scenario_id,
                "service": svc_name,
                "memory_utilization_pct": 96.2,
                "p99_latency_ms": 195.0,
                "error_rate_pct": 0.8
            }
            self._update_service_status(svc_name, status="degraded", cpuUsage="42%", memUsage="96%")
        elif scenario_id == "scenario-pod-crash":
            self.active_failure = {
                "scenario_id": scenario_id,
                "service": svc_name,
                "crashed_pod": True,
                "error_rate_pct": 5.4,
                "p99_latency_ms": 310.0
            }
            self._update_service_status(svc_name, status="degraded", replicas="7/8 (CrashLoopBackOff)")
        elif scenario_id == "scenario-bad-deployment":
            self.active_failure = {
                "scenario_id": scenario_id,
                "service": svc_name,
                "error_rate_pct": 14.8,
                "p99_latency_ms": 420.0
            }
            self._update_service_status(svc_name, status="degraded")

        logger.info(f"Demo Mode: Injected synthetic failure '{scenario_id}' for service '{svc_name}'")
        return info

    def clear_failure(self, service_name: str | None = None):
        """Restores service and telemetry to normal nominal conditions after verified recovery."""
        if service_name:
            self._update_service_status(service_name, status="healthy", lastHealed="Just now")
            if service_name == "payment-gateway-svc":
                self._update_service_status(service_name, replicas="8/8", cpuUsage="28%", memUsage="62%")
            elif service_name == "auth-session-worker":
                self._update_service_status(service_name, replicas="10/10", cpuUsage="44%", memUsage="58%")
            elif service_name == "checkout-api-v2":
                self._update_service_status(service_name, replicas="12/12", cpuUsage="36%", memUsage="51%")
        self.active_failure = None
        logger.info(f"Demo Mode: Cleared failure overrides for service '{service_name}'")

    def _update_service_status(self, name: str, **kwargs):
        for s in self.services:
            if s["name"] == name:
                s.update(kwargs)
                break

    def get_metrics(self) -> Dict[str, Any]:
        # Base natural metrics with slight jitter
        cpu = round(32.0 + random.uniform(-3.0, 4.0), 1)
        mem = round(55.0 + random.uniform(-2.0, 3.0), 1)
        lat = round(36.0 + random.uniform(-2.0, 5.0), 1)
        err = 0.02
        system_health = "99.98%"
        healthy_pods = "184 / 186"

        # Apply synthetic failure overrides if a simulation is active
        if self.active_failure:
            if "cpu_utilization_pct" in self.active_failure:
                cpu = self.active_failure["cpu_utilization_pct"]
            if "memory_utilization_pct" in self.active_failure:
                mem = self.active_failure["memory_utilization_pct"]
            if "p99_latency_ms" in self.active_failure:
                lat = self.active_failure["p99_latency_ms"]
            if "error_rate_pct" in self.active_failure:
                err = self.active_failure["error_rate_pct"]
            if self.active_failure.get("crashed_pod"):
                healthy_pods = "183 / 186"
                system_health = "98.24%"
            elif err > 5.0:
                system_health = "97.50%"

        m = dict(self.base_metrics)
        m["cpu_utilization_pct"] = cpu
        m["memory_utilization_pct"] = mem
        m["p99_latency_ms"] = lat
        m["error_rate_pct"] = err
        m["system_health"] = system_health
        m["healthy_pods"] = healthy_pods
        m["metrics"] = [
            {"label": "System Health", "value": m["system_health"], "subtext": "Nominal across 4 clusters"},
            {"label": "Active Services", "value": str(m["active_services"]), "subtext": "All running within SLO"},
            {"label": "Healthy Pods", "value": m["healthy_pods"], "subtext": "2 scaling in progress"},
            {"label": "Incidents Detected", "value": str(m["incidents_24h"]), "subtext": "Last 24 hours"},
            {"label": "Recovery Actions", "value": "14 / 14", "subtext": "100% automated resolution"},
            {"label": "MTTD", "value": m["mttd"], "subtext": "Mean time to detect"},
            {"label": "MTTR", "value": m["mttr"], "subtext": "Mean time to recover"},
            {"label": "Downtime Prevented", "value": m["downtime_prevented"], "subtext": "Calculated vs manual SLA"}
        ]
        return m

    def get_scenario_definition(self, scenario_id: str, service_name: str | None = None) -> Dict[str, Any]:
        scenarios = {
            "scenario-pod-crash": {
                "title": "Pod Crash (CrashLoopBackOff)",
                "default_service": "payment-gateway-svc",
                "type": "Pod Crash Detected (OOMKilled)",
                "action": "Restart & Replace Pod",
                "duration": "2.4s",
                "details": "Simulated failure: Pod exited with code 137 (OOMKilled). Kubelet reported CrashLoopBackOff."
            },
            "scenario-cpu-overload": {
                "title": "High CPU Utilization",
                "default_service": "auth-session-worker",
                "type": "CPU Overload (94%)",
                "action": "Scale Replicas (4 → 10)",
                "duration": "4.1s",
                "details": "Flash traffic surge: Node CPU utilization breached 90% threshold for >3s."
            },
            "scenario-memory-saturation": {
                "title": "Memory Saturation",
                "default_service": "payment-gateway-svc",
                "type": "Memory Saturation (>90%)",
                "action": "Restart & Replace Pod",
                "duration": "2.6s",
                "details": "Container heap ceiling saturated at 96% of limit. Proactive recycle initiated before OOM kill."
            },
            "scenario-bad-deployment": {
                "title": "Bad Deployment (500 Spikes)",
                "default_service": "checkout-api-v2",
                "type": "Bad Deployment (500 Spikes)",
                "action": "Rollback Deployment (v2.4.1 → v2.4.0)",
                "duration": "3.4s",
                "details": "Canary release error rate spiked to 14.8%. Autonomous rollback dispatched to restore prior revision."
            }
        }
        
        info = scenarios.get(scenario_id, scenarios["scenario-pod-crash"])
        svc = service_name or info["default_service"]
        return {
            "scenario_id": scenario_id,
            "service": svc,
            "type": info["type"],
            "action": info["action"],
            "duration": info["duration"],
            "details": info["details"]
        }

demo_engine = DemoState()
