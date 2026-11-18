import pytest
from backend.app import create_app
from backend.app.database import db_manager

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def get_guest_token(client):
    res = client.post("/api/v1/auth/guest-login")
    assert res.status_code == 200
    token = res.get_json()["token"]
    assert token is not None
    return token

def test_predictions_engine(client):
    token = get_guest_token(client)
    res = client.get("/api/v1/predictions/habits", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "success"
    pred = data["prediction_data"]
    assert "overall_risk_level" in pred
    assert "habits" in pred
    assert "preventive_recommendations" in pred

def test_digital_twin_and_simulation(client):
    token = get_guest_token(client)
    
    # Baseline
    res = client.get("/api/v1/digital-twin", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    baseline = res.get_json()["digital_twin"]["baseline"]
    assert "stamina_index" in baseline
    assert "recovery_index" in baseline

    # Simulate What-if
    sim_res = client.post("/api/v1/digital-twin/simulate", 
        headers={"Authorization": f"Bearer {token}"},
        json={
            "extra_walk_minutes": 20,
            "target_sleep_hours": 8.0,
            "extra_water_ml": 500,
            "habit_consistency_target": 90,
            "projection_days": 30
        }
    )
    assert sim_res.status_code == 200
    sim_data = sim_res.get_json()["simulation"]
    assert sim_data["is_simulation"] is True
    assert "projected_metrics" in sim_data
    assert len(sim_data["timeline"]) == 30

def test_adaptive_goals(client):
    token = get_guest_token(client)
    res = client.get("/api/v1/goals/adaptive", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert "adaptive_recommendations" in data

    # Apply Action: Accept
    act_res = client.post("/api/v1/goals/adaptive/action",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "action": "accept",
            "habit_title": "Daily 15-min Stretch",
            "target_value": 15,
            "unit": "mins",
            "category": "exercise"
        }
    )
    assert act_res.status_code == 200
    assert act_res.get_json()["status"] == "success"

def test_healthy_impact_score_and_weights(client):
    token = get_guest_token(client)
    res = client.get("/api/v1/analytics/impact-score", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.get_json()["impact_score"]
    assert "score" in data
    assert "formula" in data
    assert "contributing_habits" in data

    # Update weights
    w_res = client.post("/api/v1/analytics/impact-score/weights",
        headers={"Authorization": f"Bearer {token}"},
        json={"weights": {"exercise": 30, "water": 30, "sleep": 20, "meditation": 20}}
    )
    assert w_res.status_code == 200

def test_mood_checkin_and_history(client):
    token = get_guest_token(client)
    res = client.post("/api/v1/mood/checkin",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "mood": "Energetic",
            "energy_level": 5,
            "notes": "Had a fantastic morning jog and mindful breakfast!"
        }
    )
    assert res.status_code == 201
    assert res.get_json()["status"] == "success"

    hist_res = client.get("/api/v1/mood/history", headers={"Authorization": f"Bearer {token}"})
    assert hist_res.status_code == 200
    assert hist_res.get_json()["total_checkins"] >= 1

def test_virtual_garden_and_rewards(client):
    token = get_guest_token(client)
    res = client.get("/api/v1/garden", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert "garden_level" in data
    assert "plants" in data
    assert len(data["plants"]) >= 3

    # Unlock reward
    claim_res = client.post("/api/v1/garden/rewards",
        headers={"Authorization": f"Bearer {token}"},
        json={"item_id": "wooden_bench"}
    )
    assert claim_res.status_code in [200, 400] # 200 first time, 400 if already owned

def test_wearable_import_and_deduplication(client):
    token = get_guest_token(client)
    res = client.get("/api/v1/integrations/status", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200

    # Import record
    import_res = client.post("/api/v1/integrations/import",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "source": "Apple Health",
            "records": [
                {"date": "2026-11-17", "type": "steps", "value": 8500, "unit": "steps"}
            ]
        }
    )
    assert import_res.status_code == 200
    assert import_res.get_json()["imported_count"] in [0, 1]

    # Duplicate import test (should skip duplicate)
    dup_res = client.post("/api/v1/integrations/import",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "source": "Apple Health",
            "records": [
                {"date": "2026-11-17", "type": "steps", "value": 8500, "unit": "steps"}
            ]
        }
    )
    assert dup_res.status_code == 200
    assert dup_res.get_json()["duplicates_skipped"] >= 1

def test_routine_planner(client):
    token = get_guest_token(client)
    gen_res = client.post("/api/v1/routines/generate",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "wake_time": "06:30",
            "sleep_time": "22:30",
            "work_start": "09:00",
            "work_end": "17:00"
        }
    )
    assert gen_res.status_code == 201
    routine = gen_res.get_json()["routine"]
    assert len(routine["morning_routine"]) >= 2

def test_voice_assistant(client):
    token = get_guest_token(client)
    # Test voice command parse
    cmd_res = client.post("/api/v1/voice/command",
        headers={"Authorization": f"Bearer {token}"},
        json={"transcript": "I walked for 25 minutes"}
    )
    assert cmd_res.status_code == 200
    res = cmd_res.get_json()["result"]
    assert res["requires_confirmation"] is True
    assert "confirmation_payload" in res

    # Confirm action
    confirm_res = client.post("/api/v1/voice/confirm",
        headers={"Authorization": f"Bearer {token}"},
        json={"confirmation_payload": res["confirmation_payload"]}
    )
    assert confirm_res.status_code == 200
    assert confirm_res.get_json()["status"] == "success"

def test_jitai_notifications(client):
    token = get_guest_token(client)
    res = client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert "notifications" in res.get_json()

    # Mark all read
    read_res = client.put("/api/v1/notifications/all/read", headers={"Authorization": f"Bearer {token}"})
    assert read_res.status_code == 200

def test_openapi_and_swagger_docs(client):
    spec_res = client.get("/api/v1/openapi.json")
    assert spec_res.status_code == 200
    assert spec_res.get_json()["openapi"] == "3.0.3"

    docs_res = client.get("/api/v1/docs")
    assert docs_res.status_code == 200
    assert "SwaggerUIBundle" in docs_res.get_data(as_text=True)
