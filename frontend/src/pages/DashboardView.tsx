import React from 'react';
import type { Candidate, Job } from '../types';
import { UserAvatar } from '../components/UserAvatar';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  candidates?: Candidate[];
  jobs?: Job[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onNavigate,
  candidates = [],
  jobs = []
}) => {
  const stats = [
    { title: 'Total Candidates', value: candidates.length.toString(), change: '+12%', note: 'vs last month' },
    { title: 'Active Openings', value: jobs.length.toString(), change: '+3', note: 'new roles' },
    { title: 'Screening Pass Rate', value: '78%', change: '+5%', note: 'quality score' },
    { title: 'Avg Time to Screen', value: '1.2 days', change: '-40%', note: 'faster cycle' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 font-bold text-xs">
            Recruitment Operations Overview
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Automated Candidate Screening & Profiling</h2>
          <p className="text-slate-400 text-sm">
            Process candidate resumes, analyze skill alignment against open job descriptions, and evaluate candidates.
          </p>
        </div>

        <button 
          onClick={() => onNavigate('resume-upload')}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all whitespace-nowrap"
        >
          Upload Resume (Milestone 1) →
        </button>
      </div>

      {/* Stats Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <p className="text-xs font-bold text-slate-500">{stat.title}</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900">{stat.value}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {stat.change}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">{stat.note}</p>
          </div>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Candidates List */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Recently Profiled Candidates</h3>
            <button onClick={() => onNavigate('candidates')} className="text-xs font-bold text-blue-600 hover:underline">
              View All Directory →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {candidates.slice(0, 4).map((cand) => (
              <div key={cand.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors px-2 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserAvatar name={cand.fullName} avatar={cand.avatar} size="md" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{cand.fullName}</p>
                    <p className="text-xs text-slate-500 font-medium">{cand.currentRole} • {cand.totalExperienceYears} yrs exp</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black text-xs rounded-full">
                    {cand.matchScore}% Match
                  </span>
                  <button onClick={() => onNavigate('matching')} className="text-xs font-bold text-slate-400 hover:text-slate-700">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Job Postings */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Active Job Postings</h3>
            <span className="text-xs font-bold text-slate-500">{jobs.length} Active Roles</span>
          </div>

          <div className="space-y-3">
            {jobs.slice(0, 3).map((job) => (
              <div key={job.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">{job.title}</p>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {job.department}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{job.location} • Min {job.minExperienceYears} yrs experience</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {job.requiredSkills.slice(0, 4).map((sk, i) => (
                    <span key={i} className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
