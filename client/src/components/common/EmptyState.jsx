import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  actionLink,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white p-12 text-center dark:border-[#243044] dark:bg-[#111827]">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-[#1E1B4B] dark:text-[#818CF8] mb-4 shadow-xs">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="text-base font-bold font-display text-slate-900 dark:text-[#F8FAFC]">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8]">
        {description}
      </p>

      {actionText && (
        <div className="mt-6">
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              {actionText}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
