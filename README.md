# HEALTHLOOP 2.0
### AI-Powered Healthy Behaviour Monitoring, Prediction & Motivation Platform

> **TAGLINE: Build Healthy Habits. Sustain a Better Life.**

---

## 🌟 Executive Overview & Project Vision

HealthLoop 2.0 is an intelligent digital wellness platform engineered to help people develop and sustain healthy behaviours over the long term.

Unlike passive fitness trackers that only record numbers, HealthLoop 2.0 acts as an active behavioural partner:
- **Tracks daily healthy habits** with effortless interaction and multi-ring visualization.
- **Identifies unhealthy behaviour patterns** and declining consistency before habits are abandoned.
- **Predicts habit interruptions** through a transparent statistical and rule-based machine learning model.
- **Delivers timely adaptive behavioural interventions (JITAI)** that respect user quiet hours.
- **Provides personalized AI wellness suggestions** powered by Google Gemini API with robust offline fallback.
- **Adapts goals dynamically** based on user performance (step-down recovery and gradual progression).
- **Simulates long-term behavioural trajectories** with a WebGL Three.js **Personal Health Digital Twin**.
- **Visualizes lifestyle consistency** in a 3D **Virtual Habit Garden** where plants grow with verified actions.
- **Encourages consistency** using an evidence-based gamification tier and social challenges.

*Note: HealthLoop 2.0 is a wellness-support platform, not a medical diagnostic or treatment system.*

---

## 🛠 Technology Stack

### Frontend:
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **3D Graphics Engine**: Three.js (WebGL interactive Digital Twin and 3D Virtual Garden)
- **Data Visualization**: Chart.js & React-Chartjs-2 (Dual-wave curves, progress gauges, trends)
- **Audio & Speech**: Web Speech API (SpeechRecognition & SpeechSynthesis with text fallback)
- **Icons & Effects**: Lucide React, Canvas Confetti

### Backend:
- **Framework**: Python 3.12 + Flask
- **API Architecture**: Flask RESTful API under `/api/v1` with `/api` compatibility aliases
- **CORS**: Flask-CORS with credentials support
- **Authentication**: Secure JWT (HS256) with BCrypt password hashing + Isolated Guest Demo Sandbox
- **AI Engine**: Google Gemini API (`gemini-1.5-flash`) + Resilient Contextual Fallback Coach
- **Database Driver**: PyMongo + Transparent local document engine fallback for zero-friction setup

### Database:
- **MongoDB Atlas / Live Daemon**: 18 structured collections with indexing and schema validation
- **Data Integrity**: Duplicate detection engine for wearable and activity data ingestion

---

## 🚀 The 10 Innovative Features

### 1. Feature 01 — AI Habit Prediction Engine
- Analyzes 30-day historical habit logs, variance, and day-of-week patterns (e.g. weekend vs weekday adherence).
- Computes habit interruption probability (%) for upcoming days.
- Reports transparent statistical confidence (High, Moderate, Low) based on sample depth.
- Displays explicit contributing risk factors and actionable preventive tips.

### 2. Feature 02 — Smart Moment Reminder (JITAI)
- Just-in-Time Adaptive Intervention engine considering user schedule, recent inactivity, and missed goals.
- Enforces strict user quiet hours (e.g. 22:00 – 07:00) and rate-limiting (max 1 nudge per category per 3 hours).
- Provides non-judgmental, micro-salvage interventions without guilt-based messaging.

### 3. Feature 03 — Mood-Based AI Coach
- Emotional check-in: *Happy, Neutral, Tired, Stressed, Sad, Energetic* with energy level (1-5) and notes.
- Correlates daily mood records with habit completion rates.
- Generates supportive non-clinical wellness coaching via Google Gemini API with crisis resource disclaimers.

### 4. Feature 04 — Personal Health Digital Twin
- Virtual behavioural profile modeling verified baseline Stamina, Recovery, and Clarity indices.
- Interactive WebGL Three.js **3D Energy Core** that pulses in sync with biological equilibrium.
- **Simulation Engine**: Test hypothetical what-if scenarios (e.g. "What if I walk 20 min daily and sleep 8 hours?").
- Clearly labels all projections as hypothetical estimates distinct from verified historical records.

### 5. Feature 05 — Adaptive Goal Generator
- Evaluates recent 14-day completion velocity:
  - Suggests **Step-Down Recovery Goals** after missed days to rebuild self-efficacy.
  - Suggests **Level-Up Progression Goals** after consistent 85%+ streaks.
- Autonomous user control: user can Accept, Dismiss, or Edit any target with full sovereignty.

### 6. Feature 06 — Healthy Impact Score
- Transparent consistency score calculated using the prompt formula:
  $$\text{Healthy Impact Score} = \left(\frac{\sum \text{Weighted Completed Habit Ratios}}{\text{Total Applicable Weights}}\right) \times 100$$
