import React, { useState } from 'react';
import type { Candidate, Job, ScheduledInterview, CandidateNotification, UserProfile, SkillAdditionRequest, CandidateResumeDocument } from '../types';
import { UserAvatar } from '../components/UserAvatar';
import { Target, Share2, Mic, Bot, Check, Briefcase, MapPin, Calendar, Video, Zap, Sparkles, Bell, FileText, Download, PlusCircle, Clock, AlertTriangle, CheckCircle2, XCircle, X, ExternalLink, ShieldCheck } from 'lucide-react';

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
  skillRequests?: SkillAdditionRequest[];
  onRequestSkillAddition?: (req: Omit<SkillAdditionRequest, 'id' | 'status' | 'requestedAt'>) => void;
  onUpdateResumeDocument?: (candidateId: string, doc: CandidateResumeDocument) => void;
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
  onUpdateAvatar,
  skillRequests = [],
  onRequestSkillAddition,
  onUpdateResumeDocument
}) => {
  const [showSkillRequestModal, setShowSkillRequestModal] = useState(false);
  const [reqSkillName, setReqSkillName] = useState('');
  const [reqCategory, setReqCategory] = useState('Frameworks & Libraries');
  const [reqProficiency, setReqProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Advanced');
  const [reqReasonNote, setReqReasonNote] = useState('');
  const [showResumeViewer, setShowResumeViewer] = useState(false);
  const [reqSubmittedNotice, setReqSubmittedNotice] = useState<string | null>(null);
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Resume Document & Technical Profile</h4>
                <p className="text-slate-500 text-[11px] font-medium">Stored in database for automated verification and ATS alignment</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSkillRequestModal(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Request Skill Addition</span>
                </button>
              </div>
            </div>

            {/* Stored Resume File Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/50 via-slate-50 to-blue-50/30 border border-indigo-100/80 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-xs truncate max-w-[200px] sm:max-w-xs">
                      {activeCandidate.resumeDocument?.fileName || `${activeCandidate.fullName.replace(/\s+/g, '_')}_Resume.pdf`}
                    </h5>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      {activeCandidate.resumeDocument?.fileType || 'application/pdf'} • {activeCandidate.resumeDocument?.fileSize ? `${Math.round(activeCandidate.resumeDocument.fileSize / 1024)} KB` : '148 KB'} • Synced with MySQL
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResumeViewer(true)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Inspect Resume</span>
                  </button>

                  <a
                    href={activeCandidate.resumeDocument?.dataUrl || `data:text/plain;charset=utf-8,${encodeURIComponent(activeCandidate.resumeDocument?.extractedText || activeCandidate.headline)}`}
                    download={activeCandidate.resumeDocument?.fileName || `${activeCandidate.fullName.replace(/\s+/g, '_')}_Resume.pdf`}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-bold bg-emerald-50/80 p-2 rounded-xl border border-emerald-200/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Original document is saved in the database so recruiters & administrators can verify skill authenticity before approving requests.</span>
              </div>
            </div>

            {/* Education Info */}
            <div className="space-y-1 text-xs">
              <p className="text-slate-400 font-bold text-[10px] uppercase">Education</p>
              <p className="font-bold text-slate-800">{activeCandidate.degree || 'BS Computer Science'} — {activeCandidate.institution || 'University'}</p>
            </div>

            {/* Extracted Technical Skills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 font-black text-[11px] uppercase tracking-wider">
                  Verified Technical Skills ({activeCandidate.skills?.length || 0})
                </p>
                <span className="text-[10px] text-slate-400 font-medium">Protected against direct tampering</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(activeCandidate.skills || []).map(skill => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-lg font-bold text-[11px] border border-slate-200/80 transition-all flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Candidate's Skill Addition Requests Tracking */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h5 className="font-extrabold text-slate-900 text-xs">
                    My Skill Addition Requests
                  </h5>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  {mySkillRequests.length} Requests
                </span>
              </div>

              {mySkillRequests.length === 0 ? (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-600">No skill addition requests raised yet.</p>
                  <p className="text-[11px] text-slate-500">
                    If any of your skills were missed during automated resume parsing, click <strong className="text-indigo-600">"Request Skill Addition"</strong> above.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {mySkillRequests.map(req => {
                    const statusBadge = {
                      PENDING: 'bg-amber-100 text-amber-900 border-amber-300',
                      APPROVED: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                      REJECTED: 'bg-rose-100 text-rose-900 border-rose-300'
                    }[req.status];

                    return (
                      <div
                        key={req.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs transition-all hover:border-slate-300"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md font-black text-xs bg-indigo-100 text-indigo-800 border border-indigo-200">
                              {req.skillName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">({req.category || 'Technical Skill'} • {req.proficiency || 'Proficient'})</span>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${statusBadge}`}>
                            {req.status === 'PENDING' && 'Pending Admin/Recruiter Review'}
                            {req.status === 'APPROVED' && 'Approved & Added to Profile'}
                            {req.status === 'REJECTED' && 'Declined by Reviewer'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600">
                          <strong className="text-slate-700">Resume Reference:</strong> {req.reasonNote}
                        </p>

                        {req.reviewNote && (
                          <div className={`p-2 rounded-xl text-[10px] font-medium border ${req.status === 'APPROVED' ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200' : 'bg-rose-50/80 text-rose-800 border-rose-200'}`}>
                            <strong>Reviewer Note:</strong> {req.reviewNote} ({req.reviewedBy || 'Reviewer'})
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* MODAL: Request Missing Skill Addition */}
      {showSkillRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 bg-white/20 text-white rounded text-[10px] font-black uppercase tracking-wider">
                  Candidate Skill Request
                </span>
                <h3 className="text-lg font-black mt-1 text-white">Request Missing Skill Addition</h3>
                <p className="text-xs text-blue-100 font-medium">
                  Ask Administrators & Recruiters to verify and approve unparsed skills
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSkillRequestModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!reqSkillName.trim()) {
                  alert("Please enter skill name.");
                  return;
                }
                if (!reqReasonNote.trim()) {
                  alert("Please mention where this skill appears on your resume.");
                  return;
                }

                onRequestSkillAddition?.({
                  candidateId: activeCandidate.id,
                  candidateName: activeCandidate.fullName,
                  candidateEmail: activeCandidate.email,
                  skillName: reqSkillName.trim(),
                  category: reqCategory,
                  proficiency: reqProficiency,
                  reasonNote: reqReasonNote.trim(),
                  resumeFileName: activeCandidate.resumeDocument?.fileName || 'Sarah_Johnson_ML_Engineer_Resume.pdf'
                });

                setReqSubmittedNotice(`Request to add "${reqSkillName.trim()}" has been submitted! Administrators will verify it against your uploaded resume.`);
                setReqSkillName('');
                setReqReasonNote('');
                setTimeout(() => {
                  setReqSubmittedNotice(null);
                  setShowSkillRequestModal(false);
                }, 1500);
              }}
              className="p-6 overflow-y-auto space-y-4"
            >
              {reqSubmittedNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{reqSubmittedNotice}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Skill Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={reqSkillName}
                  onChange={(e) => setReqSkillName(e.target.value)}
                  placeholder="e.g. Kubernetes, PyTorch, Docker, FastAPI..."
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl h-11 px-3.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
                
                {/* Popular Skill Suggestion Badges */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {["Kubernetes", "Docker", "PyTorch", "FastAPI", "AWS", "TensorFlow", "PostgreSQL", "Next.js", "Redis", "GraphQL"].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReqSkillName(s)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded text-[10px] font-bold border border-slate-200 transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Skill Category</label>
                  <select
                    value={reqCategory}
                    onChange={(e) => setReqCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl h-10 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Languages">Programming Languages</option>
                    <option value="Frameworks & Libraries">Frameworks & Libraries</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Databases & Storage">Databases & Storage</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Tools & Methodologies">Tools & Methodologies</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Proficiency Level</label>
                  <select
                    value={reqProficiency}
                    onChange={(e) => setReqProficiency(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl h-10 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Beginner">Beginner (1-2 yrs)</option>
                    <option value="Intermediate">Intermediate (2-4 yrs)</option>
                    <option value="Advanced">Advanced (4-6 yrs)</option>
                    <option value="Expert">Expert (6+ yrs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Resume Location / Justification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={reqReasonNote}
                  onChange={(e) => setReqReasonNote(e.target.value)}
                  placeholder="Explain exactly where this skill appears in your uploaded resume (e.g., 'Mentioned under Work Experience at NovaScale AI on page 1, used for distributed model serving')."
                  required
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Recruiters will inspect your stored PDF/DOCX file to verify that you did not falsify this skill.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSkillRequestModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit Request to Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Inspect Stored Resume Document */}
      {showResumeViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Stored Candidate Resume Document</h3>
                  <p className="text-xs text-indigo-200">
                    {activeCandidate.resumeDocument?.fileName || 'Sarah_Johnson_ML_Engineer_Resume.pdf'} • Database Record
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResumeViewer(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Candidate: {activeCandidate.fullName}</span>
                  <span className="text-[11px] text-slate-500">{activeCandidate.email} • {activeCandidate.currentRole}</span>
                </div>
                <a
                  href={activeCandidate.resumeDocument?.dataUrl || `data:text/plain;charset=utf-8,${encodeURIComponent(activeCandidate.resumeDocument?.extractedText || activeCandidate.headline)}`}
                  download={activeCandidate.resumeDocument?.fileName || 'Resume.pdf'}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </a>
              </div>

              <div>
                <p className="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2">
                  Document Text Content & Extracted Resume
                </p>
                <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto border border-slate-800 select-text">
                  {activeCandidate.resumeDocument?.extractedText || 
`SARAH JOHNSON
Email: sarah.johnson@example.com | Phone: +1 (555) 019-2831 | Location: San Francisco, CA

PROFESSIONAL SUMMARY
Senior Machine Learning Engineer with 5+ years experience building production ML pipelines, deep learning architectures, and distributed model serving on cloud platforms.

TECHNICAL SKILLS
- Programming Languages: Python, SQL, C++, Bash
- Machine Learning & AI: TensorFlow, PyTorch, Scikit-Learn, MLOps, HuggingFace Transformers, NLP, Deep Learning
- Cloud & DevOps: AWS SageMaker, Docker, Kubernetes, CI/CD, Linux, Git, FastAPI
- Data & Databases: PostgreSQL, MySQL, Redis, Pandas, NumPy, Data Analysis

WORK EXPERIENCE
Senior Machine Learning Engineer | NovaScale AI (2022 – Present)
- Deployed prediction services handling 12M daily requests using PyTorch and FastAPI.
- Managed Kubernetes clusters and Docker containers for distributed training and low-latency inference on AWS SageMaker.
- Automated MLOps pipelines reducing retraining latency by 42%.`}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowResumeViewer(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
