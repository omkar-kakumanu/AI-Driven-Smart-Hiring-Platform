import React from 'react';
import { UserAvatar } from './UserAvatar';
import type { UserProfile } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userProfile?: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, userProfile }) => {
  const isCandidateUser = Boolean(
    userProfile?.userType !== 'ADMIN' &&
    userProfile?.email?.toLowerCase() !== 'admin@copilot.com' &&
    userProfile?.email?.toLowerCase() !== 'recruiter@copilot.com' && (
      userProfile?.role?.toLowerCase().includes('candidate') ||
      userProfile?.email?.toLowerCase().includes('candidate') ||
      userProfile?.email?.toLowerCase() === 'sarah.johnson@example.com'
    )
  );

  const menuItems = isCandidateUser
    ? [
        { id: 'candidate-portal', label: 'My Candidate Portal' },
        { id: 'interview-assistant', label: 'Interview & Questions' },
        { id: 'voice-screening', label: 'Voice Screening Module' },
        { id: 'candidates', label: 'My Resume & Profile' },
        { id: 'settings', label: 'Account Settings' },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'candidates', label: 'Candidates & Resumes' },
        { id: 'matching', label: 'Matching & Skill Gap' },
        { id: 'interview-assistant', label: 'AI Interview Simulation' },
        { id: 'voice-screening', label: 'Voice Screening Module' },
        { id: 'ats-integration', label: 'ATS Integration Hub' },
        { id: 'candidate-portal', label: 'Candidate Portal (Preview)' },
        { id: 'settings', label: 'System Settings & Approvals' },
      ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen sticky top-0 select-none">
      {/* Brand Header: Click takes to dashboard */}
      <div 
        onClick={() => setCurrentTab('dashboard')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setCurrentTab('dashboard'); }}
        className="p-5 border-b border-slate-800 flex items-center gap-3 cursor-pointer hover:bg-slate-800/40 transition-colors group"
        title="Go to Dashboard"
      >
        <div className="w-9 h-9 rounded-xl bg-blue-600 group-hover:bg-blue-500 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-md shadow-blue-500/20 transition-all">
          RC
        </div>
        <div>
          <h1 className="font-extrabold text-white text-base tracking-tight leading-none group-hover:text-blue-400 transition-colors">
            Recruitment Copilot
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Hiring Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-3 mb-2">Navigation</div>
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div
        onClick={() => setCurrentTab('settings')}
        className="p-4 border-t border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 cursor-pointer transition-all flex items-center gap-3 group"
        title="Click to manage profile & settings"
      >
        <UserAvatar
          name={userProfile?.name || 'Sarah Jenkins'}
          avatar={userProfile?.avatar}
          size="sm"
          className="border border-slate-700 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {userProfile?.name || 'Sarah Jenkins'}
          </p>
          <p className="text-xs text-slate-400 truncate">{userProfile?.role || 'Lead Recruiter'}</p>
        </div>
      </div>
    </aside>
  );
};


