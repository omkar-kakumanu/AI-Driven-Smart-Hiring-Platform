import React, { useState } from 'react';
import type { Candidate, Job, ScheduledInterview } from '../types';
import { UserAvatar } from './UserAvatar';

interface InterviewSchedulingModuleProps {
  candidates: Candidate[];
  jobs: Job[];
  scheduledInterviews: ScheduledInterview[];
  onScheduleInterview: (interview: Omit<ScheduledInterview, 'id' | 'createdAt'>) => void;
  onUpdateInterviewStatus: (id: string, status: ScheduledInterview['status']) => void;
  onCancelInterview: (id: string) => void;
  isCandidateUser?: boolean;
  currentCandidateEmail?: string;
}

export const InterviewSchedulingModule: React.FC<InterviewSchedulingModuleProps> = ({
  candidates,
  jobs,
  scheduledInterviews = [],
  onScheduleInterview,
  onUpdateInterviewStatus,
  onCancelInterview,
  isCandidateUser = false,
  currentCandidateEmail
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal Form State
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(candidates[0]?.id || '');
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [interviewType, setInterviewType] = useState<ScheduledInterview['interviewType']>('AI_SCREENING');
  const [scheduledDate, setScheduledDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState<string>('14:30');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [interviewerName, setInterviewerName] = useState<string>('Sarah Jenkins (Talent Partner)');
  const [meetingLink, setMeetingLink] = useState<string>('https://meet.copilot.ai/room/' + Math.random().toString(36).substring(2, 9));
  const [notes, setNotes] = useState<string>('');

  // Filter interviews if candidate user
  const visibleInterviews = scheduledInterviews.filter(item => {
    if (isCandidateUser && currentCandidateEmail) {
      if (item.candidateEmail.toLowerCase() !== currentCandidateEmail.toLowerCase()) {
        return false;
      }
    }
    if (filterType !== 'ALL' && item.interviewType !== filterType) return false;
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.candidateName.toLowerCase().includes(q) ||
        item.candidateRole.toLowerCase().includes(q) ||
        item.jobTitle.toLowerCase().includes(q) ||
        item.interviewerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenScheduleModal = (candidateId?: string) => {
    if (candidateId) {
      setSelectedCandidateId(candidateId);
      const cand = candidates.find(c => c.id === candidateId);
      if (cand) {
        setMeetingLink(`https://meet.copilot.ai/room/${cand.fullName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`);
      }
    }
    setShowScheduleModal(true);
  };

  const handleCandidateChange = (candId: string) => {
    setSelectedCandidateId(candId);
    const cand = candidates.find(c => c.id === candId);
    if (cand) {
      setMeetingLink(`https://meet.copilot.ai/room/${cand.fullName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`);
    }
  };

  const handleInterviewTypeChange = (type: ScheduledInterview['interviewType']) => {
    setInterviewType(type);
    if (type === 'AI_SCREENING') {
      setInterviewerName('AI Voice Screening Agent (Copilot)');
      setDurationMinutes(30);
    } else if (type === 'TECHNICAL') {
      setInterviewerName('Alex Vance (Principal Architect)');
      setDurationMinutes(60);
    } else if (type === 'SYSTEM_DESIGN') {
      setInterviewerName('Staff Systems Engineer');
      setDurationMinutes(60);
    } else if (type === 'BEHAVIORAL') {
      setInterviewerName('Sarah Jenkins (Talent Partner)');
      setDurationMinutes(45);
    } else {
      setInterviewerName('J Manju Raghvin (Hiring Director)');
      setDurationMinutes(45);
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidates.find(c => c.id === selectedCandidateId) || candidates[0];
    const job = jobs.find(j => j.id === selectedJobId) || jobs[0];

    if (!cand) {
      alert('Please select a candidate.');
      return;
    }

    onScheduleInterview({
      candidateId: cand.id,
      candidateName: cand.fullName,
      candidateEmail: cand.email,
      candidateRole: cand.currentRole,
      jobId: job ? job.id : 'job-general',
      jobTitle: job ? job.title : 'Engineering Position',
      interviewType,
      scheduledDate,
      scheduledTime,
      durationMinutes: Number(durationMinutes),
      interviewerName,
      meetingLink,
      status: 'CONFIRMED',
      notes
    });

    setShowScheduleModal(false);
    setNotes('');
    alert(`Interview scheduled successfully with ${cand.fullName}!`);
  };

  // Metrics
  const totalCount = visibleInterviews.length;
  const confirmedCount = visibleInterviews.filter(i => i.status === 'CONFIRMED').length;
  const completedCount = visibleInterviews.filter(i => i.status === 'COMPLETED').length;
  const aiScreeningsCount = visibleInterviews.filter(i => i.interviewType === 'AI_SCREENING').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full font-bold text-xs border border-indigo-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Interview Operations & Video Scheduling
          </div>
          <h3 className="text-2xl font-black tracking-tight">Interview Scheduling & Slot Management</h3>
          <p className="text-slate-400 text-xs font-medium">
            Seamlessly coordinate AI Voice Screenings, Technical Deep-Dives, and Hiring Manager interviews
          </p>
        </div>

        {!isCandidateUser && (
          <button
            onClick={() => handleOpenScheduleModal()}
            className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <span className="text-sm">📅</span>
            <span>Schedule New Interview</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Total Scheduled</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-400 font-semibold">Sessions</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-emerald-600 text-[11px] font-bold uppercase tracking-wider">Confirmed</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">{confirmedCount}</span>
            <span className="text-xs text-emerald-700/60 font-semibold">Ready</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-purple-600 text-[11px] font-bold uppercase tracking-wider">AI Screenings</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-purple-600">{aiScreeningsCount}</span>
            <span className="text-xs text-purple-700/60 font-semibold">Automated</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-blue-600 text-[11px] font-bold uppercase tracking-wider">Completed</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-600">{completedCount}</span>
            <span className="text-xs text-blue-700/60 font-semibold">Archived</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search candidate, role, or interviewer..."
            className="w-full md:w-72 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Formats</option>
            <option value="AI_SCREENING">AI Screening</option>
            <option value="TECHNICAL">Technical Round</option>
            <option value="SYSTEM_DESIGN">System Design</option>
            <option value="BEHAVIORAL">Behavioral</option>
            <option value="HIRING_MANAGER">Hiring Manager</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Scheduled Interviews List */}
      <div className="space-y-4">
        {visibleInterviews.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-xl">
              📅
            </div>
            <h4 className="text-base font-extrabold text-slate-800">No scheduled interviews found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no interviews matching your current filter criteria. Use the schedule button above to invite candidates.
            </p>
          </div>
        ) : (
          visibleInterviews.map(interview => {
            const formatBadge = {
              AI_SCREENING: 'bg-purple-100 text-purple-800 border-purple-200',
              TECHNICAL: 'bg-blue-100 text-blue-800 border-blue-200',
              SYSTEM_DESIGN: 'bg-indigo-100 text-indigo-800 border-indigo-200',
              BEHAVIORAL: 'bg-amber-100 text-amber-800 border-amber-200',
              HIRING_MANAGER: 'bg-emerald-100 text-emerald-800 border-emerald-200'
            }[interview.interviewType];

            const statusBadge = {
              CONFIRMED: 'bg-emerald-500 text-white',
              SCHEDULED: 'bg-blue-500 text-white',
              COMPLETED: 'bg-slate-700 text-white',
              CANCELLED: 'bg-rose-500 text-white'
            }[interview.status];

            return (
              <div
                key={interview.id}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-3xl p-5 shadow-xs transition-all space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Candidate Details */}
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      name={interview.candidateName}
                      avatar={candidates.find(c => c.email.toLowerCase() === interview.candidateEmail.toLowerCase())?.avatar}
                      size="lg"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-900 text-base">{interview.candidateName}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border ${formatBadge}`}>
                          {interview.interviewType.replace(/_/g, ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${statusBadge}`}>
                          {interview.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Role Applied: <span className="font-bold text-slate-700">{interview.jobTitle}</span> • Candidate: {interview.candidateRole}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {interview.candidateEmail} • Interviewer: <span className="font-semibold text-slate-600">{interview.interviewerName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Date, Time & Launch Link */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-center min-w-[140px]">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Date & Time</p>
                      <p className="text-xs font-black text-slate-800">{interview.scheduledDate}</p>
                      <p className="text-[11px] font-bold text-indigo-600">{interview.scheduledTime} ({interview.durationMinutes}m)</p>
                    </div>

                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <span>📹 Join Call</span>
                      <span className="text-[10px]">↗</span>
                    </a>

                    {!isCandidateUser && (
                      <div className="flex items-center gap-1.5">
                        {interview.status !== 'COMPLETED' && (
                          <button
                            onClick={() => onUpdateInterviewStatus(interview.id, 'COMPLETED')}
                            title="Mark as Completed"
                            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            ✓ Complete
                          </button>
                        )}

                        {interview.status !== 'CANCELLED' && (
                          <button
                            onClick={() => onCancelInterview(interview.id)}
                            title="Cancel Interview"
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            ✕ Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {interview.notes && (
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs text-slate-600">
                    <span className="font-bold text-slate-700">Interview Agenda / Focus:</span> {interview.notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black">
                  📅
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Schedule Interview Slot</h3>
                  <p className="text-xs text-slate-500 font-semibold">Assign interviewer, calendar slot, and video conference link</p>
                </div>
              </div>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              {/* Candidate Select */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Candidate <span className="text-rose-500">*</span></label>
                <select
                  value={selectedCandidateId}
                  onChange={e => handleCandidateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {candidates.map(cand => (
                    <option key={cand.id} value={cand.id}>
                      {cand.fullName} — {cand.currentRole} ({cand.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Opening Select */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Job Opening</label>
                <select
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title} — {job.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Interview Format</label>
                  <select
                    value={interviewType}
                    onChange={e => handleInterviewTypeChange(e.target.value as ScheduledInterview['interviewType'])}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AI_SCREENING">AI Voice Screening (Automated)</option>
                    <option value="TECHNICAL">Technical Architecture Round</option>
                    <option value="SYSTEM_DESIGN">System Design & Scalability</option>
                    <option value="BEHAVIORAL">Behavioral & Culture Fit</option>
                    <option value="HIRING_MANAGER">Hiring Director Executive Round</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration</label>
                  <select
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Interview Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Time (EST / Local) <span className="text-rose-500">*</span></label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Assigned Interviewer */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Interviewer / Panel</label>
                <input
                  type="text"
                  value={interviewerName}
                  onChange={e => setInterviewerName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins (Talent Acquisition Specialist)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Meeting Link with generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Video Conference URL</label>
                  <button
                    type="button"
                    onClick={() => setMeetingLink('https://meet.copilot.ai/room/' + Math.random().toString(36).substring(2, 9))}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ↻ Generate New Link
                  </button>
                </div>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={e => setMeetingLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Notes / Special Instructions */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Interview Prep Notes & Candidate Instructions</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Please prepare 10 mins system architecture walkthrough and review candidate's past GitHub repo."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  Confirm & Schedule Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
