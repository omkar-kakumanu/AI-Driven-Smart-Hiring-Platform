import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Mic, 
  Settings, 
  FileText, 
  Compass, 
  Bot, 
  Share2, 
  X,
  Shield,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import type { UserProfile } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userProfile?: UserProfile;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  userProfile,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const isSuperAdmin = Boolean(
    userProfile?.isSuperAdmin ||
    userProfile?.email?.toLowerCase() === 'admin@copilot.com'
  );

  const isAdmin = Boolean(
    userProfile?.userType === 'ADMIN' || isSuperAdmin
  );

  const isRecruiterUser = Boolean(
    !isAdmin && (
      userProfile?.role?.toLowerCase().includes('recruiter') ||
      userProfile?.role?.toLowerCase().includes('talent') ||
      userProfile?.email?.toLowerCase() === 'recruiter@copilot.com'
    )
  );

  const isCandidateUser = Boolean(
    !isAdmin && !isRecruiterUser
  );

  const roleLabel = isAdmin 
    ? (isSuperAdmin ? 'Super-Admin' : 'Administrator') 
    : isRecruiterUser 
    ? 'Recruiter' 
    : 'Candidate';

  const menuItems = isCandidateUser
    ? [
        { id: 'candidate-portal', label: 'My Candidate Portal', icon: Compass },
        { id: 'candidates', label: 'My Resume & Profile', icon: FileText },
        { id: 'matching', label: 'Matching & Skill Gap', icon: Target },
        { id: 'interview-assistant', label: 'Interview Practice', icon: Bot },
        { id: 'voice-screening', label: 'Voice Screening Module', icon: Mic },
        { id: 'ats-integration', label: 'Application ATS Tracking', icon: Share2 },
        { id: 'settings', label: 'Account Settings', icon: Settings },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'candidates', label: 'Candidates & Resumes', icon: Users },
        { id: 'matching', label: 'Matching & Skill Gap', icon: Target },
        { id: 'interview-assistant', label: 'AI Interview Simulation', icon: Bot },
        { id: 'voice-screening', label: 'Voice Screening Module', icon: Mic },
        { id: 'ats-integration', label: 'ATS Integration Hub', icon: Share2 },
        { id: 'settings', label: 'System Settings & Approvals', icon: Settings },
      ];

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderNavContent = (isDrawer = false) => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
        <div 
          onClick={() => handleSelectTab(isCandidateUser ? 'candidate-portal' : 'dashboard')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectTab(isCandidateUser ? 'candidate-portal' : 'dashboard'); }}
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/40 transition-colors group flex-1"
          title={isCandidateUser ? "Go to Candidate Portal" : "Go to Dashboard"}
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 group-hover:bg-blue-500 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-md shadow-blue-500/20 transition-all shrink-0">
            RC
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-white text-base tracking-tight leading-none group-hover:text-blue-400 transition-colors truncate">
              Recruitment Copilot
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium truncate">AI Hiring Platform</p>
          </div>
        </div>

        {isDrawer && onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Active Session Tier Pill */}
      <div className="mx-3.5 my-2.5 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Session</span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
          isAdmin
            ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
            : isRecruiterUser
            ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
        }`}>
          {isAdmin && <Shield className="w-2.5 h-2.5 text-purple-400" />}
          {isRecruiterUser && <Briefcase className="w-2.5 h-2.5 text-blue-400" />}
          {isCandidateUser && <UserCheck className="w-2.5 h-2.5 text-emerald-400" />}
          <span>{roleLabel}</span>
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mb-2">Navigation</div>
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div
        onClick={() => handleSelectTab('settings')}
        className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 cursor-pointer transition-all flex items-center gap-3 group"
        title={`Signed in as ${userProfile?.name || 'User'} (${roleLabel}). Click to manage profile.`}
      >
        <div className="relative shrink-0">
          <UserAvatar
            name={userProfile?.name || 'User'}
            avatar={userProfile?.avatar}
            size="sm"
            className="border border-slate-700"
          />
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
            isAdmin ? 'bg-purple-500' : isRecruiterUser ? 'bg-blue-500' : 'bg-emerald-500'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {userProfile?.name || 'User'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
              isAdmin
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : isRecruiterUser
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {isAdmin && <Shield className="w-2.5 h-2.5 text-purple-400" />}
              {isRecruiterUser && <Briefcase className="w-2.5 h-2.5 text-blue-400" />}
              {isCandidateUser && <UserCheck className="w-2.5 h-2.5 text-emerald-400" />}
              <span>{roleLabel}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Static Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 hidden lg:flex flex-col h-screen sticky top-0 select-none z-30 shrink-0">
        {renderNavContent(false)}
      </aside>

      {/* 2. Mobile Drawer & Backdrop Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity duration-200"
            aria-hidden="true"
          />

          {/* Slide-out Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 text-slate-300 shadow-2xl flex flex-col h-full z-50 select-none animate-in slide-in-from-left duration-200">
            {renderNavContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
