from flask import Blueprint, request, jsonify
from backend.app.services.auth_service import AuthService
from backend.app.utils.decorators import token_required

user_bp = Blueprint("users", __name__)

@user_bp.route("/profile", methods=["GET"])
@token_required
def get_profile():
    res, status_code = AuthService.get_user_profile(request.user_id)
    return jsonify(res), status_code

@user_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile():
    data = request.get_json() or {}
    res, status_code = AuthService.update_profile(request.user_id, data)
    return jsonify(res), status_code
