from datetime import datetime, timezone, timedelta
from backend.app.database import db_manager

DEFAULT_WEIGHTS = {
    "exercise": 25,
    "water": 20,
    "sleep": 20,
    "nutrition": 15,
    "meditation": 10,
    "general": 10
}

class ImpactScoreService:
    @classmethod
    def calculate_score(cls, user_id: str, date_str: str = None):
        now = datetime.now(timezone.utc)
        target_date = date_str or now.strftime("%Y-%m-%d")

        # Fetch custom user weights if set
        profile = db_manager.user_profiles.find_one({"user_id": user_id}) or {}
        custom_weights = profile.get("habit_weights", DEFAULT_WEIGHTS)

        # Fetch active habits for this user
        habits = list(db_manager.habits.find({"user_id": user_id, "archived": {"$ne": True}}))
        if not habits:
            return {
                "score": 0,
                "formula": "Healthy Impact Score = (Sum of Weighted completed habit ratios / Total applicable weights) * 100",
                "contributing_habits": [],
                "weights_used": custom_weights,
                "date": target_date,
                "explanation": "No habits tracked yet. Create habits to activate your Healthy Impact Score.",
                "disclaimer": "This score is a behavioral consistency index, not a clinical health diagnosis."
            }

        # Fetch logs for target_date
        logs = list(db_manager.habit_logs.find({"user_id": user_id, "date": target_date}))
        logs_by_habit = {str(l.get("habit_id")): l for l in logs}

        weighted_completed_sum = 0.0
        total_applicable_weights = 0.0
        contributing_habits = []

        for h in habits:
            h_id = str(h.get("_id"))
            category = h.get("category", "general")
            weight = float(custom_weights.get(category, 10.0))
            
            log = logs_by_habit.get(h_id)
            target_val = float(h.get("target_value", 1.0))
            
            if log:
                logged_val = float(log.get("value", 1.0 if log.get("completed") else 0.0))
                ratio = min(1.0, max(0.0, logged_val / max(0.1, target_val)))
                completed = log.get("completed", ratio >= 1.0)
            else:
                ratio = 0.0
                completed = False

            # Add to applicable weights (only for active habits user actually tracks!)
            total_applicable_weights += weight
            weighted_completed_sum += (ratio * weight)

            contributing_habits.append({
                "habit_id": h_id,
                "title": h.get("title"),
                "category": category,
                "target": f"{target_val} {h.get('target_unit', '')}",
                "completed": completed,
                "completion_ratio": round(ratio, 2),
                "weight": weight,
                "weighted_contribution": round(ratio * weight, 2)
            })

        final_score = round((weighted_completed_sum / max(1.0, total_applicable_weights)) * 100, 1)

        # Historical trend (past 7 days)
        trend = []
        for i in range(6, -1, -1):
            d = (now - timedelta(days=i)).strftime("%Y-%m-%d")
            d_logs = list(db_manager.habit_logs.find({"user_id": user_id, "date": d}))
            d_logs_by_id = {str(l.get("habit_id")): l for l in d_logs}
            
            d_weighted_sum = 0.0
            for h in habits:
                h_id = str(h.get("_id"))
                cat = h.get("category", "general")
                w = float(custom_weights.get(cat, 10.0))
                l = d_logs_by_id.get(h_id)
                t_val = float(h.get("target_value", 1.0))
                if l:
                    r = min(1.0, max(0.0, float(l.get("value", 1.0 if l.get("completed") else 0.0)) / max(0.1, t_val)))
                else:
                    r = 0.0
                d_weighted_sum += (r * w)
            
            d_score = round((d_weighted_sum / max(1.0, total_applicable_weights)) * 100, 1)
            trend.append({"date": d, "score": d_score})

        result = {
            "score": final_score,
            "formula": "Healthy Impact Score = (Sum of Weighted completed habit ratios / Total applicable weights) * 100",
            "date": target_date,
            "weighted_completed_sum": round(weighted_completed_sum, 2),
            "total_applicable_weights": round(total_applicable_weights, 2),
            "contributing_habits": contributing_habits,
            "weights_used": custom_weights,
            "weekly_trend": trend,
            "explanation": f"Score of {final_score}/100 calculated from {len(contributing_habits)} active habits with total applicable weight {total_applicable_weights}. Missing habits are never penalised as clinical failure.",
            "disclaimer": "The Healthy Impact Score is a transparent wellness consistency metric and not a medical health assessment."
        }
        
        # Save snapshot into scores collection
        try:
            db_manager.scores.update_one(
                {"user_id": user_id, "date": target_date},
                {"$set": {"score": final_score, "updated_at": now.isoformat()}},
                upsert=True
            )
        except Exception:
            pass

        return result

    @classmethod
    def update_weights(cls, user_id: str, new_weights: dict):
        now = datetime.now(timezone.utc)
        db_manager.user_profiles.update_one(
            {"user_id": user_id},
            {"$set": {"habit_weights": new_weights, "updated_at": now.isoformat()}},
            upsert=True
        )
        return {"status": "success", "message": "Custom habit weights updated successfully.", "weights": new_weights}
