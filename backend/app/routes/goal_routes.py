from flask import Blueprint, request, jsonify
from backend.app.services.adaptive_goal_service import AdaptiveGoalService
from backend.app.utils.decorators import token_required

goal_bp = Blueprint("goals", __name__)

@goal_bp.route("/adaptive", methods=["GET"])
@token_required
def get_adaptive_goals():
    res = AdaptiveGoalService.get_recommendations(request.user_id)
    return jsonify(res), 200

@goal_bp.route("/adaptive/action", methods=["POST"])
@token_required
def goal_action():
    data = request.get_json() or {}
    res, status_code = AdaptiveGoalService.apply_action(request.user_id, data)
    return jsonify(res), status_code
