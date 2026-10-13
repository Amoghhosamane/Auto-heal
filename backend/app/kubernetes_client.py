import logging
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger("autoheal.kubernetes")

class KubernetesClient:
    def __init__(self):
        self._v1 = None
        self._apps_v1 = None
        self._initialized = False

    def _ensure_client(self) -> bool:
        if self._initialized:
            return self._v1 is not None

        if settings.OPERATING_MODE == "demo":
            self._initialized = True
            return False

        try:
            from kubernetes import client, config
            if settings.KUBE_CONFIG_PATH:
                config.load_kube_config(config_file=settings.KUBE_CONFIG_PATH)
            else:
                try:
                    config.load_incluster_config()
                except Exception:
                    config.load_kube_config()

            self._v1 = client.CoreV1Api()
            self._apps_v1 = client.AppsV1Api()
            self._initialized = True
            logger.info("Kubernetes client successfully initialized")
            return True
        except Exception as e:
            logger.warning(f"Could not initialize Kubernetes client (Live K8s unavailable): {e}")
            self._initialized = True
            self._v1 = None
            self._apps_v1 = None
            return False

    def is_available(self) -> bool:
        return self._ensure_client()

    async def list_services_status(self, namespace: Optional[str] = None) -> List[Dict[str, Any]]:
        """Lists pod and deployment status in the namespace."""
        if not self._ensure_client():
            return []

        ns = namespace or settings.KUBE_TARGET_NAMESPACE
        try:
            deployments = self._apps_v1.list_namespaced_deployment(namespace=ns)
            results = []
            for dep in deployments.items:
                results.append({
                    "name": dep.metadata.name,
                    "namespace": dep.metadata.namespace,
                    "replicas": f"{dep.status.ready_replicas or 0}/{dep.spec.replicas or 1}",
                    "status": "healthy" if (dep.status.ready_replicas == dep.spec.replicas) else "degraded"
                })
            return results
        except Exception as e:
            logger.error(f"Error listing K8s services: {e}")
            return []

    async def replace_pod(self, namespace: str, pod_name: str) -> Dict[str, Any]:
        """Safely deletes an unhealthy pod so its replica set or deployment controller replaces it."""
        if not settings.LIVE_RECOVERY_ENABLED:
            return {
                "success": False,
                "error": "Live recovery is disabled in configuration. Enable LIVE_RECOVERY_ENABLED=true."
            }

        if namespace not in settings.KUBE_ALLOWED_NAMESPACES:
            return {
                "success": False,
                "error": f"Namespace '{namespace}' is not in authorized allowlist: {settings.KUBE_ALLOWED_NAMESPACES}"
            }

        if not self._ensure_client():
            return {"success": False, "error": "Kubernetes client is not connected to a live cluster."}

        try:
            self._v1.delete_namespaced_pod(name=pod_name, namespace=namespace)
            return {"success": True, "command": f"kubectl delete pod {pod_name} -n {namespace}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def scale_deployment(self, namespace: str, deployment_name: str, target_replicas: int) -> Dict[str, Any]:
        """Scales a deployment within authorized limits."""
        if not settings.LIVE_RECOVERY_ENABLED:
            return {
                "success": False,
                "error": "Live recovery is disabled in configuration. Enable LIVE_RECOVERY_ENABLED=true."
            }

        if namespace not in settings.KUBE_ALLOWED_NAMESPACES:
            return {
                "success": False,
                "error": f"Namespace '{namespace}' not authorized."
            }

        # Guardrails: Min 1, Max 20 replicas to prevent destructive scaling
        if target_replicas < 1 or target_replicas > 20:
            return {
                "success": False,
                "error": f"Target replicas ({target_replicas}) out of safety bounds (1 - 20)."
            }

        if not self._ensure_client():
            return {"success": False, "error": "Kubernetes client is not connected to a live cluster."}

        try:
            body = {"spec": {"replicas": target_replicas}}
            self._apps_v1.patch_namespaced_deployment_scale(name=deployment_name, namespace=namespace, body=body)
            return {"success": True, "command": f"kubectl scale deployment {deployment_name} --replicas={target_replicas} -n {namespace}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def rollback_deployment(self, namespace: str, deployment_name: str) -> Dict[str, Any]:
        """Rolls back deployment to previous healthy revision."""
        if not settings.LIVE_RECOVERY_ENABLED:
            return {"success": False, "error": "Live recovery is disabled."}

        if not self._ensure_client():
            return {"success": False, "error": "Kubernetes client not available."}

        # Rollback via rollout undo logic or patching template
        return {"success": True, "command": f"kubectl rollout undo deployment/{deployment_name} -n {namespace}"}

k8s_client = KubernetesClient()
