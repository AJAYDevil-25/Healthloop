import uuid
from datetime import datetime, timedelta, timezone
import bcrypt
from backend.app.database import db_manager
from backend.app.models.schemas import DEFAULT_ACHIEVEMENTS, DEFAULT_CHALLENGES
from backend.config import Config

def seed_database_if_empty():
    """
    Seeds initial system achievements, challenges, and rich guest evaluator account ('Adam').
    """
    # 1. Seed Achievements if empty
    if db_manager.achievements.count_documents({}) == 0:
        for ach in DEFAULT_ACHIEVEMENTS:
            db_manager.achievements.insert_one(ach)
        print("[Seed] Initialized system achievement badges.")

    # 2. Seed Challenges if empty
    if db_manager.challenges.count_documents({}) == 0:
        for ch in DEFAULT_CHALLENGES:
            db_manager.challenges.insert_one(ch)
        print("[Seed] Initialized community wellness challenges.")

    # 3. Seed Guest Evaluator Account ('Adam Mitchell')
    guest_user = db_manager.users.find_one({"email": Config.GUEST_USER_EMAIL})
    if not guest_user:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw("healthloop_guest_pass".encode('utf-8'), salt).decode('utf-8')
        guest_id = Config.GUEST_USER_ID
        
        user_doc = {
            "_id": guest_id,
            "username": "Adam Mitchell",
            "email": Config.GUEST_USER_EMAIL,
            "password_hash": hashed,
            "role": "guest",
            "is_guest": True,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=21)).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        db_manager.users.insert_one(user_doc)
        
        # User profile
        profile_doc = {
            "user_id": guest_id,
            "display_name": "Adam Mitchell",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
            "bio": "Software designer passionate about sustainable health, daily hydration, and mindful habits.",
            "age": 31,
            "gender": "male",
            "height_cm": 178,
            "weight_kg": 74.5,
            "daily_water_target_ml": 2500,
            "daily_sleep_target_hours": 8.0,
            "daily_exercise_target_mins": 45,
            "points": 850,
            "level": "Gold Explorer",
            "ai_consent": True,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=21)).isoformat()
        }
        db_manager.user_profiles.insert_one(profile_doc)
        
        # Habits for Adam
        habits_data = [
            {
                "_id": "h_water_1",
                "user_id": guest_id,
                "title": "Daily Water Intake",
                "category": "water",
                "target_value": 2500,
                "current_today": 1865,
                "unit": "ml",
                "frequency": "daily",
                "icon": "Droplets",
                "color": "#06b6d4", # cyan
                "reminder_time": "10:00",
                "streak": 6,
                "best_streak": 14,
                "is_active": True,
                "created_at": (datetime.now(timezone.utc) - timedelta(days=20)).isoformat()
            },
            {
                "_id": "h_sleep_2",
                "user_id": guest_id,
                "title": "Restorative Sleep",
                "category": "sleep",
                "target_value": 8.0,
                "current_today": 7.5,
                "unit": "hours",
                "frequency": "daily",
                "icon": "Moon",
                "color": "#3b82f6", # blue
                "reminder_time": "22:30",
                "streak": 5,
                "best_streak": 9,
                "is_active": True,
                "created_at": (datetime.now(timezone.utc) - timedelta(days=20)).isoformat()
            },
            {
                "_id": "h_steps_3",
                "user_id": guest_id,
                "title": "Daily Steps & Walking",
                "category": "exercise",
                "target_value": 8000,
                "current_today": 5800,
                "unit": "steps",
                "frequency": "daily",
                "icon": "Footprints",
                "color": "#10b981", # emerald
                "reminder_time": "17:00",
                "streak": 4,
                "best_streak": 12,
                "is_active": True,
                "created_at": (datetime.now(timezone.utc) - timedelta(days=20)).isoformat()
            },
            {
                "_id": "h_meditation_4",
                "user_id": guest_id,
                "title": "Morning Meditation",
                "category": "mindfulness",
                "target_value": 15,
                "current_today": 15,
                "unit": "mins",
                "frequency": "daily",
                "icon": "Sparkles",
                "color": "#8b5cf6", # purple
                "reminder_time": "07:30",
                "streak": 7,
                "best_streak": 10,
                "is_active": True,
                "created_at": (datetime.now(timezone.utc) - timedelta(days=20)).isoformat()
            },
            {
                "_id": "h_exercise_5",
                "user_id": guest_id,
                "title": "Gym & Strength Training",
                "category": "exercise",
                "target_value": 45,
                "current_today": 0, # Trigger for drop detection demonstration!
                "unit": "mins",
                "frequency": "daily",
                "icon": "Dumbbell",
                "color": "#f59e0b", # amber
                "reminder_time": "14:30",
                "streak": 0,
                "best_streak": 8,
                "is_active": True,
                "created_at": (datetime.now(timezone.utc) - timedelta(days=20)).isoformat()
            },
            {
                "_id": "h_screen_6",
                "user_id": guest_id,
                "title": "Reduce Night Screen Time",
                "category": "screen_time",
                "target_value": 60,
                "current_today": 45,
                "unit": "mins limit",
                "frequency": "daily",
                "icon": "Tv",
                "color": "#ec4899", # pink
                "reminder_time": "21:00",
                "streak": 3,
                "best_streak": 6,
                "is_active": True,
                "created_at": (datetime.now(timezone.utc) - timedelta(days=20)).isoformat()
            },
            {
                "_id": "h_eating_7",
                "user_id": guest_id,
                "title": "Balanced Whole-Food Meals",
                "category": "nutrition",
                "target_value": 3,
                "current_today": 2,
                "unit": "meals",
                "frequency": "daily",
                "icon": "Apple",
                "color": "#14b8a6", # teal
                "reminder_time": "12:30",
                "streak": 5,
                "best_streak": 11,
                "is_active": True,
                "created_at": (datetime.now(timezone.utc) - timedelta(days=20)).isoformat()
            }
        ]
        
        for h in habits_data:
            db_manager.habits.insert_one(h)
            
        # 14 days of historical logs
        today = datetime.now(timezone.utc).date()
        for i in range(14, 0, -1):
            log_date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
            
            # Water log
            db_manager.habit_logs.insert_one({
                "user_id": guest_id,
                "habit_id": "h_water_1",
                "date": log_date,
                "target_value": 2500,
                "achieved_value": 2400 if i != 2 else 1700,
                "completed": (i != 2),
                "created_at": f"{log_date}T20:00:00"
            })
            
            # Sleep log
            db_manager.habit_logs.insert_one({
                "user_id": guest_id,
                "habit_id": "h_sleep_2",
                "date": log_date,
                "target_value": 8.0,
                "achieved_value": 7.6 if i > 3 else 7.2,
                "completed": True,
                "created_at": f"{log_date}T08:00:00"
            })
            
            # Steps log
            db_manager.habit_logs.insert_one({
                "user_id": guest_id,
                "habit_id": "h_steps_3",
                "date": log_date,
                "target_value": 8000,
                "achieved_value": 8200 if i > 2 else 5400,
                "completed": (i > 2),
                "created_at": f"{log_date}T21:00:00"
            })
            
            # Meditation log
            db_manager.habit_logs.insert_one({
                "user_id": guest_id,
                "habit_id": "h_meditation_4",
                "date": log_date,
                "target_value": 15,
                "achieved_value": 15,
                "completed": True,
                "created_at": f"{log_date}T07:45:00"
            })
            
            # Gym log: Active for days 14-4, but missed days 3, 2, 1 (Behavior Drop Demonstration!)
            gym_completed = (i > 3)
            db_manager.habit_logs.insert_one({
                "user_id": guest_id,
                "habit_id": "h_exercise_5",
                "date": log_date,
                "target_value": 45,
                "achieved_value": 45 if gym_completed else 0,
                "completed": gym_completed,
                "notes": "Good workout" if gym_completed else "Missed session",
                "created_at": f"{log_date}T16:00:00"
            })

        # Today's active logs
        today_str = today.strftime("%Y-%m-%d")
        db_manager.habit_logs.insert_one({
            "user_id": guest_id,
            "habit_id": "h_meditation_4",
            "date": today_str,
            "target_value": 15,
            "achieved_value": 15,
            "completed": True,
            "created_at": f"{today_str}T07:30:00"
        })
        db_manager.habit_logs.insert_one({
            "user_id": guest_id,
            "habit_id": "h_water_1",
            "date": today_str,
            "target_value": 2500,
            "achieved_value": 1865,
            "completed": False,
            "created_at": f"{today_str}T14:15:00"
        })
        db_manager.habit_logs.insert_one({
            "user_id": guest_id,
            "habit_id": "h_steps_3",
            "date": today_str,
            "target_value": 8000,
            "achieved_value": 5800,
            "completed": False,
            "created_at": f"{today_str}T15:30:00"
        })
        db_manager.habit_logs.insert_one({
            "user_id": guest_id,
            "habit_id": "h_sleep_2",
            "date": today_str,
            "target_value": 8.0,
            "achieved_value": 7.5,
            "completed": True,
            "created_at": f"{today_str}T07:00:00"
        })
        
        # User Reminders
        reminders = [
            {"user_id": guest_id, "habit_id": "h_water_1", "title": "Hydration Reminder", "category": "water", "scheduled_time": "10:00", "days_of_week": [1,2,3,4,5,6,7], "enabled": True},
            {"user_id": guest_id, "habit_id": "h_water_1", "title": "Afternoon Water Top-up", "category": "water", "scheduled_time": "14:30", "days_of_week": [1,2,3,4,5,6,7], "enabled": True},
            {"user_id": guest_id, "habit_id": "h_exercise_5", "title": "Gym & Strength Training", "category": "exercise", "scheduled_time": "14:30", "days_of_week": [1,2,3,4,5], "enabled": True},
            {"user_id": guest_id, "habit_id": "h_sleep_2", "title": "Wind-down & Blue Light Cutoff", "category": "sleep", "scheduled_time": "22:00", "days_of_week": [1,2,3,4,5,6,7], "enabled": True},
            {"user_id": guest_id, "habit_id": "h_meditation_4", "title": "Morning Breathwork & Mindfulness", "category": "mindfulness", "scheduled_time": "07:30", "days_of_week": [1,2,3,4,5,6,7], "enabled": True}
        ]
        for r in reminders:
            db_manager.reminders.insert_one(r)
            
        # Join sample challenge
        db_manager.challenge_participants.insert_one({
            "challenge_id": "chal_walking_7d",
            "user_id": guest_id,
            "progress_days": 4,
            "target_days": 7,
            "completed": False,
            "joined_at": (datetime.now(timezone.utc) - timedelta(days=4)).isoformat()
        })
        db_manager.challenge_participants.insert_one({
            "challenge_id": "chal_water_30d",
            "user_id": guest_id,
            "progress_days": 18,
            "target_days": 30,
            "completed": False,
            "joined_at": (datetime.now(timezone.utc) - timedelta(days=18)).isoformat()
        })
        
        # User badges unlocked
        guest_badges = ["FIRST_STEP", "SEVEN_DAY_STREAK", "WATER_CHAMPION"]
        for code in guest_badges:
            db_manager.user_profiles.update_one(
                {"user_id": guest_id},
                {"$push": {"unlocked_badges": {"code": code, "unlocked_at": datetime.now(timezone.utc).isoformat()}}}
            )

        print("[Seed] Successfully seeded Evaluator Guest Profile ('Adam Mitchell') with 14 days of realistic health data.")
