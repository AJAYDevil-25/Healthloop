import pytest
import json
from backend.app import create_app
from backend.app.database import db_manager

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"
    assert data["app"] == "HealthLoop API"

def test_guest_login(client):
    res = client.post("/api/auth/guest-login")
    assert res.status_code == 200
    data = res.get_json()
    assert "token" in data
    assert data["user"]["is_guest"] is True
    assert data["user"]["username"] == "Adam Mitchell"

def test_user_registration_and_login(client):
    import uuid
    rand_email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    reg_data = {
        "username": "Test Runner",
        "email": rand_email,
        "password": "secure_password_123",
        "age": 28,
        "height_cm": 180,
        "weight_kg": 75
    }
    reg_res = client.post("/api/auth/register", json=reg_data)
    assert reg_res.status_code == 201
    reg_json = reg_res.get_json()
    assert "token" in reg_json

    # Test login with credentials
    login_res = client.post("/api/auth/login", json={
        "email": rand_email,
        "password": "secure_password_123"
    })
    assert login_res.status_code == 200
    assert "token" in login_res.get_json()

def test_today_summary_and_habits(client):
    guest_res = client.post("/api/auth/guest-login")
    token = guest_res.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Summary
    sum_res = client.get("/api/habits/summary/today", headers=headers)
    assert sum_res.status_code == 200
    summary = sum_res.get_json()["summary"]
    assert "health_score" in summary
    assert "water" in summary
    assert "sleep" in summary
    assert "steps" in summary

    # List habits
    hab_res = client.get("/api/habits", headers=headers)
    assert hab_res.status_code == 200
    habits = hab_res.get_json()["habits"]
    assert len(habits) >= 5

def test_habit_creation_and_logging(client):
    guest_res = client.post("/api/auth/guest-login")
    token = guest_res.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create habit
    create_res = client.post("/api/habits", headers=headers, json={
        "title": "Evening Mobility Stretch",
        "category": "exercise",
        "target_value": 20,
        "unit": "mins",
        "reminder_time": "20:00"
    })
    assert create_res.status_code == 201
    habit_id = create_res.get_json()["habit"]["id"]

    # Log habit progress
    log_res = client.post(f"/api/habits/{habit_id}/log", headers=headers, json={
        "achieved_value": 20,
        "completed": True
    })
    assert log_res.status_code == 200
    assert log_res.get_json()["completed"] is True

def test_behaviour_drop_detection(client):
    guest_res = client.post("/api/auth/guest-login")
    token = guest_res.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Check drop detection status for Adam (has Gym missed after 5-day streak)
    drop_res = client.get("/api/drop-detection/status", headers=headers)
    assert drop_res.status_code == 200
    drop_data = drop_res.get_json()
    assert "active_drops" in drop_data
    if drop_data["active_drops"]:
        first_drop = drop_data["active_drops"][0]
        # Test resolving drop with micro target
        resolve_res = client.post(f"/api/drop-detection/{first_drop['id']}/resolve", headers=headers, json={
            "reason": "Busy schedule",
            "accept_micro_target": True
        })
        assert resolve_res.status_code == 200
        assert "micro-recovery" in resolve_res.get_json()["message"]

def test_ai_coach_suggestions_and_chat(client):
    guest_res = client.post("/api/auth/guest-login")
    token = guest_res.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Daily suggestions
    sug_res = client.get("/api/ai/daily-suggestions", headers=headers)
    assert sug_res.status_code == 200
    assert len(sug_res.get_json()["suggestions"]) > 0

    # AI Chat
    chat_res = client.post("/api/ai/chat", headers=headers, json={
        "message": "What is the best way to stay consistent with drinking water?"
    })
    assert chat_res.status_code == 200
    assert "reply" in chat_res.get_json()
    assert len(chat_res.get_json()["reply"]) > 50

def test_analytics_and_gamification(client):
    guest_res = client.post("/api/auth/guest-login")
    token = guest_res.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Analytics Overview
    anal_res = client.get("/api/analytics/overview?range=7d", headers=headers)
    assert anal_res.status_code == 200
    anal_data = anal_res.get_json()["analytics"]
    assert "activity" in anal_data
    assert "consistency_index" in anal_data

    # Gamification
    gam_res = client.get("/api/gamification/overview", headers=headers)
    assert gam_res.status_code == 200
    gam_data = gam_res.get_json()["gamification"]
    assert "points" in gam_data
    assert "level" in gam_data
    assert len(gam_data["badges"]) >= 6

def test_privacy_data_export(client):
    guest_res = client.post("/api/auth/guest-login")
    token = guest_res.get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    export_res = client.get("/api/privacy/export-data", headers=headers)
    assert export_res.status_code == 200
    export_json = export_res.get_json()["data"]
    assert "user" in export_json
    assert "habits" in export_json
    assert "habit_logs" in export_json
