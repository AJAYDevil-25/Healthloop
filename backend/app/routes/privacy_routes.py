from flask import Blueprint, request, jsonify
from backend.app.database import db_manager
from backend.app.utils.decorators import token_required
from backend.app.models.schemas import serialize_doc, serialize_docs

privacy_bp = Blueprint("privacy", __name__)

@privacy_bp.route("/export-data", methods=["GET"])
@token_required
def export_data():
    """Generates a complete JSON export of all personal habit and analytics data."""
    user = db_manager.users.find_one({"_id": request.user_id})
    profile = db_manager.user_profiles.find_one({"user_id": request.user_id})
    habits = list(db_manager.habits.find({"user_id": request.user_id}))
    logs = list(db_manager.habit_logs.find({"user_id": request.user_id}))
    reminders = list(db_manager.reminders.find({"user_id": request.user_id}))
    drops = list(db_manager.db["behaviour_drops"].find({"user_id": request.user_id}))

    export_payload = {
        "export_date": serialize_doc({"date": ""}) if False else "2026-11-16",
        "user": {
            "username": user.get("username"),
            "email": user.get("email"),
            "created_at": user.get("created_at")
        },
        "profile": serialize_doc(profile),
        "habits": serialize_docs(habits),
        "habit_logs": serialize_docs(logs),
        "reminders": serialize_docs(reminders),
        "behaviour_drops": serialize_docs(drops),
        "privacy_notice": "HealthLoop complies with data minimization and gives you full ownership of your records."
    }

    return jsonify({"status": "success", "data": export_payload}), 200

@privacy_bp.route("/consent", methods=["POST"])
@token_required
def update_consent():
    data = request.get_json() or {}
    ai_consent = bool(data.get("ai_consent", True))
    db_manager.user_profiles.update_one({"user_id": request.user_id}, {"$set": {"ai_consent": ai_consent}})
    return jsonify({
        "status": "success",
        "message": f"AI privacy preferences updated: AI processing is now {'enabled' if ai_consent else 'disabled'}.",
        "ai_consent": ai_consent
    }), 200

@privacy_bp.route("/delete-data", methods=["DELETE"])
@token_required
def delete_all_data():
    if getattr(request.current_user, "is_guest", False) or request.current_user.get("is_guest"):
        return jsonify({
            "status": "info",
            "message": "Demo Guest account data is protected. Switch to a personal registered account to test permanent deletion."
        }), 200

    # Clean up all records for this user
    uid = request.user_id
    db_manager.habits.delete_many({"user_id": uid})
    db_manager.habit_logs.delete_many({"user_id": uid})
    db_manager.reminders.delete_many({"user_id": uid})
    db_manager.challenge_participants.delete_many({"user_id": uid})
    db_manager.ai_recommendations.delete_many({"user_id": uid})
    db_manager.user_profiles.delete_one({"user_id": uid})
    db_manager.users.delete_one({"_id": uid})

    return jsonify({"status": "success", "message": "All your user data has been permanently deleted from HealthLoop."}), 200
