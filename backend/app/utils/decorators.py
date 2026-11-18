import jwt
from functools import wraps
from flask import request, jsonify, current_app
from backend.config import Config
from backend.app.database import db_manager

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        
        if auth_header:
            parts = auth_header.split(" ")
            if len(parts) == 2 and parts[0] == "Bearer":
                token = parts[1]
                
        if not token:
            return jsonify({"status": "error", "message": "Authentication token is missing. Please log in."}), 401
            
        try:
            data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
            user_id = data.get("user_id")
            user = db_manager.users.find_one({"_id": user_id})
            
            if not user:
                return jsonify({"status": "error", "message": "Invalid token or user does not exist."}), 401
                
            request.current_user = user
            request.user_id = str(user["_id"])
        except jwt.ExpiredSignatureError:
            return jsonify({"status": "error", "message": "Session expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"status": "error", "message": "Invalid token. Please authenticate."}), 401
        except Exception as e:
            return jsonify({"status": "error", "message": f"Auth error: {str(e)}"}), 401
            
        return f(*args, **kwargs)
    return decorated
