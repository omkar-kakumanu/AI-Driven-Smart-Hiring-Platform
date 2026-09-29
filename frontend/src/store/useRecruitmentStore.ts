import { useState, useEffect } from 'react';
import type { Job, Candidate, InterviewQuestion, ATSProvider, UserProfile, UserAccount, CandidateInterviewResponse, ScheduledInterview, CandidateNotification } from '../types';

import { INITIAL_JOBS, INITIAL_CANDIDATES, INITIAL_QUESTIONS, INITIAL_ATS_PROVIDERS } from '../services/mockData';

const normalizeIndianJob = (job: Job): Job => {
  let location = job.location || 'Bengaluru, Karnataka (Hybrid)';
  if (location.includes('San Francisco') || location.includes('CA')) location = 'Bengaluru, Karnataka (Hybrid)';
  else if (location.includes('Austin') || location.includes('TX')) location = 'Hyderabad, Telangana (Hybrid)';
  else if (location.includes('Seattle') || location.includes('WA')) location = 'Pune, Maharashtra (Hybrid)';
  else if (location.includes('New York') || location.includes('NY')) location = 'Gurugram, Delhi NCR (Hybrid)';
  else if (location.includes('Chicago') || location.includes('IL')) location = 'Chennai, Tamil Nadu (Hybrid)';
  else if (location.includes('Denver') || location.includes('CO')) location = 'Noida, Delhi NCR (Remote)';
  else if (location.includes('Los Angeles')) location = 'Mumbai, Maharashtra (Hybrid)';
  else if (location.includes('Washington')) location = 'Bengaluru, Karnataka (Whitefield)';

  let minSalary = job.minSalary || 1600000;
  let maxSalary = job.maxSalary || 2600000;
  // If stored in US dollar scale (< 1,000,000, e.g. 140000 for $140k), convert to Indian LPA * 10
  if (minSalary > 0 && minSalary < 1000000) {
    minSalary = minSalary * 10;
  }
  if (maxSalary > 0 && maxSalary < 1000000) {
    maxSalary = maxSalary * 10;
  }

  return {
    ...job,
    location,
    minSalary,
    maxSalary
  };
};

export const isStaffOrAdminEmailOrRole = (
  email?: string,
  name?: string,
  role?: string,
  userType?: string,
  accounts?: UserAccount[]
): boolean => {
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanName = (name || '').toLowerCase().trim();
  const cleanRole = (role || '').toLowerCase().trim();

  // 1. Explicit admin/recruiter emails
  if (
    cleanEmail === 'admin@copilot.com' ||
    cleanEmail === 'recruiter@copilot.com' ||
    cleanEmail === 'j.manju.raghvin@gmail.com' ||
    cleanEmail === 'sarah.jenkins@gmail.com'
  ) {
    return true;
  }

  // 2. Generic staff keywords in email
  if (cleanEmail.includes('admin') || cleanEmail.includes('recruiter')) {
    return true;
  }

  // 3. User type ADMIN
  if (userType === 'ADMIN') {
    return true;
  }

  // 4. Staff name checks
  if (
    cleanName.includes('j manju raghvin') ||
    cleanName.includes('super-admin') ||
    cleanName.includes('administrator') ||
    cleanName.includes('sarah jenkins')
  ) {
    return true;
  }

  // 5. Staff role checks
  if (
    cleanRole.includes('administrator') ||
    cleanRole.includes('hiring director') ||
    cleanRole.includes('talent acquisition') ||
    cleanRole.includes('lead recruiter') ||
    cleanRole.includes('system admin')
  ) {
    return true;
  }

  // 6. Registered user accounts lookup
  if (accounts && cleanEmail) {
    const found = accounts.find(u => u.email.toLowerCase() === cleanEmail);
    if (found && (found.userType === 'ADMIN' || found.isSuperAdmin || found.role?.toLowerCase().includes('admin') || found.role?.toLowerCase().includes('recruiter'))) {
      return true;
    }
  }

  return false;
};

const safeStorageSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`LocalStorage write skipped for ${key}:`, err);
  }
};

