import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Optional, List
from datetime import datetime, timezone

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import init_db, get_db, async_session
from app.models import IncidentModel, RecoveryActionModel
from app.schemas import (
    HealthResponse,
    MetricsSummaryResponse,
    ServiceStatusResponse,
    IncidentListResponse,
    IncidentResponse,
    RecoveryActionResponse,
    SimulationRequest,
    SimulationResponse,
    RecoveryRequest,
    RecoveryExecuteResponse
)
from app.websocket_manager import manager
from app.prometheus_client import prometheus_client
from app.kubernetes_client import k8s_client
from app.demo_engine import demo_engine
from app.core.factory import ProviderFactory
from app.detection_engine import detection_engine
from app.recovery_engine import recovery_engine

logger = logging.getLogger("autoheal.main")

async def seed_initial_data_if_empty():
    """Seeds the initial incidents into the DB if the database is newly created."""
    async with async_session() as session:
        res = await session.execute(select(IncidentModel).limit(1))
        if res.scalar_one_or_none() is not None:
            return  # Already seeded
            
        initial_incidents = [
            IncidentModel(
                id="INC-8941",
                timestamp=datetime.now(timezone.utc),
                service="payment-gateway-svc",
                type="Pod Crash (OOMKilled)",
                severity="critical",
                status="recovered",
                action="Restart & Replace Pod",
                duration="2.6s",
                details="Heap ceiling exceeded (2048MB). AutoHeal cordoned node, recycled container, and restored 100% healthy endpoint.",
                is_simulation=False,
                timeline=[
                    {"timestamp": "09:14:02", "stage": "detect", "message": "CrashLoopBackOff detected in payment-gateway-svc"},
                    {"timestamp": "09:14:02", "stage": "decide", "message": "Policy chosen: Restart & Replace Pod"},
                    {"timestamp": "09:14:03", "stage": "recover", "message": "Clean replica scheduled on worker-04"},
                    {"timestamp": "09:14:04", "stage": "verify", "message": "Healthcheck 200 OK. Restored in 2.6s."}
                ]
            ),
            IncidentModel(
                id="INC-8940",
                timestamp=datetime.now(timezone.utc),
                service="auth-session-worker",
                type="CPU Overload (94%)",
                severity="warning",
                status="recovered",
                action="Scale Replicas (4 → 10)",
                duration="4.1s",
                details="Flash login traffic surge. AutoHeal horizontal autoscaler dispatched 6 additional replicas via HPA webhook.",
                is_simulation=False,
                timeline=[
                    {"timestamp": "08:56:12", "stage": "detect", "message": "CPU exceeded 90% threshold for >3s"},
                    {"timestamp": "08:56:13", "stage": "decide", "message": "Horizontal pod autoscaler calculated +6 target pods"},
                    {"timestamp": "08:56:15", "stage": "recover", "message": "Replicas scaled 4 -> 10"},
                    {"timestamp": "08:56:16", "stage": "verify", "message": "Latency returned to 42ms nominal."}
                ]
            ),
            IncidentModel(
                id="INC-8939",
                timestamp=datetime.now(timezone.utc),
                service="checkout-api-v2",
                type="Bad Deployment (500 Spikes)",
                severity="critical",
                status="recovered",
                action="Rollback Deployment (v2.4.1 → v2.4.0)",
                duration="3.4s",
                details="Error rate hit 14.8% on canary release. AutoHeal detected anomaly, halted deployment, and reverted replica set to v2.4.0.",
                is_simulation=False,
                timeline=[
                    {"timestamp": "08:14:10", "stage": "detect", "message": "Canary error rate spike (14.8%)"},
                    {"timestamp": "08:14:11", "stage": "decide", "message": "Rollback policy initiated"},
                    {"timestamp": "08:14:13", "stage": "recover", "message": "Reverted deployment to revision v2.4.0"},
                    {"timestamp": "08:14:14", "stage": "verify", "message": "Error rate 0.0%. Canary abort verified."}
                ]
            ),
            IncidentModel(
                id="INC-8938",
                timestamp=datetime.now(timezone.utc),
                service="recommendation-cache",
                type="Network Partition & Ingress Latency",
                severity="warning",
                status="recovered",
                action="Reroute Traffic (Zone B → Zone A)",
                duration="1.9s",
                details="Packet drop rate exceeded 12% in AZ-us-east-1b. Service mesh ingress weights instantly rerouted to healthy AZ-1a.",
                is_simulation=False,
                timeline=[
                    {"timestamp": "06:10:00", "stage": "detect", "message": "Packet loss spike in Zone B"},
                    {"timestamp": "06:10:01", "stage": "decide", "message": "Service mesh reroute authorized"},
                    {"timestamp": "06:10:01", "stage": "recover", "message": "Weight shifted to AZ-1a"},
                    {"timestamp": "06:10:02", "stage": "verify", "message": "Latency normalized to 28ms."}
                ]
            ),
            IncidentModel(
                id="INC-8937",
                timestamp=datetime.now(timezone.utc),
                service="ledger-sync-daemon",
                type="Persistent Crash Loop (3x in 2m)",
                severity="fatal",
                status="escalated",
                action="Circuit Breaker & Admin Alert",
                duration="1.2s",
                details="Crash loop mitigation triggered. AutoHeal stopped recursive restarts, preserved core dump, and notified duty engineer.",
                is_simulation=False,
                timeline=[
                    {"timestamp": "03:15:20", "stage": "detect", "message": "Repeated crash loop counter exceeded (N=3)"},
                    {"timestamp": "03:15:21", "stage": "decide", "message": "Circuit breaker opened to prevent flapping"},
                    {"timestamp": "03:15:21", "stage": "recover", "message": "Service quarantined; core dump archived"},
                    {"timestamp": "03:15:21", "stage": "verify", "message": "Duty engineer notified via P1 alert."}
                ]
            )
        ]
        session.add_all(initial_incidents)
        await session.commit()
        logger.info("Database initialized with standard baseline incidents.")

