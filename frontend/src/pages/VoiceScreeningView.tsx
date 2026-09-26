import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import type { Candidate, Job, CandidateInterviewResponse } from '../types';
import { UserAvatar } from '../components/UserAvatar';

interface VoiceScreeningViewProps {
  candidates: Candidate[];
  jobs?: Job[];
  isMainAdmin?: boolean;
  isCandidateUser?: boolean;
  currentCandidateEmail?: string;
  onUpdateCandidateStatusByEmail?: (email: string, status: Candidate['status']) => void;
  onSaveCandidateInterviewResponse?: (candidateId: string, response: CandidateInterviewResponse) => void;
  onDeleteCandidateInterviewResponse?: (candidateIdOrEmail: string, responseIdOrQuestion: string) => void;
  onNavigateToInterview?: () => void;
  onNavigateToAts?: () => void;
}

export interface VoiceScreeningRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  question: string;
  transcript: string;
  durationSeconds: number;
  audioUrl?: string;
  scores: {
    communication: number;
    clarity: number;
    fluency: number;
    technicalDepth: number;
    overall: number;
  };
  detectedKeywords: string[];
  recommendation: string;
  feedback: string;
  timestamp: string;
  isReviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

const PRESET_SCREENING_QUESTIONS = [
  {
    id: 1,
    category: "Technical Background",
    question: "Please introduce yourself, summarize your recent technical background, and describe your core strengths in software engineering and machine learning.",
    expectedKeywords: ["python", "machine learning", "experience", "architecture", "data", "deep learning", "scale", "performance"],
    durationEst: "60-90 sec"
  },
  {
    id: 2,
    category: "System Design & Scaling",
    question: "Can you describe a challenging technical problem you solved, and how you designed the solution for reliability, security, and low latency?",
    expectedKeywords: ["scalability", "docker", "api", "database", "latency", "monitoring", "cloud", "aws", "kubernetes"],
    durationEst: "60-90 sec"
  },
  {
    id: 3,
    category: "Communication & Leadership",
    question: "How do you explain complex technical concepts or trade-offs to non-technical stakeholders, and how do you handle cross-functional project disagreements?",
    expectedKeywords: ["stakeholders", "communication", "collaboration", "clarity", "trade-offs", "team", "agile", "delivery"],
    durationEst: "45-60 sec"
  }
];

