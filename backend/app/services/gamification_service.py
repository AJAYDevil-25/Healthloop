from datetime import datetime
from backend.app.database import db_manager
from backend.app.models.schemas import serialize_doc, serialize_docs

class GamificationService:
    LEVELS = [
        {"level": "Bronze Starter", "min_points": 0, "max_points": 200, "icon": "Shield"},
        {"level": "Silver Achiever", "min_points": 201, "max_points": 600, "icon": "Award"},
        {"level": "Gold Explorer", "min_points": 601, "max_points": 1500, "icon": "Medal"},
        {"level": "Platinum Master", "min_points": 1501, "max_points": 3000, "icon": "Crown"},
        {"level": "Diamond Champion", "min_points": 3001, "max_points": 99999, "icon": "Sparkles"}
    ]

    @classmethod
    def get_user_gamification(cls, user_id):
        profile = db_manager.user_profiles.find_one({"user_id": user_id})
        points = profile.get("points", 50) if profile else 50
        
        # Calculate level
        current_level = cls.LEVELS[0]
        next_level = cls.LEVELS[1]
        for idx, lvl in enumerate(cls.LEVELS):
            if points >= lvl["min_points"]:
                current_level = lvl
                next_level = cls.LEVELS[idx + 1] if idx + 1 < len(cls.LEVELS) else lvl

        progress_to_next = 100
        if next_level["max_points"] != current_level["min_points"]:
            range_pts = next_level["max_points"] - current_level["min_points"]
            earned_in_level = points - current_level["min_points"]
            progress_to_next = min(100, round((earned_in_level / range_pts) * 100))

        # Badges list
        all_badges = list(db_manager.achievements.find())
        unlocked_list = profile.get("unlocked_badges", []) if profile else []
        unlocked_codes = {b.get("code"): b.get("unlocked_at") for b in unlocked_list}

        badges_result = []
        for b in all_badges:
            b_dict = serialize_doc(b)
            code = b_dict.get("code")
            b_dict["unlocked"] = code in unlocked_codes
            b_dict["unlocked_at"] = unlocked_codes.get(code)
            badges_result.append(b_dict)

        return {
            "points": points,
            "level": current_level["level"],
            "level_icon": current_level["icon"],
            "next_level": next_level["level"],
            "progress_to_next_level": progress_to_next,
            "points_needed": max(0, next_level["max_points"] - points),
            "badges": badges_result,
            "unlocked_count": len(unlocked_codes),
            "total_badges": len(all_badges)
        }

    @staticmethod
    def get_leaderboard():
        """Generates friendly gamified leaderboard."""
        profiles = list(db_manager.user_profiles.find().sort("points", -1).limit(10))
        leaderboard = []
        for idx, p in enumerate(profiles):
            user = db_manager.users.find_one({"_id": p.get("user_id")})
            username = user.get("username", "Member") if user else p.get("display_name", "Member")
            leaderboard.append({
                "rank": idx + 1,
                "user_id": p.get("user_id"),
                "name": username,
                "avatar": p.get("avatar_url", f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}"),
                "points": p.get("points", 100),
                "level": p.get("level", "Explorer"),
                "badge_count": len(p.get("unlocked_badges", []))
            })
        return leaderboard
