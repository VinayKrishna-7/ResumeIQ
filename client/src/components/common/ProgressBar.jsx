import React from 'react';

const ProgressBar = ({
  label,
  value = 0,
  weight,
  color = 'indigo',
  showValue = true,
  size = 'md'
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round(value)));

  let barBg = 'bg-[#6366F1] dark:bg-[#818CF8]';
  if (color === 'emerald' || percentage >= 80) barBg = 'bg-[#10B981] dark:bg-[#34D399]';
  else if (color === 'amber' || (percentage >= 60 && percentage < 80)) barBg = 'bg-[#6366F1] dark:bg-[#818CF8]';
  else if (color === 'rose' || percentage < 40) barBg = 'bg-[#EF4444] dark:bg-[#F87171]';
  else if (percentage < 60) barBg = 'bg-[#F59E0B] dark:bg-[#FBBF24]';

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {label} {weight && <span className="text-slate-400 font-normal">({weight})</span>}
        </span>
        {showValue && (
          <span className="font-bold text-slate-900 dark:text-white">
            {percentage}%
          </span>
        )}
      </div>
      <div className={`w-full overflow-hidden rounded-full bg-[#F1F5F9] dark:bg-[#243044] ${heightClass}`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-700 ease-out ${barBg}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
