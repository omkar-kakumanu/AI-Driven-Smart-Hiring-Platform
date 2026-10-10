import React, { useState, useEffect } from 'react';
import type { UserProfile, UserAccount } from '../types';
import { UserAvatar } from '../components/UserAvatar';

interface SettingsViewProps {
  userProfile?: UserProfile;
  isCandidateUser?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onUpdateUserProfile?: (updates: Partial<UserProfile>) => void;
  userAccounts?: UserAccount[];
  onApproveUser?: (userId: string) => void;
  onRejectUser?: (userId: string) => void;
  onRevokeUserAccess?: (userId: string) => void;
  onDeleteUserAccount?: (userId: string) => void;
  onMakeUserAdmin?: (userId: string) => void;
  onRemoveUserAdmin?: (userId: string) => void;
  onMakeUserRecruiter?: (userId: string) => void;
  onClearAllCandidates?: () => void;
  onClearAllUserAccounts?: () => void;
  onRestoreDefaultJobs?: () => void;
}

const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`LocalStorage quota exceeded writing ${key}:`, err);
  }
};

const compressImage = (file: File, callback: (dataUrl: string) => void) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const raw = e.target?.result as string;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 200;
      let w = img.width;
      let h = img.height;
      if (w > h) {
        if (w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        }
      } else {
        if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        callback(compressed);
      } else {
        callback(raw);
      }
    };
    img.onerror = () => callback(raw);
    img.src = raw;
  };
  reader.readAsDataURL(file);
};

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  userProfile,
  isCandidateUser = false,
  theme = 'light',
  onToggleTheme,
  onUpdateUserProfile,
  userAccounts = [],
  onApproveUser,
  onRejectUser,
  onRevokeUserAccess,
  onDeleteUserAccount,
  onMakeUserAdmin,
  onRemoveUserAdmin,
  onMakeUserRecruiter,
  onClearAllCandidates,
  onClearAllUserAccounts,
  onRestoreDefaultJobs
}) => {
  const isCandidate = isCandidateUser || Boolean(
    userProfile?.userType !== 'ADMIN' &&
    userProfile?.email?.toLowerCase() !== 'admin@copilot.com' &&
    userProfile?.email?.toLowerCase() !== 'recruiter@copilot.com' && (
      userProfile?.role?.toLowerCase().includes('candidate') ||
      userProfile?.email?.toLowerCase().includes('candidate') ||
      userProfile?.email?.toLowerCase() === 'sarah.johnson@example.com'
    )
  );

  // User Profile Form State with strict tenant privacy
  const [name, setName] = useState(() => {
    const emailLower = (userProfile?.email || 'candidate@copilot.com').toLowerCase();
    const isDemoCand = emailLower === 'candidate@copilot.com' || emailLower === 'sarah.johnson@example.com';
    const savedName = localStorage.getItem(`rc_name_${emailLower}`) ||
      (isDemoCand ? (localStorage.getItem('rc_name_candidate@copilot.com') || localStorage.getItem('rc_name_sarah.johnson@example.com')) : null);
    return savedName || userProfile?.name || (isDemoCand ? 'Sarah Johnson' : (isCandidate ? 'Candidate' : 'Sarah Jenkins'));
  });
  const [role, setRole] = useState(userProfile?.role || (isCandidate ? 'Senior Full Stack Engineer' : 'Lead Recruiter'));
  const [email, setEmail] = useState(userProfile?.email || (isCandidate ? 'candidate@copilot.com' : 'recruiter@copilot.com'));
  const [avatar, setAvatar] = useState<string | undefined>(() => {
    if (userProfile?.avatar) return userProfile.avatar;
    const emailLower = (userProfile?.email || 'candidate@copilot.com').toLowerCase();
    const isDemoCand = emailLower === 'candidate@copilot.com' || emailLower === 'sarah.johnson@example.com';
    const saved = localStorage.getItem(`rc_avatar_${emailLower}`);
    if (saved) return saved;
    if (isDemoCand) {
      return localStorage.getItem('rc_avatar_candidate@copilot.com') || localStorage.getItem('rc_avatar_sarah.johnson@example.com') || localStorage.getItem('rc_avatar_cand-1') || undefined;
    }
    return undefined;
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Candidate Career & Job Preferences state (Indian Tech Standards)
  const candidatePrefsKey = `rc_candidate_prefs_${(userProfile?.email || 'candidate@copilot.com').toLowerCase()}`;
  const [phone, setPhone] = useState(() => {
    return localStorage.getItem(`${candidatePrefsKey}_phone`) || '+91 98765 43210';
  });
  const [currentCity, setCurrentCity] = useState(() => {
    return localStorage.getItem(`${candidatePrefsKey}_city`) || 'Bengaluru, Karnataka';
  });
  const [searchStatus, setSearchStatus] = useState(() => {
    return localStorage.getItem(`${candidatePrefsKey}_status`) || 'ACTIVELY_LOOKING';
  });
  const [noticePeriod, setNoticePeriod] = useState(() => {
    return localStorage.getItem(`${candidatePrefsKey}_notice`) || '15_DAYS';
  });
  const [currentCtc, setCurrentCtc] = useState(() => {
    return localStorage.getItem(`${candidatePrefsKey}_current_ctc`) || '18.5';
  });
  const [expectedCtc, setExpectedCtc] = useState(() => {
    return localStorage.getItem(`${candidatePrefsKey}_expected_ctc`) || '28.0';
  });
  const [workMode, setWorkMode] = useState(() => {
    return localStorage.getItem(`${candidatePrefsKey}_workmode`) || 'HYBRID';
  });
  const [selectedLocations, setSelectedLocations] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${candidatePrefsKey}_locations`);
    return saved ? JSON.parse(saved) : ['Bengaluru', 'Hyderabad', 'Pune'];
  });
  const [linkedinUrl, setLinkedinUrl] = useState(() => {
    return localStorage.getItem(`${candidatePrefsKey}_linkedin`) || 'https://linkedin.com/in/sarah-johnson-dev';
  });
  const [githubUrl, setGithubUrl] = useState(() => {
    return localStorage.getItem(`${candidatePrefsKey}_github`) || 'https://github.com/sarah-johnson';
  });
  const [portfolioUrl, setPortfolioUrl] = useState(() => {
    return localStorage.getItem(`${candidatePrefsKey}_portfolio`) || 'https://sarahjohnson.dev';
  });
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [aiReportAlerts, setAiReportAlerts] = useState(true);
  const [accountFilter, setAccountFilter] = useState<'ALL' | 'PENDING' | 'ADMIN' | 'RECRUITER' | 'CANDIDATE'>('ALL');

  const INDIAN_TECH_HUBS = [
    'Bengaluru',
    'Hyderabad',
    'Pune',
    'Gurugram / Delhi NCR',
    'Chennai',
    'Mumbai',
    'Noida',
    'Remote India'
  ];

  useEffect(() => {
    if (userProfile) {
      const emailLower = (userProfile.email || '').toLowerCase();
      const isDemoCand = emailLower === 'candidate@copilot.com' || emailLower === 'sarah.johnson@example.com';
      const savedName = localStorage.getItem(`rc_name_${emailLower}`) ||
        (isDemoCand ? (localStorage.getItem('rc_name_candidate@copilot.com') || localStorage.getItem('rc_name_sarah.johnson@example.com')) : null);
      setName(savedName || userProfile.name);
      setRole(userProfile.role);
      setEmail(userProfile.email);
      const savedAvatar = userProfile.avatar ||
        localStorage.getItem(`rc_avatar_${emailLower}`) ||
        (isDemoCand ? (localStorage.getItem('rc_avatar_candidate@copilot.com') || localStorage.getItem('rc_avatar_sarah.johnson@example.com') || localStorage.getItem('rc_avatar_cand-1')) : undefined);
      setAvatar(savedAvatar || undefined);
    }
  }, [userProfile, isCandidate]);

  const handleSaveProfile = () => {
    const cleanMail = (email || userProfile?.email || 'candidate@copilot.com').toLowerCase();
    const cleanName = (name || '').trim();
    const isDemoCand = cleanMail === 'candidate@copilot.com' || cleanMail === 'sarah.johnson@example.com';

    if (cleanName) {
      safeSetItem(`rc_name_${cleanMail}`, cleanName);
      if (isDemoCand) {
        safeSetItem('rc_name_candidate@copilot.com', cleanName);
        safeSetItem('rc_name_sarah.johnson@example.com', cleanName);
        safeSetItem('rc_name_cand-1', cleanName);
      }
    }
    if (avatar) {
      safeSetItem(`rc_avatar_${cleanMail}`, avatar);
      if (isDemoCand) {
        safeSetItem('rc_avatar_candidate@copilot.com', avatar);
        safeSetItem('rc_avatar_sarah.johnson@example.com', avatar);
        safeSetItem('rc_avatar_cand-1', avatar);
      }
    }
    if (onUpdateUserProfile) {
      onUpdateUserProfile({ name: cleanName || name, role, email, avatar });
    }
    if (isCandidate) {
      safeSetItem(`${candidatePrefsKey}_phone`, phone);
      safeSetItem(`${candidatePrefsKey}_city`, currentCity);
      safeSetItem(`${candidatePrefsKey}_status`, searchStatus);
      safeSetItem(`${candidatePrefsKey}_notice`, noticePeriod);
      const cleanCurrentCtc = Math.max(0, parseFloat(currentCtc) || 0).toString();
      const cleanExpectedCtc = Math.max(0, parseFloat(expectedCtc) || 0).toString();
      safeSetItem(`${candidatePrefsKey}_current_ctc`, cleanCurrentCtc);
      safeSetItem(`${candidatePrefsKey}_expected_ctc`, cleanExpectedCtc);
      safeSetItem(`${candidatePrefsKey}_workmode`, workMode);
      safeSetItem(`${candidatePrefsKey}_locations`, JSON.stringify(selectedLocations));
      safeSetItem(`${candidatePrefsKey}_linkedin`, linkedinUrl);
      safeSetItem(`${candidatePrefsKey}_github`, githubUrl);
      safeSetItem(`${candidatePrefsKey}_portfolio`, portfolioUrl);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (dataUrl) => {
        setAvatar(dataUrl);
        const cleanMail = (email || userProfile?.email || 'candidate@copilot.com').toLowerCase();
        const isDemoCand = cleanMail === 'candidate@copilot.com' || cleanMail === 'sarah.johnson@example.com';
        safeSetItem(`rc_avatar_${cleanMail}`, dataUrl);
        if (isDemoCand) {
          safeSetItem('rc_avatar_candidate@copilot.com', dataUrl);
          safeSetItem('rc_avatar_sarah.johnson@example.com', dataUrl);
          safeSetItem('rc_avatar_cand-1', dataUrl);
        }
        if (onUpdateUserProfile) {
          onUpdateUserProfile({ name, role, email, avatar: dataUrl });
        }
      });
    }
  };

  const handleClearImage = () => {
    setAvatar(undefined);
    const cleanMail = (email || userProfile?.email || 'candidate@copilot.com').toLowerCase();
    const isDemoCand = cleanMail === 'candidate@copilot.com' || cleanMail === 'sarah.johnson@example.com';
    localStorage.removeItem(`rc_avatar_${cleanMail}`);
    if (isDemoCand) {
      localStorage.removeItem('rc_avatar_candidate@copilot.com');
      localStorage.removeItem('rc_avatar_sarah.johnson@example.com');
      localStorage.removeItem('rc_avatar_cand-1');
    }
    if (onUpdateUserProfile) {
      onUpdateUserProfile({ name, role, email, avatar: undefined });
    }
  };

  const toggleLocation = (loc: string) => {
    setSelectedLocations(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const handleDownloadMyData = () => {
    const candidateData = {
      profile: {
        name,
        role,
        email,
        phone,
        currentCity,
        avatar: avatar ? 'Image set' : 'None'
      },
      careerPreferences: {
        searchStatus,
        noticePeriod: noticePeriod === '15_DAYS' ? 'Immediate / <15 days' : noticePeriod === '30_DAYS' ? '30 Days' : noticePeriod === '60_DAYS' ? '60 Days' : '90 Days',
        currentCtc: `₹${currentCtc} LPA`,
        expectedCtc: `₹${expectedCtc} LPA`,
        workMode,
        preferredLocations: selectedLocations,
        socialProfiles: { linkedinUrl, githubUrl, portfolioUrl }
      },
      notificationPreferences: {
        emailAlerts,
        whatsappAlerts,
        aiReportAlerts
      },
      compliance: {
        dpdpAct: 'Digital Personal Data Protection Act (India, 2023) Compliant',
        consentGiven: true
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(candidateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `candidate_profile_${email.replace(/[@.]/g, '_')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-8 font-sans relative">
      {/* Floating Save Success Banner */}
      {savedSuccess && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-black text-sm shrink-0">✓</div>
          <div>
            <p className="font-extrabold text-xs">Profile & Preferences Saved!</p>
            <p className="text-[11px] text-emerald-100">All changes and candidate preferences updated successfully.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
            isCandidate ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-300'
          }`}>
            {isCandidate ? 'Candidate Account Settings' : 'System Administration'}
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {isCandidate ? 'Candidate Profile & Career Preferences' : 'System Settings & Administration'}
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          {isCandidate 
            ? 'Manage your personal profile, compensation expectations, Indian tech job preferences, and data privacy'
            : 'Manage user access approvals, profile details, and system administration'}
        </p>
      </div>

      {/* User Profile Settings Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="font-bold text-slate-900 text-base">
            {isCandidate ? 'Personal & Contact Information' : 'User Profile Settings'}
          </div>
          {savedSuccess && (
            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 animate-pulse">
              ✓ Preferences Updated Successfully!
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Photo Upload Box */}
          <div className="flex flex-col items-center gap-3 space-y-1">
            <label className="text-xs font-bold text-slate-700">Profile Photo</label>
            <div className="relative group">
              <UserAvatar name={name} avatar={avatar} size="xl" className="border-4 border-indigo-100 shadow-md" />
            </div>
            <input 
              id="user-avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleImageFileUpload}
              className="hidden"
            />
            
            <div className="flex items-center gap-2">
              <label
                htmlFor="user-avatar-upload"
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl cursor-pointer transition-colors border border-indigo-200 shadow-2xs"
              >
                Upload Photo
              </label>
              {avatar && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors border border-rose-200 cursor-pointer"
                  title="Clear photo to use initials badge"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 text-center max-w-[160px]">
              {avatar ? 'Custom photo active.' : 'No photo uploaded. Showing avatar badge.'}
            </p>
          </div>

          {/* Form Fields */}
          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Sarah Johnson"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isCandidate ? 'Current Professional Title' : 'Role / Position'}
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Senior Full Stack Engineer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 cursor-not-allowed select-none"
                  placeholder="e.g. candidate@copilot.com"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Account login email (locked for candidate profile security)</span>
              </div>
              {isCandidate ? (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mobile / WhatsApp Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Image URL (Optional Alternative)</label>
                  <input
                    type="text"
                    value={avatar || ''}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/my-profile-photo.png"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {isCandidate && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Current Base City (India)</label>
                <input
                  type="text"
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Bengaluru, Karnataka (Electronic City)"
                />
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveProfile}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                  savedSuccess
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white scale-[1.02]'
                    : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <span className="text-sm font-black">✓</span>
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <span>💾 Save Profile & Preferences</span>
                  </>
                )}
              </button>
              {savedSuccess && (
                <span className="text-xs font-bold text-emerald-600 animate-pulse">
                  Profile updated!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interface Appearance & Theme Toggle Card (Accessible to All Users) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span>🎨 Interface Appearance & Theme</span>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${
                theme === 'dark' ? 'bg-indigo-900 text-indigo-200 border border-indigo-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {theme === 'dark' ? '🌙 Dark Mode Active' : '☀️ Light Mode Active'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize the look and feel of your AI Recruitment Copilot workspace across all portals
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => { if (theme !== 'light' && onToggleTheme) onToggleTheme(); }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
              theme === 'light'
                ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 text-xl font-bold">
              ☀️
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">Light Mode</span>
                {theme === 'light' && (
                  <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Clean high-contrast theme optimized for bright workspaces and daytime reviewing.
              </p>
            </div>
          </div>

          <div
            onClick={() => { if (theme !== 'dark' && onToggleTheme) onToggleTheme(); }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
              theme === 'dark'
                ? 'border-blue-500 bg-slate-900/80 text-white shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0 text-xl font-bold">
              🌙
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">Dark Mode</span>
                {theme === 'dark' && (
                  <span className="text-[10px] font-black text-blue-400 bg-blue-900/60 px-2 py-0.5 rounded-full border border-blue-700">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Sleek obsidian theme designed for low-light environments and reduced eye strain.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CANDIDATE SPECIFIC SECTIONS: Career Preferences, Portfolio, Alerts, Privacy */}
      {isCandidate ? (
        <div className="space-y-6">
          {/* Career & Compensation Preferences Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>🎯 Career & Job Market Preferences</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800">
                    Indian Tech Standards
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure your availability, notice period, and CTC expectations for matching hiring teams
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Job Search Status</label>
                <select
                  value={searchStatus}
                  onChange={e => setSearchStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVELY_LOOKING">🟢 Actively Interviewing & Ready to Join</option>
                  <option value="OPEN_TO_OFFERS">🟡 Open to Selective Opportunities</option>
                  <option value="NOT_LOOKING">⚪ Casually Exploring / Not Actively Looking</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notice Period</label>
                <select
                  value={noticePeriod}
                  onChange={e => setNoticePeriod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="15_DAYS">Immediate / Serving Notice (&lt;15 Days)</option>
                  <option value="30_DAYS">30 Days (Standard Startup / Product Tech)</option>
                  <option value="60_DAYS">60 Days</option>
                  <option value="90_DAYS">90 Days (MNC / Enterprise Standard)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Current CTC (in ₹ LPA)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={currentCtc}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') {
                        setCurrentCtc('');
                      } else {
                        const num = parseFloat(val);
                        setCurrentCtc(isNaN(num) || num < 0 ? '0' : val);
                      }
                    }}
                    className="w-full pl-8 pr-16 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="18.5"
                  />
                  <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold">LPA</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">₹{(Math.max(0, Number(currentCtc || 0)) * 100000).toLocaleString('en-IN')} Per Annum</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Expected CTC (in ₹ LPA)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={expectedCtc}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') {
                        setExpectedCtc('');
                      } else {
                        const num = parseFloat(val);
                        setExpectedCtc(isNaN(num) || num < 0 ? '0' : val);
                      }
                    }}
                    className="w-full pl-8 pr-16 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="28.0"
                  />
                  <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold">LPA</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">₹{(Math.max(0, Number(expectedCtc || 0)) * 100000).toLocaleString('en-IN')} Per Annum</p>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1.5">Preferred Work Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[
                  { id: 'HYBRID', title: '🏢 Hybrid (2-3 Days Office)', desc: 'Flexible in-office collaboration' },
                  { id: 'REMOTE', title: '🏠 100% Remote / WFH', desc: 'Work from anywhere in India' },
                  { id: 'ON_SITE', title: '📍 In-Office (Full-time)', desc: 'Direct corporate campus presence' }
                ].map(mode => (
                  <div
                    key={mode.id}
                    onClick={() => setWorkMode(mode.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      workMode === mode.id
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <p className="font-bold">{mode.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{mode.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1.5">
                Preferred Tech Hub Locations in India (Click to select multiple)
              </label>
              <div className="flex flex-wrap gap-2">
                {INDIAN_TECH_HUBS.map(loc => {
                  const isSelected = selectedLocations.includes(loc);
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => toggleLocation(loc)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {isSelected ? `✓ ${loc}` : `+ ${loc}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Career Preferences Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[11px] text-slate-500 font-medium">
                Changes immediately benchmark your profile against Indian tech job market criteria.
              </p>
              <button
                type="button"
                onClick={handleSaveProfile}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                  savedSuccess
                    ? 'bg-emerald-600 text-white scale-[1.02]'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                }`}
              >
                {savedSuccess ? '✓ Career Preferences Saved!' : '💾 Save Career Preferences'}
              </button>
            </div>
          </div>

          {/* Professional Portfolio & Social Profiles Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">🌐 Professional Profiles & Portfolio Links</h3>
              <p className="text-xs text-slate-500 mt-0.5">Showcase your public code repositories and professional network</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">GitHub Profile</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Personal Portfolio / Website</label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={e => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourportfolio.dev"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Portfolio Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[11px] text-slate-500 font-medium">
                Public profile links visible to verified hiring managers.
              </p>
              <button
                type="button"
                onClick={handleSaveProfile}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                  savedSuccess
                    ? 'bg-emerald-600 text-white scale-[1.02]'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                }`}
              >
                {savedSuccess ? '✓ Portfolio Links Saved!' : '💾 Save Portfolio Links'}
              </button>
            </div>
          </div>

          {/* Interview Notifications & Alerts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">🔔 Interview Alerts & Communication Channels</h3>
              <p className="text-xs text-slate-500 mt-0.5">Control how and when you receive interview coordination updates</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-900 text-xs">Email Notifications for Interview Invites & Stage Updates</p>
                  <p className="text-[11px] text-slate-500">Receive calendar invitations and recruitment pipeline updates directly to {email}</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={e => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-900 text-xs">WhatsApp & SMS Reminders for Upcoming Scheduled Calls</p>
                  <p className="text-[11px] text-slate-500">Instant meeting link reminders 30 minutes before video interviews</p>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappAlerts}
                  onChange={e => setWhatsappAlerts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-900 text-xs">Automated AI Screening Scores & Communication Feedback Delivery</p>
                  <p className="text-[11px] text-slate-500">Detailed NLP speech clarity and technical relevance summaries after screening sessions</p>
                </div>
                <input
                  type="checkbox"
                  checked={aiReportAlerts}
                  onChange={e => setAiReportAlerts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Candidate Data Privacy & Protection (DPDP Compliant) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">🛡️ Data Privacy & Candidate Rights</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Compliant with India's Digital Personal Data Protection (DPDP) Act 2023
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadMyData}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-all flex items-center gap-2 cursor-pointer shadow-2xs self-start sm:self-auto"
              >
                <span>📥 Export My Profile Data (JSON)</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1.5">
              <p className="font-bold text-slate-800">Your Privacy Assurances:</p>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-500">
                <li>Your resume, voice screening audio, and interview practice recordings are encrypted at rest.</li>
                <li>Candidate data is isolated to your profile and only shared with verified hiring recruiters.</li>
                <li>You can update or export your candidate records at any time.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* RECRUITER & ADMIN SPECIFIC SECTIONS: User Approvals & Candidate DB Reset */
        <div className="space-y-8">
          {/* Administrator User Approvals Console */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">User Accounts & Administrator Approval Queue</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage user access rights. Only logged-in Administrators can grant, promote, or revoke user access.</p>
              </div>
              <div className="flex items-center gap-2">
                {userProfile?.userType === 'ADMIN' && (
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to clear the User Accounts approval queue? This will reset user accounts to default Main Super Admin.")) {
                        onClearAllUserAccounts && onClearAllUserAccounts();
                        alert("User Accounts approval queue cleared successfully!");
                      }
                    }}
                    className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 transition-colors"
                    title="Clear all secondary/pending user accounts"
                  >
                    Clear User Accounts Queue
                  </button>
                )}
                <span className="px-3 py-1 bg-slate-900 text-white rounded-md text-xs font-bold">
                  {userAccounts.filter(u => u.status === 'PENDING').length} Pending Requests
                </span>
              </div>
            </div>

            {userProfile?.userType !== 'ADMIN' ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                <span className="font-bold text-slate-900 text-xs block">Administrator Privileges Required</span>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You are currently logged in as a Standard Recruiter. Access control management and user approvals are restricted exclusively to system Administrators.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* User Account Type / Status Filters */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setAccountFilter('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      accountFilter === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    All Accounts ({userAccounts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountFilter('PENDING')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      accountFilter === 'PENDING' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900'
                    }`}
                  >
                    <span>⏳</span> Pending Requests ({userAccounts.filter(u => u.status === 'PENDING').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountFilter('ADMIN')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      accountFilter === 'ADMIN' ? 'bg-purple-700 text-white shadow-xs' : 'bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900'
                    }`}
                  >
                    👑 Admins ({userAccounts.filter(u => u.userType === 'ADMIN').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountFilter('RECRUITER')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      accountFilter === 'RECRUITER' ? 'bg-blue-600 text-white shadow-xs' : 'bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900'
                    }`}
                  >
                    💼 Recruiters ({userAccounts.filter(u => u.role.toLowerCase().includes('recruiter') || (u.userType === 'USER' && !u.role.toLowerCase().includes('candidate'))).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountFilter('CANDIDATE')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      accountFilter === 'CANDIDATE' ? 'bg-slate-700 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    🎯 Candidates ({userAccounts.filter(u => u.role.toLowerCase().includes('candidate')).length})
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
                  <table className="w-full min-w-[920px] text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 font-bold text-slate-500 bg-slate-50">
                        <th className="py-2.5 px-3">User Name</th>
                        <th className="py-2.5 px-3">Email Address</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Access Control Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {userAccounts
                        .filter(u => {
                          if (accountFilter === 'PENDING') return u.status === 'PENDING';
                          if (accountFilter === 'ADMIN') return u.userType === 'ADMIN';
                          if (accountFilter === 'RECRUITER') return u.role.toLowerCase().includes('recruiter') || (u.userType === 'USER' && !u.role.toLowerCase().includes('candidate'));
                          if (accountFilter === 'CANDIDATE') return u.role.toLowerCase().includes('candidate');
                          return true;
                        })
                        .map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <UserAvatar 
                                name={user.name} 
                                avatar={user.avatar || localStorage.getItem(`rc_avatar_${user.email.toLowerCase()}`) || undefined} 
                                size="xs" 
                              />
                              <span>{user.name}</span>
                              {user.isSuperAdmin && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-black rounded border border-blue-200">
                                  Main Super-Admin
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-700">{user.email}</td>
                          <td className="py-3 px-3 text-slate-600">{user.role}</td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              user.userType === 'ADMIN' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {user.userType}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              user.status === 'APPROVED' 
                                ? 'bg-emerald-100 text-emerald-800'
                                : user.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {user.isSuperAdmin ? (
                              <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 inline-block">
                                👑 Protected Main Admin
                              </span>
                            ) : (
                              <div className="flex flex-wrap items-center justify-end gap-1.5">
                                {/* 1. APPROVE */}
                                {user.status !== 'APPROVED' && (
                                  <button
                                    type="button"
                                    onClick={() => onApproveUser && onApproveUser(user.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded text-[11px] transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                                    title="Approve user access"
                                  >
                                    <span>✓</span> Approve
                                  </button>
                                )}

                                {/* 2. REVOKE */}
                                {user.status === 'APPROVED' && (
                                  <button
                                    type="button"
                                    onClick={() => onRevokeUserAccess && onRevokeUserAccess(user.id)}
                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold rounded text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                                    title="Revoke active user access"
                                  >
                                    <span>⛔</span> Revoke
                                  </button>
                                )}

                                {/* 3. REJECT */}
                                {user.status === 'PENDING' && (
                                  <button
                                    type="button"
                                    onClick={() => onRejectUser && onRejectUser(user.id)}
                                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold rounded text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                                    title="Reject access request"
                                  >
                                    <span>✕</span> Reject
                                  </button>
                                )}

                                {/* 4. MAKE ADMIN / 5. REMOVE ADMIN */}
                                {user.userType !== 'ADMIN' ? (
                                  <button
                                    type="button"
                                    onClick={() => onMakeUserAdmin && onMakeUserAdmin(user.id)}
                                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold rounded text-[11px] transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                                    title="Promote to Administrator"
                                  >
                                    <span>👑</span> Make Admin
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => onRemoveUserAdmin && onRemoveUserAdmin(user.id)}
                                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-800 font-bold rounded text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                                    title="Remove Administrator privileges (demote to Recruiter)"
                                  >
                                    <span>🛡️</span> Remove Admin
                                  </button>
                                )}

                                {/* 6. MAKE RECRUITER */}
                                {(user.userType === 'ADMIN' || !user.role.toLowerCase().includes('recruiter') || user.role.toLowerCase().includes('candidate')) && (
                                  <button
                                    type="button"
                                    onClick={() => onMakeUserRecruiter && onMakeUserRecruiter(user.id)}
                                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-700 font-bold rounded text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                                    title="Assign standard Recruiter role"
                                  >
                                    <span>💼</span> Make Recruiter
                                  </button>
                                )}

                                {/* 7. DELETE */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Permanently delete account for "${user.name}" (${user.email})? This action cannot be undone.`)) {
                                      onDeleteUserAccount && onDeleteUserAccount(user.id);
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold rounded text-[11px] transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                                  title="Permanently delete user account"
                                >
                                  <span>🗑️</span> Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Candidate Resume Data Reset Management */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Candidate Resume Database Management</h3>
                <p className="text-xs text-slate-500 mt-0.5">Clear all stored candidate resume data to reset the system for fresh uploads.</p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear all candidate resume data?")) {
                    onClearAllCandidates && onClearAllCandidates();
                    alert("Candidate resume database cleared successfully!");
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Clear All Candidate Resumes
              </button>
            </div>
          </div>

          {/* Job Openings & Specifications Reset Management */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Job Postings & Requirements Reset</h3>
                <p className="text-xs text-slate-500 mt-0.5">Restore all original 5 core engineering job specifications (ML, Frontend, DevOps, Backend, Full Stack).</p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm("Restore all default job postings and requirements? Any custom changes to default jobs will reset.")) {
                    onRestoreDefaultJobs && onRestoreDefaultJobs();
                    alert("All default job postings and requirements restored successfully!");
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                🔄 Restore Default Job Postings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
