import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Badge from '../components/common/Badge';
import {
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Calendar,
  CheckCircle2
} from 'lucide-react';

const ResumeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/resumes/${id}`);
        if (res.data.success) {
          setResume(res.data.data.resume);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load resume details.');
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-[#818CF8] mb-2" />
        <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Loading resume details...</p>
      </div>
    );
  }

  if (errorMsg || !resume) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
        <AlertTriangle className="mx-auto h-8 w-8 text-rose-500 mb-2" />
        <h3 className="font-semibold text-sm">Failed to Load Resume</h3>
        <p className="text-xs mt-1">{errorMsg || 'Resume not found'}</p>
        <Link to="/resumes" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-[#818CF8] underline">
          <ArrowLeft className="h-3 w-3" /> Back to Resumes
        </Link>
      </div>
    );
  }

  const { parsedData } = resume;
  const isPotentiallyIncomplete =
    (!parsedData.skills || parsedData.skills.length === 0) ||
    (!parsedData.experience || parsedData.experience.length === 0);

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/resumes')}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-[#243044] dark:bg-[#172033] dark:text-[#CBD5E1] dark:hover:bg-[#243044] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                {resume.name}
              </h1>
              <Badge variant="primary" size="sm">
                {resume.fileType.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 dark:text-[#94A3B8] mt-0.5">
              Original: {resume.originalFilename} • {(resume.fileSize / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/analyze?resumeId=${resume._id}`)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 dark:bg-[#818CF8] dark:text-[#0B1120] dark:hover:bg-[#818CF8]/90 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          <span>Analyze With Job</span>
        </button>
      </div>

      {/* Partial parsing warning if applicable */}
      {isPotentiallyIncomplete && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-[#243044] dark:bg-[#172033] dark:text-[#FBBF24]">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 dark:text-[#FBBF24]" />
          <div>
            <span className="font-semibold">Notice regarding parsed resume structure:</span>
            <p className="mt-0.5 text-amber-700 dark:text-[#FBBF24]/90">
              Some resume sections could not be parsed with high confidence. Please verify your document structure or ensure clear section titles.
            </p>
          </div>
        </div>
      )}

      {/* Personal Information & Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-[#243044] dark:bg-[#111827]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-[#1E1B4B] dark:text-[#818CF8]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-[#F8FAFC]">
                {parsedData.personal?.name || 'Candidate Name Not Detected'}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-[#94A3B8]">
                {parsedData.personal?.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-[#94A3B8]" />
                    <span>{parsedData.personal.email}</span>
                  </div>
                )}
                {parsedData.personal?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400 dark:text-[#94A3B8]" />
                    <span>{parsedData.personal.phone}</span>
                  </div>
                )}
                {parsedData.personal?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-[#94A3B8]" />
                    <span>{parsedData.personal.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Links */}
        {parsedData.personal?.links && parsedData.personal.links.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-[#243044]">
            {parsedData.personal.links.map((link, idx) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-[#243044] dark:bg-[#172033] dark:text-[#CBD5E1] dark:hover:border-[#818CF8] transition-colors"
              >
                <span>{link.replace(/^https?:\/\/(www\.)?/, '')}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {parsedData.summary && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-[#243044] dark:bg-[#111827]">
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-indigo-600 dark:text-[#818CF8]">
            Professional Summary
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-700 dark:text-[#CBD5E1] leading-relaxed">
            {parsedData.summary}
          </p>
        </div>
      )}

      {/* Skills */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-[#243044] dark:bg-[#111827]">
        <h3 className="text-xs font-bold font-display uppercase tracking-wider text-indigo-600 dark:text-[#818CF8]">
          Normalized Skills ({parsedData.skills?.length || 0})
        </h3>
        {parsedData.skills && parsedData.skills.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {parsedData.skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 border border-indigo-100 dark:bg-[#172033] dark:text-[#818CF8] dark:border-[#243044]"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-400">No explicit skills detected in resume text.</p>
        )}
      </div>

      {/* Experience */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-[#243044] dark:bg-[#111827]">
        <h3 className="text-xs font-bold font-display uppercase tracking-wider text-indigo-600 dark:text-[#818CF8] flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          <span>Work Experience ({parsedData.experience?.length || 0})</span>
        </h3>

        {parsedData.experience && parsedData.experience.length > 0 ? (
          <div className="mt-4 space-y-5 divide-y divide-slate-100 dark:divide-[#243044]">
            {parsedData.experience.map((exp, idx) => (
              <div key={idx} className={idx > 0 ? 'pt-5' : ''}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-[#F8FAFC]">
                      {exp.title}
                    </h4>
                    {exp.company && (
                      <p className="text-xs text-indigo-600 dark:text-[#818CF8] font-medium">
                        {exp.company}
                      </p>
                    )}
                  </div>

                  {(exp.startDate || exp.endDate) && (
                    <div className="mt-1 sm:mt-0 flex items-center gap-1 text-xs text-slate-400 dark:text-[#94A3B8]">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-[#CBD5E1]">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className="text-indigo-500 dark:text-[#818CF8] font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-400">No work experience entries detected.</p>
        )}
      </div>

      {/* Projects */}
      {parsedData.projects && parsedData.projects.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-[#243044] dark:bg-[#111827]">
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-indigo-600 dark:text-[#818CF8] flex items-center gap-2">
            <FolderGit2 className="h-4 w-4" />
            <span>Projects ({parsedData.projects.length})</span>
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {parsedData.projects.map((proj, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-[#243044] dark:bg-[#172033]"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC]">
                    {proj.title}
                  </h4>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-500 dark:text-[#818CF8]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {proj.technologies.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-700 shadow-2xs dark:bg-[#111827] dark:text-[#CBD5E1] border border-slate-200 dark:border-[#243044]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className="mt-2.5 space-y-1 text-xs text-slate-600 dark:text-[#CBD5E1]">
                    {proj.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="line-clamp-2">
                        • {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education & Certifications Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Education */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-[#243044] dark:bg-[#111827]">
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-indigo-600 dark:text-[#818CF8] flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>Education</span>
          </h3>

          {parsedData.education && parsedData.education.length > 0 ? (
            <div className="mt-3 space-y-3">
              {parsedData.education.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <p className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                  </p>
                  <p className="text-slate-500 dark:text-[#94A3B8]">
                    {edu.institution} {edu.graduationDate ? `(${edu.graduationDate})` : ''}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-400">No education entries detected.</p>
          )}
        </div>

        {/* Certifications */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-[#243044] dark:bg-[#111827]">
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-indigo-600 dark:text-[#818CF8] flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Certifications</span>
          </h3>

          {parsedData.certifications && parsedData.certifications.length > 0 ? (
            <ul className="mt-3 space-y-1.5 text-xs text-slate-700 dark:text-[#CBD5E1]">
              {parsedData.certifications.map((c, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-[#34D399]" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-slate-400">No certifications detected.</p>
          )}
        </div>
      </div>

      {/* Parser Diagnostics & Raw Text Inspection */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-[#243044] dark:bg-[#111827]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4 dark:border-[#243044]">
          <div>
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-[#818CF8]" />
              <span>Parser Diagnostics & Text Inspection</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-[#94A3B8] mt-0.5">
              Verified extraction metadata and two-stage section parsing confidence.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-[#1E1B4B] dark:text-[#818CF8]">
              Parser v{resume.extractionMetadata?.parserVersion || '2.0'}
            </span>
          </div>
        </div>

        {/* Metadata Stats Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-[#172033]">
            <span className="text-[11px] text-slate-400 dark:text-[#94A3B8]">Document Pages</span>
            <p className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">
              {resume.extractionMetadata?.pageCount || 1}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-[#172033]">
            <span className="text-[11px] text-slate-400 dark:text-[#94A3B8]">Character Count</span>
            <p className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">
              {(resume.extractionMetadata?.charCount || resume.extractedText?.length || 0).toLocaleString()} chars
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-[#172033]">
            <span className="text-[11px] text-slate-400 dark:text-[#94A3B8]">Structural Lines</span>
            <p className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">
              {resume.extractionMetadata?.lineCount || (resume.extractedText?.split('\n').length || 0)} lines
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-[#172033]">
            <span className="text-[11px] text-slate-400 dark:text-[#94A3B8]">Skills Detected</span>
            <p className="text-sm font-bold text-emerald-600 dark:text-[#34D399]">
              {parsedData.skills?.length || 0} skills
            </p>
          </div>
        </div>

        {/* Section Confidence Indicators */}
        {parsedData.confidence && Object.keys(parsedData.confidence).length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#243044]">
            <span className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
              Section Boundary Confidence:
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(parsedData.confidence).map(([section, score]) => {
                const pct = Math.round(Number(score) * 100);
                const isHigh = pct >= 80;
                return (
                  <span
                    key={section}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                      isHigh
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-[#243044] dark:bg-[#172033] dark:text-[#34D399]'
                        : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-[#243044] dark:bg-[#172033] dark:text-[#FBBF24]'
                    }`}
                  >
                    <span className="capitalize">{section}:</span>
                    <span>{pct}%</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Collapsible Normalized Text View */}
        <details className="mt-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-[#243044] dark:bg-[#172033]">
          <summary className="cursor-pointer text-xs font-bold text-slate-700 hover:text-indigo-600 dark:text-[#CBD5E1] dark:hover:text-[#818CF8]">
            View Normalized Extracted Text ({resume.extractedText?.length || 0} characters)
          </summary>
          <pre className="mt-3 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg bg-[#0B1120] p-4 font-mono text-[11px] leading-relaxed text-[#CBD5E1] border border-[#243044]">
            {resume.normalizedText || resume.extractedText || 'No text extracted.'}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default ResumeDetails;
