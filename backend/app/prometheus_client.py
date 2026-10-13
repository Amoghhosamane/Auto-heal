import httpx
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("autoheal.prometheus")

class PrometheusClient:
    def __init__(self, url: Optional[str] = None):
        self.url = (url or settings.PROMETHEUS_URL or "").rstrip("/")
        self.timeout = settings.PROMETHEUS_TIMEOUT_SECONDS

    async def is_available(self) -> bool:
        if not self.url or settings.OPERATING_MODE == "demo":
            return False
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(f"{self.url}/-/healthy")
                return resp.status_code == 200
        except Exception:
            return False

    async def query(self, promql: str) -> Optional[Dict[str, Any]]:
        if not self.url:
            return None
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(
                    f"{self.url}/api/v1/query",
                    params={"query": promql}
                )
                if resp.status_code == 200:
                    return resp.json().get("data", {})
                logger.warning(f"Prometheus query error ({resp.status_code}): {resp.text}")
                return None
        except Exception as e:
            logger.warning(f"Prometheus query request failed: {e}")
            return None

    async def get_cluster_metrics(self) -> Dict[str, Any]:
        """Queries CPU, memory, 5xx rate, and p99 latency from Prometheus."""
        results = {
            "cpu_utilization_pct": 0.0,
            "memory_utilization_pct": 0.0,
            "error_rate_pct": 0.0,
            "p99_latency_ms": 0.0
        }
        
        cpu_data = await self.query('100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[2m])) * 100)')
        if cpu_data and cpu_data.get("result"):
            try:
                results["cpu_utilization_pct"] = round(float(cpu_data["result"][0]["value"][1]), 1)
            except Exception:
                pass

        mem_data = await self.query('(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100')
        if mem_data and mem_data.get("result"):
            try:
                results["memory_utilization_pct"] = round(float(mem_data["result"][0]["value"][1]), 1)
            except Exception:
                pass

        return results

prometheus_client = PrometheusClient()
