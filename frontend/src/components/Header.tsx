import React from 'react';
import { RefreshCw, Menu, LogOut, Sun, Moon, Plus, Shield, Briefcase, UserCheck } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import type { UserProfile } from '../types';

interface HeaderProps {
  title: string;
  subtitle: string;
  userProfile?: UserProfile;
  searchQuery?: string;
  matchCount?: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onSearchChange?: (q: string) => void;
  onNewJobClick?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  onOpenSyncModal?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  userProfile,
  searchQuery = '',
  matchCount,
  theme = 'light',
  onToggleTheme,
  onSearchChange,
  onNewJobClick, 
  onProfileClick,
  onLogout,
  onOpenSyncModal,
  onToggleMobileMenu
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

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors">
      
      {/* Left: Mobile Menu Button & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate leading-tight">
              {title}
            </h1>
            <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-wide border shrink-0 shadow-2xs ${
              isAdmin 
                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800' 
                : isRecruiterUser
                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
            }`}>
              {isAdmin && <Shield className="w-3 h-3 text-purple-600 dark:text-purple-400" />}
              {isRecruiterUser && <Briefcase className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
              {isCandidateUser && <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
              <span>{roleLabel}</span>
            </span>
          </div>
          <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        
        {/* Responsive Search Input */}
        <div className="relative flex items-center">
          <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={isCandidateUser ? "Search skills..." : "Search..."}
            className="pl-8 pr-7 sm:pr-14 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 w-28 sm:w-44 md:w-60 lg:w-72 transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
          />
          {searchQuery && (
            <div className="absolute right-1.5 flex items-center gap-1">
              {matchCount !== undefined && (
                <span className="hidden sm:inline-block text-[9px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 px-1 py-0.5 rounded border border-blue-200 dark:border-blue-700">
                  {matchCount}
                </span>
              )}
              <button
                type="button"
                onClick={() => onSearchChange && onSearchChange('')}
                className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold leading-none cursor-pointer"
                title="Clear search"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Action Button: + New Job (Admin Only) or Active Candidate Badge */}
        {isAdmin ? (
          <button 
            onClick={onNewJobClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
            title="Create New Job Posting"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Job</span>
          </button>
        ) : isCandidateUser ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] font-bold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Active</span>
          </div>
        ) : null}

        {/* Cloud Data Sync Button (Localhost <-> Vercel) */}
        {onOpenSyncModal && (
          <button
            type="button"
            onClick={onOpenSyncModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 transition-all border border-blue-200 dark:border-blue-800 cursor-pointer text-xs font-bold shrink-0 shadow-xs"
            title="Sync all candidates & data with Vercel"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sync</span>
          </button>
        )}

        {/* Theme Toggle */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center justify-center shrink-0"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        )}

        {/* User Profile Avatar & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={onProfileClick}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer group"
            title={`Logged in as ${userProfile?.name || 'User'} (${roleLabel}). Click to manage profile.`}
          >
            <div className="relative shrink-0">
              <UserAvatar 
                name={userProfile?.name || 'User'} 
                avatar={userProfile?.avatar} 
                size="sm" 
              />
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                isAdmin ? 'bg-purple-500' : isRecruiterUser ? 'bg-blue-500' : 'bg-emerald-500'
              }`} />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-none truncate max-w-[110px]">
                {userProfile?.name || 'User'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                  isAdmin 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300' 
                    : isRecruiterUser 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' 
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                }`}>
                  {roleLabel}
                </span>
              </div>
            </div>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors shrink-0"
              title="Sign Out / Switch Portal"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5 sm:hidden" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
