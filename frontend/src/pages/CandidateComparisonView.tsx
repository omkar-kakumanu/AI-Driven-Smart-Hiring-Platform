import React from 'react';
import type { Candidate } from '../types';
import { UserAvatar } from '../components/UserAvatar';


interface CandidateComparisonViewProps {
  candidates?: Candidate[];
}

export const CandidateComparisonView: React.FC<CandidateComparisonViewProps> = ({ candidates = [] }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Candidate Comparison Matrix</h2>
        <p className="text-slate-500 text-sm mt-0.5">Side-by-side technical evaluation of shortlisted candidates</p>
      </div>

      {candidates.length === 0 ? (
        <div className="py-12 bg-white border border-slate-200 rounded-xl text-center text-slate-500">
          No candidates available for comparison yet. Upload candidate resumes to compare metrics.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">Evaluation Metric</th>
                {candidates.slice(0, 3).map((cand: Candidate) => (
                  <th key={cand.id} className="py-4 px-6 text-center border-l border-slate-200">
                    <UserAvatar name={cand.fullName} avatar={cand.avatar} size="md" className="mx-auto mb-2" />
                    <p className="font-extrabold text-slate-900 text-sm">{cand.fullName}</p>
                    <p className="text-xs text-slate-500 font-normal">{cand.currentRole}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              <tr>
                <td className="py-4 px-6 font-bold text-slate-800 bg-slate-50/50">Overall Match Score</td>
                {candidates.slice(0, 3).map((cand: Candidate) => (
                  <td key={cand.id} className="py-4 px-6 text-center border-l border-slate-200">
                    <span className={`px-3 py-1 rounded-full font-extrabold text-xs ${
                      (cand.matchScore || 0) >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {cand.matchScore || 75}%
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 px-6 font-bold text-slate-800 bg-slate-50/50">Total Experience</td>
                {candidates.slice(0, 3).map((cand: Candidate) => (
                  <td key={cand.id} className="py-4 px-6 text-center font-bold text-slate-800 border-l border-slate-200">
                    {cand.totalExperienceYears} Years
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 px-6 font-bold text-slate-800 bg-slate-50/50">Highest Degree</td>
                {candidates.slice(0, 3).map((cand: Candidate) => (
                  <td key={cand.id} className="py-4 px-6 text-center text-slate-700 border-l border-slate-200">
                    {cand.degree}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 px-6 font-bold text-slate-800 bg-slate-50/50">Core Technical Skills</td>
                {candidates.slice(0, 3).map((cand: Candidate) => (
                  <td key={cand.id} className="py-4 px-6 border-l border-slate-200">
                    <div className="flex flex-wrap justify-center gap-1">
                      {cand.skills.map((sk: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