- Missing data is never treated as punitive failure.
- Customizable importance weights for exercise, water, sleep, nutrition, and meditation.

### 7. Feature 07 — Voice-Based AI Assistant
- Hands-free natural speech check-in powered by the Web Speech API.
- Voice commands: *"I walked for 20 minutes"*, *"I drank 500ml water"*, *"How is my streak?"*.
- Mandatory confirmation guard: prompts the user before writing or modifying any records.
- Text input fallback for environments without microphone support.

### 8. Feature 08 — Wearable Device Integration
- Connect toggles for Google Health Connect (Android Bridge) and Apple Health (iOS HealthKit).
- Ingests Steps, Active Minutes, Sleep Duration, and Exercise logs via JSON/CSV upload.
- **Duplicate Detection Engine**: Automatically flags and skips duplicate records for the same day and metric.
- Honest architectural disclosure of browser sandbox boundaries.

### 9. Feature 09 — Smart Healthy Routine Planner
- Circadian-aligned daily schedule generator based on user availability (wake time, sleep time, work blocks).
- Structures morning awakening, afternoon pacing, evening decompression, and sleep preparation routines.
- Allows users to customize, edit, and approve their active daily schedule.

### 10. Feature 10 — Virtual Habit Garden (Three.js 3D)
- Interactive 3D WebGL living sanctuary rendered with Three.js.
- Every verified habit contributes to biological flora:
  - Exercise = Tree growth (*Oak of Vitality*)
  - Hydration = Water lilies & crystal pond (*Lotus of Clarity*)
  - Meditation = Lavender blossom beds (*Zen Sanctuary*)
- Earned seeds and unlockable decorations (Cedar Bench, Stone Lantern, Fireflies).
- **Non-punitive guarantee**: Missed days never wither or destroy the garden.

---

## 📑 22 Frontend Pages

1. **Landing Page** (`/`): Value proposition, hero banner, feature showcase, dual CTAs.
2. **Registration Page** (`/register`): User account onboarding and profile initialization.
3. **Login Page** (`/login`): Secure JWT authentication and password assistance.
4. **Guest Demo** (`/guest-demo`): 1-click isolated evaluator sandbox access with realistic pre-seeded data.
5. **Main Dashboard** (`/dashboard`): Welcome greeting, Healthy Impact Score, dual-wave activity curve, progress gauges, calendar, and schedule.
6. **Daily Habit Tracker** (`/habits`): Habit CRUD, status toggling, confetti effects, and frequency scheduling.
7. **AI Health Coach** (`/ai-coach`): Interactive chat with Gemini AI coach and daily micro-suggestions.
8. **Mood Check-in** (`/mood-checkin`): Emotional logging, energy levels, mood distribution, and habit correlations.
9. **Habit Prediction** (`/habit-prediction`): AI habit interruption matrix, risk tiers, and preventive plans.
10. **Behaviour Analytics** (`/analytics`): Deep dive charts, completion rates, category breakdowns, and trends.
11. **Digital Twin** (`/digital-twin`): 3D Three.js energy core and what-if scenario simulation engine.
12. **Adaptive Goals** (`/adaptive-goals`): Step-down recovery and progressive challenge generator with accept/edit controls.
13. **Healthy Impact Score** (`/impact-score`): Transparent formula breakdown, contributing table, and weight customizer.
14. **Voice Assistant** (`/voice-assistant`): Web Speech voice logger with mandatory confirmation guard and speech synthesis.
15. **Wearable Integration** (`/wearables`): Google Health Connect / Apple Health bridge and JSON/CSV ingestion.
16. **Routine Planner** (`/routine-planner`): Circadian time-blocked daily wellness schedule builder.
17. **Virtual Garden** (`/virtual-garden`): Interactive 3D WebGL garden driven by verified habit logs.
18. **Social Challenges** (`/challenges`): 7-Day Walking, 21-Day Habit, 30-Day Hydration challenges with leaderboards.
19. **Achievements** (`/achievements`): Badges, milestone unlocks, streak celebrations, and user tier levels.
20. **Notifications** (`/notifications`): JITAI smart moment notification stream and quiet-hours configuration.
21. **User Profile** (`/profile`): Biometrics, target adjustments, and personal wellness goals.
22. **Privacy and Security Settings** (`/privacy`): AI consent toggles, JSON data export, and permanent data deletion.

---

## 🗄 MongoDB Database Architecture (18 Collections)

