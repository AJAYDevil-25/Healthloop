from flask import Blueprint, request, jsonify
from backend.app.services.reminder_service import ReminderService
from backend.app.utils.decorators import token_required

reminder_bp = Blueprint("reminders", __name__)

@reminder_bp.route("", methods=["GET"])
@token_required
def get_reminders():
    reminders = ReminderService.get_reminders(request.user_id)
    return jsonify({"status": "success", "reminders": reminders}), 200

@reminder_bp.route("", methods=["POST"])
@token_required
def create_reminder():
    data = request.get_json() or {}
    res, status_code = ReminderService.create_reminder(request.user_id, data)
    return jsonify(res), status_code

@reminder_bp.route("/<reminder_id>", methods=["PUT"])
@token_required
def update_reminder(reminder_id):
    data = request.get_json() or {}
    res, status_code = ReminderService.update_reminder(request.user_id, reminder_id, data)
    return jsonify(res), status_code

@reminder_bp.route("/<reminder_id>", methods=["DELETE"])
@token_required
def delete_reminder(reminder_id):
    res, status_code = ReminderService.delete_reminder(request.user_id, reminder_id)
    return jsonify(res), status_code

@reminder_bp.route("/test-notification", methods=["POST"])
@token_required
def test_notification():
    return jsonify({
        "status": "success",
        "title": "HealthLoop Hydration Reminder",
        "body": "Time for a revitalizing glass of water! Keep your momentum going.",
        "icon": "/logo.png"
    }), 200
