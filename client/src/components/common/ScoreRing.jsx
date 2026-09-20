import React from 'react';

const ScoreRing = ({
  score = 0,
  size = 130,
  strokeWidth = 10,
  label = 'Match Score',
  sublabel = ''
}) => {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedScore / 100) * circumference;

  let colorClass = 'text-emerald-500 stroke-emerald-500 dark:text-[#34D399] dark:stroke-[#34D399]';
  let badgeBg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-[#34D399]';
  let ratingText = 'Strong Match';

  if (normalizedScore < 40) {
    colorClass = 'text-rose-500 stroke-rose-500 dark:text-[#F87171] dark:stroke-[#F87171]';
    badgeBg = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-[#F87171]';
    ratingText = 'Needs Attention';
  } else if (normalizedScore < 60) {
    colorClass = 'text-amber-500 stroke-amber-500 dark:text-[#FBBF24] dark:stroke-[#FBBF24]';
    badgeBg = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-[#FBBF24]';
    ratingText = 'Needs Attention';
  } else if (normalizedScore < 80) {
    colorClass = 'text-indigo-600 stroke-indigo-600 dark:text-[#818CF8] dark:stroke-[#818CF8]';
    badgeBg = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-[#818CF8]';
    ratingText = 'Moderate Match';
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="h-full w-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            className="stroke-[#F1F5F9] dark:stroke-[#243044]"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${colorClass}`}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {normalizedScore}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-3">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          {label}
        </h4>
        <p className="mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
          <span className={`inline-block rounded-md px-2 py-0.5 ${badgeBg}`}>
            {sublabel || ratingText}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ScoreRing;
