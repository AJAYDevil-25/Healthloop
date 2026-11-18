from flask import Blueprint, request, jsonify
from backend.app.services.voice_assistant_service import VoiceAssistantService
from backend.app.utils.decorators import token_required

voice_bp = Blueprint("voice", __name__)

@voice_bp.route("/command", methods=["POST"])
@token_required
def process_command():
    data = request.get_json() or {}
    transcript = data.get("transcript", "").strip()
    if not transcript:
        return jsonify({"status": "error", "message": "Transcript text is required."}), 400

    res = VoiceAssistantService.process_voice_command(request.user_id, transcript)
    return jsonify({"status": "success", "result": res}), 200

@voice_bp.route("/confirm", methods=["POST"])
@token_required
def confirm_action():
    data = request.get_json() or {}
    payload = data.get("confirmation_payload")
    if not payload:
        return jsonify({"status": "error", "message": "Confirmation payload is required."}), 400

    res = VoiceAssistantService.execute_confirmed_action(request.user_id, payload)
    return jsonify(res), 200
