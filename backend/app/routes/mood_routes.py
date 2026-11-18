from flask import Blueprint, request, jsonify
from backend.app.services.mood_service import MoodService
from backend.app.utils.decorators import token_required

mood_bp = Blueprint("mood", __name__)

@mood_bp.route("/checkin", methods=["POST"])
@token_required
def checkin():
    data = request.get_json() or {}
    res, status_code = MoodService.checkin(request.user_id, data)
    return jsonify(res), status_code

@mood_bp.route("/history", methods=["GET"])
@token_required
def history():
    limit = int(request.args.get("limit", 30))
    res, status_code = MoodService.get_history(request.user_id, limit)
    return jsonify(res), status_code
