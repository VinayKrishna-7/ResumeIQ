import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import api from '../../services/api';

const ResumeUploader = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return false;
    const validExtensions = ['pdf', 'docx', 'doc'];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      setErrorMessage('Unsupported file format. Please upload a PDF or DOCX file.');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 5MB limit.');
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setResumeName(file.name.replace(/\.[^/.]+$/, ''));
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
    setErrorMessage('');

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setResumeName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(20);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      if (resumeName.trim()) {
        formData.append('name', resumeName.trim());
      }

      setUploadProgress(60);
      const res = await api.post('/resumes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadProgress(100);
      if (res.data.success) {
        setSelectedFile(null);
        setResumeName('');
        if (onUploadSuccess) {
          onUploadSuccess(res.data.data.resume);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload and parse resume.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#243044] dark:bg-[#111827]">
      <h3 className="text-base font-bold font-display tracking-tight text-slate-900 dark:text-[#F8FAFC]">
        Upload Resume
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-[#94A3B8]">
        Supports PDF and DOCX files up to 5MB. Your resume will be parsed and structured automatically.
      </p>

      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-[#1E1B4B]/30'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 dark:border-[#243044] dark:hover:bg-[#172033]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-[#1E1B4B] dark:text-[#818CF8] mb-3 shadow-xs">
            <UploadCloud className="h-6 w-6" />
          </div>

          <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
            Click to browse or drag & drop your resume here
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-[#94A3B8]">
            PDF, DOCX up to 5 MB
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#243044] dark:bg-[#172033]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-[#818CF8] dark:text-[#0B1120]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-[#F8FAFC]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.name.split('.').pop().toUpperCase()}
                </p>
              </div>
            </div>

            {!uploading && (
              <button
                onClick={() => setSelectedFile(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-[#243044] dark:text-[#94A3B8] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
              Resume Label / Version Name
            </label>
            <input
              type="text"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder="e.g. Senior Full Stack Resume"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-[#243044] dark:bg-[#111827] dark:text-[#F8FAFC]"
            />
          </div>

          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500 dark:text-[#94A3B8]">
                <span>Extracting & Parsing Structure...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-[#243044]">
                <div
                  className="h-full bg-indigo-600 dark:bg-[#818CF8] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setSelectedFile(null)}
              disabled={uploading}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-[#243044] dark:text-[#CBD5E1] dark:hover:bg-[#243044] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-60 dark:bg-[#818CF8] dark:text-[#0B1120] dark:hover:bg-[#818CF8]/90 transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Parse & Save Resume</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
