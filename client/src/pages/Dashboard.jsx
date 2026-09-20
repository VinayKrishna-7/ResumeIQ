import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/common/EmptyState';
import {
  Sparkles,
  Files,
  TrendingUp,
  ShieldCheck,
  History,
  ArrowRight,
  Loader2,
  ChevronRight,
  ExternalLink,
  Target
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [resumesRes, jobsRes, analysesRes] = await Promise.all([
          api.get('/resumes'),
          api.get('/jobs'),
          api.get('/analyses?limit=10')
        ]);

        setResumes(resumesRes.data?.data?.resumes || []);
        setJobs(jobsRes.data?.data?.jobs || []);
        setAnalyses(analysesRes.data?.data?.analyses || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalResumes = resumes.length;
  const totalAnalyses = analyses.length;

  const latestAnalysis = analyses[0] || null;
  const latestMatchScore = latestAnalysis ? latestAnalysis.overallScore : null;

  const avgMatchScore =
    totalAnalyses > 0
      ? Math.round(analyses.reduce((acc, a) => acc + (a.overallScore || 0), 0) / totalAnalyses)
      : latestMatchScore;

  const avgHealthScore =
    totalAnalyses > 0
      ? Math.round(analyses.reduce((acc, a) => acc + (a.resumeHealthScore || 0), 0) / totalAnalyses)
      : (latestAnalysis?.resumeHealthScore || null);

  // Time formatter helper
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // Prepare chart data (chronological)
  const chartData = [...analyses]
    .reverse()
    .map((a, i) => ({
      name: a.jobId?.title ? (a.jobId.title.length > 16 ? a.jobId.title.slice(0, 16) + '...' : a.jobId.title) : `Run ${i + 1}`,
      matchScore: a.overallScore,
      healthScore: a.resumeHealthScore
    }));

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-[#64748B] dark:text-[#94A3B8]">
        <Loader2 className="h-7 w-7 animate-spin text-[#6366F1] dark:text-[#818CF8] mb-2" />
        <p className="text-xs font-medium">Loading workspace insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Subtitle and + New Analysis CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
            Track your resume performance and recent analyses.
          </p>
        </div>

        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 rounded-xl bg-[#6366F1] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#4F46E5] transition-colors self-start sm:self-auto"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>+ New Analysis</span>
        </Link>
      </div>

      {/* 4 Compact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Job Match Card */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs dark:border-[#243044] dark:bg-[#111827]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">Job Match</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-[#6366F1] dark:bg-[#1E1B4B] dark:text-[#818CF8]">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#6366F1] dark:text-[#818CF8]">
              {avgMatchScore !== null ? `${avgMatchScore}%` : '—'}
            </p>
            {latestAnalysis && (
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-[#34D399] bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
                {totalAnalyses > 1 ? 'Avg match' : 'Latest match'}
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
            {latestAnalysis?.jobId?.title || 'Target role compatibility'}
          </p>
        </div>

        {/* Resume Health Card */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs dark:border-[#243044] dark:bg-[#111827]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">Resume Health</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-[#10B981] dark:bg-emerald-950/40 dark:text-[#34D399]">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
              {avgHealthScore !== null ? avgHealthScore : '—'}
            </p>
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-bold">/ 100</span>
          </div>
          <p className="mt-2 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Structure, impact & readability
          </p>
        </div>

        {/* Resumes Count Card */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs dark:border-[#243044] dark:bg-[#111827]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">Resumes</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#475569] dark:bg-[#172033] dark:text-[#CBD5E1]">
              <Files className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
            {totalResumes}
          </p>
          <Link
            to="/resumes"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#6366F1] hover:text-[#4F46E5] dark:text-[#818CF8] transition-colors"
          >
            <span>View library</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Total Analyses Count Card */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs dark:border-[#243044] dark:bg-[#111827]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">Analyses</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#475569] dark:bg-[#172033] dark:text-[#CBD5E1]">
              <History className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
            {totalAnalyses}
          </p>
          <Link
            to="/history"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#6366F1] hover:text-[#4F46E5] dark:text-[#818CF8] transition-colors"
          >
            <span>View history</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Score Trend Timeline (if analyses >= 2) */}
      {chartData.length >= 2 && (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs dark:border-[#243044] dark:bg-[#111827]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Match Score History
              </h2>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Progression across evaluated job applications
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-xs text-[#475569] dark:text-[#CBD5E1]">
                <span className="h-2 w-2 rounded-full bg-[#6366F1] dark:bg-[#818CF8]" />
                <span>Job Match %</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#475569] dark:text-[#CBD5E1]">
                <span className="h-2 w-2 rounded-full bg-[#10B981] dark:bg-[#34D399]" />
                <span>Resume Health</span>
              </div>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#243044',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F8FAFC'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="matchScore"
                  name="Job Match %"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  dot={{ fill: '#6366F1', r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="healthScore"
                  name="Resume Health"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ fill: '#10B981', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Analyses Section */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#243044] dark:bg-[#111827] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4 dark:border-[#243044]">
          <div>
            <h2 className="font-display text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Recent Analyses
            </h2>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Latest evaluation runs and skill match breakdowns
            </p>
          </div>
          {analyses.length > 0 && (
            <Link
              to="/history"
              className="text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] dark:text-[#818CF8] transition-colors"
            >
              View all ({analyses.length})
            </Link>
          )}
        </div>

        {analyses.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Target}
              title="No analyses yet"
              description="Upload your resume and select a target job description to get your first explainable match score."
              actionText="Run First Analysis"
              actionLink="/analyze"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B] dark:border-[#243044] dark:bg-[#172033] dark:text-[#94A3B8]">
                  <th className="py-3 px-5">Target Role</th>
                  <th className="py-3 px-4 text-center">Match</th>
                  <th className="py-3 px-4 text-center">Resume Health</th>
                  <th className="py-3 px-4 hidden md:table-cell">Key Skills</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Analyzed</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#243044] text-xs">
                {analyses.slice(0, 6).map((a) => {
                  const roleTitle = a.jobId?.title || 'Target Job Evaluation';
                  const company = a.jobId?.company || '';
                  const matchedSkills = a.skills?.matched || [];

                  let matchBadgeClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-[#34D399] border-emerald-200 dark:border-emerald-900/50';
                  if (a.overallScore < 60) {
                    matchBadgeClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-[#F87171] border-rose-200 dark:border-rose-900/50';
                  } else if (a.overallScore < 80) {
                    matchBadgeClass = 'bg-indigo-50 text-[#4F46E5] dark:bg-[#1E1B4B] dark:text-[#818CF8] border-indigo-200 dark:border-indigo-900/50';
                  }

                  return (
                    <tr
                      key={a._id}
                      onClick={() => navigate(`/analysis/${a._id}`)}
                      className="hover:bg-[#F8FAFC] dark:hover:bg-[#172033]/50 transition-colors cursor-pointer group"
                    >
                      {/* Target Role */}
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#6366F1] dark:group-hover:text-[#818CF8] transition-colors line-clamp-1">
                          {roleTitle}
                        </div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] line-clamp-1 mt-0.5">
                          {company ? `${company} • ` : ''}
                          {a.resumeId?.name || 'Resume'}
                        </div>
                      </td>

                      {/* Match Score Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${matchBadgeClass}`}>
                          {a.overallScore}%
                        </span>
                      </td>

                      {/* Resume Health */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                          {a.resumeHealthScore}
                        </span>
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">/100</span>
                      </td>

                      {/* Skills Preview */}
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        {matchedSkills.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1 max-w-xs">
                            {matchedSkills.slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] font-medium text-[#475569] dark:bg-[#172033] dark:text-[#CBD5E1]"
                              >
                                {s}
                              </span>
                            ))}
                            {matchedSkills.length > 3 && (
                              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                                +{matchedSkills.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">—</span>
                        )}
                      </td>

                      {/* Analyzed Timestamp */}
                      <td className="py-3.5 px-4 text-[11px] text-[#64748B] dark:text-[#94A3B8] hidden sm:table-cell">
                        {formatTimeAgo(a.createdAt)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#6366F1] group-hover:text-[#4F46E5] dark:text-[#818CF8] dark:group-hover:text-indigo-300 transition-colors">
                          <span>View</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
