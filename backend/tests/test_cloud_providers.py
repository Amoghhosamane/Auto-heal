import pytest
from app.core.interfaces import MetricsProvider, ClusterProvider, RecoveryExecutor, TelemetrySnapshot, ServiceInfo, ActionResult
from app.core.adapters.demo_adapter import DemoMetricsProvider, DemoClusterProvider, DemoRecoveryExecutor
from app.core.adapters.kubernetes_adapter import KubernetesClusterProvider, KubernetesRecoveryExecutor
from app.core.factory import ProviderFactory
from app.config import settings

@pytest.mark.asyncio
async def test_demo_adapters_adhere_to_interfaces():
    """Ensure Demo adapters conform to cloud-agnostic interfaces without modifying real infrastructure."""
    metrics_p = DemoMetricsProvider()
    assert isinstance(metrics_p, MetricsProvider)
    assert await metrics_p.is_available() is True
    snap = await metrics_p.get_metrics()
    assert isinstance(snap, TelemetrySnapshot)
    assert snap.cpu_utilization_pct > 0

    cluster_p = DemoClusterProvider()
    assert isinstance(cluster_p, ClusterProvider)
    assert cluster_p.get_provider_name() == "demo"
    val = await cluster_p.validate_connection()
    assert val["connected"] is True
    svcs = await cluster_p.list_services()
    assert len(svcs) >= 6

    executor = DemoRecoveryExecutor()
    assert isinstance(executor, RecoveryExecutor)
    res = await executor.restart_workload("default", "test-svc")
    assert isinstance(res, ActionResult)
    assert res.success is True

@pytest.mark.asyncio
async def test_kubernetes_cloud_flavors():
    """Verify that Kubernetes adapter supports AWS EKS, GCP GKE, Azure AKS, and vanilla Kubernetes flavors."""
    for flavor in ["aws-eks", "gcp-gke", "azure-aks", "kubernetes"]:
        provider = KubernetesClusterProvider(provider_flavor=flavor)
        assert provider.get_provider_name() == flavor
        status = await provider.validate_connection()
        assert status["provider"] == flavor
        assert "allowed_namespaces" in status

@pytest.mark.asyncio
async def test_recovery_executor_least_privilege_enforcement():
    """Verify that RecoveryExecutor enforces namespace allowlists and action permissions."""
    executor = KubernetesRecoveryExecutor()
    
    # Should reject when LIVE_RECOVERY_ENABLED is False (default least-privilege)
    res = await executor.restart_workload("default", "test-pod")
    assert res.success is False
    assert "not authorized" in res.error.lower()

    # Should reject unauthorized namespace
    assert executor.is_action_permitted("Restart & Replace Pod", "forbidden-namespace") is False

    # Should reject arbitrary / unauthorized action
    assert executor.is_action_permitted("DeleteEntireDatabase", "default") is False

@pytest.mark.asyncio
async def test_provider_factory_resolution():
    """Verify ProviderFactory resolves the correct adapters according to configuration."""
    # Demo mode resolution
    settings.OPERATING_MODE = "demo"
    assert isinstance(ProviderFactory.get_metrics_provider(), DemoMetricsProvider)
    assert isinstance(ProviderFactory.get_cluster_provider(), DemoClusterProvider)
    assert isinstance(ProviderFactory.get_recovery_executor(), DemoRecoveryExecutor)

    # Cloud provider resolution
    settings.OPERATING_MODE = "live"
    settings.CLOUD_PROVIDER = "aws"
    cluster_p = ProviderFactory.get_cluster_provider()
    assert cluster_p.get_provider_name() == "aws-eks"

    settings.CLOUD_PROVIDER = "gcp"
    cluster_p = ProviderFactory.get_cluster_provider()
    assert cluster_p.get_provider_name() == "gcp-gke"

    settings.CLOUD_PROVIDER = "azure"
    cluster_p = ProviderFactory.get_cluster_provider()
    assert cluster_p.get_provider_name() == "azure-aks"

    # Reset back to demo for test cleanliness
    settings.OPERATING_MODE = "demo"
    settings.CLOUD_PROVIDER = "demo"
