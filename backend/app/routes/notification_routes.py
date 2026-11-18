from flask import Blueprint, request, jsonify
from backend.app.services.notification_service import NotificationService
from backend.app.utils.decorators import token_required

notification_bp = Blueprint("notifications", __name__)

@notification_bp.route("", methods=["GET"])
@token_required
def get_notifications():
    res = NotificationService.get_notifications(request.user_id)
    return jsonify(res), 200

@notification_bp.route("/<notif_id>/read", methods=["PUT"])
@token_required
def mark_read(notif_id):
    res = NotificationService.mark_as_read(request.user_id, notif_id)
    return jsonify(res), 200

@notification_bp.route("/preferences", methods=["PUT"])
@token_required
def update_preferences():
    data = request.get_json() or {}
    res = NotificationService.update_preferences(request.user_id, data)
    return jsonify(res), 200
