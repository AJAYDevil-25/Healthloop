from datetime import datetime, timezone
from backend.app.database import db_manager
from backend.app.models.schemas import serialize_doc, serialize_docs

class ChallengeService:
    @staticmethod
    def get_challenges(user_id):
        all_challenges = list(db_manager.challenges.find())
        participations = list(db_manager.challenge_participants.find({"user_id": user_id}))
        
        part_map = {p.get("challenge_id"): p for p in participations}
        
        result = []
        for ch in all_challenges:
            ch_dict = serialize_doc(ch)
            c_id = ch_dict.get("id") or str(ch_dict.get("_id", ""))
            ch_dict["id"] = c_id
            
            p = part_map.get(c_id)
            if p:
                ch_dict["is_joined"] = True
                ch_dict["progress_days"] = p.get("progress_days", 0)
                ch_dict["completed"] = p.get("completed", False)
                dur = ch_dict.get("duration_days", 7)
                ch_dict["progress_percentage"] = min(100, round((p.get("progress_days", 0) / dur) * 100))
            else:
                ch_dict["is_joined"] = False
                ch_dict["progress_days"] = 0
                ch_dict["completed"] = False
                ch_dict["progress_percentage"] = 0
                
            result.append(ch_dict)
            
        return result

    @staticmethod
    def join_challenge(user_id, challenge_id):
        existing = db_manager.challenge_participants.find_one({"user_id": user_id, "challenge_id": challenge_id})
        if existing:
            return {"status": "info", "message": "You are already enrolled in this challenge!"}, 200

        ch = db_manager.challenges.find_one({"id": challenge_id}) or db_manager.challenges.find_one({"_id": challenge_id})
        target_days = ch.get("duration_days", 7) if ch else 7

        doc = {
            "challenge_id": challenge_id,
            "user_id": user_id,
            "progress_days": 1,
            "target_days": target_days,
            "completed": False,
            "joined_at": datetime.now(timezone.utc).isoformat()
        }
        db_manager.challenge_participants.insert_one(doc)
        db_manager.challenges.update_one({"id": challenge_id}, {"$inc": {"participants_count": 1}})

        # Award small joining XP
        db_manager.user_profiles.update_one({"user_id": user_id}, {"$inc": {"points": 30}})

        return {"status": "success", "message": "Successfully joined challenge! +30 XP awarded.", "participation": serialize_doc(doc)}, 201
