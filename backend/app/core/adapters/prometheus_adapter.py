from app.core.interfaces import MetricsProvider, TelemetrySnapshot
from app.prometheus_client import prometheus_client
from app.demo_engine import demo_engine
import logging

logger = logging.getLogger("autoheal.adapters.prometheus")

class PrometheusMetricsProvider(MetricsProvider):
    async def is_available(self) -> bool:
        return await prometheus_client.is_available()

    async def get_metrics(self) -> TelemetrySnapshot:
        prom_metrics = await prometheus_client.get_cluster_metrics()
        demo_defaults = demo_engine.get_metrics()
        return TelemetrySnapshot(
            cpu_utilization_pct=prom_metrics.get("cpu_utilization_pct", demo_defaults["cpu_utilization_pct"]),
            memory_utilization_pct=prom_metrics.get("memory_utilization_pct", demo_defaults["memory_utilization_pct"]),
            p99_latency_ms=prom_metrics.get("p99_latency_ms", demo_defaults["p99_latency_ms"]),
            error_rate_pct=prom_metrics.get("error_rate_pct", demo_defaults["error_rate_pct"]),
            raw_metrics=demo_defaults.get("metrics", [])
        )
