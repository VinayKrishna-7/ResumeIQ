import React, { useState } from 'react';
import api from '../../services/api';
import {
  Sparkles,
  Layers,
  ArrowRight,
  X,
  Loader2,
  AlertCircle,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

const ResumeCompareModal = ({ isOpen, onClose, resumes = [], jobs = [] }) => {
  const [resumeId1, setResumeId1] = useState(resumes[0]?._id || '');
  const [resumeId2, setResumeId2] = useState(resumes[1]?._id || resumes[0]?._id || '');
  const [jobId, setJobId] = useState(jobs[0]?._id || '');

  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCompare = async () => {
    if (!resumeId1 || !resumeId2 || !jobId) {
      setErrorMsg('Please select two resumes and a target job to compare.');
      return;
    }

    if (resumeId1 === resumeId2) {
      setErrorMsg('Please select two different resume versions to compare.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/analyses/compare', {
        resumeId1,
        resumeId2,
        jobId
      });

      if (res.data.success) {
        setComparison(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1120]/80 p-4 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#243044] dark:bg-[#111827] sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#243044]">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-[#818CF8] font-bold font-display text-base">
            <Layers className="h-5 w-5" />
            <span>Resume Version Comparison</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#172033] dark:text-[#94A3B8] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500 dark:text-[#94A3B8]">
          Compare two versions of your resume against the same job to pinpoint differences in skill alignment and ATS compatibility.
        </p>

        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Selection Row */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
              Resume A
            </label>
            <select
              value={resumeId1}
              onChange={(e) => setResumeId1(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
            >
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
              Resume B
            </label>
            <select
              value={resumeId2}
              onChange={(e) => setResumeId2(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
            >
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
              Target Job Description
            </label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
            >
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title} {j.company ? `(${j.company})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCompare}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-60 dark:bg-[#818CF8] dark:text-[#0B1120] dark:hover:bg-[#818CF8]/90 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Comparing Versions...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Run Comparison</span>
              </>
            )}
          </button>
        </div>

        {/* Results Showcase */}
        {comparison && (
          <div className="mt-6 space-y-5 border-t border-slate-100 pt-5 dark:border-[#243044]">
            <div className="grid grid-cols-2 gap-4">
              {/* Resume A Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-[#243044] dark:bg-[#172033]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#94A3B8]">Version A</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC] truncate">
                  {comparison.resume1.name}
                </h4>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Match Score:</span>
                  <span className="text-xl font-extrabold text-indigo-600 dark:text-[#818CF8]">
                    {comparison.resume1.overallScore}%
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8]">
                  <span>Resume Health:</span>
                  <span className="font-bold text-emerald-600 dark:text-[#34D399]">
                    {comparison.resume1.resumeHealthScore}/100
                  </span>
                </div>

                <div className="mt-3 border-t border-slate-200 pt-2 dark:border-[#243044] text-xs">
                  <span className="text-[11px] text-slate-400 dark:text-[#94A3B8]">Skills Matched ({comparison.resume1.matchedSkills.length}):</span>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {comparison.resume1.matchedSkills.slice(0, 5).map((s, i) => (
                      <span key={i} className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-[#111827] dark:text-[#CBD5E1] border border-slate-200 dark:border-[#243044]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resume B Card */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-[#243044] dark:bg-[#1E1B4B]/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-[#818CF8]">Version B</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC] truncate">
                  {comparison.resume2.name}
                </h4>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Match Score:</span>
                  <span className="text-xl font-extrabold text-indigo-600 dark:text-[#818CF8]">
                    {comparison.resume2.overallScore}%
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8]">
                  <span>Resume Health:</span>
                  <span className="font-bold text-emerald-600 dark:text-[#34D399]">
                    {comparison.resume2.resumeHealthScore}/100
                  </span>
                </div>

                <div className="mt-3 border-t border-indigo-100 pt-2 dark:border-[#243044] text-xs">
                  <span className="text-[11px] text-slate-400 dark:text-[#94A3B8]">Skills Matched ({comparison.resume2.matchedSkills.length}):</span>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {comparison.resume2.matchedSkills.slice(0, 5).map((s, i) => (
                      <span key={i} className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-[#111827] dark:text-[#CBD5E1] border border-slate-200 dark:border-[#243044]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Differential Breakdown */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#243044] dark:bg-[#172033] space-y-2.5">
              <h5 className="font-bold text-xs text-slate-900 dark:text-[#F8FAFC]">
                Key Strategic Differences:
              </h5>

              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-[#CBD5E1]">
                {comparison.differences.scoreDiff !== 0 && (
                  <li className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-500 dark:text-[#818CF8] shrink-0" />
                    <span>
                      {comparison.differences.scoreDiff > 0
                        ? `Resume B scores ${comparison.differences.scoreDiff}% higher overall against this job.`
                        : `Resume A scores ${Math.abs(comparison.differences.scoreDiff)}% higher overall against this job.`}
                    </span>
                  </li>
                )}

                {comparison.differences.skillsOnlyInResume2.length > 0 && (
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-[#34D399] shrink-0" />
                    <span>
                      Skills captured in Resume B that are missing in Resume A:{' '}
                      <strong className="text-slate-900 dark:text-[#F8FAFC]">{comparison.differences.skillsOnlyInResume2.join(', ')}</strong>.
                    </span>
                  </li>
                )}

                {comparison.differences.skillsOnlyInResume1.length > 0 && (
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 dark:text-[#FBBF24] shrink-0" />
                    <span>
                      Skills captured in Resume A that are missing in Resume B:{' '}
                      <strong className="text-slate-900 dark:text-[#F8FAFC]">{comparison.differences.skillsOnlyInResume1.join(', ')}</strong>.
                    </span>
                  </li>
                )}

                {comparison.differences.bulletQualityDiff !== 0 && (
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-[#818CF8] shrink-0" />
                    <span>
                      {comparison.differences.bulletQualityDiff > 0
                        ? 'Resume B demonstrates higher action-verb density and bullet point specificity.'
                        : 'Resume A demonstrates higher action-verb density and bullet point specificity.'}
                    </span>
                  </li>
                )}
              </ul>

              <p className="mt-3 text-[11px] text-slate-400 dark:text-[#94A3B8] italic">
                * Note: Neither resume is universally superior. The comparison is calibrated strictly against the selected target role.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeCompareModal;