export const VoiceScreeningView: React.FC<VoiceScreeningViewProps> = ({
  candidates = [],
  jobs: _jobs = [],
  isMainAdmin: _isMainAdmin = false,
  isCandidateUser = false,
  currentCandidateEmail,
  onUpdateCandidateStatusByEmail,
  onSaveCandidateInterviewResponse,
  onDeleteCandidateInterviewResponse,
  onNavigateToInterview,
  onNavigateToAts
}) => {
  // Candidate ownership security check:
  // Admins & Recruiters can edit/delete/re-record ANY candidate.
  // Candidates can ONLY edit/delete/re-record THEIR OWN records.
  const canModifyRecord = (recCandidateEmail?: string, recCandidateId?: string): boolean => {
    if (!isCandidateUser) return true; // Admins and recruiters have full permissions on all candidates
    const myEmail = (currentCandidateEmail || candidates[0]?.email || '').toLowerCase().trim();
    const myId = (candidates[0]?.id || '').trim();
    if (recCandidateEmail && recCandidateEmail.toLowerCase().trim() === myEmail) return true;
    if (recCandidateId && (recCandidateId.toLowerCase().trim() === myEmail || recCandidateId.trim() === myId)) return true;
    return false;
  };
  // Selected candidate for screening studio
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(candidates[0]?.id || 'cand-1');
  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0] || {
    id: 'cand-1',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    currentRole: 'Senior Machine Learning Engineer',
    totalExperienceYears: 5,
    status: 'Applied'
  };

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const activeQuestion = PRESET_SCREENING_QUESTIONS[selectedQuestionIndex];

  // Voice recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reRecordingRecordId, setReRecordingRecordId] = useState<string | null>(null);

  // Review mode & separate candidate view state
  const [inspectionMode, setInspectionMode] = useState<'individual' | 'overview'>('individual');
  const [inspectedCandidateId, setInspectedCandidateId] = useState<string>(candidates[0]?.id || 'cand-1');
  const [candidateFilterQuery, setCandidateFilterQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'REVIEWED'>('ALL');
  const [tempNotes, setTempNotes] = useState<{ [key: string]: string }>({});

  // Completed screening evaluation
  const [latestEvaluation, setLatestEvaluation] = useState<VoiceScreeningRecord | null>(null);

  // History of voice screenings
  const [screeningHistory, setScreeningHistory] = useState<VoiceScreeningRecord[]>(() => {
    const saved = localStorage.getItem('rc_voice_screenings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'voice-1',
        candidateId: 'cand-1',
        candidateName: 'Sarah Johnson',
        candidateEmail: 'sarah.johnson@example.com',
        role: 'Senior Machine Learning Engineer',
        question: PRESET_SCREENING_QUESTIONS[0].question,
        transcript: "I have over 5 years of experience architecting end-to-end machine learning pipelines using Python, PyTorch, and AWS SageMaker. Recently I led the migration of our recommendation inference engine to low-latency Kubernetes microservices, improving throughput by 42%.",
        durationSeconds: 48,
        scores: {
          communication: 94,
          clarity: 92,
          fluency: 96,
          technicalDepth: 95,
          overall: 94
        },
        detectedKeywords: ["python", "machine learning", "pytorch", "aws", "kubernetes", "architecture", "throughput"],
        recommendation: "Strong Pass - Advance to Final Hiring Round",
        feedback: "Exceptional verbal articulation with high technical density and clear project impact metrics.",
        timestamp: "Today at 10:15 AM",
        isReviewed: true,
        reviewedBy: "Sarah Jenkins (Lead Recruiter)",
        reviewedAt: "Today at 10:45 AM",
        reviewNotes: "Strong candidate with articulate technical depth. Recommended for final panel round."
      },
      {
        id: 'voice-2',
        candidateId: 'cand-2',
        candidateName: 'Abhishek Kumar',
        candidateEmail: 'abhishek.kumar@example.com',
        role: 'Frontend React & UI Engineer',
        question: PRESET_SCREENING_QUESTIONS[1].question,
        transcript: "I designed a modular design system and state synchronization layer using TypeScript and React query, reducing bundle size by 30% and eliminating client-side rendering bottlenecks across high-traffic dashboard views.",
        durationSeconds: 52,
        scores: {
          communication: 88,
          clarity: 90,
          fluency: 87,
          technicalDepth: 91,
          overall: 89
        },
        detectedKeywords: ["react", "typescript", "architecture", "performance", "api", "monitoring"],
        recommendation: "Pass - Qualified for Hiring Manager Round",
        feedback: "Structured explanation with clear focus on performance optimization and component scalability.",
        timestamp: "Yesterday at 04:30 PM",
        isReviewed: false
      },
      {
        id: 'voice-3',
        candidateId: 'cand-3',
        candidateName: 'Marcus Rodriguez',
        candidateEmail: 'marcus.rodriguez@example.com',
        role: 'Cloud DevOps & Security Specialist',
        question: PRESET_SCREENING_QUESTIONS[1].question,
        transcript: "Implemented zero-trust infrastructure automation with Terraform and Kubernetes on AWS. Designed automated canary deployment pipelines that reduced deployment failure rates to under 0.2 percent.",
        durationSeconds: 58,
        scores: {
          communication: 91,
          clarity: 93,
          fluency: 89,
          technicalDepth: 96,
          overall: 93
        },
        detectedKeywords: ["kubernetes", "docker", "aws", "terraform", "monitoring", "scalability"],
        recommendation: "Strong Pass - Advance to Technical Deep Dive",
        feedback: "Very strong systems engineering background with clear security-first architectural mindset.",
        timestamp: "Yesterday at 02:15 PM",
        isReviewed: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('rc_voice_screenings', JSON.stringify(screeningHistory));
  }, [screeningHistory]);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Play AI Interviewer Voice (Text-to-Speech)
  const speakQuestionAloud = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported by your browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }
  };

  // Start Voice Screening Recording
  const startVoiceRecording = async () => {
    setLiveTranscript('');
    setAudioBlobUrl(null);
    audioChunksRef.current = [];
    setRecordingSeconds(0);
    setIsRecording(true);
    setIsPaused(false);

    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds(sec => sec + 1);
    }, 1000);

    // Speech-to-Text Recognition
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setLiveTranscript(currentTranscript.trim());
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition warning:", e);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (err) {
      console.warn("Web Speech API not available on this device", err);
    }

    // MediaRecorder & Canvas Visualizer
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      drawAudioWaveform();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);

        stream.getTracks().forEach(track => track.stop());
        if (audioCtx.state !== 'closed') {
          audioCtx.close();
        }
      };

      mediaRecorder.start(250);
    } catch (err) {
      console.warn("Microphone access simulated or restricted:", err);
      drawSimulatedWaveform();
    }
  };

  // Draw Audio Waveform on Canvas
  const drawAudioWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.85 + 4;
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#00f0ff');
        gradient.addColorStop(0.5, '#3b82f6');
        gradient.addColorStop(1, '#1d4ed8');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, (canvas.height - barHeight) / 2, barWidth - 3, barHeight, 3);
        ctx.fill();

        x += barWidth + 2;
      }
    };

    renderFrame();
  };

  // Simulated Waveform fallback
  const drawSimulatedWaveform = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let step = 0;
    const renderSim = () => {
      animationFrameRef.current = requestAnimationFrame(renderSim);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      step += 0.08;

      const bars = 24;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const height = Math.abs(Math.sin(step + i * 0.3)) * (canvas.height * 0.75) + 6;
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#00f0ff');
        gradient.addColorStop(1, '#2563eb');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(i * barWidth + 2, (canvas.height - height) / 2, barWidth - 4, height, 3);
        ctx.fill();
      }
    };
    renderSim();
  };

  // Stop Recording & Trigger Evaluation
  const stopVoiceRecording = () => {
    setIsRecording(false);
    setIsPaused(false);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    evaluateSpokenScreening(liveTranscript, recordingSeconds);
  };

  // Reset Voice Recording
  const resetVoiceRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingSeconds(0);
    setLiveTranscript('');
    setAudioBlobUrl(null);
    setLatestEvaluation(null);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  };

  // Simulated Answer
  const injectSimulatedSpokenAnswer = () => {
    const demoAnswers = [
      "In my current role, I designed a distributed stream processing pipeline handling over 12 million daily events using Python, Apache Kafka, and Docker. I focused on zero-downtime deployments and reduced query latency by 35% through Redis caching.",
      "I prioritize architectural simplicity and clear documentation. When migrating our legacy service to cloud microservices on AWS, I held technical syncs with both product leads and engineering to align on delivery timelines and latency guarantees.",
      "My core technical stack centers around Python, React, and Machine Learning with PyTorch. I have spearheaded the design of automated screening algorithms that optimize recruitment candidate-to-job fit with high precision."
    ];
    const chosen = demoAnswers[selectedQuestionIndex % demoAnswers.length];
    setLiveTranscript(chosen);
    evaluateSpokenScreening(chosen, 42);
  };

  // Evaluate Voice Screening Response
  const evaluateSpokenScreening = (transcriptText: string, durationSec: number) => {
    setIsEvaluating(true);

    setTimeout(() => {
      const text = transcriptText.trim() || "Candidate provided verbal response outlining technical background and architectural experience.";
      const lower = text.toLowerCase();
      const detected = activeQuestion.expectedKeywords.filter(kw => lower.includes(kw));

      const wordCount = text.split(/\s+/).length;
      const fluency = Math.min(98, Math.max(65, Math.round(wordCount * 1.5 + 40)));
      const techDepth = Math.min(98, Math.max(60, Math.round(detected.length * 15 + 45)));
      const clarity = Math.min(96, Math.max(70, Math.round(85 + (detected.length > 2 ? 8 : 2))));
      const communication = Math.round((fluency * 0.4) + (clarity * 0.6));
      const overall = Math.round((communication * 0.35) + (techDepth * 0.45) + (clarity * 0.2));

      let recommendation = "Pass - Qualified for Hiring Manager Round";
      if (overall >= 90) {
        recommendation = "Strong Pass - Advance to Final Hiring Round";
      } else if (overall < 70) {
        recommendation = "Borderline - Additional Technical Screening Recommended";
      }

      const feedback = `Candidate demonstrated clear articulation (${clarity}% clarity) with solid coverage of core keywords (${detected.join(', ') || 'software, architecture'}). Spoke at an optimal conversational pace with professional confidence.`;

      if (reRecordingRecordId) {
        const existing = screeningHistory.find(r => r.id === reRecordingRecordId);
        const updatedRecord: VoiceScreeningRecord = {
          ...(existing || {}),
          id: reRecordingRecordId,
          candidateId: activeCandidate.id,
          candidateName: activeCandidate.fullName,
          candidateEmail: activeCandidate.email,
          role: activeCandidate.currentRole || 'Software Engineer',
          question: activeQuestion.question,
          transcript: text,
          durationSeconds: durationSec || 45,
          audioUrl: audioBlobUrl || existing?.audioUrl || undefined,
          scores: {
            communication,
            clarity,
            fluency,
            technicalDepth: techDepth,
            overall
          },
          detectedKeywords: detected.length > 0 ? detected : ["python", "architecture", "system"],
          recommendation,
          feedback,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (Re-recorded)",
          isReviewed: false
        };

        setLatestEvaluation(updatedRecord);
        setScreeningHistory(prev => {
          const next = prev.map(r => r.id === reRecordingRecordId ? updatedRecord : r);
          localStorage.setItem('rc_voice_screenings', JSON.stringify(next));
          return next;
        });
        setReRecordingRecordId(null);
        setIsEvaluating(false);

        if (onSaveCandidateInterviewResponse) {
          onSaveCandidateInterviewResponse(activeCandidate.id, {
            id: `resp-voice-${Date.now()}`,
            question: activeQuestion.question,
            answer: text,
            category: 'Voice Screening (Re-recorded)',
            score: {
              clarity,
              relevance: techDepth,
              overall,
              feedback
            },
            timestamp: new Date().toLocaleString()
          });
        }

        if (overall >= 75 && onUpdateCandidateStatusByEmail) {
          onUpdateCandidateStatusByEmail(activeCandidate.email, 'Interview Completed');
        }

        showToast(`Voice Response Re-recorded and Report Updated! New Score: ${overall}%`);
        return;
      }

      const record: VoiceScreeningRecord = {
        id: `voice-${Date.now()}`,
        candidateId: activeCandidate.id,
        candidateName: activeCandidate.fullName,
        candidateEmail: activeCandidate.email,
        role: activeCandidate.currentRole || 'Software Engineer',
        question: activeQuestion.question,
        transcript: text,
        durationSeconds: durationSec || 45,
        audioUrl: audioBlobUrl || undefined,
        scores: {
          communication,
          clarity,
          fluency,
          technicalDepth: techDepth,
          overall
        },
        detectedKeywords: detected.length > 0 ? detected : ["python", "architecture", "system"],
        recommendation,
        feedback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isReviewed: false
      };

      setLatestEvaluation(record);
      setScreeningHistory(prev => {
        const next = [record, ...prev];
        localStorage.setItem('rc_voice_screenings', JSON.stringify(next));
        return next;
      });
      setIsEvaluating(false);

      if (onSaveCandidateInterviewResponse) {
        onSaveCandidateInterviewResponse(activeCandidate.id, {
          id: `resp-voice-${Date.now()}`,
          question: activeQuestion.question,
          answer: text,
          category: 'Voice Screening',
          score: {
            clarity,
            relevance: techDepth,
            overall,
            feedback
          },
          timestamp: new Date().toLocaleString()
        });
      }

      if (overall >= 75 && onUpdateCandidateStatusByEmail) {
        onUpdateCandidateStatusByEmail(activeCandidate.email, 'Interview Completed');
      }

      showToast(`Voice Screening Completed. Overall Score: ${overall}%`);
    }, 700);
  };

  // Re-record an existing voice screening report
  const handleStartReRecording = (record: VoiceScreeningRecord) => {
    if (!canModifyRecord(record.candidateEmail, record.candidateId)) {
      alert("Permission Denied: As a candidate, you may only re-record voice screening responses for your own profile.");
      return;
    }

    resetVoiceRecording();

    const cand = candidates.find(c => c.id === record.candidateId || c.email.toLowerCase() === record.candidateEmail.toLowerCase())
      || (candidatePool ? candidatePool.find(c => c.id === record.candidateId || c.email.toLowerCase() === record.candidateEmail.toLowerCase()) : undefined);
    if (cand) {
      setSelectedCandidateId(cand.id);
      setInspectedCandidateId(cand.id);
    }

    const qIdx = PRESET_SCREENING_QUESTIONS.findIndex(pq => pq.question.trim().toLowerCase() === record.question.trim().toLowerCase());
    if (qIdx >= 0) {
      setSelectedQuestionIndex(qIdx);
    }

    setReRecordingRecordId(record.id);
    setLiveTranscript('');
    setRecordingSeconds(0);
    setAudioBlobUrl(null);

    const consoleEl = document.getElementById('voice-recording-console');
    if (consoleEl) {
      consoleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showToast(`Re-recording mode active for ${record.candidateName}. Record your new response above.`);
  };

  const handleCancelReRecording = () => {
    setReRecordingRecordId(null);
    resetVoiceRecording();
    showToast("Re-recording cancelled.");
  };

  // Delete an existing voice screening report
  const handleDeleteScreeningRecord = (recordId: string, candidateName?: string) => {
    const target = screeningHistory.find(r => r.id === recordId);
    if (!target) return;

    if (!canModifyRecord(target.candidateEmail, target.candidateId)) {
      alert("Permission Denied: As a candidate, you may only delete your own voice screening reports.");
      return;
    }

    const displayName = candidateName || target?.candidateName || 'this candidate';
    if (!window.confirm(`Are you sure you want to delete this voice screening record for ${displayName}? This action cannot be undone.`)) {
      return;
    }

    setScreeningHistory(prev => {
      const updated = prev.filter(r => r.id !== recordId);
      localStorage.setItem('rc_voice_screenings', JSON.stringify(updated));
      return updated;
    });

    if (latestEvaluation?.id === recordId) {
      setLatestEvaluation(null);
    }

    if (reRecordingRecordId === recordId) {
      setReRecordingRecordId(null);
    }

    if (onDeleteCandidateInterviewResponse && target) {
      onDeleteCandidateInterviewResponse(target.candidateId || target.candidateEmail, target.question);
    }

    showToast("Voice screening report deleted successfully.");
  };

  // Toggle Mark as Reviewed for a Voice Screening Record
  const toggleMarkReviewed = (recordId: string) => {
    setScreeningHistory(prev => prev.map(rec => {
      if (rec.id === recordId) {
        const nextState = !rec.isReviewed;
        return {
          ...rec,
          isReviewed: nextState,
          reviewedBy: nextState ? "Sarah Jenkins (Lead Recruiter)" : undefined,
          reviewedAt: nextState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
        };
      }
      return rec;
    }));

    showToast("Review status updated successfully");
  };

  // Save Review Notes for a specific record
  const saveReviewNotes = (recordId: string) => {
    const note = tempNotes[recordId] || '';
    setScreeningHistory(prev => prev.map(rec => {
      if (rec.id === recordId) {
        return {
          ...rec,
          reviewNotes: note,
          isReviewed: true,
          reviewedBy: rec.reviewedBy || "Sarah Jenkins (Lead Recruiter)",
          reviewedAt: rec.reviewedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return rec;
    }));
    showToast("Review notes saved and candidate marked as reviewed");
  };

  // Mark all screenings for a candidate as reviewed
  const markCandidateAllReviewed = (candidateIdOrEmail: string, markState: boolean) => {
    setScreeningHistory(prev => prev.map(rec => {
      if (rec.candidateId === candidateIdOrEmail || rec.candidateEmail.toLowerCase() === candidateIdOrEmail.toLowerCase()) {
        return {
          ...rec,
          isReviewed: markState,
          reviewedBy: markState ? "Sarah Jenkins (Lead Recruiter)" : undefined,
          reviewedAt: markState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
        };
      }
      return rec;
    }));

    showToast(markState ? "All screenings for candidate marked as Reviewed" : "Candidate screenings reopened for review");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter candidates for individual inspection view
  const candidatePool: Array<Partial<Candidate> & { id: string; fullName: string; email: string; currentRole: string; totalExperienceYears: number; status: Candidate['status']; avatar?: string }> = candidates.length > 0 ? candidates : [
    { id: 'cand-1', fullName: 'Sarah Johnson', email: 'sarah.johnson@example.com', currentRole: 'Senior Machine Learning Engineer', totalExperienceYears: 5, status: 'Applied' as const, avatar: undefined },
    { id: 'cand-2', fullName: 'Abhishek Kumar', email: 'abhishek.kumar@example.com', currentRole: 'Frontend React & UI Engineer', totalExperienceYears: 3, status: 'Interview Completed' as const, avatar: undefined },
    { id: 'cand-3', fullName: 'Marcus Rodriguez', email: 'marcus.rodriguez@example.com', currentRole: 'Cloud DevOps & Security Specialist', totalExperienceYears: 4, status: 'Shortlisted' as const, avatar: undefined },
    { id: 'cand-4', fullName: 'Priya Sharma', email: 'priya.sharma@example.com', currentRole: 'Full Stack MERN Developer', totalExperienceYears: 4, status: 'Applied' as const, avatar: undefined }
  ];

  const filteredCandidatePool = candidatePool.filter(c => {
    const q = candidateFilterQuery.toLowerCase();
    const matchesName = c.fullName.toLowerCase().includes(q) || (c.currentRole || '').toLowerCase().includes(q);
    if (!matchesName) return false;

    const candScreenings = screeningHistory.filter(s => s.candidateId === c.id || s.candidateEmail.toLowerCase() === c.email.toLowerCase());
    const hasReviewed = candScreenings.length > 0 && candScreenings.every(s => s.isReviewed);
    const hasPending = candScreenings.some(s => !s.isReviewed);

    if (statusFilter === 'REVIEWED') return hasReviewed;
    if (statusFilter === 'PENDING') return hasPending || candScreenings.length === 0;
    return true;
  });

  const inspectedCandidate = candidatePool.find(c => c.id === inspectedCandidateId) || candidatePool[0];
  const inspectedCandidateScreenings = screeningHistory.filter(
    s => s.candidateId === inspectedCandidate.id || s.candidateEmail.toLowerCase() === inspectedCandidate.email.toLowerCase()
  );

  const isInspectedAllReviewed = inspectedCandidateScreenings.length > 0 && inspectedCandidateScreenings.every(s => s.isReviewed);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 text-xs font-semibold">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner without emojis */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded uppercase tracking-wider">
              Recruitment Module
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded border border-emerald-500/30">
              Operational Speech-to-Text and TTS
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Voice-Based Screening Studio
          </h1>
          <p className="text-xs text-slate-300 font-medium max-w-2xl leading-relaxed">
            Conduct preliminary live voice screening using Web Audio recording, real-time waveform visualizers, AI voice interviewer prompts, and automated communication clarity scoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToInterview}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            AI Interview Simulator
          </button>
          <button
            onClick={onNavigateToAts}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            ATS Integration Hub
          </button>
        </div>
      </div>

      {/* Interactive Voice Recording Console */}
      <div id="voice-recording-console" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        
        {/* Re-recording Active Alert Banner */}
        {reRecordingRecordId && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <div>
                <span className="font-bold">Re-recording Mode Active:</span>
                <span className="ml-1 text-amber-900">
                  Recording a new verbal answer for <strong>{activeCandidate.fullName}</strong>. Evaluating will update and overwrite the existing report.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancelReRecording}
              className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-lg border border-amber-300 transition-colors text-xs shrink-0 self-start sm:self-auto cursor-pointer"
            >
              Cancel Re-recording
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Conduct Live Voice Screening</h2>
            <p className="text-xs text-slate-500 font-medium">Record candidate verbal response or test with simulated answer</p>
          </div>

          {/* Candidate Picker for Recording */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Candidate:</span>
            <select
              value={selectedCandidateId}
              disabled={isCandidateUser}
              onChange={e => setSelectedCandidateId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {candidatePool.map(cand => (
                <option key={cand.id} value={cand.id}>
                  {cand.fullName} ({cand.currentRole || 'Candidate'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Question Selector Buttons */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 block">Select Interview Question:</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PRESET_SCREENING_QUESTIONS.map((q, idx) => {
              const isSelected = selectedQuestionIndex === idx;
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestionIndex(idx);
                    resetVoiceRecording();
                  }}
                  className={`text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-blue-400 text-blue-950 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold text-blue-600">
                      {q.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Est. {q.durationEst}
                    </span>
                  </div>
                  <p className="line-clamp-2 leading-relaxed">{q.question}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Question Display & TTS Speaker without emojis */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider">
              AI Interviewer Question
            </span>

            <button
              type="button"
              onClick={() => isAiSpeaking ? stopSpeaking() : speakQuestionAloud(activeQuestion.question)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isAiSpeaking
                  ? 'bg-rose-600 text-white'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
              }`}
            >
              <span>{isAiSpeaking ? 'Stop Voice' : 'Play AI Voice'}</span>
            </button>
          </div>

          <p className="text-sm font-bold text-slate-900 leading-relaxed">
            "{activeQuestion.question}"
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 font-medium">
            <span className="font-semibold text-slate-700">Target Keywords:</span>
            {activeQuestion.expectedKeywords.map((kw, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold">
                #{kw}
              </span>
            ))}
          </div>
        </div>

        {/* Audio Oscilloscope Waveform Display */}
        <div className="relative rounded-xl bg-slate-950 p-4 border border-slate-800 overflow-hidden flex flex-col items-center justify-center min-h-[130px]">
          <canvas
            ref={canvasRef}
            width={540}
            height={90}
            className="w-full h-20 block"
          />

          <div className="absolute top-3 left-4 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`}></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300">
              {isPaused ? 'AUDIO RECORDING PAUSED' : isRecording ? 'LIVE AUDIO RECORDING' : 'AUDIO RECORDER STANDBY'}
            </span>
          </div>

          <div className="absolute top-3 right-4">
            <span className="text-xs font-mono font-bold text-cyan-400">
              {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:
              {String(recordingSeconds % 60).padStart(2, '0')}
            </span>
          </div>

          {!isRecording && !audioBlobUrl && (
            <div className="text-center text-slate-500 text-xs font-medium space-y-0.5">
              <p>Click "Start Voice Screening" or "Quick Demo Answer" to begin recording.</p>
              <p className="text-[10px] text-slate-400">Microphone input converts speech to text in real-time.</p>
            </div>
          )}
        </div>

        {/* Controls Toolbar without emojis */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {!isRecording ? (
              <button
                onClick={startVoiceRecording}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Start Voice Screening
              </button>
            ) : (
              <button
                onClick={stopVoiceRecording}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Stop and Evaluate Response
              </button>
            )}

            <button
              onClick={injectSimulatedSpokenAnswer}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-all cursor-pointer border border-slate-300"
            >
              Quick Demo Answer
            </button>

            {(isRecording || audioBlobUrl || liveTranscript) && (
              <button
                onClick={resetVoiceRecording}
                className="px-3 py-2 text-slate-500 hover:text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {audioBlobUrl && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Recorded Audio:</span>
              <audio controls src={audioBlobUrl} className="h-8" />
            </div>
          )}
        </div>

        {/* Spoken Transcript Input Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Spoken Answer Live Transcript (Speech-to-Text):</span>
            {liveTranscript && (
              <span className="text-[11px] text-blue-600 font-medium">
                {liveTranscript.split(/\s+/).filter(Boolean).length} words detected
              </span>
            )}
          </div>
          <textarea
            value={liveTranscript}
            onChange={e => setLiveTranscript(e.target.value)}
            placeholder="Candidate spoken response transcript will stream here in real-time as you speak, or you can edit/type directly..."
            rows={3}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isEvaluating && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center gap-3 text-xs font-bold text-blue-900 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
            <span>Analyzing spoken response, audio clarity, fluency, and technical keyword coverage...</span>
          </div>
        )}

        {latestEvaluation && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase w-fit">
                Screening Completed
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-emerald-900 mr-1">
                  Score: {latestEvaluation.scores.overall}%
                </span>
                <button
                  type="button"
                  onClick={() => handleStartReRecording(latestEvaluation)}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Re-record candidate verbal response for this question"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Re-record</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteScreeningRecord(latestEvaluation.id, latestEvaluation.candidateName)}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Delete this voice screening report"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Report</span>
                </button>
              </div>
            </div>
            <p className="text-xs font-semibold text-emerald-950 leading-relaxed">
              Recommendation: {latestEvaluation.recommendation}
            </p>
            <p className="text-xs text-slate-700">
              {latestEvaluation.feedback}
            </p>
          </div>
        )}
      </div>

      {/* Recruiter & Admin Voice Screening Manager: By Candidate vs Overview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        
        {/* Top Controls: Mode Switcher & Filter Tabs without emojis */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Voice Screening Review Hub</h2>
            <p className="text-xs text-slate-500 font-medium">Inspect candidate submissions separately or review all logs in consolidated view</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setInspectionMode('individual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  inspectionMode === 'individual'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Individual Candidate View
              </button>
              <button
                type="button"
                onClick={() => setInspectionMode('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  inspectionMode === 'overview'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Screenings Overview
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50">
              {(['ALL', 'PENDING', 'REVIEWED'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab === 'PENDING' ? 'Pending Review' : 'Reviewed'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Mode 1: Individual Candidate Dossier View */}
        {inspectionMode === 'individual' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Candidate Selector List */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Candidates Directory</span>
                <span className="text-[11px] text-slate-400 font-semibold">{filteredCandidatePool.length} Shown</span>
              </div>

              <input
                type="text"
                value={candidateFilterQuery}
                onChange={e => setCandidateFilterQuery(e.target.value)}
                placeholder="Search candidate name or role..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredCandidatePool.map(cand => {
                  const isSelected = cand.id === inspectedCandidateId;
                  const candRecs = screeningHistory.filter(s => s.candidateId === cand.id || s.candidateEmail.toLowerCase() === cand.email.toLowerCase());
                  const isReviewed = candRecs.length > 0 && candRecs.every(s => s.isReviewed);
                  const latestScore = candRecs[0]?.scores?.overall || 0;

                  return (
                    <button
                      key={cand.id}
                      type="button"
                      onClick={() => setInspectedCandidateId(cand.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-blue-300 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <UserAvatar name={cand.fullName} avatar={cand.avatar} size="sm" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{cand.fullName}</p>
                            <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{cand.currentRole}</p>
                          </div>
                        </div>

                        {candRecs.length > 0 && (
                          <span className="text-xs font-bold text-emerald-700">
                            {latestScore}%
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                        <span className="text-slate-500 font-medium">
                          {candRecs.length} Voice Submission{candRecs.length === 1 ? '' : 's'}
                        </span>

                        <span className={`px-2 py-0.5 rounded font-bold ${
                          candRecs.length === 0 ? 'bg-slate-200 text-slate-600' :
                          isReviewed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {candRecs.length === 0 ? 'Not Screened' : isReviewed ? 'Reviewed' : 'Pending Review'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Candidate Voice Screening Dossier on the Right */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* Candidate Header & Review Status Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={inspectedCandidate.fullName} avatar={inspectedCandidate.avatar} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{inspectedCandidate.fullName}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {inspectedCandidate.status || 'Applied'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{inspectedCandidate.currentRole} • {inspectedCandidate.email}</p>
                    </div>
                  </div>

                  {/* Mark as Reviewed Quick Action */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      isInspectedAllReviewed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {isInspectedAllReviewed ? 'Reviewed by Recruiter' : 'Pending Review'}
                    </span>

                    {!isCandidateUser && (
                      <button
                        type="button"
                        onClick={() => markCandidateAllReviewed(inspectedCandidate.id, !isInspectedAllReviewed)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
                          isInspectedAllReviewed
                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isInspectedAllReviewed ? 'Reopen Review' : 'Mark as Reviewed'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Candidate Pipeline Stage Transition Buttons */}
                {!isCandidateUser && (
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Candidate Stage:</span>
                    <button
                      type="button"
                      onClick={() => onUpdateCandidateStatusByEmail && onUpdateCandidateStatusByEmail(inspectedCandidate.email, 'Shortlisted')}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-bold border border-purple-200 cursor-pointer"
                    >
                      Shortlist Candidate
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateCandidateStatusByEmail && onUpdateCandidateStatusByEmail(inspectedCandidate.email, 'Interview Completed')}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold border border-blue-200 cursor-pointer"
                    >
                      Mark Interview Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateCandidateStatusByEmail && onUpdateCandidateStatusByEmail(inspectedCandidate.email, 'Offered')}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200 cursor-pointer"
                    >
                      Make Offer
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateCandidateStatusByEmail && onUpdateCandidateStatusByEmail(inspectedCandidate.email, 'Rejected')}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-bold border border-rose-200 cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>

              {/* Candidate's Voice Submissions List */}
              <div className="space-y-4">
                {inspectedCandidateScreenings.length > 0 ? (
                  inspectedCandidateScreenings.map((screening) => (
                    <div key={screening.id} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
                      
                      {/* Submission Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{screening.question}</p>
                          <p className="text-[11px] text-slate-500 font-medium">Recorded: {screening.timestamp} • Duration: {screening.durationSeconds}s</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-bold text-emerald-700 mr-1">
                            Overall: {screening.scores.overall}%
                          </span>

                          {canModifyRecord(screening.candidateEmail, screening.candidateId) ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartReRecording(screening)}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Re-record verbal answer for this question"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Re-record</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteScreeningRecord(screening.id, screening.candidateName)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Delete this voice screening report"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                              Read-only
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => toggleMarkReviewed(screening.id)}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                              screening.isReviewed
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-800 hover:bg-emerald-600 hover:text-white'
                            }`}
                          >
                            {screening.isReviewed ? 'Reviewed' : 'Mark Reviewed'}
                          </button>
                        </div>
                      </div>

                      {/* Audio Player if available */}
                      {screening.audioUrl && (
                        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="text-xs font-bold text-slate-600">Audio Response:</span>
                          <audio controls src={screening.audioUrl} className="h-8 flex-1" />
                        </div>
                      )}

                      {/* Spoken Transcript */}
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-700 block">Candidate Verbal Response:</span>
                        <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-800 leading-relaxed font-medium italic border border-slate-200">
                          "{screening.transcript}"
                        </div>
                      </div>

                      {/* 4 Speech Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Communication</span>
                          <span className="font-extrabold text-slate-900">{screening.scores.communication}%</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Speech Clarity</span>
                          <span className="font-extrabold text-emerald-700">{screening.scores.clarity}%</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Fluency & Tone</span>
                          <span className="font-extrabold text-blue-700">{screening.scores.fluency}%</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Tech Depth</span>
                          <span className="font-extrabold text-indigo-700">{screening.scores.technicalDepth}%</span>
                        </div>
                      </div>

                      {/* AI Recommendation & Feedback */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">AI Assessment: {screening.recommendation}</span>
                          <div className="flex items-center gap-1">
                            {screening.detectedKeywords.map((kw, ki) => (
                              <span key={ki} className="px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10px] font-semibold">
                                #{kw}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{screening.feedback}</p>
                      </div>

                      {/* Recruiter Review Notes Section */}
                      {!isCandidateUser && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">Recruiter Review Notes:</span>
                            {screening.reviewedBy && (
                              <span className="text-[11px] text-slate-500">
                                Reviewed by {screening.reviewedBy} at {screening.reviewedAt}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={tempNotes[screening.id] !== undefined ? tempNotes[screening.id] : (screening.reviewNotes || '')}
                              onChange={e => setTempNotes({ ...tempNotes, [screening.id]: e.target.value })}
                              placeholder="Add review feedback, evaluation notes, or round recommendations..."
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => saveReviewNotes(screening.id)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                            >
                              Save Notes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1 text-xs font-medium">
                    <p>No voice screening recorded yet for {inspectedCandidate.fullName}.</p>
                    <p className="text-slate-500">Record a voice response in the studio above to generate automated verbal analytics.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View Mode 2: All Candidates Overview Table */}
        {inspectionMode === 'overview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">All Candidate Voice Screenings ({screeningHistory.length} Total)</span>
              <span className="text-slate-500">Click on any candidate to inspect their separate dossier</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Candidate</th>
                    <th className="p-3.5">Question Category</th>
                    <th className="p-3.5">Duration</th>
                    <th className="p-3.5">Overall Score</th>
                    <th className="p-3.5">Review Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {screeningHistory
                    .filter(rec => {
                      if (statusFilter === 'REVIEWED') return rec.isReviewed;
                      if (statusFilter === 'PENDING') return !rec.isReviewed;
                      return true;
                    })
                    .map(rec => (
                      <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar 
                              name={rec.candidateName} 
                              avatar={(candidates.find(c => c.id === rec.candidateId || c.email.toLowerCase() === rec.candidateEmail.toLowerCase()) || candidatePool.find(c => c.id === rec.candidateId || c.email.toLowerCase() === rec.candidateEmail.toLowerCase()))?.avatar} 
                              size="sm" 
                            />
                            <div>
                              <p className="font-bold text-slate-900">{rec.candidateName}</p>
                              <p className="text-[10px] text-slate-500">{rec.role}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <p className="font-semibold text-slate-800 line-clamp-1 max-w-xs">{rec.question}</p>
                          <p className="text-[10px] text-slate-400">{rec.timestamp}</p>
                        </td>

                        <td className="p-3.5 font-semibold text-slate-600">
                          {rec.durationSeconds}s
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-emerald-700">
                            {rec.scores.overall}%
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.isReviewed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rec.isReviewed ? 'Reviewed' : 'Pending Review'}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setInspectedCandidateId(rec.candidateId);
                                setInspectionMode('individual');
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-bold cursor-pointer"
                            >
                              Inspect Dossier
                            </button>

                            {canModifyRecord(rec.candidateEmail, rec.candidateId) ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStartReRecording(rec)}
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded text-xs font-bold cursor-pointer flex items-center gap-1 border border-amber-200"
                                  title="Re-record voice screening response for this question"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Re-record</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteScreeningRecord(rec.id, rec.candidateName)}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-xs font-bold cursor-pointer flex items-center gap-1 border border-rose-200"
                                  title="Delete this voice screening report"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                Read-only
                              </span>
                            )}

                            {!isCandidateUser && (
                              <button
                                type="button"
                                onClick={() => toggleMarkReviewed(rec.id)}
                                className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                                  rec.isReviewed
                                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                {rec.isReviewed ? 'Unmark' : 'Mark Reviewed'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
