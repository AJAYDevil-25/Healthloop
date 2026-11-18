import uuid
from datetime import datetime, timedelta, timezone
import bcrypt
import jwt
from backend.config import Config
from backend.app.database import db_manager
from backend.app.models.schemas import serialize_doc

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
        except Exception:
            return False

    @staticmethod
    def generate_token(user_id: str, email: str, role: str = "user") -> str:
        payload = {
            "user_id": str(user_id),
            "email": email,
            "role": role,
            "exp": datetime.now(timezone.utc) + Config.JWT_ACCESS_TOKEN_EXPIRES,
            "iat": datetime.now(timezone.utc)
        }
        return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")

    @classmethod
    def register(cls, data):
        username = data.get("username", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not username or not email or not password:
            return {"status": "error", "message": "Username, email and password are required."}, 400

        if len(password) < 6:
            return {"status": "error", "message": "Password must be at least 6 characters long."}, 400

        existing = db_manager.users.find_one({"email": email})
        if existing:
            return {"status": "error", "message": "An account with this email already exists."}, 409

        user_id = str(uuid.uuid4())
        hashed_pw = cls.hash_password(password)

        user_doc = {
            "_id": user_id,
            "username": username,
            "email": email,
            "password_hash": hashed_pw,
            "role": "user",
            "is_guest": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        db_manager.users.insert_one(user_doc)

        # Create Profile
        profile_doc = {
            "user_id": user_id,
            "display_name": username,
            "avatar_url": f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}",
            "bio": "Committed to sustaining lifelong healthy behaviours.",
            "age": int(data.get("age", 28)),
            "gender": data.get("gender", "prefer_not_to_say"),
            "height_cm": float(data.get("height_cm", 175)),
            "weight_kg": float(data.get("weight_kg", 70)),
            "daily_water_target_ml": 2500,
            "daily_sleep_target_hours": 8.0,
            "daily_exercise_target_mins": 45,
            "points": 50, # Welcome points
            "level": "Bronze Starter",
            "ai_consent": True,
            "unlocked_badges": [{"code": "FIRST_STEP", "unlocked_at": datetime.now(timezone.utc).isoformat()}],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db_manager.user_profiles.insert_one(profile_doc)

        # Create default starter habits
        starter_habits = [
            {"title": "Drinking Water", "category": "water", "target_value": 2500, "unit": "ml", "icon": "Droplets", "color": "#06b6d4", "reminder_time": "10:00"},
            {"title": "Daily Steps", "category": "exercise", "target_value": 8000, "unit": "steps", "icon": "Footprints", "color": "#10b981", "reminder_time": "17:00"},
            {"title": "Restorative Sleep", "category": "sleep", "target_value": 8.0, "unit": "hours", "icon": "Moon", "color": "#3b82f6", "reminder_time": "22:30"},
            {"title": "Mindful Meditation", "category": "mindfulness", "target_value": 15, "unit": "mins", "icon": "Sparkles", "color": "#8b5cf6", "reminder_time": "08:00"},
            {"title": "Healthy Nutrition", "category": "nutrition", "target_value": 3, "unit": "balanced meals", "icon": "Apple", "color": "#14b8a6", "reminder_time": "13:00"},
            {"title": "Reduce Screen Time", "category": "screen_time", "target_value": 60, "unit": "mins limit", "icon": "Tv", "color": "#ec4899", "reminder_time": "21:30"}
        ]
        for hab in starter_habits:
            db_manager.habits.insert_one({
                "user_id": user_id,
                "title": hab["title"],
                "category": hab["category"],
                "target_value": hab["target_value"],
                "current_today": 0,
                "unit": hab["unit"],
                "frequency": "daily",
                "icon": hab["icon"],
                "color": hab["color"],
                "reminder_time": hab["reminder_time"],
                "streak": 0,
                "best_streak": 0,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            })

        token = cls.generate_token(user_id, email, "user")
        return {
            "status": "success",
            "message": "Account created successfully!",
            "token": token,
            "user": {
                "id": user_id,
                "username": username,
                "email": email,
                "role": "user",
                "is_guest": False
            },
            "profile": serialize_doc(profile_doc)
        }, 201

    @classmethod
    def login(cls, data):
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return {"status": "error", "message": "Email and password are required."}, 400

        user = db_manager.users.find_one({"email": email})
        if not user or not cls.verify_password(password, user.get("password_hash", "")):
            return {"status": "error", "message": "Invalid email or password credentials."}, 401

        user_id = str(user["_id"])
        token = cls.generate_token(user_id, email, user.get("role", "user"))
        profile = db_manager.user_profiles.find_one({"user_id": user_id})

        return {
            "status": "success",
            "message": "Login successful!",
            "token": token,
            "user": {
                "id": user_id,
                "username": user.get("username"),
                "email": user.get("email"),
                "role": user.get("role", "user"),
                "is_guest": user.get("is_guest", False)
            },
            "profile": serialize_doc(profile)
        }, 200

    @classmethod
    def guest_login(cls):
        """Allows project evaluators to test all features with pre-seeded sample data."""
        guest = db_manager.users.find_one({"email": Config.GUEST_USER_EMAIL})
        if not guest:
            from backend.app.utils.seed_data import seed_database_if_empty
            seed_database_if_empty()
            guest = db_manager.users.find_one({"email": Config.GUEST_USER_EMAIL})

        user_id = str(guest["_id"])
        token = cls.generate_token(user_id, guest["email"], "guest")
        profile = db_manager.user_profiles.find_one({"user_id": user_id})

        return {
            "status": "success",
            "message": "Welcome to HealthLoop Guest Demo Mode! Exploring as Adam Mitchell with sample data.",
            "token": token,
            "user": {
                "id": user_id,
                "username": guest.get("username"),
                "email": guest.get("email"),
                "role": "guest",
                "is_guest": True
            },
            "profile": serialize_doc(profile)
        }, 200

    @classmethod
    def get_user_profile(cls, user_id):
        user = db_manager.users.find_one({"_id": user_id})
        profile = db_manager.user_profiles.find_one({"user_id": user_id})
        if not user or not profile:
            return {"status": "error", "message": "Profile not found."}, 404

        return {
            "status": "success",
            "user": {
                "id": str(user["_id"]),
                "username": user.get("username"),
                "email": user.get("email"),
                "role": user.get("role", "user"),
                "is_guest": user.get("is_guest", False)
            },
            "profile": serialize_doc(profile)
        }, 200

    @classmethod
    def update_profile(cls, user_id, data):
        allowed_fields = [
            "display_name", "bio", "avatar_url", "age", "gender",
            "height_cm", "weight_kg", "daily_water_target_ml",
            "daily_sleep_target_hours", "daily_exercise_target_mins", "ai_consent"
        ]
        updates = {}
        for f in allowed_fields:
            if f in data:
                updates[f] = data[f]

        if updates:
            db_manager.user_profiles.update_one({"user_id": user_id}, {"$set": updates})

        profile = db_manager.user_profiles.find_one({"user_id": user_id})
        return {
            "status": "success",
            "message": "Profile updated successfully.",
            "profile": serialize_doc(profile)
        }, 200
