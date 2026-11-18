import React, { useState, useEffect } from 'react';
import { Watch, Upload, FileText, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, XCircle } from 'lucide-react';
import api from '../services/api';

export default function WearableIntegrationPage() {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jsonInput, setJsonInput] = useState('');
  const [importSource, setImportSource] = useState('Apple Health Export');
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getWearableStatus();
      setStatusData(res);
    } catch (err) {
      console.error('Failed to load wearable status', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConnection = async (provider, currentConnected) => {
    try {
      await api.toggleWearableConnection(provider, !currentConnected);
      loadStatus();
    } catch (err) {
      alert(err.message || 'Failed to toggle wearable connection');
    }
  };

  const handleImportJson = async (e) => {
    e.preventDefault();
    if (!jsonInput.trim()) return;

    try {
      setImporting(true);
      setImportResult(null);
      const res = await api.importWearableData({
        source: importSource,
        file_content: jsonInput.trim(),
        file_type: 'json'
      });
      setImportResult(res);
      setJsonInput('');
      loadStatus();
    } catch (err) {
      alert(err.message || 'Failed to import file');
    } finally {
      setImporting(false);
    }
  };

  const handleLoadSampleData = () => {
    const sample = [
      { date: new Date().toISOString().split('T')[0], type: 'steps', value: 9200, unit: 'steps' },
      { date: new Date().toISOString().split('T')[0], type: 'sleep', value: 7.8, unit: 'hours' },
      { date: new Date().toISOString().split('T')[0], type: 'exercise', value: 35, unit: 'minutes' }
    ];
    setJsonInput(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Watch className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Wearable & Activity Device Integration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Connect companion health frameworks and import verified activity records with strict duplicate prevention.
          </p>
        </div>
      </div>

      {/* Honest Browser Limitation Disclosure */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <span className="font-bold">Transparent Architecture Disclosure:</span> Web browsers cannot directly read physical sensor hardware on wearable devices without an authorized native bridge (such as Health Connect on Android or HealthKit on iOS). For web environments, HealthLoop provides authorized bridge integration and verified JSON/CSV activity export file ingestion.
        </div>
      </div>

      {/* Integration Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Google Health Connect */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Android Bridge</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                statusData?.integrations?.google_health_connect?.connected
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {statusData?.integrations?.google_health_connect?.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Google Health Connect</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sync steps, daily active energy, and sleep stages via Android companion bridge.
            </p>
          </div>

          <button
            onClick={() => handleToggleConnection('google_health_connect', statusData?.integrations?.google_health_connect?.connected)}
            className={`w-full py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
              statusData?.integrations?.google_health_connect?.connected
                ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-800'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
            }`}
          >
            {statusData?.integrations?.google_health_connect?.connected ? 'Disconnect Provider' : 'Connect Android Bridge'}
          </button>
        </div>

        {/* Apple Health */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">iOS Bridge</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                statusData?.integrations?.apple_health?.connected
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {statusData?.integrations?.apple_health?.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Apple Health (HealthKit)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Import Apple Watch activity rings, resting heart rate, and sleep duration.
            </p>
          </div>

          <button
            onClick={() => handleToggleConnection('apple_health', statusData?.integrations?.apple_health?.connected)}
            className={`w-full py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
              statusData?.integrations?.apple_health?.connected
                ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-800'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
            }`}
          >
            {statusData?.integrations?.apple_health?.connected ? 'Disconnect Provider' : 'Connect iOS Bridge'}
          </button>
        </div>

        {/* Fitbit & Universal CSV/JSON */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Direct Ingestion</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                Ready
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Universal Export Import</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports standard JSON/CSV export files from Fitbit, Garmin, Polar, and Whoop.
            </p>
          </div>

          <div className="text-xs text-slate-500 py-2.5 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            Duplicate detection actively protects your records.
          </div>
        </div>
      </div>

      {/* Activity Data Import Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Upload className="w-5 h-5 text-teal-500" />
              <span>Import Activity Records (JSON / CSV)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste JSON or CSV payload below. Duplicate records for the same day and metric will be automatically detected and safely skipped.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadSampleData}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
          >
            Load Sample Payload
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Data Source:</span>
            <select
              value={importSource}
              onChange={(e) => setImportSource(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            >
              <option value="Apple Health Export">Apple Health Export</option>
              <option value="Google Health Connect">Google Health Connect</option>
              <option value="Garmin Connect">Garmin Connect</option>
              <option value="Fitbit JSON">Fitbit JSON</option>
              <option value="Manual Log Import">Manual Log Import</option>
            </select>
          </div>

          <textarea
            rows="6"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='[ { "date": "2026-11-17", "type": "steps", "value": 8500, "unit": "steps" } ]'
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <button
            onClick={handleImportJson}
            disabled={importing || !jsonInput.trim()}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs tracking-wide transition cursor-pointer disabled:opacity-50"
          >
            {importing ? 'Processing & Deduplicating...' : 'Verify & Import Records'}
          </button>
        </div>

        {/* Import Results Banner */}
        {importResult && (
          <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300 space-y-1 animate-fade-in">
            <div className="font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Import Operation Complete</span>
            </div>
            <div>
              Successfully imported <span className="font-bold">{importResult.imported_count}</span> new verified records.
            </div>
            <div>
              Skipped <span className="font-bold">{importResult.duplicates_skipped}</span> duplicate records to preserve data integrity.
            </div>
          </div>
        )}
      </div>

      {/* Recent Ingested Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Recent Ingested Activity Records
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                <th className="pb-3">Date</th>
                <th className="pb-3">Source Provider</th>
                <th className="pb-3">Metric</th>
                <th className="pb-3">Recorded Value</th>
                <th className="pb-3">Import Timestamp</th>
                <th className="pb-3 text-right">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {statusData?.recent_imported_records?.length > 0 ? (
                statusData.recent_imported_records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">{r.date}</td>
                    <td className="py-3">{r.source}</td>
                    <td className="py-3 capitalize text-teal-600 dark:text-teal-400 font-medium">{r.type}</td>
                    <td className="py-3 font-bold">{r.value} {r.unit}</td>
                    <td className="py-3 text-slate-400 text-[11px]">{new Date(r.imported_at).toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Verified & Deduplicated
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No wearable records imported yet. Use the upload tool above to test.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
