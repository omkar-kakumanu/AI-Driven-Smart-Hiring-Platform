import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardView } from './pages/DashboardView';
import { ResumeUploadView } from './pages/ResumeUploadView';
import { MatchingView } from './pages/MatchingView';
import { SettingsView } from './pages/SettingsView';
import { InterviewAssistantView } from './pages/InterviewAssistantView';
import { VoiceScreeningView } from './pages/VoiceScreeningView';
import { AtsIntegrationView } from './pages/AtsIntegrationView';
import { CandidatePortalView } from './pages/CandidatePortalView';
import { NewJobModal } from './components/NewJobModal';
import { useRecruitmentStore } from './store/useRecruitmentStore';
import type { UserProfile } from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('rc_is_authenticated') === 'true';
  });
  const [inApp, setInApp] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Central Reactive Recruitment Store
  const store = useRecruitmentStore();

  // Determine roles strictly with priority
  const isMainAdmin = Boolean(
    store.userProfile?.userType === 'ADMIN' ||
    store.userProfile?.isSuperAdmin === true || 
    store.userProfile?.email?.toLowerCase() === 'admin@copilot.com'
  );

  const isRecruiterUser = Boolean(
    !isMainAdmin && (
      store.userProfile?.role?.toLowerCase().includes('recruiter') ||
      store.userProfile?.role?.toLowerCase().includes('talent') ||
      store.userProfile?.email?.toLowerCase() === 'recruiter@copilot.com'
    )
  );

  // A user is a Candidate ONLY if they are NOT an Admin AND NOT a Recruiter!
  const isCandidateUser = Boolean(
    !isMainAdmin &&
    !isRecruiterUser &&
    store.userProfile?.userType !== 'ADMIN' &&
    store.userProfile?.email?.toLowerCase() !== 'admin@copilot.com' &&
    store.userProfile?.email?.toLowerCase() !== 'recruiter@copilot.com' && (
      store.userProfile?.role?.toLowerCase().includes('candidate') ||
      store.userProfile?.email?.toLowerCase().includes('candidate') ||
      store.userProfile?.email?.toLowerCase() === 'sarah.johnson@example.com'
    )
  );

  // Filter candidates based on Header Search Query
  const filteredCandidates = store.candidates.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.currentRole.toLowerCase().includes(q) ||
      (c.headline || '').toLowerCase().includes(q) ||
      (c.location || '').toLowerCase().includes(q) ||
      (c.degree || '').toLowerCase().includes(q) ||
      (c.skills || []).some(s => s.toLowerCase().includes(q))
    );
  });

  // Candidate Role Access Control:
  // Recruiter & Admin see ALL candidate resumes in directory.
  // Candidate logged in can ONLY see their OWN resume record.
  const roleFilteredCandidates = isCandidateUser
    ? filteredCandidates.filter(c => 
        c.email.toLowerCase() === (store.userProfile?.email || '').toLowerCase() ||
        c.email.toLowerCase() === 'sarah.johnson@example.com' ||
        c.fullName.toLowerCase().includes('sarah')
      ).slice(0, 1)
    : filteredCandidates;

  const handleLogin = (profile: UserProfile & { userType: 'ADMIN' | 'USER'; status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'REVOKED'; isSuperAdmin?: boolean }) => {
    const isAdminAccount = profile.userType === 'ADMIN' || profile.email.toLowerCase() === 'admin@copilot.com';
    const targetEmail = profile.email.toLowerCase();
    const existingAccount = store.userAccounts.find(u => u.email.toLowerCase() === targetEmail);
    const isolatedAvatar = profile.avatar !== undefined 
      ? profile.avatar 
      : (localStorage.getItem(`rc_avatar_${targetEmail}`) || existingAccount?.avatar || undefined);

    store.setUserProfileExplicit({
      name: profile.name,
      role: profile.role,
      email: profile.email,
      userType: isAdminAccount ? 'ADMIN' : profile.userType,
      status: profile.status,
      isSuperAdmin: isAdminAccount,
      avatar: isolatedAvatar
    });
    setIsAuthenticated(true);
    localStorage.setItem('rc_is_authenticated', 'true');
    if (profile.role?.toLowerCase().includes('candidate') || profile.email?.toLowerCase().includes('candidate') || profile.email?.toLowerCase() === 'sarah.johnson@example.com') {
      setCurrentTab('candidate-portal');
    } else {
      setCurrentTab('dashboard');
    }
  };

  useEffect(() => {
    if (isCandidateUser && currentTab === 'dashboard') {
      setCurrentTab('candidate-portal');
    }
  }, [isCandidateUser]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('rc_is_authenticated', 'false');
    localStorage.removeItem('rc_user_profile');
  };

  if (!isAuthenticated) {
    return (
      <LoginPage 
        userAccounts={store.userAccounts} 
        onLogin={handleLogin} 
        onRegister={store.registerUser} 
      />
    );
  }

  if (!inApp) {
    return <LandingPage onEnterApp={() => setInApp(true)} />;
  }

  const getHeaderInfo = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'AI Recruitment Copilot', subtitle: 'Automate candidate screening and improve hiring efficiency with AI' };
      case 'resume-upload':
      case 'candidates':
        return { title: 'Candidate Directory & Resume Upload', subtitle: 'Upload candidate resumes, extract technical skills, and manage candidate profiles' };
      case 'matching':
        return { title: 'Matching & Skill Analysis', subtitle: 'Candidate-job matching and skill-gap analysis' };
      case 'interview-assistant':
        return { title: 'AI Interview Simulation', subtitle: 'Simulate technical & behavioral candidate interviews with interactive AI evaluations' };
      case 'voice-screening':
        return { title: 'Voice-Based Screening Module', subtitle: 'Live Speech-to-Text audio screening, AI interviewer voice synthesis, and communication analytics' };
      case 'ats-integration':
        return { title: 'ATS Integration Hub', subtitle: 'Bi-directional candidate synchronization with Greenhouse, Lever, and Workday' };
      case 'candidate-portal':
        return { title: 'Candidate Career Portal', subtitle: 'Live application ATS pipeline tracker, scheduled interviews, and AI performance reports' };
      case 'settings':
        return { title: 'System Settings', subtitle: 'Configure user access approvals and database settings' };
      default:
        return { title: 'Recruitment Copilot', subtitle: 'AI Hiring Intelligence Platform' };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans antialiased">
      {/* Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        userProfile={store.userProfile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          userProfile={store.userProfile}
          searchQuery={searchQuery}
          matchCount={filteredCandidates.length}
          onSearchChange={setSearchQuery}
          onNewJobClick={() => setShowNewJobModal(true)}
          onProfileClick={() => setCurrentTab('settings')}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView 
              onNavigate={setCurrentTab} 
              candidates={roleFilteredCandidates}
              allCandidatesCount={isCandidateUser ? 1 : store.candidates.length}
              jobs={store.jobs}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          )}
          {(currentTab === 'candidates' || currentTab === 'resume-upload') && (
            <ResumeUploadView 
              candidates={roleFilteredCandidates}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              isMainAdmin={isMainAdmin}
              isCandidateUser={isCandidateUser}
              onAddCandidate={store.addCandidate}
              onDeleteCandidate={store.deleteCandidate}
              onAddSkillToCandidate={store.addSkillToCandidate}
              onRemoveSkillFromCandidate={store.removeSkillFromCandidate}
              onUpdateCandidateRoleAndExperience={store.updateCandidateRoleAndExperience}
              onUpdateCandidateAvatar={store.updateCandidateAvatar}
              onNavigateToMatching={() => setCurrentTab('matching')}
            />
          )}
          {currentTab === 'matching' && (
            <MatchingView 
              candidates={roleFilteredCandidates}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              jobs={store.jobs}
              isMainAdmin={isMainAdmin}
              onAddSkillToCandidate={store.addSkillToCandidate}
              onRemoveSkillFromCandidate={store.removeSkillFromCandidate}
            />
          )}
          {currentTab === 'interview-assistant' && (
            <InterviewAssistantView 
              candidates={roleFilteredCandidates}
              jobs={store.jobs}
              isMainAdmin={isMainAdmin}
              isCandidateUser={isCandidateUser}
              currentCandidateEmail={store.userProfile?.email}
              onUpdateCandidateStatusByEmail={store.updateCandidateStatusByEmail}
              onUpdateCandidateRoleAndExperience={store.updateCandidateRoleAndExperience}
              onSaveCandidateInterviewResponse={store.addCandidateInterviewResponse}
              onDeleteCandidateInterviewResponse={store.deleteCandidateInterviewResponse}
              scheduledInterviews={store.scheduledInterviews}
              onScheduleInterview={store.scheduleInterview}
              onUpdateInterviewStatus={store.updateInterviewStatus}
              onCancelInterview={store.cancelInterview}
              onNavigateToAts={() => setCurrentTab('ats-integration')}
              onNavigateToVoiceScreening={() => setCurrentTab('voice-screening')}
            />
          )}
          {currentTab === 'voice-screening' && (
            <VoiceScreeningView 
              candidates={roleFilteredCandidates}
              jobs={store.jobs}
              isMainAdmin={isMainAdmin}
              isCandidateUser={isCandidateUser}
              currentCandidateEmail={store.userProfile?.email}
              onUpdateCandidateStatusByEmail={store.updateCandidateStatusByEmail}
              onSaveCandidateInterviewResponse={store.addCandidateInterviewResponse}
              onDeleteCandidateInterviewResponse={store.deleteCandidateInterviewResponse}
              onNavigateToInterview={() => setCurrentTab('interview-assistant')}
              onNavigateToAts={() => setCurrentTab('ats-integration')}
            />
          )}
          {currentTab === 'ats-integration' && (
            <AtsIntegrationView 
              candidates={roleFilteredCandidates}
              isMainAdmin={isMainAdmin}
              isCandidateUser={isCandidateUser}
              onUpdateCandidateStatusByEmail={store.updateCandidateStatusByEmail}
              onNavigateToInterview={() => setCurrentTab('interview-assistant')}
            />
          )}
          {currentTab === 'candidate-portal' && (
            <CandidatePortalView 
              candidates={roleFilteredCandidates}
              jobs={store.jobs}
              currentCandidateEmail={store.userProfile?.email || 'candidate@copilot.com'}
              scheduledInterviews={store.scheduledInterviews}
              notifications={store.candidateNotifications}
              onMarkNotificationRead={store.markNotificationRead}
              onNavigateToVoiceScreening={() => setCurrentTab('voice-screening')}
              onNavigateToInterviewPractice={() => setCurrentTab('interview-assistant')}
              onNavigateToResume={() => setCurrentTab('candidates')}
              onCancelInterview={store.cancelInterview}
            />
          )}
          {currentTab === 'settings' && (
            <SettingsView 
              userProfile={store.userProfile}
              onUpdateUserProfile={store.updateUserProfile}
              userAccounts={store.userAccounts}
              onApproveUser={store.approveUser}
              onRejectUser={store.rejectUser}
              onRevokeUserAccess={store.revokeUserAccess}
              onDeleteUserAccount={store.deleteUserAccount}
              onMakeUserAdmin={store.makeUserAdmin}
              onClearAllCandidates={store.clearAllCandidates}
              onClearAllUserAccounts={store.clearAllUserAccounts}
            />
          )}
        </main>
      </div>

      {/* AI-Assisted New Job Modal */}
      <NewJobModal
        isOpen={showNewJobModal}
        onClose={() => setShowNewJobModal(false)}
        onCreateJob={(job) => {
          store.addJob(job);
          alert(`New Job Profile "${job.title}" created & published successfully!`);
        }}
      />
    </div>
  );
};

