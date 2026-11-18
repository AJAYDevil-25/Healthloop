from flask import Blueprint, request, jsonify
from backend.app.services.wearable_service import WearableService
from backend.app.utils.decorators import token_required

wearable_bp = Blueprint("wearables", __name__)

@wearable_bp.route("/status", methods=["GET"])
@token_required
def get_status():
    res = WearableService.get_status(request.user_id)
    return jsonify(res), 200

@wearable_bp.route("/import", methods=["POST"])
@token_required
def import_records():
    data = request.get_json() or {}
    source = data.get("source", "Manual CSV/JSON Upload")
    
    # If raw file content string passed
    file_content = data.get("file_content")
    file_type = data.get("file_type", "json")
    if file_content:
        res, status_code = WearableService.import_file(request.user_id, source, file_content, file_type)
        return jsonify(res), status_code

    records = data.get("records", [])
    if not records:
        return jsonify({"status": "error", "message": "No records provided to import."}), 400

    res, status_code = WearableService.import_records(request.user_id, source, records)
    return jsonify(res), status_code

@wearable_bp.route("/disconnect", methods=["POST"])
@token_required
def disconnect_provider():
    data = request.get_json() or {}
    provider = data.get("provider")
    if not provider:
        return jsonify({"status": "error", "message": "Provider is required."}), 400
    res, status_code = WearableService.toggle_connection(request.user_id, provider, connected=False)
    return jsonify(res), status_code

@wearable_bp.route("/connect", methods=["POST"])
@token_required
def connect_provider():
    data = request.get_json() or {}
    provider = data.get("provider")
    if not provider:
        return jsonify({"status": "error", "message": "Provider is required."}), 400
    res, status_code = WearableService.toggle_connection(request.user_id, provider, connected=True)
    return jsonify(res), status_code
