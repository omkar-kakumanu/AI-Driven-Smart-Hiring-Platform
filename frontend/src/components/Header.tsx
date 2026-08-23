import React from 'react';
import { Search, Bell, Plus, Download, Sparkles } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import type { UserProfile } from '../types';

interface HeaderProps {
  title: string;
  subtitle: string;
  userProfile?: UserProfile;
  onNewJobClick?: () => void;
  onExportClick?: () => void;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  userProfile,
  onNewJobClick, 
  onExportClick,
  onProfileClick
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3 h-3 text-indigo-600" /> AI Powered
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidates, jobs..."
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 transition-all"
          />
        </div>

        {/* Export Button */}
        <button 
          onClick={onExportClick}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Action Button */}
        <button 
          onClick={onNewJobClick}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Job Posting
        </button>

        {/* User Profile Badge */}
        <button
          onClick={onProfileClick}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
          title="Manage Profile Settings"
        >
          <UserAvatar 
            name={userProfile?.name || 'Sarah Jenkins'} 
            avatar={userProfile?.avatar} 
            size="sm" 
          />
        </button>
      </div>
    </header>
  );
};

