import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Calendar,
  CheckCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AICoachPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${user?.username || 'there'}! I am your HealthLoop AI Coach, powered by behavioral psychology and lifestyle science. I review your daily habit patterns, assist with micro-goals, and help you recover smoothly from missed days. How can I support your wellness today?`,
      time: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadWeeklySummary();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadWeeklySummary = async () => {
    try {
      const data = await api.getAIWeeklySummary();
      if (data && data.summary) {
        setWeeklySummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load weekly summary:', err);
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const newMsg = {
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const data = await api.sendAIChat(text.trim());
      const replyMsg = {
        sender: 'ai',
        text: data.reply || 'Here is an encouraging habit suggestion.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'I am here with you! Staying hydrated, getting 7+ hours of sleep, and moving for 10 minutes are great foundational pillars to restart your momentum today.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-sm shadow-teal-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AI Health & Habit Coach
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Evidence-based lifestyle recommendations, behaviour drop recovery, and habit stacking powered by Google Gemini.
        </p>
      </div>

      {/* Mandatory Medical Safety Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start space-x-3 text-xs text-amber-800 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Medical Notice:</span> HealthLoop Coach offers behavioral support and healthy habit guidance. It does not provide medical diagnoses, treatment plans, or clinical prescriptions. For medical conditions, please consult a licensed physician.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Weekly Wellness Digest & Quick Prompt Chips (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Weekly Wellness Digest */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Weekly Wellness Summary
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                {weeklySummary?.overall_health_grade || 'A- (84%)'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Highlights:</span>
                <ul className="mt-1.5 space-y-1.5 text-slate-600 dark:text-slate-400 list-disc list-inside">
                  {weeklySummary?.key_highlights?.map((h, i) => (
                    <li key={i}>{h}</li>
                  )) || (
                    <>
                      <li>Hydration target met on 6 out of 7 days.</li>
                      <li>Average restorative sleep: 7.6 hours per night.</li>
                      <li>Morning meditation sustained for 7 consecutive days.</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40">
                <span className="font-semibold text-teal-800 dark:text-teal-300">Growth Focus:</span>
                <p className="mt-1 text-slate-600 dark:text-slate-300 leading-snug">
                  {weeklySummary?.growth_opportunity || 'Gym session showed a 2-day pause. Micro-targets can smoothly reignite momentum.'}
                </p>
              </div>

              <p className="italic text-[11px] text-slate-500 dark:text-slate-400">
                "{weeklySummary?.ai_encouragement || 'Consistency is an upward spiral, not an unbroken line. Keep showing up!'}"
              </p>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Ask AI Coach</span>
            </h4>
            <div className="space-y-2">
              {[
                'How can I restart my gym routine after a 3-day gap without burnout?',
                'What is an evidence-based evening wind-down routine for deeper sleep?',
                'How much water should I drink during high-stress desk work?',
                'Suggest a 5-minute micro-habit to reduce screen fatigue.',
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="w-full text-left p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-xs text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-100 dark:border-slate-700/60 transition-all leading-snug"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Conversational Chat Interface (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-3xl shadow-xs flex flex-col h-[600px]">
          {/* Chat Window Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                HealthLoop Behavioral Coach
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-semibold">
              Gemini Integrated
            </span>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-700/60 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-600/50 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-2">{m.time}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50 max-w-[50%] text-xs text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-500" />
                <span>Coach is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-700/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask your coach anything about habits, nutrition, sleep..."
                className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/40"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="p-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white shadow-md shadow-teal-600/20 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
