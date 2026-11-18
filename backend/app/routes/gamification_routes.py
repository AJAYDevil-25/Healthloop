from flask import Blueprint, request, jsonify
from backend.app.services.gamification_service import GamificationService
from backend.app.utils.decorators import token_required

gamification_bp = Blueprint("gamification", __name__)

@gamification_bp.route("/overview", methods=["GET"])
@token_required
def get_overview():
    data = GamificationService.get_user_gamification(request.user_id)
    return jsonify({"status": "success", "gamification": data}), 200

@gamification_bp.route("/leaderboard", methods=["GET"])
@token_required
def get_leaderboard():
    board = GamificationService.get_leaderboard()
    return jsonify({"status": "success", "leaderboard": board}), 200
