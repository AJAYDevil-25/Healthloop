import uuid
from datetime import datetime, timezone, timedelta
from backend.app.database import db_manager

class NotificationService:
    @classmethod
    def get_notifications(cls, user_id: str):
        now = datetime.now(timezone.utc)
        # Fetch user preferences
        profile = db_manager.user_profiles.find_one({"user_id": user_id}) or {}
        pref = profile.get("notification_preferences", {
            "quiet_hours_enabled": True,
            "quiet_hours_start": "22:00",
            "quiet_hours_end": "07:00",
            "inactivity_nudges": True,
            "hydration_reminders": True,
            "habit_recovery_nudges": True
        })

        # Fetch recent notifications
        notifications = list(db_manager.notifications.find({"user_id": user_id}).sort("created_at", -1).limit(30))
        unread_count = sum(1 for n in notifications if not n.get("is_read"))

        # Generate JITAI interventions if needed (without duplicate spam)
        cls._evaluate_jitai_interventions(user_id, pref)

        # Re-fetch notifications after JITAI check
        notifications = list(db_manager.notifications.find({"user_id": user_id}).sort("created_at", -1).limit(30))
        unread_count = sum(1 for n in notifications if not n.get("is_read"))

        return {
            "status": "success",
            "unread_count": unread_count,
            "preferences": pref,
            "notifications": notifications
        }

    @classmethod
    def _evaluate_jitai_interventions(cls, user_id: str, preferences: dict):
        now = datetime.now(timezone.utc)
        current_time_str = now.strftime("%H:%M")
        today_str = now.strftime("%Y-%m-%d")

        # Check quiet hours
        if preferences.get("quiet_hours_enabled"):
            start = preferences.get("quiet_hours_start", "22:00")
            end = preferences.get("quiet_hours_end", "07:00")
            if start > end: # Over midnight e.g. 22:00 to 07:00
                if current_time_str >= start or current_time_str < end:
                    return # In quiet hours, don't generate interventions
            else:
                if start <= current_time_str < end:
                    return

        # Rate limiting helper: check if an intervention of this category was generated within 3 hours
        three_hours_ago = (now - timedelta(hours=3)).isoformat()
        
        # 1. Hydration pacing check
        if preferences.get("hydration_reminders"):
            recent_water_notif = db_manager.notifications.find_one({
                "user_id": user_id,
                "category": "hydration",
                "created_at": {"$gte": three_hours_ago}
            })
            if not recent_water_notif:
                water_habit = db_manager.habits.find_one({"user_id": user_id, "category": "water", "archived": {"$ne": True}})
                if water_habit:
                    water_log = db_manager.habit_logs.find_one({"user_id": user_id, "habit_id": str(water_habit["_id"]), "date": today_str})
                    if not water_log or not water_log.get("completed"):
                        cls.create_notification(
                            user_id=user_id,
                            title="Mindful Hydration Check 💧",
                            message="A quick glass of water boosts concentration and natural energy.",
                            category="hydration",
                            action_link="/habits"
                        )

        # 2. Inactivity / Movement check
        if preferences.get("inactivity_nudges"):
            recent_move_notif = db_manager.notifications.find_one({
                "user_id": user_id,
                "category": "movement",
                "created_at": {"$gte": three_hours_ago}
            })
            if not recent_move_notif:
                cls.create_notification(
                    user_id=user_id,
                    title="Time for a 2-Minute Stretch 🌿",
                    message="Give your eyes and shoulders a gentle reset. Roll your shoulders and take 5 slow breaths.",
                    category="movement",
                    action_link="/routines"
                )

    @classmethod
    def create_notification(cls, user_id: str, title: str, message: str, category: str = "general", action_link: str = None):
        now = datetime.now(timezone.utc)
        doc = {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": title,
            "message": message,
            "category": category,
            "action_link": action_link,
            "is_read": False,
            "created_at": now.isoformat()
        }
        db_manager.notifications.insert_one(doc)
        return doc

    @classmethod
    def mark_as_read(cls, user_id: str, notif_id: str):
        now = datetime.now(timezone.utc)
        if notif_id == "all":
            db_manager.notifications.update_many({"user_id": user_id}, {"$set": {"is_read": True, "read_at": now.isoformat()}})
            return {"status": "success", "message": "All notifications marked as read."}
        
        db_manager.notifications.update_one({"_id": notif_id, "user_id": user_id}, {"$set": {"is_read": True, "read_at": now.isoformat()}})
        return {"status": "success", "message": "Notification marked as read."}

    @classmethod
    def update_preferences(cls, user_id: str, preferences: dict):
        now = datetime.now(timezone.utc)
        db_manager.user_profiles.update_one(
            {"user_id": user_id},
            {"$set": {"notification_preferences": preferences, "updated_at": now.isoformat()}},
            upsert=True
        )
        return {"status": "success", "message": "Preferences updated successfully.", "preferences": preferences}
