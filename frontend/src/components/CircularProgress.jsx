import React from 'react';

export default function CircularProgress({
  value = 0,
  max = 100,
  size = 140,
  strokeWidth = 10,
  color = '#0284c7', // Primary active color
  trackColor = '#e2e8f0',
  title = '',
  unit = '',
  icon: IconComponent = null,
  showPercentage = false,
  formatValue = null,
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const displayVal = formatValue ? formatValue(value) : value;

  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 dark:border-slate-700/60">
      {/* Top Floating Category Icon */}
      {IconComponent && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 bg-slate-50 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 shadow-xs">
          <IconComponent className="w-4 h-4" />
        </div>
      )}

      {/* Circle SVG */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            className="dark:stroke-slate-700"
          />
          {/* Active progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
            {title}
          </span>
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {showPercentage ? `${Math.round(percentage)}%` : displayVal}
          </span>
          {unit && (
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
