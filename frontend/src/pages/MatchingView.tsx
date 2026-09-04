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
  Legend
} from 'recharts';
import type { Candidate, Job } from '../types';

interface MatchingViewProps {
  candidates?: Candidate[];
  jobs?: Job[];
  onNavigateToUpload?: () => void;
}

export const MatchingView: React.FC<MatchingViewProps> = () => {
  // Step 1: Default Candidate & Job Profiles (from prompt specification)
  const defaultCandidate = {
    name: "Sarah Johnson",
    skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Data Analysis"],
    experience: 5,
    education: "MS Computer Science"
  };

  const defaultJob = {
    title: "Senior Machine Learning Engineer",
    required_skills: ["Python", "TensorFlow", "Kubernetes", "AWS SageMaker", "SQL"],
    experience_required: 4,
    education_required: "MS Computer Science"
  };

  // State
  const [selectedCandidate] = useState(defaultCandidate);
  const [selectedJob] = useState(defaultJob);

  // Step 2: Matching Engine calculation (exact weighted formula)
  const calculateMatchScore = (cand: typeof defaultCandidate, j: typeof defaultJob) => {
    let score = 0.0;
    let totalWeight = 0.0;

    // Skill matching (weight 0.6)
    const reqSkills = j.required_skills;
    const candSkills = cand.skills;

    const candSkillsSet = new Set(candSkills.map(s => s.toLowerCase()));

    const matchedSkills = reqSkills.filter(s => candSkillsSet.has(s.toLowerCase()));
    const skillScore = reqSkills.length > 0 ? matchedSkills.length / reqSkills.length : 1.0;


    score += skillScore * 0.6;
    totalWeight += 0.6;

    // Experience matching (weight 0.25)
    const expScore = Math.min(cand.experience / Math.max(j.experience_required, 1), 1.0);
    score += expScore * 0.25;
    totalWeight += 0.25;

    // Education matching (weight 0.15)
    const eduScore = cand.education.toLowerCase() === j.education_required.toLowerCase() ? 1.0 : 0.75;
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

  const currentMatch = calculateMatchScore(selectedCandidate, selectedJob);

  // Batch Data for Charting
  const batchCandidates = [
    defaultCandidate,
    {
      name: "Alex Chen",
      skills: ["Python", "Java", "Docker", "Kubernetes", "SQL"],
      experience: 3,
      education: "BS Computer Science"
    },
    {
      name: "Emily Rodriguez",
      skills: ["Python", "TensorFlow", "Kubernetes", "AWS SageMaker", "SQL", "Machine Learning"],
      experience: 5,
      education: "MS Computer Science"
    }
  ];

  const batchResults = batchCandidates.map(c => {
    const res = calculateMatchScore(c, selectedJob);
    return {
      name: c.name,
      score: res.hiringScore,
      matchedCount: res.matchedSkills.length,
      missingCount: res.missingSkills.length
    };
  });

  // Recharts Pie Chart Data for Skill Match vs Missing
  const pieData = [
    { name: 'Matched Skills', value: currentMatch.matchedSkills.length },
    { name: 'Missing Skills', value: currentMatch.missingSkills.length }
  ];
  const PIE_COLORS = ['#059669', '#e11d48'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs mb-2">
            Milestone 2 Active Matching Engine
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Candidate-Job Matching & Skill Analysis</h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">Weighted compatibility scoring (Skills 60%, Exp 25%, Edu 15%) & AI Skill Gap Reports</p>
        </div>

        <span className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm">
          Target Accuracy: ≥85%
        </span>
      </div>

      {/* Main Grid: Left Candidate/Job & Right Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Score & Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hiring Score Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Hiring Score</span>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-slate-900">{currentMatch.hiringScore}%</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  currentMatch.hiringScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  {currentMatch.hiringScore >= 80 ? 'High Compatibility' : 'Moderate Match'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Candidate: <strong className="text-slate-800">{selectedCandidate.name}</strong> • Role: <strong className="text-slate-800">{selectedJob.title}</strong></p>
            </div>

            <div className="w-24 h-24 rounded-full border-4 border-emerald-500 bg-emerald-50 flex flex-col items-center justify-center text-center p-2 shadow-inner shrink-0">
              <span className="text-2xl font-black text-emerald-700">{currentMatch.matchedSkills.length}/{selectedJob.required_skills.length}</span>
              <span className="text-[10px] font-bold text-emerald-800">Matched</span>
            </div>
          </div>

          {/* Factor Breakdown Bars */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Weighted Scoring Breakdown</h3>
            
            <div className="space-y-4 text-xs">
              {/* Skill Match Factor */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">Skill Fit (60% Weight)</span>
                  <span className="text-slate-900">{currentMatch.skillScorePct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${currentMatch.skillScorePct}%` }}></div>
                </div>
              </div>

              {/* Experience Factor */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">Experience Alignment ({selectedCandidate.experience} yrs vs req {selectedJob.experience_required} yrs - 25% Weight)</span>
                  <span className="text-slate-900">{currentMatch.expScorePct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${currentMatch.expScorePct}%` }}></div>
                </div>
              </div>

              {/* Education Factor */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">Education Match ({selectedCandidate.education} - 15% Weight)</span>
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
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Skill-Gap Analysis & Training Recommendations</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <span className="font-bold text-emerald-900 block">Matched Skills ({currentMatch.matchedSkills.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentMatch.matchedSkills.map((sk, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white text-emerald-800 border border-emerald-300 font-bold rounded-lg text-[11px]">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <span className="font-bold text-rose-900 block">Missing Required Skills ({currentMatch.missingSkills.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentMatch.missingSkills.map((sk, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white text-rose-800 border border-rose-300 font-bold rounded-lg text-[11px]">
                      ✗ {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">AI Recommended Upskilling Path:</span>
              <ul className="space-y-1 text-slate-700 font-medium">
                {currentMatch.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side: Charts & Batch Data Matrix */}
        <div className="lg:col-span-5 space-y-6">
          {/* Skill Gap Pie Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Candidate Skill Gap Ratio (Pie Chart)</h3>
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
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Batch Comparison ({selectedJob.title})</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batchResults} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
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
