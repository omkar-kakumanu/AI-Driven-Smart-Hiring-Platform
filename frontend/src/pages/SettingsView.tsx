import React, { useState, useEffect } from 'react';
import type { UserProfile, UserAccount } from '../types';
import { UserAvatar } from '../components/UserAvatar';
import { 
  Shield, 
  Briefcase, 
  UserCheck, 
  Check, 
  X, 
  Ban, 
  Trash2, 
  Sun, 
  Moon, 
  Save, 
  Palette, 
  Download, 
  Clock, 
  Target,
  Search,
  CheckCircle2,
  Users,
  RefreshCw
} from 'lucide-react';

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
  onMakeUserCandidate?: (userId: string) => void;
  onRemoveUserRecruiter?: (userId: string) => void;
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
  onMakeUserCandidate,
  onRemoveUserRecruiter,
  onClearAllCandidates,
  onClearAllUserAccounts,
  onRestoreDefaultJobs
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

  const isCandidate = isCandidateUser || Boolean(!isAdmin && !isRecruiterUser);

  const activeRoleTier = isAdmin 
    ? (isSuperAdmin ? 'Super-Admin' : 'Administrator') 
    : isRecruiterUser 
    ? 'Recruiter' 
    : 'Candidate';

  // Helper functions for directory account roles
  const isAccountAdmin = (u: UserAccount) => Boolean(
    u.userType === 'ADMIN' ||
    u.isSuperAdmin ||
    u.email.toLowerCase() === 'admin@copilot.com'
  );

  const isAccountRecruiter = (u: UserAccount) => Boolean(
    !isAccountAdmin(u) && (
      u.role.toLowerCase().includes('recruiter') ||
      u.role.toLowerCase().includes('talent') ||
      u.email.toLowerCase() === 'recruiter@copilot.com'
    )
  );

  const isAccountCandidate = (u: UserAccount) => Boolean(
    !isAccountAdmin(u) && !isAccountRecruiter(u)
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
  const [accountFilter, setAccountFilter] = useState<'ALL' | 'PENDING' | 'ADMIN' | 'RECRUITER' | 'CANDIDATE' | 'REVOKED'>('ALL');
  const [accountSearchQuery, setAccountSearchQuery] = useState('');

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
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-black text-sm shrink-0"><Check className="w-4 h-4 text-white" /></div>
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

      {/* Active Session Identity & Role Governance Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <UserAvatar name={name} avatar={avatar} size="md" />
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              isAdmin ? 'bg-purple-500' : isRecruiterUser ? 'bg-blue-500' : 'bg-emerald-500'
            }`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-slate-900 text-base truncate">{name}</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide border shadow-2xs ${
                isAdmin 
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : isRecruiterUser
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {isAdmin && <Shield className="w-3 h-3 text-purple-600" />}
                {isRecruiterUser && <Briefcase className="w-3 h-3 text-blue-600" />}
                {!isAdmin && !isRecruiterUser && <UserCheck className="w-3 h-3 text-emerald-600" />}
                <span>Active Role: {activeRoleTier}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">
              Signed in as <span className="font-bold text-slate-700">{email}</span> • {role}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right text-xs text-slate-500 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 w-full sm:w-auto">
          <span className="font-bold text-slate-800 block">
            {isAdmin ? 'System Administrator Authority' : isRecruiterUser ? 'Talent Recruiter Access' : 'Candidate Portal Access'}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {isAdmin 
              ? 'User Approvals & Role Governance' 
              : isRecruiterUser 
              ? 'Candidate Pipeline & ATS Review' 
              : 'Skill Assessment & Voice Screening'}
          </span>
        </div>
      </div>

      {/* User Profile Settings Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="font-bold text-slate-900 text-base">
            {isCandidate ? 'Personal & Contact Information' : 'User Profile Settings'}
          </div>
          {savedSuccess && (
            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 animate-pulse">
              <Check className="w-3.5 h-3.5 text-emerald-600 inline mr-1" /> Preferences Updated Successfully!
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
                    <Check className="w-4 h-4 text-white inline mr-1" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1 inline" /><span>Save Profile & Preferences</span>
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
              <Palette className="w-4 h-4 text-blue-600 inline mr-1" /><span>Interface Appearance & Theme</span>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${
                theme === 'dark' ? 'bg-indigo-900 text-indigo-200 border border-indigo-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
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
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5 text-amber-600" />
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
            <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5 text-indigo-400" />
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
                  <Target className="w-4 h-4 text-blue-600 inline mr-1" /><span>Career & Job Market Preferences</span>
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
                  <option value="ACTIVELY_LOOKING">Actively Interviewing & Ready to Join</option>
                  <option value="OPEN_TO_OFFERS">Open to Selective Opportunities</option>
                  <option value="NOT_LOOKING">Casually Exploring / Not Actively Looking</option>
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
                  { id: 'HYBRID', title: 'Hybrid (2-3 Days Office)', desc: 'Flexible in-office collaboration' },
                  { id: 'REMOTE', title: '100% Remote / WFH', desc: 'Work from anywhere in India' },
                  { id: 'ON_SITE', title: 'In-Office (Full-time)', desc: 'Direct corporate campus presence' }
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
                      {isSelected ? `${loc}` : `+ ${loc}`}
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
                {savedSuccess ? 'Career Preferences Saved!' : 'Save Career Preferences'}
              </button>
            </div>
          </div>

          {/* Professional Portfolio & Social Profiles Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Professional Profiles & Portfolio Links</h3>
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
                {savedSuccess ? 'Portfolio Links Saved!' : 'Save Portfolio Links'}
              </button>
            </div>
          </div>

          {/* Interview Notifications & Alerts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Interview Alerts & Communication Channels</h3>
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
                <h3 className="font-bold text-slate-900 text-base">Data Privacy & Candidate Rights</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Compliant with India's Digital Personal Data Protection (DPDP) Act 2023
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadMyData}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-all flex items-center gap-2 cursor-pointer shadow-2xs self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5 inline mr-1" /><span>Export My Profile Data (JSON)</span>
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
          {/* IAM METRICS SUMMARY KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Total Accounts */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total IAM</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{userAccounts.length}</div>
              <p className="text-[10px] text-slate-500 font-medium">Identities in Registry</p>
            </div>

            {/* Pending Approvals */}
            <div className={`rounded-2xl p-4 shadow-xs space-y-1 border ${
              userAccounts.filter(u => u.status === 'PENDING').length > 0
                ? 'bg-amber-50/50 border-amber-300'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">Approval Queue</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-amber-900 tracking-tight">
                  {userAccounts.filter(u => u.status === 'PENDING').length}
                </span>
                {userAccounts.filter(u => u.status === 'PENDING').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <p className="text-[10px] text-amber-700 font-medium">Awaiting Action</p>
            </div>

            {/* Administrators */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">Admins</span>
                <Shield className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-900 tracking-tight">
                {userAccounts.filter(isAccountAdmin).length}
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Full Governance</p>
            </div>

            {/* Recruiters */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">Recruiters</span>
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-900 tracking-tight">
                {userAccounts.filter(isAccountRecruiter).length}
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Talent Operations</p>
            </div>

            {/* Candidates */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Candidates</span>
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-900 tracking-tight">
                {userAccounts.filter(isAccountCandidate).length}
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Job Applicants</p>
            </div>
          </div>

          {/* 1. DEDICATED ADMINISTRATOR APPROVAL QUEUE CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  userAccounts.filter(u => u.status === 'PENDING').length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Administrator Approval Queue
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                      userAccounts.filter(u => u.status === 'PENDING').length > 0 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {userAccounts.filter(u => u.status === 'PENDING').length} Pending
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review incoming access requests and assign roles directly upon verification.
                  </p>
                </div>
              </div>
            </div>

            {userProfile?.userType !== 'ADMIN' ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                <span className="font-bold text-slate-900 text-xs block">Administrator Privileges Required</span>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You are logged in as a Recruiter. Approval queue decisions and role modifications are restricted to System Administrators.
                </p>
              </div>
            ) : userAccounts.filter(u => u.status === 'PENDING').length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Approval Queue is All Clear</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    All incoming access requests have been processed. New applicant or recruiter registration requests will appear here for 1-click verification.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {userAccounts.filter(u => u.status === 'PENDING').map(req => (
                  <div 
                    key={req.id}
                    className="p-4 bg-amber-50/50 border border-amber-200/90 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar name={req.name} avatar={req.avatar} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm truncate">{req.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                            Requested: {req.role || 'Access Request'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 truncate">{req.email}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Submitted: {req.createdAt || 'Recent'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onMakeUserRecruiter && onMakeUserRecruiter(req.id);
                          onApproveUser && onApproveUser(req.id);
                          alert(`Approved "${req.name}" as Recruiter.`);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Approve request and assign Recruiter role"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Approve as Recruiter</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onMakeUserAdmin && onMakeUserAdmin(req.id);
                          onApproveUser && onApproveUser(req.id);
                          alert(`Approved "${req.name}" as Administrator.`);
                        }}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Approve request and grant Administrator rights"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Approve as Admin</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onMakeUserCandidate && onMakeUserCandidate(req.id);
                          onApproveUser && onApproveUser(req.id);
                          alert(`Approved "${req.name}" as Candidate.`);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Approve request as Candidate"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Approve as Candidate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onRejectUser && onRejectUser(req.id);
                          alert(`Access request rejected for "${req.name}".`);
                        }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Decline request"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. ENTERPRISE USER ACCOUNTS DIRECTORY */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Enterprise User Directory & Role Governance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure role assignments, grant administrator privileges, or revoke active sessions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {userProfile?.userType === 'ADMIN' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Reset User Accounts queue back to default enterprise accounts?")) {
                        onClearAllUserAccounts && onClearAllUserAccounts();
                        alert("User accounts reset to default successfully.");
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                    title="Reset user accounts directory to default"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reset Directory</span>
                  </button>
                )}
              </div>
            </div>

            {userProfile?.userType !== 'ADMIN' ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                <span className="font-bold text-slate-900 text-xs block">Directory Administration Restricted</span>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Only System Administrators have authorization to modify roles, grant permissions, or revoke user accounts.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Search & Segmented Filter Bar */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={accountSearchQuery}
                        onChange={e => setAccountSearchQuery(e.target.value)}
                        placeholder="Search accounts by name, email, or role..."
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                      />
                      {accountSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setAccountSearchQuery('')}
                          className="w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 absolute right-2.5 top-2.5 flex items-center justify-center text-xs font-bold leading-none cursor-pointer"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Counter */}
                    <div className="text-xs text-slate-500 font-bold shrink-0 self-center">
                      Showing {userAccounts.filter(u => {
                        if (accountSearchQuery.trim()) {
                          const q = accountSearchQuery.toLowerCase().trim();
                          const match = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
                          if (!match) return false;
                        }
                        if (accountFilter === 'PENDING') return u.status === 'PENDING';
                        if (accountFilter === 'ADMIN') return isAccountAdmin(u);
                        if (accountFilter === 'RECRUITER') return isAccountRecruiter(u);
                        if (accountFilter === 'CANDIDATE') return isAccountCandidate(u);
                        if (accountFilter === 'REVOKED') return u.status === 'REVOKED' || u.status === 'REJECTED';
                        return true;
                      }).length} of {userAccounts.length} accounts
                    </div>
                  </div>

                  {/* Segmented Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {[
                      { id: 'ALL', label: 'All Accounts', count: userAccounts.length },
                      { id: 'ADMIN', label: 'Administrators', count: userAccounts.filter(isAccountAdmin).length },
                      { id: 'RECRUITER', label: 'Recruiters', count: userAccounts.filter(isAccountRecruiter).length },
                      { id: 'CANDIDATE', label: 'Candidates', count: userAccounts.filter(isAccountCandidate).length },
                      { id: 'PENDING', label: 'Pending Review', count: userAccounts.filter(u => u.status === 'PENDING').length },
                      { id: 'REVOKED', label: 'Revoked', count: userAccounts.filter(u => u.status === 'REVOKED' || u.status === 'REJECTED').length },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setAccountFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          accountFilter === tab.id
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                          accountFilter === tab.id ? 'bg-slate-800 text-slate-200' : 'bg-slate-200/80 text-slate-600'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Directory Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                  <table className="w-full min-w-[960px] text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 font-bold text-slate-500 bg-slate-50/80">
                        <th className="py-3 px-3.5">User Identity</th>
                        <th className="py-3 px-3.5">Contact Email</th>
                        <th className="py-3 px-3.5">Current Role Tier</th>
                        <th className="py-3 px-3.5">Access Status</th>
                        <th className="py-3 px-3.5 text-center">Role Assignment</th>
                        <th className="py-3 px-3.5 text-right">Security Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {userAccounts
                        .filter(u => {
                          if (accountSearchQuery.trim()) {
                            const q = accountSearchQuery.toLowerCase().trim();
                            const match = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
                            if (!match) return false;
                          }
                          if (accountFilter === 'PENDING') return u.status === 'PENDING';
                          if (accountFilter === 'ADMIN') return isAccountAdmin(u);
                          if (accountFilter === 'RECRUITER') return isAccountRecruiter(u);
                          if (accountFilter === 'CANDIDATE') return isAccountCandidate(u);
                          if (accountFilter === 'REVOKED') return u.status === 'REVOKED' || u.status === 'REJECTED';
                          return true;
                        })
                        .map(user => {
                          const isCurrentUser = user.email.toLowerCase() === (userProfile?.email || '').toLowerCase();
                          const isSuperAdminAccount = user.isSuperAdmin || user.email.toLowerCase() === 'admin@copilot.com';
                          const userIsAdmin = isAccountAdmin(user);
                          const userIsRecruiter = isAccountRecruiter(user);
                          const userIsCandidate = isAccountCandidate(user);

                          return (
                            <tr 
                              key={user.id} 
                              className={`transition-colors ${
                                isCurrentUser 
                                  ? 'bg-blue-50/50 hover:bg-blue-50/80' 
                                  : 'hover:bg-slate-50/80'
                              }`}
                            >
                              {/* 1. Identity */}
                              <td className="py-3.5 px-3.5 font-bold text-slate-900">
                                <div className="flex items-center gap-2.5">
                                  <div className="relative shrink-0">
                                    <UserAvatar 
                                      name={user.name} 
                                      avatar={user.avatar || localStorage.getItem(`rc_avatar_${user.email.toLowerCase()}`) || undefined} 
                                      size="sm" 
                                    />
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                      userIsAdmin ? 'bg-purple-500' : userIsRecruiter ? 'bg-blue-500' : 'bg-emerald-500'
                                    }`} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="truncate">{user.name}</span>
                                      {isCurrentUser && (
                                        <span className="px-1.5 py-0.2 rounded-md bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider shadow-2xs">
                                          You
                                        </span>
                                      )}
                                      {isSuperAdminAccount && (
                                        <span className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-900 text-[9px] font-black border border-purple-200">
                                          Super-Admin
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-normal block">
                                      Added {user.createdAt || 'Standard'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Email */}
                              <td className="py-3.5 px-3.5 text-slate-600 font-mono text-[11px]">
                                {user.email}
                              </td>

                              {/* 3. Role Tier Badge */}
                              <td className="py-3.5 px-3.5">
                                <div>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide border ${
                                    userIsAdmin
                                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                                      : userIsRecruiter
                                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  }`}>
                                    {userIsAdmin && <Shield className="w-2.5 h-2.5 text-purple-600" />}
                                    {userIsRecruiter && <Briefcase className="w-2.5 h-2.5 text-blue-600" />}
                                    {userIsCandidate && <UserCheck className="w-2.5 h-2.5 text-emerald-600" />}
                                    <span>{userIsAdmin ? 'Admin' : userIsRecruiter ? 'Recruiter' : 'Candidate'}</span>
                                  </span>
                                  <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                                    {user.role}
                                  </p>
                                </div>
                              </td>

                              {/* 4. Access Status */}
                              <td className="py-3.5 px-3.5">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                  user.status === 'APPROVED' 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : user.status === 'PENDING'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    user.status === 'APPROVED' ? 'bg-emerald-500' : user.status === 'PENDING' ? 'bg-amber-500' : 'bg-rose-500'
                                  }`} />
                                  <span>{user.status}</span>
                                </span>
                              </td>

                              {/* 5. Role Assignment (Segmented Controls) */}
                              <td className="py-3.5 px-3.5 text-center">
                                {isSuperAdminAccount ? (
                                  <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                    Root Super-Admin
                                  </span>
                                ) : (
                                  <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                                    {/* Make Admin Button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!userIsAdmin) {
                                          onMakeUserAdmin && onMakeUserAdmin(user.id);
                                          alert(`Promoted "${user.name}" to Administrator.`);
                                        }
                                      }}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                        userIsAdmin
                                          ? 'bg-purple-700 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-purple-700 hover:bg-slate-200/60'
                                      }`}
                                      title={userIsAdmin ? "Currently Administrator" : "Promote to Administrator"}
                                    >
                                      <Shield className="w-2.5 h-2.5" />
                                      <span>Admin</span>
                                    </button>

                                    {/* Make Recruiter Button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!userIsRecruiter) {
                                          onMakeUserRecruiter && onMakeUserRecruiter(user.id);
                                          alert(`Assigned Recruiter role to "${user.name}".`);
                                        }
                                      }}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                        userIsRecruiter
                                          ? 'bg-blue-600 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-blue-700 hover:bg-slate-200/60'
                                      }`}
                                      title={userIsRecruiter ? "Currently Recruiter" : "Assign Recruiter role"}
                                    >
                                      <Briefcase className="w-2.5 h-2.5" />
                                      <span>Recruiter</span>
                                    </button>

                                    {/* Make Candidate Button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!userIsCandidate) {
                                          onMakeUserCandidate && onMakeUserCandidate(user.id);
                                          alert(`Assigned Candidate role to "${user.name}".`);
                                        }
                                      }}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                        userIsCandidate
                                          ? 'bg-emerald-600 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-200/60'
                                      }`}
                                      title={userIsCandidate ? "Currently Candidate" : "Assign Candidate role"}
                                    >
                                      <UserCheck className="w-2.5 h-2.5" />
                                      <span>Candidate</span>
                                    </button>
                                  </div>
                                )}
                              </td>

                              {/* 6. Security Actions */}
                              <td className="py-3.5 px-3.5 text-right">
                                {isSuperAdminAccount ? (
                                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                                    Protected
                                  </span>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    {user.status === 'PENDING' ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            onApproveUser && onApproveUser(user.id);
                                            alert(`Access approved for "${user.name}".`);
                                          }}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                                          title="Approve access"
                                        >
                                          <Check className="w-3 h-3" />
                                          <span>Approve</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            onRejectUser && onRejectUser(user.id);
                                            alert(`Access request rejected for "${user.name}".`);
                                          }}
                                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-1"
                                          title="Reject request"
                                        >
                                          <X className="w-3 h-3" />
                                          <span>Reject</span>
                                        </button>
                                      </>
                                    ) : user.status === 'APPROVED' ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onRevokeUserAccess && onRevokeUserAccess(user.id);
                                          alert(`Access revoked for "${user.name}". Any active session has been terminated.`);
                                        }}
                                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-1"
                                        title="Revoke access (immediately blocks session)"
                                      >
                                        <Ban className="w-3 h-3 text-amber-700" />
                                        <span>Revoke</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onApproveUser && onApproveUser(user.id);
                                          alert(`Access re-approved for "${user.name}".`);
                                        }}
                                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-1"
                                        title="Re-Approve access"
                                      >
                                        <Check className="w-3 h-3 text-emerald-700" />
                                        <span>Re-Approve</span>
                                      </button>
                                    )}

                                    {/* Delete Account */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm(`Permanently delete account for "${user.name}" (${user.email})?`)) {
                                          onDeleteUserAccount && onDeleteUserAccount(user.id);
                                          alert(`Account for "${user.name}" deleted.`);
                                        }
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                      title="Permanently Delete Account"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
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
                Restore Default Job Postings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