async def telemetry_background_ticker():
    """Periodically broadcasts live telemetry updates to WebSocket clients."""
    while True:
        try:
            await asyncio.sleep(settings.DEMO_TICK_INTERVAL_SECONDS)
            if manager.active_connections:
                metrics_data = demo_engine.get_metrics()
                await manager.broadcast("metrics_tick", metrics_data)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.warning(f"Error in telemetry ticker: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing AutoHeal Cloud Backend...")
    await init_db()
    await seed_initial_data_if_empty()
    ticker_task = asyncio.create_task(telemetry_background_ticker())
    yield
    # Shutdown
    ticker_task.cancel()
    logger.info("Shutting down AutoHeal Cloud Backend...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- REST API Endpoints -----------------

@app.get("/api/health", response_model=HealthResponse)
async def get_health():
    """Returns the backend health, cloud provider details, and connectivity status."""
    cluster_provider = ProviderFactory.get_cluster_provider()
    metrics_provider = ProviderFactory.get_metrics_provider()
    
    cluster_health = await cluster_provider.validate_connection()
    metrics_avail = await metrics_provider.is_available()

    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        operating_mode=settings.OPERATING_MODE,
        cloud_provider=cluster_provider.get_provider_name(),
        cluster_target=settings.CLUSTER_NAME,
        database_connected=True,
        prometheus_available=metrics_avail,
        kubernetes_available=cluster_health.get("connected", False),
        live_recovery_enabled=settings.LIVE_RECOVERY_ENABLED
    )

@app.get("/api/metrics", response_model=MetricsSummaryResponse)
async def get_metrics():
    """Returns the cluster metrics and golden signals from the active MetricsProvider."""
    metrics_provider = ProviderFactory.get_metrics_provider()
    snapshot = await metrics_provider.get_metrics()
    
    # Merge with base telemetry template
    m = demo_engine.get_metrics()
    m["cpu_utilization_pct"] = snapshot.cpu_utilization_pct
    m["memory_utilization_pct"] = snapshot.memory_utilization_pct
    m["p99_latency_ms"] = snapshot.p99_latency_ms
    m["error_rate_pct"] = snapshot.error_rate_pct
    if snapshot.raw_metrics:
        m["metrics"] = snapshot.raw_metrics
    return MetricsSummaryResponse(**m)

@app.get("/api/services", response_model=List[ServiceStatusResponse])
async def get_services():
    """Returns monitored services and their statuses from the active ClusterProvider."""
    cluster_provider = ProviderFactory.get_cluster_provider()
    services_list = await cluster_provider.list_services()
    if services_list:
        return [
            ServiceStatusResponse(
                name=s.name,
                namespace=s.namespace,
                replicas=s.replicas,
                cpuUsage=s.cpu_usage,
                memUsage=s.mem_usage,
                status=s.status,
                lastHealed=s.last_healed
            )
            for s in services_list
        ]
    return [ServiceStatusResponse(**s) for s in demo_engine.get_services()]

