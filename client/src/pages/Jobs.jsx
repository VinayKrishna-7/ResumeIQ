import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  MapPin,
  Building2,
  Calendar,
  Layers,
  Search,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: ''
  });

  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs');
      if (res.data.success) {
        setJobs(res.data.data.jobs);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openCreateModal = () => {
    setEditingJob(null);
    setModalError('');
    setFormData({
      title: '',
      company: '',
      location: '',
      description: ''
    });
    setShowModal(true);
  };

  const openEditModal = async (job, e) => {
    e.stopPropagation();
    setModalError('');
    try {
      const res = await api.get(`/jobs/${job._id}`);
      if (res.data.success) {
        const fullJob = res.data.data.job;
        setEditingJob(fullJob);
        setFormData({
          title: fullJob.title,
          company: fullJob.company || '',
          location: fullJob.location || '',
          description: fullJob.description || ''
        });
        setShowModal(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load job details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setModalError('Title and description are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError('');
      if (editingJob) {
        const res = await api.patch(`/jobs/${editingJob._id}`, formData);
        if (res.data.success) {
          setJobs((prev) =>
            prev.map((j) => (j._id === editingJob._id ? res.data.data.job : j))
          );
        }
      } else {
        const res = await api.post('/jobs', formData);
        if (res.data.success) {
          setJobs((prev) => [res.data.data.job, ...prev]);
        }
      }
      setShowModal(false);
    } catch (err) {
      setModalError(err.message || 'Failed to save job description');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this job description?')) return;

    try {
      setDeletingId(id);
      await api.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete job');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredJobs = jobs.filter((j) =>
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.company && j.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-[#F8FAFC]">
            Target Job Descriptions
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1">
            Save and manage target job requirements to compare against your resumes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 dark:bg-[#818CF8] dark:text-[#0B1120] dark:hover:bg-[#818CF8]/90 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Target Job</span>
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

      {/* Search Bar */}
      {jobs.length > 0 && (
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs by title or company..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
          />
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-600 dark:text-[#818CF8] mb-2" />
          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Loading target jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No target jobs yet"
          description="Add a target job description to match against your resumes and calculate ATS-style compatibility."
          actionText="Add Target Job"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => {
            const reqSkillCount = job.parsedData?.requiredSkills?.length || 0;
            const prefSkillCount = job.parsedData?.preferredSkills?.length || 0;
            const expYears = job.parsedData?.experienceYears || 0;

            return (
              <div
                key={job._id}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 dark:border-[#243044] dark:bg-[#111827] dark:hover:border-[#818CF8]/50 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-[#1E1B4B] dark:text-[#818CF8] group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm font-display text-slate-900 dark:text-[#F8FAFC] truncate">
                          {job.title}
                        </h3>
                        {job.company ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-[#94A3B8] mt-0.5">
                            <Building2 className="h-3 w-3 shrink-0" />
                            <span className="truncate">{job.company}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-[#94A3B8]">Company unlisted</span>
                        )}
                      </div>
                    </div>

                    {job.location && (
                      <Badge variant="outline" size="sm">
                        <MapPin className="h-2.5 w-2.5 mr-0.5" />
                        <span>{job.location}</span>
                      </Badge>
                    )}
                  </div>

                  {/* Criteria Preview */}
                  <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 dark:text-[#94A3B8]">
                    <div className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-indigo-500 dark:text-[#818CF8]" />
                      <span>{reqSkillCount + prefSkillCount} Skills</span>
                    </div>
                    <div>•</div>
                    <div>{expYears > 0 ? `${expYears}+ yrs exp` : 'Exp unlisted'}</div>
                  </div>

                  {/* Skills pill preview */}
                  {job.parsedData?.requiredSkills && job.parsedData.requiredSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {job.parsedData.requiredSkills.slice(0, 4).map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-[#172033] dark:text-[#818CF8] border border-indigo-100 dark:border-[#243044]"
                        >
                          {s}
                        </span>
                      ))}
                      {job.parsedData.requiredSkills.length > 4 && (
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-[#172033]/60 dark:text-[#94A3B8]">
                          +{job.parsedData.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-[#243044] text-[11px] text-slate-400 dark:text-[#94A3B8]">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/analyze?jobId=${job._id}`)}
                      className="flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-[#1E1B4B] dark:text-[#818CF8] dark:hover:bg-[#1E1B4B]/80 transition-colors"
                      title="Analyze a resume against this job"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Analyze</span>
                    </button>

                    <button
                      onClick={(e) => openEditModal(job, e)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#172033] dark:text-[#94A3B8] transition-colors"
                      title="Edit Job"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(job._id, e)}
                      disabled={deletingId === job._id}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:text-[#94A3B8] transition-colors"
                      title="Delete Job"
                    >
                      {deletingId === job._id ? (
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

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1120]/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#243044] dark:bg-[#111827] sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#243044]">
              <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-600 dark:text-[#818CF8]" />
                <span>{editingJob ? 'Edit Target Job' : 'Add Target Job Description'}</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#172033] dark:text-[#94A3B8] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {modalError && (
                <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalError('')}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200 ml-4"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Stripe, OpenAI, Remote"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA / Remote"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                    Job Description *
                  </label>
                  <span className="text-[11px] text-slate-400 dark:text-[#94A3B8]">
                    Paste the full job posting text
                  </span>
                </div>
                <textarea
                  required
                  rows={9}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Paste responsibilities, required skills, preferred qualifications, and experience expectations..."
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC] font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#243044]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-[#243044] dark:text-[#CBD5E1] dark:hover:bg-[#172033] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-60 dark:bg-[#818CF8] dark:text-[#0B1120] dark:hover:bg-[#818CF8]/90 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Parsing Requirements...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{editingJob ? 'Update Job' : 'Save & Parse Job'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
