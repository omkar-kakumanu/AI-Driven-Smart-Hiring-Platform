import React, { useState, useEffect } from 'react';
import type { Candidate, Job, CandidateInterviewResponse, ScheduledInterview } from '../types';
import { UserAvatar } from '../components/UserAvatar';
import { InterviewSchedulingModule } from '../components/InterviewSchedulingModule';

interface InterviewAssistantViewProps {
  candidates: Candidate[];
  jobs: Job[];
  isMainAdmin?: boolean;
  isCandidateUser?: boolean;
  onUpdateCandidateStatusByEmail?: (email: string, status: Candidate['status']) => void;
  onUpdateCandidateRoleAndExperience?: (candidateId: string, role: string, exp: number) => void;
  onSaveCandidateInterviewResponse?: (candidateId: string, response: CandidateInterviewResponse) => void;
  onNavigateToAts?: () => void;
  onNavigateToVoiceScreening?: () => void;
  scheduledInterviews?: ScheduledInterview[];
  onScheduleInterview?: (interview: Omit<ScheduledInterview, 'id' | 'createdAt'>) => void;
  onUpdateInterviewStatus?: (id: string, status: ScheduledInterview['status']) => void;
  onCancelInterview?: (id: string) => void;
  currentCandidateEmail?: string;
  onDeleteCandidateInterviewResponse?: (candidateIdOrEmail: string, responseIdOrQuestion: string) => void;
}

interface InterviewQuestionItem {
  id: number;
  category: string;
  type: 'descriptive' | 'objective';
  difficulty?: string;
  question: string;
  options?: string[];
  correctOptionIndex?: number;
  correctExplanation?: string;
  tags?: string;
  expected_points?: string[];
}

interface ChatBubble {
  id: string;
  sender: 'ai' | 'candidate';
  text: string;
  timestamp: string;
  score?: {
    clarity: number;
    relevance: number;
    overall: number;
    feedback: string;
  };
}

