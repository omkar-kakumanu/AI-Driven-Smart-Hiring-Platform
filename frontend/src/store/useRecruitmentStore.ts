import { useState, useEffect } from 'react';
import type { Job, Candidate, InterviewQuestion, ATSProvider, UserProfile } from '../types';
import { INITIAL_JOBS, INITIAL_QUESTIONS, INITIAL_ATS_PROVIDERS } from '../services/mockData';

export function useRecruitmentStore() {
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('rc_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('rc_candidates');
    return saved ? JSON.parse(saved) : [];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('rc_user_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Sarah Jenkins',
      role: 'Lead Recruiter (Admin)',
      email: 'sarah.jenkins@company.com'
    };
  });

  const [questions] = useState<InterviewQuestion[]>(INITIAL_QUESTIONS);
  const [atsProviders] = useState<ATSProvider[]>(INITIAL_ATS_PROVIDERS);
  const [activeJobId, setActiveJobId] = useState<string>(jobs[0]?.id || '');
  const [activeCandidateId, setActiveCandidateId] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('rc_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('rc_candidates', JSON.stringify(candidates));
    if (candidates.length > 0 && !activeCandidateId) {
      setActiveCandidateId(candidates[0].id);
    }
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('rc_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const addCandidate = (newCandidate: Omit<Candidate, 'id' | 'status' | 'matchScore'>) => {
    const candidateId = `cand-${Date.now()}`;
    const candidate: Candidate = {
      ...newCandidate,
      id: candidateId,
      status: 'Applied',
      matchScore: calculateMatchScore(newCandidate.skills, jobs.find(j => j.id === activeJobId)?.requiredSkills || [])
    };

    setCandidates(prev => [candidate, ...prev]);
    setActiveCandidateId(candidateId);
    return candidate;
  };

  const addJob = (newJob: Omit<Job, 'id' | 'candidateCount' | 'createdAt'>) => {
    const jobId = `job-${Date.now()}`;
    const job: Job = {
      ...newJob,
      id: jobId,
      candidateCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setJobs(prev => [job, ...prev]);
    setActiveJobId(jobId);
    return job;
  };

  const updateCandidateStatus = (candidateId: string, status: Candidate['status']) => {
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status } : c));
  };

  const deleteCandidate = (candidateId: string) => {
    setCandidates(prev => prev.filter(c => c.id !== candidateId));
    if (activeCandidateId === candidateId) {
      setActiveCandidateId(candidates.find(c => c.id !== candidateId)?.id || '');
    }
  };

  const calculateMatchScore = (candidateSkills: string[], requiredSkills: string[]): number => {
    if (!requiredSkills || requiredSkills.length === 0) return 85;
    const candSkillsLower = candidateSkills.map(s => s.toLowerCase());
    const reqSkillsLower = requiredSkills.map(s => s.toLowerCase());
    const matched = reqSkillsLower.filter(s => candSkillsLower.includes(s));
    const score = Math.round((matched.length / reqSkillsLower.length) * 100);
    return score > 0 ? Math.min(98, Math.max(50, score)) : 65;
  };

  return {
    jobs,
    candidates,
    userProfile,
    updateUserProfile,
    questions,
    atsProviders,
    activeJobId,
    setActiveJobId,
    activeCandidateId,
    setActiveCandidateId,
    addCandidate,
    addJob,
    updateCandidateStatus,
    deleteCandidate
  };
}

