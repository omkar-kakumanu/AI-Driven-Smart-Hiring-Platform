import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, ArrowRight, X, Mail, Shield, Briefcase, User, Sun, Moon, Lock } from 'lucide-react';
import type { UserProfile, UserAccount } from '../types';

const GoogleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C1.2 8.7.8 10.3.8 12s.4 3.3 1.1 4.7l3.7-2.9z" />
    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
  </svg>
);

interface LoginPageProps {
  userAccounts: UserAccount[];
  onLogin: (profile: UserProfile & { userType: 'ADMIN' | 'USER'; status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'REVOKED'; isSuperAdmin?: boolean }) => void;
  onRegister: (name: string, email: string, role: string, password?: string) => UserAccount;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

const getPersistedName = (email: string, fallback: string, userAccounts: UserAccount[]): string => {
  const clean = email.trim().toLowerCase();
  const direct = localStorage.getItem(`rc_name_${clean}`);
  if (direct && direct.trim()) return direct.trim();

  if (clean === 'candidate@copilot.com' || clean === 'sarah.johnson@example.com') {
    const candName1 = localStorage.getItem('rc_name_candidate@copilot.com');
    if (candName1 && candName1.trim()) return candName1.trim();
    const candName2 = localStorage.getItem('rc_name_sarah.johnson@example.com');
    if (candName2 && candName2.trim()) return candName2.trim();
  }

  const found = userAccounts.find(u => u.email.toLowerCase() === clean ||
    ((clean === 'candidate@copilot.com' || clean === 'sarah.johnson@example.com') &&
      (u.email.toLowerCase() === 'candidate@copilot.com' || u.email.toLowerCase() === 'sarah.johnson@example.com')));
  if (found && found.name && found.name.trim()) {
    const cleanFoundName = found.name.replace(/\s*\(Candidate\)\s*/i, '').trim();
    if (cleanFoundName) return cleanFoundName;
  }

  return fallback;
};

const getPersistedAvatar = (email: string, storedAvatar?: string): string | undefined => {
  const clean = email.trim().toLowerCase();
  const direct = localStorage.getItem(`rc_avatar_${clean}`);
  if (direct) return direct;
  if (clean === 'candidate@copilot.com' || clean === 'sarah.johnson@example.com') {
    const cand1 = localStorage.getItem('rc_avatar_candidate@copilot.com');
    if (cand1) return cand1;
    const cand2 = localStorage.getItem('rc_avatar_sarah.johnson@example.com');
    if (cand2) return cand2;
    const cand3 = localStorage.getItem('rc_avatar_cand-1');
    if (cand3) return cand3;
  }
  return storedAvatar || undefined;
};

export const LoginPage: React.FC<LoginPageProps> = ({
  userAccounts,
  onLogin,
  onRegister,
  theme = 'light',
  onToggleTheme
}) => {
  // Enterprise Tabs: 'SIGN_IN' | 'REQUEST_ACCESS'
  const [tab, setTab] = useState<'SIGN_IN' | 'REQUEST_ACCESS'>('SIGN_IN');

  // Form Input States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('recruiter@copilot.com');
  const [password, setPassword] = useState('recruiter123');
  const [showPassword, setShowPassword] = useState(false);
  const [desiredRole, setDesiredRole] = useState('Talent Acquisition Specialist');

  // Google OAuth Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGmail, setCustomGmail] = useState('');

  // Active step state for Hero column
  const [activeStep, setActiveStep] = useState<number>(1);

  // Status Alerts
  const [statusNotice, setStatusNotice] = useState<{ type: 'PENDING' | 'REVOKED' | 'ERROR' | 'SUCCESS'; message: string } | null>(null);

  // Handle Quick Demo Fill
  const handleQuickFill = (demoType: 'ADMIN' | 'RECRUITER' | 'CANDIDATE') => {
    setStatusNotice(null);
    if (demoType === 'ADMIN') {
      setEmail('admin@copilot.com');
      setPassword('admin123');
    } else if (demoType === 'RECRUITER') {
      setEmail('recruiter@copilot.com');
      setPassword('recruiter123');
    } else {
      setEmail('sarah.johnson@example.com');
      setPassword('candidate123');
    }
  };

  // Google SSO Login Handler (Enforces Administrator Approval & Account Registration)
  const handleGoogleSelect = (selectedEmail: string, selectedName: string, userRole: string, isAdmin = false) => {
    const cleanMail = selectedEmail.trim().toLowerCase();
    const isPreApprovedDemo =
      cleanMail === 'admin@copilot.com' ||
      cleanMail === 'recruiter@copilot.com' ||
      cleanMail === 'candidate@copilot.com' ||
      cleanMail === 'sarah.johnson@example.com' ||
      cleanMail === 'sarah.jenkins@gmail.com' ||
      cleanMail === 'j.manju.raghvin@gmail.com' ||
      cleanMail === 'omkar.kakumanu17@gmail.com' ||
      cleanMail === 'sailathakakumanu@gmail.com';

    const stored = userAccounts.find(u => u.email.toLowerCase() === cleanMail);

    if (stored) {
      if (stored.status === 'PENDING') {
        setStatusNotice({
          type: 'PENDING',
          message: `Access Pending Approval: Your account for "${cleanMail}" is awaiting Administrator review.`
        });
        setShowGoogleModal(false);
        return;
      }
      if (stored.status === 'REVOKED' || stored.status === 'REJECTED') {
        setStatusNotice({
          type: 'REVOKED',
          message: `Access Denied: Account access for "${cleanMail}" has been revoked or rejected by a System Administrator.`
        });
        setShowGoogleModal(false);
        return;
      }
      // Approved account login:
      const savedAvatar = getPersistedAvatar(cleanMail, stored.avatar);
      const finalName = getPersistedName(cleanMail, stored.name || selectedName, userAccounts);
      onLogin({
        name: finalName,
        role: stored.role || userRole,
        email: stored.email,
        userType: stored.userType || (isAdmin ? 'ADMIN' : 'USER'),
        status: 'APPROVED',
        isSuperAdmin: stored.isSuperAdmin || isAdmin,
        avatar: savedAvatar
      });
      setShowGoogleModal(false);
      return;
    }

    if (isPreApprovedDemo) {
      const savedAvatar = getPersistedAvatar(cleanMail, undefined);
      const finalName = getPersistedName(cleanMail, selectedName, userAccounts);
      onLogin({
        name: finalName,
        role: userRole,
        email: selectedEmail,
        userType: isAdmin ? 'ADMIN' : 'USER',
        status: 'APPROVED',
        isSuperAdmin: isAdmin,
        avatar: savedAvatar
      });
      setShowGoogleModal(false);
      return;
    }

    // New unknown user attempting Google / Gmail sign in:
    const newAcc = onRegister(selectedName, cleanMail, userRole, 'google_sso_verified');
    setStatusNotice({
      type: 'PENDING',
      message: `Access Request Submitted Successfully! Account for "${newAcc.email}" is in PENDING status. An Administrator must approve your access request in Settings before you can log in.`
    });
    setShowGoogleModal(false);
  };

  const handleCustomGmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGmail.trim() || !customGmail.includes('@')) {
      alert("Please enter a valid Gmail address.");
      return;
    }
    const clean = customGmail.trim().toLowerCase();
    const nameFromEmail = clean.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = nameFromEmail
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Applicant';
    handleGoogleSelect(clean, formattedName, 'Candidate Applicant', false);
  };

  // Unified Enterprise Authentication Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    const emailClean = email.trim().toLowerCase();

    if (tab === 'REQUEST_ACCESS') {
      if (!fullName.trim() || !emailClean || !password) {
        setStatusNotice({ type: 'ERROR', message: 'Please provide all required account details.' });
        return;
      }
      const newAcc = onRegister(fullName.trim(), emailClean, desiredRole, password);
      setStatusNotice({
        type: 'SUCCESS',
        message: `Enterprise Access Request Submitted for "${newAcc.email}". Your application is currently awaiting Administrator review.`
      });
      setTab('SIGN_IN');
      return;
    }

    // Dynamic Account Lookup (Respects role assignments made in Settings!)
    let targetAccount = userAccounts.find(u => u.email.toLowerCase() === emailClean);

    // Fallback for candidate aliases
    if (!targetAccount && (emailClean === 'candidate@copilot.com' || emailClean === 'sarah.johnson@example.com')) {
      targetAccount = userAccounts.find(u =>
        u.email.toLowerCase() === 'candidate@copilot.com' ||
        u.email.toLowerCase() === 'sarah.johnson@example.com'
      );
    }

    // Fallback for built-in initial accounts if not yet in state
    if (!targetAccount) {
      if (emailClean === 'admin@copilot.com') {
        targetAccount = {
          id: 'usr-admin-1',
          name: 'J Manju Raghvin (Main Super-Admin)',
          email: 'admin@copilot.com',
          role: 'System Administrator & Hiring Director',
          userType: 'ADMIN',
          status: 'APPROVED',
          isSuperAdmin: true
        };
      } else if (emailClean === 'recruiter@copilot.com') {
        targetAccount = {
          id: 'usr-recruiter-1',
          name: 'Sarah Jenkins',
          email: 'recruiter@copilot.com',
          role: 'Talent Acquisition Specialist',
          userType: 'USER',
          status: 'APPROVED'
        };
      } else if (emailClean === 'candidate@copilot.com' || emailClean === 'sarah.johnson@example.com') {
        targetAccount = {
          id: 'usr-cand-1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          role: 'Candidate Applicant',
          userType: 'USER',
          status: 'APPROVED'
        };
      }
    }

    if (!targetAccount) {
      setStatusNotice({
        type: 'ERROR',
        message: `No active account found for "${emailClean}". Please submit an Access Request or verify your credentials.`
      });
      return;
    }

    // Access Governance Status Validation
    if (targetAccount.status === 'PENDING') {
      setStatusNotice({
        type: 'PENDING',
        message: `Access Pending Approval: Your account for "${targetAccount.email}" is pending review by a System Administrator.`
      });
      return;
    }

    if (targetAccount.status === 'REVOKED' || targetAccount.status === 'REJECTED') {
      setStatusNotice({
        type: 'REVOKED',
        message: `Access Denied: Account access for "${targetAccount.email}" has been revoked or rejected by a System Administrator.`
      });
      return;
    }

    // Dynamic Role-based Authentication
    const isAdmin = targetAccount.userType === 'ADMIN' || targetAccount.isSuperAdmin === true || targetAccount.email.toLowerCase() === 'admin@copilot.com';
    const savedAvatar = getPersistedAvatar(targetAccount.email, targetAccount.avatar);
    const resolvedName = getPersistedName(targetAccount.email, targetAccount.name, userAccounts);

    onLogin({
      name: resolvedName,
      role: targetAccount.role || (isAdmin ? 'System Administrator' : 'Talent Acquisition Specialist'),
      email: targetAccount.email,
      userType: isAdmin ? 'ADMIN' : 'USER',
      status: 'APPROVED',
      isSuperAdmin: isAdmin,
      avatar: savedAvatar
    });
  };

  // Motion variants for left column staggered entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-slate-50 selection:bg-blue-600 selection:text-white p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4 font-sans text-slate-900 relative">

      {/* LEFT COLUMN: HERO, LIVE METRICS & VIDEO BACKGROUND */}
      <div className="w-[52%] hidden lg:flex relative flex-col items-center justify-between p-8 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-950 text-white h-full">
        {/* Absolutely Positioned Video with NO overlays */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4"
            type="video/mp4"
          />
        </video>

        {/* Top Header Bar over Video */}
        <div className="z-10 w-full flex items-center justify-between">
          <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center tracking-wider shadow-md shadow-blue-500/40">
              RC
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-white block leading-none">AI Recruitment Copilot</span>
              <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Enterprise Hiring & Talent Intelligence</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-950/60 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-full text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            AI Engine v3.4 Online
          </div>
        </div>

        {/* Center / Bottom Glassmorphic AI Showcase Card over Video */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="z-10 w-full max-w-md space-y-4 flex flex-col items-center text-center bg-slate-900/65 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-white/15 shadow-2xl"
        >
          {/* Feature Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            AI-Driven Candidate Screening & Matching
          </motion.div>

          {/* Main Title & Subtitle */}
          <motion.div variants={itemVariants} className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Next-Gen Talent Acquisition
            </h1>
            <p className="text-white/70 text-xs leading-relaxed px-2">
              Accelerate hiring decisions with automated resume parsing, skill-gap analysis, and AI interview simulations.
            </p>
          </motion.div>

          {/* Live AI Platform Metrics */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2 w-full pt-1">
            <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl text-center">
              <span className="text-base font-extrabold text-white block">98.4%</span>
              <span className="text-[10px] text-white/60 font-semibold block">Skill Match Accuracy</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl text-center">
              <span className="text-base font-extrabold text-blue-400 block">1,420+</span>
              <span className="text-[10px] text-white/60 font-semibold block">Resumes Parsed</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl text-center">
              <span className="text-base font-extrabold text-emerald-400 block">10+ Roles</span>
              <span className="text-[10px] text-white/60 font-semibold block">Interview Question Banks</span>
            </div>
          </motion.div>

          {/* 3 Step Interactive Guidance Tabs */}
          <motion.div variants={itemVariants} className="w-full space-y-2 text-left pt-1">
            <StepItem
              number={1}
              text="Identity Verification & Portal Access"
              subtext="Role-based access security & DPDP compliance"
              active={activeStep === 1}
              onClick={() => setActiveStep(1)}
            />
            <StepItem
              number={2}
              text="Skill-Gap Matching & ATS Pipelines"
              subtext="Weighted semantic match & Indian tech benchmarks"
              active={activeStep === 2}
              onClick={() => setActiveStep(2)}
            />
            <StepItem
              number={3}
              text="Role-Specific AI Interview Evaluation"
              subtext="Real-time speech clarity & technical relevance scoring"
              active={activeStep === 3}
              onClick={() => setActiveStep(3)}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT COLUMN: PROFESSIONAL ENTERPRISE FORM */}
      <div className="flex-1 w-full h-full min-h-0 overflow-y-auto flex flex-col items-center justify-start lg:justify-center py-6 sm:py-8 lg:py-10 px-3 sm:px-8 lg:px-12 xl:px-16 bg-slate-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 lg:p-9 shadow-sm space-y-4 sm:space-y-5 my-auto shrink-0"
        >
          {/* Top Bar: Clean Enterprise Tabs & Theme Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => { setTab('SIGN_IN'); setStatusNotice(null); }}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tab === 'SIGN_IN'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('REQUEST_ACCESS'); setStatusNotice(null); }}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tab === 'REQUEST_ACCESS'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Request Access
              </button>
            </div>

            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer shrink-0"
                title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            )}
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {tab === 'SIGN_IN' ? 'Welcome Back' : 'Request Platform Access'}
            </h2>
            <p className="text-slate-500 text-xs font-medium">
              {tab === 'SIGN_IN'
                ? 'Sign in to access your recruitment copilot workspace.'
                : 'Submit your credentials for Administrator review and approval.'}
            </p>
          </div>

          {/* Quick Demo Evaluation Credentials Bar */}
          {tab === 'SIGN_IN' && (
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Quick Demo Credentials
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Click to populate</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('ADMIN')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    email === 'admin@copilot.com'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-3 h-3 text-blue-500 shrink-0" />
                  <span className="truncate">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('RECRUITER')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    email === 'recruiter@copilot.com'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Briefcase className="w-3 h-3 text-blue-500 shrink-0" />
                  <span className="truncate">Recruiter</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('CANDIDATE')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    email === 'sarah.johnson@example.com' || email === 'candidate@copilot.com'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-3 h-3 text-purple-500 shrink-0" />
                  <span className="truncate">Candidate</span>
                </button>
              </div>
            </div>
          )}

          {/* Status Notice Alert */}
          {statusNotice && (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${statusNotice.type === 'PENDING'
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-medium'
                : statusNotice.type === 'REVOKED' || statusNotice.type === 'ERROR'
                  ? 'bg-rose-50 border-rose-300 text-rose-900 font-medium'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                }`}
            >
              {statusNotice.type === 'SUCCESS' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              )}
              <div>
                <span className="font-bold block mb-0.5">
                  {statusNotice.type === 'PENDING'
                    ? 'Access Pending Review'
                    : statusNotice.type === 'REVOKED'
                      ? 'Access Revoked'
                      : statusNotice.type === 'SUCCESS'
                        ? 'Request Submitted'
                        : 'Authentication Alert'}
                </span>
                {statusNotice.message}
              </div>
            </div>
          )}

          {/* Single Google / Gmail Primary Login Button */}
          {tab === 'SIGN_IN' && (
            <>
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="flex items-center justify-center gap-3 w-full h-11 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] rounded-xl text-xs font-bold text-slate-800 shadow-xs transition-all cursor-pointer group"
              >
                <GoogleIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Sign in with Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Or Work Credentials
                </div>
              </div>
            </>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'REQUEST_ACCESS' && (
              <>
                <InputGroup
                  label="Full Name"
                  placeholder="e.g. David Miller"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />

                <div className="space-y-1 w-full text-left">
                  <label className="text-xs font-bold text-slate-700 block">Requested Role</label>
                  <select
                    value={desiredRole}
                    onChange={(e) => setDesiredRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  >
                    <option value="Talent Acquisition Specialist">Talent Acquisition Specialist (Recruiter)</option>
                    <option value="Technical Recruiter">Technical Recruiter</option>
                    <option value="Candidate Applicant">Candidate Applicant</option>
                    <option value="Hiring Manager">Hiring Manager</option>
                  </select>
                </div>
              </>
            )}

            <InputGroup
              label="Work Email Address"
              placeholder="name@company.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <InputGroup
              label="Password"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helperText={tab === 'REQUEST_ACCESS' ? 'Minimum 8 characters.' : undefined}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full h-11 text-white font-bold rounded-xl text-xs shadow-md transition-all mt-2 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                tab === 'REQUEST_ACCESS'
                  ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              <span>{tab === 'REQUEST_ACCESS' ? 'Submit Access Request' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2 border-t border-slate-100">
            {tab === 'REQUEST_ACCESS' ? (
              <p className="text-xs text-slate-500 font-medium">
                Already have an approved account?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('SIGN_IN'); setStatusNotice(null); }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                Need enterprise access?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('REQUEST_ACCESS'); setStatusNotice(null); }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Submit Access Request
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* GOOGLE / GMAIL OAUTH LOGIN MODAL */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 relative text-slate-900"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto border border-slate-200">
                <GoogleIcon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Sign in with Google</h3>
              <p className="text-xs text-slate-500 font-medium">
                Choose an account or enter your Gmail to continue to <span className="font-bold text-slate-800">AI Recruitment Copilot</span>
              </p>
            </div>

            {/* Predefined Approved Account Chooser */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleGoogleSelect('sarah.jenkins@gmail.com', 'Sarah Jenkins', 'Talent Acquisition Lead', false)}
                className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                    SJ
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-600">Sarah Jenkins (Recruiter)</span>
                    <span className="text-[10px] text-slate-500 font-medium">sarah.jenkins@gmail.com</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              {(() => {
                const candName = getPersistedName('sarah.johnson@example.com', 'Sarah Johnson', userAccounts);
                const candInitials = candName.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'SJ';
                return (
                  <button
                    type="button"
                    onClick={() => handleGoogleSelect('sarah.johnson@example.com', candName, 'Candidate Applicant', false)}
                    className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                        {candInitials}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block group-hover:text-purple-600">{candName} (Candidate)</span>
                        <span className="text-[10px] text-slate-500 font-medium">sarah.johnson@example.com</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })()}

              <button
                type="button"
                onClick={() => handleGoogleSelect('j.manju.raghvin@gmail.com', 'J Manju Raghvin', 'System Administrator & Hiring Director', true)}
                className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-2xl hover:border-slate-900 hover:bg-slate-50 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                    JM
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-slate-900">J Manju Raghvin (Admin)</span>
                    <span className="text-[10px] text-slate-500 font-medium">j.manju.raghvin@gmail.com</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Or Use Another Gmail Account
              </div>
            </div>

            {/* Custom Gmail Input Form */}
            <form onSubmit={handleCustomGmailSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Enter Gmail Address</label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={customGmail}
                    onChange={(e) => setCustomGmail(e.target.value)}
                    placeholder="your.name@gmail.com"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl h-11 px-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                  <Mail className="absolute right-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue with Gmail</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </main>
  );
};

// Reusable Components
interface StepItemProps {
  number: number;
  text: string;
  subtext?: string;
  active?: boolean;
  onClick?: () => void;
}

export const StepItem: React.FC<StepItemProps> = ({ number, text, subtext, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-3 rounded-2xl transition-all duration-300 cursor-pointer ${active
        ? 'bg-white text-slate-900 border border-slate-200 shadow-md scale-[1.02]'
        : 'bg-slate-900/60 text-white/90 border border-white/10 hover:bg-slate-900/80'
        }`}
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-all ${active ? 'bg-blue-600 text-white shadow-sm' : 'bg-white/20 text-white/70'
          }`}
      >
        {number}
      </div>
      <div className="space-y-0.5 text-left">
        <span className="text-xs font-bold tracking-tight block">{text}</span>
        {subtext && (
          <p className={`text-[10px] leading-tight ${active ? 'text-slate-500 font-medium' : 'text-white/60'}`}>
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};

interface InputGroupProps {
  label: string;
  placeholder: string;
  type: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rightElement?: React.ReactNode;
  helperText?: string;
  required?: boolean;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  placeholder,
  type,
  value,
  onChange,
  rightElement,
  helperText,
  required
}) => {
  return (
    <div className="space-y-1 w-full text-left">
      <label className="text-xs font-bold text-slate-700 block">{label}</label>
      <div className="relative flex items-center">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            {rightElement}
          </div>
        )}
      </div>
      {helperText && (
        <p className="text-[10px] text-slate-400 font-medium pt-0.5">{helperText}</p>
      )}
    </div>
  );
};
