from flask import Blueprint, request, jsonify
from backend.app.services.gemini_service import GeminiService
from backend.app.services.habit_service import HabitService
from backend.app.utils.decorators import token_required
from backend.app.database import db_manager

ai_bp = Blueprint("ai_coach", __name__)

@ai_bp.route("/chat", methods=["POST"])
@token_required
def chat():
    data = request.get_json() or {}
    message = data.get("message", "").strip()
    if not message:
        return jsonify({"status": "error", "message": "Message is required."}), 400

    # Build context summary from today's data
    summary = HabitService.get_today_summary(request.user_id)
    drops = list(db_manager.db["behaviour_drops"].find({"user_id": request.user_id, "status": "detected"}))
    dropped_names = [d.get("habit_title") for d in drops]

    context_summary = f"""
    User: {request.current_user.get('username')}
    Health Score Today: {summary.get('health_score')}/100
    Completed Habits: {summary.get('completed_habits')}/{summary.get('total_habits')}
    Water Logged: {summary.get('water', {}).get('achieved')} / {summary.get('water', {}).get('target')} ml
    Sleep Logged: {summary.get('sleep', {}).get('achieved')} hours
    Steps Logged: {summary.get('steps', {}).get('achieved')} steps
    Recent Behaviour Drops: {', '.join(dropped_names) if dropped_names else 'None detected!'}
    """

    response_text = GeminiService.call_gemini(message, context_summary)
    
    # Store recommendation
    db_manager.ai_recommendations.insert_one({
        "user_id": request.user_id,
        "type": "chat_response",
        "user_query": message,
        "response": response_text
    })

    return jsonify({
        "status": "success",
        "reply": response_text
    }), 200

@ai_bp.route("/daily-suggestions", methods=["GET"])
@token_required
def daily_suggestions():
    suggestions = GeminiService.get_daily_suggestions(request.user_id)
    return jsonify({"status": "success", "suggestions": suggestions}), 200

@ai_bp.route("/weekly-summary", methods=["GET"])
@token_required
def weekly_summary():
    summary = GeminiService.get_weekly_wellness_summary(request.user_id)
    return jsonify({"status": "success", "summary": summary}), 200

@ai_bp.route("/analyse", methods=["POST"])
@ai_bp.route("/analyze", methods=["POST"])
@token_required
def analyse_behaviour():
    data = request.get_json() or {}
    query = data.get("query", "Analyze my recent habit patterns and give 3 key optimizations.")
    summary = HabitService.get_today_summary(request.user_id)
    analysis = GeminiService.call_gemini(query, f"Habit Summary: {summary}")
    return jsonify({
        "status": "success",
        "analysis": analysis,
        "disclaimer": "AI recommendations are lifestyle suggestions and not clinical medical diagnoses."
    }), 200
