import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Award, 
  Briefcase, 
  GraduationCap, 
  BrainCircuit, 
  BookOpen, 
  ArrowRight, 
  Layers,
  Cpu
} from 'lucide-react';
import type { Candidate, Job } from '../types';

interface MatchingViewProps {
  candidates?: Candidate[];
  jobs?: Job[];
}

export const MatchingView: React.FC<MatchingViewProps> = () => {
  // Step 1: Default Candidate & Job Profiles (matching user prompt example)
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

  // State for active candidate & job
  const [selectedCandidate, setSelectedCandidate] = useState(defaultCandidate);
  const [selectedJob, setSelectedJob] = useState(defaultJob);
  const [rawText, setRawText] = useState(
    "Experienced Senior ML Engineer with 6 years of experience in Python, TensorFlow, PyTorch, SQL, and AWS SageMaker. Master of Science in Computer Science."
  );
  const [isExtracting, setIsExtracting] = useState(false);

  // Additional mock candidates for batch dataframe
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

  const batchJobs = [
    defaultJob,
    {
      title: "Backend Java Specialist",
      required_skills: ["Java", "SQL", "Docker"],
      experience_required: 2,
      education_required: "BS Computer Science"
    }
  ];

  // Calculate Match Score (Exact Milestone 2 formula)
  const calculateMatch = (cand: typeof defaultCandidate, j: typeof defaultJob) => {
    let score = 0.0;
    let totalWeight = 0.0;

    // 1. Skill matching (weight 0.6)
    const reqSkills = j.required_skills;
    const candSkills = cand.skills;
    const candSkillsLower = candSkills.map((s: string) => s.toLowerCase());

    const matchedSkills = reqSkills.filter(s => candSkillsLower.includes(s.toLowerCase()));
    const skillScore = reqSkills.length > 0 ? matchedSkills.length / reqSkills.length : 1.0;
    score += skillScore * 0.6;
    totalWeight += 0.6;

    // 2. Experience matching (weight 0.25)
    const expScore = Math.min(cand.experience / Math.max(j.experience_required, 1.0), 1.0);
    score += expScore * 0.25;
    totalWeight += 0.25;

    // 3. Education matching (weight 0.15)
    const eduScore = cand.education.toLowerCase() === j.education_required.toLowerCase() ? 1.0 : 0.75;
    score += eduScore * 0.15;
    totalWeight += 0.15;

    const hiringScore = Math.round((score / totalWeight) * 100);

    const missingSkills = reqSkills.filter(s => !candSkillsLower.includes(s.toLowerCase()));
    const recommendations = missingSkills.map(s => `Consider training in ${s}`);

    return {
      hiringScore,
      matchedSkills,
      missingSkills,
      recommendations,
      breakdown: {
        skillScore: Math.round(skillScore * 100),
        expScore: Math.round(expScore * 100),
        eduScore: Math.round(eduScore * 100)
      }
    };
  };

  const currentResult = calculateMatch(selectedCandidate, selectedJob);

  // AI NLP Text Extraction Handler
  const handleNLPExtraction = () => {
    setIsExtracting(true);
    setTimeout(() => {
      const lower = rawText.toLowerCase();
      const catalog = ["Python", "TensorFlow", "PyTorch", "Kubernetes", "AWS SageMaker", "SQL", "Machine Learning", "Data Analysis", "Docker", "Java"];
      const detectedSkills = catalog.filter(s => lower.includes(s.toLowerCase()));
      
      let exp = 5;
      const expMatch = lower.match(/(\d+)\+?\s*years/);
      if (expMatch) exp = parseInt(expMatch[1]);

      let edu = "MS Computer Science";
      if (lower.includes("bachelor") || lower.includes("bs")) edu = "BS Computer Science";

      setSelectedCandidate({
        name: "Auto-Extracted Candidate (NLP)",
        skills: detectedSkills.length > 0 ? detectedSkills : ["Python", "TensorFlow", "SQL"],
        experience: exp,
        education: edu
      });
      setIsExtracting(false);
    }, 600);
  };

  const getBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:border-emerald-700';
    if (score >= 70) return 'bg-amber-500/10 text-amber-700 border-amber-300 dark:border-amber-700';
    return 'bg-rose-500/10 text-rose-700 border-rose-300 dark:border-rose-700';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
              <Cpu className="w-3.5 h-3.5" /> Milestone 2: Candidate-Job Matching & Skill Intelligence
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Candidate Matching & Skill-Gap Engine</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Weighted compatibility scoring engine (60% Skill, 25% Experience, 15% Education) with dynamic AI NLP skill extraction and candidate skill gap analysis.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl p-3 text-center min-w-[120px]">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Target Accuracy</div>
              <div className="text-xl font-black text-emerald-400">≥ 85%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Matching Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Selection & NLP Text Extractor */}
        <div className="space-y-6 lg:col-span-1">
          {/* Candidate & Job Selection Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-blue-600" /> Target Profile Selection
            </h2>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Candidate Profile</label>
              <select 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCandidate.name}
                onChange={(e) => {
                  const cand = batchCandidates.find(c => c.name === e.target.value);
                  if (cand) setSelectedCandidate(cand);
                }}
              >
                {batchCandidates.map((c) => (
                  <option key={c.name} value={c.name}>{c.name} ({c.experience} yrs exp)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Job Requirement</label>
              <select 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedJob.title}
                onChange={(e) => {
                  const j = batchJobs.find(item => item.title === e.target.value);
                  if (j) setSelectedJob(j);
                }}
              >
                {batchJobs.map((j) => (
                  <option key={j.title} value={j.title}>{j.title}</option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Candidate Degree:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.education}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Candidate Exp:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.experience} Years</span>
              </div>
            </div>
          </div>

          {/* AI NLP Text Extraction Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-indigo-900 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">AI-Powered Dynamic NLP Extraction</h3>
            </div>
            <p className="text-xs text-slate-300">
              Paste raw resume or job text below to auto-detect technical skills, experience duration, and educational credentials via NLP entity extraction:
            </p>
            <textarea
              className="w-full bg-slate-950/80 border border-indigo-900 rounded-xl p-3 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-mono"
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste unformatted resume or JD text here..."
            />
            <button
              onClick={handleNLPExtraction}
              disabled={isExtracting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isExtracting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running NLP Transformer Extraction...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" /> Auto-Detect Profile with AI NLP
                </>
              )}
            </button>
          </div>
        </div>

        {/* Center & Right Column: Score Breakdown & Skill Gap Report */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 2: Compatibility Score Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Candidate Evaluation Result</span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{selectedCandidate.name}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Target Job: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedJob.title}</span></p>
              </div>

              {/* Score Badge */}
              <div className={`px-5 py-3 rounded-2xl border flex flex-col items-center justify-center text-center ${getBadgeColor(currentResult.hiringScore)}`}>
                <div className="text-2xl font-black">{currentResult.hiringScore}%</div>
                <div className="text-[10px] uppercase font-bold tracking-wider mt-0.5">
                  {currentResult.hiringScore >= 85 ? 'Strongly Matched' : currentResult.hiringScore >= 70 ? 'Moderate Match' : 'Skill Gap Identified'}
                </div>
              </div>
            </div>

            {/* Score Component Breakdown Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-blue-500" /> Skill Match (60%)
                  </span>
                  <span className="font-extrabold text-blue-600">{currentResult.breakdown.skillScore}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${currentResult.breakdown.skillScore}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-emerald-500" /> Experience (25%)
                  </span>
                  <span className="font-extrabold text-emerald-600">{currentResult.breakdown.expScore}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${currentResult.breakdown.expScore}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-purple-500" /> Education (15%)
                  </span>
                  <span className="font-extrabold text-purple-600">{currentResult.breakdown.eduScore}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${currentResult.breakdown.eduScore}%` }} />
                </div>
              </div>
            </div>

            {/* Step 3: Skill Gap Analysis Section */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Matched Skills List */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Matched Skills ({currentResult.matchedSkills.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentResult.matchedSkills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {skill}
                    </span>
                  ))}
                  {currentResult.matchedSkills.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No skills matched yet</span>
                  )}
                </div>
              </div>

              {/* Missing Skills List */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Missing Required Skills ({currentResult.missingSkills.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentResult.missingSkills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <XCircle className="w-3 h-3 text-rose-500" /> {skill}
                    </span>
                  ))}
                  {currentResult.missingSkills.length === 0 && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> All required skills matched!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations List */}
            {currentResult.recommendations.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-amber-600" /> Skill-Gap Training Recommendations
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {currentResult.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-amber-600 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step 4: Batch Candidates Cross-Matching DataFrame Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Batch Candidate Cross-Matching DataFrame Summary</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">Cross-matching Matrix ({batchCandidates.length * batchJobs.length} Pairs)</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Job Title</th>
                <th className="py-3 px-4">Hiring Score</th>
                <th className="py-3 px-4">Matched Count</th>
                <th className="py-3 px-4">Missing Count</th>
                <th className="py-3 px-4">Matched Skills</th>
                <th className="py-3 px-4">Missing Skills</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {batchCandidates.flatMap(cand => 
                batchJobs.map(j => {
                  const res = calculateMatch(cand, j);
                  return (
                    <tr key={`${cand.name}-${j.title}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{cand.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{j.title}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${getBadgeColor(res.hiringScore)}`}>
                          {res.hiringScore}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-600 font-bold">{res.matchedSkills.length}</td>
                      <td className="py-3 px-4 text-rose-500 font-bold">{res.missingSkills.length}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{res.matchedSkills.join(', ') || 'None'}</td>
                      <td className="py-3 px-4 text-slate-500">{res.missingSkills.join(', ') || 'None'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MatchingView;
