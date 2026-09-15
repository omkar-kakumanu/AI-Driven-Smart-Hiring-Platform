import { useState, useEffect } from 'react';
import type { Job, Candidate, InterviewQuestion, ATSProvider, UserProfile, UserAccount } from '../types';

import { INITIAL_JOBS, INITIAL_CANDIDATES, INITIAL_QUESTIONS, INITIAL_ATS_PROVIDERS } from '../services/mockData';

export function useRecruitmentStore() {
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('rc_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('rc_candidates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_CANDIDATES;
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
    }
  ];

  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('rc_user_accounts');
    let accounts: UserAccount[] = INITIAL_USERS;
    if (saved) {
      try {
        const parsed: UserAccount[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          accounts = parsed;
        }
      } catch (e) {
        accounts = INITIAL_USERS;
      }
    }

    // Always guarantee Super Admin account admin@copilot.com exists in userAccounts with valid credentials
    const adminIndex = accounts.findIndex(u => u.id === 'usr-admin-1' || u.email.toLowerCase() === 'admin@copilot.com');
    if (adminIndex >= 0) {
      accounts[adminIndex] = {
        ...accounts[adminIndex],
        id: 'usr-admin-1',
        name: accounts[adminIndex].name || 'Alex Vance (Main Super-Admin)',
        email: 'admin@copilot.com',
        userType: 'ADMIN',
        status: 'APPROVED',
        isSuperAdmin: true,
        password: 'admin123'
      };
    } else {
      accounts.unshift(INITIAL_USERS[0]);
    }

    return accounts;
  });


  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('rc_user_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Alex Vance (Main Super-Admin)',
      role: 'System Administrator & Hiring Director',
      email: 'admin@copilot.com',
      userType: 'ADMIN',
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
    setUserProfile(prev => {
      const updated = { ...prev, ...updates };
      setUserAccounts(prevAccounts => prevAccounts.map(u => {
        if (u.email.toLowerCase() === prev.email.toLowerCase() || (updates.email && u.email.toLowerCase() === updates.email.toLowerCase())) {
          return {
            ...u,
            name: updates.name || u.name,
            role: updates.role || u.role,
            email: updates.email || u.email
          };
        }
        return u;
      }));
      return updated;
    });
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
        if (u.isSuperAdmin || u.email.toLowerCase() === 'admin@copilot.com') return u; // Single Main Admin protected
        return { ...u, status: 'REVOKED' as const };
      }
      return u;
    }));
  };

  const deleteUserAccount = (userId: string) => {
    setUserAccounts(prev => prev.filter(u => u.id !== userId && !u.isSuperAdmin && u.email.toLowerCase() !== 'admin@copilot.com'));
  };

  const makeUserAdmin = (userId: string) => {
    // Single Admin Policy: Keep only Alex Vance as Admin, or explicitly confirm transfer
    setUserAccounts(prev => prev.map(u => u.id === userId ? { ...u, userType: 'ADMIN' as const, status: 'APPROVED' as const } : u));
  };

  const clearAllCandidates = () => {
    setCandidates([]);
    setActiveCandidateId('');
    localStorage.removeItem('rc_candidates');
  };

  const clearAllUserAccounts = () => {
    setUserAccounts(INITIAL_USERS);
    localStorage.setItem('rc_user_accounts', JSON.stringify(INITIAL_USERS));
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

  const addSkillToCandidate = (candidateId: string, newSkill: string) => {
    const trimmedSkill = newSkill.trim();
    if (!trimmedSkill) return;

    setCandidates(prev => prev.map(cand => {
      if (cand.id === candidateId) {
        const existingSkills = cand.skills || [];
        // Prevent duplicate skill addition (case-insensitive check)
        if (existingSkills.some(s => s.toLowerCase() === trimmedSkill.toLowerCase())) {
          return cand;
        }
        const updatedSkills = [...existingSkills, trimmedSkill];
        const activeJob = jobs.find(j => j.id === activeJobId) || jobs[0];
        const newScore = calculateMatchScore(updatedSkills, activeJob?.requiredSkills || []);

        return {
          ...cand,
          skills: updatedSkills,
          matchScore: newScore,
          headline: cand.headline ? cand.headline : `${cand.currentRole} with experience in ${updatedSkills.slice(0, 3).join(', ')}`
        };
      }
      return cand;
    }));
  };

  const removeSkillFromCandidate = (candidateId: string, skillToRemove: string) => {
    setCandidates(prev => prev.map(cand => {
      if (cand.id === candidateId) {
        const updatedSkills = (cand.skills || []).filter(s => s.toLowerCase() !== skillToRemove.toLowerCase());
        const activeJob = jobs.find(j => j.id === activeJobId) || jobs[0];
        const newScore = calculateMatchScore(updatedSkills, activeJob?.requiredSkills || []);

        return {
          ...cand,
          skills: updatedSkills,
          matchScore: newScore
        };
      }
      return cand;
    }));
  };

  const updateCandidateRoleAndExperience = (candidateId: string, newRole: string, newExperienceYears: number) => {
    setCandidates(prev => prev.map(cand => {
      if (cand.id === candidateId) {
        const activeJob = jobs.find(j => j.id === activeJobId) || jobs[0];
        const newScore = calculateMatchScore(cand.skills, activeJob?.requiredSkills || []);
        return {
          ...cand,
          currentRole: newRole,
          totalExperienceYears: newExperienceYears,
          headline: `${newRole} with ${newExperienceYears} years experience in ${(cand.skills || []).slice(0, 3).join(', ')}`,
          matchScore: newScore
        };
      }
      return cand;
    }));
  };

  const updateCandidateStatusByEmail = (email: string, status: Candidate['status']) => {
    setCandidates(prev => prev.map(cand => {
      if (cand.email.toLowerCase() === email.toLowerCase()) {
        return { ...cand, status };
      }
      return cand;
    }));
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
    deleteUserAccount,
    makeUserAdmin,
    registerUser,
    clearAllCandidates,
    clearAllUserAccounts,
    questions,
    atsProviders,
    activeJobId,
    setActiveJobId,
    activeCandidateId,

    setActiveCandidateId,
    addCandidate,
    addJob,
    updateCandidateStatus,
    updateCandidateStatusByEmail,
    deleteCandidate,
    addSkillToCandidate,
    removeSkillFromCandidate,
    updateCandidateRoleAndExperience
  };
}


