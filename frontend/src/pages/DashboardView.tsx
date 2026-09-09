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
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 font-bold text-xs">
            Recruitment Operations & Analytics
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Automated Candidate Profiling & Analytics</h2>
          <p className="text-slate-400 text-sm">
            Process candidate resumes, analyze skill alignment against open job descriptions, and evaluate data visualizations.
          </p>
        </div>

        <button 
          onClick={() => onNavigate('candidates')}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all whitespace-nowrap"
        >
          Upload Resume & View Candidates →
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

      {/* Data Visualization Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Candidate Skill Distribution Pie Chart */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Candidate Skill Distribution (Pie Chart)</h3>
            <span className="text-xs font-bold text-slate-500">Top Technical Skills</span>
          </div>

          <div className="h-64 w-full pt-2">
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
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Candidate Match Score Distribution (Bar Graph)</h3>
            <span className="text-xs font-bold text-slate-500">Compatibility Ranges</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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
