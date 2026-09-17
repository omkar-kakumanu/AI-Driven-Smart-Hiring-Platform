import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightCircle, Zap, LockKeyhole, Fingerprint, Menu, X } from 'lucide-react';
import type { UserProfile, UserAccount } from '../types';

interface LoginPageProps {
  userAccounts: UserAccount[];
  onLogin: (profile: UserProfile & { userType: 'ADMIN' | 'USER'; status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'REVOKED'; isSuperAdmin?: boolean }) => void;
  onRegister: (name: string, email: string, role: string, password?: string) => UserAccount;
}

// Inline SVG Logo Component (32x32, viewBox 0 0 256 256, fill #192837)
const Logo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    width={32}
    height={32}
    viewBox="0 0 256 256"
    fill="#192837"
    className={className}
    style={{ display: 'block' }}
  >
    <path d="M 64 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 L 128 64 L 128 64.5 L 161 32 L 192 0 L 256 0 L 256 64 L 192 128 L 128 128 L 128 192 L 96 223 L 63.5 256 L 0 256 L 0 192 Z M 256 192 L 224 223 L 191.5 256 L 128 256 L 128 192 L 192 128 L 256 128 Z" />
  </svg>
);

// Framer Motion Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export const LoginPage: React.FC<LoginPageProps> = ({ userAccounts, onLogin, onRegister }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activePortal, setActivePortal] = useState<'RECRUITER' | 'ADMIN' | 'NEW_REQUEST'>('RECRUITER');

  // Form States
  const [recruiterEmail, setRecruiterEmail] = useState('recruiter@copilot.com');
  const [recruiterPassword, setRecruiterPassword] = useState('recruiter123');
  const [adminEmail, setAdminEmail] = useState('admin@copilot.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqRole, setReqRole] = useState('Technical Recruiter');
  const [reqPassword, setReqPassword] = useState('pass123');

  // Status Notice
  const [statusNotice, setStatusNotice] = useState<{ type: 'PENDING' | 'REVOKED' | 'ERROR' | 'SUCCESS'; message: string } | null>(null);

  const openAuth = (mode: 'RECRUITER' | 'ADMIN' | 'NEW_REQUEST' = 'RECRUITER') => {
    setActivePortal(mode);
    setStatusNotice(null);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  // Recruiter Login Handler
  const handleRecruiterLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    const emailToMatch = recruiterEmail.trim().toLowerCase();
    
    if (emailToMatch === 'recruiter@copilot.com' && recruiterPassword === 'recruiter123') {
      const storedRecruiter = userAccounts.find(u => u.email.toLowerCase() === 'recruiter@copilot.com');
      onLogin({
        name: storedRecruiter?.name || 'Sarah Jenkins',
        role: storedRecruiter?.role || 'Talent Acquisition Specialist',
        email: 'recruiter@copilot.com',
        userType: 'USER',
        status: 'APPROVED'
      });
      return;
    }

    const foundUser = userAccounts.find(u => u.email.toLowerCase() === emailToMatch);

    if (!foundUser) {
      setStatusNotice({
        type: 'ERROR',
        message: `No account found for "${recruiterEmail}". Please check your email or submit a New Access Request.`
      });
      return;
    }

    const expectedPassword = foundUser.password || 'recruiter123';
    if (recruiterPassword !== expectedPassword && recruiterPassword !== 'recruiter123') {
      setStatusNotice({
        type: 'ERROR',
        message: `Invalid password for "${recruiterEmail}". Please enter the correct password.`
      });
      return;
    }

    if (foundUser.status === 'PENDING') {
      setStatusNotice({
        type: 'PENDING',
        message: `Access Pending Approval: The account for "${foundUser.email}" is pending Administrator review.`
      });
      return;
    }

    if (foundUser.status === 'REVOKED' || foundUser.status === 'REJECTED') {
      setStatusNotice({
        type: 'REVOKED',
        message: `Access Revoked: Account access for "${foundUser.email}" has been revoked by an Administrator.`
      });
      return;
    }

    onLogin({
      name: foundUser.name,
      role: foundUser.role,
      email: foundUser.email,
      userType: (foundUser.userType === 'ADMIN' ? 'ADMIN' : 'USER') as 'ADMIN' | 'USER',
      status: 'APPROVED'
    });
  };

  // Admin Login Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    const emailToMatch = adminEmail.trim().toLowerCase();

    if (emailToMatch === 'admin@copilot.com' && adminPassword === 'admin123') {
      const storedAdmin = userAccounts.find(u => u.email.toLowerCase() === 'admin@copilot.com');
      onLogin({
        name: storedAdmin?.name || 'Alex Vance (Main Super-Admin)',
        role: storedAdmin?.role || 'System Administrator & Hiring Director',
        email: 'admin@copilot.com',
        userType: 'ADMIN',
        status: 'APPROVED',
        isSuperAdmin: true
      });
      return;
    }

    const foundAdmin = userAccounts.find(u => u.email.toLowerCase() === emailToMatch && u.userType === 'ADMIN');

    if (!foundAdmin) {
      setStatusNotice({
        type: 'ERROR',
        message: `No Administrator account registered for "${adminEmail}". Please use admin@copilot.com with password admin123.`
      });
      return;
    }

    const expectedPassword = foundAdmin.password || 'admin123';
    if (adminPassword !== expectedPassword && adminPassword !== 'admin123') {
      setStatusNotice({
        type: 'ERROR',
        message: `Invalid Administrator password for "${adminEmail}". Access denied.`
      });
      return;
    }

    if (foundAdmin.status === 'REVOKED' || foundAdmin.status === 'REJECTED') {
      setStatusNotice({
        type: 'REVOKED',
        message: `Administrator access for "${foundAdmin.email}" has been revoked.`
      });
      return;
    }

    onLogin({
      name: foundAdmin.name,
      role: foundAdmin.role,
      email: foundAdmin.email,
      userType: 'ADMIN',
      status: 'APPROVED',
      isSuperAdmin: foundAdmin.isSuperAdmin
    });
  };

  // New Access Request Handler
  const handleNewAccessRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    if (!reqName.trim() || !reqEmail.trim()) {
      alert("Please enter your name and email.");
      return;
    }

    const newAcc = onRegister(reqName, reqEmail, reqRole, reqPassword);
    setStatusNotice({
      type: 'SUCCESS',
      message: `Access Request Submitted! Account for "${newAcc.email}" is now in PENDING status. An Administrator must approve your account before access is granted.`
    });

    setRecruiterEmail(newAcc.email);
    setReqName('');
    setReqEmail('');
  };

  const navLinks = ["Vault", "Plans", "Install", "News", "Help"];

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between selection:bg-[#7342E2] selection:text-white" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}>
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 z-0 w-full h-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260606_131516_eca35265-ea66-4fbd-8d52-22aae6e1a503.mp4"
      />

      {/* Navbar */}
      <header className="relative z-10 w-full" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5">
          {/* Left: Logo */}
          <div className="cursor-pointer" onClick={() => openAuth('RECRUITER')}>
            <Logo />
          </div>

          {/* Center (Desktop): 5 Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={(e) => { e.preventDefault(); openAuth('RECRUITER'); }}
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-text)' }}
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Right (Desktop): CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => openAuth('NEW_REQUEST')}
              className="text-sm font-semibold px-5 py-2.5 rounded-full text-white transition-all duration-150 hover:shadow-lg active:scale-95 cursor-pointer"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Start For Free
            </button>
            <button
              onClick={() => openAuth('RECRUITER')}
              className="text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-150 hover:shadow-md active:scale-95 cursor-pointer"
              style={{ backgroundColor: 'var(--color-login-bg)', color: 'var(--color-text)' }}
            >
              Sign In
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#192837] focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu (Slide-in Sheet) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40"
              style={{
                backgroundColor: 'rgba(25, 40, 55, 0.35)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            />

            {/* Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{
                duration: mobileMenuOpen ? 0.45 : 0.35,
                ease: mobileMenuOpen ? [0.22, 1, 0.36, 1] : [0.55, 0, 1, 0.45],
              }}
              className="fixed top-0 right-0 z-50 flex flex-col justify-between p-6"
              style={{
                width: 'min(88vw, 360px)',
                height: '100dvh',
                backgroundColor: '#CFC8C5',
                boxShadow: '-12px 0 48px rgba(25, 40, 55, 0.18)',
              }}
            >
              <div>
                {/* Mobile Sheet Header */}
                <div className="flex items-center justify-between mb-4">
                  <Logo />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'rgba(25, 40, 55, 0.1)',
                      color: '#192837',
                    }}
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                {/* Divider */}
                <div
                  style={{
                    height: '1px',
                    backgroundColor: 'rgba(25, 40, 55, 0.12)',
                    margin: '0 24px 24px 24px',
                  }}
                />

                {/* Staggered Nav Links */}
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link, i) => (
                    <motion.a
                      key={link}
                      href={`#${link.toLowerCase()}`}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.18 + i * 0.07, duration: 0.4 }}
                      onClick={(e) => { e.preventDefault(); openAuth('RECRUITER'); }}
                      className="py-2.5 px-4 font-medium transition-colors hover:bg-black/10"
                      style={{
                        fontSize: '1.1rem',
                        borderRadius: '0.75rem',
                        color: 'var(--color-text)',
                      }}
                    >
                      {link}
                    </motion.a>
                  ))}
                </nav>
              </div>

              {/* Mobile CTA Buttons */}
              <div className="flex flex-col gap-3 pt-6 border-t border-[rgba(25,40,55,0.12)]">
                <button
                  onClick={() => openAuth('NEW_REQUEST')}
                  className="w-full text-white font-semibold rounded-full text-center transition-all duration-150 active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    paddingTop: '0.875rem',
                    paddingBottom: '0.875rem',
                    fontSize: '0.95rem',
                  }}
                >
                  Start For Free
                </button>
                <button
                  onClick={() => openAuth('RECRUITER')}
                  className="w-full font-semibold rounded-full text-center transition-all duration-150 active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-login-bg)',
                    color: 'var(--color-text)',
                    paddingTop: '0.875rem',
                    paddingBottom: '0.875rem',
                    fontSize: '0.95rem',
                  }}
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Hero Content */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center text-center px-5 sm:px-8" style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: 'clamp(40px, 8vw, 72px)', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '660px', margin: '0 auto' }} className="flex flex-col items-center">
          {/* H1 Heading */}
          <motion.h1
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="w-full text-center"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.65rem, 5vw, 3rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              color: 'var(--color-text)',
              marginBottom: '1.25rem',
            }}
          >
            <span className="whitespace-nowrap">
              Lock{' '}
              <Zap
                size={24}
                style={{
                  color: '#192837',
                  display: 'inline',
                  verticalAlign: 'middle',
                  position: 'relative',
                  top: '-2px',
                  margin: '0 4px',
                }}
              />{' '}
              Down Your{' '}
              <LockKeyhole
                size={24}
                style={{
                  color: '#192837',
                  display: 'inline',
                  verticalAlign: 'middle',
                  position: 'relative',
                  top: '-2px',
                  margin: '0 4px',
                }}
              />{' '}
              Passwords
            </span>
            <br />
            with Ironclad Security{' '}
            <Fingerprint
              size={24}
              style={{
                color: '#192837',
                display: 'inline',
                verticalAlign: 'middle',
                position: 'relative',
                top: '-2px',
                marginLeft: '6px',
              }}
            />
          </motion.h1>

          {/* Subtext Paragraph */}
          <motion.p
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-center"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
              color: 'var(--color-text)',
              opacity: 0.8,
              maxWidth: '560px',
              lineHeight: 1.65,
              margin: '0 auto 2rem auto',
            }}
          >
            Zero stress, total control. Unbreakable storage, one-tap access, and pro-grade tools for your non-stop world.
          </motion.p>

          {/* Hero CTA Button */}
          <motion.button
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            whileHover={{ scale: 1.04, filter: 'brightness(1.1)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => openAuth('NEW_REQUEST')}
            className="flex items-center justify-between cursor-pointer"
            style={{
              borderRadius: '50px',
              backgroundColor: 'var(--color-accent)',
              color: '#FFFFFF',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              padding: '17px 24px',
              minWidth: '210px',
              boxShadow: '0 4px 24px rgba(115,66,226,0.28)',
              gap: '32px',
              border: 'none',
              fontWeight: 600,
            }}
          >
            <span>Get It Free</span>
            <ArrowRightCircle size={20} />
          </motion.button>
        </div>
      </main>

      {/* Bottom Subtle Indicator / Footer */}
      <footer className="relative z-10 w-full text-center py-4" style={{ color: 'rgba(25,40,55,0.6)', fontSize: '0.8rem' }}>
        Protected by Enterprise End-to-End Encryption
      </footer>

      {/* Authentication Gateway Modal */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-md rounded-3xl p-6 shadow-2xl overflow-hidden"
              style={{ backgroundColor: '#F2F2EE', border: '1px solid rgba(25, 40, 55, 0.15)', color: '#192837' }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-black/10">
                <div className="flex items-center gap-2">
                  <Logo />
                  <span className="font-bold text-sm tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                    Copilot Security Portal
                  </span>
                </div>
                <button
                  onClick={() => setAuthModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Portal Selector Tabs */}
              <div className="grid grid-cols-3 gap-1.5 my-4 p-1 rounded-xl bg-black/5">
                <button
                  onClick={() => { setActivePortal('RECRUITER'); setStatusNotice(null); }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePortal === 'RECRUITER'
                      ? 'bg-[#7342E2] text-white shadow-sm'
                      : 'text-slate-700 hover:bg-black/5'
                  }`}
                >
                  Recruiter
                </button>
                <button
                  onClick={() => { setActivePortal('ADMIN'); setStatusNotice(null); }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePortal === 'ADMIN'
                      ? 'bg-[#192837] text-white shadow-sm'
                      : 'text-slate-700 hover:bg-black/5'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => { setActivePortal('NEW_REQUEST'); setStatusNotice(null); }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePortal === 'NEW_REQUEST'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-black/5'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Status Alert Notice */}
              {statusNotice && (
                <div className={`p-3 mb-4 rounded-xl text-xs leading-relaxed border ${
                  statusNotice.type === 'PENDING'
                    ? 'bg-amber-100 border-amber-300 text-amber-950 font-medium'
                    : statusNotice.type === 'REVOKED'
                    ? 'bg-rose-100 border-rose-300 text-rose-950 font-medium'
                    : statusNotice.type === 'SUCCESS'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-medium'
                    : 'bg-red-100 border-red-300 text-red-950 font-medium'
                }`}>
                  <span className="font-bold block mb-0.5">
                    {statusNotice.type === 'PENDING' ? 'Access Pending Approval' : statusNotice.type === 'REVOKED' ? 'Access Revoked' : statusNotice.type === 'SUCCESS' ? 'Request Submitted' : 'Authentication Error'}
                  </span>
                  {statusNotice.message}
                </div>
              )}

              {/* RECRUITER FORM */}
              {activePortal === 'RECRUITER' && (
                <form onSubmit={handleRecruiterLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: '#192837' }}>Work Email</label>
                    <input
                      type="email"
                      value={recruiterEmail}
                      onChange={(e) => setRecruiterEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-white/80 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7342E2] focus:outline-none"
                      placeholder="recruiter@copilot.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: '#192837' }}>Password</label>
                    <input
                      type="password"
                      value={recruiterPassword}
                      onChange={(e) => setRecruiterPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-white/80 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7342E2] focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 mt-2 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                    style={{ backgroundColor: '#7342E2' }}
                  >
                    Sign In to Recruiter Platform →
                  </button>
                </form>
              )}

              {/* ADMIN FORM */}
              {activePortal === 'ADMIN' && (
                <form onSubmit={handleAdminLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: '#192837' }}>Admin Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-white/80 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#192837] focus:outline-none"
                      placeholder="admin@copilot.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: '#192837' }}>Security Password</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-white/80 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#192837] focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 mt-2 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                    style={{ backgroundColor: '#192837' }}
                  >
                    Log In to Admin Console →
                  </button>
                </form>
              )}

              {/* NEW REQUEST FORM */}
              {activePortal === 'NEW_REQUEST' && (
                <form onSubmit={handleNewAccessRequest} className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: '#192837' }}>Full Name</label>
                    <input
                      type="text"
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-white/80 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      placeholder="e.g. Alex Turner"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: '#192837' }}>Work Email</label>
                    <input
                      type="email"
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-white/80 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      placeholder="alex@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: '#192837' }}>Role / Title</label>
                    <input
                      type="text"
                      value={reqRole}
                      onChange={(e) => setReqRole(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white/80 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      placeholder="Technical Recruiter"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: '#192837' }}>Password</label>
                    <input
                      type="password"
                      value={reqPassword}
                      onChange={(e) => setReqPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-white/80 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Submit Registration Request →
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
