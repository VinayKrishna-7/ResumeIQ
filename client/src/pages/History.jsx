import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import ResumeCompareModal from '../components/resume/ResumeCompareModal';
import {
  History as HistoryIcon,
  Search,
  Download,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const History = () => {
  const [analyses, setAnalyses] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const fetchAnalyses = async (targetPage = 1) => {
    try {
      setLoading(true);
      const [analysesRes, resumesRes, jobsRes] = await Promise.all([
        api.get(`/analyses?page=${targetPage}&limit=12`),
        api.get('/resumes'),
        api.get('/jobs')
      ]);

      if (analysesRes.data.success) {
        setAnalyses(analysesRes.data.data.analyses);
        setPage(analysesRes.data.data.pagination.page);
        setTotalPages(analysesRes.data.data.pagination.pages || 1);
      }
      setResumes(resumesRes.data.data.resumes || []);
      setJobs(jobsRes.data.data.jobs || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses(page);
  }, [page]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this analysis result?')) return;

    try {
      setDeletingId(id);
      await api.delete(`/analyses/${id}`);
      setAnalyses((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete analysis.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (id, jobTitle, e) => {
    e.stopPropagation();
    try {
      const res = await api.get(`/analyses/${id}/report`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ResumeIQ-Report-${(jobTitle || 'Job').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to download PDF report. Please try again.');
    }
  };

  const filteredAnalyses = analyses.filter((a) =>
    (a.jobId?.title && a.jobId.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (a.resumeId?.name && a.resumeId.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
            <HistoryIcon className="h-6 w-6 text-indigo-600 dark:text-[#818CF8]" />
            <span>Analysis History</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1">
            Review past evaluations, track ATS scores over time, and compare resume versions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {resumes.length >= 2 && jobs.length >= 1 && (
            <button
              onClick={() => setCompareModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-[#243044] dark:bg-[#172033] dark:text-[#CBD5E1] dark:hover:bg-[#243044] transition-colors"
            >
              <Layers className="h-4 w-4 text-indigo-500 dark:text-[#818CF8]" />
              <span>Compare Resumes</span>
            </button>
          )}

          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 dark:bg-[#818CF8] dark:text-[#0B1120] dark:hover:bg-[#818CF8]/90 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>New Analysis</span>
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Input */}
      {analyses.length > 0 && (
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title or resume name..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
          />
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-600 dark:text-[#818CF8] mb-2" />
          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Loading analysis records...</p>
        </div>
      ) : analyses.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No analyses yet"
          description="Analyze your resume against a target job to start tracking ATS matching progress."
          actionText="Run First Analysis"
          actionLink="/analyze"
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#243044] dark:bg-[#111827] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold font-display uppercase tracking-wider text-slate-500 dark:border-[#243044] dark:bg-[#172033] dark:text-[#CBD5E1]">
                <tr>
                  <th className="py-3.5 px-4">Target Job</th>
                  <th className="py-3.5 px-4">Resume</th>
                  <th className="py-3.5 px-4 text-center">Match Score</th>
                  <th className="py-3.5 px-4 text-center">Resume Health</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#243044]">
                {filteredAnalyses.map((item) => {
                  const matchVariant =
                    item.overallScore >= 80 ? 'success' : item.overallScore >= 60 ? 'warning' : 'danger';

                  return (
                    <tr
                      key={item._id}
                      onClick={() => navigate(`/analysis/${item._id}`)}
                      className="hover:bg-slate-50/70 dark:hover:bg-[#172033]/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                          {item.jobId?.title || 'Target Job'}
                        </p>
                        {item.jobId?.company && (
                          <p className="text-[11px] text-slate-400 dark:text-[#94A3B8] truncate mt-0.5">
                            {item.jobId.company}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-[#CBD5E1]">
                        <span className="truncate block">{item.resumeId?.name || 'Resume'}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={matchVariant} size="sm">
                          {item.overallScore}%
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-semibold text-slate-700 dark:text-[#CBD5E1]">
                          {item.resumeHealthScore}/100
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 dark:text-[#94A3B8] whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleDownload(item._id, item.jobId?.title, e)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-[#172033] dark:hover:text-[#818CF8] dark:text-[#94A3B8] transition-colors"
                            title="Download PDF Report"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => navigate(`/analysis/${item._id}`)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-[#172033] dark:hover:text-[#818CF8] dark:text-[#94A3B8] transition-colors"
                            title="View Full Report"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={(e) => handleDelete(item._id, e)}
                            disabled={deletingId === item._id}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:text-[#94A3B8] transition-colors"
                            title="Delete"
                          >
                            {deletingId === item._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-[#243044] text-xs">
              <span className="text-slate-400 dark:text-[#94A3B8]">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:border-[#243044] dark:bg-[#172033] dark:text-[#CBD5E1] dark:hover:bg-[#243044]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:border-[#243044] dark:bg-[#172033] dark:text-[#CBD5E1] dark:hover:bg-[#243044]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compare Resumes Modal */}
      <ResumeCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        resumes={resumes}
        jobs={jobs}
      />
    </div>
  );
};

export default History;
