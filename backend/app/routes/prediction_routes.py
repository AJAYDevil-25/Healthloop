from flask import Blueprint, request, jsonify
from backend.app.services.prediction_service import PredictionService
from backend.app.utils.decorators import token_required

prediction_bp = Blueprint("predictions", __name__)

@prediction_bp.route("/habits", methods=["GET"])
@token_required
def get_predictions():
    data = PredictionService.get_habit_predictions(request.user_id)
    return jsonify({"status": "success", "prediction_data": data}), 200
