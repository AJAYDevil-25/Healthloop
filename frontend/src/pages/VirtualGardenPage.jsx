import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Sprout, TreePine, Droplets, Flower2, Sparkles, ShoppingBag, ShieldCheck, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function VirtualGardenPage() {
  const [gardenData, setGardenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rewardMessage, setRewardMessage] = useState(null);
  const mountRef = useRef(null);

  useEffect(() => {
    loadGarden();
  }, []);

  const loadGarden = async () => {
    try {
      setLoading(true);
      const res = await api.getGardenState();
      setGardenData(res);
    } catch (err) {
      console.error('Failed to load garden state', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDecoration = async (itemId) => {
    try {
      const res = await api.claimGardenReward(itemId);
      setRewardMessage(res.message);
      loadGarden();
      setTimeout(() => setRewardMessage(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to unlock decoration');
    }
  };

  // Three.js 3D Virtual Garden Scene
  useEffect(() => {
    if (!mountRef.current || !gardenData) return;
    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = 380;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0fdf4);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 8);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Sunlight
    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    dirLight.position.set(5, 12, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const ambLight = new THREE.AmbientLight(0xdcfce7, 0.6);
    scene.add(ambLight);

    // Lush Island Ground
    const groundGeo = new THREE.CylinderGeometry(5.2, 5.5, 0.6, 32);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    scene.add(ground);

    // Render Plants dynamically based on real verified habit stages!
    const plantsGroup = new THREE.Group();

    // 1. Tree (Exercise Habit)
    const treeStage = gardenData.plants?.find((p) => p.id === 'tree_guardian')?.growth_stage || 1;
    const trunkHeight = 0.8 + treeStage * 0.6;
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.22, trunkHeight, 12);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(-2.2, trunkHeight / 2, -1.0);
    plantsGroup.add(trunk);

    const foliageRadius = 0.5 + treeStage * 0.35;
    const foliageGeo = new THREE.DodecahedronGeometry(foliageRadius, 1);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.set(-2.2, trunkHeight + foliageRadius * 0.6, -1.0);
    plantsGroup.add(foliage);

    // 2. Water Pond & Lilies (Hydration Habit)
    const pondGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.08, 24);
    const pondMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.4 });
    const pond = new THREE.Mesh(pondGeo, pondMat);
    pond.position.set(0, 0.04, 0.4);
    plantsGroup.add(pond);

    const lilyGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.02, 8);
    const lilyMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
    const lily = new THREE.Mesh(lilyGeo, lilyMat);
    lily.position.set(0.3, 0.09, 0.5);
    plantsGroup.add(lily);

    // 3. Flower Beds (Meditation & Mindfulness Habit)
    const flowerStage = gardenData.plants?.find((p) => p.id === 'blossom_field')?.growth_stage || 1;
    for (let i = 0; i < 4 + flowerStage * 3; i++) {
      const flGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const flMat = new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xa855f7 : 0xec4899 });
      const flMesh = new THREE.Mesh(flGeo, flMat);
      const angle = (i / 8) * Math.PI * 2;
      flMesh.position.set(2.2 + Math.cos(angle) * 0.6, 0.18, -0.6 + Math.sin(angle) * 0.5);
      plantsGroup.add(flMesh);
    }

    scene.add(plantsGroup);

    // Animation Loop (Slow graceful rotation)
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      plantsGroup.rotation.y = elapsedTime * 0.08;
      ground.rotation.y = elapsedTime * 0.08;
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
  }, [gardenData]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Virtual Habit Garden (Three.js 3D)
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your daily health consistency blooms into an interactive living sanctuary.
            </p>
          </div>
        </div>

        <button
          onClick={loadGarden}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Garden</span>
        </button>
      </div>

      {/* Non-Punitive Garden Philosophy Banner */}
      <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed">
          <span className="font-bold">Gentle Habit Sanctuary:</span> Missing a habit will never destroy your plants or punish you. Your garden enters a gentle resting state, waiting patiently for your next mindful action.
        </div>
      </div>

      {rewardMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-300 animate-fade-in flex items-center space-x-2">
          <Sparkles className="w-4 h-4" />
          <span>{rewardMessage}</span>
        </div>
      )}

      {/* Three.js Interactive 3D Canvas Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Garden Tier {gardenData?.garden_level || 1} • {gardenData?.environment_description || 'Sunny Bloom Sanctuary'}
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Interactive 3D Flora & Biome
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              🌱 {gardenData?.seeds_balance || 0} Seeds Earned
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
              ✓ {gardenData?.total_verified_habit_completions || 0} Habits Logged
            </span>
          </div>
        </div>

        {/* 3D Canvas Container */}
        <div
          ref={mountRef}
          className="w-full h-[380px] rounded-2xl overflow-hidden border border-emerald-100 dark:border-slate-800 bg-emerald-50/20"
        />

        <div className="flex justify-between items-center text-[11px] text-slate-400 px-1">
          <span>Three.js WebGL Engine</span>
          <span>Oak = Exercise • Lotus = Hydration • Lavender = Meditation</span>
        </div>
      </div>

      {/* Plant Growth Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gardenData?.plants?.map((plant) => (
          <div
            key={plant.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {plant.category_label}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {plant.name}
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Stage {plant.growth_stage}/3
              </span>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              {plant.stage_name}
            </div>

            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${plant.growth_percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Garden Decorations Shop / Unlocked items */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-teal-500" />
          <span>Garden Rewards & Sanctuaries</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gardenData?.decorations?.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 flex flex-col justify-between"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h4>
                <span className="text-[11px] text-slate-400">Cost: {item.cost_seeds} Seeds</span>
              </div>

              {item.unlocked ? (
                <span className="py-1.5 px-3 rounded-lg text-center font-bold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  Placed in Garden
                </span>
              ) : (
                <button
                  onClick={() => handleClaimDecoration(item.id)}
                  disabled={gardenData?.seeds_balance < item.cost_seeds}
                  className="py-1.5 px-3 rounded-lg font-semibold text-xs bg-teal-600 hover:bg-teal-700 text-white transition disabled:opacity-40 cursor-pointer"
                >
                  Unlock Reward
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
