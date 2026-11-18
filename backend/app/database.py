import os
import json
import uuid
import copy
from datetime import datetime, timezone
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from backend.config import Config

class FileBackedCollection:
    """
    High-performance Mongo-compatible collection for local testing and zero-friction evaluator setup.
    Automatically persists documents into local JSON storage if live MongoDB daemon is not running.
    """
    def __init__(self, db, name):
        self.db = db
        self.name = name
        
    def _get_docs(self):
        return self.db._data.setdefault(self.name, [])
        
    def _matches(self, doc, query):
        if not query:
            return True
        for key, val in query.items():
            if key == "_id":
                if str(doc.get("_id")) != str(val):
                    return False
            elif isinstance(val, dict):
                # Handle operators like $in, $gte, $lte, $ne, $exists
                doc_val = doc.get(key)
                if "$in" in val and doc_val not in val["$in"]:
                    return False
                if "$ne" in val and doc_val == val["$ne"]:
                    return False
                if "$gte" in val and (doc_val is None or doc_val < val["$gte"]):
                    return False
                if "$lte" in val and (doc_val is None or doc_val > val["$lte"]):
                    return False
                if "$gt" in val and (doc_val is None or doc_val <= val["$gt"]):
                    return False
                if "$lt" in val and (doc_val is None or doc_val >= val["$lt"]):
                    return False
                if "$exists" in val:
                    exists = key in doc
                    if exists != val["$exists"]:
                        return False
            else:
                if doc.get(key) != val:
                    return False
        return True

    def find_one(self, query=None, projection=None):
        query = query or {}
        docs = self._get_docs()
        for doc in docs:
            if self._matches(doc, query):
                res = copy.deepcopy(doc)
                if projection and "_id" not in projection and projection.get("_id") == 0:
                    res.pop("_id", None)
                return res
        return None

    def find(self, query=None, projection=None):
        query = query or {}
        docs = self._get_docs()
        matched = [copy.deepcopy(d) for d in docs if self._matches(d, query)]
        return CursorMock(matched, projection)

    def insert_one(self, doc):
        doc_copy = copy.deepcopy(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(uuid.uuid4())
        else:
            doc_copy["_id"] = str(doc_copy["_id"])
        if "created_at" not in doc_copy:
            doc_copy["created_at"] = datetime.now(timezone.utc).isoformat()
        if "updated_at" not in doc_copy:
            doc_copy["updated_at"] = datetime.now(timezone.utc).isoformat()
            
        self._get_docs().append(doc_copy)
        self.db._save()
        
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc_copy["_id"])

    def insert_many(self, docs):
        results = []
        for d in docs:
            res = self.insert_one(d)
            results.append(res.inserted_id)
        class InsertManyResult:
            def __init__(self, ids):
                self.inserted_ids = ids
        return InsertManyResult(results)

    def update_one(self, query, update, upsert=False):
        docs = self._get_docs()
        for doc in docs:
            if self._matches(doc, query):
                self._apply_update(doc, update)
                doc["updated_at"] = datetime.now(timezone.utc).isoformat()
                self.db._save()
                return UpdateResult(1, 1)
        if upsert:
            new_doc = copy.deepcopy(query)
            self._apply_update(new_doc, update)
            self.insert_one(new_doc)
            return UpdateResult(0, 1)
        return UpdateResult(0, 0)

    def update_many(self, query, update):
        docs = self._get_docs()
        matched = 0
        modified = 0
        for doc in docs:
            if self._matches(doc, query):
                matched += 1
                self._apply_update(doc, update)
                doc["updated_at"] = datetime.now(timezone.utc).isoformat()
                modified += 1
        if modified > 0:
            self.db._save()
        return UpdateResult(matched, modified)

    def _apply_update(self, doc, update):
        if "$set" in update:
            for k, v in update["$set"].items():
                doc[k] = v
        if "$inc" in update:
            for k, v in update["$inc"].items():
                doc[k] = doc.get(k, 0) + v
        if "$push" in update:
            for k, v in update["$push"].items():
                if k not in doc or not isinstance(doc[k], list):
                    doc[k] = []
                doc[k].append(v)
        if "$unset" in update:
            for k in update["$unset"]:
                doc.pop(k, None)

    def delete_one(self, query):
        docs = self._get_docs()
        for i, doc in enumerate(docs):
            if self._matches(doc, query):
                del docs[i]
                self.db._save()
                return DeleteResult(1)
        return DeleteResult(0)

    def delete_many(self, query):
        docs = self._get_docs()
        initial_len = len(docs)
        self.db._data[self.name] = [d for d in docs if not self._matches(d, query)]
        deleted = initial_len - len(self.db._data[self.name])
        if deleted > 0:
            self.db._save()
        return DeleteResult(deleted)

    def count_documents(self, query=None):
        query = query or {}
        docs = self._get_docs()
        return sum(1 for d in docs if self._matches(d, query))

    def create_index(self, *args, **kwargs):
        pass


