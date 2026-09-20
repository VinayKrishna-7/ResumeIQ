import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ResumeUploader from '../components/resume/ResumeUploader';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import {
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Calendar,
  Layers,
  Search,
  Loader2,
  AlertCircle
} from 'lucide-react';

const Resumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resumes');
      if (res.data.success) {
        setResumes(res.data.data.resumes);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    try {
      setDeletingId(id);
      await api.delete(`/resumes/${id}`);
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredResumes = resumes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.originalFilename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-[#F8FAFC]">
            My Resumes
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1">
            Manage your parsed resumes, inspect structured data, and analyze against target jobs.
          </p>
        </div>

        <button
          onClick={() => setShowUploader((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 dark:bg-[#818CF8] dark:text-[#0B1120] dark:hover:bg-[#818CF8]/90 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{showUploader ? 'Close Uploader' : 'Upload New Resume'}</span>
        </button>
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

      {/* Conditional Uploader */}
      {showUploader && (
        <ResumeUploader
          onUploadSuccess={(newResume) => {
            setResumes((prev) => [newResume, ...prev]);
            setShowUploader(false);
          }}
        />
      )}

      {/* Filter / Search bar */}
      {resumes.length > 0 && (
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resumes by name..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
          />
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-600 dark:text-[#818CF8] mb-2" />
          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Loading your resumes...</p>
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Upload your first PDF or DOCX resume to get structured skill extraction and ATS analysis."
          actionText="Upload Resume"
          onAction={() => setShowUploader(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResumes.map((resume) => {
            const skillCount = resume.parsedData?.skills?.length || 0;
            const expCount = resume.parsedData?.experience?.length || 0;
            const fileSizeMB = (resume.fileSize / 1024 / 1024).toFixed(2);

            return (
              <div
                key={resume._id}
                onClick={() => navigate(`/resumes/${resume._id}`)}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 dark:border-[#243044] dark:bg-[#111827] dark:hover:border-[#818CF8]/50 transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-[#1E1B4B] dark:text-[#818CF8] group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm font-display text-slate-900 dark:text-[#F8FAFC] truncate">
                          {resume.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 dark:text-[#94A3B8] truncate mt-0.5">
                          {resume.originalFilename}
                        </p>
                      </div>
                    </div>

                    <Badge variant={resume.fileType === 'pdf' ? 'primary' : 'warning'} size="sm">
                      {resume.fileType.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Highlights */}
                  <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 dark:text-[#94A3B8]">
                    <div className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-indigo-500 dark:text-[#818CF8]" />
                      <span>{skillCount} Skills</span>
                    </div>
                    <div>•</div>
                    <div>{expCount} Experience {expCount === 1 ? 'Role' : 'Roles'}</div>
                    <div>•</div>
                    <div>{fileSizeMB} MB</div>
                  </div>

                  {/* Skills pill preview */}
                  {skillCount > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {resume.parsedData.skills.slice(0, 4).map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-[#172033] dark:text-[#CBD5E1] border border-slate-200 dark:border-[#243044]"
                        >
                          {s}
                        </span>
                      ))}
                      {skillCount > 4 && (
                        <span className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:bg-[#172033]/60 dark:text-[#94A3B8]">
                          +{skillCount - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-[#243044] text-[11px] text-slate-400 dark:text-[#94A3B8]">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/analyze?resumeId=${resume._id}`);
                      }}
                      className="flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-[#1E1B4B] dark:text-[#818CF8] dark:hover:bg-[#1E1B4B]/80 transition-colors"
                      title="Analyze against a target job"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Analyze</span>
                    </button>

                    <button
                      onClick={(e) => handleDelete(resume._id, e)}
                      disabled={deletingId === resume._id}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:text-[#94A3B8] transition-colors"
                      title="Delete Resume"
                    >
                      {deletingId === resume._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Resumes;
