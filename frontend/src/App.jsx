import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// 22 Required Application Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GuestDemoPage from './pages/GuestDemoPage';
import DashboardPage from './pages/DashboardPage';
import HabitTrackerPage from './pages/HabitTrackerPage';
import AICoachPage from './pages/AICoachPage';
import MoodCheckinPage from './pages/MoodCheckinPage';
import HabitPredictionPage from './pages/HabitPredictionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import AdaptiveGoalsPage from './pages/AdaptiveGoalsPage';
import ImpactScorePage from './pages/ImpactScorePage';
import VoiceAssistantPage from './pages/VoiceAssistantPage';
import WearableIntegrationPage from './pages/WearableIntegrationPage';
import RoutinePlannerPage from './pages/RoutinePlannerPage';
import VirtualGardenPage from './pages/VirtualGardenPage';
import ChallengesPage from './pages/ChallengesPage';
import AchievementsPage from './pages/AchievementsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import PrivacyPage from './pages/PrivacyPage';
import RemindersPage from './pages/RemindersPage';

function MainApp() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If initial auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500 tracking-wide">
            Initializing HealthLoop 2.0 Workspace...
          </span>
        </div>
      </div>
    );
  }

  // If user is not logged in, show Auth, Guest Demo, or Landing pages
  if (!user) {
    if (currentPage === 'login') {
      return <LoginPage onNavigate={setCurrentPage} />;
    }
    if (currentPage === 'register') {
      return <RegisterPage onNavigate={setCurrentPage} />;
    }
    if (currentPage === 'guest-demo') {
      return <GuestDemoPage onNavigate={setCurrentPage} />;
    }
    return <LandingPage onNavigate={setCurrentPage} />;
  }

  // Render authenticated pages (all 22 modules supported)
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'habits':
        return <HabitTrackerPage onNavigate={setCurrentPage} />;
      case 'ai-coach':
        return <AICoachPage onNavigate={setCurrentPage} />;
      case 'mood-checkin':
        return <MoodCheckinPage onNavigate={setCurrentPage} />;
      case 'habit-prediction':
        return <HabitPredictionPage onNavigate={setCurrentPage} />;
      case 'analytics':
        return <AnalyticsPage onNavigate={setCurrentPage} />;
      case 'digital-twin':
        return <DigitalTwinPage onNavigate={setCurrentPage} />;
      case 'adaptive-goals':
        return <AdaptiveGoalsPage onNavigate={setCurrentPage} />;
      case 'impact-score':
        return <ImpactScorePage onNavigate={setCurrentPage} />;
      case 'voice-assistant':
        return <VoiceAssistantPage onNavigate={setCurrentPage} />;
      case 'wearables':
        return <WearableIntegrationPage onNavigate={setCurrentPage} />;
      case 'routine-planner':
        return <RoutinePlannerPage onNavigate={setCurrentPage} />;
      case 'virtual-garden':
        return <VirtualGardenPage onNavigate={setCurrentPage} />;
      case 'challenges':
        return <ChallengesPage onNavigate={setCurrentPage} />;
      case 'achievements':
        return <AchievementsPage onNavigate={setCurrentPage} />;
      case 'notifications':
        return <NotificationsPage onNavigate={setCurrentPage} />;
      case 'reminders':
        return <RemindersPage onNavigate={setCurrentPage} />;
      case 'profile':
        return <ProfilePage onNavigate={setCurrentPage} />;
      case 'privacy':
        return <PrivacyPage onNavigate={setCurrentPage} />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw]">
            <Sidebar
              currentPage={currentPage}
              onNavigate={(page) => {
                setCurrentPage(page);
                setMobileMenuOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onNavigate={setCurrentPage}
        />
        <main className="flex-1 pb-12 overflow-x-hidden">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
