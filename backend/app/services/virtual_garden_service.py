import uuid
from datetime import datetime, timezone, timedelta
from backend.app.database import db_manager

class VirtualGardenService:
    @classmethod
    def get_garden_state(cls, user_id: str):
        now = datetime.now(timezone.utc)
        start_30d = (now - timedelta(days=30)).strftime("%Y-%m-%d")

        # Fetch verified habit logs
        logs = list(db_manager.habit_logs.find({"user_id": user_id, "date": {"$gte": start_30d}}))
        completed_logs = [l for l in logs if l.get("completed")]

        # Count completed habits per category
        exercise_count = sum(1 for l in completed_logs if l.get("category") == "exercise")
        water_count = sum(1 for l in completed_logs if l.get("category") == "water")
        meditation_count = sum(1 for l in completed_logs if l.get("category") == "meditation")
        sleep_count = sum(1 for l in completed_logs if l.get("category") == "sleep")
        nutrition_count = sum(1 for l in completed_logs if l.get("category") == "nutrition")
        total_completed = len(completed_logs)

        # Garden Level calculation
        garden_level = max(1, 1 + (total_completed // 5))
        total_seeds_earned = total_completed * 10
        
        # User profile / unlocked garden items
        unlocked_items = list(db_manager.garden_items.find({"user_id": user_id}))

        # Plant Growth Stages (0: Seed, 1: Sprout, 2: Blooming/Growing, 3: Mature Marvel)
        tree_stage = min(3, exercise_count // 3)
        water_lily_stage = min(3, water_count // 4)
        flower_stage = min(3, meditation_count // 3)
        environment_tier = min(3, sleep_count // 3)

        plants = [
            {
                "id": "tree_guardian",
                "name": "Oak of Vitality",
                "habit_category": "exercise",
                "category_label": "Physical Exercise",
                "growth_stage": tree_stage,
                "stage_name": ["Acorn Seedling", "Young Sapling", "Vibrant Branching Tree", "Great Ancient Oak"][tree_stage],
                "growth_percentage": min(100, (exercise_count % 3 + 1) * 33 if tree_stage < 3 else 100),
                "mesh_type": "tree",
                "color": "#16a34a",
                "position": {"x": -2.5, "y": 0, "z": -1.0},
                "scale": 0.6 + (tree_stage * 0.45)
            },
            {
                "id": "lotus_fountain",
                "name": "Lotus of Clarity",
                "habit_category": "water",
                "category_label": "Hydration",
                "growth_stage": water_lily_stage,
                "stage_name": ["Submerged Bud", "Floating Lily Pad", "Blooming Water Lily", "Crystal Lotus Fountain"][water_lily_stage],
                "growth_percentage": min(100, (water_count % 4 + 1) * 25 if water_lily_stage < 3 else 100),
                "mesh_type": "pond_lily",
                "color": "#06b6d4",
                "position": {"x": 0.0, "y": 0, "z": 0.5},
                "scale": 0.5 + (water_lily_stage * 0.35)
            },
            {
                "id": "blossom_field",
                "name": "Lavender Blossom Patch",
                "habit_category": "meditation",
                "category_label": "Mindfulness & Meditation",
                "growth_stage": flower_stage,
                "stage_name": ["Gentle Sprout", "Budding Lavender", "Purple Blossom Bed", "Radiant Zen Garden"][flower_stage],
                "growth_percentage": min(100, (meditation_count % 3 + 1) * 33 if flower_stage < 3 else 100),
                "mesh_type": "flowers",
                "color": "#a855f7",
                "position": {"x": 2.5, "y": 0, "z": -0.8},
                "scale": 0.5 + (flower_stage * 0.35)
            },
            {
                "id": "orchard_bush",
                "name": "Golden Berry Bush",
                "habit_category": "nutrition",
                "category_label": "Healthy Nutrition",
                "growth_stage": min(3, nutrition_count // 3),
                "stage_name": ["Wild Shrub", "Flowering Bush", "Berry Clusters", "Bountiful Golden Grove"][min(3, nutrition_count // 3)],
                "growth_percentage": min(100, (nutrition_count % 3 + 1) * 33),
                "mesh_type": "bush",
                "color": "#f59e0b",
                "position": {"x": 1.8, "y": 0, "z": 2.2},
                "scale": 0.5 + (min(3, nutrition_count // 3) * 0.3)
            }
        ]

        # Available decorations in shop
        decorations = [
            {"id": "zen_lantern", "name": "Stone Zen Lantern", "cost_seeds": 50, "unlocked": any(i.get("item_id") == "zen_lantern" for i in unlocked_items), "position": {"x": -1.2, "y": 0, "z": 2.0}},
            {"id": "wooden_bench", "name": "Cedar Resting Bench", "cost_seeds": 80, "unlocked": any(i.get("item_id") == "wooden_bench" for i in unlocked_items), "position": {"x": -2.8, "y": 0, "z": 1.5}},
            {"id": "firefly_swarm", "name": "Night Fireflies", "cost_seeds": 120, "unlocked": any(i.get("item_id") == "firefly_swarm" for i in unlocked_items), "position": {"x": 0.0, "y": 2.5, "z": 0.0}},
            {"id": "bird_bath", "name": "Marble Bird Sanctuary", "cost_seeds": 150, "unlocked": any(i.get("item_id") == "bird_bath" for i in unlocked_items), "position": {"x": 2.8, "y": 0, "z": 1.2}}
        ]

        return {
            "status": "success",
            "garden_level": garden_level,
            "seeds_balance": total_seeds_earned,
            "total_verified_habit_completions": total_completed,
            "environment_tier": environment_tier,
            "environment_description": ["Morning Dew Meadow", "Sunny Bloom Oasis", "Twilight Glow Garden", "Celestial Sanctuary"][environment_tier],
            "plants": plants,
            "decorations": decorations,
            "garden_philosophy": "Your garden never withers from missed days. It stays resting patiently until your next mindful action."
        }

    @classmethod
    def claim_reward(cls, user_id: str, item_id: str):
        now = datetime.now(timezone.utc)
        # Check if already owned
        existing = db_manager.garden_items.find_one({"user_id": user_id, "item_id": item_id})
        if existing:
            return {"status": "error", "message": "Item already unlocked in your garden!"}, 400

        doc = {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "item_id": item_id,
            "unlocked_at": now.isoformat()
        }
        db_manager.garden_items.insert_one(doc)
        return {"status": "success", "message": "Garden decoration unlocked and placed in your 3D sanctuary!", "item": doc}, 200
