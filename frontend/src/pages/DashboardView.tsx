import React from 'react';
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
import { UserAvatar } from '../components/UserAvatar';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  candidates?: Candidate[];
  allCandidatesCount?: number;
  jobs?: Job[];
  searchQuery?: string;
  onClearSearch?: () => void;
  isAdmin?: boolean;
  onEditJob?: (job: Job) => void;
  onNewJobClick?: () => void;
  onRestoreDefaultJobs?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onNavigate,
  candidates = [],
  allCandidatesCount = 0,
  jobs = [],
  searchQuery = '',
  onClearSearch,
  isAdmin = false,
  onEditJob,
  onNewJobClick,
  onRestoreDefaultJobs
}) => {
  const stats = [
    { title: 'Matching Candidates', value: candidates.length.toString(), change: searchQuery ? 'Filtered' : '+12%', note: searchQuery ? `out of ${allCandidatesCount} total` : 'vs last month' },
    { title: 'Active Openings', value: jobs.length.toString(), change: '+3', note: 'new roles' },
    { title: 'Screening Pass Rate', value: '78%', change: '+5%', note: 'quality score' },
    { title: 'Avg Time to Screen', value: '1.2 days', change: '-40%', note: 'faster cycle' },
  ];

  // 1. Calculate Skill Frequency for Pie Chart
  const skillCounts: Record<string, number> = {};
  candidates.forEach(c => {
    (c.skills || []).forEach(sk => {
      const formatted = sk.trim();
      skillCounts[formatted] = (skillCounts[formatted] || 0) + 1;
    });
  });

  const pieData = Object.keys(skillCounts).length > 0 
    ? Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }))
    : [
        { name: 'Python', value: 5 },
        { name: 'Machine Learning', value: 4 },
        { name: 'SQL', value: 4 },
        { name: 'TensorFlow', value: 3 },
        { name: 'React / Frontend', value: 2 },
      ];

  const PIE_COLORS = ['#2563eb', '#4f46e5', '#059669', '#f59e0b', '#7c3aed'];

  // 2. Calculate Fit Score Ranges for Bar Chart
  const scoreRanges = {
    '90-100% Fit': 0,
    '80-89% Fit': 0,
    '70-79% Fit': 0,
    '<70% Fit': 0
  };

  candidates.forEach(c => {
    const score = c.matchScore || 75;
    if (score >= 90) scoreRanges['90-100% Fit']++;
    else if (score >= 80) scoreRanges['80-89% Fit']++;
    else if (score >= 70) scoreRanges['70-79% Fit']++;
    else scoreRanges['<70% Fit']++;
  });

  const barData = candidates.length > 0
    ? Object.entries(scoreRanges).map(([name, count]) => ({ name, count }))
    : [
        { name: '90-100% Fit', count: 3 },
        { name: '80-89% Fit', count: 4 },
        { name: '70-79% Fit', count: 2 },
        { name: '<70% Fit', count: 1 },
      ];

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 font-bold text-xs">
            Recruitment Operations & Analytics
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">Automated Candidate Profiling & Analytics</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Process candidate resumes, analyze skill alignment against open job descriptions, and evaluate data visualizations.
          </p>
        </div>

        <button 
          onClick={() => onNavigate('candidates')}
          className="w-full md:w-auto text-center px-5 py-3 sm:px-6 sm:py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all whitespace-nowrap cursor-pointer shrink-0"
        >
          Upload Resume & View Candidates →
        </button>
      </div>

      {/* Stats Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-sm space-y-2 sm:space-y-3">
            <p className="text-[11px] sm:text-xs font-bold text-slate-500 truncate">{stat.title}</p>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <span className="text-xl sm:text-3xl font-black text-slate-900">{stat.value}</span>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-200 w-fit">
                {stat.change}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">{stat.note}</p>
          </div>
        ))}
      </div>

      {/* Data Visualization Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
        {/* Candidate Skill Distribution Pie Chart */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-1">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Candidate Skill Distribution (Pie Chart)</h3>
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">Top Technical Skills</span>
          </div>

          <div className="h-56 sm:h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [`${value} Candidates`, 'Count']}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', fontWeight: '600' }}
                  verticalAlign="bottom" 
                  height={36} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Candidate Fit Score Distribution Bar Graph */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-1">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Candidate Match Score Distribution (Bar Graph)</h3>
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">Compatibility Ranges</span>
          </div>

          <div className="h-56 sm:h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
        {/* Active Candidates List */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Top Ranked Candidates Leaderboard</h3>
            <button onClick={() => onNavigate('candidates')} className="text-xs font-bold text-blue-600 hover:underline">
              View All →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {candidates.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <p className="text-xs font-bold text-slate-600">No candidates match search query "{searchQuery}"</p>
                {onClearSearch && (
                  <button onClick={onClearSearch} className="text-xs font-bold text-blue-600 hover:underline">
                    Clear Search Filter
                  </button>
                )}
              </div>
            ) : (
              [...candidates]
                .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
                .slice(0, 5)
                .map((cand, index) => {
                  const isTopTier = (cand.matchScore || 0) >= 85;
                  return (
                    <div key={cand.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors px-2 rounded-lg">
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs font-black shrink-0 ${
                          index === 0 ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300' :
                          index === 1 ? 'bg-slate-200 text-slate-800' :
                          index === 2 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          #{index + 1}
                        </span>
                        <UserAvatar name={cand.fullName} avatar={cand.avatar} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 truncate">{cand.fullName}</p>
                          <p className="text-xs text-slate-500 font-medium truncate">{cand.currentRole} • {cand.totalExperienceYears} yrs exp</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(cand.skills || []).slice(0, 3).map((sk, i) => (
                              <span key={i} className="text-[10px] bg-slate-100 font-semibold px-1.5 py-0.2 rounded border border-slate-200 text-slate-600">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {isTopTier ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs rounded-full">
                            {cand.matchScore}% (≥85% Fit)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 font-black text-xs rounded-full">
                            {cand.matchScore}% (&lt;85%)
                          </span>
                        )}
                        <button onClick={() => onNavigate('matching')} className="text-xs font-bold text-blue-600 hover:text-blue-800 shrink-0">
                          Details →
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Active Job Postings */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Active Job Postings</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold text-[11px] rounded-full">
                  {jobs.length} Active Roles
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">All engineering openings & technical specifications</p>
            </div>
            
            <div className="flex items-center gap-2">
              {isAdmin && onRestoreDefaultJobs && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Restore the original default job postings and requirements? Any custom changes to default jobs will reset.")) {
                      onRestoreDefaultJobs();
                    }
                  }}
                  title="Restore original 5 core jobs data"
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>🔄</span>
                  <span className="hidden sm:inline">Reset Defaults</span>
                </button>
              )}
              {isAdmin && onNewJobClick && (
                <button
                  type="button"
                  onClick={onNewJobClick}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>+</span>
                  <span>New Role</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1.5">
            {jobs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-3">
                <p className="text-xs font-bold text-slate-600">No active job openings found</p>
                {isAdmin && onRestoreDefaultJobs && (
                  <button
                    onClick={onRestoreDefaultJobs}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                  >
                    Restore 5 Default Job Postings
                  </button>
                )}
              </div>
            ) : (
              jobs.map((job) => (
                <div 
                  key={job.id} 
                  className="p-4 bg-slate-50/70 border border-slate-200 hover:border-slate-300 rounded-xl space-y-2 transition-all hover:bg-white hover:shadow-xs group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {job.location} • Min {job.minExperienceYears} yrs exp • ₹{(job.minSalary / 100000).toFixed(1)}-{(job.maxSalary / 100000).toFixed(1)} LPA
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {job.department}
                      </span>
                      {isAdmin && onEditJob && (
                        <button
                          type="button"
                          onClick={() => onEditJob(job)}
                          title="Change Job Title, Requirements, Experience & Salary"
                          className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {job.description && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[10px] font-bold text-slate-500 self-center mr-1">Skills:</span>
                    {job.requiredSkills.map((sk, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
