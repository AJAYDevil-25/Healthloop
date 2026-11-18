import React from 'react';
import { Brain } from 'lucide-react';

export default function MultiRingProgress({
  items = [
    { title: 'Reading', percentage: 42, color: '#8b5cf6' },
    { title: 'Languages', percentage: 85, color: '#3b82f6' },
    { title: 'Chess', percentage: 44, color: '#06b6d4' },
    { title: 'Meditation', percentage: 81, color: '#10b981' },
  ],
  size = 140,
}) {
  const baseRadius = 24;
  const strokeWidth = 5;
  const gap = 8;

  return (
    <div className="relative flex flex-col items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 dark:border-slate-700/60 h-full">
      {/* Top Icon */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 bg-slate-50 dark:bg-slate-700/80 text-purple-600 dark:text-purple-400">
        <Brain className="w-4 h-4" />
      </div>

      {/* SVG Rings */}
      <div className="relative flex items-center justify-center my-1" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {items.map((item, idx) => {
            const radius = baseRadius + idx * gap;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (item.percentage / 100) * circumference;

            return (
              <React.Fragment key={idx}>
                {/* Track */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#f1f5f9"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  className="dark:stroke-slate-700/60"
                />
                {/* Active ring */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </React.Fragment>
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Mind</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 w-full mt-2 text-[10px]">
        {items.slice(0, 4).map((it, idx) => (
          <div key={idx} className="flex items-center space-x-1.5 truncate">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: it.color }}></span>
            <span className="text-slate-600 dark:text-slate-300 truncate">{it.title} - {it.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
