import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sparkles,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Settings,
  ChevronDown,
  Menu
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login');
  };

  const getPageTitle = (path) => {
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/analyze') return 'Analyze Resume';
    if (path.startsWith('/analysis/')) return 'Resume Analysis';
    if (path === '/resumes') return 'Resume Library';
    if (path.startsWith('/resumes/')) return 'Resume Inspection';
    if (path === '/history') return 'Analysis History';
    if (path === '/jobs') return 'Target Jobs';
    if (path === '/settings') return 'Settings & Weights';
    if (path === '/profile') return 'User Profile';
    return '';
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E2E8F0] bg-white/95 px-4 backdrop-blur dark:border-[#243044] dark:bg-[#111827]/95 sm:px-6">
      {/* Left side: Mobile Toggle, Mobile Logo, Desktop Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="rounded-lg p-2 text-[#64748B] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-[#172033] md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand mark shown on mobile or when logged out */}
        <Link
          to={user ? "/dashboard" : "/"}
          className={`flex items-center gap-2 font-display font-bold text-base tracking-tight ${
            user ? 'md:hidden' : 'flex'
          }`}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6366F1] text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-[#0F172A] dark:text-[#F8FAFC]">
            Resume<span className="text-[#6366F1] dark:text-[#818CF8]">IQ</span>
          </span>
        </Link>

        {/* Desktop Page Context Title */}
        {user && pageTitle && (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">Workspace</span>
            <span className="text-xs text-[#94A3B8] dark:text-[#64748B]">/</span>
            <span className="font-display text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              {pageTitle}
            </span>
          </div>
        )}
      </div>

      {/* Right side: Theme toggle and User dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme mode"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] dark:border-[#243044] dark:text-[#94A3B8] dark:hover:bg-[#172033] transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-medium text-[#0F172A] hover:bg-[#F1F5F9] dark:border-[#243044] dark:bg-[#172033] dark:text-[#F8FAFC] dark:hover:bg-[#172033]/80 transition-colors focus:outline-none"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6366F1] text-[10px] font-bold text-white shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-[#64748B] dark:text-[#94A3B8] transition-transform duration-200 ${
                  profileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-[#E2E8F0] bg-white py-1.5 shadow-xl dark:border-[#243044] dark:bg-[#111827] z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-[#E2E8F0] dark:border-[#243044]">
                  <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
                    {user.email}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:text-[#CBD5E1] dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC] transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-[#64748B] dark:text-[#94A3B8]" />
                    <span>User Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:text-[#CBD5E1] dark:hover:bg-[#172033] dark:hover:text-[#F8FAFC] transition-colors"
                  >
                    <Settings className="h-4 w-4 text-[#64748B] dark:text-[#94A3B8]" />
                    <span>Settings & Weights</span>
                  </Link>
                </div>

                <div className="border-t border-[#E2E8F0] dark:border-[#243044] pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#EF4444] hover:bg-rose-50 dark:text-[#F87171] dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-[#475569] hover:text-[#6366F1] dark:text-[#CBD5E1] dark:hover:text-[#818CF8] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-[#6366F1] px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-[#4F46E5] transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
