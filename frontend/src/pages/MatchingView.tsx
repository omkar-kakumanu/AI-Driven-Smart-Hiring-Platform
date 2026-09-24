import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  ReferenceLine
} from 'recharts';
import type { Candidate, Job } from '../types';
import { UserAvatar } from '../components/UserAvatar';

interface MatchingViewProps {
  candidates?: Candidate[];
  jobs?: Job[];
  searchQuery?: string;
  onClearSearch?: () => void;
  isMainAdmin?: boolean;
  onAddSkillToCandidate?: (candidateId: string, skill: string) => void;
  onRemoveSkillFromCandidate?: (candidateId: string, skill: string) => void;
  onNavigateToUpload?: () => void;
}

export const MatchingView: React.FC<MatchingViewProps> = ({ 
  candidates = [], 
  jobs = [],
  searchQuery = '',
  onClearSearch,
  isMainAdmin = false,
  onAddSkillToCandidate,
  onRemoveSkillFromCandidate
}) => {
  const [adminSkillInput, setAdminSkillInput] = useState('');

  // Available Jobs List
  const availableJobs = jobs.length > 0 ? jobs : [
    {
      id: 'job-1',
      title: 'Senior Machine Learning Engineer',
      department: 'AI & Data Science',
      requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'Kubernetes', 'AWS SageMaker', 'SQL'],
      minExperienceYears: 5,
      educationRequirement: 'MS in Computer Science'
    },
    {
      id: 'job-2',
      title: 'Frontend React & UI Engineer',
      department: 'Frontend Engineering',
      requiredSkills: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'Tailwind CSS', 'Redux', 'REST APIs'],
      minExperienceYears: 3,
      educationRequirement: 'BS in Computer Science'
    }
  ];

  const [selectedJobId, setSelectedJobId] = useState<string>(availableJobs[0].id);
  const selectedJob = availableJobs.find(j => j.id === selectedJobId) || availableJobs[0];

  // Map candidates directly from reactive store (filtered by search bar)
  const availableCandidates = candidates.map(c => ({
    id: c.id,
    name: c.fullName,
    skills: c.skills || [],
    experience: c.totalExperienceYears || 0,
    education: c.degree || 'BS Computer Science',
    avatar: c.avatar
  }));

  const [selectedCandIdx, setSelectedCandIdx] = useState<number>(0);

  // Clamp candidate selection index safely
  const safeCandIdx = Math.min(selectedCandIdx, Math.max(0, availableCandidates.length - 1));
  const selectedCandidate = availableCandidates[safeCandIdx] || null;

  // Matching Engine calculation (weighted formula: Skill 60%, Exp 25%, Edu 15%)
  const calculateMatchScore = (cand: typeof selectedCandidate, j: typeof selectedJob) => {
    let score = 0.0;
    let totalWeight = 0.0;

    // Skill matching (weight 0.6)
    const reqSkills = j.requiredSkills || [];
    const candSkills = cand.skills || [];

    const candSkillsSet = new Set(candSkills.map(s => s.toLowerCase()));
    const matchedSkills = reqSkills.filter(s => candSkillsSet.has(s.toLowerCase()));
    const skillScore = reqSkills.length > 0 ? matchedSkills.length / reqSkills.length : 1.0;

    score += skillScore * 0.6;
    totalWeight += 0.6;

    // Experience matching (weight 0.25)
    const reqExp = j.minExperienceYears || 3;
    const expScore = Math.min(cand.experience / Math.max(reqExp, 1), 1.0);
    score += expScore * 0.25;
    totalWeight += 0.25;

    // Education matching (weight 0.15)
    const reqEdu = (j.educationRequirement || 'BS Computer Science').toLowerCase();
    const candEdu = (cand.education || '').toLowerCase();
    const eduScore = candEdu.includes('ms') && reqEdu.includes('ms') ? 1.0 : candEdu ? 0.8 : 0.5;
    score += eduScore * 0.15;
    totalWeight += 0.15;

    const hiringScore = Math.round((score / totalWeight) * 1000) / 10;
    const missingSkills = reqSkills.filter(s => !candSkillsSet.has(s.toLowerCase()));

    return {
      hiringScore,
      matchedSkills,
      missingSkills,
      skillScorePct: Math.round(skillScore * 100),
      expScorePct: Math.round(expScore * 100),
      eduScorePct: Math.round(eduScore * 100),
      recommendations: missingSkills.map(s => `Consider training in ${s}`)
    };
  };

  const currentMatch = selectedCandidate ? calculateMatchScore(selectedCandidate, selectedJob) : {
    hiringScore: 0,
    matchedSkills: [],
    missingSkills: [],
    skillScorePct: 0,
    expScorePct: 0,
    eduScorePct: 0,
    recommendations: []
  };

  // Ranked Candidates for the Selected Job
  const rankedCandidates = availableCandidates
    .map((c, originalIdx) => {
      const res = calculateMatchScore(c, selectedJob);
      return {
        candidate: c,
        originalIdx,
        ...res
      };
    })
    .sort((a, b) => b.hiringScore - a.hiringScore || b.skillScorePct - a.skillScorePct)
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));

  const currentCandidateRank = rankedCandidates.find(r => r.originalIdx === safeCandIdx)?.rank || 1;

  // Batch Data for Charting
  const batchResults = rankedCandidates.map(c => {
    return {
      name: c.candidate.name,
      score: c.hiringScore,
      skillScore: c.skillScorePct,
      rank: c.rank,
      matchedCount: c.matchedSkills.length,
      missingCount: c.missingSkills.length
    };
  });

  // Recharts Pie Chart Data
  const pieData = [
    { name: 'Matched Skills', value: currentMatch.matchedSkills.length },
    { name: 'Missing Skills', value: currentMatch.missingSkills.length }
  ];
  const PIE_COLORS = ['#059669', '#e11d48'];

  if (availableCandidates.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl font-black">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">No Candidates Found</h3>
          {searchQuery ? (
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              No candidate profiles match search query <strong className="text-slate-900">"{searchQuery}"</strong>. Try searching for a different skill, name, or role.
            </p>
          ) : (
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              No candidate records are currently available in the system.
            </p>
          )}
          {onClearSearch && searchQuery && (
            <button
              onClick={onClearSearch}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs mb-2">
            Neural Matching • Candidate-Job Matching Engine
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Candidate Skill Alignment & Gap Analysis</h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">Select a target job position to evaluate candidate skill fit, experience compatibility, and training gaps.</p>
        </div>

        <span className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm self-start md:self-auto">
          Weighted Model: Skill 60% • Exp 25% • Edu 15%
        </span>
      </div>

      {/* Main Admin Dedicated Skill Addition Box */}
      {isMainAdmin && selectedCandidate && (
        <div className="p-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center font-black text-xs text-purple-200 shrink-0">
              ADMIN
            </div>
            <div>
              <p className="text-[11px] font-black text-purple-300 uppercase tracking-wider">Main Admin Special Privileges</p>
              <p className="text-sm font-extrabold">Add Technical Skill to <span className="text-amber-300 underline">{selectedCandidate.name}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={adminSkillInput}
              onChange={(e) => setAdminSkillInput(e.target.value)}
              placeholder="Enter skill (e.g. PyTorch, Docker)"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && adminSkillInput.trim()) {
                  onAddSkillToCandidate && onAddSkillToCandidate(selectedCandidate.id, adminSkillInput.trim());
                  setAdminSkillInput('');
                }
              }}
              className="px-3.5 py-2 bg-white/10 border border-purple-400/40 rounded-xl text-xs text-white placeholder-purple-200 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 w-full md:w-64"
            />
            <button
              type="button"
              onClick={() => {
                if (adminSkillInput.trim()) {
                  onAddSkillToCandidate && onAddSkillToCandidate(selectedCandidate.id, adminSkillInput.trim());
                  setAdminSkillInput('');
                }
              }}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold rounded-xl shadow-md transition-all whitespace-nowrap"
            >
              + Add Skill
            </button>
          </div>
        </div>
      )}

      {/* Target Job & Candidate Selection Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Target Job Selector */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Target Job Role for Skill Analysis</label>
          <select 
            value={selectedJobId} 
            onChange={e => setSelectedJobId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
          >
            {availableJobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.department || 'Tech'})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
            Required Job Skills: <span className="font-bold text-slate-800">{(selectedJob.requiredSkills || []).join(', ')}</span>
          </p>
        </div>

        {/* Candidate Selector */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Select Candidate Profile</label>
          <select 
            value={safeCandIdx} 
            onChange={e => setSelectedCandIdx(Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
          >
            {availableCandidates.map((c, i) => (
              <option key={i} value={i}>
                {c.name} ({(c.skills || []).slice(0, 3).join(', ')})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
            Candidate Skills: <span className="font-bold text-slate-800">{(selectedCandidate?.skills || []).join(', ')}</span>
          </p>
        </div>
      </div>

      {/* Candidate Ranking Leaderboard */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span>Candidate Ranking Leaderboard</span>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-black rounded-full">
                {rankedCandidates.length} Candidates Ranked
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked in descending order for <strong className="text-slate-700">{selectedJob.title}</strong>. Minimum qualification benchmark is <strong>85% skill match</strong>.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> ≥85% Qualified Top Tier
            </span>
            <span className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> &lt;85% Skill Alert
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 font-bold text-slate-500 bg-slate-50/70">
                <th className="py-2.5 px-3 text-center">Rank</th>
                <th className="py-2.5 px-3">Candidate</th>
                <th className="py-2.5 px-3">Experience & Education</th>
                <th className="py-2.5 px-3 text-center">Skill Match %</th>
                <th className="py-2.5 px-3 text-center">Overall Hiring Score</th>
                <th className="py-2.5 px-3 text-center">Benchmark Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rankedCandidates.map((item) => {
                const isSelected = item.originalIdx === safeCandIdx;
                const isTopTier = item.skillScorePct >= 85;
                return (
                  <tr 
                    key={item.originalIdx}
                    onClick={() => setSelectedCandIdx(item.originalIdx)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                        item.rank === 1 ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300 shadow-sm' :
                        item.rank === 2 ? 'bg-slate-200 text-slate-900 border border-slate-300' :
                        item.rank === 3 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        #{item.rank}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={item.candidate.name} avatar={item.candidate.avatar} size="sm" />
                        <div>
                          <span className="font-bold text-slate-900 block">{item.candidate.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{(item.candidate.skills || []).slice(0, 3).join(', ')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {item.candidate.experience} yrs exp • {item.candidate.education}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                        isTopTier ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {item.skillScorePct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900 text-xs">
                      {item.hiringScore}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isTopTier ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ≥85% Qualified (Top Match)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-800 border border-rose-200">
                          Alert: &lt;85% ({item.skillScorePct}%)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Analyze'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Grid: Left Candidate/Job & Right Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Score & Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Candidate Benchmark Alert or Success Notification */}
          {currentMatch.skillScorePct < 85 ? (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0">
                !
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-amber-950 text-sm">
                    Skill Match Alert: {currentMatch.skillScorePct}% Match (Below 85% Benchmark)
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-200 text-amber-900 uppercase">
                    Rank #{currentCandidateRank}
                  </span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  <strong>{selectedCandidate.name}</strong> has a skill match of <strong>{currentMatch.skillScorePct}%</strong>, which is below the required <strong>85% hiring benchmark</strong> for {selectedJob.title}. Missing required skills: <span className="font-bold text-rose-700">{currentMatch.missingSkills.join(', ')}</span>.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                FIT
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-emerald-950 text-sm">
                    Benchmark Qualified: {currentMatch.skillScorePct}% Skill Match (≥85% Target Met)
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-200 text-emerald-900 uppercase">
                    Rank #{currentCandidateRank} • Top Match
                  </span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  <strong>{selectedCandidate.name}</strong> satisfies the 85% qualification standard with <strong>{currentMatch.skillScorePct}% skill match coverage</strong> ({currentMatch.matchedSkills.length} of {(selectedJob.requiredSkills || []).length} required skills verified). Strongly recommended for hiring round.
                </p>
              </div>
            </div>
          )}

          {/* Hiring Score Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Hiring Score</span>
                <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-black rounded">
                  Rank #{currentCandidateRank}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-slate-900">{currentMatch.hiringScore}%</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  currentMatch.skillScorePct >= 85 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {currentMatch.skillScorePct >= 85 ? `≥85% Qualified (${currentMatch.skillScorePct}% Skill)` : `Alert: <85% (${currentMatch.skillScorePct}% Skill)`}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Evaluating Candidate: <strong className="text-slate-900">{selectedCandidate.name}</strong> against Target Role: <strong className="text-slate-900">{selectedJob.title}</strong>
              </p>
            </div>

            <div className={`w-28 h-28 rounded-2xl border-4 ${
              currentMatch.skillScorePct >= 85 ? 'border-emerald-500 bg-emerald-50' : 'border-amber-400 bg-amber-50'
            } flex flex-col items-center justify-center text-center p-2 shadow-inner shrink-0`}>
              <span className={`text-2xl font-black ${
                currentMatch.skillScorePct >= 85 ? 'text-emerald-700' : 'text-amber-800'
              }`}>{currentMatch.matchedSkills.length}/{(selectedJob.requiredSkills || []).length}</span>
              <span className={`text-[10px] font-bold ${
                currentMatch.skillScorePct >= 85 ? 'text-emerald-800' : 'text-amber-900'
              }`}>Skills Matched</span>
              <span className="text-[10px] font-black text-slate-600 mt-0.5">{currentMatch.skillScorePct}% Skill Fit</span>
            </div>
          </div>

          {/* Factor Breakdown Bars */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Skill & Requirement Scoring Breakdown ({selectedJob.title})
            </h3>
            
            <div className="space-y-4 text-xs">
              {/* Skill Match Factor */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">Required Skill Coverage (60% Weight)</span>
                  <span className="text-slate-900">{currentMatch.skillScorePct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${currentMatch.skillScorePct}%` }}></div>
                </div>
              </div>

              {/* Experience Factor */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">Experience Alignment ({selectedCandidate.experience} yrs vs req {selectedJob.minExperienceYears || 3} yrs - 25% Weight)</span>
                  <span className="text-slate-900">{currentMatch.expScorePct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${currentMatch.expScorePct}%` }}></div>
                </div>
              </div>

              {/* Education Factor */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">Education Requirement ({selectedCandidate.education} - 15% Weight)</span>
                  <span className="text-slate-900">{currentMatch.eduScorePct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${currentMatch.eduScorePct}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Gap Analysis Report Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Skill-Gap Analysis & Training Recommendations</h3>
              <span className="text-xs font-bold text-slate-500">Target Role: {selectedJob.title}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <span className="font-bold text-emerald-900 block">Matched Skills ({currentMatch.matchedSkills.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentMatch.matchedSkills.length === 0 ? (
                    <span className="text-slate-400 italic">No exact skill matches</span>
                  ) : (
                    currentMatch.matchedSkills.map((sk, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-emerald-800 border border-emerald-300 font-bold rounded-lg text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{sk}</span>
                        {isMainAdmin && (
                          <button
                            onClick={() => selectedCandidate && onRemoveSkillFromCandidate && onRemoveSkillFromCandidate(selectedCandidate.id, sk)}
                            className="hover:text-rose-600 font-black text-xs cursor-pointer ml-0.5"
                            title={`Main Admin: Remove ${sk}`}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <span className="font-bold text-rose-900 block">Missing Required Skills ({currentMatch.missingSkills.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentMatch.missingSkills.length === 0 ? (
                    <span className="text-emerald-700 font-bold">All required skills met!</span>
                  ) : (
                    currentMatch.missingSkills.map((sk, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-rose-800 border border-rose-300 font-bold rounded-lg text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        <span>{sk}</span>
                        {isMainAdmin && (
                          <button
                            onClick={() => selectedCandidate && onAddSkillToCandidate && onAddSkillToCandidate(selectedCandidate.id, sk)}
                            className="ml-1 px-1.5 py-0.5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black rounded transition-colors cursor-pointer"
                            title={`Main Admin: Add ${sk} to candidate`}
                          >
                            + Add
                          </button>
                        )}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">AI Recommended Upskilling Path for {selectedJob.title}:</span>
              {currentMatch.recommendations.length === 0 ? (
                <p className="text-emerald-700 font-semibold">Candidate possesses all required skills for this target role!</p>
              ) : (
                <ul className="space-y-1 text-slate-700 font-medium">
                  {currentMatch.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Charts & Batch Data Matrix */}
        <div className="lg:col-span-5 space-y-6">
          {/* Skill Gap Pie Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Skill Gap Ratio for {selectedCandidate.name}</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Batch Candidate Match Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Batch Comparison against {selectedJob.title}</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batchResults} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <ReferenceLine 
                    y={85} 
                    stroke="#dc2626" 
                    strokeDasharray="4 4" 
                    strokeWidth={2}
                    label={{ value: '≥85% Benchmark Target', fill: '#dc2626', fontSize: 10, position: 'insideTopRight' }} 
                  />
                  <Bar dataKey="score" fill="#4f46e5" radius={[8, 8, 0, 0]} name="Hiring Score (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