export const InterviewAssistantView: React.FC<InterviewAssistantViewProps> = ({
  candidates = [],
  jobs = [],
  isMainAdmin = false,
  isCandidateUser = false,
  onUpdateCandidateStatusByEmail,
  onUpdateCandidateRoleAndExperience,
  onSaveCandidateInterviewResponse,
  onNavigateToAts,
  onNavigateToVoiceScreening,
  scheduledInterviews = [],
  onScheduleInterview,
  onUpdateInterviewStatus,
  onCancelInterview,
  currentCandidateEmail,
  onDeleteCandidateInterviewResponse
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'SIMULATION' | 'SCHEDULING'>('SIMULATION');
  // Job positions available for questions
  const availablePositions = jobs.length > 0 ? jobs.map(j => j.title) : [
    "Senior Machine Learning Engineer",
    "Data Scientist",
    "Frontend React & UI Engineer",
    "Cloud DevOps & Security Specialist",
    "Backend Java & Systems Architect"
  ];

  const [selectedJobPosition, setSelectedJobPosition] = useState<string>(availablePositions[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);

  // Selected Candidate for AI Interview Simulation
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(candidates[0]?.id || '');
  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0] || {
    id: 'cand-1',
    fullName: localStorage.getItem('rc_name_candidate@copilot.com') || localStorage.getItem('rc_name_sarah.johnson@example.com') || 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    currentRole: 'Senior Machine Learning Engineer',
    totalExperienceYears: 5,
    status: 'Applied'
  };

  const canModifyActiveCandidate = !isCandidateUser || (activeCandidate.email.toLowerCase() === (currentCandidateEmail || candidates[0]?.email || '').toLowerCase());

  // Admin Quick Role & Experience Editing State
  const [adminRoleInput, setAdminRoleInput] = useState<string>(activeCandidate.currentRole || '');
  const [adminExpInput, setAdminExpInput] = useState<number>(activeCandidate.totalExperienceYears || 3);
  const [showAdminEditModal, setShowAdminEditModal] = useState<boolean>(false);
  const [stagingNotice, setStagingNotice] = useState<string | null>(null);

  // Sync Admin Inputs when Active Candidate Changes
  useEffect(() => {
    if (activeCandidate) {
      setAdminRoleInput(activeCandidate.currentRole || '');
      setAdminExpInput(activeCandidate.totalExperienceYears || 3);
    }
  }, [selectedCandidateId, activeCandidate]);

  const [robotAnimKey, setRobotAnimKey] = useState<number>(0);
  const [isCandidateDropdownOpen, setIsCandidateDropdownOpen] = useState<boolean>(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close candidate dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCandidateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const playRobotEntrance = () => {
    setRobotAnimKey(k => k + 1);
  };

  useEffect(() => {
    setRobotAnimKey(k => k + 1);
  }, [selectedCandidateId]);

  // AI Interview Simulation Chat State
  const [chatMessages, setChatMessages] = useState<ChatBubble[]>([]);
  const [candidateInputText, setCandidateInputText] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [sessionStatus, setSessionStatus] = useState<'Ready' | 'Active' | 'Completed'>('Active');
  const [latestEvaluation, setLatestEvaluation] = useState<{ clarity: number; relevance: number; overall: number; feedback: string } | null>(null);

  // Live Voice-Based Screening Input & Audio Speech Synthesis
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const speechRecognitionRef = React.useRef<any>(null);

  const toggleVoiceInput = () => {
    if (isListeningVoice) {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      }
      setIsListeningVoice(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech-to-text recognition is not supported in this browser. Please type your response.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListeningVoice(true);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCandidateInputText(transcript);
      };
      recognition.onend = () => setIsListeningVoice(false);
      recognition.onerror = () => setIsListeningVoice(false);

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setIsListeningVoice(false);
    }
  };

  const speakTextAloud = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  // Fetch Role-Specific Interview Questions (Ensures 10 questions: 5 Descriptive + 5 Objective)
  const fetchInterviewQuestions = async (role: string, cat: string) => {
    setLoadingQuestions(true);
    try {
      const res = await fetch('http://localhost:8000/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: role,
          required_skills: ["Python", "Machine Learning", "React", "Docker", "AWS"],
          candidate_skills: ["Python", "TensorFlow"],
          category: cat
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length >= 10) {
          setQuestions(data.questions);
          setLoadingQuestions(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend questions API offline, loading role fallback questions", err);
    }

    // Role-Specific 10-Question Bank (5 Descriptive + 5 Objective MCQs)
    setQuestions(getFallbackQuestionsForRole(role, cat));
    setLoadingQuestions(false);
  };

  const getFallbackQuestionsForRole = (role: string, cat: string): InterviewQuestionItem[] => {
    let raw: InterviewQuestionItem[] = [];

    if (role.includes("Machine Learning") || role.includes("ML") || role.includes("AI")) {
      raw = [
        // 5 Descriptive Questions
        {
          id: 1,
          type: 'descriptive',
          category: "Technical",
          difficulty: "Hard",
          question: "Describe an end-to-end machine learning project where you had to optimize model performance, latency, or compute requirements. What techniques (e.g., hyperparameter tuning, quantization, pruning) did you use and what was the quantifiable impact?",
          tags: "Descriptive • Experience-based • 3-5 min response",
          expected_points: ["Profiling & latency metrics", "Quantization (INT8/FP16) or Pruning", "Quantifiable accuracy vs speed outcome"]
        },
        {
          id: 2,
          type: 'descriptive',
          category: "Technical",
          difficulty: "Hard",
          question: "How would you design and deploy an end-to-end machine learning inference pipeline on Kubernetes or Triton server under strict sub-50ms latency SLAs?",
          tags: "Descriptive • System Design • 4-6 min response",
          expected_points: ["Containerization & Triton/FastAPI serving", "GPU batching & dynamic concurrency", "Autoscaling & health probes"]
        },
        {
          id: 3,
          type: 'descriptive',
          category: "Technical",
          difficulty: "Medium",
          question: "How do you detect, monitor, and mitigate dataset shift, concept drift, and data quality degradation in live production ML pipelines?",
          tags: "Descriptive • MLOps • 3-4 min response",
          expected_points: ["KS-test / PSI drift detection", "Evidently / Prometheus monitoring", "Automated shadow re-training pipelines"]
        },
        {
          id: 4,
          type: 'descriptive',
          category: "Behavioral",
          difficulty: "Medium",
          question: "Tell me about a time when you had to explain complex AI trade-offs, model limitations, or false-positive risks to non-technical business stakeholders.",
          tags: "Descriptive • Communication • 2-4 min response",
          expected_points: ["Translation to business ROI", "Confusion matrix trade-offs", "Managing stakeholder expectations"]
        },
        {
          id: 5,
          type: 'descriptive',
          category: "Problem-Solving",
          difficulty: "Hard",
          question: "If your deep learning model is experiencing high variance (overfitting) on validation data despite using dropout, what systematic steps do you take to diagnose and resolve it?",
          tags: "Descriptive • Debugging • 3-5 min response",
          expected_points: ["Data augmentation & dataset scale", "Weight decay / L2 regularization", "Early stopping & learning rate schedules"]
        },
        // 5 Objective Multiple Choice Questions (MCQs)
        {
          id: 6,
          type: 'objective',
          category: "Technical Core",
          difficulty: "Medium",
          question: "Which activation function is most susceptible to the vanishing gradient problem during backpropagation in deep neural networks?",
          options: ["A) ReLU", "B) Leaky ReLU", "C) Sigmoid", "D) GELU"],
          correctOptionIndex: 2,
          correctExplanation: "The Sigmoid activation function saturates at both tails with near-zero derivatives, causing gradients to diminish exponentially as backpropagation traverses multiple layers.",
          tags: "Objective MCQ • Deep Learning Foundations"
        },
        {
          id: 7,
          type: 'objective',
          category: "Architecture",
          difficulty: "Hard",
          question: "In Transformer architectures, what is the computational and memory complexity of the standard scaled dot-product self-attention mechanism with respect to sequence length N?",
          options: ["A) O(N)", "B) O(N log N)", "C) O(N²)", "D) O(N³)"],
          correctOptionIndex: 2,
          correctExplanation: "Standard self-attention computes an N×N attention score matrix comparing every token against every other token, resulting in quadratic O(N²) time and memory complexity.",
          tags: "Objective MCQ • Transformers & LLMs"
        },
        {
          id: 8,
          type: 'objective',
          category: "Optimization",
          difficulty: "Medium",
          question: "Which regularization technique specifically addresses internal covariate shift during deep neural network training by normalizing layer activations across the mini-batch?",
          options: ["A) Batch Normalization", "B) L1 Lasso Regularization", "C) Dropout (p=0.5)", "D) Early Stopping"],
          correctOptionIndex: 0,
          correctExplanation: "Batch Normalization standardizes activations across the mini-batch by subtracting batch mean and dividing by variance, stabilizing gradient propagation and accelerating convergence.",
          tags: "Objective MCQ • Model Training"
        },
        {
          id: 9,
          type: 'objective',
          category: "Evaluation Metrics",
          difficulty: "Medium",
          question: "When evaluating an imbalanced fraud detection classifier where missing a fraudulent transaction (false negative) is catastrophic, which metric should be prioritized?",
          options: ["A) Accuracy", "B) Precision", "C) Recall (Sensitivity)", "D) Specificity"],
          correctOptionIndex: 2,
          correctExplanation: "Recall measures the proportion of actual positives successfully identified. Maximizing recall directly minimizes false negatives, critical for fraud prevention.",
          tags: "Objective MCQ • Metrics & Evaluation"
        },
        {
          id: 10,
          type: 'objective',
          category: "Loss Functions",
          difficulty: "Easy",
          question: "Which loss function is mathematically appropriate for training a neural network on multi-class classification where classes are mutually exclusive?",
          options: ["A) Binary Cross-Entropy", "B) Categorical Cross-Entropy with Softmax", "C) Mean Squared Error (MSE)", "D) Hinge Loss"],
          correctOptionIndex: 1,
          correctExplanation: "Categorical Cross-Entropy combined with a Softmax output layer provides mathematically sound negative log-likelihood minimization across mutually exclusive classes.",
          tags: "Objective MCQ • Loss Functions"
        }
      ];
    } else if (role.includes("Data Scientist") || role.includes("Data Science") || role.includes("Analytics")) {
      raw = [
        // 5 Descriptive Questions
        {
          id: 1,
          type: 'descriptive',
          category: "Technical",
          difficulty: "Hard",
          question: "Walk me through your comprehensive methodology for feature engineering, dimensionality reduction, and handling multicollinearity on high-dimensional tabular datasets.",
          tags: "Descriptive • Feature Engineering • 3-5 min response",
          expected_points: ["Domain feature creation & interactions", "Variance Inflation Factor (VIF)", "PCA / SHAP value selection"]
        },
        {
          id: 2,
          type: 'descriptive',
          category: "Technical",
          difficulty: "Medium",
          question: "How do you select appropriate evaluation metrics for imbalanced classification problems (e.g., churn prediction, fraud detection)?",
          tags: "Descriptive • Metrics • 3-5 min response",
          expected_points: ["PR-AUC vs ROC-AUC", "Cost-matrix threshold optimization", "F-beta weighting"]
        },
        {
          id: 3,
          type: 'descriptive',
          category: "Technical",
          difficulty: "Hard",
          question: "How do you design, power-size, and evaluate a randomized controlled A/B experiment while guarding against sample ratio mismatch and false discovery rates?",
          tags: "Descriptive • Causal Inference • 4-5 min response",
          expected_points: ["Minimum Detectable Effect (MDE)", "Power calculations & alpha spending", "Benjamini-Hochberg FDR correction"]
        },
        {
          id: 4,
          type: 'descriptive',
          category: "Behavioral",
          difficulty: "Medium",
          question: "Describe a situation where executive management's business intuition conflicted directly with your statistical findings. How did you advocate for the data?",
          tags: "Descriptive • Stakeholder Mgt • 3-4 min response",
          expected_points: ["Confidence intervals & risk bounds", "Visual storytelling & scenarios", "Collaborative experiment design"]
        },
        {
          id: 5,
          type: 'descriptive',
          category: "Problem-Solving",
          difficulty: "Hard",
          question: "How do you handle severe missing data patterns (MCAR vs MAR vs MNAR) and impute features without introducing systematic leakage?",
          tags: "Descriptive • Data Cleaning • 3-4 min response",
          expected_points: ["Missingness mechanism tests", "Iterative MICE / KNN imputation", "Out-of-fold pipeline isolation"]
        },
        // 5 Objective Multiple Choice Questions (MCQs)
        {
          id: 6,
          type: 'objective',
          category: "Statistical Inference",
          difficulty: "Medium",
          question: "In linear regression analysis, what statistic measures the proportion of variance in the dependent variable that is predictable from the independent variables?",
          options: ["A) P-Value", "B) R-squared (Coefficient of Determination)", "C) Pearson correlation r", "D) Variance Inflation Factor (VIF)"],
          correctOptionIndex: 1,
          correctExplanation: "R-squared measures the proportion of total variation in the target explained by the regression model.",
          tags: "Objective MCQ • Regression"
        },
        {
          id: 7,
          type: 'objective',
          category: "Econometrics",
          difficulty: "Hard",
          question: "Which assumption is NOT required by the Gauss-Markov theorem for Ordinary Least Squares (OLS) estimators to be the Best Linear Unbiased Estimator (BLUE)?",
          options: ["A) Homoscedasticity of errors", "B) Zero conditional mean of errors", "C) Normally distributed errors", "D) No perfect multicollinearity"],
          correctOptionIndex: 2,
          correctExplanation: "The Gauss-Markov theorem guarantees OLS is BLUE without requiring normality of errors; normality is only needed for exact hypothesis tests (t and F tests).",
          tags: "Objective MCQ • Gauss-Markov"
        },
        {
          id: 8,
          type: 'objective',
          category: "Ensemble Modeling",
          difficulty: "Medium",
          question: "What is the expected behavior of bias and variance in a Random Forest ensemble as the number of decision trees grows large?",
          options: ["A) Variance increases, Bias decreases", "B) Variance decreases or stabilizes, Bias remains largely unchanged", "C) Both Bias and Variance increase", "D) Bias increases, Variance decreases"],
          correctOptionIndex: 1,
          correctExplanation: "Ensemble averaging reduces prediction variance without increasing the intrinsic bias of the individual trees, and it does not overfit as tree count increases.",
          tags: "Objective MCQ • Random Forest"
        },
        {
          id: 9,
          type: 'objective',
          category: "Unsupervised Learning",
          difficulty: "Medium",
          question: "Which clustering algorithm does NOT require specifying the number of clusters (k) prior to execution?",
          options: ["A) K-Means", "B) Mini-Batch K-Means", "C) DBSCAN (Density-Based Spatial Clustering)", "D) Gaussian Mixture Models (GMM)"],
          correctOptionIndex: 2,
          correctExplanation: "DBSCAN clusters data based on spatial density thresholds (eps and min_samples) without requiring a pre-specified cluster count k.",
          tags: "Objective MCQ • Clustering"
        },
        {
          id: 10,
          type: 'objective',
          category: "Multicollinearity",
          difficulty: "Easy",
          question: "What is the primary diagnostic use of the Variance Inflation Factor (VIF) in multivariate regression modeling?",
          options: ["A) Detect multicollinearity among predictor variables", "B) Measure model prediction latency", "C) Calculate heteroscedasticity p-values", "D) Validate cross-validation folds"],
          correctOptionIndex: 0,
          correctExplanation: "A VIF greater than 5 or 10 indicates severe multicollinearity where predictors are heavily correlated, inflating coefficient variances.",
          tags: "Objective MCQ • VIF Diagnostics"
        }
      ];
    } else if (role.includes("Frontend") || role.includes("React") || role.includes("UI") || role.includes("Web")) {
      raw = [
        // 5 Descriptive Questions
        {
          id: 1,
          type: 'descriptive',
          category: "Technical",
          difficulty: "Hard",
          question: "How do you profile, isolate, and resolve component re-rendering bottlenecks and memory leaks in large-scale React single-page applications?",
          tags: "Descriptive • Performance • 3-5 min response",
          expected_points: ["React DevTools Profiler & Chrome Performance", "useMemo & useCallback memoization", "Virtualization (React Virtualized)"]
        },
        {
          id: 2,
          type: 'descriptive',
          category: "Technical",
          difficulty: "Medium",
          question: "Compare modern state management paradigms (Zustand, Redux Toolkit, React Context, and server-cache libraries like TanStack Query) and explain your selection criteria.",
          tags: "Descriptive • Architecture • 3-4 min response",
          expected_points: ["Server state vs client UI state", "Context re-render performance pitfalls", "Zustand atomic selector subscriptions"]
        },
        {
          id: 3,
          type: 'descriptive',
          category: "Technical",
          difficulty: "Medium",
          question: "How do you build accessible, responsive UI design systems conforming to WCAG 2.1 AA standards, including keyboard navigation, focus trapping, and ARIA attributes?",
          tags: "Descriptive • Accessibility • 3-4 min response",
          expected_points: ["Semantic HTML5 & WAI-ARIA roles", "Focus traps for modals", "Color contrast & screen reader testing"]
        },
        {
          id: 4,
          type: 'descriptive',
          category: "Behavioral",
          difficulty: "Medium",
          question: "Tell me about a time when you received rigorous constructive feedback during a pull request review. How did you incorporate the feedback and enhance team standards?",
          tags: "Descriptive • Growth Mindset • 2-3 min response",
          expected_points: ["Openness to constructive critique", "Adopting linting rules / automated checks", "Promoting shared code review standards"]
        },
        {
          id: 5,
          type: 'descriptive',
          category: "Problem-Solving",
          difficulty: "Hard",
          question: "How do you optimize production Web Vitals (LCP, INP, CLS) and protect client-side web apps from Cross-Site Scripting (XSS) and bundle bloat?",
          tags: "Descriptive • Web Vitals & Security • 4-5 min response",
          expected_points: ["Dynamic code-splitting & route lazy loading", "Sanitization & Content Security Policy", "Resource hints & image CDNs"]
        },
        // 5 Objective Multiple Choice Questions (MCQs)
        {
          id: 6,
          type: 'objective',
          category: "React Core",
          difficulty: "Medium",
          question: "In React 18, which hook is specifically designed to mark non-urgent UI state updates as concurrent and interruptible?",
          options: ["A) useEffect", "B) useTransition", "C) useId", "D) useImperativeHandle"],
          correctOptionIndex: 1,
          correctExplanation: "useTransition allows state updates to be deferred and interrupted by urgent user interactions, keeping typing and clicks responsive.",
          tags: "Objective MCQ • React 18 Concurrent"
        },
        {
          id: 7,
          type: 'objective',
          category: "Reconciliation",
          difficulty: "Easy",
          question: "What is the primary role of the 'key' prop when rendering dynamic lists in React?",
          options: ["A) Sets the HTML DOM ID attribute", "B) Helps React's reconciliation algorithm identify which items changed, added, or removed", "C) Triggers CSS transitions", "D) Enables automatic memoization of list items"],
          correctOptionIndex: 1,
          correctExplanation: "React uses keys to maintain identity between renders, avoiding re-mounting unaffected DOM nodes.",
          tags: "Objective MCQ • Virtual DOM"
        },
        {
          id: 8,
          type: 'objective',
          category: "CSS & GPU",
          difficulty: "Medium",
          question: "Which CSS property informs modern browser rendering engines to promote an element to its own GPU compositing layer?",
          options: ["A) display: flex", "B) will-change: transform", "C) position: relative", "D) box-sizing: border-box"],
          correctOptionIndex: 1,
          correctExplanation: "will-change: transform tells the browser to create a separate graphics layer, avoiding costly repaint and reflow cycles during animations.",
          tags: "Objective MCQ • Browser Rendering"
        },
        {
          id: 9,
          type: 'objective',
          category: "Web Security",
          difficulty: "Medium",
          question: "Which HTTP response security header is essential for mitigating Cross-Site Scripting (XSS) attacks by controlling permitted sources of script execution?",
          options: ["A) Access-Control-Allow-Origin", "B) Content-Security-Policy (CSP)", "C) Strict-Transport-Security (HSTS)", "D) X-Frame-Options"],
          correctOptionIndex: 1,
          correctExplanation: "Content-Security-Policy prevents malicious script execution by specifying trusted origins for scripts, styles, and images.",
          tags: "Objective MCQ • Security"
        },
        {
          id: 10,
          type: 'objective',
          category: "DOM Events",
          difficulty: "Medium",
          question: "In JavaScript DOM event dispatch, what is the exact chronological order of the three event propagation phases?",
          options: ["A) Bubbling -> Target -> Capturing", "B) Capturing -> Target -> Bubbling", "C) Target -> Capturing -> Bubbling", "D) Capturing -> Bubbling -> Target"],
          correctOptionIndex: 1,
          correctExplanation: "Events propagate downward from the Document root to the target in the Capturing phase, trigger at the Target, and bubble up to Document.",
          tags: "Objective MCQ • Event Loop & DOM"
        }
      ];
    } else {
      // Backend, Java, Systems & Cloud Architect
      raw = [
        // 5 Descriptive Questions
        {
          id: 1,
          type: 'descriptive',
          category: "Technical",
          difficulty: "Hard",
          question: "How do you design high-throughput concurrent systems in Java/JVM or Node.js while avoiding race conditions, deadlocks, thread pool exhaustion, and memory leaks?",
          tags: "Descriptive • Concurrency • 4-5 min response",
          expected_points: ["Thread pool sizing & non-blocking I/O", "Locks vs atomic CAS constructs", "Memory leaks & JVM heap dumps"]
        },
        {
          id: 2,
          type: 'descriptive',
          category: "Technical",
          difficulty: "Hard",
          question: "Explain how you architect distributed transactions and consistency across decoupled microservices using the Saga Pattern, Transactional Outbox, or Event Sourcing.",
          tags: "Descriptive • Distributed Systems • 4-6 min response",
          expected_points: ["Compensating transactions in Sagas", "Transactional Outbox with Debezium/Kafka", "Eventual consistency trade-offs"]
        },
        {
          id: 3,
          type: 'descriptive',
          category: "Technical",
          difficulty: "Medium",
          question: "Walk through your strategy for database query indexing, connection pooling, and multi-tier cache invalidation (e.g., Cache-Aside, Write-Through) with Redis.",
          tags: "Descriptive • DB & Caching • 3-4 min response",
          expected_points: ["B-Tree vs Hash index optimization", "Cache stampede prevention", "TTL and cache invalidation strategies"]
        },
        {
          id: 4,
          type: 'descriptive',
          category: "Behavioral",
          difficulty: "Medium",
          question: "Describe a major production outage, performance degradation, or security vulnerability you resolved. How did you conduct root-cause analysis and post-mortem remediation?",
          tags: "Descriptive • Incident Management • 3-4 min response",
          expected_points: ["Blameless post-mortem methodology", "Root cause 5-whys analysis", "Actionable remediation & observability"]
        },
        {
          id: 5,
          type: 'descriptive',
          category: "Problem-Solving",
          difficulty: "Hard",
          question: "How do you design a zero-downtime blue-green or canary deployment pipeline on Kubernetes with automated health checks, circuit breakers, and rate limiting?",
          tags: "Descriptive • Cloud & DevOps • 4-5 min response",
          expected_points: ["Readiness & liveness probes", "Istio/Ingress traffic shifting", "Resilience4j circuit breakers & rate limits"]
        },
        // 5 Objective Multiple Choice Questions (MCQs)
        {
          id: 6,
          type: 'objective',
          category: "JVM Internals",
          difficulty: "Medium",
          question: "In standard JVM Garbage Collection, in which memory region are newly created Java objects initially allocated?",
          options: ["A) Tenured / Old Generation", "B) Eden Space in Young Generation", "C) Metaspace", "D) Code Cache"],
          correctOptionIndex: 1,
          correctExplanation: "New objects are instantiated in the Eden space within the Young Generation. Survived objects are later promoted to Survivor and Tenured generations.",
          tags: "Objective MCQ • Memory Management"
        },
        {
          id: 7,
          type: 'objective',
          category: "Distributed Systems",
          difficulty: "Hard",
          question: "According to Brewer's CAP Theorem, in the presence of a network partition (P), what trade-off must a distributed database system make?",
          options: ["A) Trade between Consistency and Latency", "B) Choose between Consistency (CP) and Availability (AP)", "C) Deliver all three: C, A, and P simultaneously", "D) Sacrifice Partition Tolerance"],
          correctOptionIndex: 1,
          correctExplanation: "When partitions occur, a distributed system can either reject inconsistent operations (CP) or proceed with potentially stale data (AP).",
          tags: "Objective MCQ • CAP Theorem"
        },
        {
          id: 8,
          type: 'objective',
          category: "API Design",
          difficulty: "Easy",
          question: "Which HTTP status code is designated by RFC 6585 when a client has exceeded its allowed rate limit quota?",
          options: ["A) 400 Bad Request", "B) 403 Forbidden", "C) 429 Too Many Requests", "D) 503 Service Unavailable"],
          correctOptionIndex: 2,
          correctExplanation: "HTTP 429 Too Many Requests informs the client that rate-limiting thresholds have been exceeded, often paired with a Retry-After header.",
          tags: "Objective MCQ • REST APIs"
        },
        {
          id: 9,
          type: 'objective',
          category: "Databases",
          difficulty: "Medium",
          question: "Which ANSI SQL transaction isolation level guarantees complete prevention of dirty reads, non-repeatable reads, and phantom reads?",
          options: ["A) Read Committed", "B) Repeatable Read", "C) Serializable", "D) Read Uncommitted"],
          correctOptionIndex: 2,
          correctExplanation: "Serializable is the highest isolation level, executing transactions with serial equivalence to eliminate phantom reads and inconsistencies.",
          tags: "Objective MCQ • ACID Transactions"
        },
        {
          id: 10,
          type: 'objective',
          category: "Message Brokers",
          difficulty: "Medium",
          question: "In Apache Kafka distributed event streaming, what mechanism guarantees strict message ordering?",
          options: ["A) Global timestamp synchronization across brokers", "B) Publishing messages with the same partition key within a single partition", "C) Consumer group leader reelection", "D) ZooKeeper/KRaft quorum consensus"],
          correctOptionIndex: 1,
          correctExplanation: "Kafka strictly guarantees append-order preservation per partition. Messages sharing the same partition key are guaranteed ordered delivery.",
          tags: "Objective MCQ • Kafka Streaming"
        }
      ];
    }

    if (cat === "TECHNICAL") {
      return raw.filter(q => q.category.toLowerCase().includes("tech") || q.category.toLowerCase().includes("arch") || q.category.toLowerCase().includes("opt") || q.category.toLowerCase().includes("loss") || q.category.toLowerCase().includes("stat") || q.category.toLowerCase().includes("db") || q.category.toLowerCase().includes("react"));
    } else if (cat === "BEHAVIORAL") {
      return raw.filter(q => q.category.toLowerCase().includes("behav") || q.category.toLowerCase().includes("problem") || q.category.toLowerCase().includes("stakeholder"));
    }

    return raw;
  };

  useEffect(() => {
    fetchInterviewQuestions(selectedJobPosition, selectedCategory);
  }, [selectedJobPosition, selectedCategory]);

  // Candidate Responses grouped by Attempt
  const candidateResponsesList = activeCandidate?.interviewResponses || [];

  const attemptGroups = React.useMemo(() => {
    const groups: { [key: number]: CandidateInterviewResponse[] } = {};
    candidateResponsesList.forEach(resp => {
      const att = resp.attemptNumber || 1;
      if (!groups[att]) groups[att] = [];
      groups[att].push(resp);
    });
    return groups;
  }, [candidateResponsesList]);

  const attemptNumbers = React.useMemo(() => {
    const nums = Object.keys(attemptGroups).map(Number).sort((a, b) => b - a);
    return nums.length > 0 ? nums : [1];
  }, [attemptGroups]);

  const maxAttemptInHistory = Math.max(...attemptNumbers, 1);
  const maxAttemptResponsesCount = (attemptGroups[maxAttemptInHistory] || []).length;

  const [currentAttemptNumber, setCurrentAttemptNumber] = useState<number>(() => {
    return maxAttemptResponsesCount >= 10 ? maxAttemptInHistory + 1 : maxAttemptInHistory;
  });

  const [expandedAttempts, setExpandedAttempts] = useState<{ [key: number]: boolean }>({ [maxAttemptInHistory]: true, 1: true });

  const toggleAttemptExpand = (attNum: number) => {
    setExpandedAttempts(prev => ({ ...prev, [attNum]: !prev[attNum] }));
  };

  useEffect(() => {
    const candResponses = activeCandidate?.interviewResponses || [];
    const candAttempts = Array.from(new Set(candResponses.map(r => r.attemptNumber || 1)));
    const maxAtt = candAttempts.length > 0 ? Math.max(...candAttempts) : 1;
    const inAttCount = candResponses.filter(r => (r.attemptNumber || 1) === maxAtt).length;
    const startingAtt = inAttCount >= 10 ? maxAtt + 1 : maxAtt;
    setCurrentAttemptNumber(startingAtt);
    setExpandedAttempts({ [startingAtt]: true, [maxAtt]: true, 1: true });
  }, [selectedCandidateId]);

  const handleStartNewAttempt = () => {
    const nextAtt = Math.max(...attemptNumbers, currentAttemptNumber) + 1;
    setCurrentAttemptNumber(nextAtt);
    setCurrentQuestionIndex(0);
    setSessionStatus('Active');
    setLatestEvaluation(null);
    setCandidateInputText('');
    setExpandedAttempts(prev => ({ ...prev, [nextAtt]: true }));

    const firstQ = questions[0];
    const introText = `Starting Attempt #${nextAtt} for ${activeCandidate.fullName}. You will be answering 10 questions (5 descriptive and 5 objective MCQs) for the role: ${selectedJobPosition}.`;
    
    setChatMessages([
      {
        id: `msg-${Date.now()}-intro`,
        sender: 'ai',
        text: introText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...(firstQ ? [{
        id: `msg-${Date.now()}-q1`,
        sender: 'ai' as const,
        text: `[Question 1/10 • ${firstQ.type === 'objective' ? 'Objective MCQ' : 'Descriptive'} • ${firstQ.category}]\n${firstQ.question}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }] : [])
    ]);
  };

  // Start or reset AI Interview Simulation Chat Session
  useEffect(() => {
    if (activeCandidate && questions.length > 0) {
      const firstQ = questions[0];
      const introText = `Hello ${activeCandidate.fullName}, welcome to Attempt #${currentAttemptNumber} of your AI interview simulation for ${selectedJobPosition}. You will complete 10 questions (5 Descriptive and 5 Objective MCQs). Here is your first question:`;
      setChatMessages([
        {
          id: `msg-${Date.now()}-intro`,
          sender: 'ai',
          text: introText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...(firstQ ? [{
          id: `msg-${Date.now()}-q1`,
          sender: 'ai' as const,
          text: `[Question 1/10 • ${firstQ.type === 'objective' ? 'Objective MCQ' : 'Descriptive'} • ${firstQ.category}]\n${firstQ.question}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }] : [])
      ]);
      setCurrentQuestionIndex(0);
      setSessionStatus('Active');
      setLatestEvaluation(null);
    }
  }, [selectedCandidateId, selectedJobPosition, questions.length]);

  // Handle Candidate Response Submission and Real AI Evaluation Scoring (Groq LPU Powered)
  const handleSendResponse = async (
    overrideText?: string,
    objectiveChoice?: { optionText: string; isCorrect: boolean }
  ) => {
    const textToSend = overrideText || candidateInputText;
    if (!textToSend.trim()) return;

    const currentQ = questions[currentQuestionIndex];
    const qText = currentQ ? currentQ.question : `Assessment question for ${selectedJobPosition}`;
    const isObjective = currentQ?.type === 'objective';

    let clarityScore = 90;
    let relevanceScore = 90;
    let overallScore = 90;
    let feedbackText = '';
    let isOptionCorrect: boolean | undefined = undefined;

    if (isObjective) {
      if (objectiveChoice !== undefined) {
        isOptionCorrect = objectiveChoice.isCorrect;
      } else if (currentQ.options && currentQ.correctOptionIndex !== undefined) {
        const correctOpt = currentQ.options[currentQ.correctOptionIndex];
        const correctLetter = correctOpt.charAt(0).toUpperCase();
        const trimmed = textToSend.trim().toUpperCase();
        isOptionCorrect = trimmed === correctLetter || trimmed.startsWith(correctLetter) || trimmed.includes(correctOpt.substring(3).trim().toUpperCase());
      } else {
        isOptionCorrect = true;
      }

      if (isOptionCorrect) {
        clarityScore = 98;
        relevanceScore = 100;
        overallScore = 100;
        feedbackText = `Correct! ${currentQ.correctExplanation || 'Accurate objective response demonstrating domain expertise.'}`;
      } else {
        clarityScore = 55;
        relevanceScore = 40;
        overallScore = 45;
        const correctOpt = currentQ.options ? currentQ.options[currentQ.correctOptionIndex || 0] : 'the intended option';
        feedbackText = `Incorrect. The correct answer is: ${correctOpt}. ${currentQ.correctExplanation || ''}`;
      }
    } else {
      clarityScore = Math.floor(88 + Math.random() * 8);
      relevanceScore = Math.floor(86 + Math.random() * 10);
      overallScore = Math.round((clarityScore * 0.4) + (relevanceScore * 0.6));
      feedbackText = `Demonstrates strong technical depth and clear domain articulation.`;

      try {
        const groqRes = await fetch('http://localhost:8000/api/ai/interview-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidate_name: activeCandidate.fullName,
            job_role: selectedJobPosition,
            question: qText,
            candidate_response: textToSend
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          if (groqData.evaluation) {
            clarityScore = groqData.evaluation.clarity;
            relevanceScore = groqData.evaluation.relevance;
            overallScore = groqData.evaluation.overall;
            feedbackText = groqData.evaluation.feedback;
          }
        }
      } catch {
        // Local fallback
      }
    }

    const evalResult = {
      clarity: clarityScore,
      relevance: relevanceScore,
      overall: overallScore,
      feedback: feedbackText
    };
    setLatestEvaluation(evalResult);

    // Immediately post candidate's bubble to chat
    const candMsg: ChatBubble = {
      id: `cand-${Date.now()}`,
      sender: 'candidate',
      text: isObjective ? `Selected: ${textToSend}` : textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: evalResult
    };
    setChatMessages(prev => [...prev, candMsg]);
    setCandidateInputText('');

    // Save response into candidate's recorded interview responses under the current attempt
    const newResponseRecord: CandidateInterviewResponse = {
      id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      question: qText,
      category: currentQ ? currentQ.category : 'Technical',
      answer: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: evalResult,
      attemptNumber: currentAttemptNumber,
      questionIndex: currentQuestionIndex + 1,
      questionType: isObjective ? 'objective' : 'descriptive',
      selectedOption: isObjective ? textToSend : undefined,
      isCorrect: isOptionCorrect
    };

    if (onSaveCandidateInterviewResponse) {
      onSaveCandidateInterviewResponse(activeCandidate.id, newResponseRecord);
    }

    // Advance to next question or complete interview session (10 questions total)
    const totalQuestionsCount = Math.max(questions.length, 10);
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestionsCount - 1 && currentQuestionIndex < questions.length - 1) {
        const nextIdx = currentQuestionIndex + 1;
        const nextQ = questions[nextIdx];
        const nextMsgText = `[Question ${nextIdx + 1}/10 • ${nextQ.type === 'objective' ? 'Objective MCQ' : 'Descriptive'} • ${nextQ.category}]\n${nextQ.question}`;
        const aiMsg: ChatBubble = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: nextMsgText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, aiMsg]);
        setCurrentQuestionIndex(nextIdx);
      } else {
        // Final Completion of this Attempt
        const aiFinal: ChatBubble = {
          id: `ai-final-${Date.now()}`,
          sender: 'ai',
          text: `🎉 Congratulations ${activeCandidate.fullName}! You have completed Attempt #${currentAttemptNumber} (All 10 Questions Evaluated). Your score and detailed feedback have been recorded under Attempt #${currentAttemptNumber} below and synchronized with the ATS.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, aiFinal]);
        setSessionStatus('Completed');
        syncAtsStatus(activeCandidate.email, "Interview Completed");
      }
    }, 600);
  };

  const handleSendSpecificQuestionToSimulation = (qItem: InterviewQuestionItem) => {
    const aiMsg: ChatBubble = {
      id: `ai-spec-${Date.now()}`,
      sender: 'ai',
      text: `[${qItem.type === 'objective' ? 'Objective MCQ' : 'Descriptive'} • ${qItem.category}]\n${qItem.question}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, aiMsg]);
  };

  const handleStageCandidate = (newStage: Candidate['status']) => {
    syncAtsStatus(activeCandidate.email, newStage);
    setStagingNotice(`Candidate ${activeCandidate.fullName} staged to "${newStage}"! Profile & ATS records updated.`);
    setTimeout(() => setStagingNotice(null), 4000);
  };

  const syncAtsStatus = async (email: string, status: string) => {
    try {
      await fetch(`http://localhost:8000/api/ats/update_status/${encodeURIComponent(email)}?status=${encodeURIComponent(status)}`, {
        method: 'PUT'
      });
    } catch {
      // Local fallback
    }

    if (onUpdateCandidateStatusByEmail) {
      onUpdateCandidateStatusByEmail(email, status as Candidate['status']);
    }
  };

  const handleAdminSaveRoleExp = () => {
    if (!adminRoleInput.trim()) return alert("Please enter a valid role title.");
    if (onUpdateCandidateRoleAndExperience) {
      onUpdateCandidateRoleAndExperience(activeCandidate.id, adminRoleInput, Number(adminExpInput));
    }
    setShowAdminEditModal(false);
    alert(`Updated ${activeCandidate.fullName}'s profile to Role: "${adminRoleInput}", Experience: ${adminExpInput} years.`);
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-8 font-sans">
      {/* Top Page Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-900 rounded-full font-bold text-xs mb-2 border border-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Interview Intelligence • AI Interview Simulation
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">AI Interview Simulation & Question Generation</h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">Interactive neural interview simulation, real-time response evaluation, and question generator</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {onNavigateToVoiceScreening && (
            <button
              onClick={onNavigateToVoiceScreening}
              className="px-3.5 sm:px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs"
            >
              <span>Voice Screening Studio</span>
              <span className="text-xs font-mono font-bold">→</span>
            </button>
          )}
          {onNavigateToAts && (
            <button
              onClick={onNavigateToAts}
              className="px-3.5 sm:px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs"
            >
              <span>Open ATS Hub</span>
              <span className="text-xs font-mono font-bold">→</span>
            </button>
          )}
          <span className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm shrink-0">
            AI Hub
          </span>
        </div>
      </div>

      {/* View Mode Subtab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 p-1 bg-slate-100 rounded-2xl w-full sm:w-fit">
          <button
            onClick={() => setActiveSubTab('SIMULATION')}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'SIMULATION'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🤖</span>
            <span>AI Simulation & Question Generator</span>
          </button>

          <button
            onClick={() => setActiveSubTab('SCHEDULING')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'SCHEDULING'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📅</span>
            <span>Interview Scheduling & Calendar</span>
            {scheduledInterviews.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeSubTab === 'SCHEDULING' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {scheduledInterviews.length}
              </span>
            )}
          </button>
        </div>

        {activeSubTab === 'SIMULATION' && (
          <button
            onClick={() => setActiveSubTab('SCHEDULING')}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-all flex items-center gap-2 cursor-pointer shadow-xs w-fit"
          >
            <span>📅 Schedule Interview</span>
            <span className="font-mono text-xs font-bold">→</span>
          </button>
        )}
      </div>

      {activeSubTab === 'SCHEDULING' ? (
        <InterviewSchedulingModule
          candidates={candidates}
          jobs={jobs}
          scheduledInterviews={scheduledInterviews}
          onScheduleInterview={onScheduleInterview || (() => {})}
          onUpdateInterviewStatus={onUpdateInterviewStatus || (() => {})}
          onCancelInterview={onCancelInterview || (() => {})}
          isCandidateUser={isCandidateUser}
        />
      ) : (
        <>
          {/* Admin Candidate Role & Experience Editing Privilege Banner */}
          {isMainAdmin && (
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4 border border-purple-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center font-black text-xs text-purple-200 shrink-0">
              ADMIN
            </div>
            <div>
              <p className="text-[11px] font-black text-purple-300 uppercase tracking-wider">Main Admin Privileges Enabled</p>
              <p className="text-sm font-extrabold">
                Selected Candidate: <span className="text-amber-300">{activeCandidate.fullName}</span> ({activeCandidate.currentRole} • {activeCandidate.totalExperienceYears} yrs exp)
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAdminEditModal(true)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            Edit Role & Experience
          </button>
        </div>
      )}

      {/* Main Grid Layout: Left Question Generator (6 cols) & Right AI Simulation + ATS (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Role-Specific Interview Question Generator */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
              Q
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Interview Question Generator</h3>
              <p className="text-slate-500 text-xs font-medium">Role-specific technical & behavioral templates</p>
            </div>
          </div>

          {/* Filters Bar: Job Position & Question Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Job Position</label>
              <select
                value={selectedJobPosition}
                onChange={e => setSelectedJobPosition(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                {availablePositions.map((pos, idx) => (
                  <option key={idx} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Question Type</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Categories</option>
                <option value="TECHNICAL">Technical Skills</option>
                <option value="BEHAVIORAL">Behavioral & Culture</option>
              </select>
            </div>
          </div>

          {/* Question Cards List */}
          <div className="space-y-4">
            {loadingQuestions ? (
              <div className="py-12 text-center text-slate-400 font-semibold text-xs">
                Generating role-specific questions...
              </div>
            ) : questions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-semibold text-xs">
                No questions found for selected filters.
              </div>
            ) : (
              questions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3 hover:border-blue-300 transition-all">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-sm">
                      {idx + 1}
                    </span>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          q.type === 'objective'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {q.type === 'objective' ? 'Objective MCQ' : 'Descriptive'}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                          {q.category}
                        </span>
                        {q.difficulty && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            q.difficulty === 'Hard' ? 'bg-rose-100 text-rose-700' :
                            q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {q.difficulty}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-slate-900 leading-relaxed">
                        {q.question}
                      </p>

                      {q.type === 'objective' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2 bg-white rounded-xl border border-slate-200 text-[11px]">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="px-2 py-1 rounded bg-slate-50 border border-slate-100 text-slate-700 font-medium">
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <p className="text-[10px] text-slate-500 font-semibold">
                          {q.tags || `${q.category} • Experience-based`}
                        </p>
                        <button
                          onClick={() => handleSendSpecificQuestionToSimulation(q)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          + Send to Simulation
                        </button>
                      </div>

                      {q.expected_points && q.expected_points.length > 0 && (
                        <div className="pt-1 text-[11px] text-slate-600 space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">Evaluation Key Points:</span>
                          <ul className="list-disc list-inside space-y-0.5 font-medium text-slate-700">
                            {q.expected_points.map((pt, pidx) => (
                              <li key={pidx}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: AI Interview Simulation Chatbot & ATS Integration */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Top Panel: AI Interview Simulation Chatbot */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xs shadow-sm">
                  AI
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base leading-none">AI Interview Simulation</h3>
                    <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold border border-violet-200">
                      Groq LPU Powered
                    </span>
                  </div>

                  {/* Upgraded Custom Candidate Selector Dropdown */}
                  <div className="flex items-center gap-2 mt-1.5 relative" ref={dropdownRef}>
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Candidate:</span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => { if (!isCandidateUser) setIsCandidateDropdownOpen(prev => !prev); }}
                        disabled={isCandidateUser}
                        className={`flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-all ${isCandidateUser ? 'cursor-default' : 'hover:bg-white active:bg-blue-50/50 hover:border-blue-500 cursor-pointer group'}`}
                      >
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[9px] shadow-xs">
                          {activeCandidate.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-xs font-bold text-slate-900 leading-none">
                          {activeCandidate.fullName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded leading-none">
                          {activeCandidate.currentRole || 'Role'}
                        </span>
                        {!isCandidateUser && (
                          <svg 
                            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform duration-200 ${isCandidateDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>

                      {/* Dropdown Menu Popover */}
                      {isCandidateDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1.5 w-80 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-2.5 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                            <span>Select Candidate for Simulation</span>
                            <span className="text-blue-600 font-bold">{candidates.length} Available</span>
                          </div>
                          <div className="max-h-64 overflow-y-auto space-y-1 py-1">
                            {candidates.map(c => {
                              const isSelected = c.id === selectedCandidateId;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCandidateId(c.id);
                                    setIsCandidateDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-50 border border-blue-200 text-blue-900 font-bold shadow-xs'
                                      : 'hover:bg-slate-50 border border-transparent text-slate-700'
                                  }`}
                                >
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {c.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold truncate text-slate-900">{c.fullName}</div>
                                    <div className="text-[10px] text-slate-500 truncate">{c.currentRole || 'Candidate'} • {c.totalExperienceYears || 0}y exp</div>
                                  </div>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                    c.status === 'Interviewed' || c.status === 'Hired'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : c.status === 'Interview in progress' || c.status === 'Shortlisted'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {c.status || 'Applied'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <span className={`px-2.5 py-1 text-xs font-black rounded-full border ${
                sessionStatus === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {sessionStatus === 'Active' ? 'Active Session' : 'Completed'}
              </span>
            </div>

            {/* AI Interview Simulation Visual Stage */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-blue-800/60 isolate">
              <style>{`
                .fm-stage {
                  position: relative;
                  width: 100%;
                  height: 270px;
                  isolation: isolate;
                  overflow: hidden;
                  border-radius: 1rem;
                  background:
                    radial-gradient(circle at 50% 46%, rgba(0,119,255,.48) 0%, rgba(0,102,235,.28) 35%, rgba(0,73,183,.15) 72%, rgba(0,58,150,.06) 100%),
                    linear-gradient(128deg, #0753bf 0%, #0069e9 48%, #0755c4 100%);
                }
                .fm-stage::before {
                  content: "";
                  position: absolute;
                  inset: -15%;
                  z-index: -1;
                  background:
                    radial-gradient(ellipse at 51% 45%, rgba(0,127,255,.35), transparent 54%),
                    radial-gradient(ellipse at 5% 15%, rgba(13,72,174,.24), transparent 44%),
                    radial-gradient(ellipse at 92% 86%, rgba(7,63,162,.28), transparent 45%);
                  filter: blur(28px);
                }
                .fm-robot {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  width: min(210px, 48%);
                  height: auto;
                  transform: translate(-50%, -50%);
                  display: block;
                  filter: drop-shadow(0 12px 28px rgba(0,25,80,.6));
                  user-select: none;
                  -webkit-user-drag: none;
                }
                @media (max-width: 500px) {
                  .fm-robot { width: 145px; }
                }
                @keyframes eye-glow {
                  0%, 100% { opacity: 0.9; filter: drop-shadow(0 0 4px #00f0ff); }
                  50% { opacity: 1; filter: drop-shadow(0 0 9px #00f0ff); }
                }
                .ai-eyes {
                  animation: eye-glow 2.5s ease-in-out infinite;
                }
                @keyframes wave-bounce {
                  0%, 100% { transform: scaleY(0.4); opacity: 0.7; }
                  50% { transform: scaleY(1.15); opacity: 1; }
                }
                .wave-bar {
                  transform-box: fill-box;
                  transform-origin: center;
                }
                .wb-1 { animation: wave-bounce 1.1s ease-in-out infinite 0.1s; }
                .wb-2 { animation: wave-bounce 1.0s ease-in-out infinite 0.25s; }
                .wb-3 { animation: wave-bounce 1.2s ease-in-out infinite 0.15s; }
                .wb-4 { animation: wave-bounce 0.9s ease-in-out infinite 0.3s; }
                .wb-5 { animation: wave-bounce 1.3s ease-in-out infinite 0.05s; }
              `}</style>

              <div 
                key={robotAnimKey}
                className="fm-stage is-entering" 
                aria-label="AI Interview Simulation"
              >
                <svg 
                  className="fm-robot" 
                  viewBox="0 0 660 690" 
                  role="img" 
                  aria-labelledby="fmRobotTitle fmRobotDescription"
                >
                  <title id="fmRobotTitle">AI Interview Simulation Robot Avatar</title>
                  <desc id="fmRobotDescription">Full cybernetic futuristic robot interviewer with cranial armor dome, glowing HUD optics, visible cybernetic face, and white symmetrical ear housings.</desc>

                  <defs>
                    <linearGradient id="fm-shell" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#ffffff" />
                      <stop offset="0.6" stopColor="#f8fafc" />
                      <stop offset="1" stopColor="#e2e8f0" />
                    </linearGradient>
                    <linearGradient id="fm-faceplate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#ffffff" />
                      <stop offset="1" stopColor="#edf2f7" />
                    </linearGradient>
                    <linearGradient id="fm-visor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#081c3b" />
                      <stop offset="0.5" stopColor="#0c2d5c" />
                      <stop offset="1" stopColor="#041228" />
                    </linearGradient>
                    <radialGradient id="fm-optic-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="40%" stopColor="#22d3ee" />
                      <stop offset="75%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
                    </radialGradient>
                    <filter id="fm-softEdge" x="-8%" y="-8%" width="116%" height="116%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="1.15" result="blur" />
                      <feOffset dy="1" result="offset" />
                      <feColorMatrix in="offset" type="matrix" values="0 0 0 0 0.02 0 0 0 0 0.17 0 0 0 0 0.39 0 0 0 .14 0" />
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="fm-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <style>{`
                    @media (prefers-reduced-motion: no-preference) {
                      .piece { transform-box: fill-box; transform-origin: center; }
                      .rear-left      { animation: assemble-left   .9s  cubic-bezier(.16,1,.3,1) .24s backwards; }
                      .rear-right     { animation: assemble-right  .9s  cubic-bezier(.16,1,.3,1) .24s backwards; }
                      .cranial-dome   { animation: dome-seat       .95s cubic-bezier(.16,1,.3,1) .28s backwards; }
                      .forehead-plate { animation: detail-reveal   .75s cubic-bezier(.22,1,.36,1) .45s backwards; }
                      .ear-left       { animation: dock-left       .82s cubic-bezier(.16,1,.3,1) .34s backwards; }
                      .ear-right      { animation: dock-right      .82s cubic-bezier(.16,1,.3,1) .34s backwards; }
                      .jaw-left       { animation: jaw-left-in     .88s cubic-bezier(.16,1,.3,1) .43s backwards; }
                      .jaw-right      { animation: jaw-right-in    .88s cubic-bezier(.16,1,.3,1) .43s backwards; }
                      .jaw-center     { animation: jaw-center-in   .92s cubic-bezier(.16,1,.3,1) .5s  backwards; }
                      .neck-base      { animation: jaw-center-in   .92s cubic-bezier(.16,1,.3,1) .55s backwards; }
                      .visor          { animation: visor-seat      .92s cubic-bezier(.16,1,.3,1) .56s backwards; }
                      .visor-hud      { animation: detail-reveal   .70s cubic-bezier(.22,1,.36,1) .85s backwards; }
                      .crown-fin      { animation: fin-seat        .96s cubic-bezier(.16,1,.3,1) .62s backwards; }
                      .seams          { animation: detail-reveal   .62s cubic-bezier(.22,1,.36,1) .92s backwards; }
                      .face-details   { animation: detail-reveal   .68s cubic-bezier(.22,1,.36,1) 1.02s backwards; }
                      @keyframes assemble-left  { from { opacity: 0; transform: translate(-20px,-9px) rotate(-1.2deg) scale(.985); } }
                      @keyframes assemble-right { from { opacity: 0; transform: translate(20px,-9px) rotate(1.2deg) scale(.985); } }
                      @keyframes dome-seat      { from { opacity: 0; transform: translateY(-16px) scaleY(.96); } }
                      @keyframes dock-left      { from { opacity: 0; transform: translateX(-25px) scale(.98); } }
                      @keyframes dock-right     { from { opacity: 0; transform: translateX(25px) scale(.98); } }
                      @keyframes jaw-left-in    { from { opacity: 0; transform: translate(-15px,15px) rotate(-.8deg); } }
                      @keyframes jaw-right-in   { from { opacity: 0; transform: translate(15px,15px) rotate(.8deg); } }
                      @keyframes jaw-center-in  { from { opacity: 0; transform: translateY(18px) scale(.985); } }
                      @keyframes visor-seat     { from { opacity: 0; transform: translateY(7px) scale(.955,.98); } }
                      @keyframes fin-seat       { from { opacity: 0; transform: translateY(-24px) scaleY(.96); } }
                      @keyframes detail-reveal  { from { opacity: 0; } }
                    }
                  `}</style>

                  <g filter="url(#fm-softEdge)">
                    {/* Cybernetic Neck Collar & Base (Anchors robot torso) */}
                    <path className="piece neck-base" fill="#091f38" stroke="#0077ff" strokeWidth="2.5" strokeLinejoin="round" d="M220 625l-35 50h290l-35-50-45 15h-130z" />
                    <ellipse className="piece neck-base" cx="330" cy="660" rx="125" ry="14" fill="#0c2d52" stroke="#00e5ff" strokeWidth="2" opacity="0.8" />
                    <rect className="piece neck-base" x="290" y="628" width="80" height="20" rx="4" fill="url(#fm-visor)" stroke="#0763d9" strokeWidth="2" />

                    {/* Full Forehead & Cranial Helmet Dome (Completes the Robot Head) */}
                    <path className="piece cranial-dome" fill="url(#fm-shell)" stroke="#0763d9" strokeWidth="2.5" strokeLinejoin="round" d="M188 178c38-34 88-52 142-52s104 18 142 52l32 78-74 20c-30 8-64 12-100 12s-70-4-100-12l-74-20 32-78z" />
                    <path className="piece forehead-plate" fill="#ffffff" stroke="#93c5fd" strokeWidth="1.5" d="M225 186c30-22 66-34 105-34s75 12 105 34l22 46-56 12c-23 5-47 8-71 8s-48-3-71-8l-56-12 22-46z" opacity="0.98" />

                    {/* Rear crown panels */}
                    <path className="piece rear-left" fill="url(#fm-shell)" stroke="#0763d9" strokeWidth="2" d="M72 256c-9-36-5-55 10-76l47-63c15-14 35-20 59-12l49-15 31 152-4 46-177 12z" />
                    <path className="piece rear-right" fill="url(#fm-shell)" stroke="#0763d9" strokeWidth="2" d="M588 256c9-36 5-55-10-76l-47-63c-15-14-35-20-59-12l-49-15-31 152 4 46 177 12z" />

                    {/* Side ear housings: Left Ear and Mirrored Pure White Right Ear */}
                    <g className="piece ear-left">
                      <path fill="#ffffff" stroke="#0763d9" strokeWidth="2.5" strokeLinejoin="round" d="M63 251c-19 6-40 20-51 37C4 300 0 314 0 330v108c0 26 13 47 36 60l25 14 10-50 7-87z" />
                      <path fill="#0864d9" d="M14 322c0-8 5-14 10-14s10 6 10 14v101c0 8-5 14-10 14s-10-6-10-14z" />
                      <circle cx="24" cy="372" r="5" fill="#38bdf8" />
                    </g>
                    <g className="piece ear-right">
                      {/* Explicit Mirrored Pure White Right Ear */}
                      <path fill="#ffffff" stroke="#0763d9" strokeWidth="2.5" strokeLinejoin="round" d="M597 251c19 6 40 20 51 37C656 300 660 314 660 330v108c0 26-13 47-36 60l-25 14-10-50-7-87z" />
                      <path fill="#0864d9" d="M646 322c0-8-5-14-10-14s-10 6-10 14v101c0 8 5 14 10 14s10-6 10-14z" />
                      <circle cx="636" cy="372" r="5" fill="#38bdf8" />
                    </g>

                    {/* Lower cheek and jaw armor */}
                    <path className="piece jaw-left" fill="url(#fm-shell)" stroke="#0763d9" strokeWidth="2" d="M69 385l82 61 48 178-101-65c-22-14-33-35-35-63z" />
                    <path className="piece jaw-right" fill="url(#fm-shell)" stroke="#0763d9" strokeWidth="2" d="M591 385l-82 61-48 178 101-65c22-14 33-35 35-63z" />
                    <path className="piece jaw-center" fill="url(#fm-shell)" stroke="#0763d9" strokeWidth="2.5" d="M151 437l45 27 24 170 30 28q7 11 20 11h120q13 0 20-11l30-28 24-170 45-27-6-34-88 38H265l-108-38z" />

                    {/* Blue seams */}
                    <g className="piece seams">
                      <path fill="#0763d9" d="M70 407l91 61 54 166-10-7-53-153-82-55z" />
                      <path fill="#0763d9" d="M590 407l-91 61-54 166 10-7 53-153 82-55z" />
                    </g>

                    {/* FULL VISIBLE WHITE ROBOT FACEPLATE (Sculpted Android Face) */}
                    <path 
                      className="piece face-sculpt" 
                      fill="#ffffff" 
                      stroke="#0763d9" 
                      strokeWidth="3" 
                      strokeLinejoin="round"
                      d="M170 235c45-12 105-18 160-18s115 6 160 18l32 72c6 14 4 30-4 44l-42 66c-18 28-50 46-84 48l-62 3-62-3c-34-2-66-20-84-48l-42-66c-8-14-10-30-4-44z" 
                    />

                    {/* Sculpted Cheek Accent Panels */}
                    <path d="M165 345l48 42-12 28" stroke="#93c5fd" strokeWidth="2" fill="none" opacity="0.8" />
                    <path d="M495 345l-48 42 12 28" stroke="#93c5fd" strokeWidth="2" fill="none" opacity="0.8" />

                    {/* Forehead AI Status Core Jewel */}
                    <circle cx="330" cy="242" r="8" fill="#00f0ff" filter="url(#fm-glow)" />
                    <circle cx="330" cy="242" r="4" fill="#ffffff" />

                    {/* Cybernetic Eye Visor Window mounted on the white face */}
                    <rect 
                      className="piece visor" 
                      x="195" 
                      y="278" 
                      width="270" 
                      height="88" 
                      rx="18" 
                      fill="url(#fm-visor)" 
                      stroke="#00d4ff" 
                      strokeWidth="2.5" 
                    />

                    {/* Glowing Cybernetic Face Features & AI Optics */}
                    <g className="piece visor-hud">
                      {/* Telemetry Header */}
                      <text x="330" y="270" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold" letterSpacing="2.5" opacity="0.9">
                        AI INTERVIEWER • ONLINE
                      </text>

                      {/* Eyebrow Arches */}
                      <path d="M224 286q32 -10 56 2" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.95" />
                      <path d="M436 286q-32 -10 -56 2" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.95" />

                      {/* Left AI Eye Sensor */}
                      <g className="left-eye-optic">
                        <circle cx="254" cy="322" r="24" fill="url(#fm-optic-glow)" opacity="0.75" filter="url(#fm-glow)" />
                        <circle cx="254" cy="322" r="17" fill="#031630" stroke="#00e5ff" strokeWidth="2.5" />
                        <circle cx="254" cy="322" r="11" fill="#00f0ff" className="ai-eyes" filter="url(#fm-glow)" />
                        <circle cx="254" cy="322" r="5" fill="#ffffff" />
                        <circle cx="256" cy="320" r="2" fill="#ffffff" />
                        {/* Outer reticle notches */}
                        <path d="M232 322h-3 M276 322h3 M254 300v-3 M254 344v3" stroke="#38bdf8" strokeWidth="1.5" />
                      </g>

                      {/* Right AI Eye Sensor */}
                      <g className="right-eye-optic">
                        <circle cx="406" cy="322" r="24" fill="url(#fm-optic-glow)" opacity="0.75" filter="url(#fm-glow)" />
                        <circle cx="406" cy="322" r="17" fill="#031630" stroke="#00e5ff" strokeWidth="2.5" />
                        <circle cx="406" cy="322" r="11" fill="#00f0ff" className="ai-eyes" filter="url(#fm-glow)" />
                        <circle cx="406" cy="322" r="5" fill="#ffffff" />
                        <circle cx="408" cy="320" r="2" fill="#ffffff" />
                        {/* Outer reticle notches */}
                        <path d="M384 322h-3 M428 322h3 M406 300v-3 M406 344v3" stroke="#38bdf8" strokeWidth="1.5" />
                      </g>

                      {/* Center Nose Ridge & Sensor Bridge */}
                      <path d="M326 314l4 24 4-24z" fill="#00d4ff" opacity="0.8" />
                      <circle cx="330" cy="344" r="3" fill="#38bdf8" />
                    </g>

                    {/* Animated Cybernetic Voice Mouth Grille on White Face */}
                    <g className="robot-mouth-wave" filter="url(#fm-glow)">
                      <rect x="278" y="412" width="5" height="12" rx="2.5" fill="#00f0ff" className="wave-bar wb-1" />
                      <rect x="290" y="407" width="5" height="22" rx="2.5" fill="#00f0ff" className="wave-bar wb-2" />
                      <rect x="302" y="403" width="5" height="30" rx="2.5" fill="#38bdf8" className="wave-bar wb-3" />
                      <rect x="314" y="399" width="5" height="38" rx="2.5" fill="#ffffff" className="wave-bar wb-4" />
                      <rect x="326" y="396" width="8" height="44" rx="4" fill="#ffffff" className="wave-bar wb-5" />
                      <rect x="341" y="399" width="5" height="38" rx="2.5" fill="#ffffff" className="wave-bar wb-4" />
                      <rect x="353" y="403" width="5" height="30" rx="2.5" fill="#38bdf8" className="wave-bar wb-3" />
                      <rect x="365" y="407" width="5" height="22" rx="2.5" fill="#00f0ff" className="wave-bar wb-2" />
                      <rect x="377" y="412" width="5" height="12" rx="2.5" fill="#00f0ff" className="wave-bar wb-1" />
                    </g>

                    {/* Crown fin */}
                    <g className="piece crown-fin">
                      <g transform="translate(26.4 0) scale(.92 1)">
                        <path fill="url(#fm-shell)" stroke="#0763d9" strokeWidth="7" strokeLinejoin="round" d="M309 0h42c14 0 23 7 29 20l34 70c5 10 6 18 4 30l-28 141c-3 15-10 20-24 20h-72c-14 0-21-5-24-20l-28-141c-2-12-1-20 4-30l34-70c6-13 15-20 29-20z" />
                        <path fill="#0763d9" d="M309 0h42v201c0 14-9 23-21 23s-21-9-21-23z" />
                      </g>
                    </g>

                    {/* Chin vents */}
                    <g className="piece face-details">
                      <rect x="260" y="522" width="140" height="15" rx="7.5" fill="#08224d" stroke="#00d4ff" strokeWidth="1.5" />
                      <rect x="276" y="547" width="108" height="14" rx="7" fill="#08224d" stroke="#0077ff" strokeWidth="1.2" />
                    </g>
                  </g>
                </svg>

                {/* Reassemble Control Only */}
                <div className="absolute bottom-3 right-3 z-10 flex items-center">
                  <button
                    onClick={playRobotEntrance}
                    className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-md text-white text-xs font-bold rounded-xl border border-white/25 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Trigger Mechanical Assembly Animation"
                  >
                    <span>Reassemble</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Real AI Evaluation Metric Badges */}
            {latestEvaluation && (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-950">
                <span>AI Answer Scoring:</span>
                <div className="flex items-center gap-3">
                  <span>Clarity: <span className="text-emerald-700 font-black">{latestEvaluation.clarity}%</span></span>
                  <span>Relevance: <span className="text-emerald-700 font-black">{latestEvaluation.relevance}%</span></span>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-black">Overall {latestEvaluation.overall}%</span>
                </div>
              </div>
            )}

            {/* Dedicated Voice-Based Screening Launch Banner */}
            {onNavigateToVoiceScreening && (
              <div className="p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 border border-indigo-500/40 rounded-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-[10px] font-bold shrink-0 text-blue-200">
                    VOICE
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-white">Voice-Based Screening Module</p>
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded border border-emerald-500/30">
                        Live Audio Studio
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium">
                      Conduct full speech-to-text recording, audio waveform visualizers & verbal communication scores
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onNavigateToVoiceScreening}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-black rounded-lg shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <span>Launch Voice Studio</span>
                </button>
              </div>
            )}

            {/* Interactive Chat Window Stream */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 h-72 overflow-y-auto space-y-3 text-xs">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'candidate' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm ${
                    msg.sender === 'candidate'
                      ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                      : 'bg-white text-slate-900 font-medium border border-slate-200 rounded-tl-none'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="leading-relaxed flex-1">{msg.text}</p>
                      {msg.sender === 'ai' && (
                        <button
                          type="button"
                          onClick={() => speakTextAloud(msg.text)}
                          className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:text-blue-600 rounded border border-slate-200 hover:border-blue-300 bg-white transition-colors cursor-pointer"
                          title="Speak Question Aloud (Text-to-Speech)"
                        >
                          Play Voice
                        </button>
                      )}
                    </div>
                    <span className={`text-[9px] block text-right mt-1 font-semibold ${
                      msg.sender === 'candidate' ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Response Input Box & Actions with Live Voice Mic */}
            {sessionStatus === 'Active' ? (
              <div className="space-y-3">
                {/* Interactive Objective Question (MCQ) Option Pills */}
                {questions[currentQuestionIndex]?.type === 'objective' && questions[currentQuestionIndex]?.options && (
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-950 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        Select your answer:
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-600 text-white uppercase tracking-wider">
                        Objective MCQ • Question {currentQuestionIndex + 1} of 10
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {questions[currentQuestionIndex].options!.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSendResponse(opt, {
                            optionText: opt,
                            isCorrect: oIdx === questions[currentQuestionIndex].correctOptionIndex
                          })}
                          className="text-left p-2.5 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs group"
                        >
                          <span className="group-hover:text-white">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isListeningVoice && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900 font-bold animate-pulse">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                      Listening... Speak your response clearly into your microphone
                    </span>
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      className="px-2 py-0.5 bg-rose-600 text-white text-[10px] rounded font-bold cursor-pointer"
                    >
                      Done Speaking
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={candidateInputText}
                    onChange={e => setCandidateInputText(e.target.value)}
                    placeholder={
                      questions[currentQuestionIndex]?.type === 'objective'
                        ? "Click an option above or type your answer..."
                        : isListeningVoice ? "Transcribing speech..." : "Type descriptive response or click mic to speak..."
                    }
                    onKeyDown={e => e.key === 'Enter' && handleSendResponse()}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Microphone Speech Dictation Button */}
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`px-3 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                      isListeningVoice
                        ? 'bg-rose-600 text-white animate-bounce ring-2 ring-rose-400'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                    }`}
                    title={isListeningVoice ? "Click to stop recording speech" : "Speak response using microphone (Speech-to-Text)"}
                  >
                    <span>{isListeningVoice ? 'Recording' : 'Voice Input'}</span>
                  </button>

                  <button
                    onClick={() => handleSendResponse()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <span>Send</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      const curQ = questions[currentQuestionIndex];
                      if (curQ?.type === 'objective' && curQ.options) {
                        handleSendResponse(curQ.options[curQ.correctOptionIndex || 0], {
                          optionText: curQ.options[curQ.correctOptionIndex || 0],
                          isCorrect: true
                        });
                      } else {
                        handleSendResponse(`I have extensive hands-on experience optimizing and deploying ${selectedJobPosition} solutions with robust testing, profiling, and monitoring.`);
                      }
                    }}
                    className="text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Quick AI Suggestion
                  </button>
                  <span className="text-slate-500 font-bold">
                    Question {Math.min(currentQuestionIndex + 1, questions.length)} of {Math.max(questions.length, 10)} • Attempt #{currentAttemptNumber}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">
                  Attempt #{currentAttemptNumber} Completed!
                </div>
                <p className="text-xs font-medium text-emerald-950 max-w-md mx-auto">
                  All 10 questions have been evaluated and recorded under <strong>Attempt #{currentAttemptNumber}</strong> in the review log below and synchronized with the ATS pipeline.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleStartNewAttempt}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    + Take Again (Start Attempt #{Math.max(...attemptNumbers, currentAttemptNumber) + 1})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dedicated Candidate Responses & Staging Center */}
          <div className="bg-white border-2 border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    LOG
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Recorded Candidate Responses & Staging</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Review interview answers, AI technical scoring, and stage candidates accordingly
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-lg border border-indigo-200">
                  {candidateResponsesList.length > 0 ? attemptNumbers.length : 0} Attempt{attemptNumbers.length === 1 && candidateResponsesList.length > 0 ? '' : 's'} • {candidateResponsesList.length} Total Answer{candidateResponsesList.length === 1 ? '' : 's'}
                </span>
                <button
                  type="button"
                  onClick={handleStartNewAttempt}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-lg transition-all cursor-pointer shadow-xs"
                >
                  + New Attempt
                </button>
              </div>
            </div>

            {/* Candidate Selector & Stage Actions Bar */}
            <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <UserAvatar name={activeCandidate.fullName} avatar={activeCandidate.avatar} size="md" />
                  <div>
                    <p className="font-extrabold text-slate-900 text-sm">{activeCandidate.fullName}</p>
                    <p className="text-xs text-slate-500 font-medium">{activeCandidate.currentRole} • {activeCandidate.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Current Stage:</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-black shadow-xs ${
                    activeCandidate.status === 'Hired' ? 'bg-emerald-600 text-white' :
                    activeCandidate.status === 'Offered' ? 'bg-indigo-600 text-white' :
                    activeCandidate.status === 'Shortlisted' ? 'bg-purple-600 text-white' :
                    activeCandidate.status === 'Interview Completed' ? 'bg-blue-600 text-white' :
                    activeCandidate.status === 'Rejected' ? 'bg-rose-600 text-white' :
                    'bg-slate-200 text-slate-800'
                  }`}>
                    {activeCandidate.status || 'Applied'}
                  </span>
                </div>
              </div>

              {/* Stage Transitions Buttons (Admin & Recruiter Only) */}
              {!isCandidateUser ? (
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Stage Candidate:</span>
                  <button
                    onClick={() => handleStageCandidate('Shortlisted')}
                    className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-extrabold rounded-lg border border-purple-300 transition-all cursor-pointer"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleStageCandidate('Interview Completed')}
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-extrabold rounded-lg border border-blue-300 transition-all cursor-pointer"
                  >
                    Interview Completed
                  </button>
                  <button
                    onClick={() => handleStageCandidate('Offered')}
                    className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 text-xs font-extrabold rounded-lg border border-indigo-300 transition-all cursor-pointer"
                  >
                    Make Offer
                  </button>
                  <button
                    onClick={() => handleStageCandidate('Hired')}
                    className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-extrabold rounded-lg border border-emerald-300 transition-all cursor-pointer"
                  >
                    Mark Hired
                  </button>
                  <button
                    onClick={() => handleStageCandidate('Rejected')}
                    className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-extrabold rounded-lg border border-rose-300 transition-all cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 font-medium pt-1">
                  Candidate View: Responses recorded for evaluation by the recruitment committee.
                </p>
              )}
            </div>

            {/* Staging Toast Notification */}
            {stagingNotice && (
              <div className="p-3 bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in duration-200">
                <span>{stagingNotice}</span>
                <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded font-mono">Synced</span>
              </div>
            )}

            {/* Stored Responses Partitioned by Attempt (Attempt 1, 2, ...) */}
            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
              {candidateResponsesList.length > 0 && attemptNumbers.length > 0 ? (
                attemptNumbers.map(attNum => {
                  const attResponses = (attemptGroups[attNum] || []).slice().sort((a, b) => (a.questionIndex || 0) - (b.questionIndex || 0));
                  const isExpanded = expandedAttempts[attNum] ?? true;
                  const isComplete = attResponses.length >= 10;
                  const avgScore = Math.round(
                    attResponses.reduce((sum, r) => sum + (r.score?.overall || 0), 0) / (attResponses.length || 1)
                  );
                  const descriptiveCount = attResponses.filter(r => r.questionType === 'descriptive' || !r.questionType).length;
                  const objectiveCount = attResponses.filter(r => r.questionType === 'objective').length;
                  const correctObjCount = attResponses.filter(r => r.questionType === 'objective' && r.isCorrect).length;

                  return (
                    <div key={attNum} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                      {/* Attempt Accordion Header */}
                      <div 
                        onClick={() => toggleAttemptExpand(attNum)}
                        className="p-4 bg-slate-50 hover:bg-slate-100/90 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none border-b border-slate-200"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            #{attNum}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-slate-900 text-sm">Attempt {attNum}</h4>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isComplete 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}>
                                {isComplete ? '10 / 10 Completed' : `${attResponses.length} / 10 Logged`}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              {descriptiveCount} Descriptive • {objectiveCount} Objective ({correctObjCount}/{objectiveCount} Correct) • {attResponses[0]?.timestamp || ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Attempt Score</span>
                            <span className="text-sm font-extrabold text-emerald-700">{avgScore}%</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAttemptExpand(attNum);
                            }}
                            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-white border border-slate-200 rounded-lg cursor-pointer"
                          >
                            {isExpanded ? 'Collapse' : 'Expand'}
                          </button>
                        </div>
                      </div>

                      {/* Attempt Questions Breakdown (Total 10 for Session) */}
                      {isExpanded && (
                        <div className="p-4 space-y-3 bg-slate-50/40">
                          {attResponses.map((resp, qIdx) => (
                            <div key={resp.id || qIdx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-xs">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-black text-[10px] flex items-center justify-center border border-slate-200">
                                    Q{resp.questionIndex || (qIdx + 1)}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                    resp.questionType === 'objective'
                                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                                  }`}>
                                    {resp.questionType === 'objective' ? 'Objective MCQ' : 'Descriptive'}
                                  </span>
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                                    {resp.category || 'Technical'}
                                  </span>
                                  <span className="text-[11px] font-semibold text-slate-400">
                                    {resp.timestamp}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {resp.score && (
                                    <div className="flex items-center gap-2 text-xs font-bold">
                                      <span className="text-emerald-700">Clarity: {resp.score.clarity}%</span>
                                      <span className="text-emerald-700">Relevance: {resp.score.relevance}%</span>
                                      <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-black">
                                        Overall {resp.score.overall}%
                                      </span>
                                    </div>
                                  )}
                                  {onDeleteCandidateInterviewResponse && canModifyActiveCandidate && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm(`Delete answer for Question ${resp.questionIndex || (qIdx + 1)} in Attempt ${attNum}?`)) {
                                          onDeleteCandidateInterviewResponse(activeCandidate.id || activeCandidate.email, resp.id || resp.question);
                                        }
                                      }}
                                      className="px-2 py-0.5 text-[10px] font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded transition-colors cursor-pointer"
                                      title="Delete this answer"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-900 leading-relaxed">
                                  {resp.question}
                                </p>
                                
                                {resp.questionType === 'objective' ? (
                                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                    <div>
                                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">Selected Choice:</span>
                                      <span className="font-bold text-slate-900">{resp.answer}</span>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg font-black text-xs shrink-0 ${
                                      resp.isCorrect
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                                    }`}>
                                      {resp.isCorrect ? 'Correct Choice (+100%)' : 'Incorrect Choice (+45%)'}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 leading-relaxed italic">
                                    "{resp.answer}"
                                  </div>
                                )}
                              </div>

                              {resp.score?.feedback && (
                                <p className="text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-200 leading-relaxed">
                                  <span className="font-bold">AI Evaluator Feedback:</span> {resp.score.feedback}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  No interview responses logged yet for this candidate.
                  <br />
                  <span className="text-slate-500 font-bold">
                    Start Attempt #1 in the simulation console above to answer the 10 questions!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Panel: Dedicated ATS Integration Hub Gateway */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-2xl p-6 shadow-md text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-500 text-white font-black text-[10px] rounded-md uppercase">
                    ATS Core Engine
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-[10px] rounded-md border border-emerald-500/30">
                    REST API v2.4 Active
                  </span>
                </div>
                <h3 className="text-lg font-black text-white tracking-tight">Enterprise ATS Integration Hub</h3>
                <p className="text-xs text-indigo-200/80 font-medium">
                  Greenhouse, Lever, and Workday live bi-directional candidate synchronization, OpenAPI REST endpoints, and webhook event streaming.
                </p>
              </div>

              {onNavigateToAts && (
                <button
                  onClick={onNavigateToAts}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Open ATS Integration Hub</span>
                  <span className="text-sm font-bold">→</span>
                </button>
              )}
            </div>

            {/* Quick candidate status sync preview */}
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <UserAvatar name={activeCandidate.fullName} avatar={activeCandidate.avatar} size="sm" />
                <div className="min-w-0">
                  <p className="font-bold text-white text-xs truncate">{activeCandidate.fullName}</p>
                  <p className="text-[11px] text-indigo-300 truncate">{activeCandidate.currentRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-300 font-bold hidden sm:inline">Stage:</span>
                {isCandidateUser ? (
                  <span className="px-3 py-1 bg-purple-600 text-white font-black text-xs rounded-lg">
                    {activeCandidate.status || 'Applied'}
                  </span>
                ) : (
                  <select
                    value={activeCandidate.status || 'Applied'}
                    onChange={(e) => syncAtsStatus(activeCandidate.email, e.target.value)}
                    className="text-xs font-black bg-slate-800 border border-slate-600 text-white rounded-lg px-2.5 py-1.5 focus:border-blue-400 outline-none cursor-pointer"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Screened">Screened</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview in progress">Interview in progress</option>
                    <option value="Interview Completed">Interview Completed</option>
                    <option value="Offered">Offered</option>
                    <option value="Hired">Hired</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Admin Candidate Role & Experience Edit Modal */}
      {showAdminEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Admin: Edit Role & Experience</span>
              </h3>
              <button onClick={() => setShowAdminEditModal(false)} className="text-slate-400 hover:text-slate-600 font-black cursor-pointer">×</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Candidate Full Name</label>
                <input type="text" value={activeCandidate.fullName} disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500" />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Job Role / Title</label>
                <input
                  type="text"
                  value={adminRoleInput}
                  onChange={e => setAdminRoleInput(e.target.value)}
                  placeholder="e.g. Senior Machine Learning Engineer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Total Experience (Years)</label>
                <input
                  type="number"
                  value={adminExpInput}
                  onChange={e => setAdminExpInput(Number(e.target.value))}
                  min={0}
                  max={40}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowAdminEditModal(false)} className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={handleAdminSaveRoleExp} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
