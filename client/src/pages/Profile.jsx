import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Briefcase, Award, MapPin, Globe, Linkedin, Github, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    targetRole: '',
    experienceLevel: '',
    location: '',
    website: '',
    linkedin: '',
    github: ''
  });

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        targetRole: user.targetRole || '',
        experienceLevel: user.experienceLevel || '',
        location: user.location || '',
        website: user.website || '',
        linkedin: user.linkedin || '',
        github: user.github || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ type: '', text: '' });

    const res = await updateProfile(formData);
    setSaving(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    } else {
      setStatusMsg({ type: 'error', text: res.message || 'Failed to update profile.' });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-[#F8FAFC]">
          User Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1">
          Manage your personal details and target career focus.
        </p>
      </div>

      {statusMsg.text && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium ${
            statusMsg.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/40 dark:bg-rose-950/40 dark:text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#243044] dark:bg-[#111827] sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                Full Name
              </label>
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-[#94A3B8]" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-[#94A3B8]" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-3 text-xs text-slate-500 dark:border-[#243044] dark:bg-[#172033]/60 dark:text-[#94A3B8] cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-[#94A3B8]">Email cannot be changed.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                Target Role
              </label>
              <div className="relative mt-1.5">
                <Briefcase className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-[#94A3B8]" />
                <input
                  type="text"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                Experience Level
              </label>
              <div className="relative mt-1.5">
                <Award className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-[#94A3B8]" />
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
                >
                  <option value="">Select Level</option>
                  <option value="Entry Level">Entry Level (0-2 years)</option>
                  <option value="Mid Level">Mid Level (3-5 years)</option>
                  <option value="Senior Level">Senior Level (5-8 years)</option>
                  <option value="Lead / Staff">Lead / Staff (8+ years)</option>
                  <option value="Executive">Executive / Director</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                Location
              </label>
              <div className="relative mt-1.5">
                <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-[#94A3B8]" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="San Francisco, CA or Remote"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                Personal Website / Portfolio
              </label>
              <div className="relative mt-1.5">
                <Globe className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-[#94A3B8]" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.dev"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                LinkedIn URL
              </label>
              <div className="relative mt-1.5">
                <Linkedin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-[#94A3B8]" />
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                GitHub URL
              </label>
              <div className="relative mt-1.5">
                <Github className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-[#94A3B8]" />
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-[#243044]">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-60 dark:bg-[#818CF8] dark:text-[#0B1120] dark:hover:bg-[#818CF8]/90 transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
