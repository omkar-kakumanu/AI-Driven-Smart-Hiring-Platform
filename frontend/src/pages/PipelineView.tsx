import React, { useState, useEffect } from 'react';
import type { Candidate } from '../types';
import { UserAvatar } from '../components/UserAvatar';


interface PipelineViewProps {
  candidates?: Candidate[];
}

export const PipelineView: React.FC<PipelineViewProps> = ({ candidates: initialCandidates = [] }) => {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);

  useEffect(() => {
    setCandidates(initialCandidates);
  }, [initialCandidates]);


  const stages: Candidate['status'][] = [
    'Applied', 'Screened', 'Shortlisted', 'Interviewed', 'Offered', 'Hired', 'Rejected'
  ];

  const moveCandidate = (candId: string, nextStage: Candidate['status']) => {
    setCandidates(prev => prev.map(c => c.id === candId ? { ...c, status: nextStage } : c));
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recruitment Kanban Pipeline</h2>
          <p className="text-slate-500 text-sm mt-0.5">Move candidates across hiring lifecycle stages</p>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageCandidates = candidates.filter(c => c.status === stage);

          return (
            <div key={stage} className="bg-slate-100/80 border border-slate-200 rounded-2xl p-3.5 space-y-3 min-w-[200px]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">{stage}</span>
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                  {stageCandidates.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3">
                {stageCandidates.map((cand) => (
                  <div key={cand.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all space-y-2">
                    <div className="flex items-center gap-2">
                      <UserAvatar name={cand.fullName} avatar={cand.avatar} size="xs" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{cand.fullName}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{cand.currentRole}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {cand.matchScore || 85}% Match
                      </span>

                      {/* Move selector */}
                      <select
                        value={cand.status}
                        onChange={(e) => moveCandidate(cand.id, e.target.value as Candidate['status'])}
                        className="bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-700 px-1 py-0.5 focus:outline-none"
                      >
                        {stages.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {stageCandidates.length === 0 && (
                  <div className="text-center py-6 text-[11px] text-slate-400 font-bold border border-dashed border-slate-200 rounded-xl bg-white/50">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
