from flask import Blueprint, request, jsonify
from backend.app.services.routine_planner_service import RoutinePlannerService
from backend.app.utils.decorators import token_required

routine_bp = Blueprint("routines", __name__)

@routine_bp.route("", methods=["GET"])
@token_required
def get_routines():
    data = RoutinePlannerService.get_user_routines(request.user_id)
    return jsonify(data), 200

@routine_bp.route("/generate", methods=["POST"])
@token_required
def generate_routine():
    data = request.get_json() or {}
    res, status_code = RoutinePlannerService.generate_routine(request.user_id, data)
    return jsonify(res), status_code

@routine_bp.route("/<routine_id>", methods=["PUT"])
@token_required
def update_routine(routine_id):
    data = request.get_json() or {}
    res, status_code = RoutinePlannerService.update_routine(request.user_id, routine_id, data)
    return jsonify(res), status_code
