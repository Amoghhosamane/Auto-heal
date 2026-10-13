import logging
from typing import List, Dict, Any, Optional
from app.core.interfaces import ClusterProvider, RecoveryExecutor, ServiceInfo, ActionResult
from app.config import settings
from app.kubernetes_client import k8s_client

logger = logging.getLogger("autoheal.adapters.kubernetes")

class KubernetesClusterProvider(ClusterProvider):
    """Universal Kubernetes provider compatible with EKS, GKE, AKS, and bare-metal."""

    def __init__(self, provider_flavor: str = "kubernetes"):
        self.provider_flavor = provider_flavor  # e.g. 'kubernetes', 'aws-eks', 'gcp-gke', 'azure-aks'

    def get_provider_name(self) -> str:
        return self.provider_flavor

    async def validate_connection(self) -> Dict[str, Any]:
        available = k8s_client.is_available()
        return {
            "connected": available,
            "provider": self.provider_flavor,
            "cluster_target": settings.CLUSTER_NAME or "kubernetes-cluster",
            "allowed_namespaces": settings.KUBE_ALLOWED_NAMESPACES,
            "live_recovery_enabled": settings.LIVE_RECOVERY_ENABLED,
            "status": "ready" if available else "disconnected"
        }

    async def list_services(self, namespace: Optional[str] = None) -> List[ServiceInfo]:
        ns = namespace or settings.KUBE_TARGET_NAMESPACE
        raw_services = await k8s_client.list_services_status(ns)
        return [
            ServiceInfo(
                name=s["name"],
                namespace=s["namespace"],
                replicas=s["replicas"],
                cpu_usage="32%",
                mem_usage="54%",
                status=s["status"],
                last_healed="Active"
            )
            for s in raw_services
        ]

class KubernetesRecoveryExecutor(RecoveryExecutor):
    """Least-privilege Kubernetes actuator with namespace allowlists and action guardrails."""

    def __init__(self, cluster_provider: Optional[ClusterProvider] = None):
        self.cluster_provider = cluster_provider or KubernetesClusterProvider()

    def is_action_permitted(self, action_type: str, namespace: str) -> bool:
        if not settings.LIVE_RECOVERY_ENABLED:
            logger.warning("Live recovery rejected: LIVE_RECOVERY_ENABLED=false")
            return False

        if namespace not in settings.KUBE_ALLOWED_NAMESPACES:
            logger.warning(f"Live recovery rejected: namespace '{namespace}' not in allowlist {settings.KUBE_ALLOWED_NAMESPACES}")
            return False

        if action_type not in settings.PERMITTED_RECOVERY_ACTIONS:
            logger.warning(f"Action '{action_type}' not in authorized permitted actions: {settings.PERMITTED_RECOVERY_ACTIONS}")
            return False

        return True

    async def restart_workload(self, namespace: str, workload_name: str) -> ActionResult:
        if not self.is_action_permitted("Restart & Replace Pod", namespace):
            return ActionResult(
                success=False,
                command="rejected",
                action_type="Restart & Replace Pod",
                verification_passed=False,
                error=f"Restart action not authorized for {workload_name} in namespace {namespace}"
            )

        res = await k8s_client.replace_pod(namespace, workload_name)
        success = res.get("success", False)
        return ActionResult(
            success=success,
            command=res.get("command", f"kubectl delete pod {workload_name} -n {namespace}"),
            action_type="Restart & Replace Pod",
            verification_passed=success,
            error=res.get("error")
        )

    async def scale_workload(self, namespace: str, workload_name: str, target_replicas: int) -> ActionResult:
        if not self.is_action_permitted("Scale Replicas", namespace):
            return ActionResult(
                success=False,
                command="rejected",
                action_type="Scale Replicas",
                verification_passed=False,
                error=f"Scale action not authorized for {workload_name} in namespace {namespace}"
            )

        res = await k8s_client.scale_deployment(namespace, workload_name, target_replicas)
        success = res.get("success", False)
        return ActionResult(
            success=success,
            command=res.get("command", f"kubectl scale deployment {workload_name} --replicas={target_replicas} -n {namespace}"),
            action_type="Scale Replicas",
            verification_passed=success,
            error=res.get("error")
        )

    async def rollback_workload(self, namespace: str, workload_name: str) -> ActionResult:
        if not self.is_action_permitted("Rollback Deployment", namespace):
            return ActionResult(
                success=False,
                command="rejected",
                action_type="Rollback Deployment",
                verification_passed=False,
                error=f"Rollback action not authorized for {workload_name} in namespace {namespace}"
            )

        res = await k8s_client.rollback_deployment(namespace, workload_name)
        success = res.get("success", False)
        return ActionResult(
            success=success,
            command=res.get("command", f"kubectl rollout undo deployment/{workload_name} -n {namespace}"),
            action_type="Rollback Deployment",
            verification_passed=success,
            error=res.get("error")
        )
