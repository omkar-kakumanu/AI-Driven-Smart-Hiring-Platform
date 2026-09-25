import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, ArrowRight, X, Mail } from 'lucide-react';
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
}

export const LoginPage: React.FC<LoginPageProps> = ({ userAccounts, onLogin, onRegister }) => {
  // Modes: 'RECRUITER' | 'CANDIDATE' | 'ADMIN' | 'SIGN_UP'
  const [mode, setMode] = useState<'RECRUITER' | 'CANDIDATE' | 'ADMIN' | 'SIGN_UP'>('RECRUITER');
  
  // Form Input States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('recruiter@copilot.com');
  const [password, setPassword] = useState('recruiter123');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('Talent Acquisition Specialist');

  // Google OAuth Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGmail, setCustomGmail] = useState('');

  // Active step state for Hero column
  const [activeStep, setActiveStep] = useState<number>(1);

  // Status Alerts
  const [statusNotice, setStatusNotice] = useState<{ type: 'PENDING' | 'REVOKED' | 'ERROR' | 'SUCCESS'; message: string } | null>(null);

  // Google SSO Login Handler
  const handleGoogleSelect = (selectedEmail: string, selectedName: string, userRole: string, isAdmin = false) => {
    const cleanMail = selectedEmail.trim().toLowerCase();
    const stored = userAccounts.find(u => u.email.toLowerCase() === cleanMail);
    const savedAvatar = localStorage.getItem(`rc_avatar_${cleanMail}`) || stored?.avatar || undefined;
    onLogin({
      name: selectedName,
      role: userRole,
      email: selectedEmail,
      userType: isAdmin ? 'ADMIN' : 'USER',
      status: 'APPROVED',
      isSuperAdmin: isAdmin,
      avatar: savedAvatar
    });
    setShowGoogleModal(false);
  };

  const handleCustomGmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGmail.trim() || !customGmail.includes('@')) {
      alert("Please enter a valid Gmail address.");
      return;
    }
    const nameFromEmail = customGmail.split('@')[0].replace('.', ' ');
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    handleGoogleSelect(customGmail.trim(), formattedName, 'Candidate Applicant', false);
  };

  // Standard Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    const emailClean = email.trim().toLowerCase();

    // 1. GLOBAL PRIORITY CHECK: Default Super-Admin ALWAYS logs in as Administrator
    if (emailClean === 'admin@copilot.com' && (password === 'admin123' || mode === 'ADMIN')) {
      const storedAdmin = userAccounts.find(u => u.email.toLowerCase() === 'admin@copilot.com');
      const savedAvatar = localStorage.getItem('rc_avatar_admin@copilot.com') || storedAdmin?.avatar || undefined;
      onLogin({
        name: (storedAdmin?.name && !storedAdmin.name.includes('Alex Vance')) ? storedAdmin.name : 'J Manju Raghvin (Main Super-Admin)',
        role: storedAdmin?.role || 'System Administrator & Hiring Director',
        email: 'admin@copilot.com',
        userType: 'ADMIN',
        status: 'APPROVED',
        isSuperAdmin: true,
        avatar: savedAvatar
      });
      return;
    }

    // 2. GLOBAL PRIORITY CHECK: Default Recruiter
    if (emailClean === 'recruiter@copilot.com' && (password === 'recruiter123' || mode === 'RECRUITER')) {
      const stored = userAccounts.find(u => u.email.toLowerCase() === 'recruiter@copilot.com');
      const savedAvatar = localStorage.getItem('rc_avatar_recruiter@copilot.com') || stored?.avatar || undefined;
      onLogin({
        name: stored?.name || 'Sarah Jenkins',
        role: stored?.role || 'Talent Acquisition Specialist',
        email: 'recruiter@copilot.com',
        userType: 'USER',
        status: 'APPROVED',
        isSuperAdmin: false,
        avatar: savedAvatar
      });
      return;
    }

    // 3. GLOBAL PRIORITY CHECK: Default Candidate
    if ((emailClean === 'candidate@copilot.com' || emailClean === 'sarah.johnson@example.com') && (password === 'candidate123' || mode === 'CANDIDATE')) {
      const targetMail = 'sarah.johnson@example.com';
      const stored = userAccounts.find(u => u.email.toLowerCase() === targetMail || u.email.toLowerCase() === 'candidate@copilot.com');
      const savedAvatar = localStorage.getItem(`rc_avatar_${targetMail}`) || stored?.avatar || undefined;
      onLogin({
        name: 'Sarah Johnson',
        role: 'Candidate Applicant',
        email: targetMail,
        userType: 'USER',
        status: 'APPROVED',
        isSuperAdmin: false,
        avatar: savedAvatar
      });
      return;
    }

    if (mode === 'SIGN_UP') {
      const fullName = `${firstName} ${lastName}`.trim() || 'New User';
      if (!emailClean || !password) {
        setStatusNotice({ type: 'ERROR', message: 'Please enter all required registration details.' });
        return;
      }
      const newAcc = onRegister(fullName, emailClean, role, password);
      setStatusNotice({
        type: 'SUCCESS',
        message: `Access Request Submitted Successfully! Account for "${newAcc.email}" is in PENDING status. An Administrator must approve your access before logging in.`
      });
      setActiveStep(3);
    } else if (mode === 'CANDIDATE') {
      const found = userAccounts.find(u => u.email.toLowerCase() === emailClean);
      const savedAvatar = localStorage.getItem(`rc_avatar_${emailClean}`) || found?.avatar || undefined;
      if (found) {
        onLogin({
          name: found.name,
          role: 'Candidate Applicant',
          email: found.email,
          userType: 'USER',
          status: 'APPROVED',
          isSuperAdmin: false,
          avatar: savedAvatar
        });
        return;
      }
      onLogin({
        name: emailClean.split('@')[0].replace('.', ' '),
        role: 'Candidate Applicant',
        email: emailClean,
        userType: 'USER',
        status: 'APPROVED',
        isSuperAdmin: false,
        avatar: savedAvatar
      });
    } else if (mode === 'RECRUITER') {
      const found = userAccounts.find(u => u.email.toLowerCase() === emailClean);
      if (!found) {
        setStatusNotice({ type: 'ERROR', message: `No account registered for "${email}". Please submit a New Access Request or Sign in with Google.` });
        return;
      }
      if (found.status === 'PENDING') {
        setStatusNotice({ type: 'PENDING', message: `Access Pending Approval: Account for "${found.email}" is pending Administrator review.` });
        return;
      }
      if (found.status === 'REVOKED' || found.status === 'REJECTED') {
        setStatusNotice({ type: 'REVOKED', message: `Access Revoked: Account access for "${found.email}" has been revoked by an Administrator.` });
        return;
      }
      const savedAvatar = localStorage.getItem(`rc_avatar_${emailClean}`) || found.avatar || undefined;
      onLogin({
        name: found.name,
        role: found.role,
        email: found.email,
        userType: found.userType === 'ADMIN' ? 'ADMIN' : 'USER',
        status: 'APPROVED',
        isSuperAdmin: found.userType === 'ADMIN',
        avatar: savedAvatar
      });
    } else if (mode === 'ADMIN') {
      const foundAdmin = userAccounts.find(u => u.email.toLowerCase() === emailClean && u.userType === 'ADMIN');
      if (!foundAdmin) {
        setStatusNotice({ type: 'ERROR', message: `No Administrator account registered for "${email}". Use admin@copilot.com with admin123.` });
        return;
      }
      const savedAvatar = localStorage.getItem(`rc_avatar_${emailClean}`) || foundAdmin.avatar || undefined;
      onLogin({
        name: foundAdmin.name,
        role: foundAdmin.role,
        email: foundAdmin.email,
        userType: 'ADMIN',
        status: 'APPROVED',
        isSuperAdmin: true,
        avatar: savedAvatar
      });
    }
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
              <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Enterprise Hiring Engine</span>
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
          className="z-10 w-full max-w-md space-y-5 flex flex-col items-center text-center bg-slate-900/60 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-white/15 shadow-2xl"
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
              text="Identity Verification & Portal Login"
              active={activeStep === 1}
              onClick={() => setActiveStep(1)}
            />
            <StepItem
              number={2}
              text="Skill-Gap Matching & ATS Pipelines"
              active={activeStep === 2}
              onClick={() => setActiveStep(2)}
            />
            <StepItem
              number={3}
              text="Role-Specific AI Interview Evaluation"
              active={activeStep === 3}
              onClick={() => setActiveStep(3)}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT COLUMN: GMAIL & RECRUITER FORM */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 sm:px-12 lg:px-16 xl:px-20 bg-slate-50 overflow-y-auto lg:overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6"
        >
          {/* Top Bar: Portal Selector Pills */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl w-full">
              <button
                type="button"
                onClick={() => { setMode('RECRUITER'); setEmail('recruiter@copilot.com'); setPassword('recruiter123'); setStatusNotice(null); }}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all text-center truncate ${
                  mode === 'RECRUITER'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Recruiter
              </button>
              <button
                type="button"
                onClick={() => { setMode('CANDIDATE'); setEmail('candidate@copilot.com'); setPassword('candidate123'); setStatusNotice(null); }}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all text-center truncate ${
                  mode === 'CANDIDATE'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Candidate
              </button>
              <button
                type="button"
                onClick={() => { setMode('ADMIN'); setEmail('admin@copilot.com'); setPassword('admin123'); setStatusNotice(null); }}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all text-center truncate ${
                  mode === 'ADMIN'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Admin
              </button>
              <button
                type="button"
                onClick={() => { setMode('SIGN_UP'); setEmail(''); setPassword(''); setStatusNotice(null); }}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all text-center truncate ${
                  mode === 'SIGN_UP'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                4. Request
              </button>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {mode === 'RECRUITER'
                ? 'Recruiter Gateway'
                : mode === 'CANDIDATE'
                ? 'Candidate Applicant Portal'
                : mode === 'ADMIN'
                ? 'Administrator Governance'
                : 'Request Enterprise Access'}
            </h2>
            <p className="text-slate-500 text-xs font-medium">
              {mode === 'RECRUITER'
                ? 'Sign in with your approved recruiter credentials or Google SSO.'
                : mode === 'CANDIDATE'
                ? 'Sign in to view your candidate resume, application status, and match reports.'
                : mode === 'ADMIN'
                ? 'System administrator access & access control management.'
                : 'Submit your enterprise details for Administrator approval.'}
            </p>
          </div>

          {/* Status Notice Alert */}
          {statusNotice && (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                statusNotice.type === 'PENDING'
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
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="flex items-center justify-center gap-3 w-full h-12 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] rounded-xl text-xs font-extrabold text-slate-800 shadow-sm transition-all cursor-pointer group"
          >
            <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Sign in with Google / Gmail</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Or Work Credentials
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'SIGN_UP' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <InputGroup
                    label="First Name"
                    placeholder="David"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <InputGroup
                    label="Last Name"
                    placeholder="Miller"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <InputGroup
                  label="Role / Department"
                  placeholder="e.g. Technical Recruiter"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </>
            )}

            <InputGroup
              label="Work Email Address"
              placeholder={
                mode === 'ADMIN'
                  ? 'admin@copilot.com'
                  : mode === 'RECRUITER'
                  ? 'recruiter@copilot.com'
                  : 'david.miller@company.com'
              }
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
              helperText={mode === 'SIGN_UP' ? 'Must be at least 8 characters with numbers.' : undefined}
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
                mode === 'ADMIN'
                  ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                  : mode === 'SIGN_UP'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              {mode === 'SIGN_UP'
                ? 'Submit Access Request →'
                : mode === 'RECRUITER'
                ? 'Log In to Recruiter Platform →'
                : 'Log In to Admin Console →'}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-1 border-t border-slate-100">
            {mode === 'SIGN_UP' ? (
              <p className="text-xs text-slate-500 font-medium">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('RECRUITER'); setEmail('recruiter@copilot.com'); setPassword('recruiter123'); setStatusNotice(null); }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Log in here
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                Need an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('SIGN_UP'); setEmail(''); setPassword(''); setStatusNotice(null); }}
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

              <button
                type="button"
                onClick={() => handleGoogleSelect('sarah.johnson@example.com', 'Sarah Johnson', 'Candidate Applicant', false)}
                className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                    S3
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-purple-600">Sarah Johnson (Candidate)</span>
                    <span className="text-[10px] text-slate-500 font-medium">sarah.johnson@example.com</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
              </button>

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
                Continue with Gmail →
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </main>
  );
};

// Reusable Components requested in prompt
interface StepItemProps {
  number: number;
  text: string;
  active?: boolean;
  onClick?: () => void;
}

export const StepItem: React.FC<StepItemProps> = ({ number, text, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer ${
        active
          ? 'bg-white text-slate-900 border border-slate-200 shadow-md scale-[1.02]'
          : 'bg-slate-900/60 text-white/90 border border-white/10 hover:bg-slate-900/80'
      }`}
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
          active ? 'bg-blue-600 text-white shadow-sm' : 'bg-white/20 text-white/70'
        }`}
      >
        {number}
      </div>
      <span className="text-xs font-bold tracking-tight">{text}</span>
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
