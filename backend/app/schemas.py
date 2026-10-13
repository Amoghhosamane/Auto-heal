from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class HealthResponse(BaseModel):
    status: str
    version: str
    operating_mode: str
    cloud_provider: str
    cluster_target: str
    database_connected: bool
    prometheus_available: bool
    kubernetes_available: bool
    live_recovery_enabled: bool

class TelemetryMetric(BaseModel):
    label: str
    value: str
    subtext: str
    change: Optional[str] = None

class MetricsSummaryResponse(BaseModel):
    system_health: str
    active_services: int
    healthy_pods: str
    incidents_24h: int
    recovery_rate: str
    mttd: str
    mttr: str
    downtime_prevented: str
    cpu_utilization_pct: float
    memory_utilization_pct: float
    p99_latency_ms: float
    error_rate_pct: float
    metrics: List[TelemetryMetric]

class ServiceStatusResponse(BaseModel):
    name: str
    namespace: str
    replicas: str
    cpuUsage: str
    memUsage: str
    status: str  # healthy, degraded, healing
    lastHealed: str

class TimelineEvent(BaseModel):
    timestamp: str
    stage: str  # detect, decide, recover, verify
    message: str

class IncidentResponse(BaseModel):
    id: str
    timestamp: str
    service: str
    type: str
    severity: str
    status: str  # detected, recovering, recovered, escalated
    action: str
    duration: str
    details: str
    is_simulation: bool
    timeline: List[TimelineEvent] = []

class IncidentListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    incidents: List[IncidentResponse]

class RecoveryActionResponse(BaseModel):
    id: int
    incident_id: str
    service: str
    action_type: str
    command_executed: str
    initiated_at: str
    completed_at: Optional[str] = None
    status: str  # executing, success, failed, rejected
    verification_passed: bool
    error_message: Optional[str] = None
    is_simulation: bool

class SimulationRequest(BaseModel):
    scenario_id: str = Field(..., description="ID of the failure scenario (e.g. scenario-pod-crash, scenario-cpu-overload)")
    service_name: Optional[str] = None

class SimulationResponse(BaseModel):
    status: str
    incident_id: str
    scenario_id: str
    service: str
    action: str
    message: str

class RecoveryRequest(BaseModel):
    force: bool = False
    action_override: Optional[str] = None

class RecoveryExecuteResponse(BaseModel):
    status: str
    incident_id: str
    action_executed: str
    verification_passed: bool
    duration: str
    message: str