export function useRecruitmentStore() {
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('rc_jobs');
    let loadedJobs = INITIAL_JOBS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedJobs = parsed;
        }
      } catch (e) {
        // Fallback
      }
    }
    const normalized = loadedJobs.map(normalizeIndianJob);
    localStorage.setItem('rc_jobs', JSON.stringify(normalized));
    return normalized;
  });

  useEffect(() => {
    localStorage.setItem('rc_jobs', JSON.stringify(jobs));
  }, [jobs]);

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('rc_candidates');
    let cands: Candidate[] = INITIAL_CANDIDATES;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) cands = parsed;
      } catch (e) {}
    }

    // 1. Strict Staff & Admin purge: Under no circumstances should an Admin or Recruiter exist in candidates
    cands = cands.filter(c => !isStaffOrAdminEmailOrRole(c.email, c.fullName, c.currentRole));

    // 2. Purge rogue "Abhishek Ai Ml Resume 1" candidate records
    cands = cands.filter(c => {
      const n = (c.fullName || '').toLowerCase();
      return !n.includes('abhishek ai ml resume') && n !== 'abhishek ai ml resume 1';
    });
    
    // Ensure all standard initial candidates are preserved and never collapsed
    const existingIds = new Set(cands.map(c => c.id));
    const missing = INITIAL_CANDIDATES.filter(ic => !existingIds.has(ic.id));
    if (missing.length > 0) {
      cands = [...cands, ...missing];
    }

    const initialMap = new Map(INITIAL_CANDIDATES.map(ic => [ic.id, ic]));
    let cand1CustomName = localStorage.getItem('rc_name_candidate@copilot.com') ||
      localStorage.getItem('rc_name_sarah.johnson@example.com') ||
      localStorage.getItem('rc_name_cand-1');
    const cand1CustomAvatar = localStorage.getItem('rc_avatar_candidate@copilot.com') ||
      localStorage.getItem('rc_avatar_sarah.johnson@example.com') ||
      localStorage.getItem('rc_avatar_cand-1');

    // Clean up if cand1 was contaminated with rogue "Abhishek Ai Ml Resume 1"
    if (cand1CustomName && (cand1CustomName.toLowerCase().includes('abhishek ai ml resume') || cand1CustomName.toLowerCase().includes('resume 1'))) {
      localStorage.removeItem('rc_name_candidate@copilot.com');
      localStorage.removeItem('rc_name_sarah.johnson@example.com');
      localStorage.removeItem('rc_name_cand-1');
      cand1CustomName = null;
    }

    const sanitized = cands.map(c => {
      const cMail = (c.email || '').toLowerCase();
      const orig = initialMap.get(c.id);
      const isCand1 = c.id === 'cand-1' || cMail === 'candidate@copilot.com' || cMail === 'sarah.johnson@example.com';
      
      if (isCand1) {
        return {
          ...c,
          id: 'cand-1',
          fullName: (cand1CustomName && cand1CustomName.trim()) ? cand1CustomName.trim() : (c.fullName && c.fullName !== 'Candidate' ? c.fullName : 'Sarah Johnson'),
          email: c.email || 'sarah.johnson@example.com',
          avatar: cand1CustomAvatar || c.avatar
        };
      }

      if (orig) {
        // Standard initial candidates (cand-2..cand-6: Alex Chen, Emily Rodriguez, Marcus Vance, Elena Rostova, Priya Sharma):
        // Only accept a custom name if explicitly saved for this specific email/id and not contaminated with cand-1
        const specificCustomName = localStorage.getItem(`rc_name_${cMail}`) || localStorage.getItem(`rc_name_${c.id}`);
        const isContaminated = 
          c.fullName === 'Sarah Johnson' || 
          (cand1CustomName && c.fullName.toLowerCase() === cand1CustomName.toLowerCase()) ||
          !c.fullName || 
          c.fullName.trim() === '' ||
          c.fullName === 'Candidate' ||
          c.fullName.toLowerCase().includes('abhishek ai ml resume');

        const cleanName = (specificCustomName && specificCustomName.trim() && !isContaminated)
          ? specificCustomName.trim()
          : (isContaminated ? orig.fullName : (c.fullName || orig.fullName));

        const savedSpecificAvatar = localStorage.getItem(`rc_avatar_${cMail}`) || localStorage.getItem(`rc_avatar_${c.id}`);

        return {
          ...orig,
          ...c,
          fullName: cleanName,
          email: orig.email,
          currentRole: c.currentRole || orig.currentRole,
          skills: (c.skills && c.skills.length > 0) ? c.skills : orig.skills,
          avatar: savedSpecificAvatar || c.avatar || orig.avatar
        };
      }

      // User-uploaded candidate (e.g. cand-1727...)
      return c;
    });

    // Guard against any remaining duplicate names among standard candidates
    const finalCand1Name = sanitized.find(c => c.id === 'cand-1')?.fullName || 'Sarah Johnson';
    const cleanCandidates = sanitized.map(c => {
      if (c.id !== 'cand-1') {
        const orig = initialMap.get(c.id);
        if (orig && (c.fullName.toLowerCase() === finalCand1Name.toLowerCase() || c.fullName.toLowerCase() === 'sarah johnson')) {
          return { ...c, fullName: orig.fullName };
        }
      }
      return c;
    });

    localStorage.setItem('rc_candidates', JSON.stringify(cleanCandidates));
    return cleanCandidates;
  });

  useEffect(() => {
    localStorage.setItem('rc_candidates', JSON.stringify(candidates));
  }, [candidates]);

  const INITIAL_USERS: UserAccount[] = [
    {
      id: 'usr-admin-1',
      name: 'J Manju Raghvin (Main Super-Admin)',
      email: 'admin@copilot.com',
      role: 'System Administrator & Hiring Director',
      userType: 'ADMIN',
      status: 'APPROVED',
      createdAt: '2026-01-10',
      password: 'admin123',
      isSuperAdmin: true
    },
    {
      id: 'usr-recruiter-1',
      name: 'Sarah Jenkins',
      email: 'recruiter@copilot.com',
      role: 'Talent Acquisition Specialist',
      userType: 'USER',
      status: 'APPROVED',
      createdAt: '2026-01-12',
      password: 'recruiter123'
    },
    {
      id: 'usr-cand-1',
      name: 'Sarah Johnson (Candidate)',
      email: 'candidate@copilot.com',
      role: 'Candidate Applicant',
      userType: 'USER',
      status: 'APPROVED',
      createdAt: '2026-02-15',
      password: 'candidate123'
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

    // Always guarantee Super Admin account admin@copilot.com exists with J Manju Raghvin
    const adminIndex = accounts.findIndex(u => u.id === 'usr-admin-1' || u.email.toLowerCase() === 'admin@copilot.com');
    if (adminIndex >= 0) {
      const curName = accounts[adminIndex].name;
      const finalName = (!curName || curName.includes('Alex Vance')) ? 'J Manju Raghvin (Main Super-Admin)' : curName;
      accounts[adminIndex] = {
        ...accounts[adminIndex],
        id: 'usr-admin-1',
        name: finalName,
        email: 'admin@copilot.com',
        userType: 'ADMIN',
        status: 'APPROVED',
        isSuperAdmin: true,
        password: 'admin123'
      };
    } else {
      accounts.unshift(INITIAL_USERS[0]);
    }

    // Ensure each account has its own isolated avatar and persisted custom name
    accounts = accounts.map(u => {
      const uMail = u.email.toLowerCase();
      const savedName = localStorage.getItem(`rc_name_${uMail}`) ||
        ((uMail === 'candidate@copilot.com' || uMail === 'sarah.johnson@example.com' || u.id === 'usr-cand-1')
          ? (localStorage.getItem('rc_name_candidate@copilot.com') || localStorage.getItem('rc_name_sarah.johnson@example.com'))
          : null);
      return {
        ...u,
        name: (savedName && savedName.trim()) ? savedName.trim() : u.name,
        avatar: u.avatar || localStorage.getItem(`rc_avatar_${uMail}`) || undefined
      };
    });

    return accounts;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('rc_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.name.includes('Alex Vance')) {
          parsed.name = 'J Manju Raghvin (Main Super-Admin)';
          localStorage.setItem('rc_user_profile', JSON.stringify(parsed));
        }
        const userEmail = (parsed.email || '').toLowerCase();
        const isCandidateEmail = userEmail === 'candidate@copilot.com' || userEmail === 'sarah.johnson@example.com';
        const perEmailAvatar = localStorage.getItem(`rc_avatar_${userEmail}`) ||
          (isCandidateEmail ? (localStorage.getItem('rc_avatar_candidate@copilot.com') || localStorage.getItem('rc_avatar_sarah.johnson@example.com') || localStorage.getItem('rc_avatar_cand-1')) : null);
        if (perEmailAvatar) {
          parsed.avatar = perEmailAvatar;
        } else if (perEmailAvatar === '') {
          parsed.avatar = undefined;
        }
        const perEmailName = localStorage.getItem(`rc_name_${userEmail}`) ||
          ((userEmail === 'candidate@copilot.com' || userEmail === 'sarah.johnson@example.com')
            ? (localStorage.getItem('rc_name_candidate@copilot.com') || localStorage.getItem('rc_name_sarah.johnson@example.com'))
            : null);
        if (perEmailName && perEmailName.trim()) {
          parsed.name = perEmailName.trim();
        }
        return parsed;
      } catch (e) {}
    }
    const defaultEmail = 'admin@copilot.com';
    const adminAvatar = localStorage.getItem(`rc_avatar_${defaultEmail}`) || undefined;
    return {
      name: 'J Manju Raghvin (Main Super-Admin)',
      role: 'System Administrator & Hiring Director',
      email: defaultEmail,
      userType: 'ADMIN',
      status: 'APPROVED',
      avatar: adminAvatar
    };
  });

  const [questions] = useState<InterviewQuestion[]>(INITIAL_QUESTIONS);
  const [atsProviders] = useState<ATSProvider[]>(INITIAL_ATS_PROVIDERS);
  const [activeJobId, setActiveJobId] = useState<string>(jobs[0]?.id || '');
  const [activeCandidateId, setActiveCandidateId] = useState<string>('');

  const DEFAULT_SCHEDULED_INTERVIEWS: ScheduledInterview[] = [
    {
      id: 'int-101',
      candidateId: 'cand-1',
      candidateName: 'Sarah Johnson',
      candidateEmail: 'candidate@copilot.com',
      candidateRole: 'Senior Full Stack Engineer',
      jobId: 'job-1',
      jobTitle: 'Senior Full Stack Engineer (React/Node)',
      interviewType: 'AI_SCREENING',
      scheduledDate: '2026-09-28',
      scheduledTime: '15:00',
      durationMinutes: 45,
      interviewerName: 'AI Voice Screening Agent',
      meetingLink: 'https://meet.copilot.ai/room/sarah-johnson-ai-screening',
      status: 'CONFIRMED',
      notes: 'Focus on React 19 architecture, asynchronous state, and micro-frontend patterns.',
      createdAt: '2026-09-25'
    },
    {
      id: 'int-102',
      candidateId: 'cand-2',
      candidateName: 'Michael Chen',
      candidateEmail: 'm.chen@example.com',
      candidateRole: 'Senior Machine Learning Specialist',
      jobId: 'job-2',
      jobTitle: 'AI/ML Research Scientist',
      interviewType: 'TECHNICAL',
      scheduledDate: '2026-09-29',
      scheduledTime: '11:00',
      durationMinutes: 60,
      interviewerName: 'Sarah Jenkins (Talent Acquisition)',
      meetingLink: 'https://meet.copilot.ai/room/mchen-tech-deepdive',
      status: 'SCHEDULED',
      notes: 'Transformers, fine-tuning LLMs, and vector search evaluation.',
      createdAt: '2026-09-25'
    }
  ];

  const DEFAULT_NOTIFICATIONS: CandidateNotification[] = [
    {
      id: 'notif-1',
      candidateEmail: 'candidate@copilot.com',
      title: 'Interview Scheduled: AI Voice Screening',
      message: 'Your AI Voice Screening has been confirmed for Sept 28, 2026 at 3:00 PM.',
      type: 'INTERVIEW_INVITE',
      timestamp: '2026-09-25T14:30:00Z',
      isRead: false
    },
    {
      id: 'notif-2',
      candidateEmail: 'candidate@copilot.com',
      title: 'Resume Successfully Parsed',
      message: 'Your resume was analyzed with a 94% job match score for Senior Full Stack Engineer.',
      type: 'SCREENING_RESULT',
      timestamp: '2026-09-25T10:15:00Z',
      isRead: true
    },
    {
      id: 'notif-3',
      candidateEmail: 'candidate@copilot.com',
      title: 'Application Moved to Screening Stage',
      message: 'Recruiter Sarah Jenkins has advanced your profile to the Screened stage.',
      type: 'STATUS_UPDATE',
      timestamp: '2026-09-24T16:00:00Z',
      isRead: true
    }
  ];

  const [scheduledInterviews, setScheduledInterviews] = useState<ScheduledInterview[]>(() => {
    const saved = localStorage.getItem('rc_scheduled_interviews');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_SCHEDULED_INTERVIEWS;
  });

  const [candidateNotifications, setCandidateNotifications] = useState<CandidateNotification[]>(() => {
    const saved = localStorage.getItem('rc_candidate_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('rc_scheduled_interviews', JSON.stringify(scheduledInterviews));
  }, [scheduledInterviews]);

  useEffect(() => {
    localStorage.setItem('rc_candidate_notifications', JSON.stringify(candidateNotifications));
  }, [candidateNotifications]);

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
    safeStorageSet('rc_user_accounts', JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    safeStorageSet('rc_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const targetEmail = (updates.email || prev.email || '').toLowerCase();
      let newAvatar = updates.avatar !== undefined ? updates.avatar : prev.avatar;
      
      if (updates.avatar !== undefined) {
        if (updates.avatar) {
          safeStorageSet(`rc_avatar_${targetEmail}`, updates.avatar);
          if (targetEmail === 'candidate@copilot.com' || targetEmail === 'sarah.johnson@example.com') {
            safeStorageSet('rc_avatar_candidate@copilot.com', updates.avatar);
            safeStorageSet('rc_avatar_sarah.johnson@example.com', updates.avatar);
            safeStorageSet('rc_avatar_cand-1', updates.avatar);
          }
        } else {
          try {
            localStorage.removeItem(`rc_avatar_${targetEmail}`);
            if (targetEmail === 'candidate@copilot.com' || targetEmail === 'sarah.johnson@example.com') {
              localStorage.removeItem('rc_avatar_candidate@copilot.com');
              localStorage.removeItem('rc_avatar_sarah.johnson@example.com');
              localStorage.removeItem('rc_avatar_cand-1');
            }
          } catch (e) {}
          newAvatar = undefined;
        }
      }

      if (updates.name && updates.name.trim()) {
        const cleanName = updates.name.trim();
        safeStorageSet(`rc_name_${targetEmail}`, cleanName);
        if (targetEmail === 'candidate@copilot.com' || targetEmail === 'sarah.johnson@example.com') {
          safeStorageSet('rc_name_candidate@copilot.com', cleanName);
          safeStorageSet('rc_name_sarah.johnson@example.com', cleanName);
          safeStorageSet('rc_name_cand-1', cleanName);
        }
      }

      const updated: UserProfile = {
        ...prev,
        ...updates,
        name: (updates.name && updates.name.trim()) ? updates.name.trim() : prev.name,
        avatar: newAvatar
      };

      setUserAccounts(prevAccounts => prevAccounts.map(u => {
        const uMail = u.email.toLowerCase();
        const matchesTarget = uMail === prev.email.toLowerCase() || 
          (updates.email && uMail === targetEmail) ||
          ((targetEmail === 'candidate@copilot.com' || targetEmail === 'sarah.johnson@example.com') && 
           (uMail === 'candidate@copilot.com' || uMail === 'sarah.johnson@example.com'));

        if (matchesTarget) {
          return {
            ...u,
            name: updates.name ? updates.name.trim() : u.name,
            role: updates.role || u.role,
            email: updates.email || u.email,
            avatar: newAvatar
          };
        }
        return u;
      }));

      setCandidates(prevCands => {
        const isStaff = isStaffOrAdminEmailOrRole(
          targetEmail,
          updates.name || prev.name,
          updates.role || prev.role,
          updates.userType || prev.userType,
          userAccounts
        );

        // Staff & Administrators must NEVER exist as candidates or be ranked in skill gap analysis!
        if (isStaff) {
          return prevCands.filter(c => !isStaffOrAdminEmailOrRole(c.email, c.fullName, c.currentRole, undefined, userAccounts));
        }

        const cExists = prevCands.some(c => c.email.toLowerCase() === targetEmail);
        if (!cExists && targetEmail) {
          const newCandidate: Candidate = {
            id: `cand-${targetEmail.replace(/[^a-z0-9]/g, '-')}`,
            fullName: updates.name ? updates.name.trim() : (prev.name || targetEmail.split('@')[0]),
            email: targetEmail,
            phone: localStorage.getItem(`rc_candidate_prefs_${targetEmail}_phone`) || '+91 98765 43210',
            location: localStorage.getItem(`rc_candidate_prefs_${targetEmail}_city`) || 'Bengaluru, Karnataka',
            currentRole: updates.role || prev.role || 'Full Stack Engineer',
            totalExperienceYears: 3,
            headline: 'Candidate Profile & Engineering Portfolio',
            skills: ['JavaScript', 'React', 'Problem Solving'],
            degree: 'B.Tech / Bachelor Degree',
            institution: 'University',
            status: 'Applied',
            matchScore: 88,
            avatar: newAvatar,
            interviewResponses: []
          };
          return [...prevCands, newCandidate];
        }

        return prevCands.map(c => {
          const cMail = c.email.toLowerCase();
          const matchesCandidate = cMail === targetEmail || 
            ((targetEmail === 'candidate@copilot.com' || targetEmail === 'sarah.johnson@example.com') && 
             (cMail === 'candidate@copilot.com' || cMail === 'sarah.johnson@example.com')) ||
            (c.id === 'cand-1' && (targetEmail === 'candidate@copilot.com' || targetEmail === 'sarah.johnson@example.com'));

          if (matchesCandidate) {
            return {
              ...c,
              fullName: updates.name ? updates.name.trim() : c.fullName,
              avatar: newAvatar
            };
          }
          return c;
        });
      });

      setScheduledInterviews(prev => prev.map(item => {
        const iMail = item.candidateEmail.toLowerCase();
        const matchesCandidate = iMail === targetEmail || 
          ((targetEmail === 'candidate@copilot.com' || targetEmail === 'sarah.johnson@example.com') && 
           (iMail === 'candidate@copilot.com' || iMail === 'sarah.johnson@example.com'));

        if (matchesCandidate && updates.name && updates.name.trim()) {
          return {
            ...item,
            candidateName: updates.name.trim()
          };
        }
        return item;
      }));

      return updated;
    });
  };

  const setUserProfileExplicit = (profile: UserProfile) => {
    const emailLower = (profile.email || '').toLowerCase();
    const perEmailAvatar = localStorage.getItem(`rc_avatar_${emailLower}`);
    const finalAvatar = profile.avatar !== undefined ? profile.avatar : (perEmailAvatar || undefined);
    
    const perEmailName = localStorage.getItem(`rc_name_${emailLower}`) ||
      ((emailLower === 'candidate@copilot.com' || emailLower === 'sarah.johnson@example.com')
        ? (localStorage.getItem('rc_name_candidate@copilot.com') || localStorage.getItem('rc_name_sarah.johnson@example.com'))
        : null);
    const finalName = (perEmailName && perEmailName.trim()) ? perEmailName.trim() : profile.name;

    const finalProfile: UserProfile = {
      ...profile,
      name: finalName,
      avatar: finalAvatar
    };
    setUserProfile(finalProfile);
    localStorage.setItem('rc_user_profile', JSON.stringify(finalProfile));
  };

  const updateCandidateAvatar = (candidateId: string, avatar: string | undefined) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        return { ...c, avatar };
      }
      return c;
    }));
  };

  const deleteCandidateInterviewResponse = (candidateIdOrEmail: string, responseIdOrQuestion: string) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === candidateIdOrEmail || c.email.toLowerCase() === candidateIdOrEmail.toLowerCase()) {
        return {
          ...c,
          interviewResponses: (c.interviewResponses || []).filter(
            r => r.id !== responseIdOrQuestion && r.question !== responseIdOrQuestion
          )
        };
      }
      return c;
    }));
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
    // Single Admin Policy: Keep only J Manju Raghvin as Admin, or explicitly confirm transfer
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
    // Guard: Staff/Admins cannot be added as candidates in directory or skill gap ranking
    if (isStaffOrAdminEmailOrRole(newCandidate.email, newCandidate.fullName, newCandidate.currentRole, undefined, userAccounts)) {
      console.warn("Staff/Admin cannot be added as candidate:", newCandidate.email);
      return null as any;
    }

    const cleanMail = (newCandidate.email || '').toLowerCase().trim();
    const candidateId = `cand-${Date.now()}`;
    const score = calculateMatchScore(newCandidate.skills, jobs.find(j => j.id === activeJobId)?.requiredSkills || []);

    let savedCand: Candidate = {
      ...newCandidate,
      id: candidateId,
      status: 'Applied',
      matchScore: score
    };

    setCandidates(prev => {
      const existingIdx = cleanMail ? prev.findIndex(c => (c.email || '').toLowerCase().trim() === cleanMail) : -1;
      if (existingIdx >= 0) {
        const updated = [...prev];
        savedCand = {
          ...updated[existingIdx],
          ...newCandidate,
          matchScore: score
        };
        updated[existingIdx] = savedCand;
        return updated;
      }
      return [savedCand, ...prev];
    });

    setActiveCandidateId(savedCand.id);
    return savedCand;
  };

  const addJob = (newJob: Omit<Job, 'id' | 'candidateCount' | 'createdAt'>) => {
    const jobId = `job-${Date.now()}`;
    const job: Job = normalizeIndianJob({
      ...newJob,
      id: jobId,
      candidateCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    });
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

  const addCandidateInterviewResponse = (candidateIdOrEmail: string, response: CandidateInterviewResponse) => {
    setCandidates(prev => prev.map(cand => {
      if (cand.id === candidateIdOrEmail || cand.email.toLowerCase() === candidateIdOrEmail.toLowerCase()) {
        const existing = cand.interviewResponses || [];
        return {
          ...cand,
          interviewResponses: [...existing, response]
        };
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

  const scheduleInterview = (interview: Omit<ScheduledInterview, 'id' | 'createdAt'>) => {
    const newInterview: ScheduledInterview = {
      ...interview,
      id: `int-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setScheduledInterviews(prev => [newInterview, ...prev]);

    // Advance candidate stage in ATS pipeline to 'Interview in progress'
    setCandidates(prev => prev.map(cand => {
      if (cand.id === interview.candidateId || cand.email.toLowerCase() === interview.candidateEmail.toLowerCase()) {
        const curStatus = (cand.status || '').toLowerCase();
        if (curStatus === 'applied' || curStatus === 'screened' || curStatus === 'shortlisted') {
          return { ...cand, status: 'Interview in progress' as const };
        }
      }
      return cand;
    }));

    // Trigger real-time candidate notification
    const newNotif: CandidateNotification = {
      id: `notif-${Date.now()}`,
      candidateEmail: interview.candidateEmail,
      title: `Interview Scheduled: ${interview.interviewType.replace(/_/g, ' ')}`,
      message: `Your interview for "${interview.jobTitle}" has been scheduled for ${interview.scheduledDate} at ${interview.scheduledTime} with ${interview.interviewerName}.`,
      type: 'INTERVIEW_INVITE',
      timestamp: new Date().toISOString(),
      isRead: false,
      actionUrl: interview.meetingLink
    };
    setCandidateNotifications(prev => [newNotif, ...prev]);

    return newInterview;
  };

  const updateInterviewStatus = (id: string, status: ScheduledInterview['status']) => {
    setScheduledInterviews(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status };
      }
      return item;
    }));
  };

  const cancelInterview = (id: string) => {
    updateInterviewStatus(id, 'CANCELLED');
  };

  const deleteInterview = (id: string) => {
    setScheduledInterviews(prev => prev.filter(item => item.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setCandidateNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const addCandidateNotification = (notification: Omit<CandidateNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: CandidateNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setCandidateNotifications(prev => [newNotif, ...prev]);
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
    addCandidateInterviewResponse,
    deleteCandidateInterviewResponse,
    deleteCandidate,
    addSkillToCandidate,
    removeSkillFromCandidate,
    updateCandidateRoleAndExperience,
    setUserProfileExplicit,
    updateCandidateAvatar,

    scheduledInterviews,
    scheduleInterview,
    updateInterviewStatus,
    cancelInterview,
    deleteInterview,
    candidateNotifications,
    markNotificationRead,
    addCandidateNotification
  };
}


