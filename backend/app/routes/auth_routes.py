from flask import Blueprint, request, jsonify
from backend.app.services.auth_service import AuthService
from backend.app.utils.decorators import token_required

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    res, status_code = AuthService.register(data)
    return jsonify(res), status_code

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    res, status_code = AuthService.login(data)
    return jsonify(res), status_code

@auth_bp.route("/guest-login", methods=["POST"])
def guest_login():
    res, status_code = AuthService.guest_login()
    return jsonify(res), status_code

@auth_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({"status": "success", "message": "Successfully logged out of HealthLoop session."}), 200

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_me():
    res, status_code = AuthService.get_user_profile(request.user_id)
    return jsonify(res), status_code

@auth_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile():
    data = request.get_json() or {}
    res, status_code = AuthService.update_profile(request.user_id, data)
    return jsonify(res), status_code

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email", "").strip()
    if not email:
        return jsonify({"status": "error", "message": "Email is required."}), 400
    return jsonify({
        "status": "success",
        "message": f"Password reset instructions have been sent to {email}. (Simulation: You can also use Guest Login anytime)."
    }), 200
