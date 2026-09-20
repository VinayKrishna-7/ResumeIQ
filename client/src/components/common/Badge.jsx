import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const variants = {
    default: 'bg-[#F1F5F9] text-[#475569] dark:bg-[#172033] dark:text-[#CBD5E1]',
    primary: 'bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200 dark:bg-[#1E1B4B] dark:text-[#818CF8] dark:border-indigo-900/60',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-[#34D399] dark:border-emerald-900/50',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-[#FBBF24] dark:border-amber-900/50',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-[#F87171] dark:border-rose-900/50',
    outline: 'border border-[#E2E8F0] text-[#475569] dark:border-[#243044] dark:text-[#CBD5E1]'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] font-semibold',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-medium'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
