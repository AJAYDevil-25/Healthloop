import uuid
from datetime import datetime, timezone, timedelta
from backend.app.database import db_manager

class AdaptiveGoalService:
    @classmethod
    def get_recommendations(cls, user_id: str):
        now = datetime.now(timezone.utc)
        past_14d = (now - timedelta(days=14)).strftime("%Y-%m-%d")

        habits = list(db_manager.habits.find({"user_id": user_id, "archived": {"$ne": True}}))
        logs = list(db_manager.habit_logs.find({"user_id": user_id, "date": {"$gte": past_14d}}))

        # Check existing goals
        existing_goals = list(db_manager.goals.find({"user_id": user_id}).sort("created_at", -1))

        recommendations = []

        for h in habits:
            h_id = str(h.get("_id"))
            h_title = h.get("title")
            h_target = h.get("target_value", 1)
            h_unit = h.get("target_unit", "times")
            h_category = h.get("category", "general")

            h_logs = [l for l in logs if str(l.get("habit_id")) == h_id]
            completed_count = sum(1 for l in h_logs if l.get("completed"))
            completion_rate = (completed_count / 14) * 100

            # Condition 1: Missed days / Low completion -> Step-Down Recovery Goal
            if completion_rate < 40:
                adjusted_target = max(1, round(h_target * 0.6))
                recommendations.append({
                    "id": str(uuid.uuid4()),
                    "habit_id": h_id,
                    "habit_title": h_title,
                    "category": h_category,
                    "type": "step_down_recovery",
                    "current_target": h_target,
                    "recommended_target": adjusted_target,
                    "unit": h_unit,
                    "rationale": f"Recent 14-day completion is {round(completion_rate)}%. Reducing target from {h_target} to {adjusted_target} {h_unit} lowers friction and rebuilds momentum.",
                    "status": "pending",
                    "user_controlled": True
                })

            # Condition 2: Consistent high adherence -> Progression Challenge
            elif completion_rate >= 85:
                # Moderate increase of 15-20%
                adjusted_target = round(h_target * 1.15) if h_target > 5 else h_target + 1
                recommendations.append({
                    "id": str(uuid.uuid4()),
                    "habit_id": h_id,
                    "habit_title": h_title,
                    "category": h_category,
                    "type": "gradual_progression",
                    "current_target": h_target,
                    "recommended_target": adjusted_target,
                    "unit": h_unit,
                    "rationale": f"Outstanding consistency ({round(completion_rate)}% over 14 days!). Ready for a gradual progression to {adjusted_target} {h_unit}?",
                    "status": "pending",
                    "user_controlled": True
                })

        # Add general healthy lifestyle goal if recommendations are few
        if len(recommendations) < 2:
            recommendations.append({
                "id": str(uuid.uuid4()),
                "habit_id": None,
                "habit_title": "Daily Mindful Walk",
                "category": "exercise",
                "type": "new_habit_suggestion",
                "current_target": 0,
                "recommended_target": 15,
                "unit": "minutes",
                "rationale": "Adding a 15-minute daily walk provides steady cardiovascular baseline without heavy fatigue.",
                "status": "pending",
                "user_controlled": True
            })

        return {
            "status": "success",
            "active_goals": existing_goals,
            "adaptive_recommendations": recommendations,
            "user_mandate": "HealthLoop never alters goals automatically. You have full control to Accept, Modify, or Dismiss any recommendation."
        }

    @classmethod
    def apply_action(cls, user_id: str, data: dict):
        action = data.get("action") # "accept", "reject", "modify"
        habit_id = data.get("habit_id")
        recommended_target = data.get("target_value")
        habit_title = data.get("habit_title", "Custom Goal")
        unit = data.get("unit", "units")
        category = data.get("category", "general")

        now = datetime.now(timezone.utc)

        if action == "accept":
            # Update the habit target if habit_id exists
            if habit_id:
                db_manager.habits.update_one(
                    {"_id": habit_id, "user_id": user_id},
                    {"$set": {"target_value": recommended_target, "updated_at": now.isoformat()}}
                )
            
            goal_doc = {
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "habit_id": habit_id,
                "title": habit_title,
                "target_value": recommended_target,
                "unit": unit,
                "category": category,
                "status": "active",
                "created_at": now.isoformat()
            }
            db_manager.goals.insert_one(goal_doc)
            return {"status": "success", "message": f"Goal '{habit_title}' set to {recommended_target} {unit}.", "goal": goal_doc}, 200

        elif action == "reject":
            return {"status": "success", "message": "Recommendation dismissed. Your existing goal remains unchanged."}, 200

        elif action == "modify":
            custom_target = data.get("custom_target", recommended_target)
            if habit_id:
                db_manager.habits.update_one(
                    {"_id": habit_id, "user_id": user_id},
                    {"$set": {"target_value": custom_target, "updated_at": now.isoformat()}}
                )
            goal_doc = {
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "habit_id": habit_id,
                "title": habit_title,
                "target_value": custom_target,
                "unit": unit,
                "category": category,
                "status": "active",
                "created_at": now.isoformat()
            }
            db_manager.goals.insert_one(goal_doc)
            return {"status": "success", "message": f"Custom goal '{habit_title}' set to {custom_target} {unit}.", "goal": goal_doc}, 200

        return {"status": "error", "message": "Invalid action. Use accept, reject, or modify."}, 400
