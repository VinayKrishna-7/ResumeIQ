import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { LayoutDashboard, Files, ScanSearch, History, User } from 'lucide-react';

const mobileNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Analyze', path: '/analyze', icon: ScanSearch, highlight: true },
  { name: 'Resumes', path: '/resumes', icon: Files },
  { name: 'History', path: '/history', icon: History },
  { name: 'Profile', path: '/profile', icon: User },
];

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#0F172A] dark:bg-[#0B1120] dark:text-[#F8FAFC]">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto px-4 py-6 pb-20 sm:px-6 md:pb-8 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 z-30 flex h-16 w-full items-center justify-around border-t border-[#E2E8F0] bg-white/95 backdrop-blur dark:border-[#243044] dark:bg-[#111827]/95 md:hidden">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-[#6366F1] dark:text-[#818CF8]'
                    : 'text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
                }`
              }
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  item.highlight
                    ? 'bg-[#6366F1] text-white shadow-xs'
                    : ''
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px]">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
