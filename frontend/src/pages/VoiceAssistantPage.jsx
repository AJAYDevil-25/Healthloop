import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Send, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function VoiceAssistantPage() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [loading, setLoading] = useState(false);
  const [chatLog, setChatLog] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your voice-enabled wellness assistant. You can say things like "I walked for 20 minutes" or "I drank 500ml of water", or ask any general wellness question.'
    }
  ]);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
    }
  }, []);

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Web Speech API is not supported in this browser. Please type your command.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
        handleProcessTranscript(text);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleProcessTranscript = async (textToProcess) => {
    const text = (textToProcess || transcript).trim();
    if (!text) return;

    // Append user query to chat
    setChatLog((prev) => [...prev, { role: 'user', text }]);
    setTranscript('');
    setLoading(true);

    try {
      const res = await api.sendVoiceCommand(text);
      const result = res.result;

      // Append assistant reply
      setChatLog((prev) => [...prev, { role: 'assistant', text: result.spoken_reply }]);

      // Speak aloud if synthesis supported
      speakAloud(result.spoken_reply);

      // Check if confirmation is required
      if (result.requires_confirmation && result.confirmation_payload) {
        setPendingConfirmation({
          prompt: result.spoken_reply,
          payload: result.confirmation_payload
        });
      }
    } catch (err) {
      setChatLog((prev) => [...prev, { role: 'assistant', text: 'Sorry, I encountered an issue processing your voice command.' }]);
    } finally {
      setLoading(false);
    }
  };

  const speakAloud = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingConfirmation) return;
    try {
      const res = await api.confirmVoiceAction(pendingConfirmation.payload);
      setActionSuccess(res.message);
      setPendingConfirmation(null);
      speakAloud('Action confirmed and logged to your records!');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to log voice action');
    }
  };

  const handleCancelAction = () => {
    setPendingConfirmation(null);
    speakAloud('Action cancelled. No changes were made.');
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
          <Mic className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Voice-Based AI Assistant
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log habits and ask wellness questions hands-free with Web Speech synthesis and mandatory confirmation guards.
          </p>
        </div>
      </div>

      {/* Safety & Confirmation Guard Banner */}
      <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed">
          <span className="font-bold">Confirmation Safety Guard:</span> Voice commands will never write or modify your habit logs directly without your explicit interactive confirmation.
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-300 animate-fade-in flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {pendingConfirmation && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg space-y-4 animate-scale-up">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-teal-200" />
            <h3 className="text-sm font-bold tracking-wide uppercase">Voice Confirmation Required</h3>
          </div>
          <p className="text-sm font-medium leading-relaxed">
            "{pendingConfirmation.prompt}"
          </p>
          <div className="flex space-x-3 pt-1">
            <button
              onClick={handleConfirmAction}
              className="px-5 py-2 rounded-xl bg-white text-teal-900 font-bold text-xs hover:bg-teal-50 transition cursor-pointer shadow-sm"
            >
              Confirm & Save Record
            </button>
            <button
              onClick={handleCancelAction}
              className="px-4 py-2 rounded-xl bg-black/20 text-white font-medium text-xs hover:bg-black/30 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Conversation Window */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 min-h-[360px] flex flex-col justify-between">
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
          {chatLog.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 pl-11">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
              <span>Assistant is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Bar with Mic button & text fallback */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={startVoiceInput}
              disabled={isListening}
              className={`p-3.5 rounded-2xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md'
              }`}
              title={recognitionSupported ? 'Click to speak' : 'Speech recognition unavailable'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleProcessTranscript()}
              placeholder={isListening ? 'Listening to your voice...' : 'Speak or type e.g. "I walked 20 minutes"...'}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <button
              onClick={() => handleProcessTranscript()}
              disabled={!transcript.trim() || loading}
              className="p-3.5 rounded-2xl bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>
              {recognitionSupported ? '🎙️ Web Speech API Active' : '⌨️ Text Fallback Mode'}
            </span>
            <span>Say "How is my streak?" or "Log 500ml water"</span>
          </div>
        </div>
      </div>
    </div>
  );
}
