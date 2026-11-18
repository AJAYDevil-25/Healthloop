from flask import Blueprint, request, jsonify
from backend.app.services.digital_twin_service import DigitalTwinService
from backend.app.utils.decorators import token_required

digital_twin_bp = Blueprint("digital_twin", __name__)

@digital_twin_bp.route("", methods=["GET"])
@token_required
def get_digital_twin():
    profile = DigitalTwinService.get_twin_profile(request.user_id)
    return jsonify({"status": "success", "digital_twin": profile}), 200

@digital_twin_bp.route("/simulate", methods=["POST"])
@token_required
def simulate_scenario():
    data = request.get_json() or {}
    simulation = DigitalTwinService.simulate_scenario(request.user_id, data)
    return jsonify({"status": "success", "simulation": simulation}), 200
