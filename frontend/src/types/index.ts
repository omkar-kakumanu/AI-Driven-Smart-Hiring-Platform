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
  status: 'Applied' | 'Screened' | 'Shortlisted' | 'Interviewed' | 'Offered' | 'Hired' | 'Rejected';
  matchScore?: number;
  avatar?: string;
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

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatar?: string;
}

