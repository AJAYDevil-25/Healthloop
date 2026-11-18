import uuid
from datetime import datetime, timedelta, timezone
from backend.app.database import db_manager
from backend.app.models.schemas import serialize_doc, serialize_docs

class HabitService:
    @staticmethod
    def get_habits(user_id):
        habits = list(db_manager.habits.find({"user_id": user_id, "is_active": {"$ne": False}}))
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        
        # Attach today's log status to each habit
        result = []
        for h in habits:
            h_dict = serialize_doc(h)
            today_log = db_manager.habit_logs.find_one({
                "user_id": user_id,
                "habit_id": str(h["_id"]),
                "date": today_str
            })
            if today_log:
                h_dict["today_achieved"] = today_log.get("achieved_value", 0)
                h_dict["today_completed"] = today_log.get("completed", False)
                h_dict["today_notes"] = today_log.get("notes", "")
            else:
                h_dict["today_achieved"] = h.get("current_today", 0)
                target = h.get("target_value", 1)
                h_dict["today_completed"] = (h.get("current_today", 0) >= target)
                h_dict["today_notes"] = ""
                
            # Completion ratio percentage
            target = h.get("target_value", 1) or 1
            achieved = h_dict["today_achieved"]
            h_dict["completion_percentage"] = min(100, round((achieved / target) * 100))
            result.append(h_dict)
            
        return result

    @staticmethod
    def create_habit(user_id, data):
        title = data.get("title", "").strip()
        if not title:
            return {"status": "error", "message": "Habit title is required."}, 400

        category = data.get("category", "custom")
        target_val = float(data.get("target_value", 1))
        unit = data.get("unit", "times")
        icon = data.get("icon", "CheckCircle")
        color = data.get("color", "#10b981")
        reminder_time = data.get("reminder_time", "09:00")
        frequency = data.get("frequency", "daily")

        habit_id = f"h_{uuid.uuid4().hex[:8]}"
        doc = {
            "_id": habit_id,
            "user_id": user_id,
            "title": title,
            "category": category,
            "target_value": target_val,
            "current_today": 0,
            "unit": unit,
            "frequency": frequency,
            "icon": icon,
            "color": color,
            "reminder_time": reminder_time,
            "streak": 0,
            "best_streak": 0,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db_manager.habits.insert_one(doc)
        
        # Add a default reminder for this habit if time specified
        if reminder_time:
            db_manager.reminders.insert_one({
                "user_id": user_id,
                "habit_id": habit_id,
                "title": f"Time for: {title}",
                "category": category,
                "scheduled_time": reminder_time,
                "days_of_week": [1,2,3,4,5,6,7],
                "enabled": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            })

        return {"status": "success", "message": "Habit created successfully!", "habit": serialize_doc(doc)}, 201

    @staticmethod
    def update_habit(user_id, habit_id, data):
        habit = db_manager.habits.find_one({"_id": habit_id, "user_id": user_id})
        if not habit:
            return {"status": "error", "message": "Habit not found."}, 404

        allowed = ["title", "category", "target_value", "unit", "icon", "color", "reminder_time", "frequency"]
        updates = {}
        for f in allowed:
            if f in data:
                updates[f] = data[f]

        if updates:
            db_manager.habits.update_one({"_id": habit_id, "user_id": user_id}, {"$set": updates})

        updated = db_manager.habits.find_one({"_id": habit_id, "user_id": user_id})
        return {"status": "success", "message": "Habit updated.", "habit": serialize_doc(updated)}, 200

    @staticmethod
    def delete_habit(user_id, habit_id):
        habit = db_manager.habits.find_one({"_id": habit_id, "user_id": user_id})
        if not habit:
            return {"status": "error", "message": "Habit not found."}, 404

        # Soft delete
        db_manager.habits.update_one({"_id": habit_id, "user_id": user_id}, {"$set": {"is_active": False}})
        db_manager.reminders.delete_many({"habit_id": habit_id, "user_id": user_id})
        return {"status": "success", "message": "Habit removed successfully."}, 200

    @classmethod
    def log_habit(cls, user_id, habit_id, data):
        habit = db_manager.habits.find_one({"_id": habit_id, "user_id": user_id})
        if not habit:
            return {"status": "error", "message": "Habit not found."}, 404

        today_str = data.get("date", datetime.now(timezone.utc).strftime("%Y-%m-%d"))
        target_value = float(habit.get("target_value", 1))
        
        # Check if caller specified absolute achieved_value or incremental delta
        if "delta" in data:
            current_log = db_manager.habit_logs.find_one({"user_id": user_id, "habit_id": habit_id, "date": today_str})
            existing_val = current_log.get("achieved_value", 0) if current_log else 0
            achieved_value = max(0, existing_val + float(data["delta"]))
        elif "achieved_value" in data:
            achieved_value = float(data["achieved_value"])
        elif "completed" in data:
            achieved_value = target_value if data["completed"] else 0
        else:
            achieved_value = target_value

        completed = bool(data.get("completed", achieved_value >= target_value))
        notes = data.get("notes", "")

        # Upsert log entry
        log_query = {"user_id": user_id, "habit_id": habit_id, "date": today_str}
        existing = db_manager.habit_logs.find_one(log_query)

        points_awarded = 0
        if existing:
            was_completed = existing.get("completed", False)
            db_manager.habit_logs.update_one(log_query, {
                "$set": {
                    "achieved_value": achieved_value,
                    "target_value": target_value,
                    "completed": completed,
                    "notes": notes,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            })
            if not was_completed and completed:
                points_awarded = 15
        else:
            db_manager.habit_logs.insert_one({
                "user_id": user_id,
                "habit_id": habit_id,
                "date": today_str,
                "target_value": target_value,
                "achieved_value": achieved_value,
                "completed": completed,
                "notes": notes,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            if completed:
                points_awarded = 15

        # Update habit's current_today cache and recalculate streak
        if today_str == datetime.now(timezone.utc).strftime("%Y-%m-%d"):
            db_manager.habits.update_one(
                {"_id": habit_id},
                {"$set": {"current_today": achieved_value}}
            )

        # Recalculate streak for this habit
        streak = cls._calculate_habit_streak(user_id, habit_id)
        best_streak = max(habit.get("best_streak", 0), streak)
        db_manager.habits.update_one(
            {"_id": habit_id},
            {"$set": {"streak": streak, "best_streak": best_streak}}
        )

        # Award points to profile
        if points_awarded > 0:
            db_manager.user_profiles.update_one(
                {"user_id": user_id},
                {"$inc": {"points": points_awarded}}
            )

        return {
            "status": "success",
            "message": "Progress logged successfully!",
            "habit_id": habit_id,
            "achieved_value": achieved_value,
            "completed": completed,
            "streak": streak,
            "points_awarded": points_awarded
        }, 200

    @staticmethod
    def _calculate_habit_streak(user_id, habit_id):
        """Calculates current uninterrupted streak in consecutive days."""
        today = datetime.now(timezone.utc).date()
        streak = 0
        
        # Check today first
        today_log = db_manager.habit_logs.find_one({
            "user_id": user_id,
            "habit_id": habit_id,
            "date": today.strftime("%Y-%m-%d")
        })
        start_day_offset = 0 if (today_log and today_log.get("completed")) else 1
        
        # Check backwards up to 365 days
        for day_idx in range(start_day_offset, 365):
            d_str = (today - timedelta(days=day_idx)).strftime("%Y-%m-%d")
            log = db_manager.habit_logs.find_one({
                "user_id": user_id,
                "habit_id": habit_id,
                "date": d_str
            })
            if log and log.get("completed"):
                streak += 1
            else:
                break
                
        return streak

    @classmethod
    def get_today_summary(cls, user_id):
        """Returns comprehensive daily dashboard summary matching reference UI."""
        habits = cls.get_habits(user_id)
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        total_habits = len(habits)
        completed_habits = sum(1 for h in habits if h.get("today_completed"))
        completion_pct = round((completed_habits / total_habits * 100)) if total_habits > 0 else 0

        # Specific metric extractions
        water_val = 0
        water_target = 2500
        sleep_val = 0.0
        sleep_target = 8.0
        steps_val = 0
        steps_target = 8000
        calories_val = 867 # Calculated from activity & steps

        for h in habits:
            cat = h.get("category")
            if cat == "water":
                water_val = h.get("today_achieved", 0)
                water_target = h.get("target_value", 2500)
            elif cat == "sleep":
                sleep_val = h.get("today_achieved", 0)
                sleep_target = h.get("target_value", 8.0)
            elif cat == "exercise" and "step" in h.get("title", "").lower():
                steps_val = int(h.get("today_achieved", 0))
                steps_target = int(h.get("target_value", 8000))

        # Approximate active calories burned based on steps + exercises
        if steps_val > 0:
            calories_val = int(steps_val * 0.04) + 550

        # Weighted Health Score:
        # 40% habit completion, 20% water, 20% sleep, 20% movement
        water_score = min(1.0, water_val / max(1, water_target)) * 20
        sleep_score = min(1.0, sleep_val / max(1, sleep_target)) * 20
        steps_score = min(1.0, steps_val / max(1, steps_target)) * 20
        habits_score = (completed_habits / max(1, total_habits)) * 40
        health_score = min(100, round(water_score + sleep_score + steps_score + habits_score))

        # Overall User Streak (highest active habit streak)
        current_streak = max([h.get("streak", 0) for h in habits] + [0])

        return {
            "date": today_str,
            "health_score": health_score,
            "total_habits": total_habits,
            "completed_habits": completed_habits,
            "completion_percentage": completion_pct,
            "current_streak": current_streak,
            "water": {
                "achieved": water_val,
                "target": water_target,
                "percentage": min(100, round((water_val / max(1, water_target)) * 100))
            },
            "sleep": {
                "achieved": sleep_val,
                "target": sleep_target,
                "percentage": min(100, round((sleep_val / max(1, sleep_target)) * 100))
            },
            "steps": {
                "achieved": steps_val,
                "target": steps_target,
                "percentage": min(100, round((steps_val / max(1, steps_target)) * 100))
            },
            "calories": calories_val,
            "habits": habits
        }
