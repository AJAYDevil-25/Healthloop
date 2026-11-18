from flask import Blueprint, jsonify, render_template_string

docs_bp = Blueprint("docs", __name__)

OPENAPI_SPEC = {
    "openapi": "3.0.3",
    "info": {
        "title": "HealthLoop 2.0 REST API",
        "description": "API-Powered Healthy Behaviour Monitoring, Prediction & Motivation Platform",
        "version": "2.0.0",
        "contact": {
            "name": "HealthLoop Architectural Engineering Team"
        }
    },
    "servers": [
        {"url": "/api/v1", "description": "Version 1 Primary API Server"},
        {"url": "/api", "description": "Compatibility Alias"}
    ],
    "tags": [
        {"name": "Auth", "description": "Authentication and user session management"},
        {"name": "Users", "description": "User profile and settings"},
        {"name": "Habits", "description": "Habit management and daily logging"},
        {"name": "Predictions", "description": "AI habit interruption prediction engine"},
        {"name": "Reminders", "description": "JITAI adaptive interventions & notifications"},
        {"name": "Mood", "description": "Mood check-ins and AI wellness suggestions"},
        {"name": "Digital Twin", "description": "Virtual behavioral twin simulation engine"},
        {"name": "Adaptive Goals", "description": "Achievable goal generation and progression"},
        {"name": "Impact Score", "description": "Healthy Impact Score calculation & customization"},
        {"name": "Voice", "description": "Web Speech API voice habit commands & logging"},
        {"name": "Wearables", "description": "Activity data import and integration status"},
        {"name": "Routines", "description": "Personalized daily routine planner"},
        {"name": "Garden", "description": "Virtual 3D habit garden state and rewards"},
        {"name": "Challenges", "description": "Social wellness challenges and leaderboards"},
        {"name": "Gamification", "description": "Badges, levels, and point rewards"}
    ],
    "paths": {
        "/auth/register": {
            "post": {
                "tags": ["Auth"],
                "summary": "Register a new user account",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "username": {"type": "string"},
                                    "email": {"type": "string"},
                                    "password": {"type": "string"}
                                },
                                "required": ["username", "email", "password"]
                            }
                        }
                    }
                },
                "responses": {"201": {"description": "User created"}, "400": {"description": "Invalid input"}}
            }
        },
        "/auth/login": {
            "post": {
                "tags": ["Auth"],
                "summary": "Authenticate user and issue JWT token",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "email": {"type": "string"},
                                    "password": {"type": "string"}
                                },
                                "required": ["email", "password"]
                            }
                        }
                    }
                },
                "responses": {"200": {"description": "Login successful"}, "401": {"description": "Invalid credentials"}}
            }
        },
        "/auth/guest-login": {
            "post": {
                "tags": ["Auth"],
                "summary": "Instant sandboxed guest demo session with rich realistic data",
                "responses": {"200": {"description": "Guest session created"}}
            }
        },
        "/auth/logout": {
            "post": {
                "tags": ["Auth"],
                "summary": "Terminate user session",
                "responses": {"200": {"description": "Logged out"}}
            }
        },
        "/users/profile": {
            "get": {
                "tags": ["Users"],
                "summary": "Get authenticated user profile",
                "responses": {"200": {"description": "User profile data"}}
            },
            "put": {
                "tags": ["Users"],
                "summary": "Update user profile",
                "responses": {"200": {"description": "Profile updated"}}
            }
        },
        "/habits": {
            "get": {
                "tags": ["Habits"],
                "summary": "List all active habits for user",
                "responses": {"200": {"description": "List of habits"}}
            },
            "post": {
                "tags": ["Habits"],
                "summary": "Create a new habit",
                "responses": {"201": {"description": "Habit created"}}
            }
        },
        "/habits/{id}/logs": {
            "post": {
                "tags": ["Habits"],
                "summary": "Log completion or numeric value for a habit",
                "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "string"}}],
                "responses": {"200": {"description": "Habit logged"}}
            }
        },
        "/predictions/habits": {
            "get": {
                "tags": ["Predictions"],
                "summary": "Retrieve AI habit interruption predictions and preventive tips",
                "responses": {"200": {"description": "Predictions dataset"}}
            }
        },
        "/digital-twin": {
            "get": {
                "tags": ["Digital Twin"],
                "summary": "Retrieve current virtual behavioral twin profile",
                "responses": {"200": {"description": "Digital twin baseline"}}
            }
        },
        "/digital-twin/simulate": {
            "post": {
                "tags": ["Digital Twin"],
                "summary": "Execute hypothetical what-if behavioral simulation",
                "responses": {"200": {"description": "Simulation trajectory results"}}
            }
        },
        "/analytics/impact-score": {
            "get": {
                "tags": ["Impact Score"],
                "summary": "Calculate transparent Healthy Impact Score and breakdown",
                "responses": {"200": {"description": "Impact score breakdown"}}
            }
        },
        "/garden": {
            "get": {
                "tags": ["Garden"],
                "summary": "Retrieve 3D Three.js habit garden state and plants",
                "responses": {"200": {"description": "Garden state"}}
            }
        },
        "/mood/checkin": {
            "post": {
                "tags": ["Mood"],
                "summary": "Log daily mood with energy level and notes",
                "responses": {"201": {"description": "Mood recorded"}}
            }
        },
        "/voice/command": {
            "post": {
                "tags": ["Voice"],
                "summary": "Process speech transcript and generate confirmation prompt",
                "responses": {"200": {"description": "Voice command parsed"}}
            }
        },
        "/integrations/import": {
            "post": {
                "tags": ["Wearables"],
                "summary": "Import activity records via JSON/CSV with duplicate detection",
                "responses": {"200": {"description": "Records imported"}}
            }
        },
        "/routines/generate": {
            "post": {
                "tags": ["Routines"],
                "summary": "Generate personalized healthy daily routine",
                "responses": {"201": {"description": "Routine generated"}}
            }
        }
    }
}

SWAGGER_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>HealthLoop 2.0 API Documentation (Swagger)</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; background: #f8fafc; }
    .topbar { display: none !important; }
    .swagger-ui .info { margin: 20px 0; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url: '/api/v1/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>
"""

@docs_bp.route("/openapi.json", methods=["GET"])
def openapi_json():
    return jsonify(OPENAPI_SPEC), 200

@docs_bp.route("/docs", methods=["GET"])
def swagger_ui():
    return render_template_string(SWAGGER_HTML)
