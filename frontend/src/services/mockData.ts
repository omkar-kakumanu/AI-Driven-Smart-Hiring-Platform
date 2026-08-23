import type { Job, Candidate, InterviewQuestion, ATSProvider } from '../types';

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Machine Learning Engineer',
    department: 'AI & Data Science',
    location: 'San Francisco, CA (Hybrid)',
    employmentType: 'Full-time',
    minSalary: 160000,
    maxSalary: 210000,
    description: 'Architect scalable ML pipelines, LLM fine-tuning, and model deployment in cloud production environments.',
    requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'Kubernetes', 'AWS SageMaker'],
    preferredSkills: ['NLP', 'Transformers', 'Docker', 'FastAPI'],
    minExperienceYears: 5,
    educationRequirement: 'MS in Computer Science or Machine Learning',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [];

export const INITIAL_QUESTIONS: InterviewQuestion[] = [
  {
    id: 1,
    category: 'Technical',
    difficulty: 'Hard',
    question: 'Describe a production machine learning deployment where you optimized model inference latency. What techniques were used?',
    expectedPoints: ['Profiling', 'ONNX / TensorRT quantization', 'Batching', 'Latency metrics'],
    timeEstimate: '3-5 min response'
  },
  {
    id: 2,
    category: 'Technical',
    difficulty: 'Medium',
    question: 'How do you detect and handle data drift and concept drift in live production pipelines?',
    expectedPoints: ['Statistical tests (KS, PSI)', 'Feature stores', 'Model retraining triggers'],
    timeEstimate: '4-6 min response'
  }
];

export const INITIAL_ATS_PROVIDERS: ATSProvider[] = [
  { id: 'greenhouse', name: 'Greenhouse ATS', logo: '🏢', status: 'Connected', lastSync: 'Just now', candidateCount: 0 },
  { id: 'lever', name: 'Lever Recruiter', logo: '⚡', status: 'Connected', lastSync: '15 mins ago', candidateCount: 0 },
  { id: 'workday', name: 'Workday HCM', logo: '💼', status: 'Disconnected', lastSync: 'Never', candidateCount: 0 }
];

export const MOCK_JOBS = INITIAL_JOBS;
export const MOCK_CANDIDATES = INITIAL_CANDIDATES;
export const MOCK_QUESTIONS = INITIAL_QUESTIONS;
export const MOCK_ATS_PROVIDERS = INITIAL_ATS_PROVIDERS;

export const INITIAL_FUNNEL_DATA = [
  { name: 'Applied', count: 0 },
  { name: 'Screened', count: 0 },
  { name: 'Interviewed', count: 0 },
  { name: 'Offered', count: 0 },
  { name: 'Hired', count: 0 }
];
