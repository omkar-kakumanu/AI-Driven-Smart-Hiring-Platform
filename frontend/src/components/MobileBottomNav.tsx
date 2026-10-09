import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Mic, 
  Settings, 
  FileText, 
  Compass, 
  Bot
} from 'lucide-react';
import type { UserProfile } from '../types';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userProfile?: UserProfile;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  userProfile
}) => {
  const isCandidateUser = Boolean(
    userProfile?.userType !== 'ADMIN' &&
    userProfile?.email?.toLowerCase() !== 'admin@copilot.com' &&
    userProfile?.email?.toLowerCase() !== 'recruiter@copilot.com' && (
      userProfile?.role?.toLowerCase().includes('candidate') ||
      userProfile?.email?.toLowerCase().includes('candidate') ||
      userProfile?.email?.toLowerCase() === 'sarah.johnson@example.com'
    )
  );

  const navItems = isCandidateUser
    ? [
        { id: 'candidate-portal', label: 'Portal', icon: Compass },
        { id: 'candidates', label: 'Resume', icon: FileText },
        { id: 'matching', label: 'Job Fit', icon: Target },
        { id: 'voice-screening', label: 'Voice AI', icon: Mic },
        { id: 'settings', label: 'Account', icon: Settings },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'candidates', label: 'Candidates', icon: Users },
        { id: 'matching', label: 'Matching', icon: Target },
        { id: 'interview-assistant', label: 'Interview', icon: Bot },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold'
              }`}
            >
              <div className={`relative p-1 rounded-lg transition-colors ${
                isActive ? 'bg-blue-50 dark:bg-blue-950/60' : ''
              }`}>
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight leading-none truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
