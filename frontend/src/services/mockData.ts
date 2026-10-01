import type { Job, Candidate, InterviewQuestion, ATSProvider } from '../types';

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Machine Learning Engineer',
    department: 'AI & Data Science',
    location: 'Bengaluru, Karnataka (Hybrid)',
    employmentType: 'Full-time',
    minSalary: 2400000,
    maxSalary: 3800000,
    description: 'Architect scalable ML pipelines, LLM fine-tuning, and model deployment in cloud production environments.',
    requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'Kubernetes', 'AWS SageMaker', 'SQL'],
    preferredSkills: ['NLP', 'Transformers', 'Docker', 'FastAPI'],
    minExperienceYears: 5,
    educationRequirement: 'B.Tech / M.Tech in Computer Science or Data Science',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'job-2',
    title: 'Frontend React & UI Engineer',
    department: 'Frontend Engineering',
    location: 'Hyderabad, Telangana (Hybrid / HITEC City)',
    employmentType: 'Full-time',
    minSalary: 1400000,
    maxSalary: 2200000,
    description: 'Build responsive, high-performance web applications using modern React, TypeScript, and state management.',
    requiredSkills: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'Tailwind CSS', 'Redux', 'REST APIs'],
    preferredSkills: ['Next.js', 'GraphQL', 'Jest', 'Webpack'],
    minExperienceYears: 3,
    educationRequirement: 'B.Tech / B.E. in Computer Science or Information Technology',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'job-3',
    title: 'Cloud DevOps & Security Specialist',
    department: 'Platform & Infrastructure',
    location: 'Pune, Maharashtra (Hybrid / Hinjawadi)',
    employmentType: 'Full-time',
    minSalary: 1800000,
    maxSalary: 2800000,
    description: 'Automate Kubernetes clusters, CI/CD pipelines, and cloud infrastructure monitoring across AWS.',
    requiredSkills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Linux', 'Python'],
    preferredSkills: ['Ansible', 'Prometheus', 'Grafana', 'Bash'],
    minExperienceYears: 4,
    educationRequirement: 'B.Tech / B.E. in Computer Science or Cloud Certification',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'job-4',
    title: 'Backend Java & Systems Architect',
    department: 'Core Engineering',
    location: 'Gurugram, Delhi NCR (Hybrid / Cyber City)',
    employmentType: 'Full-time',
    minSalary: 2200000,
    maxSalary: 3500000,
    description: 'Design enterprise Java Spring Boot microservices, high-throughput database systems, and distributed caches.',
    requiredSkills: ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices', 'Redis', 'Docker', 'SQL'],
    preferredSkills: ['Kafka', 'gRPC', 'Kubernetes', 'Elasticsearch'],
    minExperienceYears: 5,
    educationRequirement: 'B.Tech in Computer Science or Software Engineering',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'job-5',
    title: 'Full Stack Development (React/Node)',
    department: 'Product Engineering',
    location: 'Bengaluru, Karnataka (Hybrid / Electronic City)',
    employmentType: 'Full-time',
    minSalary: 1600000,
    maxSalary: 2600000,
    description: 'Build enterprise full-stack platforms with modern React 19, Node.js, distributed databases, and cloud services.',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'REST APIs'],
    preferredSkills: ['Next.js', 'Redis', 'GraphQL', 'Tailwind CSS'],
    minExperienceYears: 4,
    educationRequirement: 'B.Tech / M.Tech in Computer Science or equivalent',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'job-6',
    title: 'Data Engineer & Analytics Specialist',
    department: 'Data & Analytics',
    location: 'Chennai, Tamil Nadu (Hybrid / OMR)',
    employmentType: 'Full-time',
    minSalary: 1500000,
    maxSalary: 2400000,
    description: 'Build enterprise ETL/ELT pipelines, Snowflake data warehouses, and automated analytics models.',
    requiredSkills: ['Python', 'SQL', 'Apache Spark', 'Snowflake', 'Airflow', 'Data Modeling', 'PostgreSQL'],
    preferredSkills: ['dbt', 'BigQuery', 'Kafka', 'Scala'],
    minExperienceYears: 4,
    educationRequirement: 'B.Tech / B.Sc in Computer Science or Data Analytics',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'job-7',
    title: 'Mobile Application Engineer (iOS & Android)',
    department: 'Mobile Development',
    location: 'Mumbai, Maharashtra (Hybrid / BKC)',
    employmentType: 'Full-time',
    minSalary: 1600000,
    maxSalary: 2500000,
    description: 'Architect cross-platform mobile apps using React Native, Flutter, Swift, and native Android APIs.',
    requiredSkills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile UI', 'REST APIs', 'Firebase'],
    preferredSkills: ['Redux Toolkit', 'App Store CI/CD', 'Jest', 'Push Notifications'],
    minExperienceYears: 4,
    educationRequirement: 'B.Tech in Computer Science or Mobile Computing',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'job-8',
    title: 'AI Prompt Engineer & LLM Specialist',
    department: 'AI Research & Applications',
    location: 'Bengaluru, Karnataka (Remote)',
    employmentType: 'Full-time',
    minSalary: 2000000,
    maxSalary: 3200000,
    description: 'Design RAG architectures, prompt templates, vector database indices, and LLM autonomous agents.',
    requiredSkills: ['Python', 'LangChain', 'OpenAI API', 'Prompt Engineering', 'Vector Databases', 'Pinecone', 'FastAPI'],
    preferredSkills: ['LlamaIndex', 'vLLM', 'Transformers', 'Semantic Search'],
    minExperienceYears: 3,
    educationRequirement: 'B.Tech / M.Tech in Computer Science or AI Systems',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 019-2831',
    location: 'San Francisco, CA',
    currentRole: 'Senior Machine Learning Engineer',
    totalExperienceYears: 5,
    headline: 'Senior ML Engineer with 5 years experience in Python, TensorFlow, PyTorch',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Data Analysis', 'AWS SageMaker', 'Docker'],
    degree: 'MS Computer Science',
    institution: 'Stanford University',
    status: 'Interview in progress',
    matchScore: 92,
    interviewResponses: [
      {
        id: 'resp-1',
        question: 'Describe a machine learning project where you had to optimize model performance. What techniques did you use and what was the outcome?',
        category: 'Technical',
        answer: 'I led the optimization of our fraud detection transformer model by implementing mixed-precision training (FP16), hyperparameter tuning with Optuna, and ONNX Runtime quantization. This reduced inference latency by 42% while improving F1 score from 0.89 to 0.94 in production.',
        timestamp: 'Today at 14:30',
        score: {
          clarity: 94,
          relevance: 96,
          overall: 95,
          feedback: 'Outstanding technical precision, clear quantifiable latency and accuracy metrics.'
        }
      }
    ]
  },
  {
    id: 'cand-2',
    fullName: 'Alex Chen',
    email: 'alex.chen@example.com',
    phone: '+1 (555) 482-9910',
    location: 'Austin, TX',
    currentRole: 'Frontend React Developer',
    totalExperienceYears: 4,
    headline: 'Frontend Engineer specialized in React, TypeScript, Redux, and modern UI',
    skills: ['React', 'TypeScript', 'JavaScript', 'Redux', 'HTML5', 'Tailwind CSS', 'REST APIs'],
    degree: 'BS Computer Science',
    institution: 'UT Austin',
    status: 'Screened',
    matchScore: 88
  },
  {
    id: 'cand-3',
    fullName: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    phone: '+1 (555) 731-4029',
    location: 'Seattle, WA',
    currentRole: 'DevOps & Security Specialist',
    totalExperienceYears: 6,
    headline: 'DevOps Architect experienced in Kubernetes, Docker, AWS, Terraform',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Linux', 'Python', 'Cybersecurity'],
    degree: 'BS Computer Science',
    institution: 'University of Washington',
    status: 'Shortlisted',
    matchScore: 95
  },
  {
    id: 'cand-4',
    fullName: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    phone: '+1 (555) 839-2011',
    location: 'New York, NY',
    currentRole: 'Backend Systems Architect',
    totalExperienceYears: 5,
    headline: 'Enterprise Java Architect specializing in Spring Boot and Microservices',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices', 'Redis', 'Docker', 'SQL', 'REST APIs'],
    degree: 'BS Software Engineering',
    institution: 'Columbia University',
    status: 'Interviewed',
    matchScore: 86
  },
  {
    id: 'cand-5',
    fullName: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    phone: '+1 (555) 294-8102',
    location: 'Chicago, IL',
    currentRole: 'Data Engineer & ETL Specialist',
    totalExperienceYears: 4,
    headline: 'Data Engineering expert in Apache Spark, Snowflake, Airflow, and Python',
    skills: ['Python', 'SQL', 'Apache Spark', 'Snowflake', 'Airflow', 'Data Modeling', 'PostgreSQL'],
    degree: 'MS Data Analytics',
    institution: 'Northwestern University',
    status: 'Offered',
    matchScore: 84
  },
  {
    id: 'cand-6',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+1 (555) 912-3847',
    location: 'San Francisco, CA',
    currentRole: 'AI & LLM Prompt Engineer',
    totalExperienceYears: 3,
    headline: 'AI Developer creating RAG systems with LangChain, OpenAI, and FastAPI',
    skills: ['Python', 'LangChain', 'OpenAI API', 'Prompt Engineering', 'Vector Databases', 'FastAPI', 'Docker'],
    degree: 'BS AI Systems',
    institution: 'UC Berkeley',
    status: 'Applied',
    matchScore: 89
  },
  {
    id: 'cand-7',
    fullName: 'Abhishek',
    email: 'abhishek@gmail.com',
    phone: '+91 8179171254',
    location: 'Hyderabad, Telangana',
    currentRole: 'AI/ML Engineering Student & Full Stack Developer',
    totalExperienceYears: 2,
    headline: 'B.Tech AI & ML Student & Full Stack Developer with React, Node.js, Python, TensorFlow',
    skills: ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'TensorFlow', 'React Native', 'Firebase', 'HTML', 'CSS', 'SQL'],
    degree: 'B.Tech - AI & Machine Learning',
    institution: 'Malla Reddy University (MR)',
    status: 'Screened',
    matchScore: 92,
    interviewResponses: [
      {
        id: 'resp-abh-1',
        question: 'Describe your hands-on experience building full-stack applications and AI models.',
        category: 'Technical',
        answer: 'I engineered Tripzy, an AI-powered tour planner supporting 22+ languages with voice assistant using React Native, Node.js, and Firebase. Additionally developed deep learning models for AI-generated image detection with Python and TensorFlow, and interned as Full Stack Developer at CODEC building responsive React/Node.js web applications.',
        timestamp: 'Recently',
        score: {
          clarity: 95,
          relevance: 96,
          overall: 95,
          feedback: 'Strong end-to-end full-stack and AI project execution with hands-on architecture.'
        }
      }
    ]
  }
];

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
  { id: 'greenhouse', name: 'Greenhouse ATS', logo: 'GH', status: 'Connected', lastSync: 'Just now', candidateCount: 0 },
  { id: 'lever', name: 'Lever Recruiter', logo: 'LV', status: 'Connected', lastSync: '15 mins ago', candidateCount: 0 },
  { id: 'workday', name: 'Workday HCM', logo: 'WD', status: 'Disconnected', lastSync: 'Never', candidateCount: 0 }
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

