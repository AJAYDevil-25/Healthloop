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
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
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
