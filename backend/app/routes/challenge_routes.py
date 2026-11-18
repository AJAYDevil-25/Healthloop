from flask import Blueprint, request, jsonify
from backend.app.services.challenge_service import ChallengeService
from backend.app.utils.decorators import token_required

challenge_bp = Blueprint("challenges", __name__)

@challenge_bp.route("", methods=["GET"])
@token_required
def get_challenges():
    challenges = ChallengeService.get_challenges(request.user_id)
    return jsonify({"status": "success", "challenges": challenges}), 200

@challenge_bp.route("/<challenge_id>/join", methods=["POST"])
@token_required
def join_challenge(challenge_id):
    res, status_code = ChallengeService.join_challenge(request.user_id, challenge_id)
    return jsonify(res), status_code
