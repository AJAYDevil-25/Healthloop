import uuid
from datetime import datetime, timezone
from backend.app.database import db_manager

class RoutinePlannerService:
    @classmethod
    def get_user_routines(cls, user_id: str):
        routines = list(db_manager.routine_plans.find({"user_id": user_id}).sort("updated_at", -1))
        active_routine = next((r for r in routines if r.get("is_active")), routines[0] if routines else None)
        return {
            "status": "success",
            "active_routine": active_routine,
            "saved_routines": routines
        }

    @classmethod
    def generate_routine(cls, user_id: str, preferences: dict):
        wake_time = preferences.get("wake_time", "07:00")
        sleep_time = preferences.get("sleep_time", "23:00")
        work_start = preferences.get("work_start", "09:00")
        work_end = preferences.get("work_end", "17:30")
        focus_areas = preferences.get("focus_areas", ["Hydration", "Movement", "Sleep Hygiene", "Mindfulness"])

        # Fetch active user habits to weave into the plan
        user_habits = list(db_manager.habits.find({"user_id": user_id, "archived": {"$ne": True}}))
        habit_titles = [h.get("title") for h in user_habits]

        # Generate intelligent time-blocked routines
        morning_items = [
            {"time": wake_time, "title": "Hydration Wake-up", "description": "Drink 400ml of fresh room-temperature water", "duration_min": 5, "habit": "Hydration"},
            {"time": "07:15", "title": "Morning Sunlight & Mobility", "description": "10-15 min light stretching or gentle outdoor walk to calibrate circadian rhythm", "duration_min": 15, "habit": "Exercise"},
            {"time": "07:45", "title": "Nourishing Breakfast", "description": "Balanced protein-rich meal with fiber", "duration_min": 25, "habit": "Nutrition"}
        ]

        afternoon_items = [
            {"time": "12:30", "title": "Mindful Lunch & Screen Break", "description": "Step away from desks and computers while eating", "duration_min": 30, "habit": "Nutrition"},
            {"time": "14:30", "title": "Midday Hydration & Posture Reset", "description": "Drink 300ml water and perform 3 neck and shoulder rotations", "duration_min": 5, "habit": "Hydration"},
            {"time": "16:00", "title": "Micro-Break or 2-Minute Breathing", "description": "Box breathing (4s in, 4s hold, 4s out, 4s hold) to reduce cognitive load", "duration_min": 5, "habit": "Meditation"}
        ]

        evening_items = [
            {"time": "18:00", "title": "Daily Exercise / Brisk Walk", "description": "Cardio, gym, jogging, or cycling to relieve physical tension", "duration_min": 35, "habit": "Exercise"},
            {"time": "19:30", "title": "Nutritious Dinner", "description": "Light, wholesome dinner at least 2.5 hours before bedtime", "duration_min": 35, "habit": "Nutrition"}
        ]

        sleep_prep_items = [
            {"time": "21:30", "title": "Digital Sunset & Screen Dimming", "description": "Switch devices to night shift mode, power down intense work tabs", "duration_min": 10, "habit": "Sleep"},
            {"time": "22:15", "title": "Mindful Reflection & Reading", "description": "Jot down 2 wins in HealthLoop mood log or read physical book", "duration_min": 20, "habit": "Meditation"},
            {"time": sleep_time, "title": "Restorative Sleep", "description": "Dark, cool (18-20°C) bedroom environment for deep sleep", "duration_min": 480, "habit": "Sleep"}
        ]

        now = datetime.now(timezone.utc)
        routine_doc = {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": preferences.get("title", "Optimal Daily Wellness Routine"),
            "is_active": True,
            "wake_time": wake_time,
            "sleep_time": sleep_time,
            "work_hours": f"{work_start} - {work_end}",
            "focus_areas": focus_areas,
            "morning_routine": morning_items,
            "afternoon_routine": afternoon_items,
            "evening_routine": evening_items,
            "sleep_prep_routine": sleep_prep_items,
            "matched_user_habits": habit_titles,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }

        # Set all other routines to inactive
        db_manager.routine_plans.update_many({"user_id": user_id}, {"$set": {"is_active": False}})
        db_manager.routine_plans.insert_one(routine_doc)

        return {
            "status": "success",
            "message": "Personalized daily routine generated successfully. You can customize any item.",
            "routine": routine_doc
        }, 201

    @classmethod
    def update_routine(cls, user_id: str, routine_id: str, data: dict):
        now = datetime.now(timezone.utc)
        update_fields = {}
        for field in ["title", "wake_time", "sleep_time", "morning_routine", "afternoon_routine", "evening_routine", "sleep_prep_routine", "is_active"]:
            if field in data:
                update_fields[field] = data[field]
        update_fields["updated_at"] = now.isoformat()

        res = db_manager.routine_plans.update_one(
            {"_id": routine_id, "user_id": user_id},
            {"$set": update_fields}
        )
        if res.matched_count == 0:
            return {"status": "error", "message": "Routine not found."}, 404

        updated = db_manager.routine_plans.find_one({"_id": routine_id, "user_id": user_id})
        return {"status": "success", "message": "Routine updated successfully.", "routine": updated}, 200
