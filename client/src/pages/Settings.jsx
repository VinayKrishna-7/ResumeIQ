import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Settings as SettingsIcon, Moon, Sun, Key, ShieldCheck, Sliders, CheckCircle2 } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('resumeiq_user_gemini_key') || '');
  const [savedKey, setSavedKey] = useState(false);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (geminiKey.trim()) {
      localStorage.setItem('resumeiq_user_gemini_key', geminiKey.trim());
    } else {
      localStorage.removeItem('resumeiq_user_gemini_key');
    }
    setSavedKey(true);
    setTimeout(() => setSavedKey(false), 3000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-[#F8FAFC]">
          Settings & Preferences
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1">
          Customize application behavior, appearance, and AI parameters.
        </p>
      </div>

      {/* Appearance Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-[#243044] dark:bg-[#111827]">
        <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
          {theme === 'dark' ? <Moon className="h-4 w-4 text-indigo-400 dark:text-[#818CF8]" /> : <Sun className="h-4 w-4 text-amber-500" />}
          <span>Appearance</span>
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-[#94A3B8]">
          Switch between crisp light theme and eye-friendly dark theme.
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-[#CBD5E1]">
            Current Theme: <span className="capitalize font-semibold text-indigo-600 dark:text-[#818CF8]">{theme}</span>
          </span>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-[#243044] dark:bg-[#172033] dark:text-[#CBD5E1] dark:hover:bg-[#243044] transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
      </div>

      {/* ATS Scoring Engine Weights Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-[#243044] dark:bg-[#111827]">
        <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
          <Sliders className="h-4 w-4 text-indigo-500 dark:text-[#818CF8]" />
          <span>ATS Matching Weights</span>
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-[#94A3B8]">
          Transparent, deterministic score weights configured according to the ResumeIQ scoring rubric.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: 'Skills Match', weight: '30%' },
            { label: 'Keyword Match', weight: '20%' },
            { label: 'Experience Match', weight: '20%' },
            { label: 'Project Match', weight: '15%' },
            { label: 'Resume Quality', weight: '10%' },
            { label: 'Education Match', weight: '5%' },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-[#243044] dark:bg-[#172033]"
            >
              <div className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8]">{item.label}</div>
              <div className="mt-1 text-base font-bold text-indigo-600 dark:text-[#818CF8]">{item.weight}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Key Override Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-[#243044] dark:bg-[#111827]">
        <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
          <Key className="h-4 w-4 text-indigo-500 dark:text-[#818CF8]" />
          <span>AI Model Configuration (Optional)</span>
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-[#94A3B8]">
          The server includes fallback heuristic AI and server-side keys. You may optionally supply your personal Google Gemini API key to route analysis through your own quota.
        </p>

        <form onSubmit={handleSaveKey} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
              Personal Gemini API Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#94A3B8]">
              <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-[#34D399]" />
              <span>Stored locally in browser session</span>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 dark:bg-[#818CF8] dark:text-[#0B1120] dark:hover:bg-[#818CF8]/90 transition-colors"
            >
              {savedKey ? 'Saved!' : 'Save Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
