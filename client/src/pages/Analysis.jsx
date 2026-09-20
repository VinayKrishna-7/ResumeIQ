import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ScoreRing from '../components/common/ScoreRing';
import ProgressBar from '../components/common/ProgressBar';
import Badge from '../components/common/Badge';
import BulletImproverModal from '../components/analysis/BulletImproverModal';
import SummaryImproverModal from '../components/analysis/SummaryImproverModal';
import ResumeCompareModal from '../components/resume/ResumeCompareModal';
import {
  Sparkles,
  Download,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Briefcase,
  Layers,
  Search,
  FolderGit2,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  Award,
  Zap,
  Check,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Printer,
  Loader2,
  RotateCcw,
  Sliders,
  Quote,
  Clock,
  Target,
  FileCheck
} from 'lucide-react';

const Analysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  // Modals state
  const [bulletModalOpen, setBulletModalOpen] = useState(false);
  const [selectedBullet, setSelectedBullet] = useState('');
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/analyses/${id}`);
        if (res.data.success) {
          setAnalysis(res.data.data.analysis);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load analysis results.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  useEffect(() => {
    const fetchAuxData = async () => {
      try {
        const [resumesRes, jobsRes] = await Promise.all([
          api.get('/resumes'),
          api.get('/jobs')
        ]);
        if (resumesRes.data?.success) setResumes(resumesRes.data.data.resumes || []);
        if (jobsRes.data?.success) setJobs(jobsRes.data.data.jobs || []);
      } catch (_) {}
    };
    fetchAuxData();
  }, []);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingReport(true);
      const res = await api.get(`/analyses/${id}/report`, {
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `ResumeIQ-Report-${(analysis.jobId?.title || 'Job').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setActionError(err.message || 'Failed to download PDF report. You can use Print View instead.');
    } finally {
      setDownloadingReport(false);
    }
  };

  const openBulletImprover = (bulletText) => {
    setSelectedBullet(bulletText);
    setBulletModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-9 w-9 animate-spin text-indigo-600 dark:text-[#818CF8] mb-3" />
        <p className="text-sm font-medium text-slate-700 dark:text-[#CBD5E1]">
          Loading comprehensive analysis...
        </p>
      </div>
    );
  }

  if (errorMsg || !analysis) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-8 text-center text-rose-800 dark:border-[#243044] dark:bg-[#111827] dark:text-rose-300">
        <AlertTriangle className="mx-auto h-8 w-8 text-rose-500 mb-2" />
        <h3 className="font-bold text-base">Analysis Not Found</h3>
        <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">{errorMsg || 'Could not retrieve analysis report.'}</p>
        <Link
          to="/analyze"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 dark:bg-[#818CF8] dark:text-[#0B1120] dark:hover:bg-[#818CF8]/90 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Start New Analysis
        </Link>
      </div>
    );
  }

  const { overallScore, resumeHealthScore, scores, skills, keywords, experience, projects, quality } = analysis;
  const jobTitle = analysis.jobId?.title || 'Target Job';
  const company = analysis.jobId?.company || '';
  const resumeName = analysis.resumeId?.name || 'Resume';

  const matchedSkillsCount = skills?.matched?.length || 0;
  const missingSkillsCount = (skills?.missing?.length || 0) || (skills?.requiredMissing?.length || 0) + (skills?.preferredMissing?.length || 0);
  const totalSkillsCount = matchedSkillsCount + missingSkillsCount;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'skills', label: `Skills (${matchedSkillsCount}/${totalSkillsCount})`, icon: Layers },
    { id: 'keywords', label: `Keywords (${keywords?.coverage || 0}%)`, icon: Search },
    { id: 'experience', label: `Experience (${scores?.experience || 0}%)`, icon: Briefcase },
    { id: 'projects', label: `Projects (${projects?.length || 0})`, icon: FolderGit2 },
    { id: 'quality', label: `Health (${resumeHealthScore})`, icon: ShieldCheck },
    { id: 'recommendations', label: `Action Items (${analysis.recommendations?.length || 0})`, icon: Zap }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Actions Bar (Section 13) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-[#243044] dark:bg-[#172033] dark:text-[#CBD5E1] dark:hover:bg-[#243044] transition-colors"
            title="Back to History"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                {jobTitle}
              </h1>
              {company && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-[#172033] dark:text-[#CBD5E1] border border-slate-200 dark:border-[#243044]">
                  {company}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span>Resume: <strong className="text-slate-700 dark:text-[#CBD5E1]">{resumeName}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Re-analyze */}
          <button
            onClick={() => navigate(`/analyze?resumeId=${analysis.resumeId?._id || ''}&jobId=${analysis.jobId?._id || ''}`)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-[#243044] dark:bg-[#172033] dark:text-[#CBD5E1] dark:hover:bg-[#243044] transition-colors"
            title="Re-run analysis with fresh parsing"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500 dark:text-[#94A3B8]" />
            <span>Re-analyze</span>
          </button>

          {/* Compare Resumes */}
          {resumes.length >= 2 && (
            <button
              onClick={() => setCompareModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-[#243044] dark:bg-[#172033] dark:text-[#CBD5E1] dark:hover:bg-[#243044] transition-colors"
              title="Compare against another resume version"
            >
              <Layers className="h-3.5 w-3.5 text-indigo-500 dark:text-[#818CF8]" />
              <span>Compare</span>
            </button>
          )}

          {/* Optimize Summary Modal Trigger */}
          <button
            onClick={() => setSummaryModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100/70 dark:border-indigo-900/60 dark:bg-[#1E1B4B] dark:text-[#818CF8] transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Optimize Summary</span>
          </button>

          {/* Download PDF Report */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingReport}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 dark:bg-[#818CF8] dark:text-[#0B1120] dark:hover:bg-[#818CF8]/90 transition-colors"
          >
            {downloadingReport ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>Download Report</span>
          </button>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-[#243044] dark:bg-[#172033] dark:text-[#CBD5E1] dark:hover:bg-[#243044] transition-colors"
            title="Print or Save as PDF"
          >
            <Printer className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {actionError && (
        <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50/80 px-4 py-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError('')}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Score Showcase Card (Sections 14-16) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#243044] dark:bg-[#111827] sm:p-7">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
          {/* Main ATS Match Score Ring */}
          <div className="md:col-span-4 flex flex-col items-center justify-center border-b pb-6 md:border-b-0 md:border-r md:pb-0 border-slate-100 dark:border-[#243044]">
            <ScoreRing
              score={overallScore}
              size={150}
              strokeWidth={12}
              label="ATS Match Score"
              sublabel={
                overallScore >= 80
                  ? 'Strong Match'
                  : overallScore >= 60
                  ? 'Moderate Match'
                  : 'Needs Attention'
              }
            />
            <p className="mt-2.5 text-[11px] text-slate-400 dark:text-[#94A3B8] text-center max-w-[220px]">
              Deterministic multi-factor compatibility index
            </p>
          </div>

          {/* Secondary Resume Health Score Ring */}
          <div className="md:col-span-3 flex flex-col items-center justify-center border-b pb-6 md:border-b-0 md:border-r md:pb-0 border-slate-100 dark:border-[#243044]">
            <ScoreRing
              score={resumeHealthScore}
              size={124}
              strokeWidth={10}
              label="Resume Health"
              sublabel={
                resumeHealthScore >= 80 ? 'Well Structured' : 'Formatting Improvements Needed'
              }
            />
            <p className="mt-2.5 text-[11px] text-slate-400 dark:text-[#94A3B8] text-center max-w-[190px]">
              Independent structural clarity & readability
            </p>
          </div>

          {/* Dimension Mini-Bars */}
          <div className="md:col-span-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-400 dark:text-[#94A3B8]">
                Scoring Dimensions
              </h3>
              <button
                onClick={() => setShowScoreBreakdown((prev) => !prev)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-500 dark:text-[#818CF8] flex items-center gap-1"
              >
                <span>Why this score?</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showScoreBreakdown ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <ProgressBar label="Skills Match" value={scores?.skills} weight="30%" />
            <ProgressBar label="Keyword Coverage" value={scores?.keywords} weight="20%" />
            <ProgressBar label="Experience Alignment" value={scores?.experience} weight="20%" />
            <ProgressBar label="Project Relevance" value={scores?.projects} weight="15%" />
            <ProgressBar label="Resume Quality" value={scores?.quality} weight="10%" />
            <ProgressBar label="Education Match" value={scores?.education} weight="5%" size="sm" />
          </div>
        </div>

        {/* Qualitative Data-Driven Summary Banner */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#243044] flex items-start gap-3 rounded-lg bg-slate-50/80 p-4 dark:bg-[#172033]/60">
          <Target className="h-4 w-4 text-indigo-600 dark:text-[#818CF8] shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-[#CBD5E1] leading-relaxed">
            <strong className="text-slate-900 dark:text-[#F8FAFC]">Executive Summary: </strong>
            Candidate resume matches <strong className="text-indigo-600 dark:text-[#818CF8]">{matchedSkillsCount}</strong> of <strong className="text-slate-900 dark:text-[#F8FAFC]">{totalSkillsCount || 'all'}</strong> detected core skills with <strong className="text-indigo-600 dark:text-[#818CF8]">{keywords?.coverage || 0}%</strong> keyword alignment.
            {experience?.candidateYears !== undefined && (
              <span> Demonstrates approx. <strong>~{experience.candidateYears} years</strong> experience{experience?.requiredYears ? ` against ${experience.requiredYears}+ years requested.` : '.'}</span>
            )}
          </div>
        </div>

        {/* Expandable "Why this score?" Cards (Section 15) */}
        {showScoreBreakdown && analysis.explanations && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#243044] space-y-3">
            <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5" />
              <span>Transparent Scoring Rubric & Deterministic Rationale</span>
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {analysis.explanations.skills && (
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-[#243044] dark:bg-[#172033]">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-[#F8FAFC]">
                    <span>Skills Match</span>
                    <span className="font-bold text-indigo-600 dark:text-[#818CF8]">{scores?.skills}% (30%)</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                    {analysis.explanations.skills}
                  </p>
                </div>
              )}

              {analysis.explanations.keywords && (
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-[#243044] dark:bg-[#172033]">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-[#F8FAFC]">
                    <span>Keyword Coverage</span>
                    <span className="font-bold text-indigo-600 dark:text-[#818CF8]">{scores?.keywords}% (20%)</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                    {analysis.explanations.keywords}
                  </p>
                </div>
              )}

              {analysis.explanations.experience && (
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-[#243044] dark:bg-[#172033]">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-[#F8FAFC]">
                    <span>Experience Alignment</span>
                    <span className="font-bold text-indigo-600 dark:text-[#818CF8]">{scores?.experience}% (20%)</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                    {analysis.explanations.experience}
                  </p>
                </div>
              )}

              {analysis.explanations.projects && (
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-[#243044] dark:bg-[#172033]">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-[#F8FAFC]">
                    <span>Project Relevance</span>
                    <span className="font-bold text-indigo-600 dark:text-[#818CF8]">{scores?.projects}% (15%)</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                    {analysis.explanations.projects}
                  </p>
                </div>
              )}

              {analysis.explanations.quality && (
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-[#243044] dark:bg-[#172033]">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-[#F8FAFC]">
                    <span>Resume Quality</span>
                    <span className="font-bold text-indigo-600 dark:text-[#818CF8]">{scores?.quality}% (10%)</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                    {analysis.explanations.quality}
                  </p>
                </div>
              )}

              {analysis.explanations.education && (
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-[#243044] dark:bg-[#172033]">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-[#F8FAFC]">
                    <span>Education Match</span>
                    <span className="font-bold text-indigo-600 dark:text-[#818CF8]">{scores?.education}% (5%)</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                    {analysis.explanations.education}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modern Tabs Navigation */}
      <div className="no-print flex overflow-x-auto border-b border-slate-200 dark:border-[#243044] scrollbar-none gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:border-[#818CF8] dark:text-[#818CF8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[#94A3B8] dark:hover:text-[#CBD5E1]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Data-Driven Match Score Rationale */}
          {analysis.explanations?.overall && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4.5 dark:border-[#243044] dark:bg-[#1E1B4B]/50">
              <div className="flex items-start gap-3.5">
                <div className="rounded-lg bg-indigo-600 p-2 text-white shadow-sm dark:bg-[#818CF8] dark:text-[#0B1120]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-display uppercase tracking-wider text-indigo-900 dark:text-[#818CF8]">
                    Why This ATS Match Score?
                  </h3>
                  <p className="mt-1 text-xs text-slate-700 dark:text-[#CBD5E1] leading-relaxed font-medium">
                    {analysis.explanations.overall}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Strengths */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#243044] dark:bg-[#111827]">
              <h3 className="text-sm font-bold font-display text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-[#34D399]" />
                <span>Key Candidate Strengths</span>
              </h3>
              <p className="mt-1 text-xs text-slate-400 dark:text-[#94A3B8]">
                Verified qualifications matching the target role requirements:
              </p>
              <ul className="mt-4 space-y-2.5">
                {analysis.strengths && analysis.strengths.length > 0 ? (
                  analysis.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-[#CBD5E1]">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-[#172033] dark:text-[#34D399] mt-0.5 font-bold">
                        ✓
                      </span>
                      <span className="leading-relaxed">{str}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-400">No major strengths highlighted.</li>
                )}
              </ul>
            </div>

            {/* Weaknesses / Gaps */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#243044] dark:bg-[#111827]">
              <h3 className="text-sm font-bold font-display text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-[#FBBF24]" />
                <span>Areas to Improve & Potential Gaps</span>
              </h3>
              <p className="mt-1 text-xs text-slate-400 dark:text-[#94A3B8]">
                Target qualifications where the resume demonstrates less evidence:
              </p>
              <ul className="mt-4 space-y-2.5">
                {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                  analysis.weaknesses.map((weak, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-[#CBD5E1]">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-[#172033] dark:text-[#FBBF24] mt-0.5 font-bold">
                        ⚠
                      </span>
                      <span className="leading-relaxed">{weak}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-400">No major gaps identified.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Top Prioritized Recommendations Showcase */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-[#243044] dark:bg-[#111827]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#243044]">
              <div>
                <h3 className="text-sm font-bold font-display text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-600 dark:text-[#818CF8]" />
                  <span>Top Prioritized Recommendations</span>
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-[#94A3B8] mt-0.5">
                  Anti-hallucination grounded improvements from your uploaded resume.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('recommendations')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-[#818CF8] flex items-center gap-1"
              >
                <span>View All Actions</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {(analysis.recommendations || []).slice(0, 3).map((rec, idx) => {
                const priority = (rec.priority || 'medium').toLowerCase();
                const isCritical = priority === 'critical' || priority === 'high';
                const priorityVariant = isCritical ? 'danger' : priority === 'medium' || priority === 'important' ? 'warning' : 'default';

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-[#243044] dark:bg-[#172033]/60"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={priorityVariant} size="sm">
                          {priority.toUpperCase()} PRIORITY
                        </Badge>
                        {rec.section && (
                          <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:bg-[#243044] dark:text-[#CBD5E1]">
                            {rec.section}
                          </span>
                        )}
                        {rec.requiresUserInput && (
                          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            Requires Metric
                          </span>
                        )}
                        <h4 className="font-bold text-xs text-slate-900 dark:text-[#F8FAFC]">
                          {rec.title}
                        </h4>
                      </div>

                      {/* AI Action button */}
                      {rec.evidence && (
                        <button
                          onClick={() => openBulletImprover(rec.evidence)}
                          className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-indigo-700 shadow-xs hover:bg-indigo-50 dark:border-[#243044] dark:bg-[#111827] dark:text-[#818CF8] dark:hover:bg-[#172033] transition-colors"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Improve with AI</span>
                        </button>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
                      <strong className="text-slate-800 dark:text-[#F8FAFC]">Issue:</strong> {rec.issue || rec.problem}
                    </p>

                    {/* Distinctive grounded evidence quote */}
                    {rec.evidence && (
                      <div className="mt-2.5 rounded-lg border border-slate-200 bg-white p-3 font-mono text-[11px] text-slate-800 dark:border-[#243044] dark:bg-[#111827] dark:text-[#CBD5E1]">
                        <div className="flex items-center gap-1 text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-[#94A3B8] mb-1">
                          <Quote className="h-3 w-3" />
                          <span>Evidence from your resume:</span>
                        </div>
                        "{rec.evidence}"
                      </div>
                    )}

                    <p className="mt-2 text-xs text-indigo-700 dark:text-[#818CF8] leading-relaxed font-medium">
                      <strong>Action:</strong> {rec.action || rec.recommendation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. SKILLS TAB (Two-Column Matched vs Missing - Sections 17-18) */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {analysis.explanations?.skills && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4.5 dark:border-[#243044] dark:bg-[#1E1B4B]/50">
              <span className="text-[11px] font-bold font-display uppercase tracking-wider text-indigo-900 dark:text-[#818CF8]">
                Skills Match Diagnostic
              </span>
              <p className="mt-1 text-xs text-slate-700 dark:text-[#CBD5E1] font-medium leading-relaxed">
                {analysis.explanations.skills}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Matched Skills Column */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-[#243044] dark:bg-[#111827]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#243044]">
                <h3 className="text-sm font-bold font-display text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-[#34D399]" />
                  <span>Matched Skills ({skills?.matched?.length || 0})</span>
                </h3>
                <Badge variant="success" size="sm">Detected in Resume</Badge>
              </div>

              <p className="mt-3 text-xs text-slate-500 dark:text-[#94A3B8]">
                These technical skills and qualifications were explicitly verified in your resume:
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {skills?.matched && skills.matched.length > 0 ? (
                  skills.matched.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-[#243044] dark:bg-[#172033] dark:text-[#34D399]"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-[#34D399]" />
                      <span>{s}</span>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No overlapping skills found.</p>
                )}
              </div>
            </div>

            {/* Missing Skills Column (Required & Preferred Gaps) */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-[#243044] dark:bg-[#111827]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#243044]">
                <h3 className="text-sm font-bold font-display text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500 dark:text-[#F87171]" />
                  <span>Missing Skills ({missingSkillsCount})</span>
                </h3>
                <Badge variant="danger" size="sm">Action Needed</Badge>
              </div>

              <p className="mt-3 text-xs text-slate-500 dark:text-[#94A3B8]">
                Incorporate these if you possess genuine hands-on experience:
              </p>

              {/* Missing Required Skills */}
              <div className="mt-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-[#F87171]">
                  <span>Required Qualifications ({skills?.requiredMissing?.length || 0}):</span>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-2">
                  {skills?.requiredMissing && skills.requiredMissing.length > 0 ? (
                    skills.requiredMissing.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-[#F87171]"
                      >
                        <span className="text-[10px] font-bold uppercase bg-rose-200/80 dark:bg-rose-900 px-1 py-0.5 rounded">REQUIRED</span>
                        <span>{s}</span>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-emerald-600 dark:text-[#34D399] font-medium">All required core skills are present in your resume!</p>
                  )}
                </div>
              </div>

              {/* Missing Preferred Skills */}
              {skills?.preferredMissing && skills.preferredMissing.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#243044]">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-[#FBBF24]">
                    <span>Preferred / Bonus Qualifications ({skills.preferredMissing.length}):</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {skills.preferredMissing.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-[#FBBF24]"
                      >
                        <span className="text-[10px] font-bold uppercase bg-amber-200/80 dark:bg-amber-900 px-1 py-0.5 rounded">PREFERRED</span>
                        <span>{s}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Why Missing Skills Matter Callout */}
              <div className="mt-5 rounded-lg border border-slate-200/80 bg-slate-50 p-3 text-[11px] text-slate-600 dark:border-[#243044] dark:bg-[#172033] dark:text-[#94A3B8]">
                <strong>Why this matters:</strong> ATS filters calculate raw token overlap for required qualifications first. Unrepresented required skills are the #1 reason qualified candidates are filtered out prior to recruiter review.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. KEYWORDS TAB */}
      {activeTab === 'keywords' && (
        <div className="space-y-6">
          {analysis.explanations?.keywords && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4.5 dark:border-[#243044] dark:bg-[#1E1B4B]/50">
              <span className="text-[11px] font-bold font-display uppercase tracking-wider text-indigo-900 dark:text-[#818CF8]">
                Domain Keyword Diagnostic
              </span>
              <p className="mt-1 text-xs text-slate-700 dark:text-[#CBD5E1] font-medium leading-relaxed">
                {analysis.explanations.keywords}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-[#243044] dark:bg-[#111827]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                  <Search className="h-5 w-5 text-indigo-600 dark:text-[#818CF8]" />
                  <span>Keyword Coverage Analysis</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                  Analysis of domain keywords, technical acronyms, and methodologies from the target job description.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-indigo-600 dark:text-[#818CF8]">
                  {keywords?.coverage || 0}%
                </span>
                <span className="text-xs font-semibold text-slate-400 dark:text-[#94A3B8]">Coverage</span>
              </div>
            </div>

            {/* Keyword stuffing warning banner */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-[#FBBF24]">
              💡 <strong>ATS Best Practice:</strong> Only incorporate keywords that accurately reflect your genuine experience. Avoid keyword stuffing, as hiring managers review shortlisted resumes during initial technical screenings.
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-[#34D399]">
                  Matched Keywords ({keywords?.matched?.length || 0})
                </h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {keywords?.matched && keywords.matched.length > 0 ? (
                    keywords.matched.map((kw, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-[#172033] dark:text-[#34D399] border border-emerald-200 dark:border-[#243044]"
                      >
                        ✓ {kw}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No matched keywords found.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-[#F87171]">
                  Missing Keywords ({keywords?.missing?.length || 0})
                </h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {keywords?.missing && keywords.missing.length > 0 ? (
                    keywords.missing.map((kw, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-[#172033] dark:text-[#F87171] border border-rose-200 dark:border-[#243044]"
                      >
                        ⚠ {kw}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-emerald-600 dark:text-[#34D399]">All target keywords are represented!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. EXPERIENCE TAB (Vertical Timeline & Bullet Inspector - Sections 19-20) */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          {analysis.explanations?.experience && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4.5 dark:border-[#243044] dark:bg-[#1E1B4B]/50">
              <span className="text-[11px] font-bold font-display uppercase tracking-wider text-indigo-900 dark:text-[#818CF8]">
                Experience Alignment Diagnostic
              </span>
              <p className="mt-1 text-xs text-slate-700 dark:text-[#CBD5E1] font-medium leading-relaxed">
                {analysis.explanations.experience}
              </p>
            </div>
          )}

          {/* Alignment Overview Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-[#243044] dark:bg-[#111827]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-600 dark:text-[#818CF8]" />
                  <span>Experience Alignment ({scores?.experience || 0}%)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                  Candidate demonstrates approx. ~{experience?.candidateYears || 0} years experience
                  {experience?.requiredYears > 0 ? ` (Target role asks for ${experience.requiredYears}+ years)` : ''}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 dark:text-[#94A3B8]">Bullet Quality Score:</span>
                <Badge variant={experience?.bulletQuality >= 75 ? 'success' : 'warning'} size="md">
                  {experience?.bulletQuality || 65}/100
                </Badge>
              </div>
            </div>

            {/* Strengths & Gaps lists */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 dark:border-[#243044] dark:bg-[#172033]">
                <span className="text-xs font-bold text-emerald-800 dark:text-[#34D399]">
                  Experience Strengths
                </span>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-700 dark:text-[#CBD5E1]">
                  {(experience?.strengths || []).map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 dark:text-[#34D399] font-bold">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 dark:border-[#243044] dark:bg-[#172033]">
                <span className="text-xs font-bold text-amber-800 dark:text-[#FBBF24]">
                  Potential Experience Gaps
                </span>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-700 dark:text-[#CBD5E1]">
                  {(experience?.gaps || []).map((g, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 dark:text-[#FBBF24] font-bold">⚠</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Individual Experience Bullet Point Inspector with AI Rewriter */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-[#243044] dark:bg-[#111827]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#243044]">
              <div>
                <h3 className="text-sm font-bold font-display text-slate-900 dark:text-[#F8FAFC]">
                  Experience Bullet Point Inspector
                </h3>
                <p className="text-xs text-slate-400 dark:text-[#94A3B8] mt-0.5">
                  Click "Improve with AI" to generate a grounded, impact-driven rewrite with stronger active verbs.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {experience?.bulletEvaluations && experience.bulletEvaluations.length > 0 ? (
                experience.bulletEvaluations.map((evalItem, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-[#243044] dark:bg-[#172033]/60 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <p className="text-xs font-medium text-slate-800 dark:text-[#F8FAFC]">
                        • {evalItem.bullet}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 dark:text-[#94A3B8]">
                        <span>Quality: <strong className={evalItem.qualityScore >= 75 ? 'text-emerald-600 dark:text-[#34D399]' : 'text-amber-600 dark:text-[#FBBF24]'}>{evalItem.qualityScore}/100</strong></span>
                        <span>•</span>
                        <span className={evalItem.isStrongVerb ? 'text-emerald-600 dark:text-[#34D399]' : 'text-amber-600 dark:text-[#FBBF24]'}>
                          {evalItem.isStrongVerb ? '✓ Strong Action Verb' : '⚠ Passive / Weak Verb'}
                        </span>
                        <span>•</span>
                        <span className={evalItem.hasMetric ? 'text-emerald-600 dark:text-[#34D399]' : 'text-amber-600 dark:text-[#FBBF24]'}>
                          {evalItem.hasMetric ? '✓ Verified Metric' : '⚠ No Quantifiable Metric'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openBulletImprover(evalItem.bullet)}
                      className="self-start sm:self-center inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs hover:bg-indigo-50 dark:border-[#243044] dark:bg-[#111827] dark:text-[#818CF8] dark:hover:bg-[#172033] transition-colors"
                    >
                      <Sparkles className="h-3 w-3 text-indigo-600 dark:text-[#818CF8]" />
                      <span>Improve with AI</span>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No bullets parsed for inspection.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {analysis.explanations?.projects && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4.5 dark:border-[#243044] dark:bg-[#1E1B4B]/50">
              <span className="text-[11px] font-bold font-display uppercase tracking-wider text-indigo-900 dark:text-[#818CF8]">
                Projects Diagnostic
              </span>
              <p className="mt-1 text-xs text-slate-700 dark:text-[#CBD5E1] font-medium leading-relaxed">
                {analysis.explanations.projects}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {projects && projects.length > 0 ? (
              projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-[#243044] dark:bg-[#111827]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold font-display text-sm text-slate-900 dark:text-[#F8FAFC]">
                        {proj.title}
                      </h3>
                      <Badge variant="primary" size="sm">
                        {proj.overallScore}% Overall
                      </Badge>
                    </div>

                    {/* Progress metrics */}
                    <div className="mt-4 space-y-2">
                      <ProgressBar label="Relevance to Role" value={proj.relevance} size="sm" />
                      <ProgressBar label="Technical Depth" value={proj.technicalDepth} size="sm" />
                      <ProgressBar label="Description Quality" value={proj.descriptionQuality} size="sm" />
                      <ProgressBar label="Measurable Impact" value={proj.impact} size="sm" />
                    </div>

                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {proj.technologies.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-[#172033] dark:text-[#CBD5E1] border border-slate-200 dark:border-[#243044]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {proj.recommendations && proj.recommendations.length > 0 && (
                    <div className="mt-5 border-t border-slate-100 pt-3 dark:border-[#243044]">
                      <span className="text-[11px] font-semibold text-indigo-700 dark:text-[#818CF8]">
                        Suggestions to elevate project impact:
                      </span>
                      <ul className="mt-1 space-y-1 text-[11px] text-slate-500 dark:text-[#94A3B8]">
                        {proj.recommendations.map((r, rIdx) => (
                          <li key={rIdx}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No projects analyzed in this resume.</p>
            )}
          </div>
        </div>
      )}

      {/* 6. RESUME HEALTH / QUALITY TAB */}
      {activeTab === 'quality' && (
        <div className="space-y-6">
          {analysis.explanations?.quality && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4.5 dark:border-[#243044] dark:bg-[#1E1B4B]/50">
              <span className="text-[11px] font-bold font-display uppercase tracking-wider text-indigo-900 dark:text-[#818CF8]">
                Quality & Structure Diagnostic
              </span>
              <p className="mt-1 text-xs text-slate-700 dark:text-[#CBD5E1] font-medium leading-relaxed">
                {analysis.explanations.quality}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-[#243044] dark:bg-[#111827]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-[#818CF8]" />
                  <span>Resume Health & Diagnostic Quality</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                  Evaluated independently of any single job description based on structural clarity, readability, and recruiter heuristics.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold text-indigo-600 dark:text-[#818CF8]">
                  {resumeHealthScore}
                </span>
                <span className="text-xs font-semibold text-slate-400 dark:text-[#94A3B8]">/ 100</span>
              </div>
            </div>

            {/* Quality Checklist Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: 'Structural Hierarchy', key: 'structure' },
                { label: 'Readability & Length', key: 'readability' },
                { label: 'Formatting Consistency', key: 'consistency' },
                { label: 'Bullet Point Strength', key: 'bulletQuality' },
                { label: 'Professional Summary', key: 'summary' },
                { label: 'Contact Details', key: 'contactInfo' },
              ].map((item, idx) => {
                const status = quality?.checklist?.[item.key] || 'pass';
                const isPass = status === 'pass';

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3.5 flex items-center justify-between ${
                      isPass
                        ? 'border-emerald-200 bg-emerald-50/50 dark:border-[#243044] dark:bg-[#172033]'
                        : 'border-amber-200 bg-amber-50/50 dark:border-[#243044] dark:bg-[#172033]'
                    }`}
                  >
                    <span className="text-xs font-semibold text-slate-800 dark:text-[#CBD5E1]">
                      {item.label}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isPass ? 'text-emerald-600 dark:text-[#34D399]' : 'text-amber-600 dark:text-[#FBBF24]'
                      }`}
                    >
                      {isPass ? '✓ Pass' : '⚠ Caution'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quality Issues List */}
            {quality?.issues && quality.issues.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-4 dark:border-[#243044]">
                <h4 className="text-xs font-bold font-display text-slate-900 dark:text-[#F8FAFC] uppercase tracking-wider">
                  Diagnostic Observations
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-[#CBD5E1]">
                  {quality.issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 dark:text-[#FBBF24] font-bold">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. RECOMMENDATIONS & IMPROVEMENTS TAB (Evidence-based & Actionable) */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-[#243044] dark:bg-[#111827]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#243044]">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                  <Zap className="h-5 w-5 text-indigo-600 dark:text-[#818CF8]" />
                  <span>Prioritized Action Plan</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                  Address these sequential items to optimize ATS scoring and improve hiring manager conversion.
                </p>
              </div>

              <div className="rounded-lg bg-indigo-50/70 px-3 py-1.5 text-[11px] font-medium text-indigo-700 dark:bg-[#1E1B4B] dark:text-[#818CF8] border border-indigo-200 dark:border-[#243044]">
                🔒 Strictly grounded in uploaded resume text
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {analysis.recommendations && analysis.recommendations.length > 0 ? (
                analysis.recommendations.map((rec, idx) => {
                  const priority = (rec.priority || 'medium').toLowerCase();
                  const isCritical = priority === 'critical' || priority === 'high';
                  const priorityVariant = isCritical ? 'danger' : priority === 'medium' || priority === 'important' ? 'warning' : 'default';

                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-[#243044] dark:bg-[#172033]/60"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={priorityVariant} size="sm">
                            {priority.toUpperCase()} PRIORITY
                          </Badge>
                          {rec.section && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:bg-[#243044] dark:text-[#CBD5E1]">
                              {rec.section}
                            </span>
                          )}
                          {rec.requiresUserInput && (
                            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              Requires Metric
                            </span>
                          )}
                          <h4 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC] font-display">
                            {idx + 1}. {rec.title}
                          </h4>
                        </div>

                        {rec.evidence && (
                          <button
                            onClick={() => openBulletImprover(rec.evidence)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs hover:bg-indigo-50 dark:border-[#243044] dark:bg-[#111827] dark:text-[#818CF8] dark:hover:bg-[#172033] transition-colors"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>Improve with AI</span>
                          </button>
                        )}
                      </div>

                      <div className="mt-3 space-y-2.5 text-xs">
                        <p className="text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
                          <strong className="text-slate-900 dark:text-[#F8FAFC]">Issue:</strong> {rec.issue || rec.problem}
                        </p>

                        {/* Resume Evidence Quote */}
                        {rec.evidence && (
                          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-800 dark:border-[#243044] dark:bg-[#111827] dark:text-[#CBD5E1]">
                            <div className="flex items-center gap-1 font-sans font-bold uppercase text-[10px] tracking-wider text-slate-500 dark:text-[#94A3B8] mb-1">
                              <Quote className="h-3 w-3" />
                              <span>Quoted Resume Evidence:</span>
                            </div>
                            "{rec.evidence}"
                          </div>
                        )}

                        {/* Recruiter & ATS Impact */}
                        {rec.whyItMatters && (
                          <p className="text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
                            <strong className="text-slate-900 dark:text-[#F8FAFC]">Why It Matters:</strong> {rec.whyItMatters}
                          </p>
                        )}

                        {/* Recommended Action */}
                        <p className="text-indigo-700 dark:text-[#818CF8] font-medium leading-relaxed">
                          <strong>Recommended Action:</strong> {rec.action || rec.recommendation}
                        </p>

                        {/* Grounded Improvement Example */}
                        {rec.example && (
                          <div className="mt-2.5 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-indigo-950 dark:border-indigo-900/40 dark:bg-[#1E1B4B]/30 dark:text-[#CBD5E1]">
                            <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-indigo-700 dark:text-[#818CF8] mb-1">
                              <Sparkles className="h-3 w-3" />
                              <span>Grounded Improvement Example:</span>
                            </div>
                            <span className="font-mono text-[11px] leading-relaxed block">"{rec.example}"</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400">No recommendations available.</p>
              )}
            </div>
          </div>

          {/* Section-by-Section Guidance */}
          {analysis.sectionImprovements && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-[#243044] dark:bg-[#111827]">
              <h3 className="text-sm font-bold font-display text-slate-900 dark:text-[#F8FAFC] uppercase tracking-wider text-indigo-600 dark:text-[#818CF8]">
                Section-By-Section Guidance
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.keys(analysis.sectionImprovements).map((secKey) => {
                  const items = analysis.sectionImprovements[secKey];
                  if (!items || items.length === 0) return null;

                  return (
                    <div
                      key={secKey}
                      className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-[#243044] dark:bg-[#172033]/60"
                    >
                      <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-800 dark:text-[#F8FAFC] capitalize">
                        {secKey} Section
                      </h4>

                      {items.map((it, itIdx) => (
                        <div key={itIdx} className="mt-2.5 text-xs space-y-1">
                          <p className="text-slate-600 dark:text-[#CBD5E1]">
                            <strong>Issue:</strong> {it.issue}
                          </p>
                          <p className="text-indigo-600 dark:text-[#818CF8]">
                            <strong>Guidance:</strong> {it.recommendation}
                          </p>
                          {it.example && (
                            <p className="rounded-md bg-white p-2 text-[11px] font-mono text-slate-700 dark:bg-[#111827] dark:text-[#CBD5E1] border border-slate-200 dark:border-[#243044]">
                              "{it.example}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <BulletImproverModal
        isOpen={bulletModalOpen}
        onClose={() => setBulletModalOpen(false)}
        initialBullet={selectedBullet}
        roleContext={jobTitle}
      />

      <SummaryImproverModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        initialSummary={analysis.resumeId?.parsedData?.summary || ''}
        skills={skills?.matched || []}
        jobTitle={jobTitle}
        jobDescription={analysis.jobId?.description || ''}
      />

      <ResumeCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        resumes={resumes}
        jobs={jobs}
      />
    </div>
  );
};

export default Analysis;
