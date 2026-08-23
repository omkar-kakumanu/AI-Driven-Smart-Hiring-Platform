import React from 'react';
import { Users, TrendingUp, BookOpen, ArrowRight } from 'lucide-react';
import type { Job, Candidate } from '../types';
import { UserAvatar } from '../components/UserAvatar';

interface MatchingViewProps {
  jobs: Job[];
  candidates: Candidate[];
  activeJobId: string;
  setActiveJobId: (id: string) => void;
  activeCandidateId: string;
  setActiveCandidateId: (id: string) => void;
  onNavigateToUpload: () => void;
}

export const MatchingView: React.FC<MatchingViewProps> = ({
  jobs,
  candidates,
  activeJobId,
  setActiveJobId,
  activeCandidateId,
  setActiveCandidateId,
  onNavigateToUpload
}) => {
  const activeJob = jobs.find(j => j.id === activeJobId) || jobs[0];
  const activeCandidate = candidates.find(c => c.id === activeCandidateId) || candidates[0];

  const calculateSkillGap = (candidate?: Candidate, job?: Job) => {
    if (!candidate || !job) return [];
    const required = job.requiredSkills || [];
    const candSkillsLower = (candidate.skills || []).map(s => s.toLowerCase());

    return required.map(skill => {
      const isPresent = candSkillsLower.includes(skill.toLowerCase());
      return {
        skill,
        level: isPresent ? 'Advanced' : 'None',
        status: 'Required',
        candidateLevel: isPresent ? 90 : 15,
        requiredLevel: 85
      };
    });
  };

  const skillGaps = calculateSkillGap(activeCandidate, activeJob);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Matching & Skill Gap Intelligence</h2>
          <p className="text-slate-500 text-sm mt-0.5">Multi-factor weighted candidate compatibility scoring and skill discrepancy report</p>
        </div>
        <span className="px-3 py-1 bg-emerald-600 text-white rounded-md text-xs font-bold uppercase tracking-wider shadow-sm">
          Milestone 2
        </span>
      </div>

      {candidates.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Candidates Available for Matching</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            Upload candidate resumes to calculate weighted fit scores against job requirements.
          </p>
          <button 
            onClick={onNavigateToUpload}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            Upload Resume First <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Job Selector & Candidate Match List */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <Users className="w-5 h-5 text-blue-600" /> Matched Candidates
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500">Target Job:</label>
                <select
                  value={activeJobId}
                  onChange={(e) => setActiveJobId(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Candidate Card List */}
            <div className="space-y-4">
              {candidates.map((cand) => {
                const isSelected = cand.id === activeCandidateId;
                const matchScore = cand.matchScore || 75;
                const badgeBg = matchScore >= 85 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white';

                return (
                  <div
                    key={cand.id}
                    onClick={() => setActiveCandidateId(cand.id)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md' 
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar name={cand.fullName} avatar={cand.avatar} size="md" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm">{cand.fullName}</h4>
                        <p className="text-[11px] text-slate-500">{cand.currentRole} • {cand.totalExperienceYears} yrs exp</p>
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {cand.skills.slice(0, 3).map((sk, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold border border-blue-100">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-4 border-l border-slate-100">
                      <div className={`w-12 h-12 rounded-full ${badgeBg} flex items-center justify-center font-black text-sm shadow-sm`}>
                        {matchScore}%
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold mt-1">Fit Score</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Skill Gap Analysis */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                  <TrendingUp className="w-5 h-5 text-indigo-600" /> Skill Discrepancy Breakdown
                </div>
                {activeCandidate && (
                  <span className="text-xs font-bold text-slate-700">
                    Evaluating: <strong className="text-blue-600">{activeCandidate.fullName}</strong>
                  </span>
                )}
              </div>

              {/* Skill Progress List */}
              <div className="space-y-4">
                {skillGaps.map((item, index) => (
                  <div key={index} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{item.skill}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 font-medium">{item.level}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.level === 'Advanced' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.level === 'Advanced' ? 'Matched' : 'Missing'}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.level === 'Advanced' ? 'bg-emerald-500' : 'bg-rose-500'} transition-all duration-500 rounded-full`}
                        style={{ width: `${item.candidateLevel}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Learning Recommendation Box */}
            {activeCandidate && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                  <BookOpen className="w-4 h-4 text-indigo-600" /> AI Hiring Recommendation
                </div>
                <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                  {activeCandidate.fullName} demonstrates a {activeCandidate.matchScore}% overall compatibility match for {activeJob?.title}. Core strengths in {activeCandidate.skills.slice(0, 2).join(', ')}. Target development on missing skills to achieve full operational deployment readiness.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
