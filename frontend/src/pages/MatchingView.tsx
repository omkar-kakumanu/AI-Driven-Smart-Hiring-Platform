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

export const MatchingView: React.FC<MatchingViewProps> = ({ candidates = [], jobs = [] }) => {
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
    },
    {
      id: 'job-3',
      title: 'Cloud DevOps & Security Specialist',
      department: 'Infrastructure & Ops',
      requiredSkills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Linux', 'Python'],
      minExperienceYears: 4,
      educationRequirement: 'BS in Computer Science'
    },
    {
      id: 'job-4',
      title: 'Backend Java & Systems Architect',
      department: 'Backend Systems',
      requiredSkills: ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices', 'Redis', 'Docker', 'SQL'],
      minExperienceYears: 5,
      educationRequirement: 'BS in Computer Science'
    },
    {
      id: 'job-5',
      title: 'Data Engineer & Analytics Specialist',
      department: 'Data & Analytics',
      requiredSkills: ['Python', 'SQL', 'Apache Spark', 'Snowflake', 'Airflow', 'Data Modeling', 'PostgreSQL'],
      minExperienceYears: 4,
      educationRequirement: 'BS in Computer Science'
    },
    {
      id: 'job-6',
      title: 'Cybersecurity Analyst & Threat Specialist',
      department: 'Information Security',
      requiredSkills: ['Cybersecurity', 'Network Security', 'Python', 'SIEM', 'Penetration Testing', 'Firewalls', 'Linux'],
      minExperienceYears: 4,
      educationRequirement: 'BS in Cybersecurity'
    },
    {
      id: 'job-7',
      title: 'Full Stack MERN Developer',
      department: 'Web Engineering',
      requiredSkills: ['Node.js', 'Express', 'React', 'MongoDB', 'JavaScript', 'TypeScript', 'Docker', 'REST APIs'],
      minExperienceYears: 3,
      educationRequirement: 'BS in Computer Science'
    },
    {
      id: 'job-8',
      title: 'Mobile Application Engineer (iOS & Android)',
      department: 'Mobile Development',
      requiredSkills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile UI', 'REST APIs', 'Firebase'],
      minExperienceYears: 4,
      educationRequirement: 'BS in Computer Science'
    },
    {
      id: 'job-9',
      title: 'AI Prompt Engineer & LLM Specialist',
      department: 'AI Research & Applications',
      requiredSkills: ['Python', 'LangChain', 'OpenAI API', 'Prompt Engineering', 'Vector Databases', 'Pinecone', 'FastAPI'],
      minExperienceYears: 3,
      educationRequirement: 'BS in Computer Science'
    }
  ];

  const [selectedJobId, setSelectedJobId] = useState<string>(availableJobs[0].id);

  const selectedJob = availableJobs.find(j => j.id === selectedJobId) || availableJobs[0];

  // Candidates Pool
  const availableCandidates = candidates.length > 0 ? candidates.map(c => ({
    name: c.fullName,
    skills: c.skills,
    experience: c.totalExperienceYears,
    education: c.degree
  })) : [
    {
      name: "Sarah Johnson",
      skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Data Analysis"],
      experience: 5,
      education: "MS Computer Science"
    },
    {
      name: "Alex Chen",
      skills: ["React", "TypeScript", "JavaScript", "Redux", "HTML5", "REST APIs"],
      experience: 4,
      education: "BS Computer Science"
    },
    {
      name: "Emily Rodriguez",
      skills: ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD", "Linux", "Python"],
      experience: 6,
      education: "BS Computer Science"
    }
  ];

  const [selectedCandIdx, setSelectedCandIdx] = useState<number>(0);
  const selectedCandidate = availableCandidates[selectedCandIdx] || availableCandidates[0];

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

  const currentMatch = calculateMatchScore(selectedCandidate, selectedJob);

  // Batch Data for Charting
  const batchResults = availableCandidates.map(c => {
    const res = calculateMatchScore(c, selectedJob);
    return {
      name: c.name,
      score: res.hiringScore,
      matchedCount: res.matchedSkills.length,
      missingCount: res.missingSkills.length
    };
  });

  // Recharts Pie Chart Data
  const pieData = [
    { name: 'Matched Skills', value: currentMatch.matchedSkills.length },
    { name: 'Missing Skills', value: currentMatch.missingSkills.length }
  ];
  const PIE_COLORS = ['#059669', '#e11d48'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs mb-2">
            Milestone 2 Candidate-Job Matching Engine
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Candidate Skill Alignment & Gap Analysis</h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">Select a target job position to evaluate candidate skill fit, experience compatibility, and training gaps.</p>
        </div>

        <span className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm self-start md:self-auto">
          Weighted Model: Skill 60% • Exp 25% • Edu 15%
        </span>
      </div>

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
            value={selectedCandIdx} 
            onChange={e => setSelectedCandIdx(Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
          >
            {availableCandidates.map((c, i) => (
              <option key={i} value={i}>
                {c.name} ({c.skills.slice(0, 3).join(', ')})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
            Candidate Skills: <span className="font-bold text-slate-800">{(selectedCandidate.skills || []).join(', ')}</span>
          </p>
        </div>
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
              <p className="text-xs text-slate-500 font-medium">
                Evaluating Candidate: <strong className="text-slate-900">{selectedCandidate.name}</strong> against Target Role: <strong className="text-slate-900">{selectedJob.title}</strong>
              </p>
            </div>

            <div className="w-24 h-24 rounded-full border-4 border-emerald-500 bg-emerald-50 flex flex-col items-center justify-center text-center p-2 shadow-inner shrink-0">
              <span className="text-2xl font-black text-emerald-700">{currentMatch.matchedSkills.length}/{(selectedJob.requiredSkills || []).length}</span>
              <span className="text-[10px] font-bold text-emerald-800">Skills Matched</span>
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
                      <span key={i} className="px-2.5 py-1 bg-white text-emerald-800 border border-emerald-300 font-bold rounded-lg text-[11px]">
                        ✓ {sk}
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
                      <span key={i} className="px-2.5 py-1 bg-white text-rose-800 border border-rose-300 font-bold rounded-lg text-[11px]">
                        ✗ {sk}
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

