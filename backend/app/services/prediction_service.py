from datetime import datetime, timedelta, timezone
from backend.app.database import db_manager

class PredictionService:
    """
    Feature 01: AI Habit Prediction Engine
    Transparent statistical and rule-based behavior prediction module.
    Estimates likelihood of missing future planned habits, identifies risk patterns,
    provides confidence ratings, and suggests proactive behavioral micro-interventions.
    """
    
    @classmethod
    def get_habit_predictions(cls, user_id: str):
        now = datetime.now(timezone.utc)
        today_str = now.strftime("%Y-%m-%d")
        
        # Fetch active habits for user
        habits = list(db_manager.habits.find({"user_id": user_id, "archived": {"$ne": True}}))
        if not habits:
            return {
                "summary": "No habits tracked yet. Create your first habit to generate predictions.",
                "overall_risk_level": "Low",
                "average_consistency": 0,
                "habits": [],
                "preventive_recommendations": [
                    "Start with 1-2 small habits to establish your behavioural baseline."
                ]
            }

        # Fetch past 30 days of logs
        start_date = (now - timedelta(days=30)).strftime("%Y-%m-%d")
        logs = list(db_manager.habit_logs.find({
            "user_id": user_id,
            "date": {"$gte": start_date, "$lte": today_str}
        }))
        
        # Group logs by habit_id and date
        logs_by_habit = {}
        for log in logs:
            h_id = str(log.get("habit_id"))
            if h_id not in logs_by_habit:
                logs_by_habit[h_id] = []
            logs_by_habit[h_id].append(log)

        habit_predictions = []
        high_risk_count = 0
        total_consistency = 0

        # Day of week names
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        current_day_idx = now.weekday()
        tomorrow_day_idx = (current_day_idx + 1) % 7
        tomorrow_day_name = day_names[tomorrow_day_idx]

        for habit in habits:
            h_id = str(habit.get("_id"))
            h_title = habit.get("title", "Habit")
            category = habit.get("category", "general")
            target_days = habit.get("frequency_days", [0, 1, 2, 3, 4, 5, 6])
            
            h_logs = logs_by_habit.get(h_id, [])
            total_logged = len(h_logs)
            completed_logs = [l for l in h_logs if l.get("completed", False)]
            completion_count = len(completed_logs)
            
            # Calculate 30-day baseline completion rate
            effective_days = max(1, min(30, (now.date() - datetime.fromisoformat(habit.get("created_at", now.isoformat()).replace("Z", "+00:00")).date()).days + 1))
            baseline_rate = round((completion_count / effective_days) * 100, 1) if effective_days > 0 else 50.0
            baseline_rate = min(100.0, baseline_rate)
            total_consistency += baseline_rate

            # Recent 7 days completion rate
            past_7_dates = [(now - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(1, 8)]
            recent_completed = sum(1 for l in completed_logs if l.get("date") in past_7_dates)
            recent_rate = round((recent_completed / 7) * 100, 1)

            # Analyze day-of-week patterns
            day_success = {d: 0 for d in range(7)}
            day_total = {d: 0 for d in range(7)}
            for l in h_logs:
                try:
                    d_obj = datetime.strptime(l.get("date"), "%Y-%m-%d")
                    w = d_obj.weekday()
                    day_total[w] += 1
                    if l.get("completed"):
                        day_success[w] += 1
                except Exception:
                    pass

            # Calculate day-of-week risk for tomorrow
            tomorrow_success_rate = (day_success[tomorrow_day_idx] / day_total[tomorrow_day_idx] * 100) if day_total[tomorrow_day_idx] > 0 else baseline_rate

            # Interruption probability estimation based on rule weights:
            # 1. Recent drop vs baseline (40%)
            # 2. Historical day-of-week vulnerability (35%)
            # 3. Overall baseline fragility (25%)
            trend_penalty = max(0, baseline_rate - recent_rate) * 0.4
            day_vulnerability = max(0, 80 - tomorrow_success_rate) * 0.35
            fragility = max(0, 70 - baseline_rate) * 0.25

            interruption_prob = round(min(92.0, max(8.0, 20.0 + trend_penalty + day_vulnerability + fragility)), 1)
            
            # Confidence based on log history volume
            if total_logged >= 14:
                confidence = "High (14+ days logged)"
            elif total_logged >= 5:
                confidence = "Moderate (5-13 days logged)"
            else:
                confidence = "Low (Early baseline phase)"

            # Identify contributing factors
            factors = []
            if recent_rate < baseline_rate - 15:
                factors.append(f"Recent 7-day completion dropped by {round(baseline_rate - recent_rate)}% compared to baseline.")
            elif recent_rate >= baseline_rate + 10:
                factors.append("Strong positive momentum in the last 7 days.")

            if day_total[tomorrow_day_idx] >= 2 and tomorrow_success_rate < 50:
                factors.append(f"Historical {tomorrow_day_name} completion is {round(tomorrow_success_rate)}% (lower than average).")
            elif day_total[tomorrow_day_idx] >= 2 and tomorrow_success_rate >= 80:
                factors.append(f"Historical {tomorrow_day_name} adherence is high ({round(tomorrow_success_rate)}%).")

            current_streak = habit.get("current_streak", 0)
            if current_streak >= 10:
                factors.append(f"Active streak of {current_streak} days provides behavioral momentum.")
            elif current_streak == 0:
                factors.append("Zero current streak increases inertia for tomorrow.")

            # Proactive preventive recommendations
            actionable_tip = ""
            if interruption_prob >= 50:
                high_risk_count += 1
                actionable_tip = f"High interruption risk for {tomorrow_day_name}. Plan a smaller 5-minute micro-session or set your gear ready tonight."
            elif interruption_prob >= 30:
                actionable_tip = f"Moderate risk. Schedule a specific time slot on {tomorrow_day_name} morning to lock in completion early."
            else:
                actionable_tip = "Consistency looks solid! Maintain your regular cues and routine."

            pred_item = {
                "habit_id": h_id,
                "title": h_title,
                "category": category,
                "baseline_completion_rate": baseline_rate,
                "recent_7d_completion_rate": recent_rate,
                "interruption_probability_percent": interruption_prob,
                "risk_tier": "High" if interruption_prob >= 50 else ("Moderate" if interruption_prob >= 28 else "Low"),
                "confidence": confidence,
                "target_day": tomorrow_day_name,
                "contributing_factors": factors if factors else ["Stable baseline logging pattern."],
                "actionable_recommendation": actionable_tip
            }
            habit_predictions.append(pred_item)

        avg_consistency = round(total_consistency / len(habits), 1) if habits else 0
        overall_risk = "High" if high_risk_count >= 2 else ("Moderate" if high_risk_count == 1 else "Low")

        # Global recommendations
        global_recommendations = [
            f"Tomorrow is {tomorrow_day_name}. Focus first on habits with high interruption probability.",
            "Use the 'Never Miss Twice' principle: If you miss today, complete a 2-minute micro-version tomorrow.",
            "Align high-effort habits with your peak energy hours."
        ]

        # Persist prediction run in predictions collection
        pred_record = {
            "user_id": user_id,
            "generated_at": now.isoformat(),
            "target_date": (now + timedelta(days=1)).strftime("%Y-%m-%d"),
            "overall_risk_level": overall_risk,
            "average_consistency": avg_consistency,
            "habits_evaluated": len(habit_predictions),
            "predictions": habit_predictions
        }
        try:
            db_manager.predictions.insert_one(pred_record)
        except Exception:
            pass

        return {
            "generated_at": now.isoformat(),
            "overall_risk_level": overall_risk,
            "average_consistency": avg_consistency,
            "habits": habit_predictions,
            "preventive_recommendations": global_recommendations,
            "disclaimer": "Predictions are statistical wellness estimates based on voluntary habit logs, not medical forecasts."
        }
