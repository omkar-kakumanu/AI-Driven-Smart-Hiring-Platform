import React, { useState } from 'react';
import type { Candidate, Job, ScheduledInterview, CandidateNotification, UserProfile } from '../types';
import { UserAvatar } from '../components/UserAvatar';
import { Target, Share2, Mic, Bot, Check, Briefcase, MapPin, Calendar, Video, Zap, Sparkles, Bell, ArrowRight } from 'lucide-react';

interface CandidatePortalViewProps {
  candidates: Candidate[];
  userProfile?: UserProfile;
  jobs: Job[];
  currentCandidateEmail: string;
  scheduledInterviews: ScheduledInterview[];
  notifications: CandidateNotification[];
  onMarkNotificationRead: (id: string) => void;
  onNavigateToVoiceScreening?: () => void;
  onNavigateToInterviewPractice?: () => void;
  onNavigateToResume?: () => void;
  onNavigateToMatching?: () => void;
  onNavigateToAts?: () => void;
  onCancelInterview?: (id: string) => void;
  onUpdateAvatar?: (avatar: string) => void;
}

const formatIndianLocation = (loc?: string) => {
  if (!loc) return 'Bengaluru, Karnataka (Hybrid)';
  if (loc.includes('San Francisco') || loc.includes('CA')) return 'Bengaluru, Karnataka (Hybrid)';
  if (loc.includes('Austin') || loc.includes('TX')) return 'Hyderabad, Telangana (Hybrid / HITEC City)';
  if (loc.includes('Seattle') || loc.includes('WA')) return 'Pune, Maharashtra (Hybrid / Hinjawadi)';
  if (loc.includes('New York') || loc.includes('NY')) return 'Gurugram, Delhi NCR (Hybrid / Cyber City)';
  if (loc.includes('Chicago') || loc.includes('IL')) return 'Chennai, Tamil Nadu (Hybrid / OMR)';
  if (loc.includes('Denver') || loc.includes('CO')) return 'Noida, Delhi NCR (Remote)';
  if (loc.includes('Los Angeles')) return 'Mumbai, Maharashtra (Hybrid / BKC)';
  if (loc.includes('Washington')) return 'Bengaluru, Karnataka (Whitefield)';
  return loc;
};

