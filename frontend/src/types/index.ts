export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  minSalary: number;
  maxSalary: number;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  educationRequirement: string;
  status: 'ACTIVE' | 'DRAFT' | 'CLOSED';
  candidateCount?: number;
  createdAt: string;
}

export interface CandidateInterviewResponse {
  id: string;
  question: string;
  category?: string;
  answer: string;
  timestamp: string;
  score?: {
    clarity: number;
    relevance: number;
    overall: number;
    feedback: string;
  };
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  currentRole: string;
  totalExperienceYears: number;
  headline: string;
  skills: string[];
  degree: string;
  institution: string;
  status: 'Applied' | 'Screened' | 'Shortlisted' | 'Interviewed' | 'Interview in progress' | 'Interview Completed' | 'Offered' | 'Hired' | 'Rejected';
  matchScore?: number;
  avatar?: string;
  interviewResponses?: CandidateInterviewResponse[];
}

export interface SkillGapItem {
  skill: string;
  level: 'Advanced' | 'Intermediate' | 'Basic' | 'None';
  status: 'Required' | 'Preferred';
  candidateLevel: number; // 0 to 100
  requiredLevel: number; // 0 to 100
}

export interface CandidateMatch {
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  matchScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  skills: string[];
  strengths: string[];
  missingRequirements: string[];
  recommendation: 'Strongly Recommended' | 'Recommended' | 'Consider' | 'Needs Review';
}

export interface InterviewQuestion {
  id: number;
  category: 'Technical' | 'Behavioral' | 'Situational' | 'Problem-Solving';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  expectedPoints: string[];
  timeEstimate: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export interface VoiceScreeningSession {
  id: string;
  candidateName: string;
  jobTitle: string;
  durationSeconds: number;
  transcript: string;
  clarityScore: number;
  relevanceScore: number;
  overallScore: number;
  preliminaryAssessment: string;
  status: 'Ready' | 'Recording' | 'Completed';
}

export interface ATSProvider {
  id: string;
  name: string;
  logo: string;
  status: 'Connected' | 'Disconnected' | 'Syncing';
  lastSync: string;
  candidateCount: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  userType: 'ADMIN' | 'USER';
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'REVOKED';
  createdAt: string;
  password?: string;
  isSuperAdmin?: boolean;
  avatar?: string;
}


export interface UserProfile {
  name: string;
  role: string;
  email: string;
  userType?: 'ADMIN' | 'USER';
  status?: 'APPROVED' | 'PENDING' | 'REJECTED' | 'REVOKED';
  isSuperAdmin?: boolean;
  avatar?: string;
}

export interface ScheduledInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateRole: string;
  jobId: string;
  jobTitle: string;
  interviewType: 'AI_SCREENING' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'HIRING_MANAGER';
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // e.g. 14:30
  durationMinutes: number;
  interviewerName: string;
  meetingLink: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

export interface CandidateNotification {
  id: string;
  candidateEmail: string;
  title: string;
  message: string;
  type: 'STATUS_UPDATE' | 'INTERVIEW_INVITE' | 'SCREENING_RESULT' | 'GENERAL';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}
