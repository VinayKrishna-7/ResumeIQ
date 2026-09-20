import React, { useState } from 'react';
import api from '../../services/api';
import { Sparkles, Check, Copy, X, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

const BulletImproverModal = ({ isOpen, onClose, initialBullet = '', roleContext = '' }) => {
  const [bullet, setBullet] = useState(initialBullet);
  const [userMetric, setUserMetric] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleImprove = async () => {
    if (!bullet.trim()) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const userGeminiKey = localStorage.getItem('resumeiq_user_gemini_key');
      const headers = {};
      if (userGeminiKey) {
        headers['x-user-gemini-key'] = userGeminiKey;
      }

      const res = await api.post(
        '/ai/improve-bullet',
        {
          bullet: bullet.trim(),
          roleContext,
          userMetric: userMetric.trim()
        },
        { headers }
      );

      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to improve bullet point.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.improvedBullet) {
      navigator.clipboard.writeText(result.improvedBullet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1120]/80 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#243044] dark:bg-[#111827] sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#243044]">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-[#818CF8] font-bold font-display text-base">
            <Sparkles className="h-5 w-5" />
            <span>AI Bullet Point Rewriter</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#172033] dark:text-[#94A3B8] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
              Original Experience Bullet
            </label>
            <textarea
              rows={3}
              value={bullet}
              onChange={(e) => setBullet(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
              Optional Verified Metric (Strict anti-hallucination)
            </label>
            <input
              type="text"
              value={userMetric}
              onChange={(e) => setUserMetric(e.target.value)}
              placeholder="e.g. reduced API response latency by 35%, supporting 50k users"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
            />
            <p className="mt-1 text-[11px] text-slate-400 dark:text-[#94A3B8]">
              ResumeIQ will never invent numbers. Supply your real metric above to weave it in smoothly.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleImprove}
              disabled={loading || !bullet.trim()}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-60 dark:bg-[#818CF8] dark:text-[#0B1120] dark:hover:bg-[#818CF8]/90 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Rewriting with Grounded AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Rewrite Bullet</span>
                </>
              )}
            </button>
          </div>

          {result && (
            <div className="mt-5 space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-[#243044] dark:bg-[#1E1B4B]/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 dark:text-[#818CF8]">
                  Grounded Improved Bullet:
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-700 shadow-2xs hover:bg-indigo-50 dark:border-[#243044] dark:bg-[#172033] dark:text-[#818CF8] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500 dark:text-[#34D399]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs font-medium text-slate-900 dark:text-[#F8FAFC] leading-relaxed">
                • {result.improvedBullet}
              </p>

              {result.rationale && result.rationale.length > 0 && (
                <div className="pt-2 border-t border-indigo-100 dark:border-[#243044]">
                  <span className="text-[11px] font-semibold text-indigo-800 dark:text-[#818CF8]">
                    Why this is better:
                  </span>
                  <ul className="mt-1 space-y-0.5 text-[11px] text-slate-600 dark:text-[#CBD5E1]">
                    {result.rationale.map((r, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-500 dark:text-[#34D399] shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.missingMetricNote && (
                <p className="text-[11px] text-amber-700 dark:text-[#FBBF24] italic">
                  💡 {result.missingMetricNote}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulletImproverModal;
