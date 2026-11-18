import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Download,
  Trash2,
  Lock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function PrivacyPage({ onNavigate }) {
  const { user, profile, isGuest, logout } = useAuth();
  const [aiConsent, setAiConsent] = useState(profile?.ai_consent !== false);
  const [exportLoading, setExportLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setAiConsent(profile.ai_consent !== false);
    }
  }, [profile]);

  const handleToggleConsent = async () => {
    const newConsent = !aiConsent;
    setAiConsent(newConsent);
    try {
      await api.updateConsent(newConsent);
      setStatusMessage(
        newConsent
          ? 'AI lifestyle analysis enabled. Your data is processed securely with healthcare guardrails.'
          : 'AI processing disabled. Cloud AI services will not receive your habit logs.'
      );
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      console.error('Failed to update consent:', err);
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const res = await api.exportData();
      const jsonStr = JSON.stringify(res.data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `healthloop_user_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteData = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all your health records, habits, and user account? This cannot be undone.')) {
      return;
    }

    try {
      const res = await api.deleteUserData();
      alert(res.message || 'Data deleted successfully.');
      logout();
      onNavigate('landing');
    } catch (err) {
      console.error('Failed to delete data:', err);
      alert('Delete request could not be processed.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-sm shadow-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Security & Privacy Control Center
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Full data isolation, explicit AI processing consent, and instantaneous one-click data portability.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* AI Consent Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              AI Habit Coaching Consent
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 font-bold">
              GDPR & Privacy Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            When enabled, anonymized habit completion metrics (water intake, sleep duration, exercise minutes) are sent to Google Gemini API to produce personalized suggestions and drop recovery advice. No clinical or identifiable personal records are ever shared.
          </p>
        </div>

        <button
          onClick={handleToggleConsent}
          className={`w-14 h-7 rounded-full p-1 transition-colors relative shrink-0 ${
            aiConsent ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform ${
              aiConsent ? 'transform translate-x-7' : ''
            }`}
          />
        </button>
      </div>

      {/* Data Isolation & Security Standard */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Lock className="w-4 h-4 text-teal-600" />
          <span>HealthLoop Security Architecture</span>
        </h3>

        <div className="grid sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50">
            <span className="font-bold text-slate-800 dark:text-slate-100 block mb-1">
              Encrypted Authentication
            </span>
            <p className="text-slate-500 dark:text-slate-400">
              Passcodes hashed with bcrypt (salt rounds). Sessions secured via HS256 JWT tokens.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50">
            <span className="font-bold text-slate-800 dark:text-slate-100 block mb-1">
              Data Isolation
            </span>
            <p className="text-slate-500 dark:text-slate-400">
              Strict multi-tenant tenant isolation. All habit logs are scoped strictly to your user ID.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50">
            <span className="font-bold text-slate-800 dark:text-slate-100 block mb-1">
              Zero Dark Patterns
            </span>
            <p className="text-slate-500 dark:text-slate-400">
              No tracking pixels or third-party advertising scripts. Your health records belong solely to you.
            </p>
          </div>
        </div>
      </div>

      {/* Data Portability (Export & Deletion) */}
      <div className="grid sm:grid-cols-2 gap-5">
        {/* Export */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Export All Personal Records
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Download your complete history in open JSON format, including all habit records, logs, drop recovery events, and reminder schedules.
            </p>
          </div>

          <button
            onClick={handleExportData}
            disabled={exportLoading}
            className="w-full py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{exportLoading ? 'Packaging Export...' : 'Download My Health Data (.JSON)'}</span>
          </button>
        </div>

        {/* Delete Data */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Permanent Account & Data Deletion
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Permanently purge all your habit records, profile details, and account credentials from MongoDB. This action is irreversible.
            </p>
          </div>

          <button
            onClick={handleDeleteData}
            className="w-full py-2.5 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs flex items-center justify-center space-x-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account & Erase Records</span>
          </button>
        </div>
      </div>
    </div>
  );
}
