import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  Sparkles,
  Files,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileText,
  Check,
  Building2,
  ChevronDown
} from 'lucide-react';

const Analyze = () => {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobMode, setJobMode] = useState('paste'); // default to 'paste' as requested

  // Pasted job fields
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedCompany, setPastedCompany] = useState('');
  const [pastedDescription, setPastedDescription] = useState('');

  // Inline upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileInputRef = useRef(null);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const stages = [
    { label: 'Extracting content', key: 1 },
    { label: 'Understanding job requirements', key: 2 },
    { label: 'Matching skills & taxonomy', key: 3 },
    { label: 'Calculating ATS score', key: 4 },
    { label: 'Generating recommendations', key: 5 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingInitial(true);
        const [resumesRes, jobsRes] = await Promise.all([
          api.get('/resumes'),
          api.get('/jobs')
        ]);

        const rList = resumesRes.data?.data?.resumes || [];
        const jList = jobsRes.data?.data?.jobs || [];

        setResumes(rList);
        setJobs(jList);

        const queryResume = searchParams.get('resumeId');
        const queryJob = searchParams.get('jobId');

        if (queryResume && rList.some((r) => r._id === queryResume)) {
          setSelectedResumeId(queryResume);
        } else if (rList.length > 0) {
          setSelectedResumeId(rList[0]._id);
        }

        if (queryJob && jList.some((j) => j._id === queryJob)) {
          setSelectedJobId(queryJob);
          setJobMode('saved');
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load workspace.');
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Handle direct resume file upload
  const handleFileUpload = async (file) => {
    if (!file) return;
    const validExts = ['pdf', 'docx', 'doc'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!validExts.includes(ext)) {
      setErrorMessage('Please upload a PDF or DOCX resume.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds 5MB limit.');
      return;
    }

    setUploadingResume(true);
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('name', file.name.replace(/\.[^/.]+$/, ''));

      const res = await api.post('/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        const newResume = res.data.data.resume;
        setResumes((prev) => [newResume, ...prev]);
        setSelectedResumeId(newResume._id);
        setUploadedFile(file);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload and parse resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleStartAnalysis = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedResumeId) {
      setErrorMessage('Please upload or select a resume.');
      return;
    }

    if (jobMode === 'saved' && !selectedJobId) {
      setErrorMessage('Please select a saved target job or paste a job description.');
      return;
    }

    if (jobMode === 'paste' && (!pastedTitle.trim() || !pastedDescription.trim())) {
      setErrorMessage('Please provide both the Job Title and Job Description text.');
      return;
    }

    setAnalyzing(true);
    setAnalysisStep(1);

    const interval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 700);

    try {
      const payload = { resumeId: selectedResumeId };

      if (jobMode === 'saved') {
        payload.jobId = selectedJobId;
      } else {
        payload.targetJobTitle = pastedTitle.trim();
        payload.targetJobCompany = pastedCompany.trim();
        payload.targetJobDescription = pastedDescription.trim();
      }

      const userGeminiKey = localStorage.getItem('resumeiq_user_gemini_key');
      const headers = {};
      if (userGeminiKey) {
        headers['x-user-gemini-key'] = userGeminiKey;
      }

      const res = await api.post('/analyses', payload, { headers });

      clearInterval(interval);
      setAnalysisStep(5);

      if (res.data.success) {
        const analysisId = res.data.data.analysis._id;
        setTimeout(() => {
          navigate(`/analysis/${analysisId}`);
        }, 500);
      }
    } catch (err) {
      clearInterval(interval);
      setAnalyzing(false);
      setAnalysisStep(0);
      setErrorMessage(err.message || 'Analysis failed. Please try again.');
    }
  };

  const selectedResume = resumes.find((r) => r._id === selectedResumeId);

  if (loadingInitial) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-[#64748B] dark:text-[#94A3B8]">
        <Loader2 className="h-7 w-7 animate-spin text-[#6366F1] dark:text-[#818CF8] mb-2" />
        <p className="text-xs font-medium">Loading analysis workspace...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
          Analyze Resume
        </h1>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
          Evaluate resume alignment against any target job using deterministic ATS scoring.
        </p>
      </div>

      {/* Progress Indicator: 01 Resume ── 02 Job ── 03 Analyze */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 dark:border-[#243044]">
        <div className="flex items-center gap-2">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
            selectedResumeId
              ? 'bg-[#10B981] text-white dark:bg-[#34D399]'
              : 'bg-[#6366F1] text-white'
          }`}>
            {selectedResumeId ? '✓' : '01'}
          </span>
          <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            Resume
          </span>
        </div>

        <div className="flex-1 mx-4 h-0.5 bg-[#E2E8F0] dark:bg-[#243044]" />

        <div className="flex items-center gap-2">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
            (jobMode === 'paste' ? pastedDescription.trim() : selectedJobId)
              ? 'bg-[#10B981] text-white dark:bg-[#34D399]'
              : 'bg-[#F1F5F9] text-[#64748B] dark:bg-[#172033] dark:text-[#94A3B8]'
          }`}>
            {(jobMode === 'paste' ? pastedDescription.trim() : selectedJobId) ? '✓' : '02'}
          </span>
          <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            Job
          </span>
        </div>

        <div className="flex-1 mx-4 h-0.5 bg-[#E2E8F0] dark:bg-[#243044]" />

        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F1F5F9] text-xs font-bold text-[#64748B] dark:bg-[#172033] dark:text-[#94A3B8]">
            03
          </span>
          <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
            Analyze
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-[#F87171]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleStartAnalysis} className="space-y-8">
        {/* Step 1: Resume Upload / Selection */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs dark:border-[#243044] dark:bg-[#111827] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Upload your resume
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                PDF or DOCX · Maximum 5MB
              </p>
            </div>

            {resumes.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Or pick existing:</span>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-1 px-2.5 text-xs font-medium text-[#0F172A] dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC] focus:outline-none"
                >
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Upload Dropzone */}
          {selectedResume ? (
            <div className="rounded-xl border border-indigo-100 bg-[#EEF2FF]/60 p-4 dark:border-indigo-900/50 dark:bg-[#1E1B4B]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6366F1] text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {selectedResume.name}
                  </p>
                  <p className="text-[11px] text-[#4F46E5] dark:text-[#818CF8] flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] dark:text-[#34D399]" />
                    <span>Ready to analyze</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] dark:text-[#818CF8] transition-colors"
              >
                Upload different file
              </button>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                dragActive
                  ? 'border-[#6366F1] bg-indigo-50/50 dark:bg-[#1E1B4B]/30'
                  : 'border-[#E2E8F0] hover:border-indigo-300 hover:bg-[#F8FAFC] dark:border-[#243044] dark:hover:bg-[#172033]/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                className="hidden"
              />

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-[#6366F1] dark:bg-[#1E1B4B] dark:text-[#818CF8] mb-3">
                {uploadingResume ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <UploadCloud className="h-6 w-6" />
                )}
              </div>

              <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                {uploadingResume ? 'Extracting text and structure...' : 'Click to upload or drag & drop'}
              </p>
              <p className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                PDF, DOCX up to 5MB
              </p>
            </div>
          )}
        </div>

        {/* Step 2: Target Job Description */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs dark:border-[#243044] dark:bg-[#111827] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Target job description
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Paste the role details you're applying for
              </p>
            </div>

            {jobs.length > 0 && (
              <div className="flex rounded-lg border border-[#E2E8F0] p-0.5 text-xs font-semibold dark:border-[#243044]">
                <button
                  type="button"
                  onClick={() => setJobMode('paste')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    jobMode === 'paste'
                      ? 'bg-[#6366F1] text-white'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  Paste New
                </button>
                <button
                  type="button"
                  onClick={() => setJobMode('saved')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    jobMode === 'saved'
                      ? 'bg-[#6366F1] text-white'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  Saved Roles ({jobs.length})
                </button>
              </div>
            )}
          </div>

          {jobMode === 'saved' ? (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                Select Saved Role
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#0F172A] dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC] focus:outline-none"
              >
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} {job.company ? `(${job.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                    Job Title <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={pastedTitle}
                    onChange={(e) => setPastedTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="mt-1 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC] focus:border-[#6366F1] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={pastedCompany}
                    onChange={(e) => setPastedCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="mt-1 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC] focus:border-[#6366F1] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]">
                  Job Description Text <span className="text-[#EF4444]">*</span>
                </label>
                <textarea
                  rows={6}
                  value={pastedDescription}
                  onChange={(e) => setPastedDescription(e.target.value)}
                  placeholder="Paste the job description you're applying for..."
                  className="mt-1 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#0F172A] placeholder-[#94A3B8] dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC] focus:border-[#6366F1] focus:outline-none"
                />
              </div>

              {/* Requirement Checklist Helper */}
              <div className="rounded-lg bg-[#F8FAFC] p-3 border border-[#E2E8F0] dark:bg-[#172033]/40 dark:border-[#243044]">
                <span className="text-[11px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
                  We'll automatically extract:
                </span>
                <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-[#10B981] dark:text-[#34D399]" />
                    <span>Required skills</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-[#10B981] dark:text-[#34D399]" />
                    <span>Preferred skills</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-[#10B981] dark:text-[#34D399]" />
                    <span>Experience years</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-[#10B981] dark:text-[#34D399]" />
                    <span>Core keywords</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-[#10B981] dark:text-[#34D399]" />
                    <span>Education criteria</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={analyzing}
            className="flex items-center gap-2 rounded-xl bg-[#6366F1] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#4F46E5] disabled:opacity-60 transition-colors w-full sm:w-auto justify-center"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running Analysis...</span>
              </>
            ) : (
              <>
                <span>Analyze Resume</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Multi-Stage Loading Overlay */}
      {analyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1120]/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl dark:border-[#243044] dark:bg-[#111827] sm:p-8">
            <div className="flex items-center gap-2 text-[#6366F1] dark:text-[#818CF8] font-display font-bold text-base mb-1">
              <Sparkles className="h-5 w-5" />
              <span>Analyzing your resume...</span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mb-6">
              Running deterministic matching & qualitative evaluation
            </p>

            <div className="space-y-3.5">
              {stages.map((st) => {
                const isPassed = analysisStep > st.key;
                const isCurrent = analysisStep === st.key;
                return (
                  <div key={st.key} className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${
                      isPassed
                        ? 'text-[#0F172A] dark:text-[#F8FAFC]'
                        : isCurrent
                        ? 'text-[#6366F1] dark:text-[#818CF8] font-bold'
                        : 'text-[#64748B] dark:text-[#94A3B8]/60'
                    }`}>
                      {st.label}
                    </span>

                    <div>
                      {isPassed ? (
                        <Check className="h-4 w-4 text-[#10B981] dark:text-[#34D399]" />
                      ) : isCurrent ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6366F1] dark:text-[#818CF8]" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#E2E8F0] dark:bg-[#243044] inline-block" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analyze;
