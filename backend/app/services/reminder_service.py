from datetime import datetime, timezone
import uuid
from backend.app.database import db_manager
from backend.app.models.schemas import serialize_doc, serialize_docs

class ReminderService:
    @staticmethod
    def get_reminders(user_id):
        reminders = list(db_manager.reminders.find({"user_id": user_id}))
        return serialize_docs(reminders)

    @staticmethod
    def create_reminder(user_id, data):
        title = data.get("title", "").strip()
        if not title:
            return {"status": "error", "message": "Title is required."}, 400

        scheduled_time = data.get("scheduled_time", "09:00")
        category = data.get("category", "general")
        habit_id = data.get("habit_id", None)
        days = data.get("days_of_week", [1,2,3,4,5,6,7])

        doc = {
            "_id": f"rem_{uuid.uuid4().hex[:8]}",
            "user_id": user_id,
            "habit_id": habit_id,
            "title": title,
            "category": category,
            "scheduled_time": scheduled_time,
            "days_of_week": days,
            "enabled": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db_manager.reminders.insert_one(doc)
        return {"status": "success", "message": "Reminder created successfully.", "reminder": serialize_doc(doc)}, 201

    @staticmethod
    def update_reminder(user_id, reminder_id, data):
        reminder = db_manager.reminders.find_one({"_id": reminder_id, "user_id": user_id})
        if not reminder:
            return {"status": "error", "message": "Reminder not found."}, 404

        allowed = ["title", "scheduled_time", "category", "days_of_week", "enabled"]
        updates = {k: data[k] for k in allowed if k in data}

        if updates:
            db_manager.reminders.update_one({"_id": reminder_id, "user_id": user_id}, {"$set": updates})

        updated = db_manager.reminders.find_one({"_id": reminder_id, "user_id": user_id})
        return {"status": "success", "message": "Reminder updated.", "reminder": serialize_doc(updated)}, 200

    @staticmethod
    def delete_reminder(user_id, reminder_id):
        res = db_manager.reminders.delete_one({"_id": reminder_id, "user_id": user_id})
        if res.deleted_count == 0:
            return {"status": "error", "message": "Reminder not found."}, 404
        return {"status": "success", "message": "Reminder deleted."}, 200
