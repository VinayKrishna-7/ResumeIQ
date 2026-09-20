import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ScanSearch,
  Files,
  History,
  Settings,
  User,
  Sparkles,
  LogOut,
  X
} from 'lucide-react';

const primaryNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Analyze Resume', path: '/analyze', icon: ScanSearch },
  { name: 'Resumes', path: '/resumes', icon: Files },
  { name: 'History', path: '/history', icon: History },
];

const secondaryNavItems = [
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Profile', path: '/profile', icon: User },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0B1120]/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Slim 240px Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-[#E2E8F0] bg-white dark:border-[#243044] dark:bg-[#111827] transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-[#E2E8F0] dark:border-[#243044]">
          <Link
            to={user ? "/dashboard" : "/"}
            onClick={() => onClose && onClose()}
            className="flex items-center gap-2.5 font-display font-bold text-base tracking-tight"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6366F1] text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-[#0F172A] dark:text-[#F8FAFC]">
              Resume<span className="text-[#6366F1] dark:text-[#818CF8]">IQ</span>
            </span>
          </Link>

          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-1 text-[#64748B] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#172033] md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-4">
          <div className="space-y-4">
            {/* Primary Nav */}
            <div className="space-y-1">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]/80">
                Workspace
              </span>
              <nav className="mt-1 space-y-0.5">
                {primaryNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#1E1B4B] dark:text-[#818CF8] font-semibold'
                            : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC]'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Divider */}
            <div className="border-t border-[#E2E8F0] dark:border-[#243044] pt-3">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]/80">
                Preferences
              </span>
              <nav className="mt-1 space-y-0.5">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#1E1B4B] dark:text-[#818CF8] font-semibold'
                            : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC]'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Diagnostics Tag */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 dark:border-[#243044] dark:bg-[#172033]/50">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              <span className="flex h-2 w-2 rounded-full bg-[#10B981] dark:bg-[#34D399]" />
              <span>ATS Scoring Active</span>
            </div>
            <p className="mt-1 text-[10px] text-[#64748B] dark:text-[#94A3B8] leading-tight">
              Deterministic rubric calibrated for applicant screening.
            </p>
          </div>
        </div>

        {/* Bottom User Card with Avatar and Logout */}
        {user && (
          <div className="border-t border-[#E2E8F0] bg-[#F8FAFC]/80 p-3 dark:border-[#243044] dark:bg-[#172033]/30">
            <div className="flex items-center justify-between gap-2">
              <Link
                to="/profile"
                onClick={() => onClose && onClose()}
                className="flex items-center gap-2.5 min-w-0 flex-1 rounded-lg p-1 text-left hover:bg-[#F1F5F9] dark:hover:bg-[#172033] transition-colors"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6366F1] text-[11px] font-bold text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    {user.name}
                  </p>
                  <p className="truncate text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                    {user.email}
                  </p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                title="Log Out"
                aria-label="Log Out"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#64748B] hover:bg-rose-50 hover:text-[#EF4444] dark:text-[#94A3B8] dark:hover:bg-rose-950/40 dark:hover:text-[#F87171] transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
