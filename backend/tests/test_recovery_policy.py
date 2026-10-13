import pytest
from app.recovery_engine import recovery_engine
from app.detection_engine import detection_engine

def test_recovery_policy_selection():
    assert recovery_engine.get_policy_action("Pod Crash (OOMKilled)") == "Restart & Replace Pod"
    assert "Scale Replicas" in recovery_engine.get_policy_action("CPU Overload (94%)")
    assert "Rollback Deployment" in recovery_engine.get_policy_action("Bad Deployment (500 Spikes)")
    assert "Reroute Traffic" in recovery_engine.get_policy_action("Network Partition")
    assert recovery_engine.get_policy_action("Unknown Panic") == "Circuit Breaker & Admin Alert"

@pytest.mark.asyncio
async def test_duplicate_incident_prevention():
    scenario = {
        "service": "test-dedup-svc",
        "type": "Pod Crash",
        "action": "Restart & Replace Pod",
        "details": "First crash"
    }
    inc1 = await detection_engine.trigger_simulation_incident(scenario)
    inc2 = await detection_engine.trigger_simulation_incident(scenario)
    assert inc1.id == inc2.id  # Deduplicated into existing incident
