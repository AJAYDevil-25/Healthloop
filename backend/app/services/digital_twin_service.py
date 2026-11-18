import uuid
from datetime import datetime, timezone, timedelta
from backend.app.database import db_manager

class DigitalTwinService:
    @classmethod
    def get_twin_profile(cls, user_id: str):
        """
        Retrieves user's current behavioral digital twin profile based on real historical data.
        """
        now = datetime.now(timezone.utc)
        today_str = now.strftime("%Y-%m-%d")
        past_30d = (now - timedelta(days=30)).strftime("%Y-%m-%d")

        habits = list(db_manager.habits.find({"user_id": user_id, "archived": {"$ne": True}}))
        logs = list(db_manager.habit_logs.find({"user_id": user_id, "date": {"$gte": past_30d}}))

        # Real metrics
        total_logs = len(logs)
        completed_logs = sum(1 for l in logs if l.get("completed"))
        consistency_pct = round((completed_logs / max(1, total_logs)) * 100, 1)

        # Category breakdowns
        exercise_logs = [l for l in logs if l.get("category") == "exercise"]
        water_logs = [l for l in logs if l.get("category") == "water"]
        sleep_logs = [l for l in logs if l.get("category") == "sleep"]
        meditation_logs = [l for l in logs if l.get("category") == "meditation"]

        exercise_consistency = round((sum(1 for l in exercise_logs if l.get("completed")) / max(1, len(exercise_logs))) * 100, 1) if exercise_logs else 50.0
        water_consistency = round((sum(1 for l in water_logs if l.get("completed")) / max(1, len(water_logs))) * 100, 1) if water_logs else 50.0
        sleep_consistency = round((sum(1 for l in sleep_logs if l.get("completed")) / max(1, len(sleep_logs))) * 100, 1) if sleep_logs else 50.0
        meditation_consistency = round((sum(1 for l in meditation_logs if l.get("completed")) / max(1, len(meditation_logs))) * 100, 1) if meditation_logs else 50.0

        # Calculate Stamina, Recovery, and Mental Clarity baseline scores (0-100)
        stamina_index = round(exercise_consistency * 0.7 + water_consistency * 0.3, 1)
        recovery_index = round(sleep_consistency * 0.8 + meditation_consistency * 0.2, 1)
        clarity_index = round(meditation_consistency * 0.5 + sleep_consistency * 0.3 + water_consistency * 0.2, 1)

        profile = {
            "user_id": user_id,
            "generated_at": now.isoformat(),
            "baseline": {
                "overall_consistency_pct": consistency_pct,
                "exercise_consistency_pct": exercise_consistency,
                "hydration_consistency_pct": water_consistency,
                "sleep_routine_pct": sleep_consistency,
                "mindfulness_pct": meditation_consistency,
                "stamina_index": stamina_index,
                "recovery_index": recovery_index,
                "mental_clarity_index": clarity_index,
                "tracked_habits_count": len(habits),
                "total_historical_logs": total_logs
            },
            "twin_status": "Synchronized with verified logs",
            "visual_mesh_parameters": {
                "energy_glow_intensity": round(consistency_pct / 100, 2),
                "core_scale": round(0.8 + (consistency_pct / 100) * 0.4, 2),
                "stamina_pulse_speed": round(0.5 + (stamina_index / 100) * 1.5, 2),
                "aurora_color": "#14b8a6" if consistency_pct > 70 else ("#3b82f6" if consistency_pct > 40 else "#f59e0b")
            }
        }
        return profile

    @classmethod
    def simulate_scenario(cls, user_id: str, simulation_params: dict):
        """
        Runs hypothetical behavioural simulation engine.
        Distinguishes simulation projection from verified historical data.
        """
        baseline_profile = cls.get_twin_profile(user_id)["baseline"]
        
        # Hypothetical inputs
        extra_walk_minutes = float(simulation_params.get("extra_walk_minutes", 0))
        target_sleep_hours = float(simulation_params.get("target_sleep_hours", 7.5))
        extra_water_ml = float(simulation_params.get("extra_water_ml", 0))
        target_consistency_target = float(simulation_params.get("habit_consistency_target", 85)) # 0 to 100%
        days_ahead = int(simulation_params.get("projection_days", 30))
        days_ahead = max(7, min(90, days_ahead))

        # Model projected shifts
        # Walking: every 15 min daily increases projected stamina by ~12% (diminishing returns)
        walk_gain = min(35.0, (extra_walk_minutes / 15.0) * 12.0)
        projected_stamina = min(98.0, baseline_profile["stamina_index"] + walk_gain)

        # Sleep: optimal between 7 and 9 hours
        sleep_efficiency = max(0.5, 1.0 - abs(target_sleep_hours - 8.0) * 0.15)
        projected_recovery = min(98.0, baseline_profile["recovery_index"] + (sleep_efficiency * 20.0))

        # Hydration boost
        water_gain = min(25.0, (extra_water_ml / 500.0) * 6.0)
        projected_hydration = min(98.0, baseline_profile["hydration_consistency_pct"] + water_gain)

        # Overall projected Healthy Impact Score
        projected_impact_score = round(
            (projected_stamina * 0.35 + projected_recovery * 0.35 + projected_hydration * 0.15 + (target_consistency_target * 0.15)),
            1
        )
        projected_impact_score = min(99.0, max(20.0, projected_impact_score))

        # Generate day-by-day projection timeline for visualization
        now = datetime.now(timezone.utc)
        timeline = []
        cur_score = baseline_profile["overall_consistency_pct"]
        score_step = (projected_impact_score - cur_score) / days_ahead

        for i in range(1, days_ahead + 1):
            projected_day = (now + timedelta(days=i)).strftime("%Y-%m-%d")
            prog = cur_score + (score_step * i)
            timeline.append({
                "day": i,
                "date": projected_day,
                "projected_score": round(prog, 1),
                "baseline_reference": round(cur_score, 1)
            })

        simulation_result = {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "simulated_at": now.isoformat(),
            "is_simulation": True,
            "notice": "SIMULATION ONLY: This projection models hypothetical habits and does not represent actual clinical or medical outcome guarantees.",
            "inputs": {
                "extra_walk_minutes": extra_walk_minutes,
                "target_sleep_hours": target_sleep_hours,
                "extra_water_ml": extra_water_ml,
                "habit_consistency_target": target_consistency_target,
                "projection_days": days_ahead
            },
            "baseline_metrics": baseline_profile,
            "projected_metrics": {
                "projected_stamina_index": round(projected_stamina, 1),
                "projected_recovery_index": round(projected_recovery, 1),
                "projected_hydration_pct": round(projected_hydration, 1),
                "projected_impact_score": round(projected_impact_score, 1),
                "projected_score_change": round(projected_impact_score - baseline_profile["overall_consistency_pct"], 1)
            },
            "timeline": timeline
        }

        # Store in digital_twins collection
        try:
            db_manager.digital_twins.insert_one(simulation_result)
        except Exception:
            pass

        return simulation_result
