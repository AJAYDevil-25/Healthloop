import uuid
import csv
import io
import json
from datetime import datetime, timezone
from backend.app.database import db_manager

class WearableService:
    @classmethod
    def get_status(cls, user_id: str):
        profile = db_manager.user_profiles.find_one({"user_id": user_id}) or {}
        wearable_config = profile.get("wearable_integrations", {
            "google_health_connect": {"connected": False, "last_sync": None},
            "apple_health": {"connected": False, "last_sync": None},
            "fitbit": {"connected": False, "last_sync": None}
        })
        recent_records = list(db_manager.wearable_records.find({"user_id": user_id}).sort("imported_at", -1).limit(15))
        return {
            "status": "success",
            "integrations": wearable_config,
            "recent_imported_records": recent_records
        }

    @classmethod
    def toggle_connection(cls, user_id: str, provider: str, connected: bool):
        now = datetime.now(timezone.utc)
        profile = db_manager.user_profiles.find_one({"user_id": user_id}) or {}
        integrations = profile.get("wearable_integrations", {
            "google_health_connect": {"connected": False, "last_sync": None},
            "apple_health": {"connected": False, "last_sync": None},
            "fitbit": {"connected": False, "last_sync": None}
        })

        if provider in integrations:
            integrations[provider]["connected"] = connected
            integrations[provider]["last_sync"] = now.isoformat() if connected else None
            db_manager.user_profiles.update_one(
                {"user_id": user_id},
                {"$set": {"wearable_integrations": integrations, "updated_at": now.isoformat()}},
                upsert=True
            )
            return {
                "status": "success",
                "message": f"Provider '{provider}' {'connected' if connected else 'disconnected'} successfully.",
                "integrations": integrations
            }, 200
        return {"status": "error", "message": f"Unknown provider: {provider}"}, 400

    @classmethod
    def import_records(cls, user_id: str, source: str, records: list):
        """
        Imports activity records with strict duplicate detection and validation.
        Supported metrics: steps, sleep_hours, active_minutes, exercise_name.
        """
        now = datetime.now(timezone.utc)
        imported_count = 0
        duplicates_skipped = 0
        added_records = []

        for item in records:
            date_str = item.get("date")
            metric_type = item.get("type", "steps") # steps, sleep, exercise, water
            value = float(item.get("value", 0))

            if not date_str:
                continue

            # Check for duplicate record: same user, same date, same metric_type, same source
            existing = db_manager.wearable_records.find_one({
                "user_id": user_id,
                "date": date_str,
                "type": metric_type,
                "source": source
            })

            if existing:
                duplicates_skipped += 1
                continue

            record = {
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "source": source,
                "type": metric_type,
                "value": value,
                "unit": item.get("unit", "units"),
                "date": date_str,
                "imported_at": now.isoformat(),
                "verified": True
            }
            db_manager.wearable_records.insert_one(record)
            added_records.append(record)
            imported_count += 1

            # Auto-sync corresponding habit log if habit exists!
            cls._sync_with_habit_log(user_id, metric_type, value, date_str)

        return {
            "status": "success",
            "imported_count": imported_count,
            "duplicates_skipped": duplicates_skipped,
            "records": added_records
        }, 200

    @classmethod
    def import_file(cls, user_id: str, source: str, file_content: str, file_type: str = "json"):
        records = []
        try:
            if file_type == "json":
                data = json.loads(file_content)
                if isinstance(data, list):
                    records = data
                elif isinstance(data, dict) and "records" in data:
                    records = data["records"]
            elif file_type == "csv":
                reader = csv.DictReader(io.StringIO(file_content))
                for row in reader:
                    records.append({
                        "date": row.get("date") or row.get("Date"),
                        "type": row.get("type") or row.get("Type") or "steps",
                        "value": float(row.get("value") or row.get("Value") or 0),
                        "unit": row.get("unit") or row.get("Unit") or "steps"
                    })
        except Exception as e:
            return {"status": "error", "message": f"Failed to parse file: {str(e)}"}, 400

        return cls.import_records(user_id, source, records)

    @classmethod
    def _sync_with_habit_log(cls, user_id: str, metric_type: str, value: float, date_str: str):
        """
        Synchronizes imported metric with relevant user habit (e.g. Daily Steps habit).
        """
        category_map = {
            "steps": "exercise",
            "sleep": "sleep",
            "water": "water",
            "exercise": "exercise"
        }
        target_cat = category_map.get(metric_type)
        if not target_cat:
            return

        habit = db_manager.habits.find_one({"user_id": user_id, "category": target_cat, "archived": {"$ne": True}})
        if habit:
            h_id = str(habit["_id"])
            target_val = float(habit.get("target_value", 1.0))
            is_completed = value >= target_val
            
            db_manager.habit_logs.update_one(
                {"user_id": user_id, "habit_id": h_id, "date": date_str},
                {"$set": {
                    "completed": is_completed,
                    "value": value,
                    "synced_from_wearable": True,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }},
                upsert=True
            )
