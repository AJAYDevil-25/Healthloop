# HEALTHLOOP 2.0 — REST API REFERENCE

All endpoints are available under `/api/v1` (primary standard) and `/api` (compatibility alias).

Interactive Swagger UI: `http://localhost:5000/api/v1/docs`  
OpenAPI 3.0.3 Specification: `http://localhost:5000/api/v1/openapi.json`  
Authentication: `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication & Session Management
- `POST /api/v1/auth/register`: Create user account and initialize default starter habits.
- `POST /api/v1/auth/login`: Authenticate email and password, returns JWT token.
- `POST /api/v1/auth/guest-login`: Instant sandboxed evaluator session with realistic pre-seeded data.
- `POST /api/v1/auth/logout`: Invalidate session.
- `POST /api/v1/auth/forgot-password`: Send password reset instructions.
- `GET /api/v1/auth/me`: Get authenticated user identity.

## 2. User Profile
- `GET /api/v1/users/profile`: Retrieve user profile, biometrics, and notification settings.
- `PUT /api/v1/users/profile`: Update biometrics, display name, and preferences.

## 3. Habit Tracking & Daily Logs
- `GET /api/v1/habits`: List all active habits for the authenticated user.
- `POST /api/v1/habits`: Create a new custom habit.
- `PUT /api/v1/habits/{id}`: Update habit parameters.
- `DELETE /api/v1/habits/{id}`: Archive/delete habit.
- `POST /api/v1/habits/{id}/logs`: Log habit completion or numeric value for today/specific date.
- `GET /api/v1/habits/summary/today`: Get consolidated summary of today's health habits and targets.

## 4. Feature 01 — AI Habit Prediction Engine
- `GET /api/v1/predictions/habits`: Run statistical habit interruption risk model; returns interruption probability %, risk tier (Low/Moderate/High), contributing factors, confidence ratings, and actionable preventive tips.

## 5. Feature 02 — JITAI Smart Moment Reminders & Notifications
- `GET /api/v1/notifications`: Retrieve notification stream, unread count, and current quiet hours preferences.
- `PUT /api/v1/notifications/{id}/read`: Mark notification as read (or `{id}` = `all`).
- `PUT /api/v1/notifications/preferences`: Update quiet hours window (start/end) and intervention toggle switches.
- `GET /api/v1/reminders`: List scheduled habit reminders.
- `POST /api/v1/reminders`: Create custom reminder schedule.
- `PUT /api/v1/reminders/{id}`: Edit reminder time and days.
- `DELETE /api/v1/reminders/{id}`: Delete reminder.

## 6. Feature 03 — Mood-Based AI Coach
- `POST /api/v1/mood/checkin`: Record voluntary mood state (`Happy`, `Neutral`, `Tired`, `Stressed`, `Sad`, `Energetic`), energy level (1-5), and optional notes. Returns empathetic AI wellness suggestion and safety crisis disclaimer if in distress.
- `GET /api/v1/mood/history`: Retrieve mood history, mood distribution, and correlation with habit completion rates.
- `POST /api/v1/ai/chat`: Interactive chat with the Gemini AI Coach (lifestyle and behavioral psychology guidance).
- `POST /api/v1/ai/analyse`: Behavioral pattern analysis query.
- `GET /api/v1/ai/daily-suggestions`: AI-generated micro-action suggestions for today.

## 7. Feature 04 — Personal Health Digital Twin
- `GET /api/v1/digital-twin`: Retrieve user's verified baseline behavioral twin profile (Stamina Index, Recovery Index, Clarity Index, habit consistency).
- `POST /api/v1/digital-twin/simulate`: Run hypothetical what-if scenario simulations (walking mins, sleep target, extra water, consistency target) and generate projected trajectory over 14-90 days.

## 8. Feature 05 — Adaptive Goal Generator
- `GET /api/v1/goals/adaptive`: Analyze recent 14-day completion curves and return achievable step-down recovery or level-up progression recommendations.
- `POST /api/v1/goals/adaptive/action`: User control endpoint to `accept`, `reject`, or `modify` recommendations.

## 9. Feature 06 — Healthy Impact Score
- `GET /api/v1/analytics/impact-score`: Calculate transparent Healthy Impact Score: `(Weighted completed habit ratios / Total applicable weights) * 100`. Returns contributing habits table, weights used, and 7-day trend.
- `POST /api/v1/analytics/impact-score/weights`: Update customizable importance weights for exercise, water, sleep, nutrition, meditation, and general habits.

## 10. Feature 07 — Voice-Based AI Assistant
- `POST /api/v1/voice/command`: Process natural speech transcripts, classify habit logging intent, and generate confirmation prompt.
- `POST /api/v1/voice/confirm`: Execute verified voice command action and persist habit record.

## 11. Feature 08 — Wearable Device Integration
- `GET /api/v1/integrations/status`: Get connection status for Google Health Connect and Apple Health, plus recent imported records.
- `POST /api/v1/integrations/import`: Ingest activity records via JSON/CSV with automatic schema validation and duplicate detection.
- `POST /api/v1/integrations/connect`: Connect companion bridge provider.
- `POST /api/v1/integrations/disconnect`: Disconnect companion bridge provider.

## 12. Feature 09 — Smart Healthy Routine Planner
- `GET /api/v1/routines`: Retrieve active and saved daily routines.
- `POST /api/v1/routines/generate`: Generate circadian-aligned morning, afternoon, evening, and sleep prep schedule based on user's availability and active habits.
- `PUT /api/v1/routines/{id}`: Edit and save routine time blocks.

## 13. Feature 10 — Virtual Habit Garden
- `GET /api/v1/garden`: Retrieve Three.js 3D garden state, plant growth stages (Oak, Lotus, Lavender), seeds balance, and garden level.
- `POST /api/v1/garden/rewards`: Unlock and place garden sanctuary decorations with earned seeds.

## 14. Gamification & Challenges
- `GET /api/v1/gamification/overview`: Points, streaks, levels, and unlocked achievement badges.
- `GET /api/v1/gamification/leaderboard`: Optional community leaderboard rankings.
- `GET /api/v1/challenges`: Community challenges (7-Day Walking, 21-Day Habit, 30-Day Hydration).
- `POST /api/v1/challenges/{id}/join`: Join a challenge.

## 15. Privacy & Data Control
- `GET /api/v1/privacy/export-data`: Complete JSON data export of all user records.
- `POST /api/v1/privacy/consent`: Update AI data minimization consent.
- `DELETE /api/v1/privacy/delete-data`: Permanent GDPR/CCPA-compliant account and data deletion.
