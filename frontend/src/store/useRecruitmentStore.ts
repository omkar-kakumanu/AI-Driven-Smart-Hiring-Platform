import { useState, useEffect } from 'react';
import type { Job, Candidate, InterviewQuestion, ATSProvider, UserProfile, UserAccount } from '../types';

import { INITIAL_JOBS, INITIAL_QUESTIONS, INITIAL_ATS_PROVIDERS } from '../services/mockData';

export function useRecruitmentStore() {
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('rc_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    // Clear existing mock resumes to start fresh as requested
    const saved = localStorage.getItem('rc_candidates');
    return saved ? JSON.parse(saved) : [];
  });

  const INITIAL_USERS: UserAccount[] = [
    {
      id: 'usr-admin-1',
      name: 'Alex Vance (Main Super-Admin)',
      email: 'admin@copilot.com',
      role: 'System Administrator & Hiring Director',
      userType: 'ADMIN',
      status: 'APPROVED',
      createdAt: '2026-01-10',
      password: 'admin123',
      isSuperAdmin: true
    },
    {
      id: 'usr-admin-2',
      name: 'Elena Rostova (Secondary Admin)',
      email: 'elena.admin@copilot.com',
      role: 'Security & Platform Administrator',
      userType: 'ADMIN',
      status: 'APPROVED',
      createdAt: '2026-01-15',
      password: 'admin123',
      isSuperAdmin: false
    },

    {
      id: 'usr-recruiter-1',
      name: 'Sarah Jenkins',
      email: 'recruiter@copilot.com',
      role: 'Talent Acquisition Specialist',
      userType: 'USER',
      status: 'APPROVED',
      createdAt: '2026-02-01',
      password: 'recruiter123'
    },
    {
      id: 'usr-pending-1',
      name: 'Michael Chang',
      email: 'michael.chang@company.com',
      role: 'Junior Technical Recruiter',
      userType: 'USER',
      status: 'PENDING',
      createdAt: '2026-08-30',
      password: 'pass123'
    }
  ];

  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('rc_user_accounts');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });


  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('rc_user_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Sarah Jenkins',
      role: 'Talent Acquisition Specialist',
      email: 'recruiter@copilot.com',
      userType: 'USER',
      status: 'APPROVED'
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
    localStorage.setItem('rc_user_accounts', JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    localStorage.setItem('rc_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const approveUser = (userId: string) => {
    setUserAccounts(prev => prev.map(u => u.id === userId ? { ...u, status: 'APPROVED' as const } : u));
  };

  const rejectUser = (userId: string) => {
    setUserAccounts(prev => prev.map(u => u.id === userId ? { ...u, status: 'REJECTED' as const } : u));
  };

  const revokeUserAccess = (userId: string) => {
    setUserAccounts(prev => prev.map(u => {
      if (u.id === userId) {
        if (u.isSuperAdmin) return u; // Main Super Admin cannot be revoked
        return { ...u, status: 'REVOKED' as const };
      }
      return u;
    }));
  };


  const makeUserAdmin = (userId: string) => {
    setUserAccounts(prev => prev.map(u => u.id === userId ? { ...u, userType: 'ADMIN' as const, status: 'APPROVED' as const } : u));
  };

  const clearAllCandidates = () => {
    setCandidates([]);
    setActiveCandidateId('');
    localStorage.removeItem('rc_candidates');
  };

  const registerUser = (name: string, email: string, role: string, password?: string) => {
    const existing = userAccounts.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return existing;

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: role || 'Recruiter',
      userType: 'USER',
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0],
      password: password || 'pass123'
    };

    setUserAccounts(prev => [...prev, newUser]);
    return newUser;
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
    userAccounts,
    approveUser,
    rejectUser,
    revokeUserAccess,
    makeUserAdmin,
    registerUser,
    clearAllCandidates,
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


