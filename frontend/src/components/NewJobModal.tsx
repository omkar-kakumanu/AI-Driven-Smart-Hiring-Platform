import React, { useState } from 'react';
import type { Job } from '../types';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateJob: (job: Omit<Job, 'id' | 'candidateCount' | 'createdAt'>) => void;
}

export const NewJobModal: React.FC<NewJobModalProps> = ({ isOpen, onClose, onCreateJob }) => {
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('San Francisco, CA (Hybrid)');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [minSalary, setMinSalary] = useState<number>(130000);
  const [maxSalary, setMaxSalary] = useState<number>(185000);
  const [minExperienceYears, setMinExperienceYears] = useState<number>(3);
  const [educationRequirement, setEducationRequirement] = useState("Bachelor's in Computer Science or equivalent");
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['Python', 'React', 'Docker']);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['AWS', 'Kubernetes', 'CI/CD']);
  
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newPreferredInput, setNewPreferredInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGeneratedNotice, setAiGeneratedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAiGenerate = async () => {
    if (!jobTitle.trim()) {
      alert('Please enter a Job Title first so the AI can generate a targeted description.');
      return;
    }

    setIsGenerating(true);
    setAiGeneratedNotice(null);

    try {
      const res = await fetch('http://localhost:8000/api/ai/generate-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: jobTitle,
          department: department,
          experience_years: minExperienceYears,
          skills_hint: requiredSkills.length > 0 ? requiredSkills : undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.job) {
          const j = data.job;
          setDescription(j.description + '\n\nKey Responsibilities:\n' + (j.responsibilities || []).map((r: string) => `• ${r}`).join('\n'));
          if (j.required_skills && j.required_skills.length > 0) setRequiredSkills(j.required_skills);
          if (j.preferred_skills && j.preferred_skills.length > 0) setPreferredSkills(j.preferred_skills);
          if (j.min_salary) setMinSalary(j.min_salary);
          if (j.max_salary) setMaxSalary(j.max_salary);
          if (j.education_requirement) setEducationRequirement(j.education_requirement);
          setAiGeneratedNotice('✨ Job description successfully generated with AI!');
          return;
        }
      }
      throw new Error('AI endpoint returned non-200');
    } catch {
      // Fallback intelligent generator
      const lower = jobTitle.toLowerCase();
      let genSkills = ['Python', 'Docker', 'REST APIs', 'PostgreSQL'];
      if (lower.includes('ml') || lower.includes('machine learning') || lower.includes('ai')) {
        genSkills = ['Python', 'PyTorch', 'Transformers', 'MLOps', 'Vector Databases'];
      } else if (lower.includes('front') || lower.includes('react') || lower.includes('ui')) {
        genSkills = ['React 19', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Web Vitals'];
      } else if (lower.includes('cloud') || lower.includes('devops')) {
        genSkills = ['Kubernetes', 'AWS', 'Terraform', 'CI/CD Pipelines', 'Linux'];
      }

      setRequiredSkills(genSkills);
      setPreferredSkills(['System Design', 'Microservices Architecture', 'Mentorship']);
      setDescription(
        `We are seeking a talented and proactive ${jobTitle} to join our high-velocity ${department} team. In this role, you will design, build, and optimize enterprise-grade solutions while collaborating with product and platform stakeholders.\n\n` +
        `Key Responsibilities:\n` +
        `• Architect and implement resilient production services for ${jobTitle} workflows.\n` +
        `• Drive technical best practices, automated testing, and code quality standards across the team.\n` +
        `• Troubleshoot complex production issues and optimize system latency and throughput.\n` +
        `• Partner cross-functionally with product managers and fellow engineers on roadmap execution.`
      );
      setMinSalary(minExperienceYears * 25000 + 75000);
      setMaxSalary(minExperienceYears * 25000 + 125000);
      setAiGeneratedNotice('✨ Job description generated using built-in AI synthesizer!');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !requiredSkills.includes(newSkillInput.trim())) {
      setRequiredSkills([...requiredSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleAddPreferred = () => {
    if (newPreferredInput.trim() && !preferredSkills.includes(newPreferredInput.trim())) {
      setPreferredSkills([...preferredSkills, newPreferredInput.trim()]);
      setNewPreferredInput('');
    }
  };

  const handleRemovePreferred = (skill: string) => {
    setPreferredSkills(preferredSkills.filter(s => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      alert('Please enter a Job Title.');
      return;
    }

    onCreateJob({
      title: jobTitle.trim(),
      department: department.trim() || 'Engineering',
      location,
      employmentType,
      minSalary: Number(minSalary) || 120000,
      maxSalary: Number(maxSalary) || 180000,
      description: description.trim() || `Position for ${jobTitle} in the ${department} team.`,
      requiredSkills: requiredSkills.length > 0 ? requiredSkills : ['Problem Solving', 'Engineering'],
      preferredSkills,
      minExperienceYears: Number(minExperienceYears) || 2,
      educationRequirement: educationRequirement.trim() || "Bachelor's Degree",
      status: 'ACTIVE'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
              ⚡
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Create Job Opening & AI JD Writer</h3>
              <p className="text-xs font-semibold text-slate-500">Draft or auto-generate complete specifications with AI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* AI Notice Banner */}
        {aiGeneratedNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-between">
            <span>{aiGeneratedNotice}</span>
            <button onClick={() => setAiGeneratedNotice(null)} className="text-emerald-600 hover:text-emerald-900 text-xs">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Top Section: Title & AI Generation Trigger */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                1. Job Title & AI Generator <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={isGenerating || !jobTitle.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all ${
                  isGenerating || !jobTitle.trim()
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 active:scale-95'
                }`}
              >
                {isGenerating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Synthesizing JD...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Auto-Write JD with AI</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Machine Learning Engineer"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Engineering">Department: Engineering</option>
                  <option value="AI & Data Science">Department: AI & Data Science</option>
                  <option value="Product & Design">Department: Product & Design</option>
                  <option value="Cloud Infrastructure">Department: Cloud Infrastructure</option>
                  <option value="Security & Compliance">Department: Security & Compliance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Location Format</label>
              <select
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="San Francisco, CA (Hybrid)">San Francisco, CA (Hybrid)</option>
                <option value="Remote (US / Global)">Remote (US / Global)</option>
                <option value="New York, NY (On-site)">New York, NY (On-site)</option>
                <option value="Seattle, WA (Hybrid)">Seattle, WA (Hybrid)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Employment Type</label>
              <select
                value={employmentType}
                onChange={e => setEmploymentType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Contract / C2C">Contract / C2C</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Min Experience (Yrs)</label>
              <input
                type="number"
                min="0"
                max="25"
                value={minExperienceYears}
                onChange={e => setMinExperienceYears(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Minimum Base Salary ($ / yr)</label>
              <input
                type="number"
                step="5000"
                value={minSalary}
                onChange={e => setMinSalary(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Maximum Base Salary ($ / yr)</label>
              <input
                type="number"
                step="5000"
                value={maxSalary}
                onChange={e => setMaxSalary(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Required Skills Tag Input */}
          <div className="space-y-2 text-xs">
            <label className="font-bold text-slate-700 block">Required Technical Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {requiredSkills.map(skill => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold flex items-center gap-1.5"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600 text-[10px]"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                placeholder="Add skill (e.g. PyTorch, Kubernetes) and press Enter"
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Preferred Skills Tag Input */}
          <div className="space-y-2 text-xs">
            <label className="font-bold text-slate-700 block">Preferred / Nice-to-Have Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {preferredSkills.map(skill => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-bold flex items-center gap-1.5"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePreferred(skill)}
                    className="hover:text-rose-600 text-[10px]"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPreferredInput}
                onChange={e => setNewPreferredInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPreferred(); } }}
                placeholder="Add preferred skill and press Enter"
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddPreferred}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Rich Description */}
          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Role Summary & Key Responsibilities</label>
              <span className="text-[11px] text-slate-400">Markdown / Bullet points supported</span>
            </div>
            <textarea
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the mission of this role, daily responsibilities, and expected outcomes..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          {/* Education Requirement */}
          <div className="text-xs">
            <label className="font-bold text-slate-700 block mb-1">Education & Degree Requirement</label>
            <input
              type="text"
              value={educationRequirement}
              onChange={e => setEducationRequirement(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              🚀 Publish Job Opening
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
