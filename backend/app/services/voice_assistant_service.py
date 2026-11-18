import re
from datetime import datetime, timezone
from backend.app.database import db_manager
from backend.app.services.gemini_service import GeminiService, MEDICAL_DISCLAIMER

class VoiceAssistantService:
    @classmethod
    def process_voice_command(cls, user_id: str, transcript: str):
        """
        Parses user's voice transcript and prepares structured action requiring user confirmation.
        """
        text = transcript.strip().lower()
        now = datetime.now(timezone.utc)
        today_str = now.strftime("%Y-%m-%d")

        # Intent 1: Log Walking / Exercise
        # e.g., "I walked for 20 minutes", "logged 30 min run"
        walk_match = re.search(r'(walked|ran|exercised|biked|workout)\s*(for)?\s*(\d+)\s*(minutes|mins|min|hours|hour)?', text)
        if walk_match:
            action_verb = walk_match.group(1)
            duration = int(walk_match.group(3))
            unit = walk_match.group(4) or "minutes"
            if "hour" in unit:
                duration = duration * 60
                unit = "minutes"

            return {
                "intent": "log_exercise",
                "requires_confirmation": True,
                "spoken_reply": f"Would you like to record {duration} minutes of {action_verb} for today?",
                "confirmation_payload": {
                    "category": "exercise",
                    "title": f"Daily {action_verb.capitalize()}",
                    "value": duration,
                    "unit": "minutes"
                }
            }

        # Intent 2: Log Water / Hydration
        # e.g., "I drank 500 ml of water", "had 2 glasses of water"
        water_ml_match = re.search(r'(drank|had|logged)\s*(\d+)\s*(ml|milliliters|millilitres)?\s*(of\s*water)?', text)
        water_glass_match = re.search(r'(drank|had)\s*(\d+)\s*(glass|glasses)\s*(of\s*water)?', text)
        
        if water_glass_match:
            glasses = int(water_glass_match.group(2))
            ml = glasses * 250
            return {
                "intent": "log_water",
                "requires_confirmation": True,
                "spoken_reply": f"Would you like to record {glasses} glasses ({ml} ml) of water for today?",
                "confirmation_payload": {
                    "category": "water",
                    "title": "Daily Hydration",
                    "value": ml,
                    "unit": "ml"
                }
            }
        elif water_ml_match and int(water_ml_match.group(2)) > 50:
            ml = int(water_ml_match.group(2))
            return {
                "intent": "log_water",
                "requires_confirmation": True,
                "spoken_reply": f"Would you like to record {ml} ml of water for today?",
                "confirmation_payload": {
                    "category": "water",
                    "title": "Daily Hydration",
                    "value": ml,
                    "unit": "ml"
                }
            }

        # Intent 3: Query streak or today's progress
        if "streak" in text or "how am i doing" in text or "progress" in text or "score" in text:
            habits = list(db_manager.habits.find({"user_id": user_id, "archived": {"$ne": True}}))
            logs = list(db_manager.habit_logs.find({"user_id": user_id, "date": today_str}))
            completed = sum(1 for l in logs if l.get("completed"))
            total = len(habits)
            max_streak = max([h.get("current_streak", 0) for h in habits], default=0)

            reply = f"You have completed {completed} out of {total} habits today, with a current best streak of {max_streak} days. Keep up the steady momentum!"
            return {
                "intent": "query_progress",
                "requires_confirmation": False,
                "spoken_reply": reply,
                "confirmation_payload": None
            }

        # Fallback: General wellness question powered by Gemini
        prompt = f"The user asked by voice: '{transcript}'. Provide a concise (under 40 words), warm wellness answer suitable for text-to-speech audio playback."
        answer = GeminiService.call_gemini(prompt, "Voice Assistant query")
        return {
            "intent": "general_wellness_qa",
            "requires_confirmation": False,
            "spoken_reply": answer,
            "confirmation_payload": None
        }

    @classmethod
    def execute_confirmed_action(cls, user_id: str, payload: dict):
        """
        Executes confirmed record creation or habit log.
        """
        now = datetime.now(timezone.utc)
        today_str = now.strftime("%Y-%m-%d")
        category = payload.get("category", "exercise")
        value = float(payload.get("value", 1.0))

        # Find or create corresponding habit
        habit = db_manager.habits.find_one({"user_id": user_id, "category": category, "archived": {"$ne": True}})
        if not habit:
            from backend.app.services.habit_service import HabitService
            new_h_data = {
                "title": payload.get("title", f"Daily {category.capitalize()}"),
                "category": category,
                "target_value": value,
                "target_unit": payload.get("unit", "units")
            }
            res, _ = HabitService.create_habit(user_id, new_h_data)
            habit = res.get("habit")

        h_id = str(habit["_id"])
        
        # Log completion
        db_manager.habit_logs.update_one(
            {"user_id": user_id, "habit_id": h_id, "date": today_str},
            {"$set": {
                "completed": True,
                "value": value,
                "logged_via": "voice_assistant",
                "updated_at": now.isoformat()
            }},
            upsert=True
        )

        return {
            "status": "success",
            "message": f"Successfully logged {value} {payload.get('unit')} for {habit.get('title')} via voice command!",
            "habit_id": h_id
        }
