import os
from flask import Flask, jsonify, send_from_directory, render_template_string
from flask_cors import CORS
from backend.config import Config
from backend.app.database import db_manager
from backend.app.utils.seed_data import seed_database_if_empty

def create_app(config_class=Config):
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
    app = Flask(__name__, static_folder=frontend_dist, static_url_path="")
    app.config.from_object(config_class)

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize seed data
    try:
        seed_database_if_empty()
    except Exception as e:
        print(f"[App Init] Warning initializing seed data: {e}")

    # Import Blueprints
    from backend.app.routes.auth_routes import auth_bp
    from backend.app.routes.user_routes import user_bp
    from backend.app.routes.habit_routes import habit_bp
    from backend.app.routes.drop_detection_routes import drop_bp
    from backend.app.routes.ai_coach_routes import ai_bp
    from backend.app.routes.analytics_routes import analytics_bp
    from backend.app.routes.gamification_routes import gamification_bp
    from backend.app.routes.challenge_routes import challenge_bp
    from backend.app.routes.reminder_routes import reminder_bp
    from backend.app.routes.privacy_routes import privacy_bp
    from backend.app.routes.mood_routes import mood_bp
    from backend.app.routes.prediction_routes import prediction_bp
    from backend.app.routes.digital_twin_routes import digital_twin_bp
    from backend.app.routes.routine_routes import routine_bp
    from backend.app.routes.garden_routes import garden_bp
    from backend.app.routes.wearable_routes import wearable_bp
    from backend.app.routes.notification_routes import notification_bp
    from backend.app.routes.voice_routes import voice_bp
    from backend.app.routes.goal_routes import goal_bp
    from backend.app.routes.docs_routes import docs_bp

    blueprints = [
        (auth_bp, "auth"),
        (user_bp, "users"),
        (habit_bp, "habits"),
        (drop_bp, "drop-detection"),
        (ai_bp, "ai"),
        (analytics_bp, "analytics"),
        (gamification_bp, "gamification"),
        (challenge_bp, "challenges"),
        (reminder_bp, "reminders"),
        (privacy_bp, "privacy"),
        (mood_bp, "mood"),
        (prediction_bp, "predictions"),
        (digital_twin_bp, "digital-twin"),
        (routine_bp, "routines"),
        (garden_bp, "garden"),
        (wearable_bp, "integrations"),
        (notification_bp, "notifications"),
        (voice_bp, "voice"),
        (goal_bp, "goals"),
        (docs_bp, "docs_api")
    ]

    # Register blueprints under both /api/v1 (primary standard) and /api (convenience alias)
    for bp, prefix in blueprints:
        app.register_blueprint(bp, url_prefix=f"/api/v1/{prefix}", name=f"v1_{prefix}")
        app.register_blueprint(bp, url_prefix=f"/api/{prefix}", name=f"default_{prefix}")

    @app.route("/api/health", methods=["GET"])
    @app.route("/api/v1/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "app": "HealthLoop API",
            "version": "2.0.0",
            "database": "MongoDB" if db_manager.is_connected_to_mongo else "Embedded Document Store",
            "gemini_api_configured": bool(Config.GEMINI_API_KEY)
        }), 200

    # OpenAPI spec direct links
    @app.route("/api/openapi.json", methods=["GET"])
    @app.route("/api/v1/openapi.json", methods=["GET"])
    def openapi_spec_route():
        from backend.app.routes.docs_routes import OPENAPI_SPEC
        return jsonify(OPENAPI_SPEC), 200

    @app.route("/api/docs", methods=["GET"])
    @app.route("/api/v1/docs", methods=["GET"])
    def swagger_ui_route():
        from backend.app.routes.docs_routes import SWAGGER_HTML
        return render_template_string(SWAGGER_HTML)

    # Serve React SPA frontend build if accessed directly
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        elif os.path.exists(os.path.join(app.static_folder, "index.html")):
            return send_from_directory(app.static_folder, "index.html")
        else:
            return jsonify({
                "message": "HealthLoop 2.0 API is online. Access Swagger UI at /api/v1/docs."
            })

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"status": "error", "message": "API endpoint not found."}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"status": "error", "message": "Internal server error occurred."}), 500

    return app
