import React from 'react';
import { 
  LayoutDashboard, 
  FileUp, 
  Users, 
  Briefcase, 
  MessageSquareCode, 
  Mic, 
  Kanban, 
  BarChart3, 
  Settings, 
  Layers
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import type { UserProfile } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userProfile?: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, userProfile }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resume-upload', label: 'Resume Upload', icon: FileUp, badge: 'M1' },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'matching', label: 'Matching & Skills', icon: Layers, badge: 'M2' },
    { id: 'job-postings', label: 'Job Postings', icon: Briefcase },
    { id: 'interview-assistant', label: 'Interview Assistant', icon: MessageSquareCode, badge: 'M3' },
    { id: 'voice-screening', label: 'Voice Screening', icon: Mic, badge: 'M4' },
    { id: 'pipeline', label: 'Pipeline Board', icon: Kanban },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/30">
          RC
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-tight leading-none">Recruitment Copilot</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">AI Hiring Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-3 mb-2">Main Menu</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
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
          className="border-2 border-indigo-500 group-hover:scale-105 transition-transform shrink-0" 
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
            {userProfile?.name || 'Sarah Jenkins'}
          </p>
          <p className="text-xs text-slate-400 truncate">{userProfile?.role || 'Lead Recruiter (Admin)'}</p>
        </div>
      </div>
    </aside>
  );
};

