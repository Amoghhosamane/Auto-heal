import logging
from app.config import settings
from app.core.interfaces import MetricsProvider, ClusterProvider, RecoveryExecutor
from app.core.adapters.demo_adapter import DemoMetricsProvider, DemoClusterProvider, DemoRecoveryExecutor
from app.core.adapters.kubernetes_adapter import KubernetesClusterProvider, KubernetesRecoveryExecutor
from app.core.adapters.prometheus_adapter import PrometheusMetricsProvider

logger = logging.getLogger("autoheal.factory")

class ProviderFactory:
    """Instantiates provider adapters based on cloud and operating configuration."""

    @staticmethod
    def get_metrics_provider() -> MetricsProvider:
        if settings.OPERATING_MODE == "demo":
            return DemoMetricsProvider()
        
        # In live mode, select metric collector
        if settings.METRICS_PROVIDER_TYPE == "prometheus":
            return PrometheusMetricsProvider()
        return DemoMetricsProvider()

    @staticmethod
    def get_cluster_provider() -> ClusterProvider:
        if settings.OPERATING_MODE == "demo":
            return DemoClusterProvider()

        # Cloud-agnostic Kubernetes provider (EKS, GKE, AKS, Vanilla)
        cloud = settings.CLOUD_PROVIDER.lower()
        if cloud in ["kubernetes", "aws", "gcp", "azure", "eks", "gke", "aks"]:
            flavor = "aws-eks" if cloud in ["aws", "eks"] else \
                     "gcp-gke" if cloud in ["gcp", "gke"] else \
                     "azure-aks" if cloud in ["azure", "aks"] else "kubernetes"
            return KubernetesClusterProvider(provider_flavor=flavor)
        
        return DemoClusterProvider()

    @staticmethod
    def get_recovery_executor() -> RecoveryExecutor:
        if settings.OPERATING_MODE == "demo":
            return DemoRecoveryExecutor()

        cluster_provider = ProviderFactory.get_cluster_provider()
        return KubernetesRecoveryExecutor(cluster_provider=cluster_provider)
