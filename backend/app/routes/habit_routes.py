from flask import Blueprint, request, jsonify
from backend.app.services.habit_service import HabitService
from backend.app.services.drop_detection_service import DropDetectionService
from backend.app.utils.decorators import token_required

habit_bp = Blueprint("habits", __name__)

@habit_bp.route("", methods=["GET"])
@token_required
def get_habits():
    habits = HabitService.get_habits(request.user_id)
    return jsonify({"status": "success", "habits": habits}), 200

@habit_bp.route("", methods=["POST"])
@token_required
def create_habit():
    data = request.get_json() or {}
    res, status_code = HabitService.create_habit(request.user_id, data)
    return jsonify(res), status_code

@habit_bp.route("/<habit_id>", methods=["PUT"])
@token_required
def update_habit(habit_id):
    data = request.get_json() or {}
    res, status_code = HabitService.update_habit(request.user_id, habit_id, data)
    return jsonify(res), status_code

@habit_bp.route("/<habit_id>", methods=["DELETE"])
@token_required
def delete_habit(habit_id):
    res, status_code = HabitService.delete_habit(request.user_id, habit_id)
    return jsonify(res), status_code

@habit_bp.route("/<habit_id>/log", methods=["POST"])
@habit_bp.route("/<habit_id>/logs", methods=["POST"])
@token_required
def log_habit(habit_id):
    data = request.get_json() or {}
    res, status_code = HabitService.log_habit(request.user_id, habit_id, data)
    
    # Check if this log resumes a previously dropped habit!
    DropDetectionService.check_and_award_comeback(request.user_id, habit_id)
    
    return jsonify(res), status_code

@habit_bp.route("/summary/today", methods=["GET"])
@token_required
def get_today_summary():
    summary = HabitService.get_today_summary(request.user_id)
    return jsonify({"status": "success", "summary": summary}), 200
