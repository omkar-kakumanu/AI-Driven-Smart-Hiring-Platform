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
    requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'Kubernetes', 'AWS SageMaker', 'SQL'],
    preferredSkills: ['NLP', 'Transformers', 'Docker', 'FastAPI'],
    minExperienceYears: 5,
    educationRequirement: 'MS in Computer Science or Machine Learning',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'job-2',
    title: 'Frontend React & UI Engineer',
    department: 'Frontend Engineering',
    location: 'Austin, TX (Remote)',
    employmentType: 'Full-time',
    minSalary: 130000,
    maxSalary: 175000,
    description: 'Build responsive, high-performance web applications using modern React, TypeScript, and state management.',
    requiredSkills: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'Tailwind CSS', 'Redux', 'REST APIs'],
    preferredSkills: ['Next.js', 'GraphQL', 'Jest', 'Webpack'],
    minExperienceYears: 3,
    educationRequirement: 'BS in Computer Science or Web Engineering',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'job-3',
    title: 'Cloud DevOps & Security Specialist',
    department: 'Infrastructure & Ops',
    location: 'Seattle, WA (On-site)',
    employmentType: 'Full-time',
    minSalary: 150000,
    maxSalary: 195000,
    description: 'Automate Kubernetes clusters, CI/CD pipelines, and cloud infrastructure monitoring across AWS.',
    requiredSkills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Linux', 'Python'],
    preferredSkills: ['Ansible', 'Prometheus', 'Grafana', 'Bash'],
    minExperienceYears: 4,
    educationRequirement: 'BS in Computer Science or DevOps Certification',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'job-4',
    title: 'Backend Java & Systems Architect',
    department: 'Backend Systems',
    location: 'New York, NY (Hybrid)',
    employmentType: 'Full-time',
    minSalary: 155000,
    maxSalary: 200000,
    description: 'Design enterprise Java Spring Boot microservices, high-throughput database systems, and distributed caches.',
    requiredSkills: ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices', 'Redis', 'Docker', 'SQL'],
    preferredSkills: ['Kafka', 'gRPC', 'Kubernetes', 'Elasticsearch'],
    minExperienceYears: 5,
    educationRequirement: 'BS in Computer Science or Software Engineering',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'job-5',
    title: 'Data Engineer & Analytics Specialist',
    department: 'Data & Analytics',
    location: 'Chicago, IL (Remote)',
    employmentType: 'Full-time',
    minSalary: 140000,
    maxSalary: 180000,
    description: 'Build enterprise ETL/ELT pipelines, Snowflake data warehouses, and automated analytics models.',
    requiredSkills: ['Python', 'SQL', 'Apache Spark', 'Snowflake', 'Airflow', 'Data Modeling', 'PostgreSQL'],
    preferredSkills: ['dbt', 'BigQuery', 'Kafka', 'Scala'],
    minExperienceYears: 4,
    educationRequirement: 'BS/MS in Computer Science or Data Analytics',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'job-6',
    title: 'Cybersecurity Analyst & Threat Specialist',
    department: 'Information Security',
    location: 'Washington, DC (Hybrid)',
    employmentType: 'Full-time',
    minSalary: 145000,
    maxSalary: 190000,
    description: 'Perform SIEM threat monitoring, network vulnerability penetration testing, and incident response.',
    requiredSkills: ['Cybersecurity', 'Network Security', 'Python', 'SIEM', 'Penetration Testing', 'Firewalls', 'Linux'],
    preferredSkills: ['Wireshark', 'Splunk', 'CISSP', 'Zero Trust'],
    minExperienceYears: 4,
    educationRequirement: 'BS in Cybersecurity or Information Assurance',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'job-7',
    title: 'Full Stack MERN Developer',
    department: 'Web Engineering',
    location: 'Denver, CO (Remote)',
    employmentType: 'Full-time',
    minSalary: 135000,
    maxSalary: 175000,
    description: 'Develop full-stack web applications using Node.js, Express, React, MongoDB, and TypeScript.',
    requiredSkills: ['Node.js', 'Express', 'React', 'MongoDB', 'JavaScript', 'TypeScript', 'Docker', 'REST APIs'],
    preferredSkills: ['GraphQL', 'Redis', 'Tailwind CSS', 'AWS'],
    minExperienceYears: 3,
    educationRequirement: 'BS in Computer Science or Software Engineering',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'job-8',
    title: 'Mobile Application Engineer (iOS & Android)',
    department: 'Mobile Development',
    location: 'Los Angeles, CA (Hybrid)',
    employmentType: 'Full-time',
    minSalary: 140000,
    maxSalary: 185000,
    description: 'Architect cross-platform mobile apps using React Native, Flutter, Swift, and native Android APIs.',
    requiredSkills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile UI', 'REST APIs', 'Firebase'],
    preferredSkills: ['Redux Toolkit', 'App Store CI/CD', 'Jest', 'Push Notifications'],
    minExperienceYears: 4,
    educationRequirement: 'BS in Computer Science or Mobile Computing',
    status: 'ACTIVE',
    candidateCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'job-9',
    title: 'AI Prompt Engineer & LLM Specialist',
    department: 'AI Research & Applications',
    location: 'San Francisco, CA (Remote)',
    employmentType: 'Full-time',
    minSalary: 165000,
    maxSalary: 215000,
    description: 'Design RAG architectures, prompt templates, vector database indices, and LLM autonomous agents.',
    requiredSkills: ['Python', 'LangChain', 'OpenAI API', 'Prompt Engineering', 'Vector Databases', 'Pinecone', 'FastAPI'],
    preferredSkills: ['LlamaIndex', 'vLLM', 'Transformers', 'Semantic Search'],
    minExperienceYears: 3,
    educationRequirement: 'BS/MS in Computer Science or AI Systems',
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

