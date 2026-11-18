from flask import Blueprint, request, jsonify
from backend.app.services.virtual_garden_service import VirtualGardenService
from backend.app.utils.decorators import token_required

garden_bp = Blueprint("garden", __name__)

@garden_bp.route("", methods=["GET"])
@token_required
def get_garden():
    data = VirtualGardenService.get_garden_state(request.user_id)
    return jsonify(data), 200

@garden_bp.route("/rewards", methods=["POST"])
@token_required
def claim_reward():
    data = request.get_json() or {}
    item_id = data.get("item_id")
    if not item_id:
        return jsonify({"status": "error", "message": "Item ID is required."}), 400
    res, status_code = VirtualGardenService.claim_reward(request.user_id, item_id)
    return jsonify(res), status_code
