from datetime import datetime
import uuid

def serialize_doc(doc):
    """Serialize MongoDB or FileBacked doc into JSON-friendly dict."""
    if not doc:
        return None
    res = dict(doc)
    if "_id" in res:
        res["id"] = str(res["_id"])
        del res["_id"]
    return res

def serialize_docs(cursor_or_list):
    """Serialize list or cursor of documents."""
    return [serialize_doc(doc) for doc in cursor_or_list]

# Default System Badges
DEFAULT_ACHIEVEMENTS = [
    {
        "code": "FIRST_STEP",
        "title": "First Step",
        "description": "Logged your first healthy habit in HealthLoop.",
        "badge_icon": "Footprints",
        "category": "milestone",
        "points": 50,
        "criteria": {"logs_count": 1}
    },
    {
        "code": "SEVEN_DAY_STREAK",
        "title": "7-Day Streak",
        "description": "Maintained an unbroken 7-day streak for any healthy habit.",
        "badge_icon": "Flame",
        "category": "streak",
        "points": 150,
        "criteria": {"streak_days": 7}
    },
    {
        "code": "WATER_CHAMPION",
        "title": "Water Champion",
        "description": "Hit your optimal hydration target 5 days in a row.",
        "badge_icon": "Droplets",
        "category": "hydration",
        "points": 100,
        "criteria": {"water_target_hits": 5}
    },
    {
        "code": "SLEEP_MASTER",
        "title": "Sleep Master",
        "description": "Achieved 7.5+ hours of restorative sleep on schedule.",
        "badge_icon": "Moon",
        "category": "sleep",
        "points": 100,
        "criteria": {"sleep_target_hits": 5}
    },
    {
        "code": "FITNESS_EXPLORER",
        "title": "Fitness Explorer",
        "description": "Completed over 200 minutes of physical activity.",
        "badge_icon": "Activity",
        "category": "fitness",
        "points": 200,
        "criteria": {"exercise_minutes": 200}
    },
    {
        "code": "CONSISTENCY_CHAMPION",
        "title": "Consistency Champion",
        "description": "Completed 80% or more of all scheduled habits for 14 days.",
        "badge_icon": "Award",
        "category": "consistency",
        "points": 300,
        "criteria": {"consistency_score": 80}
    },
    {
        "code": "COMEBACK_HERO",
        "title": "Comeback Hero",
        "description": "Successfully bounced back after a behaviour drop with AI guidance.",
        "badge_icon": "Sparkles",
        "category": "recovery",
        "points": 250,
        "criteria": {"drop_recovery": True}
    }
]

# Default System Challenges
DEFAULT_CHALLENGES = [
    {
        "id": "chal_walking_7d",
        "title": "7-Day Walking & Movement Challenge",
        "description": "Walk at least 6,000 steps or 30 minutes daily for 7 consecutive days to boost cardiovascular health.",
        "category": "exercise",
        "duration_days": 7,
        "target_description": "6,000 steps or 30 mins walking per day",
        "icon": "Footprints",
        "color": "emerald",
        "xp_reward": 300,
        "participants_count": 142
    },
    {
        "id": "chal_water_30d",
        "title": "30-Day Hydration Hero Challenge",
        "description": "Meet your personalized hydration target (2,000 - 2,500ml) every single day for 30 days.",
        "category": "water",
        "duration_days": 30,
        "target_description": "Reach 2,500ml water daily",
        "icon": "Droplet",
        "color": "cyan",
        "xp_reward": 600,
        "participants_count": 289
    },
    {
        "id": "chal_sleep_7d",
        "title": "7-Day Sleep Rhythm Reset",
        "description": "Wind down by 10:30 PM, reduce blue light, and achieve 7-8 hours of sound sleep for one week.",
        "category": "sleep",
        "duration_days": 7,
        "target_description": "Sleep before 11:00 PM for 7+ hours",
        "icon": "Moon",
        "color": "indigo",
        "xp_reward": 250,
        "participants_count": 98
    },
    {
        "id": "chal_habit_21d",
        "title": "21-Day Habit Foundation Challenge",
        "description": "Neurologically anchor a new lifestyle routine by sustaining your core habits for 21 days straight.",
        "category": "mindfulness",
        "duration_days": 21,
        "target_description": "Complete at least 3 daily habits every day",
        "icon": "Target",
        "color": "purple",
        "xp_reward": 750,
        "participants_count": 315
    }
]
