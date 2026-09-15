import React from 'react';
import { UserAvatar } from './UserAvatar';
import type { UserProfile } from '../types';

interface HeaderProps {
  title: string;
  subtitle: string;
  userProfile?: UserProfile;
  searchQuery?: string;
  matchCount?: number;
  onSearchChange?: (q: string) => void;
  onNewJobClick?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  userProfile,
  searchQuery = '',
  matchCount,
  onSearchChange,
  onNewJobClick, 
  onProfileClick,
  onLogout
}) => {
  const isAdmin = userProfile?.userType === 'ADMIN';

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Enterprise System
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Real-Time Candidate Search Input */}
        <div className="relative flex items-center">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search candidates by name, skills, role..."
            className="pl-9 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-72 transition-all"
          />
          {searchQuery && (
            <div className="absolute right-2.5 flex items-center gap-1">
              {matchCount !== undefined && (
                <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md border border-blue-200">
                  {matchCount}
                </span>
              )}
              <button
                type="button"
                onClick={() => onSearchChange && onSearchChange('')}
                className="w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-bold leading-none"
                title="Clear search query"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Action Button: + New Job (Admin Only) */}
        {isAdmin ? (
          <button 
            onClick={onNewJobClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            + New Job
          </button>
        ) : (
          <span 
            className="px-3.5 py-2 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-bold cursor-not-allowed"
            title="Only Administrators can create new job postings"
          >
            + New Job (Admin Only)
          </span>
        )}


        {/* User Profile Badge & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <button
            onClick={onProfileClick}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-all"
            title="Manage Profile Settings"
          >
            <UserAvatar 
              name={userProfile?.name || 'Sarah Jenkins'} 
              avatar={userProfile?.avatar} 
              size="sm" 
            />
            <div className="text-left hidden xl:block">
              <p className="text-xs font-bold text-slate-900 leading-none">{userProfile?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{userProfile?.role || 'Recruiter'}</p>
            </div>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors"
              title="Sign Out / Switch Portal"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


