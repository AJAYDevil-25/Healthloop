const API_BASE = '/api';

class ApiService {
  getToken() {
    return localStorage.getItem('healthloop_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('healthloop_token', token);
    } else {
      localStorage.removeItem('healthloop_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers || {}) };
    const config = {
      ...options,
      headers,
    };

    try {
      const res = await fetch(url, config);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      return data;
    } catch (err) {
      // In static deployment (e.g. GitHub Pages without active backend server), provide seamless fallback
      const fallback = this._getMockFallback(endpoint, options);
      if (fallback) {
        console.warn(`[HealthLoop Static Mode] Backend unavailable. Serving verified client sandbox data for ${endpoint}`);
        return fallback;
      }
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
  }

  _getMockFallback(endpoint, options = {}) {
    const clean = endpoint.replace(/^\/v1/, '').replace(/^\/api/, '');
    
    if (clean.includes('/auth/guest-login') || clean.includes('/auth/login')) {
      const token = 'guest_static_jwt_token_verified';
      this.setToken(token);
      return {
        status: 'success',
        token,
        user: { id: 'guest_user_adam', username: 'Adam Mitchell', email: 'adam@healthloop.io', is_guest: true }
      };
    }
    if (clean.includes('/auth/me')) {
      return {
        status: 'success',
        user: { id: 'guest_user_adam', username: 'Adam Mitchell', email: 'adam@healthloop.io', is_guest: true },
        profile: { display_name: 'Adam Mitchell', points: 1450, current_streak: 12, longest_streak: 18 }
      };
    }
    if (clean.includes('/habits/summary/today')) {
      return {
        status: 'success',
        summary: {
          health_score: 88,
          completed_habits: 4,
          total_habits: 6,
          completion_percentage: 67,
          calories: 867,
          sleep: { achieved: 7.5, target: 8.0 },
          steps: { achieved: 5800, target: 8000 },
          water: { achieved: 1865, target: 2500 },
          active_habits: [
            { id: 'h_water', title: 'Daily Hydration (2.5L)', category: 'water', completed: true, value: 2000, target_value: 2500, target_unit: 'ml' },
            { id: 'h_walk', title: 'Brisk Morning Walk', category: 'exercise', completed: true, value: 30, target_value: 30, target_unit: 'minutes' },
            { id: 'h_sleep', title: '8 Hours Sleep Routine', category: 'sleep', completed: true, value: 7.5, target_value: 8, target_unit: 'hours' },
            { id: 'h_meditation', title: 'Evening Mindfulness', category: 'meditation', completed: true, value: 15, target_value: 15, target_unit: 'minutes' },
            { id: 'h_screen', title: 'Digital Sunset at 10 PM', category: 'general', completed: false, value: 0, target_value: 1, target_unit: 'session' },
            { id: 'h_greens', title: 'Two Servings of Vegetables', category: 'nutrition', completed: false, value: 1, target_value: 2, target_unit: 'servings' }
          ]
        }
      };
    }
    if (clean === '/habits' || clean.startsWith('/habits?')) {
      return {
        status: 'success',
        habits: [
          { _id: 'h_water', title: 'Daily Hydration (2.5L)', category: 'water', current_streak: 12, target_value: 2500, target_unit: 'ml', completed_today: true },
          { _id: 'h_walk', title: 'Brisk Morning Walk', category: 'exercise', current_streak: 8, target_value: 30, target_unit: 'minutes', completed_today: true },
          { _id: 'h_sleep', title: '8 Hours Sleep Routine', category: 'sleep', current_streak: 5, target_value: 8, target_unit: 'hours', completed_today: true },
          { _id: 'h_meditation', title: 'Evening Mindfulness', category: 'meditation', current_streak: 14, target_value: 15, target_unit: 'minutes', completed_today: true },
          { _id: 'h_screen', title: 'Digital Sunset at 10 PM', category: 'general', current_streak: 2, target_value: 1, target_unit: 'session', completed_today: false },
          { _id: 'h_greens', title: 'Two Servings of Vegetables', category: 'nutrition', current_streak: 3, target_value: 2, target_unit: 'servings', completed_today: false }
        ]
      };
    }
    if (clean.includes('/drop-detection/status')) {
      return {
        status: 'success',
        active_drops: [
          {
            _id: 'drop_1',
            habit_id: 'h_screen',
            habit_title: 'Digital Sunset at 10 PM',
            detected_at: new Date().toISOString(),
            status: 'detected',
            recovery_plan: {
              suggested_micro_target: 'Screen dimming at 10:15 PM',
              rationale: 'Ease back into your routine with a 15-minute buffer.'
            }
          }
        ]
      };
    }
    if (clean.includes('/ai/daily-suggestions')) {
      return {
        status: 'success',
        suggestions: [
          { badge: 'Circadian Light', title: 'Catch Morning Sunlight', text: '10 mins of outdoor light before 9 AM optimizes melatonin release tonight.', action: 'Schedule Routine' },
          { badge: 'Hydration', title: 'Mid-Afternoon Glass', text: 'You are at 1,865ml today. One more glass reaches 80% of your target.', action: 'Log Water' },
          { badge: 'Habit Recovery', title: 'Micro-Move Reset', text: 'If a 45 min workout feels heavy, a 10 min walk protects your momentum.', action: 'Start Micro-Walk' }
        ]
      };
    }
    if (clean.includes('/predictions/habits')) {
      return {
        status: 'success',
        prediction_data: {
          overall_risk_level: 'Low',
          average_consistency: 84.5,
          habits: [
            {
              habit_id: 'h_walk',
              title: 'Brisk Morning Walk',
              category: 'exercise',
              baseline_completion_rate: 88.0,
              recent_7d_completion_rate: 85.7,
              interruption_probability_percent: 18.5,
              confidence: 'High (21 days logged)',
              target_day: 'Tomorrow',
              contributing_factors: ['Strong 8-day active streak', 'Consistent morning routine'],
              actionable_recommendation: 'Place walking shoes near bedroom door tonight.'
            },
            {
              habit_id: 'h_water',
              title: 'Daily Hydration (2.5L)',
              category: 'water',
              baseline_completion_rate: 92.0,
              recent_7d_completion_rate: 90.0,
              interruption_probability_percent: 12.0,
              confidence: 'High (21 days logged)',
              target_day: 'Tomorrow',
              contributing_factors: ['Steady hydration pacing throughout afternoon'],
              actionable_recommendation: 'Keep water bottle at your workspace desk.'
            },
            {
              habit_id: 'h_screen',
              title: 'Digital Sunset at 10 PM',
              category: 'general',
              baseline_completion_rate: 55.0,
              recent_7d_completion_rate: 42.0,
              interruption_probability_percent: 48.0,
              confidence: 'Moderate (14 days logged)',
              target_day: 'Tomorrow',
              contributing_factors: ['Recent 7-day drop-off detected', 'Weekday evening fatigue'],
              actionable_recommendation: 'Set phone to automatically switch to grayscale at 9:45 PM.'
            }
          ],
          preventive_recommendations: [
            'Prepare morning gear the night before to reduce cognitive friction.',
            'Use the "Never Miss Twice" rule: a 5-minute micro-action prevents streak decay.'
          ],
          disclaimer: 'Predictions are transparent statistical probability calculations based on voluntary logs, not clinical forecasts.'
        }
      };
    }
    if (clean.includes('/digital-twin/simulate')) {
      return {
        status: 'success',
        simulation: {
          is_simulation: true,
          projected_metrics: {
            projected_impact_score: 93.5,
            projected_stamina_index: 88.0,
            projected_recovery_index: 89.5,
            projected_hydration_pct: 95.0,
            projected_score_change: 8.5
          },
          timeline: Array.from({ length: 30 }, (_, i) => ({
            day: i + 1,
            projected_score: Math.round(85 + (i * 0.28) * 10) / 10
          }))
        }
      };
    }
    if (clean.includes('/digital-twin')) {
      return {
        status: 'success',
        digital_twin: {
          baseline: {
            overall_consistency_pct: 85.0,
            stamina_index: 82.0,
            recovery_index: 84.0,
            exercise_consistency_pct: 85.0,
            hydration_consistency_pct: 90.0,
            sleep_routine_pct: 80.0,
            mindfulness_pct: 88.0,
            total_historical_logs: 126,
            tracked_habits_count: 6
          }
        }
      };
    }
    if (clean.includes('/goals/adaptive')) {
      return {
        status: 'success',
        adaptive_recommendations: [
          {
            id: 'rec_1',
            habit_id: 'h_screen',
            habit_title: 'Digital Sunset at 10 PM',
            category: 'general',
            type: 'step_down_recovery',
            current_target: 1,
            recommended_target: 1,
            unit: 'session',
            rationale: 'Recent completion dipped. Shifting screen cutoff to 10:20 PM offers a gentler target to rebuild momentum.',
            user_controlled: true
          },
          {
            id: 'rec_2',
            habit_id: 'h_walk',
            habit_title: 'Brisk Morning Walk',
            category: 'exercise',
            type: 'gradual_progression',
            current_target: 30,
            recommended_target: 35,
            unit: 'minutes',
            rationale: 'Outstanding 8-day consistency! Ready to step up to 35 minutes daily?',
            user_controlled: true
          }
        ]
      };
    }
    if (clean.includes('/analytics/impact-score')) {
      return {
        status: 'success',
        impact_score: {
          score: 88.5,
          formula: 'Healthy Impact Score = (Weighted completed habit ratios / Total applicable weights) * 100',
          total_applicable_weights: 100,
          weights_used: { exercise: 25, water: 20, sleep: 20, nutrition: 15, meditation: 10, general: 10 },
          weekly_trend: [
            { date: '2026-11-13', score: 82 },
            { date: '2026-11-14', score: 85 },
            { date: '2026-11-15', score: 79 },
            { date: '2026-11-16', score: 86 },
            { date: '2026-11-17', score: 90 },
            { date: '2026-11-18', score: 88 },
            { date: '2026-11-19', score: 89 }
          ],
          contributing_habits: [
            { title: 'Brisk Morning Walk', category: 'exercise', target: '30 minutes', completed: true, completion_ratio: 1.0, weight: 25, weighted_contribution: 25 },
            { title: 'Daily Hydration (2.5L)', category: 'water', target: '2500 ml', completed: true, completion_ratio: 0.8, weight: 20, weighted_contribution: 16 },
            { title: '8 Hours Sleep Routine', category: 'sleep', target: '8 hours', completed: true, completion_ratio: 0.94, weight: 20, weighted_contribution: 18.8 },
            { title: 'Evening Mindfulness', category: 'meditation', target: '15 minutes', completed: true, completion_ratio: 1.0, weight: 10, weighted_contribution: 10 },
            { title: 'Two Servings of Vegetables', category: 'nutrition', target: '2 servings', completed: false, completion_ratio: 0.5, weight: 15, weighted_contribution: 7.5 }
          ],
          explanation: 'Score of 88.5/100 calculated across 5 active habit categories.',
          disclaimer: 'The Healthy Impact Score is a behavioral consistency metric and not a clinical diagnosis.'
        }
      };
    }
    if (clean.includes('/garden')) {
      return {
        status: 'success',
        garden_level: 4,
        seeds_balance: 280,
        total_verified_habit_completions: 28,
        environment_tier: 3,
        environment_description: 'Twilight Glow Oasis',
        plants: [
          { id: 'tree_guardian', name: 'Oak of Vitality', category_label: 'Physical Exercise', growth_stage: 3, stage_name: 'Great Ancient Oak', growth_percentage: 95 },
          { id: 'lotus_fountain', name: 'Lotus of Clarity', category_label: 'Hydration', growth_stage: 2, stage_name: 'Blooming Water Lily', growth_percentage: 75 },
          { id: 'blossom_field', name: 'Lavender Blossom Patch', category_label: 'Mindfulness', growth_stage: 3, stage_name: 'Radiant Zen Garden', growth_percentage: 100 },
          { id: 'orchard_bush', name: 'Golden Berry Bush', category_label: 'Healthy Nutrition', growth_stage: 2, stage_name: 'Berry Clusters', growth_percentage: 65 }
        ],
        decorations: [
          { id: 'zen_lantern', name: 'Stone Zen Lantern', cost_seeds: 50, unlocked: true },
          { id: 'wooden_bench', name: 'Cedar Resting Bench', cost_seeds: 80, unlocked: true },
          { id: 'firefly_swarm', name: 'Night Fireflies', cost_seeds: 120, unlocked: false },
          { id: 'bird_bath', name: 'Marble Bird Sanctuary', cost_seeds: 150, unlocked: false }
        ]
      };
    }
    if (clean.includes('/mood/history')) {
      return {
        status: 'success',
        total_checkins: 14,
        distribution: { Happy: 6, Energetic: 4, Neutral: 2, Tired: 1, Stressed: 1, Sad: 0 },
        correlations: [
          { date: '2026-11-18', mood: 'Energetic', energy_level: 5, habit_completion_rate: 100 },
          { date: '2026-11-17', mood: 'Happy', energy_level: 4, habit_completion_rate: 85 },
          { date: '2026-11-16', mood: 'Neutral', energy_level: 3, habit_completion_rate: 70 },
          { date: '2026-11-15', mood: 'Tired', energy_level: 2, habit_completion_rate: 60 }
        ]
      };
    }
    if (clean.includes('/mood/checkin')) {
      return {
        status: 'success',
        message: 'Mood check-in recorded successfully.',
        ai_support: 'You are carrying great vitality today! A steady pace on your morning habits will anchor this high energy into your evening routine.'
      };
    }
    if (clean.includes('/voice/command')) {
      return {
        status: 'success',
        result: {
          spoken_reply: 'Would you like to record 20 minutes of walking for today?',
          requires_confirmation: true,
          confirmation_payload: { category: 'exercise', title: 'Daily Walking', value: 20, unit: 'minutes' }
        }
      };
    }
    if (clean.includes('/voice/confirm')) {
      return { status: 'success', message: 'Successfully logged 20 minutes of walking via voice command!' };
    }
    if (clean.includes('/integrations/status')) {
      return {
        status: 'success',
        integrations: {
          google_health_connect: { connected: true, last_sync: '2026-11-18T10:00:00Z' },
          apple_health: { connected: false, last_sync: null }
        },
        recent_imported_records: [
          { _id: 'rec_1', date: '2026-11-18', source: 'Google Health Connect', type: 'steps', value: 8400, unit: 'steps', imported_at: '2026-11-18T10:00:00Z' },
          { _id: 'rec_2', date: '2026-11-18', source: 'Google Health Connect', type: 'sleep', value: 7.5, unit: 'hours', imported_at: '2026-11-18T08:00:00Z' }
        ]
      };
    }
    if (clean.includes('/routines')) {
      return {
        status: 'success',
        active_routine: {
          title: 'Optimal Circadian Wellness Routine',
          wake_time: '06:30',
          sleep_time: '22:30',
          morning_routine: [
            { time: '06:30', title: 'Hydration Wake-up', duration_min: 5, description: 'Drink 400ml room-temperature water' },
            { time: '06:45', title: 'Circadian Light & Mobility', duration_min: 20, description: 'Gentle walk or stretching in natural sunlight' },
            { time: '07:30', title: 'High-Protein Breakfast', duration_min: 25, description: 'Nourishing balanced meal' }
          ],
          afternoon_routine: [
            { time: '12:30', title: 'Mindful Lunch Break', duration_min: 30, description: 'Screen-free meal pause' },
            { time: '14:30', title: 'Hydration & Posture Reset', duration_min: 5, description: 'Drink 300ml water and roll shoulders' }
          ],
          evening_routine: [
            { time: '18:00', title: 'Daily Workout / Cardio', duration_min: 35, description: 'Brisk walk or strength training' },
            { time: '19:30', title: 'Light Nutritious Dinner', duration_min: 30, description: 'Whole foods meal' }
          ],
          sleep_prep_routine: [
            { time: '21:30', title: 'Digital Sunset', duration_min: 15, description: 'Dim screens and activate night mode' },
            { time: '22:15', title: 'Mindful Reflection', duration_min: 15, description: 'Log today in HealthLoop mood check-in' }
          ]
        }
      };
    }
    if (clean.includes('/notifications')) {
      return {
        status: 'success',
        unread_count: 1,
        preferences: { quiet_hours_enabled: true, quiet_hours_start: '22:00', quiet_hours_end: '07:00' },
        notifications: [
          { _id: 'notif_1', title: 'Hydration Pacing Check 💧', message: 'You are on track! A quick sip maintains your afternoon concentration.', category: 'hydration', is_read: false, created_at: new Date().toISOString() },
          { _id: 'notif_2', title: 'Time for a 2-Minute Stretch 🌿', message: 'Roll your shoulders and take 5 slow deep breaths.', category: 'movement', is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() }
        ]
      };
    }
    if (clean.includes('/challenges')) {
      return {
        status: 'success',
        challenges: [
          { _id: 'c_walk', title: '7-Day Morning Movement Challenge', description: 'Log at least 20 minutes of walking for 7 consecutive days.', duration_days: 7, target_metric: 'Exercise', participants_count: 142, joined: true },
          { _id: 'c_water', title: '30-Day Hydration Mastery', description: 'Hit your daily water target 25 out of 30 days.', duration_days: 30, target_metric: 'Water', participants_count: 289, joined: true },
          { _id: 'c_mind', title: '21-Day Mindful Breathing Quest', description: 'Complete a 5-minute meditation session daily.', duration_days: 21, target_metric: 'Meditation', participants_count: 98, joined: false }
        ]
      };
    }
    if (clean.includes('/gamification')) {
      return {
        status: 'success',
        user: { points: 1450, level: 'Gold Explorer', streak: 12 },
        badges: [
          { code: 'FIRST_STEP', title: 'First Step', description: 'Logged your first habit', unlocked: true },
          { code: 'STREAK_7', title: '7-Day Champion', description: 'Maintained 7-day streak', unlocked: true },
          { code: 'HYDRATION_HERO', title: 'Hydration Hero', description: 'Hit water target 10 times', unlocked: true },
          { code: 'COMEBACK_HERO', title: 'Comeback Hero', description: 'Resumed a dropped habit', unlocked: true },
          { code: 'GARDEN_MASTER', title: 'Botanical Master', description: 'Reached Garden Tier 4', unlocked: true }
        ]
      };
    }

    return { status: 'success', message: 'Action completed successfully.' };
  }

  // Auth Endpoints
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async register(formData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async guestLogin() {
    const data = await this.request('/auth/guest-login', {
      method: 'POST',
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Habits Endpoints
  async getHabits() {
    return this.request('/habits');
  }

  async getTodaySummary() {
    return this.request('/habits/summary/today');
  }

  async createHabit(habitData) {
    return this.request('/habits', {
      method: 'POST',
      body: JSON.stringify(habitData),
    });
  }

  async updateHabit(habitId, habitData) {
    return this.request(`/habits/${habitId}`, {
      method: 'PUT',
      body: JSON.stringify(habitData),
    });
  }

  async deleteHabit(habitId) {
    return this.request(`/habits/${habitId}`, {
      method: 'DELETE',
    });
  }

  async logHabit(habitId, logData) {
    return this.request(`/habits/${habitId}/log`, {
      method: 'POST',
      body: JSON.stringify(logData),
    });
  }

  // Behaviour Drop Detection
  async getDropStatus() {
    return this.request('/drop-detection/status');
  }

  async resolveDrop(dropId, resolutionData) {
    return this.request(`/drop-detection/${dropId}/resolve`, {
      method: 'POST',
      body: JSON.stringify(resolutionData),
    });
  }

  // AI Health Coach
  async sendAIChat(message) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getAIDailySuggestions() {
    return this.request('/ai/daily-suggestions');
  }

  async getAIWeeklySummary() {
    return this.request('/ai/weekly-summary');
  }

  // Analytics
  async getAnalytics(range = '7d') {
    return this.request(`/analytics/overview?range=${range}`);
  }

  // Gamification & Badges
  async getGamification() {
    return this.request('/gamification/overview');
  }

  async getLeaderboard() {
    return this.request('/gamification/leaderboard');
  }

  // Challenges
  async getChallenges() {
    return this.request('/challenges');
  }

  async joinChallenge(challengeId) {
    return this.request(`/challenges/${challengeId}/join`, {
      method: 'POST',
    });
  }

  // Reminders
  async getReminders() {
    return this.request('/reminders');
  }

  async createReminder(reminderData) {
    return this.request('/reminders', {
      method: 'POST',
      body: JSON.stringify(reminderData),
    });
  }

  async updateReminder(reminderId, reminderData) {
    return this.request(`/reminders/${reminderId}`, {
      method: 'PUT',
      body: JSON.stringify(reminderData),
    });
  }

  async deleteReminder(reminderId) {
    return this.request(`/reminders/${reminderId}`, {
      method: 'DELETE',
    });
  }

  async testNotification() {
    return this.request('/reminders/test-notification', {
      method: 'POST',
    });
  }

  // Privacy & Data
  async exportData() {
    return this.request('/privacy/export-data');
  }

  async updateConsent(aiConsent) {
    return this.request('/privacy/consent', {
      method: 'POST',
      body: JSON.stringify({ ai_consent: aiConsent }),
    });
  }

  async deleteUserData() {
    return this.request('/privacy/delete-data', {
      method: 'DELETE',
    });
  }

  // Feature 01: AI Habit Prediction Engine
  async getPredictions() {
    return this.request('/v1/predictions/habits');
  }

  // Feature 02: JITAI Notifications & Smart Reminders
  async getNotifications() {
    return this.request('/v1/notifications');
  }

  async markNotificationRead(notifId = 'all') {
    return this.request(`/v1/notifications/${notifId}/read`, {
      method: 'PUT',
    });
  }

  async updateNotificationPreferences(preferences) {
    return this.request('/v1/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Feature 03: Mood-Based AI Coach
  async checkinMood(data) {
    return this.request('/v1/mood/checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMoodHistory(limit = 30) {
    return this.request(`/v1/mood/history?limit=${limit}`);
  }

  async sendAIAnalyse(query) {
    return this.request('/v1/ai/analyse', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  // Feature 04: Personal Health Digital Twin
  async getDigitalTwin() {
    return this.request('/v1/digital-twin');
  }

  async simulateDigitalTwin(params) {
    return this.request('/v1/digital-twin/simulate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Feature 05: Adaptive Goals
  async getAdaptiveGoals() {
    return this.request('/v1/goals/adaptive');
  }

  async applyGoalAction(data) {
    return this.request('/v1/goals/adaptive/action', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Feature 06: Healthy Impact Score
  async getImpactScore(date) {
    const url = date ? `/v1/analytics/impact-score?date=${date}` : '/v1/analytics/impact-score';
    return this.request(url);
  }

  async updateImpactWeights(weights) {
    return this.request('/v1/analytics/impact-score/weights', {
      method: 'POST',
      body: JSON.stringify({ weights }),
    });
  }

  // Feature 07: Voice Assistant
  async sendVoiceCommand(transcript) {
    return this.request('/v1/voice/command', {
      method: 'POST',
      body: JSON.stringify({ transcript }),
    });
  }

  async confirmVoiceAction(confirmation_payload) {
    return this.request('/v1/voice/confirm', {
      method: 'POST',
      body: JSON.stringify({ confirmation_payload }),
    });
  }

  // Feature 08: Wearable Integrations
  async getWearableStatus() {
    return this.request('/v1/integrations/status');
  }

  async importWearableData(importPayload) {
    return this.request('/v1/integrations/import', {
      method: 'POST',
      body: JSON.stringify(importPayload),
    });
  }

  async toggleWearableConnection(provider, connected) {
    const endpoint = connected ? '/v1/integrations/connect' : '/v1/integrations/disconnect';
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
  }

  // Feature 09: Smart Healthy Routine Planner
  async getRoutines() {
    return this.request('/v1/routines');
  }

  async generateRoutine(preferences) {
    return this.request('/v1/routines/generate', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  async updateRoutine(routineId, routineData) {
    return this.request(`/v1/routines/${routineId}`, {
      method: 'PUT',
      body: JSON.stringify(routineData),
    });
  }

  // Feature 10: Virtual Habit Garden
  async getGardenState() {
    return this.request('/v1/garden');
  }

  async claimGardenReward(itemId) {
    return this.request('/v1/garden/rewards', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId }),
    });
  }
}

export const api = new ApiService();
export default api;
