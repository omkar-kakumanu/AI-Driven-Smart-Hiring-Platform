with open('src/pages/SettingsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# 1. Imports
old_imp = """import React, { useState, useEffect } from 'react';
import type { UserProfile, UserAccount } from '../types';
import { UserAvatar } from '../components/UserAvatar';"""

new_imp = """import React, { useState, useEffect } from 'react';
import type { UserProfile, UserAccount } from '../types';
import { UserAvatar } from '../components/UserAvatar';
import { Shield, ShieldOff, Briefcase, UserCheck, UserX, Check, X, Ban, Trash2, Settings, Sun, Moon, Building, Home, MapPin, Save, Palette, Globe, Bell, Download, RefreshCw, Clock, Sparkles, ChevronDown, Target } from 'lucide-react';"""
content = content.replace(old_imp, new_imp, 1)

# 2. Props
content = content.replace("  onMakeUserRecruiter?: (userId: string) => void;\n  onClearAllCandidates?: () => void;",
                          "  onMakeUserRecruiter?: (userId: string) => void;\n  onMakeUserCandidate?: (userId: string) => void;\n  onRemoveUserRecruiter?: (userId: string) => void;\n  onClearAllCandidates?: () => void;", 1)

# 3. Component Args
content = content.replace("  onMakeUserRecruiter,\n  onClearAllCandidates,",
                          "  onMakeUserRecruiter,\n  onMakeUserCandidate,\n  onRemoveUserRecruiter,\n  onClearAllCandidates,", 1)

# 4. isCandidate
old_iscand = """  const isCandidate = isCandidateUser || Boolean(
    userProfile?.userType !== 'ADMIN' &&
    userProfile?.email?.toLowerCase() !== 'admin@copilot.com' &&
    userProfile?.email?.toLowerCase() !== 'recruiter@copilot.com' && (
      userProfile?.role?.toLowerCase().includes('candidate') ||
      userProfile?.email?.toLowerCase().includes('candidate') ||
      userProfile?.email?.toLowerCase() === 'sarah.johnson@example.com'
    )
  );"""

new_iscand = """  const isCandidate = isCandidateUser || Boolean(
    userProfile?.userType !== 'ADMIN' &&
    userProfile?.email?.toLowerCase() !== 'admin@copilot.com' &&
    userProfile?.email?.toLowerCase() !== 'recruiter@copilot.com' &&
    !userProfile?.role?.toLowerCase().includes('recruiter') &&
    !userProfile?.role?.toLowerCase().includes('talent') && (
      userProfile?.role?.toLowerCase().includes('candidate') ||
      userProfile?.email?.toLowerCase().includes('candidate')
    )
  );"""
content = content.replace(old_iscand, new_iscand, 1)

# 5. Simple emoji replacements
content = content.replace('<div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-black text-sm shrink-0">✓</div>',
                          '<div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-black text-sm shrink-0"><Check className="w-4 h-4 text-white" /></div>')

content = content.replace('✓ Preferences Updated Successfully!', '<Check className="w-3.5 h-3.5 text-emerald-600 inline mr-1" /> Preferences Updated Successfully!')
content = content.replace('<span className="text-sm font-black">✓</span>', '<Check className="w-4 h-4 text-white inline mr-1" />')
content = content.replace('<span>💾 Save Profile & Preferences</span>', '<Save className="w-4 h-4 mr-1 inline" /><span>Save Profile & Preferences</span>')

content = content.replace('<span>🎨 Interface Appearance & Theme</span>', '<Palette className="w-4 h-4 text-blue-600 inline mr-1" /><span>Interface Appearance & Theme</span>')
content = content.replace("theme === 'dark' ? '🌙 Dark Mode Active' : '☀️ Light Mode Active'",
                          "theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'")

content = content.replace('>☀️<', '><Sun className="w-5 h-5 text-amber-600" /><')
content = content.replace('>🌙<', '><Moon className="w-5 h-5 text-indigo-400" /><')

content = content.replace('<span>🎯 Career & Job Market Preferences</span>', '<Target className="w-4 h-4 text-blue-600 inline mr-1" /><span>Career & Job Market Preferences</span>')
content = content.replace('>🟢 Actively Interviewing & Ready to Join<', '>Actively Interviewing & Ready to Join<')
content = content.replace('>🟡 Open to Selective Opportunities<', '>Open to Selective Opportunities<')
content = content.replace('>⚪ Casually Exploring / Not Actively Looking<', '>Casually Exploring / Not Actively Looking<')

content = content.replace("title: '🏢 Hybrid (2-3 Days Office)'", "title: 'Hybrid (2-3 Days Office)'")
content = content.replace("title: '🏠 100% Remote / WFH'", "title: '100% Remote / WFH'")
content = content.replace("title: '📍 In-Office (Full-time)'", "title: 'In-Office (Full-time)'")

content = content.replace('{isSelected ? `✓ ${loc}` : `+ ${loc}`}', '{isSelected ? `${loc}` : `+ ${loc}`}')
content = content.replace("'✓ Career Preferences Saved!'", "'Career Preferences Saved!'")
content = content.replace("'💾 Save Career Preferences'", "'Save Career Preferences'")

content = content.replace('🌐 Professional Profiles & Portfolio Links', 'Professional Profiles & Portfolio Links')
content = content.replace("'✓ Portfolio Links Saved!'", "'Portfolio Links Saved!'")
content = content.replace("'💾 Save Portfolio Links'", "'Save Portfolio Links'")

content = content.replace('🔔 Interview Alerts & Communication Channels', 'Interview Alerts & Communication Channels')
content = content.replace('🛡️ Data Privacy & Candidate Rights', 'Data Privacy & Candidate Rights')
content = content.replace('<span>📥 Export My Profile Data (JSON)</span>', '<Download className="w-3.5 h-3.5 inline mr-1" /><span>Export My Profile Data (JSON)</span>')

content = content.replace('<span>⏳</span> Pending Requests', '<Clock className="w-3.5 h-3.5 inline mr-1" /> Pending Requests')
content = content.replace('👑 Admins', 'Admins')
content = content.replace('💼 Recruiters', 'Recruiters')
content = content.replace('🎯 Candidates', 'Candidates')
content = content.replace('👑 Main Super-Admin', 'Main Super-Admin')

content = content.replace('<span>✓</span> Approve', '<Check className="w-3 h-3 text-white inline mr-1" /> Approve')
content = content.replace('<span>✕</span> Reject', '<X className="w-3 h-3 text-rose-600 inline mr-1" /> Reject')
content = content.replace('<span>⛔</span> Revoke', '<Ban className="w-3 h-3 text-amber-700 inline mr-1" /> Revoke')
content = content.replace('<span>✓</span> Re-Approve', '<Check className="w-3 h-3 text-emerald-700 inline mr-1" /> Re-Approve')

content = content.replace('<span>⚙️ Manage</span>', '<Settings className="w-3 h-3 text-slate-600 inline mr-1" /><span>Manage</span>')
content = content.replace('<span className="text-[9px]">▾</span>', '<ChevronDown className="w-3 h-3 text-slate-400 inline" />')
content = content.replace("{user.userType === 'ADMIN' ? '👑 Admin' : 'User'}", "{user.userType === 'ADMIN' ? 'Admin' : 'User'}")

content = content.replace('<span className="text-sm">👑</span>', '<Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />')
content = content.replace('<span className="text-sm">🛡️</span>', '<ShieldOff className="w-3.5 h-3.5 text-purple-600 shrink-0" />')
content = content.replace('<span className="text-sm">💼</span>', '<Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />')

content = content.replace('<span className="text-sm">✓</span>', '<Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />')
content = content.replace('<span className="text-sm">⛔</span>', '<Ban className="w-3.5 h-3.5 text-amber-600 shrink-0" />')
content = content.replace('<span className="text-sm">✕</span>', '<X className="w-3.5 h-3.5 text-rose-500 shrink-0" />')
content = content.replace('<span className="text-sm">🗑️</span>', '<Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />')

content = content.replace('🔄 Restore Default Job Postings', 'Restore Default Job Postings')

# Now insert "Remove Recruiter" and "Make Candidate" in role actions if not present
old_make_rec = """                                              {/* Make Recruiter */}
                                              {(!isRecruiterRole || isAdminRole) && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    onMakeUserRecruiter && onMakeUserRecruiter(user.id);
                                                    alert(`Assigned Recruiter role to "${user.name}".`);
                                                    setOpenMenuUserId(null);
                                                  }}
                                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-blue-900 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer text-left"
                                                >
                                                  <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                  <div>
                                                    <div className="leading-tight">Make Recruiter</div>
                                                    <div className="text-[9px] text-blue-600 font-medium">Set role to Talent Acquisition Specialist</div>
                                                  </div>
                                                </button>
                                              )}"""

new_make_rec = """                                              {/* Make Recruiter */}
                                              {!isRecruiterRole && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    onMakeUserRecruiter && onMakeUserRecruiter(user.id);
                                                    alert(`Assigned Recruiter role to "${user.name}".`);
                                                    setOpenMenuUserId(null);
                                                  }}
                                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-blue-900 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer text-left"
                                                >
                                                  <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                  <div>
                                                    <div className="leading-tight">Make Recruiter</div>
                                                    <div className="text-[9px] text-blue-600 font-medium">Assign Recruiter role</div>
                                                  </div>
                                                </button>
                                              )}

                                              {/* Remove Recruiter */}
                                              {isRecruiterRole && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const fn = onMakeUserCandidate || onRemoveUserRecruiter;
                                                    fn && fn(user.id);
                                                    alert(`Removed Recruiter role for "${user.name}". Assigned Candidate role.`);
                                                    setOpenMenuUserId(null);
                                                  }}
                                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-left"
                                                >
                                                  <UserX className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                  <div>
                                                    <div className="leading-tight">Remove Recruiter</div>
                                                    <div className="text-[9px] text-slate-400 font-medium">Demote to Candidate Applicant</div>
                                                  </div>
                                                </button>
                                              )}

                                              {/* Make Candidate */}
                                              {(isRecruiterRole || isAdminRole) && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    onMakeUserCandidate && onMakeUserCandidate(user.id);
                                                    alert(`Assigned Candidate role to "${user.name}".`);
                                                    setOpenMenuUserId(null);
                                                  }}
                                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-left"
                                                >
                                                  <UserCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                  <div>
                                                    <div className="leading-tight">Make Candidate</div>
                                                    <div className="text-[9px] text-slate-400 font-medium">Assign Candidate Applicant access</div>
                                                  </div>
                                                </button>
                                              )}"""

if old_make_rec in content:
    content = content.replace(old_make_rec, new_make_rec, 1)

with open('src/pages/SettingsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('SettingsView updated successfully!')
