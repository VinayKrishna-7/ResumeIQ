import React, { useState } from 'react';
import api from '../../services/api';
import { Sparkles, Check, Copy, X, Loader2, AlertCircle } from 'lucide-react';

const SummaryImproverModal = ({
  isOpen,
  onClose,
  initialSummary = '',
  skills = [],
  jobTitle = '',
  jobDescription = ''
}) => {
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleImprove = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const userGeminiKey = localStorage.getItem('resumeiq_user_gemini_key');
      const headers = {};
      if (userGeminiKey) {
        headers['x-user-gemini-key'] = userGeminiKey;
      }

      const res = await api.post(
        '/ai/improve-summary',
        {
          originalSummary: summary.trim(),
          skills,
          jobTitle,
          jobDescription
        },
        { headers }
      );

      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to optimize summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.improvedSummary) {
      navigator.clipboard.writeText(result.improvedSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1120]/80 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#243044] dark:bg-[#111827] sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#243044]">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-[#818CF8] font-bold font-display text-base">
            <Sparkles className="h-5 w-5" />
            <span>AI Professional Summary Optimizer</span>
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
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8] mb-1">
              <span className="font-semibold text-slate-700 dark:text-[#CBD5E1]">Target Role:</span>
              <span className="font-bold text-indigo-600 dark:text-[#818CF8]">{jobTitle || 'Software Engineer'}</span>
            </div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
              Original Summary
            </label>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Paste or edit your original professional summary..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleImprove}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-60 dark:bg-[#818CF8] dark:text-[#0B1120] dark:hover:bg-[#818CF8]/90 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Aligning with Target Role...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{result ? 'Regenerate Summary' : 'Optimize Summary'}</span>
                </>
              )}
            </button>
          </div>

          {result && (
            <div className="mt-5 space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 dark:border-[#243044] dark:bg-[#1E1B4B]/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 dark:text-[#818CF8]">
                  Tailored Professional Summary:
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
                      <span>Copy Summary</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs font-medium text-slate-900 dark:text-[#F8FAFC] leading-relaxed bg-white/70 dark:bg-[#111827] p-3.5 rounded-lg border border-indigo-100 dark:border-[#243044]">
                {result.improvedSummary}
              </p>

              {result.keyChanges && result.keyChanges.length > 0 && (
                <div className="pt-2 border-t border-indigo-100 dark:border-[#243044]">
                  <span className="text-[11px] font-semibold text-indigo-800 dark:text-[#818CF8]">
                    Strategic Adjustments:
                  </span>
                  <ul className="mt-1 space-y-1 text-[11px] text-slate-600 dark:text-[#CBD5E1]">
                    {result.keyChanges.map((change, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-500 dark:text-[#34D399] shrink-0" />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryImproverModal;
