import uuid
from datetime import datetime, timezone, timedelta
from backend.app.database import db_manager
from backend.app.services.gemini_service import GeminiService, MEDICAL_DISCLAIMER

VALID_MOODS = ["Happy", "Neutral", "Tired", "Stressed", "Sad", "Energetic"]

MOOD_SUPPORT_GUIDANCE = {
    "Happy": "Celebrate your positive energy! Anchor this feeling by noting what contributed to your good day.",
    "Neutral": "Neutral days provide steady ground. A balanced stroll or simple stretch can bring gentle clarity.",
    "Tired": "Your body is asking for recovery. Prioritize gentle winding down tonight and hydrate well.",
    "Stressed": "Take three deep, slow breaths. Step away from screens for 5 minutes. Consider a 5-minute calm walk.",
    "Sad": "Be gentle with yourself today. Light movement and speaking to someone you trust can offer comforting warmth.",
    "Energetic": "Channel your vibrant vitality into a dynamic workout or progress on an ambitious personal goal!"
}

CRISIS_DISCLAIMER = "If you or someone you know is feeling overwhelmed or experiencing acute distress, free and confidential support is available 24/7. Reach out to local emergency services or national support helplines (e.g. 988 in the US/Canada or your local crisis helpline)."

class MoodService:
    @classmethod
    def checkin(cls, user_id: str, data: dict):
        mood = data.get("mood", "").strip().capitalize()
        if mood not in VALID_MOODS:
            return {"status": "error", "message": f"Invalid mood. Choose from: {', '.join(VALID_MOODS)}"}, 400

        notes = data.get("notes", "").strip()
        energy_level = data.get("energy_level", 3)
        try:
            energy_level = max(1, min(5, int(energy_level)))
        except (ValueError, TypeError):
            energy_level = 3

        now = datetime.now(timezone.utc)
        record = {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "mood": mood,
            "energy_level": energy_level,
            "notes": notes,
            "tags": data.get("tags", []),
            "date": now.strftime("%Y-%m-%d"),
            "timestamp": now.isoformat()
        }

        db_manager.mood_logs.insert_one(record)

        # Generate personalized AI support
        user = db_manager.users.find_one({"_id": user_id}) or {}
        username = user.get("username", "Friend")
        
        # Build prompt for Gemini
        ai_prompt = f"The user {username} just logged a mood of '{mood}' with energy level {energy_level}/5. Notes: '{notes}'. Provide a brief (2-3 sentences), warm, evidence-informed wellness coaching suggestion to support their current state."
        context = f"User logged mood: {mood}, Energy: {energy_level}/5, Date: {now.strftime('%Y-%m-%d')}"
        
        support_message = GeminiService.call_gemini(ai_prompt, context)
        if not support_message or len(support_message.strip()) < 10:
            support_message = MOOD_SUPPORT_GUIDANCE.get(mood, "Focus on small, mindful steps today.")

        is_high_distress = mood in ["Stressed", "Sad"]

        return {
            "status": "success",
            "message": "Mood check-in recorded successfully.",
            "record": record,
            "ai_support": support_message,
            "quick_tip": MOOD_SUPPORT_GUIDANCE.get(mood, ""),
            "crisis_support": CRISIS_DISCLAIMER if is_high_distress else None
        }, 201

    @classmethod
    def get_history(cls, user_id: str, limit: int = 30):
        records = list(db_manager.mood_logs.find({"user_id": user_id}).sort("timestamp", -1).limit(limit))
        
        # Calculate distribution and analytics
        distribution = {m: 0 for m in VALID_MOODS}
        for r in records:
            m = r.get("mood")
            if m in distribution:
                distribution[m] += 1

        # Mood vs Habit correlation
        now = datetime.now(timezone.utc)
        start_30d = (now - timedelta(days=30)).strftime("%Y-%m-%d")
        habit_logs = list(db_manager.habit_logs.find({"user_id": user_id, "date": {"$gte": start_30d}}))
        
        # Group habit completion by date
        habit_comp_by_date = {}
        for h in habit_logs:
            d = h.get("date")
            if d not in habit_comp_by_date:
                habit_comp_by_date[d] = {"completed": 0, "total": 0}
            habit_comp_by_date[d]["total"] += 1
            if h.get("completed"):
                habit_comp_by_date[d]["completed"] += 1

        # Analyze mood vs completion
        mood_correlations = []
        for r in records[:14]:
            d = r.get("date")
            stats = habit_comp_by_date.get(d, {"completed": 0, "total": 0})
            rate = round((stats["completed"] / stats["total"] * 100), 1) if stats["total"] > 0 else None
            mood_correlations.append({
                "date": d,
                "mood": r.get("mood"),
                "energy_level": r.get("energy_level"),
                "habit_completion_rate": rate,
                "notes": r.get("notes")
            })

        return {
            "status": "success",
            "total_checkins": len(records),
            "distribution": distribution,
            "recent_checkins": records,
            "correlations": mood_correlations,
            "disclaimer": MEDICAL_DISCLAIMER
        }, 200
