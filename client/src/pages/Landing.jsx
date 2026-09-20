import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  FileCheck,
  Target,
  BarChart3,
  Search,
  CheckCircle2,
  ArrowRight,
  Shield,
  FileText,
  Zap,
  TrendingUp,
  Award,
  Layers,
  Check,
  ChevronRight
} from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] dark:bg-[#0B1120] dark:text-[#F8FAFC] selection:bg-[#6366F1] selection:text-white">
      {/* Top Simple SaaS Header */}
      <header className="border-b border-[#E2E8F0] bg-white/80 dark:border-[#243044] dark:bg-[#111827]/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-lg tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1] text-white shadow-xs">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <span className="text-[#0F172A] dark:text-[#F8FAFC]">
              Resume<span className="text-[#6366F1] dark:text-[#818CF8]">IQ</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#4F46E5] transition-colors"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-medium text-[#475569] hover:text-[#0F172A] dark:text-[#CBD5E1] dark:hover:text-[#F8FAFC] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-[#6366F1] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#4F46E5] transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[#E2E8F0] dark:border-[#243044]">
        {/* Subtle radial ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[360px] bg-gradient-to-b from-indigo-100/50 to-transparent dark:from-indigo-950/20 dark:to-transparent blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          {/* Small Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/90 px-3.5 py-1 text-[11px] font-semibold tracking-wide uppercase text-[#4F46E5] dark:border-indigo-900/60 dark:bg-[#1E1B4B] dark:text-[#818CF8]">
            <Sparkles className="h-3 w-3" />
            <span>AI-POWERED RESUME INTELLIGENCE</span>
          </div>

          {/* Main Heading */}
          <h1 className="mt-6 font-display font-extrabold tracking-tight text-4xl sm:text-6xl text-[#0F172A] dark:text-[#F8FAFC] leading-[1.12]">
            Know exactly how your resume matches the job.
          </h1>

          {/* Supporting Copy */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-[#475569] dark:text-[#CBD5E1] leading-relaxed font-normal">
            ResumeIQ analyzes your resume against a target role using deterministic scoring and evidence-grounded AI recommendations.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to={user ? '/analyze' : '/register'}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6366F1] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#4F46E5] transition-all hover:scale-[1.01]"
            >
              <span>Analyze My Resume</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {!user ? (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] shadow-xs hover:bg-[#F1F5F9] dark:border-[#243044] dark:bg-[#111827] dark:text-[#F8FAFC] dark:hover:bg-[#172033] transition-colors"
              >
                <span>Sign In</span>
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] shadow-xs hover:bg-[#F1F5F9] dark:border-[#243044] dark:bg-[#111827] dark:text-[#F8FAFC] dark:hover:bg-[#172033] transition-colors"
              >
                <span>Go to Dashboard</span>
              </Link>
            )}
          </div>

          {/* Trust Points */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#10B981] dark:text-[#34D399]" />
              <span>Deterministic ATS Scoring</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#10B981] dark:text-[#34D399]" />
              <span>Grounded Evidence (Zero Fabrication)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#10B981] dark:text-[#34D399]" />
              <span>PDF & DOCX Support</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-[#6366F1] dark:text-[#818CF8]" />
              <span>Privacy-First Architecture</span>
            </div>
          </div>

          {/* Realistic Analysis Preview Section */}
          <div className="mt-14 mx-auto max-w-4xl text-left">
            <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xl dark:border-[#243044] dark:bg-[#111827]">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 dark:border-[#243044] dark:bg-[#172033]">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#10B981]/80" />
                  <span className="ml-2 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                    Senior Full Stack Engineer • Resume Analysis
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-[#34D399] border border-emerald-200 dark:border-emerald-900/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] dark:bg-[#34D399] animate-pulse" />
                  Deterministic Match
                </span>
              </div>

              {/* Preview Content */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left: Score Card */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-[#F8FAFC] dark:bg-[#172033]/60 border border-[#E2E8F0] dark:border-[#243044] text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                      Resume Match
                    </span>
                    <div className="my-2 flex items-baseline">
                      <span className="font-display text-5xl font-extrabold text-[#6366F1] dark:text-[#818CF8]">
                        87
                      </span>
                      <span className="text-sm font-bold text-[#64748B] dark:text-[#94A3B8] ml-0.5">
                        %
                      </span>
                    </div>
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-[#34D399] border border-emerald-200 dark:border-emerald-900/50">
                      Strong Match
                    </span>
                    <p className="mt-3 text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-tight">
                      7 of 8 core technical requirements satisfied
                    </p>
                  </div>

                  {/* Right: Dimension Bars */}
                  <div className="md:col-span-8 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-[#475569] dark:text-[#CBD5E1]">Skills Match (30%)</span>
                        <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">92%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#F1F5F9] dark:bg-[#243044] overflow-hidden">
                        <div className="h-full bg-[#10B981] dark:bg-[#34D399] rounded-full w-[92%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-[#475569] dark:text-[#CBD5E1]">Keywords (20%)</span>
                        <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">84%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#F1F5F9] dark:bg-[#243044] overflow-hidden">
                        <div className="h-full bg-[#6366F1] dark:bg-[#818CF8] rounded-full w-[84%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-[#475569] dark:text-[#CBD5E1]">Experience (20%)</span>
                        <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">88%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#F1F5F9] dark:bg-[#243044] overflow-hidden">
                        <div className="h-full bg-[#10B981] dark:bg-[#34D399] rounded-full w-[88%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-[#475569] dark:text-[#CBD5E1]">Projects (15%)</span>
                        <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">81%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#F1F5F9] dark:bg-[#243044] overflow-hidden">
                        <div className="h-full bg-[#6366F1] dark:bg-[#818CF8] rounded-full w-[81%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 High-Priority Improvements Card */}
                <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#243044]">
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-[#243044] dark:bg-[#172033]/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        <span className="flex h-2 w-2 rounded-full bg-[#F59E0B]" />
                        <span>3 High-Priority Improvements</span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#6366F1] dark:text-[#818CF8]">
                        Evidence-Based
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="rounded-lg bg-white p-3 border border-[#E2E8F0] dark:bg-[#111827] dark:border-[#243044] text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                            1. Quantify Distributed Systems Impact
                          </span>
                          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-[#FBBF24]">
                            Experience
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-[#475569] dark:text-[#94A3B8]">
                          Evidence from resume: <span className="italic font-mono text-[#0F172A] dark:text-[#CBD5E1]">"Architected event-driven microservices on AWS ECS handling over 10,000 requests/sec."</span>
                        </p>
                        <p className="mt-1 text-[11px] text-[#6366F1] dark:text-[#818CF8]">
                          → Add latency reduction or scale percentage to demonstrate staff-level impact.
                        </p>
                      </div>

                      <div className="rounded-lg bg-white p-2.5 border border-[#E2E8F0] dark:bg-[#111827] dark:border-[#243044] text-xs flex items-center justify-between">
                        <span className="font-medium text-[#475569] dark:text-[#CBD5E1]">
                          2. Add Docker / Containerization to Deployment Experience
                        </span>
                        <span className="text-[10px] text-amber-600 dark:text-[#FBBF24] font-semibold">Missing Preferred</span>
                      </div>

                      <div className="rounded-lg bg-white p-2.5 border border-[#E2E8F0] dark:bg-[#111827] dark:border-[#243044] text-xs flex items-center justify-between">
                        <span className="font-medium text-[#475569] dark:text-[#CBD5E1]">
                          3. Tailor Executive Summary to Target Role Title
                        </span>
                        <span className="text-[10px] text-indigo-600 dark:text-[#818CF8] font-semibold">Summary</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 sm:py-20 border-b border-[#E2E8F0] dark:border-[#243044]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6366F1] dark:text-[#818CF8]">
              Product Capabilities
            </h2>
            <p className="mt-2 text-3xl font-display font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              Built for precision job seekers.
            </p>
            <p className="mt-3 text-sm text-[#64748B] dark:text-[#94A3B8]">
              ResumeIQ goes beyond keyword stuffing by inspecting structural completeness, technical density, and evidence alignment.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 dark:border-[#243044] dark:bg-[#111827]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#6366F1] dark:bg-[#1E1B4B] dark:text-[#818CF8] mb-4">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-[#0F172A] dark:text-[#F8FAFC]">
                Deterministic Rubric
              </h3>
              <p className="mt-2 text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                Clear 6-dimension breakdown with transparent weights (Skills 30%, Keywords 20%, Experience 20%, Projects 15%, Quality 10%, Education 5%).
              </p>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 dark:border-[#243044] dark:bg-[#111827]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#6366F1] dark:bg-[#1E1B4B] dark:text-[#818CF8] mb-4">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-[#0F172A] dark:text-[#F8FAFC]">
                Collision-Safe Taxonomy
              </h3>
              <p className="mt-2 text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                Zero false positives. Negative boundary regex ensures "Java" never triggers on "JavaScript" and casual English verbs never match technical tools.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 dark:border-[#243044] dark:bg-[#111827]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#6366F1] dark:bg-[#1E1B4B] dark:text-[#818CF8] mb-4">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-[#0F172A] dark:text-[#F8FAFC]">
                Grounded AI Advice
              </h3>
              <p className="mt-2 text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                Every suggestion quotes verbatim candidate bullets. Generates Google-style Action + Context + Impact rewrites without fabricating metric numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-[#111827]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B] dark:text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-[#0F172A] dark:text-[#F8FAFC]">ResumeIQ</span>
            <span>•</span>
            <span>Intelligent Resume Diagnostic Workspace</span>
          </div>
          <p>© {new Date().getFullYear()} ResumeIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