| Collection | Description | Primary Key & Indexes |
|---|---|---|
| `users` | User credentials & authentication | `_id`, `email` (unique) |
| `user_profiles` | Biometrics, weights, & preferences | `_id`, `user_id` (unique) |
| `habits` | Active & custom habit targets | `_id`, `user_id`, `category` |
| `habit_logs` | Daily verified completion entries | `_id`, `user_id + habit_id + date` (unique) |
| `goals` | Adaptive targets & progression states | `_id`, `user_id`, `status` |
| `mood_logs` | Emotional check-in states & reflections | `_id`, `user_id`, `timestamp` |
| `predictions` | Interruption risk probability matrices | `_id`, `user_id`, `generated_at` |
| `interventions` | JITAI nudge dispatches & actions | `_id`, `user_id`, `dispatched_at` |
| `ai_conversations` | Dialogue logs with the AI Coach | `_id`, `user_id`, `timestamp` |
| `routine_plans` | Circadian daily routine schedules | `_id`, `user_id`, `is_active` |
| `digital_twins` | Simulation scenarios & baseline twins | `_id`, `user_id`, `simulated_at` |
| `scores` | Healthy Impact Score historical snapshots | `_id`, `user_id + date` (unique) |
| `garden_items` | Unlocked Three.js 3D garden decorations | `_id`, `user_id + item_id` (unique) |
| `achievements` | Badges & unlock timestamps | `_id`, `user_id + code` |
| `challenges` | Community social wellness challenges | `_id`, `created_at` |
| `challenge_participants` | User challenge enrollment & progress | `_id`, `challenge_id + user_id` (unique) |
| `wearable_records` | Ingested sensor activity records | `_id`, `user_id + date + type + source` (unique) |
| `notifications` | Stream of reminders & quiet hour nudges | `_id`, `user_id`, `created_at` |

---

## 🧪 Automated Testing Suite

The backend includes a comprehensive automated test suite covering all core logic, authentication, and the 10 innovative features:

```bash
# Run the complete test suite
python -m pytest backend/tests -v
```

### Test Results:
```
============================= test session starts =============================
platform win32 -- Python 3.12.10, pytest-9.1.1, pluggy-1.6.0
collected 20 items

backend/tests/test_features.py ...........                               [ 55%]
backend/tests/test_healthloop.py .........                               [100%]

============================= 20 passed in 4.15s ==============================
```

Verified test coverage includes:
- User registration, login, and isolated guest access.
- Habit CRUD, streak calculations, and daily logging.
- AI Habit Prediction engine interruption probability calculations.
- Three.js Personal Health Digital Twin baseline and what-if simulations.
- Adaptive Goal Generator step-down and progression recommendations.
- Transparent Healthy Impact Score formula calculation and weight updates.
- Mood check-in and correlation analysis.
- Virtual Habit Garden state and decoration unlocking.
- Wearable activity data ingestion and duplicate detection.
- Routine Planner daily schedule generation.
- Voice Assistant natural speech parsing and confirmation execution.
- JITAI notifications and quiet-hours enforcement.
- OpenAPI specification and Swagger UI availability.

---

## 🏃 Quick Start & Execution

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- (Optional) MongoDB daemon or Atlas connection URI.
- (Optional) Google Gemini API Key.

### 2. Run the Backend
```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Run backend API server
python -m backend.run
```
- API Server: `http://localhost:5000/api/v1`
- Interactive Swagger UI: `http://localhost:5000/api/v1/docs`
- OpenAPI Specification: `http://localhost:5000/api/v1/openapi.json`

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:3000` or `http://localhost:5173`.

### 4. Build for Production
```bash
cd frontend
npm run build
```
The compiled SPA is emitted to `frontend/dist` and can be served directly by Flask or deployed to Vercel/Netlify.

---

## 🚢 Deployment Architecture

- **Frontend**: Deployable to **Vercel** or **Netlify** with single-page routing rewrite to `index.html`.
- **Backend**: Deployable to **Render**, **Railway**, or **Google Cloud Run** using `gunicorn "backend.app:create_app()"`.
- **Database**: **MongoDB Atlas** M0/M10 cluster with automated backups and TLS encryption.
- **Environment Secrets**: Configure `SECRET_KEY`, `JWT_SECRET_KEY`, `MONGO_URI`, and `GEMINI_API_KEY` in deployment environment variables.

---

## 📜 Ethical & Compliance Mandates
1. **Wellness Scope**: HealthLoop is an evidence-informed wellness support tool, not a clinical diagnostic system.
2. **Data Minimization**: AI prompts strictly receive anonymized habit statistics; personal identifiers are never forwarded to AI providers.
3. **User Sovereignty**: HealthLoop never alters user goals automatically without explicit confirmation.
4. **Data Ownership**: Users can export their full records in `.json` format or permanently delete their account at any time.

---

*HealthLoop 2.0 Architectural Engineering Team — Built with Precision, Empathy, and Scientific Rigor.*