const formatIndianSalary = (min?: number, max?: number) => {
  if (!min || !max) return '₹16 - ₹26 LPA';
  const getLpa = (val: number) => {
    if (val >= 1000000) return Math.round(val / 100000);
    if (val >= 10000) return Math.round(val / 10000);
    return val;
  };
  const minLpa = getLpa(min);
  const maxLpa = getLpa(max);
  const minInr = (minLpa * 100000).toLocaleString('en-IN');
  const maxInr = (maxLpa * 100000).toLocaleString('en-IN');
  return `₹${minInr} - ₹${maxInr} (${minLpa} - ${maxLpa} LPA)`;
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

export const CandidatePortalView: React.FC<CandidatePortalViewProps> = ({
  candidates = [],
  userProfile,
  jobs = [],
  currentCandidateEmail,
  scheduledInterviews = [],
  notifications = [],
  onMarkNotificationRead,
  onNavigateToVoiceScreening,
  onNavigateToInterviewPractice,
  onNavigateToResume,
  onNavigateToMatching,
  onNavigateToAts,
  onCancelInterview,
  onUpdateAvatar
}) => {
  const emailLower = (currentCandidateEmail || userProfile?.email || 'candidate@copilot.com').toLowerCase();
  const isCandidateEmail = emailLower === 'candidate@copilot.com' || emailLower === 'sarah.johnson@example.com';

  const rawPersistedName = userProfile?.name ||
    localStorage.getItem(`rc_name_${emailLower}`) ||
    (isCandidateEmail ? (localStorage.getItem('rc_name_candidate@copilot.com') || localStorage.getItem('rc_name_sarah.johnson@example.com') || localStorage.getItem('rc_name_cand-1')) : null);

  const isRogueName = rawPersistedName && (
    rawPersistedName.toLowerCase().includes('abhishek ai ml resume') ||
    rawPersistedName.toLowerCase().includes('resume 1')
  );

  const candidatePersistedName = isRogueName 
    ? (isCandidateEmail ? 'Sarah Johnson' : (userProfile?.name || 'Candidate')) 
    : rawPersistedName;

  // Sync profile photo with System Settings: prioritize userProfile.avatar, then aliased localStorage keys
  const resolvedAvatar = (userProfile && userProfile.avatar !== undefined)
    ? userProfile.avatar
    : (localStorage.getItem(`rc_avatar_${emailLower}`) ||
       (isCandidateEmail ? (localStorage.getItem('rc_avatar_candidate@copilot.com') || localStorage.getItem('rc_avatar_sarah.johnson@example.com') || localStorage.getItem('rc_avatar_cand-1')) : null) ||
       undefined);

  // Find current candidate or construct an isolated candidate profile for non-demo users
  const existingCandidate = candidates.find(
    c => c.email.toLowerCase() === emailLower
  );

  const demoCandidate = isCandidateEmail 
    ? (candidates.find(c => c.email.toLowerCase() === 'sarah.johnson@example.com' || c.email.toLowerCase() === 'candidate@copilot.com') || candidates.find(c => c.id === 'cand-1'))
    : null;

  const defaultIsolatedCandidate: Candidate = {
    id: `cand-${emailLower.replace(/[^a-z0-9]/g, '-')}`,
    fullName: (candidatePersistedName && candidatePersistedName.trim()) ? candidatePersistedName.trim() : (userProfile?.name || emailLower.split('@')[0]),
    email: currentCandidateEmail || emailLower,
    phone: localStorage.getItem(`rc_candidate_prefs_${emailLower}_phone`) || '+91 98765 43210',
    location: localStorage.getItem(`rc_candidate_prefs_${emailLower}_city`) || 'Bengaluru, Karnataka (Hybrid)',
    currentRole: userProfile?.role || 'Full Stack Engineer',
    totalExperienceYears: 3,
    headline: 'Candidate Profile & Engineering Portfolio',
    skills: ['JavaScript', 'React', 'Problem Solving', 'Git'],
    degree: 'B.Tech / Bachelor of Engineering',
    institution: 'University / Institute of Technology',
    status: 'Applied',
    matchScore: 88,
    avatar: resolvedAvatar,
    interviewResponses: []
  };

  const rawCandidate = existingCandidate || demoCandidate || defaultIsolatedCandidate;

  const candidateCleanFullName = (() => {
    const cleanRaw = (name?: string) => {
      if (!name) return '';
      const t = name.trim();
      if (t.toLowerCase().includes('abhishek ai ml resume') || t.toLowerCase().includes('abhishek resume')) {
        return 'Abhishek';
      }
      return t;
    };

    if (candidatePersistedName && candidatePersistedName.trim()) {
      return cleanRaw(candidatePersistedName);
    }
    if (userProfile?.name && userProfile.name.trim()) {
      return cleanRaw(userProfile.name);
    }
    if (rawCandidate?.fullName) {
      return cleanRaw(rawCandidate.fullName);
    }
    if (isCandidateEmail) return 'Sarah Johnson';
    return 'Candidate';
  })();

  const activeCandidate = {
    ...rawCandidate,
    fullName: candidateCleanFullName,
    avatar: resolvedAvatar !== undefined 
      ? resolvedAvatar 
      : (isCandidateEmail ? rawCandidate.avatar : undefined)
  };

  const targetJob = jobs.find(j => j.title.toLowerCase().includes(activeCandidate.currentRole.toLowerCase())) || jobs[0] || {
    id: 'job-1',
    title: 'Senior Full Stack Engineer (React/Node)',
    department: 'Product Engineering',
    location: 'Bengaluru, Karnataka (Hybrid)',
    minSalary: 1600000,
    maxSalary: 2600000
  };

  // Filter scheduled interviews for this candidate
  const myInterviews = scheduledInterviews.filter(
    i => i.candidateEmail.toLowerCase() === activeCandidate.email.toLowerCase() ||
         i.candidateId === activeCandidate.id
  );

  // Filter notifications for this candidate
  const myNotifications = notifications.filter(
    n => n.candidateEmail.toLowerCase() === activeCandidate.email.toLowerCase()
  );

  const [notificationTab, setNotificationTab] = useState<'ALL' | 'UNREAD'>('ALL');

  const visibleNotifications = myNotifications.filter(n => {
    if (notificationTab === 'UNREAD') return !n.isRead;
    return true;
  });

  // Calculate ATS Pipeline Stepper Status
  const currentStatus = (activeCandidate.status || 'Applied').toLowerCase();
  
  const getStageIndex = (status: string) => {
    if (status.includes('hired')) return 4;
    if (status.includes('offer')) return 3;
    if (status.includes('interview')) return 2;
    if (status.includes('screened') || status.includes('shortlisted')) return 1;
    return 0; // applied
  };

  const currentStageIndex = getStageIndex(currentStatus);

  const PIPELINE_STAGES = [
    { title: '1. Applied', desc: 'Resume submitted & parsed', key: 'applied' },
    { title: '2. Screened', desc: 'Skills & match benchmarked', key: 'screened' },
    { title: '3. Interviewing', desc: 'AI screening & tech round', key: 'interview' },
    { title: '4. Offer', desc: 'Executive offer review', key: 'offer' },
    { title: '5. Hired', desc: 'Welcome to the team!', key: 'hired' }
  ];

  // Latest AI responses if any
  const latestResponses = activeCandidate.interviewResponses || [];
  const avgClarity = latestResponses.length > 0 
    ? Math.round(latestResponses.reduce((acc, r) => acc + (r.score?.clarity || 88), 0) / latestResponses.length)
    : 92;
  const avgRelevance = latestResponses.length > 0 
    ? Math.round(latestResponses.reduce((acc, r) => acc + (r.score?.relevance || 86), 0) / latestResponses.length)
    : 89;

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-8 font-sans">
      
      {/* Top Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-indigo-700/50">
        <div className="relative z-[1] flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <UserAvatar
                name={activeCandidate.fullName}
                avatar={activeCandidate.avatar}
                size="xl"
                className="border-2 border-white/20 shadow-xl"
              />
              {onUpdateAvatar && (
                <label
                  className="absolute -bottom-1 -right-1 bg-white hover:bg-slate-100 text-indigo-700 rounded-full p-1.5 border border-indigo-200 shadow-md cursor-pointer opacity-90 group-hover:opacity-100 transition-all"
                  title="Upload / Change profile photo"
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        compressImage(file, (dataUrl) => {
                          if (dataUrl) onUpdateAvatar(dataUrl);
                        });
                      }
                    }}
                  />
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </label>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Candidate Portal
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Status: {activeCandidate.status || 'Applied'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{activeCandidate.fullName}</h2>
              <p className="text-indigo-200 text-xs font-semibold">
                Target Role: <span className="text-white font-bold">{targetJob.title}</span> ({targetJob.department}) • {formatIndianLocation(activeCandidate.location || targetJob.location)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/15 text-center min-w-[120px]">
              <p className="text-[10px] uppercase font-bold text-indigo-200">AI Match Score</p>
              <p className="text-3xl font-black text-amber-300">{activeCandidate.matchScore || 94}%</p>
              <p className="text-[10px] text-emerald-300 font-bold">Strong Match</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {onNavigateToMatching && (
                  <button
                    onClick={onNavigateToMatching}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Skill Gap Analysis</span>
                    <span className="text-xs">→</span>
                  </button>
                )}
                {onNavigateToAts && (
                  <button
                    onClick={onNavigateToAts}
                    className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5" /> ATS Status</span>
                    <span className="text-xs">→</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {onNavigateToVoiceScreening && (
                  <button
                    onClick={onNavigateToVoiceScreening}
                    className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5" /> Voice Screening</span>
                    <span className="text-xs">→</span>
                  </button>
                )}
                {onNavigateToInterviewPractice && (
                  <button
                    onClick={onNavigateToInterviewPractice}
                    className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" /> Practice Interview</span>
                    <span className="text-xs">→</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Stage ATS Pipeline Stepper */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Application Pipeline Tracker</h3>
            <p className="text-xs font-medium text-slate-500">Live recruitment progress and stage transitions</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl w-fit">
              Current Stage: {PIPELINE_STAGES[currentStageIndex]?.title}
            </span>
            {onNavigateToAts && (
              <button
                onClick={onNavigateToAts}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Full ATS Sync Hub</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>

        {/* Stepper Timeline */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {PIPELINE_STAGES.map((stage, idx) => {
              const isPassed = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isUpcoming = idx > currentStageIndex;

              return (
                <div
                  key={stage.key}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-blue-50/70 border-blue-500 shadow-md shadow-blue-500/10'
                      : isPassed
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-slate-50/50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                        isCurrent
                          ? 'bg-blue-600 text-white animate-pulse'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-black ${
                        isCurrent ? 'text-blue-900' : isPassed ? 'text-emerald-900' : 'text-slate-600'
                      }`}
                    >
                      {stage.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">{stage.desc}</p>
                  <div className="mt-2 text-[10px] font-bold">
                    {isCurrent && <span className="text-blue-600 uppercase tracking-wider">In Progress</span>}
                    {isPassed && <span className="text-emerald-600 uppercase tracking-wider">Completed</span>}
                    {isUpcoming && <span className="text-slate-400 uppercase tracking-wider">Pending</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Job Openings & Instant Fit Score */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-600" /> Active Job Openings & Instant Fit Match</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800">
                {(jobs.length > 0 ? jobs : [targetJob]).length} Roles Available
              </span>
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Benchmark your skills and experience against active company openings
            </p>
          </div>
          {onNavigateToMatching && (
            <button
              onClick={onNavigateToMatching}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Detailed Skill Gap Analysis</span>
              <span>→</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(jobs.length > 0 ? jobs : [targetJob]).map(job => {
            const candSkills = (activeCandidate.skills || []).map(s => s.toLowerCase());
            const reqSkills = (job.requiredSkills || []).map(s => s.toLowerCase());
            const matched = reqSkills.filter(s => candSkills.includes(s));
            const fitScore = reqSkills.length > 0 ? Math.round((matched.length / reqSkills.length) * 100) : 88;
            const isTarget = job.title.toLowerCase().includes(activeCandidate.currentRole.toLowerCase()) || job.id === targetJob.id;

            return (
              <div 
                key={job.id} 
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isTarget ? 'bg-blue-50/40 border-blue-300 ring-1 ring-blue-400/20' : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-700">
                      {job.department || 'Engineering'}
                    </span>
                    {isTarget && (
                      <span className="ml-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white">
                        Applied Role
                      </span>
                    )}
                    <h5 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">{job.title}</h5>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-base font-black ${fitScore >= 80 ? 'text-emerald-600' : fitScore >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                      {fitScore}%
                    </span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Fit Match</p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {formatIndianLocation(job.location)}</p>
                  <p className="flex items-center gap-1.5 text-slate-700 font-semibold"><span className="text-slate-400 font-bold">₹</span> {formatIndianSalary(job.minSalary, job.maxSalary)}</p>
                  <p className="text-[11px] font-medium pt-1">
                    Matching Skills: <strong className="text-slate-800">{matched.length}</strong> / {reqSkills.length} required
                  </p>
                </div>

                {onNavigateToMatching && (
                  <button
                    onClick={onNavigateToMatching}
                    className="w-full mt-2 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>Check Skill Gap & Alignment</span>
                    <span>→</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Left Column (Interviews & AI Evaluation) | Right Column (Notifications & Profile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Scheduled Interviews & AI Evaluation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Scheduled Interviews Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">My Scheduled Interviews</h4>
                  <p className="text-slate-500 text-xs font-medium">Confirmed video calls and AI screening sessions</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl">
                {myInterviews.length} Scheduled
              </span>
            </div>

            {myInterviews.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No interviews scheduled yet.</p>
                <p className="text-[11px] text-slate-500">
                  When a recruiter coordinates your interview session, it will appear here with a direct video call link.
                </p>
              </div>
            ) : (
              myInterviews.map(interview => (
                <div
                  key={interview.id}
                  className="p-5 bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200 hover:border-indigo-300 rounded-2xl space-y-3 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {interview.interviewType.replace(/_/g, ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white">
                          {interview.status}
                        </span>
                      </div>
                      <h5 className="font-black text-slate-900 text-sm mt-1">{interview.jobTitle}</h5>
                      <p className="text-xs text-slate-500 font-medium">Interviewer: <span className="font-bold text-slate-700">{interview.interviewerName}</span></p>
                    </div>

                    <div className="text-right sm:text-right">
                      <p className="text-xs font-black text-slate-900">{interview.scheduledDate}</p>
                      <p className="text-xs font-bold text-indigo-600">{interview.scheduledTime} ({interview.durationMinutes} mins)</p>
                    </div>
                  </div>

                  {interview.notes && (
                    <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600">
                      <span className="font-bold text-slate-700">Instructions:</span> {interview.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 flex-wrap gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">Platform: Secure Video Conference</span>
                    <div className="flex items-center gap-2">
                      {interview.status !== 'CANCELLED' && onCancelInterview && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to cancel your scheduled interview?")) {
                              onCancelInterview(interview.id);
                            }
                          }}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
                      >
                        <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Join Meeting Room</span>
                        <span className="text-[10px]">↗</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* AI Assessment & Performance Evaluation */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">AI Evaluation & Performance Scores</h4>
                <p className="text-slate-500 text-xs font-medium">Real-time NLP assessments from voice screenings & technical simulations</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Communication Clarity</p>
                <p className="text-2xl font-black text-purple-700 mt-1">{avgClarity}%</p>
                <p className="text-[10px] font-semibold text-emerald-600">Very High</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Technical Relevance</p>
                <p className="text-2xl font-black text-blue-700 mt-1">{avgRelevance}%</p>
                <p className="text-[10px] font-semibold text-emerald-600">Strong Depth</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Overall Hiring Readiness</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{Math.round((avgClarity + avgRelevance) / 2)}%</p>
                <p className="text-[10px] font-semibold text-emerald-700">Recommended</p>
              </div>
            </div>

            <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4 text-xs space-y-2">
              <p className="font-black text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" /> AI Interviewer Feedback Summary
              </p>
              <p className="text-purple-800 font-medium leading-relaxed">
                Candidate presents structured reasoning and articulates system architecture tradeoffs clearly. 
                Strong capability in asynchronous state management and cloud integration.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Notifications Center & Profile Snapshot (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Real-Time Notifications Center */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Notification Center</h4>
                  <p className="text-slate-500 text-xs font-medium">Application updates & interview alerts</p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
                <button
                  onClick={() => setNotificationTab('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${notificationTab === 'ALL' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setNotificationTab('UNREAD')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${notificationTab === 'UNREAD' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-500'}`}
                >
                  Unread ({myNotifications.filter(n => !n.isRead).length})
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {visibleNotifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  No notifications in this view.
                </div>
              ) : (
                visibleNotifications.map(notif => {
                  const typeBadge = {
                    INTERVIEW_INVITE: 'bg-indigo-100 text-indigo-800',
                    STATUS_UPDATE: 'bg-emerald-100 text-emerald-800',
                    SCREENING_RESULT: 'bg-purple-100 text-purple-800',
                    GENERAL: 'bg-slate-100 text-slate-800'
                  }[notif.type] || 'bg-blue-100 text-blue-800';

                  return (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-2xl border transition-all space-y-1.5 ${
                        notif.isRead
                          ? 'bg-slate-50/60 border-slate-200'
                          : 'bg-blue-50/40 border-blue-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${typeBadge}`}>
                            {notif.type.replace(/_/g, ' ')}
                          </span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.timestamp).toLocaleDateString()}
                        </span>
                      </div>

                      <h5 className="font-bold text-slate-900 text-xs">{notif.title}</h5>
                      <p className="text-[11px] text-slate-600 leading-snug">{notif.message}</p>

                      <div className="flex items-center justify-between pt-1">
                        {notif.actionUrl ? (
                          <a
                            href={notif.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-black text-blue-600 hover:text-blue-800"
                          >
                            Open Link →
                          </a>
                        ) : <span></span>}

                        {!notif.isRead && (
                          <button
                            onClick={() => onMarkNotificationRead(notif.id)}
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-700"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Profile & Skills Overview */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm">Resume & Technical Profile</h4>
              <div className="flex items-center gap-2">
                {onNavigateToMatching && (
                  <button
                    onClick={onNavigateToMatching}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Skill Alignment →
                  </button>
                )}
                {onNavigateToResume && (
                  <button
                    onClick={onNavigateToResume}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Edit Resume →
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-bold text-[10px] uppercase">Education</p>
                <p className="font-bold text-slate-800">{activeCandidate.degree || 'BS Computer Science'} — {activeCandidate.institution || 'University'}</p>
              </div>

              <div>
                <p className="text-slate-400 font-bold text-[10px] uppercase mb-1.5">Extracted Technical Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {(activeCandidate.skills || []).map(skill => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-bold text-[11px] border border-slate-200/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
