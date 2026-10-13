from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    APP_NAME: str = "AutoHeal Cloud API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Mode: "demo" (default) or "live"
    OPERATING_MODE: str = "demo"
    
    # Cloud-agnostic configuration
    # Options: "demo", "kubernetes", "aws", "gcp", "azure"
    CLOUD_PROVIDER: str = "demo"
    CLUSTER_NAME: str = "autoheal-cluster"
    METRICS_PROVIDER_TYPE: str = "prometheus"  # "prometheus" or "demo"
    
    # Action allowlists & permitted actions
    PERMITTED_RECOVERY_ACTIONS: List[str] = [
        "Restart & Replace Pod",
        "Scale Replicas",
        "Scale Replicas (4 → 10)",
        "Rollback Deployment",
        "Rollback Deployment (v2.4.1 → v2.4.0)",
        "Reroute Traffic",
        "Circuit Breaker & Admin Alert"
    ]
    
    # API security & CORS
    API_PREFIX: str = "/api"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://auto-heal-one.vercel.app",
        "https://autoheal-one.vercel.app",
        "*"
    ]
    
    # Database URL
    DATABASE_URL: str = "sqlite+aiosqlite:///./autoheal.db"
    
    # Prometheus integration (used in live mode)
    PROMETHEUS_URL: Optional[str] = "http://prometheus-k8s.monitoring.svc.cluster.local:9090"
    PROMETHEUS_TIMEOUT_SECONDS: float = 3.0
    
    # Kubernetes integration (AWS EKS, GCP GKE, Azure AKS, Vanilla)
    KUBE_CONFIG_PATH: Optional[str] = None
    KUBE_TARGET_NAMESPACE: str = "default"
    KUBE_ALLOWED_NAMESPACES: List[str] = ["default", "prod-fintech", "prod-core", "prod-commerce", "prod-data"]
    
    # Recovery security constraints
    LIVE_RECOVERY_ENABLED: bool = False  # Explicit opt-in required
    ACTION_COOLDOWN_SECONDS: int = 15
    MAX_RECOVERY_ATTEMPTS_PER_INCIDENT: int = 3
    
    # Demo loop interval in seconds
    DEMO_TICK_INTERVAL_SECONDS: float = 2.0

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
