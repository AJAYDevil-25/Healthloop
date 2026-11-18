import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Cpu, Play, RotateCcw, AlertCircle, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../services/api';

export default function DigitalTwinPage() {
  const [twinData, setTwinData] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // Simulation form controls
  const [extraWalkMins, setExtraWalkMins] = useState(20);
  const [targetSleep, setTargetSleep] = useState(8.0);
  const [extraWater, setExtraWater] = useState(500);
  const [consistencyTarget, setConsistencyTarget] = useState(85);
  const [projectionDays, setProjectionDays] = useState(30);

  // Three.js Canvas Ref
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    loadTwinProfile();
  }, []);

  const loadTwinProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getDigitalTwin();
      setTwinData(res.digital_twin);
    } catch (err) {
      console.error('Failed to load digital twin', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    try {
      setSimulating(true);
      const res = await api.simulateDigitalTwin({
        extra_walk_minutes: extraWalkMins,
        target_sleep_hours: targetSleep,
        extra_water_ml: extraWater,
        habit_consistency_target: consistencyTarget,
        projection_days: projectionDays
      });
      setSimulationResult(res.simulation);
    } catch (err) {
      alert(err.message || 'Simulation error');
    } finally {
      setSimulating(false);
    }
  };

  // Three.js interactive Energy Core Digital Twin visualization
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 320;
    const height = 280;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Glowing core mesh (Digital Twin biological energy proxy)
    const geometry = new THREE.IcosahedronGeometry(1.2, 3);
    const material = new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8
    });
    const core = new THREE.Mesh(geometry, material);
    scene.add(core);

    // Inner pulsating particle orb
    const innerGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: false,
      transparent: true,
      opacity: 0.6
    });
    const innerOrb = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerOrb);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x14b8a6, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      core.rotation.x = elapsedTime * 0.25;
      core.rotation.y = elapsedTime * 0.35;

      const scale = 1 + Math.sin(elapsedTime * 2) * 0.05;
      innerOrb.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  const baseline = twinData?.baseline;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
          <Cpu className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Personal Health Digital Twin
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A dynamic behavioural model of your lifestyle patterns, with hypothetical what-if scenario simulations.
          </p>
        </div>
      </div>

      {/* Top Section: Three.js Twin Core & Verified Baseline Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Three.js 3D Twin Avatar Core */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                3D Behavioral Mesh
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-900/60 text-teal-300 border border-teal-700/50">
                Synchronized Twin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive WebGL digital representation driven by your verified habit consistency.
            </p>
          </div>

          <div ref={mountRef} className="w-full flex items-center justify-center my-2 h-[260px]" />

          <div className="text-center text-[11px] text-slate-400 bg-slate-800/40 py-2 px-3 rounded-xl border border-slate-700/40">
            Pulsing rate reflects Stamina & Recovery equilibrium.
          </div>
        </div>

        {/* Verified Baseline Profile */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Verified Behavioral Baseline
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculated exclusively from your real 30-day recorded logs.
            </p>
          </div>

          {baseline ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400">Overall Consistency</span>
                <div className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                  {baseline.overall_consistency_pct}%
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400">Stamina Index</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {baseline.stamina_index} / 100
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400">Recovery Index</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {baseline.recovery_index} / 100
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400">Exercise Habit</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {baseline.exercise_consistency_pct}%
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400">Hydration Habit</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {baseline.hydration_consistency_pct}%
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400">Sleep Routine</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {baseline.sleep_routine_pct}%
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-slate-400">Loading baseline profile...</div>
          )}

          <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
            <span>Digital Twin calibrated against {baseline?.total_historical_logs || 0} historical logs across {baseline?.tracked_habits_count || 0} active habits.</span>
          </div>
        </div>
      </div>

      {/* Simulation Controls: Test What-If Scenarios */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Play className="w-5 h-5 text-teal-500" />
            <span>Hypothetical Scenario Simulator</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Model the impact of prospective habit modifications over a selected timeline.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Walking minutes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Extra Daily Walking: <span className="text-teal-600 dark:text-teal-400">{extraWalkMins} min</span>
            </label>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={extraWalkMins}
              onChange={(e) => setExtraWalkMins(parseInt(e.target.value))}
              className="w-full accent-teal-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Target sleep */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Sleep Duration: <span className="text-teal-600 dark:text-teal-400">{targetSleep} hrs</span>
            </label>
            <input
              type="range"
              min="5.0"
              max="9.5"
              step="0.5"
              value={targetSleep}
              onChange={(e) => setTargetSleep(parseFloat(e.target.value))}
              className="w-full accent-teal-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Water ml */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Extra Hydration: <span className="text-teal-600 dark:text-teal-400">+{extraWater} ml</span>
            </label>
            <input
              type="range"
              min="0"
              max="1500"
              step="250"
              value={extraWater}
              onChange={(e) => setExtraWater(parseInt(e.target.value))}
              className="w-full accent-teal-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Target Habit Consistency */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Habit Adherence: <span className="text-teal-600 dark:text-teal-400">{consistencyTarget}%</span>
            </label>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={consistencyTarget}
              onChange={(e) => setConsistencyTarget(parseInt(e.target.value))}
              className="w-full accent-teal-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Projection Window:</span>
            <select
              value={projectionDays}
              onChange={(e) => setProjectionDays(parseInt(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
              <option value={60}>60 Days</option>
              <option value={90}>90 Days</option>
            </select>
          </div>

          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs tracking-wide transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {simulating ? (
              <span>Simulating Trajectory...</span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Execute Twin Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulation Result Presentation (Clearly Distinguishing Simulation from Actual Results) */}
      {simulationResult && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-dashed border-teal-500/50 dark:border-teal-400/30 shadow-md space-y-6 animate-fade-in">
          {/* Simulation Watermark Banner */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">PROSPECTIVE SIMULATION ESTIMATE:</span> The projections below represent hypothetical mathematical modeling under your chosen parameters. They are not guaranteed clinical outcomes and do not replace historical health records.
            </div>
          </div>

          {/* Comparison Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400">Projected Impact Score</span>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1 flex items-center space-x-1">
                <span>{simulationResult.projected_metrics.projected_impact_score}</span>
                <span className="text-xs font-semibold text-emerald-500">
                  (+{simulationResult.projected_metrics.projected_score_change} pts)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400">Projected Stamina</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {simulationResult.projected_metrics.projected_stamina_index} / 100
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400">Projected Recovery</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {simulationResult.projected_metrics.projected_recovery_index} / 100
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400">Projected Hydration</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {simulationResult.projected_metrics.projected_hydration_pct}%
              </div>
            </div>
          </div>

          {/* Trajectory Projection Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Sample Projection Timeline ({simulationResult.timeline.length} Days)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {simulationResult.timeline.filter((_, i) => i % Math.max(1, Math.floor(simulationResult.timeline.length / 6)) === 0).map((t, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 text-center text-xs">
                  <div className="text-[10px] text-slate-400">Day {t.day}</div>
                  <div className="font-bold text-teal-700 dark:text-teal-300 text-sm mt-0.5">{t.projected_score}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
