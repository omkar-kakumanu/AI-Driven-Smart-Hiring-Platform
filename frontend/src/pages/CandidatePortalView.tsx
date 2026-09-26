import React, { useState } from 'react';
import type { Candidate, Job, ScheduledInterview, CandidateNotification } from '../types';
import { UserAvatar } from '../components/UserAvatar';

interface CandidatePortalViewProps {
  candidates: Candidate[];
  jobs: Job[];
  currentCandidateEmail: string;
  scheduledInterviews: ScheduledInterview[];
  notifications: CandidateNotification[];
  onMarkNotificationRead: (id: string) => void;
  onNavigateToVoiceScreening?: () => void;
  onNavigateToInterviewPractice?: () => void;
  onNavigateToResume?: () => void;
}

export const CandidatePortalView: React.FC<CandidatePortalViewProps> = ({
  candidates = [],
  jobs = [],
  currentCandidateEmail,
  scheduledInterviews = [],
  notifications = [],
  onMarkNotificationRead,
  onNavigateToVoiceScreening,
  onNavigateToInterviewPractice,
  onNavigateToResume
}) => {
  // Find current candidate or fallback to first candidate
  const activeCandidate = candidates.find(
    c => c.email.toLowerCase() === currentCandidateEmail.toLowerCase()
  ) || candidates.find(c => c.email.toLowerCase().includes('candidate')) || candidates[0] || {
    id: 'cand-1',
    fullName: 'Sarah Johnson',
    email: 'candidate@copilot.com',
    currentRole: 'Senior Full Stack Engineer',
    totalExperienceYears: 6,
    headline: 'Senior Full Stack Engineer with 6 years experience in React, Node.js, TypeScript',
    skills: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    degree: 'BS in Computer Science',
    institution: 'UC Berkeley',
    status: 'Interview in progress',
    matchScore: 94
  };

  const targetJob = jobs.find(j => j.title.toLowerCase().includes(activeCandidate.currentRole.toLowerCase())) || jobs[0] || {
    id: 'job-1',
    title: 'Senior Full Stack Engineer (React/Node)',
    department: 'Engineering',
    location: 'San Francisco, CA (Hybrid)',
    minSalary: 140000,
    maxSalary: 190000
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
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Top Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <UserAvatar
              name={activeCandidate.fullName}
              avatar={activeCandidate.avatar}
              size="xl"
              className="border-2 border-white/20 shadow-xl"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Candidate Portal
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  ● Status: {activeCandidate.status || 'Applied'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{activeCandidate.fullName}</h2>
              <p className="text-indigo-200 text-xs font-semibold">
                Target Role: <span className="text-white font-bold">{targetJob.title}</span> ({targetJob.department}) • {activeCandidate.location || 'Remote'}
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
              {onNavigateToVoiceScreening && (
                <button
                  onClick={onNavigateToVoiceScreening}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>🎙️ Voice Screening Assessment</span>
                  <span className="text-xs">→</span>
                </button>
              )}
              {onNavigateToInterviewPractice && (
                <button
                  onClick={onNavigateToInterviewPractice}
                  className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>🤖 Practice AI Interview</span>
                  <span className="text-xs">→</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5-Stage ATS Pipeline Stepper */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Application Pipeline Tracker</h3>
            <p className="text-xs font-medium text-slate-500">Live recruitment progress and stage transitions</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl w-fit">
            Current Stage: {PIPELINE_STAGES[currentStageIndex]?.title}
          </span>
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
                      {isPassed ? '✓' : idx + 1}
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
                    {isCurrent && <span className="text-blue-600 uppercase tracking-wider">● In Progress</span>}
                    {isPassed && <span className="text-emerald-600 uppercase tracking-wider">✓ Completed</span>}
                    {isUpcoming && <span className="text-slate-400 uppercase tracking-wider">Pending</span>}
                  </div>
                </div>
              );
            })}
          </div>
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
                  📅
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
                <span className="text-2xl">🗓️</span>
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

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span className="text-[11px] text-slate-400 font-medium">Platform: Secure Video Conference</span>
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <span>📹 Join Meeting Room</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* AI Assessment & Performance Evaluation */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                ⚡
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
                <span>💡</span> AI Interviewer Feedback Summary
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
                  🔔
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
                            Mark Read ✓
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
              {onNavigateToResume && (
                <button
                  onClick={onNavigateToResume}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Edit Resume →
                </button>
              )}
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
