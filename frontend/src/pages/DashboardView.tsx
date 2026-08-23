import React from 'react';
import { Users, Briefcase, Calendar, Award, Sparkles, ArrowRight } from 'lucide-react';
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
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-300 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI-Driven Recruitment Copilot
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Accelerate Hiring with Precision AI</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Screen candidates instantly, analyze skill gaps, generate role-tailored interview questions, and conduct AI voice screenings — all in one platform.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button 
              onClick={() => onNavigate('resume-upload')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
            >
              Upload Resumes Now <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onNavigate('matching')}
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-semibold text-xs border border-white/15 transition-all"
            >
              View Match Scoring
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Candidates</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{candidates.length}</p>
          <div className="text-xs text-emerald-600 font-bold">Active in pipeline</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Job Postings</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{jobs.length}</p>
          <div className="text-xs text-emerald-600 font-bold">Role profiles active</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Interviews Scheduled</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">
            {candidates.filter(c => c.status === 'Interviewed' || c.status === 'Shortlisted').length}
          </p>
          <div className="text-xs text-emerald-600 font-bold">Scheduled for evaluation</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Hiring Success Rate</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">92%</p>
          <div className="text-xs text-emerald-600 font-bold">Accuracy target</div>
        </div>
      </div>

      {/* Main Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Candidates Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Top Matched Candidates</h3>
            <button onClick={() => onNavigate('candidates')} className="text-xs text-blue-600 font-bold hover:underline">
              View All
            </button>
          </div>

          {candidates.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-sm font-bold text-slate-700">No candidates available</p>
              <p className="text-xs text-slate-400 mt-1">Upload resumes to automatically calculate candidate fit scores.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50">
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Experience</th>
                    <th className="py-3 px-4">Match Score</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidates.map((cand: Candidate) => (
                    <tr key={cand.id} className="hover:bg-slate-50/70 transition-all">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-3">
                        <UserAvatar name={cand.fullName} avatar={cand.avatar} size="sm" />
                        {cand.fullName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">{cand.currentRole}</td>
                      <td className="py-3.5 px-4 text-slate-700 text-xs font-semibold">{cand.totalExperienceYears} yrs</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          (cand.matchScore || 0) >= 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {cand.matchScore || 75}% Match
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button 
                          onClick={() => onNavigate('matching')}
                          className="px-3 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-xs font-semibold text-slate-700 transition-all"
                        >
                          Analyze
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Job Postings */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Active Jobs</h3>
            <button onClick={() => onNavigate('job-postings')} className="text-xs text-blue-600 font-bold hover:underline">
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {jobs.map((job: Job) => (
              <div key={job.id} className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-all">
                <h4 className="font-bold text-slate-900 text-xs">{job.title}</h4>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>{job.department}</span>
                  <span className="font-semibold text-blue-600">{candidates.length} Candidates</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
