from flask import Blueprint, request, jsonify
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.impact_score_service import ImpactScoreService
from backend.app.utils.decorators import token_required

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/overview", methods=["GET"])
@token_required
def get_overview():
    range_key = request.args.get("range", "7d")
    data = AnalyticsService.get_analytics_overview(request.user_id, range_key)
    return jsonify({"status": "success", "analytics": data}), 200

@analytics_bp.route("/weekly", methods=["GET"])
@token_required
def get_weekly():
    data = AnalyticsService.get_analytics_overview(request.user_id, "7d")
    return jsonify({"status": "success", "analytics": data}), 200

@analytics_bp.route("/monthly", methods=["GET"])
@token_required
def get_monthly():
    data = AnalyticsService.get_analytics_overview(request.user_id, "30d")
    return jsonify({"status": "success", "analytics": data}), 200

@analytics_bp.route("/impact-score", methods=["GET"])
@token_required
def get_impact_score():
    date_str = request.args.get("date")
    data = ImpactScoreService.calculate_score(request.user_id, date_str)
    return jsonify({"status": "success", "impact_score": data}), 200

@analytics_bp.route("/impact-score/weights", methods=["POST"])
@token_required
def update_impact_weights():
    data = request.get_json() or {}
    weights = data.get("weights", {})
    res = ImpactScoreService.update_weights(request.user_id, weights)
    return jsonify(res), 200
