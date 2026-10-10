import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import type { Candidate } from '../types';

interface EditCandidateSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  onSaveSkills: (candidateId: string, skills: string[]) => void;
}

const COMMON_TECH_SKILLS = [
  "Python", "React", "TypeScript", "JavaScript", "SQL", "Docker", "Kubernetes",
  "AWS", "FastAPI", "Node.js", "Java", "Spring Boot", "PostgreSQL", "Machine Learning",
  "PyTorch", "TensorFlow", "CI/CD", "Next.js", "Tailwind CSS", "Redis", "MongoDB", "Git"
];

export const EditCandidateSkillsModal: React.FC<EditCandidateSkillsModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onSaveSkills,
}) => {
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [newSkillText, setNewSkillText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (candidate) {
      setSkillsList([...(candidate.skills || [])]);
      setNewSkillText('');
      setSaveSuccess(false);
    }
  }, [candidate]);

  if (!isOpen || !candidate) return null;

  const handleAddSkill = (skillToAdd?: string) => {
    const text = (skillToAdd || newSkillText).trim();
    if (!text) return;
    if (!skillsList.some(s => s.toLowerCase() === text.toLowerCase())) {
      setSkillsList(prev => [...prev, text]);
    }
    if (!skillToAdd) {
      setNewSkillText('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(prev => prev.filter(s => s.toLowerCase() !== skillToRemove.toLowerCase()));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSkills(candidate.id, skillsList);
      setSaveSuccess(true);
      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(false);
        onClose();
      }, 600);
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-white/20 text-white rounded text-[10px] font-black uppercase tracking-wider">
                Recruiter Skill Editor
              </span>
              <span className="text-xs text-blue-200 font-medium">Synced with MySQL</span>
            </div>
            <h3 className="text-lg font-extrabold mt-1 text-white">
              Edit Skills for {candidate.fullName}
            </h3>
            <p className="text-xs text-blue-100 font-medium mt-0.5">
              {candidate.currentRole} • {candidate.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Active Skills Tag List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Current Technical Skills ({skillsList.length})
              </label>
              {skillsList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSkillsList([])}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl min-h-[90px] flex flex-wrap gap-2 items-center">
              {skillsList.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No skills listed yet. Add skills below.</p>
              ) : (
                skillsList.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 rounded-lg text-xs font-bold transition-all shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="w-4 h-4 rounded-full bg-blue-200 hover:bg-rose-500 hover:text-white flex items-center justify-center text-[11px] font-black leading-none transition-colors cursor-pointer"
                      title={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Add Custom Skill Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Add New Skill
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillText}
                onChange={e => setNewSkillText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Type skill name (e.g. Next.js, GraphQL, PyTorch)..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                disabled={!newSkillText.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Quick-Add Popular Technical Skills */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">
              Quick Suggestions (Click to Add):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TECH_SKILLS.filter(s => !skillsList.some(curr => curr.toLowerCase() === s.toLowerCase())).slice(0, 12).map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddSkill(s)}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Qualification Benchmark Hint */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Recruiter Tip:</span>
            </p>
            <p className="text-[11px] text-blue-800">
              Saving updates this candidate's profile and saves into MySQL tables (<code>candidates</code> and <code>candidate_skills</code>). Recruiter matching algorithms will recalculate automatically.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <span>Saving & Syncing to MySQL...</span>
            ) : saveSuccess ? (
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Saved Successfully!</span>
            ) : (
              <span>Save Skills to Database →</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
