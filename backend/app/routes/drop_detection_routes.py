from flask import Blueprint, request, jsonify
from backend.app.services.drop_detection_service import DropDetectionService
from backend.app.utils.decorators import token_required

drop_bp = Blueprint("drop_detection", __name__)

@drop_bp.route("/status", methods=["GET"])
@token_required
def get_drop_status():
    drops = DropDetectionService.scan_for_drops(request.user_id)
    return jsonify({
        "status": "success",
        "has_active_drops": len(drops) > 0,
        "active_drops": drops
    }), 200

@drop_bp.route("/<drop_id>/resolve", methods=["POST"])
@token_required
def resolve_drop(drop_id):
    data = request.get_json() or {}
    res, status_code = DropDetectionService.resolve_drop(request.user_id, drop_id, data)
    return jsonify(res), status_code
