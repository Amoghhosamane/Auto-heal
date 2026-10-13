import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app, seed_initial_data_if_empty
from app.database import init_db
from app.demo_engine import demo_engine

async def init_test_environment():
    await init_db()
    await seed_initial_data_if_empty()

@pytest.mark.asyncio
async def test_health_endpoint():
    await init_test_environment()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert data["operating_mode"] == "demo"
        assert data["database_connected"] is True

@pytest.mark.asyncio
async def test_metrics_endpoint():
    await init_test_environment()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/metrics")
        assert resp.status_code == 200
        data = resp.json()
        assert "cpu_utilization_pct" in data
        assert "memory_utilization_pct" in data
        assert "metrics" in data
        assert len(data["metrics"]) > 0

@pytest.mark.asyncio
async def test_services_endpoint():
    await init_test_environment()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/services")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 6

@pytest.mark.asyncio
async def test_incidents_crud_and_persistence():
    await init_test_environment()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/incidents")
        assert resp.status_code == 200
        data = resp.json()
        assert "incidents" in data
        assert len(data["incidents"]) > 0

        first_id = data["incidents"][0]["id"]
        detail_resp = await client.get(f"/api/incidents/{first_id}")
        assert detail_resp.status_code == 200
        assert detail_resp.json()["id"] == first_id

@pytest.mark.asyncio
@pytest.mark.parametrize("scenario_id,expected_action", [
    ("scenario-cpu-overload", "Scale Replicas (4 → 10)"),
    ("scenario-memory-saturation", "Restart & Replace Pod"),
    ("scenario-pod-crash", "Restart & Replace Pod"),
    ("scenario-bad-deployment", "Rollback Deployment (v2.4.1 → v2.4.0)"),
])
async def test_all_four_simulation_scenarios(scenario_id, expected_action):
    """Verifies that all 4 failure scenarios inject telemetry, detect, recover, verify, and persist."""
    await init_test_environment()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        sim_resp = await client.post("/api/simulations", json={"scenario_id": scenario_id})
        assert sim_resp.status_code == 200
        sim_data = sim_resp.json()
        assert sim_data["status"] == "initiated"
        assert sim_data["action"] == expected_action
        inc_id = sim_data["incident_id"]

        # Check recovery execution and health verification
        rec_resp = await client.post(f"/api/incidents/{inc_id}/recover", json={"force": True})
        assert rec_resp.status_code == 200
        rec_data = rec_resp.json()
        assert rec_data["verification_passed"] is True
        assert rec_data["status"] == "recovered"

        # Check incident detail persistence and timeline
        detail_resp = await client.get(f"/api/incidents/{inc_id}")
        assert detail_resp.status_code == 200
        detail_data = detail_resp.json()
        assert detail_data["status"] == "recovered"
        assert len(detail_data["timeline"]) >= 2
