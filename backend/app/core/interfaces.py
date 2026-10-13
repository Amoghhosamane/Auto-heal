from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class TelemetrySnapshot(BaseModel):
    cpu_utilization_pct: float
    memory_utilization_pct: float
    p99_latency_ms: float
    error_rate_pct: float
    raw_metrics: List[Dict[str, Any]] = []

class ServiceInfo(BaseModel):
    name: str
    namespace: str
    replicas: str
    cpu_usage: str
    mem_usage: str
    status: str  # healthy, degraded, healing
    last_healed: str

class ActionResult(BaseModel):
    success: bool
    command: str
    action_type: str
    verification_passed: bool
    error: Optional[str] = None
    metadata: Dict[str, Any] = {}

class MetricsProvider(ABC):
    """Abstract interface for metrics ingestion (Demo, Prometheus, CloudWatch, Azure Monitor, GCP Cloud Monitoring)."""

    @abstractmethod
    async def is_available(self) -> bool:
        """Check if metrics provider is reachable."""
        pass

    @abstractmethod
    async def get_metrics(self) -> TelemetrySnapshot:
        """Collect current system golden signals and utilization metrics."""
        pass

class ClusterProvider(ABC):
    """Abstract interface for cluster management (Demo, Standard K8s, AWS EKS, GCP GKE, Azure AKS)."""

    @abstractmethod
    def get_provider_name(self) -> str:
        """Return provider identifier (e.g. 'demo', 'kubernetes', 'aws-eks', 'gcp-gke', 'azure-aks')."""
        pass

    @abstractmethod
    async def validate_connection(self) -> Dict[str, Any]:
        """Validate credentials, cluster connectivity, and RBAC permissions."""
        pass

    @abstractmethod
    async def list_services(self, namespace: Optional[str] = None) -> List[ServiceInfo]:
        """List services and workloads in the target cluster namespace."""
        pass

class RecoveryExecutor(ABC):
    """Abstract interface for executing remediation actions."""

    @abstractmethod
    def is_action_permitted(self, action_type: str, namespace: str) -> bool:
        """Validate whether action is in authorized policy allowlist."""
        pass

    @abstractmethod
    async def restart_workload(self, namespace: str, workload_name: str) -> ActionResult:
        """Restart or replace failed workload."""
        pass

    @abstractmethod
    async def scale_workload(self, namespace: str, workload_name: str, target_replicas: int) -> ActionResult:
        """Scale workload replicas."""
        pass

    @abstractmethod
    async def rollback_workload(self, namespace: str, workload_name: str) -> ActionResult:
        """Rollback workload to previous stable revision."""
        pass
