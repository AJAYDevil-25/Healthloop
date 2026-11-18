import uuid
from datetime import datetime, timedelta, timezone
from backend.app.database import db_manager
from backend.app.models.schemas import serialize_doc, serialize_docs

class DropDetectionService:
    @classmethod
    def scan_for_drops(cls, user_id):
        """
        Analyzes habit patterns across the last 14 days to detect consistency drops.
        Returns active unresolved drops and suggestions.
        """
        habits = list(db_manager.habits.find({"user_id": user_id, "is_active": {"$ne": False}}))
        today = datetime.now(timezone.utc).date()
        detected_drops = []

        for habit in habits:
            habit_id = str(habit["_id"])
            title = habit.get("title", "Habit")
            category = habit.get("category", "general")
            target_value = float(habit.get("target_value", 1))
            unit = habit.get("unit", "")

            # Look back at last 10 days
            # Day 0 is today, Day 1 is yesterday, Day 2 is 2 days ago, etc.
            history = []
            for i in range(1, 11):
                d_str = (today - timedelta(days=i)).strftime("%Y-%m-%d")
                log = db_manager.habit_logs.find_one({"user_id": user_id, "habit_id": habit_id, "date": d_str})
                history.append(bool(log and log.get("completed")))

            # Pattern: missed recently (e.g. missed days 1, 2, 3), but had a solid streak earlier (e.g. days 4, 5, 6, 7)
            # Count consecutive recent misses starting from yesterday
            recent_misses = 0
            for completed in history:
                if not completed:
                    recent_misses += 1
                else:
                    break

            # If missed 2 or more consecutive days, check if had prior consistency
            if recent_misses >= 2:
                prior_completions = sum(1 for c in history[recent_misses:])
                if prior_completions >= 2:
                    # Drop pattern confirmed!
                    # Check if already recorded in database
                    existing_drop = db_manager.db["behaviour_drops"].find_one({
                        "user_id": user_id,
                        "habit_id": habit_id,
                        "status": {"$in": ["detected", "acknowledged"]}
                    })

                    if not existing_drop:
                        recovery_target = max(1, round(target_value * 0.4))
                        micro_plan = cls._generate_micro_plan(title, category, target_value, unit, recovery_target)
                        
                        drop_doc = {
                            "_id": f"drop_{uuid.uuid4().hex[:8]}",
                            "user_id": user_id,
                            "habit_id": habit_id,
                            "habit_title": title,
                            "category": category,
                            "original_target": target_value,
                            "recovery_target": recovery_target,
                            "unit": unit,
                            "missed_days_count": recent_misses,
                            "status": "detected", # detected, acknowledged, resumed, dismissed
                            "reason": None,
                            "recovery_suggestion": micro_plan["suggestion"],
                            "micro_target_action": micro_plan["action"],
                            "created_at": datetime.now(timezone.utc).isoformat(),
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                        db_manager.db["behaviour_drops"].insert_one(drop_doc)
                        detected_drops.append(drop_doc)
                    else:
                        detected_drops.append(existing_drop)

        # Return all active drops
        active_drops = list(db_manager.db["behaviour_drops"].find({
            "user_id": user_id,
            "status": {"$in": ["detected", "acknowledged"]}
        }))
        return serialize_docs(active_drops)

    @staticmethod
    def _generate_micro_plan(title, category, original_target, unit, recovery_target):
        if category == "exercise" or "gym" in title.lower() or "workout" in title.lower():
            return {
                "suggestion": f"Stepping back in after a break is hardest when the target feels heavy. Let's trade your full {int(original_target)} {unit} session for a quick, friction-free {int(recovery_target)} {unit} micro-routine today.",
                "action": f"Complete a gentle {int(recovery_target)} {unit} session (stretching, brisk walk, or bodyweight circuit) to rebuild your neurological rhythm."
            }
        elif category == "water":
            return {
                "suggestion": "Hydration momentum drops when we're busy. Don't worry about catching up on lost liters; just start with one single fresh glass right now.",
                "action": f"Drink a refreshing 350ml glass of water with a slice of lemon to re-anchor your routine."
            }
        elif category == "sleep":
            return {
                "suggestion": "Sleep rhythm shifts happen easily under stress or screen overload. Let's focus on wind-down ritual rather than forcing sleep.",
                "action": "Set a screen curfew 30 minutes before bed tonight and practice 5 minutes of 4-7-8 breathing."
            }
        elif category == "mindfulness":
            return {
                "suggestion": "Even seasoned meditators experience dry spells. You don't need a deep session to experience the calming benefits.",
                "action": "Take 3 conscious, slow belly breaths right where you are sitting."
            }
        else:
            return {
                "suggestion": f"Consistency isn't all-or-nothing! Scaling back your target to {recovery_target} {unit} lets you maintain your identity as someone who shows up.",
                "action": f"Complete a small {recovery_target} {unit} step today to reactivate your streak."
            }

    @classmethod
    def resolve_drop(cls, user_id, drop_id, data):
        """User provides optional reason and accepts/customizes recovery plan."""
        drop = db_manager.db["behaviour_drops"].find_one({"_id": drop_id, "user_id": user_id})
        if not drop:
            return {"status": "error", "message": "Drop record not found."}, 404

        reason = data.get("reason", "Busy schedule")
        user_notes = data.get("notes", "")
        accept_micro_target = data.get("accept_micro_target", True)

        db_manager.db["behaviour_drops"].update_one(
            {"_id": drop_id},
            {
                "$set": {
                    "status": "acknowledged",
                    "reason": reason,
                    "user_notes": user_notes,
                    "accepted_recovery_target": accept_micro_target,
                    "acknowledged_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )

        # Award small empathy encouragement points
        db_manager.user_profiles.update_one(
            {"user_id": user_id},
            {"$inc": {"points": 25}}
        )

        return {
            "status": "success",
            "message": "Thank you for sharing. Your personalized micro-recovery goal is now active!",
            "encouragement": f"Acknowledging the obstacle is half the victory. Today's goal: Just {drop.get('recovery_target')} {drop.get('unit')}. You've got this!"
        }, 200

    @classmethod
    def check_and_award_comeback(cls, user_id, habit_id):
        """Called by habit logging service to award Comeback Hero badge on resumption."""
        active_drop = db_manager.db["behaviour_drops"].find_one({
            "user_id": user_id,
            "habit_id": habit_id,
            "status": {"$in": ["detected", "acknowledged"]}
        })
        if active_drop:
            db_manager.db["behaviour_drops"].update_one(
                {"_id": active_drop["_id"]},
                {
                    "$set": {
                        "status": "resumed",
                        "resumed_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            # Award Comeback Hero badge
            profile = db_manager.user_profiles.find_one({"user_id": user_id})
            unlocked = profile.get("unlocked_badges", []) if profile else []
            has_badge = any(b.get("code") == "COMEBACK_HERO" for b in unlocked)
            
            if not has_badge:
                db_manager.user_profiles.update_one(
                    {"user_id": user_id},
                    {
                        "$inc": {"points": 100},
                        "$push": {
                            "unlocked_badges": {
                                "code": "COMEBACK_HERO",
                                "title": "Comeback Hero",
                                "description": "Bounced back after a habit drop with flying colors!",
                                "unlocked_at": datetime.now(timezone.utc).isoformat()
                            }
                        }
                    }
                )
                return True
        return False