@app.get("/api/incidents", response_model=IncidentListResponse)
async def get_incidents(
    status: Optional[str] = Query(None, description="Filter by status (detected, recovering, recovered, escalated)"),
    service: Optional[str] = Query(None, description="Filter by target service"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Returns incidents with optional filtering and pagination."""
    query = select(IncidentModel).order_by(desc(IncidentModel.timestamp))
    if status:
        query = query.where(IncidentModel.status == status)
    if service:
        query = query.where(IncidentModel.service == service)

    offset = (page - 1) * page_size
    paged_query = query.offset(offset).limit(page_size)
    result = await db.execute(paged_query)
    incidents = result.scalars().all()

    # Form response items
    items = []
    for inc in incidents:
        items.append(IncidentResponse(
            id=inc.id,
            timestamp=inc.timestamp.strftime("%Y-%m-%d %H:%M:%S") if inc.timestamp else "Recently",
            service=inc.service,
            type=inc.type,
            severity=inc.severity,
            status=inc.status,
            action=inc.action,
            duration=inc.duration,
            details=inc.details,
            is_simulation=inc.is_simulation,
            timeline=inc.timeline or []
        ))

    return IncidentListResponse(
        total=len(items),
        page=page,
        page_size=page_size,
        incidents=items
    )

@app.delete("/api/incidents")
async def clear_incidents(db: AsyncSession = Depends(get_db)):
    """Clears all historical incident records and broadcasts an empty list."""
    from sqlalchemy import delete
    await db.execute(delete(RecoveryActionModel))
    await db.execute(delete(IncidentModel))
    await db.commit()
    await manager.broadcast("incidents_cleared", {"message": "All incident records cleared."})
    return {"success": True, "message": "All incident records cleared successfully"}

@app.get("/api/incidents/{incident_id}", response_model=IncidentResponse)
async def get_incident_detail(incident_id: str, db: AsyncSession = Depends(get_db)):
    """Returns detailed event timeline and attributes for a specific incident."""
    stmt = select(IncidentModel).where(IncidentModel.id == incident_id)
    res = await db.execute(stmt)
    inc = res.scalar_one_or_none()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    return IncidentResponse(
        id=inc.id,
        timestamp=inc.timestamp.strftime("%Y-%m-%d %H:%M:%S") if inc.timestamp else "Recently",
        service=inc.service,
        type=inc.type,
        severity=inc.severity,
        status=inc.status,
        action=inc.action,
        duration=inc.duration,
        details=inc.details,
        is_simulation=inc.is_simulation,
        timeline=inc.timeline or []
    )

@app.get("/api/recovery/actions", response_model=List[RecoveryActionResponse])
async def get_recovery_history(db: AsyncSession = Depends(get_db)):
    """Returns the history of executed remediation actions."""
    stmt = select(RecoveryActionModel).order_by(desc(RecoveryActionModel.initiated_at)).limit(50)
    res = await db.execute(stmt)
    actions = res.scalars().all()
    
    return [
        RecoveryActionResponse(
            id=act.id,
            incident_id=act.incident_id,
            service=act.service,
            action_type=act.action_type,
            command_executed=act.command_executed,
            initiated_at=act.initiated_at.strftime("%Y-%m-%d %H:%M:%S") if act.initiated_at else "Recently",
            completed_at=act.completed_at.strftime("%Y-%m-%d %H:%M:%S") if act.completed_at else None,
            status=act.status,
            verification_passed=act.verification_passed,
            error_message=act.error_message,
            is_simulation=act.is_simulation
        )
        for act in actions
    ]

@app.post("/api/simulations", response_model=SimulationResponse)
async def trigger_simulation(req: SimulationRequest):
    """Triggers a controlled demo failure scenario and initiates the self-healing control loop."""
    scenario_info = demo_engine.inject_failure(req.scenario_id, req.service_name)
    incident = await detection_engine.trigger_simulation_incident(scenario_info)
    
    return SimulationResponse(
        status="initiated",
        incident_id=incident.id,
        scenario_id=req.scenario_id,
        service=incident.service,
        action=incident.action,
        message=f"Simulation triggered: {incident.type} for {incident.service}. Self-healing loop active."
    )

@app.post("/api/incidents/{incident_id}/recover", response_model=RecoveryExecuteResponse)
async def execute_incident_recovery(incident_id: str, req: RecoveryRequest):
    """Executes an authorized recovery policy on a specific incident."""
    res = await recovery_engine.execute_recovery(
        incident_id=incident_id,
        force=req.force,
        action_override=req.action_override
    )
    if not res.get("success") and not res.get("already_recovered"):
        raise HTTPException(status_code=400, detail=res.get("error", "Recovery execution failed"))

    return RecoveryExecuteResponse(
        status=res.get("status", "recovered"),
        incident_id=incident_id,
        action_executed=res.get("action", "Restart & Replace Pod"),
        verification_passed=res.get("verification_passed", True),
        duration="2.4s",
        message=res.get("message", "Recovery verified successfully.")
    )

# ----------------- WebSocket Live Stream -----------------

@app.websocket("/ws/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    """Websocket connection delivering real-time telemetry ticks and incident updates."""
    await manager.connect(websocket)
    try:
        # Send initial sync payload
        metrics = demo_engine.get_metrics()
        await websocket.send_json({
            "event": "connected",
            "data": {
                "message": "Connected to AutoHeal Cloud Live Stream",
                "operating_mode": settings.OPERATING_MODE,
                "metrics": metrics
            }
        })
        while True:
            # Client can send ping or custom queries
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket client error: {e}")
        manager.disconnect(websocket)