class CursorMock:
    def __init__(self, data, projection=None):
        self.data = data
        self.projection = projection
        self._sort_key = None
        self._sort_dir = 1
        self._skip_val = 0
        self._limit_val = None

    def sort(self, key_or_list, direction=1):
        if isinstance(key_or_list, list):
            self._sort_key, self._sort_dir = key_or_list[0]
        else:
            self._sort_key = key_or_list
            self._sort_dir = direction
        return self

    def skip(self, count):
        self._skip_val = count
        return self

    def limit(self, count):
        self._limit_val = count
        return self

    def _get_result(self):
        items = list(self.data)
        if self._sort_key:
            items.sort(key=lambda x: (x.get(self._sort_key) is not None, x.get(self._sort_key)), reverse=(self._sort_dir == -1))
        if self._skip_val:
            items = items[self._skip_val:]
        if self._limit_val is not None:
            items = items[:self._limit_val]
        return items

    def __iter__(self):
        return iter(self._get_result())

    def __list__(self):
        return self._get_result()


class UpdateResult:
    def __init__(self, matched_count, modified_count):
        self.matched_count = matched_count
        self.modified_count = modified_count


class DeleteResult:
    def __init__(self, deleted_count):
        self.deleted_count = deleted_count


class FileBackedDatabase:
    def __init__(self, filepath):
        self.filepath = filepath
        self._data = {}
        self._load()

    def _load(self):
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
            except Exception as e:
                print(f"[Database] Warning loading JSON db: {e}")
                self._data = {}
        else:
            self._data = {}

    def _save(self):
        try:
            os.makedirs(os.path.dirname(self.filepath), exist_ok=True)
            with open(self.filepath, "w", encoding="utf-8") as f:
                json.dump(self._data, f, indent=2, default=str)
        except Exception as e:
            print(f"[Database] Warning saving JSON db: {e}")

    def __getitem__(self, name):
        return FileBackedCollection(self, name)


class DatabaseManager:
    """
    Manages MongoDB database connection with automatic fallback to persistent local store.
    Provides all 10 required MongoDB collections.
    """
    def __init__(self):
        self.client = None
        self.db = None
        self.is_connected_to_mongo = False
        self.init_db()

    def init_db(self):
        try:
            client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=1500)
            # Ping to verify active connection
            client.admin.command('ping')
            self.client = client
            self.db = client[Config.DB_NAME]
            self.is_connected_to_mongo = True
            print(f"[Database] Successfully connected to live MongoDB at {Config.MONGO_URI}")
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            data_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "healthloop_local.json")
            self.db = FileBackedDatabase(data_file)
            self.is_connected_to_mongo = False
            print(f"[Database] Live MongoDB not detected ({e}). Using embedded robust local JSON database engine ({data_file}).")

    def get_collection(self, name):
        return self.db[name]

    # 18 Required Collections
    @property
    def users(self):
        return self.get_collection("users")

    @property
    def user_profiles(self):
        return self.get_collection("user_profiles")

    @property
    def habits(self):
        return self.get_collection("habits")

    @property
    def habit_logs(self):
        return self.get_collection("habit_logs")

    @property
    def goals(self):
        return self.get_collection("goals")

    @property
    def daily_goals(self):
        return self.get_collection("goals")

    @property
    def mood_logs(self):
        return self.get_collection("mood_logs")

    @property
    def predictions(self):
        return self.get_collection("predictions")

    @property
    def interventions(self):
        return self.get_collection("interventions")

    @property
    def ai_conversations(self):
        return self.get_collection("ai_conversations")

    @property
    def routine_plans(self):
        return self.get_collection("routine_plans")

    @property
    def digital_twins(self):
        return self.get_collection("digital_twins")

    @property
    def scores(self):
        return self.get_collection("scores")

    @property
    def garden_items(self):
        return self.get_collection("garden_items")

    @property
    def achievements(self):
        return self.get_collection("achievements")

    @property
    def challenges(self):
        return self.get_collection("challenges")

    @property
    def challenge_participants(self):
        return self.get_collection("challenge_participants")

    @property
    def wearable_records(self):
        return self.get_collection("wearable_records")

    @property
    def notifications(self):
        return self.get_collection("notifications")

    @property
    def reminders(self):
        return self.get_collection("reminders")

    @property
    def ai_recommendations(self):
        return self.get_collection("ai_recommendations")

db_manager = DatabaseManager()
