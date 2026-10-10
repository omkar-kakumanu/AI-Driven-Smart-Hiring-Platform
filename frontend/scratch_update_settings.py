import re

with open('src/pages/SettingsView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
old_imp = """import React, { useState, useEffect } from 'react';
import type { UserProfile, UserAccount } from '../types';
import { UserAvatar } from '../components/UserAvatar';"""

new_imp = """import React, { useState, useEffect } from 'react';
import type { UserProfile, UserAccount } from '../types';
import { UserAvatar } from '../components/UserAvatar';
import { Shield, ShieldOff, Briefcase, UserCheck, UserX, Check, X, Ban, Trash2, Settings, Sun, Moon, Building, Home, MapPin, Save, Palette, Globe, Bell, Download, RefreshCw, Clock, Sparkles, ChevronDown, Target } from 'lucide-react';"""

assert old_imp in content, 'Import mismatch'
content = content.replace(old_imp, new_imp, 1)

# 2. Update SettingsViewProps
old_props = """  onMakeUserAdmin?: (userId: string) => void;
  onRemoveUserAdmin?: (userId: string) => void;
  onMakeUserRecruiter?: (userId: string) => void;
  onClearAllCandidates?: () => void;"""

new_props = """  onMakeUserAdmin?: (userId: string) => void;
  onRemoveUserAdmin?: (userId: string) => void;
  onMakeUserRecruiter?: (userId: string) => void;
  onMakeUserCandidate?: (userId: string) => void;
  onRemoveUserRecruiter?: (userId: string) => void;
  onClearAllCandidates?: () => void;"""

assert old_props in content, 'Props mismatch'
content = content.replace(old_props, new_props, 1)

# 3. Update component args
old_args = """  onMakeUserAdmin,
  onRemoveUserAdmin,
  onMakeUserRecruiter,
  onClearAllCandidates,"""

new_args = """  onMakeUserAdmin,
  onRemoveUserAdmin,
  onMakeUserRecruiter,
  onMakeUserCandidate,
  onRemoveUserRecruiter,
  onClearAllCandidates,"""

assert old_args in content, 'Args mismatch'
content = content.replace(old_args, new_args, 1)

# 4. Update isCandidate condition
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

assert old_iscand in content, 'isCandidate mismatch'
content = content.replace(old_iscand, new_iscand, 1)

# 5. Replace Floating Save Banner icon
old_banner = """<div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-black text-sm shrink-0">✓</div>"""
new_banner = """<div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-black text-sm shrink-0"><Check className="w-4 h-4 text-white" /></div>"""
assert old_banner in content, 'Banner mismatch'
content = content.replace(old_banner, new_banner, 1)

# 6. Preferences updated badge
old_pref_badge = """<span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 animate-pulse">
              ✓ Preferences Updated Successfully!
            </span>"""
new_pref_badge = """<span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 animate-pulse">
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Preferences Updated Successfully!
            </span>"""
assert old_pref_badge in content, 'Pref badge mismatch'
content = content.replace(old_pref_badge, new_pref_badge, 1)

# 7. Save Profile button
old_save_btn = """                {savedSuccess ? (
                  <>
                    <span className="text-sm font-black">✓</span>
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <span>💾 Save Profile & Preferences</span>
                  </>
                )}"""
new_save_btn = """                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    <span>Save Profile & Preferences</span>
                  </>
                )}"""
assert old_save_btn in content, 'Save btn mismatch'
content = content.replace(old_save_btn, new_save_btn, 1)

# 8. Interface Appearance Card
old_app_header = """            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span>🎨 Interface Appearance & Theme</span>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${
                theme === 'dark' ? 'bg-indigo-900 text-indigo-200 border border-indigo-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {theme === 'dark' ? '🌙 Dark Mode Active' : '☀️ Light Mode Active'}
              </span>
            </h3>"""
new_app_header = """            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600" />
              <span>Interface Appearance & Theme</span>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 ${
                theme === 'dark' ? 'bg-indigo-900 text-indigo-200 border border-indigo-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {theme === 'dark' ? <><Moon className="w-3 h-3" /> Dark Mode Active</> : <><Sun className="w-3 h-3 text-amber-600" /> Light Mode Active</>}
              </span>
            </h3>"""
assert old_app_header in content, 'App header mismatch'
content = content.replace(old_app_header, new_app_header, 1)

# 9. Light Mode & Dark Mode tiles
old_light_tile = """            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 text-xl font-bold">
              ☀️
            </div>"""
new_light_tile = """            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5 text-amber-600" />
            </div>"""
assert old_light_tile in content, 'Light tile mismatch'
content = content.replace(old_light_tile, new_light_tile, 1)

old_dark_tile = """            <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0 text-xl font-bold">
              🌙
            </div>"""
new_dark_tile = """            <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5 text-indigo-400" />
            </div>"""
assert old_dark_tile in content, 'Dark tile mismatch'
content = content.replace(old_dark_tile, new_dark_tile, 1)

# 10. Career Preferences Header
old_car_hdr = """                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>🎯 Career & Job Market Preferences</span>"""
new_car_hdr = """                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>Career & Job Market Preferences</span>"""
assert old_car_hdr in content, 'Car hdr mismatch'
content = content.replace(old_car_hdr, new_car_hdr, 1)

# 11. Search Status Options
old_opts = """                  <option value="ACTIVELY_LOOKING">🟢 Actively Interviewing & Ready to Join</option>
                  <option value="OPEN_TO_OFFERS">🟡 Open to Selective Opportunities</option>
                  <option value="NOT_LOOKING">⚪ Casually Exploring / Not Actively Looking</option>"""
new_opts = """                  <option value="ACTIVELY_LOOKING">Actively Interviewing & Ready to Join</option>
                  <option value="OPEN_TO_OFFERS">Open to Selective Opportunities</option>
                  <option value="NOT_LOOKING">Casually Exploring / Not Actively Looking</option>"""
assert old_opts in content, 'Opts mismatch'
content = content.replace(old_opts, new_opts, 1)

# 12. Preferred Work Modes
old_modes = """                [
                  { id: 'HYBRID', title: '🏢 Hybrid (2-3 Days Office)', desc: 'Flexible in-office collaboration' },
                  { id: 'REMOTE', title: '🏠 100% Remote / WFH', desc: 'Work from anywhere in India' },
                  { id: 'ON_SITE', title: '📍 In-Office (Full-time)', desc: 'Direct corporate campus presence' }
                ]"""
new_modes = """                [
                  { id: 'HYBRID', title: 'Hybrid (2-3 Days Office)', desc: 'Flexible in-office collaboration' },
                  { id: 'REMOTE', title: '100% Remote / WFH', desc: 'Work from anywhere in India' },
                  { id: 'ON_SITE', title: 'In-Office (Full-time)', desc: 'Direct corporate campus presence' }
                ]"""
assert old_modes in content, 'Modes mismatch'
content = content.replace(old_modes, new_modes, 1)

# 13. Location tag
old_loctag = "{isSelected ? `✓ ${loc}` : `+ ${loc}`}"
new_loctag = "{isSelected ? `${loc}` : `+ ${loc}`}"
assert old_loctag in content, 'Loctag mismatch'
content = content.replace(old_loctag, new_loctag, 1)

# 14. Save Career Preferences Button
old_save_car = "{savedSuccess ? '✓ Career Preferences Saved!' : '💾 Save Career Preferences'}"
new_save_car = "{savedSuccess ? 'Career Preferences Saved!' : 'Save Career Preferences'}"
assert old_save_car in content, 'Save car mismatch'
content = content.replace(old_save_car, new_save_car, 1)

# 15. Portfolio Links Header
old_port_hdr = """<h3 className="font-bold text-slate-900 text-base">🌐 Professional Profiles & Portfolio Links</h3>"""
new_port_hdr = """<h3 className="font-bold text-slate-900 text-base flex items-center gap-2"><Globe className="w-4 h-4 text-blue-600" /><span>Professional Profiles & Portfolio Links</span></h3>"""
assert old_port_hdr in content, 'Port hdr mismatch'
content = content.replace(old_port_hdr, new_port_hdr, 1)

# 16. Save Portfolio Links Button
old_save_port = "{savedSuccess ? '✓ Portfolio Links Saved!' : '💾 Save Portfolio Links'}"
new_save_port = "{savedSuccess ? 'Portfolio Links Saved!' : 'Save Portfolio Links'}"
assert old_save_port in content, 'Save port mismatch'
content = content.replace(old_save_port, new_save_port, 1)

# 17. Interview alerts header
old_alert_hdr = """<h3 className="font-bold text-slate-900 text-base">🔔 Interview Alerts & Communication Channels</h3>"""
new_alert_hdr = """<h3 className="font-bold text-slate-900 text-base flex items-center gap-2"><Bell className="w-4 h-4 text-blue-600" /><span>Interview Alerts & Communication Channels</span></h3>"""
assert old_alert_hdr in content, 'Alert hdr mismatch'
content = content.replace(old_alert_hdr, new_alert_hdr, 1)

# 18. Data Privacy Header & Export Button
old_priv_hdr = """<h3 className="font-bold text-slate-900 text-base">🛡️ Data Privacy & Candidate Rights</h3>"""
new_priv_hdr = """<h3 className="font-bold text-slate-900 text-base flex items-center gap-2"><Shield className="w-4 h-4 text-blue-600" /><span>Data Privacy & Candidate Rights</span></h3>"""
assert old_priv_hdr in content, 'Priv hdr mismatch'
content = content.replace(old_priv_hdr, new_priv_hdr, 1)

old_export_btn = """<span>📥 Export My Profile Data (JSON)</span>"""
new_export_btn = """<span className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Export My Profile Data (JSON)</span>"""
assert old_export_btn in content, 'Export btn mismatch'
content = content.replace(old_export_btn, new_export_btn, 1)

# 19. Account filter buttons
old_filter_p = """<span>⏳</span> Pending Requests ({userAccounts.filter(u => u.status === 'PENDING').length})"""
new_filter_p = """<span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending Requests ({userAccounts.filter(u => u.status === 'PENDING').length})</span>"""
assert old_filter_p in content, 'Filter P mismatch'
content = content.replace(old_filter_p, new_filter_p, 1)

old_filter_a = """👑 Admins ({userAccounts.filter(u => u.userType === 'ADMIN').length})"""
new_filter_a = """Admins ({userAccounts.filter(u => u.userType === 'ADMIN').length})"""
assert old_filter_a in content, 'Filter A mismatch'
content = content.replace(old_filter_a, new_filter_a, 1)

old_filter_r = """💼 Recruiters ({userAccounts.filter(u => u.role.toLowerCase().includes('recruiter') || (u.userType === 'USER' && !u.role.toLowerCase().includes('candidate'))).length})"""
new_filter_r = """Recruiters ({userAccounts.filter(u => u.role.toLowerCase().includes('recruiter') || (u.userType === 'USER' && !u.role.toLowerCase().includes('candidate'))).length})"""
assert old_filter_r in content, 'Filter R mismatch'
content = content.replace(old_filter_r, new_filter_r, 1)

old_filter_c = """🎯 Candidates ({userAccounts.filter(u => u.role.toLowerCase().includes('candidate')).length})"""
new_filter_c = """Candidates ({userAccounts.filter(u => u.role.toLowerCase().includes('candidate')).length})"""
assert old_filter_c in content, 'Filter C mismatch'
content = content.replace(old_filter_c, new_filter_c, 1)

# 20. Main Super-Admin Badge in Table
old_sa_badge = """                              <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 inline-block shadow-2xs">
                                👑 Main Super-Admin
                              </span>"""
new_sa_badge = """                              <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 inline-flex items-center gap-1 shadow-2xs">
                                <Shield className="w-3 h-3 text-blue-600" /> Main Super-Admin
                              </span>"""
assert old_sa_badge in content, 'SA badge mismatch'
content = content.replace(old_sa_badge, new_sa_badge, 1)

# 21. Table Primary Action Shortcuts (Approve, Reject, Revoke, Re-Approve)
old_app_btn = """                                        <button
                                          type="button"
                                          onClick={() => {
                                            onApproveUser && onApproveUser(user.id);
                                            alert(`Access approved for "${user.name}".`);
                                          }}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-lg text-[11px] shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
                                          title="Quick Approve"
                                        >
                                          <span>✓</span> Approve
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            onRejectUser && onRejectUser(user.id);
                                            alert(`Request rejected for "${user.name}". Access removed.`);
                                          }}
                                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-lg text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                                          title="Quick Reject"
                                        >
                                          <span>✕</span> Reject
                                        </button>"""

new_app_btn = """                                        <button
                                          type="button"
                                          onClick={() => {
                                            onApproveUser && onApproveUser(user.id);
                                            alert(`Access approved for "${user.name}".`);
                                          }}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-lg text-[11px] shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
                                          title="Quick Approve"
                                        >
                                          <Check className="w-3 h-3 text-white" /> Approve
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            onRejectUser && onRejectUser(user.id);
                                            alert(`Request rejected for "${user.name}". Access removed.`);
                                          }}
                                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-lg text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                                          title="Quick Reject"
                                        >
                                          <X className="w-3 h-3 text-rose-700" /> Reject
                                        </button>"""
assert old_app_btn in content, 'App btn mismatch'
content = content.replace(old_app_btn, new_app_btn, 1)

old_rev_btn = """                                    <button
                                      type="button"
                                      onClick={() => {
                                        onRevokeUserAccess && onRevokeUserAccess(user.id);
                                        alert(`Access revoked for "${user.name}". Any active session for this user has been terminated.`);
                                      }}
                                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold rounded-lg text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                                      title="Revoke Access (Immediately removes access)"
                                    >
                                      <span>⛔</span> Revoke
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onApproveUser && onApproveUser(user.id);
                                        alert(`Access re-approved for "${user.name}".`);
                                      }}
                                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-lg text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                                      title="Re-Approve Access"
                                    >
                                      <span>✓</span> Re-Approve
                                    </button>"""

new_rev_btn = """                                    <button
                                      type="button"
                                      onClick={() => {
                                        onRevokeUserAccess && onRevokeUserAccess(user.id);
                                        alert(`Access revoked for "${user.name}". Any active session for this user has been terminated.`);
                                      }}
                                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold rounded-lg text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                                      title="Revoke Access (Immediately removes access)"
                                    >
                                      <Ban className="w-3 h-3 text-amber-700" /> Revoke
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onApproveUser && onApproveUser(user.id);
                                        alert(`Access re-approved for "${user.name}".`);
                                      }}
                                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-lg text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                                      title="Re-Approve Access"
                                    >
                                      <Check className="w-3 h-3 text-emerald-700" /> Re-Approve
                                    </button>"""
assert old_rev_btn in content, 'Rev btn mismatch'
content = content.replace(old_rev_btn, new_rev_btn, 1)

# 22. Manage Menu Button
old_man_btn = """                                      <span>⚙️ Manage</span>
                                      <span className="text-[9px]">▾</span>"""
new_man_btn = """                                      <Settings className="w-3 h-3 text-slate-600" />
                                      <span>Manage</span>
                                      <ChevronDown className="w-3 h-3 text-slate-400" />"""
assert old_man_btn in content, 'Man btn mismatch'
content = content.replace(old_man_btn, new_man_btn, 1)

# 23. Popover User Header Badge
old_pop_badge = """{user.userType === 'ADMIN' ? '👑 Admin' : 'User'}"""
new_pop_badge = """{user.userType === 'ADMIN' ? 'Admin' : 'User'}"""
assert old_pop_badge in content, 'Pop badge mismatch'
content = content.replace(old_pop_badge, new_pop_badge, 1)

# 24. Replace entire Popover Menu Role Governance & Status & Deletion block!
old_popover_body = """                                            {/* Section 1: Role Permissions */}
                                            <div className="pt-1.5 space-y-0.5">
                                              <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1">
                                                Role Governance
                                              </div>

                                              {/* Promote to Admin */}
                                              {!isAdminRole ? (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    onMakeUserAdmin && onMakeUserAdmin(user.id);
                                                    alert(`Promoted "${user.name}" to Administrator.`);
                                                    setOpenMenuUserId(null);
                                                  }}
                                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-slate-900 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-left"
                                                >
                                                  <span className="text-sm">👑</span>
                                                  <div>
                                                    <div className="leading-tight">Make Admin</div>
                                                    <div className="text-[9px] text-slate-400 font-medium">Grant administrator privileges</div>
                                                  </div>
                                                </button>
                                              ) : (
                                                /* Remove Admin / Demote */
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    onRemoveUserAdmin && onRemoveUserAdmin(user.id);
                                                    alert(`Removed administrator rights for "${user.name}". Demoted to Recruiter.`);
                                                    setOpenMenuUserId(null);
                                                  }}
                                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-purple-900 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer text-left"
                                                >
                                                  <span className="text-sm">🛡️</span>
                                                  <div>
                                                    <div className="leading-tight">Remove Admin</div>
                                                    <div className="text-[9px] text-purple-600 font-medium">Demote back to standard Recruiter</div>
                                                  </div>
                                                </button>
                                              )}

                                              {/* Make Recruiter */}
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
                                                  <span className="text-sm">💼</span>
                                                  <div>
                                                    <div className="leading-tight">Make Recruiter</div>
                                                    <div className="text-[9px] text-blue-600 font-medium">Set role to Talent Acquisition Specialist</div>
                                                  </div>
                                                </button>
                                              )}
                                            </div>

                                            {/* Section 2: Access Status */}
                                            <div className="pt-1.5 space-y-0.5">
                                              <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1">
                                                Access Status
                                              </div>

                                              {user.status !== 'APPROVED' && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    onApproveUser && onApproveUser(user.id);
                                                    alert(`Approved access for "${user.name}".`);
                                                    setOpenMenuUserId(null);
                                                  }}
                                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer text-left"
                                                >
                                                  <span className="text-sm">✓</span>
                                                  <div>
                                                    <div className="leading-tight">Approve Access</div>
                                                    <div className="text-[9px] text-emerald-600 font-medium">Allow user to log in</div>
                                                  </div>
                                                </button>
                                              )}

                                              {user.status === 'APPROVED' && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    onRevokeUserAccess && onRevokeUserAccess(user.id);
                                                    alert(`Revoked access for "${user.name}". Active session terminated.`);
                                                    setOpenMenuUserId(null);
                                                  }}
                                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer text-left"
                                                >
                                                  <span className="text-sm">⛔</span>
                                                  <div>
                                                    <div className="leading-tight">Revoke Access</div>
                                                    <div className="text-[9px] text-amber-600 font-medium">Immediately block login & kick session</div>
                                                  </div>
                                                </button>
                                              )}

                                              {user.status === 'PENDING' && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    onRejectUser && onRejectUser(user.id);
                                                    alert(`Rejected request for "${user.name}".`);
                                                    setOpenMenuUserId(null);
                                                  }}
                                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                                                >
                                                  <span className="text-sm">✕</span>
                                                  <div>
                                                    <div className="leading-tight">Reject Request</div>
                                                    <div className="text-[9px] text-rose-500 font-medium">Decline pending request</div>
                                                  </div>
                                                </button>
                                              )}
                                            </div>

                                            {/* Section 3: Permanent Deletion */}
                                            <div className="pt-1.5">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (window.confirm(`Permanently delete account for "${user.name}" (${user.email})? This action cannot be undone.`)) {
                                                    onDeleteUserAccount && onDeleteUserAccount(user.id);
                                                    alert(`Account for "${user.name}" has been permanently deleted.`);
                                                    setOpenMenuUserId(null);
                                                  }
                                                }}
                                                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                                              >
                                                <span className="text-sm">🗑️</span>
                                                <div>
                                                  <div className="leading-tight">Delete Account</div>
                                                  <div className="text-[9px] text-rose-500 font-medium">Permanently delete from database</div>
                                                </div>
                                              </button>
                                            </div>"""

new_popover_body = """                                            {/* Section 1: Role Governance */}
                                            <div className="pt-1.5 space-y-0.5">
                                              <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1">
                                                Role Governance
                                              </div>

                                              {/* Promote to Admin */}
                                              {!isAdminRole && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    onMakeUserAdmin && onMakeUserAdmin(user.id);
                                                    alert(`Promoted "${user.name}" to Administrator.`);
                                                    setOpenMenuUserId(null);
                                                  }}
                                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-slate-900 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-left"
                                                >
                                                  <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                  <div>
                                                    <div className="leading-tight">Make Admin</div>
                                                    <div className="text-[9px] text-slate-400 font-medium">Grant administrator privileges</div>
                                                  </div>
                                                </button>
                                              )}

                                              {/* Remove Admin */}
                                              {isAdminRole && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    onRemoveUserAdmin && onRemoveUserAdmin(user.id);
                                                    alert(`Removed administrator rights for "${user.name}". Demoted to Recruiter.`);
                                                    setOpenMenuUserId(null);
                                                  }}
                                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-purple-900 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer text-left"
                                                >
                                                  <ShieldOff className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                                  <div>
                                                    <div className="leading-tight">Remove Admin</div>
                                                    <div className="text-[9px] text-purple-600 font-medium">Demote to Recruiter</div>
                                                  </div>
                                                </button>
                                              )}

                                              {/* Make Recruiter */}
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

                                              {/* Remove Recruiter (Demote to Candidate) */}
                                              {isRecruiterRole && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const fn = onMakeUserCandidate || onRemoveUserRecruiter;
                                                    fn && fn(user.id);
                                                    alert(`Removed Recruiter role for "${user.name}". Demoted to Candidate.`);
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
                                              )}
                                            </div>

                                            {/* Section 2: Access Status */}
                                            <div className="pt-1.5 space-y-0.5">
                                              <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1">
                                                Access Status
                                              </div>

                                              {user.status !== 'APPROVED' && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    onApproveUser && onApproveUser(user.id);
                                                    alert(`Approved access for "${user.name}".`);
                                                    setOpenMenuUserId(null);
                                                  }}
                                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer text-left"
                                                >
                                                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                  <div>
                                                    <div className="leading-tight">Approve Access</div>
                                                    <div className="text-[9px] text-emerald-600 font-medium">Allow user to log in</div>
                                                  </div>
                                                </button>
                                              )}

                                              {user.status === 'APPROVED' && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    onRevokeUserAccess && onRevokeUserAccess(user.id);
                                                    alert(`Revoked access for "${user.name}". Active session terminated.`);
                                                    setOpenMenuUserId(null);
                                                  }}
                                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer text-left"
                                                >
                                                  <Ban className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                  <div>
                                                    <div className="leading-tight">Revoke Access</div>
                                                    <div className="text-[9px] text-amber-600 font-medium">Immediately block login & kick session</div>
                                                  </div>
                                                </button>
                                              )}

                                              {user.status === 'PENDING' && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    onRejectUser && onRejectUser(user.id);
                                                    alert(`Rejected request for "${user.name}".`);
                                                    setOpenMenuUserId(null);
                                                  }}
                                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                                                >
                                                  <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                  <div>
                                                    <div className="leading-tight">Reject Request</div>
                                                    <div className="text-[9px] text-rose-500 font-medium">Decline pending request</div>
                                                  </div>
                                                </button>
                                              )}
                                            </div>

                                            {/* Section 3: Permanent Deletion */}
                                            <div className="pt-1.5">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (window.confirm(`Permanently delete account for "${user.name}" (${user.email})? This action cannot be undone.`)) {
                                                    onDeleteUserAccount && onDeleteUserAccount(user.id);
                                                    alert(`Account for "${user.name}" has been permanently deleted.`);
                                                    setOpenMenuUserId(null);
                                                  }
                                                }}
                                                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                                              >
                                                <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                <div>
                                                  <div className="leading-tight">Delete Account</div>
                                                  <div className="text-[9px] text-rose-500 font-medium">Permanently delete from database</div>
                                                </div>
                                              </button>
                                            </div>"""
assert old_popover_body in content, 'Popover body mismatch'
content = content.replace(old_popover_body, new_popover_body, 1)

# 25. Restore default jobs button
old_rest_btn = """🔄 Restore Default Job Postings"""
new_rest_btn = """Restore Default Job Postings"""
assert old_rest_btn in content, 'Rest btn mismatch'
content = content.replace(old_rest_btn, new_rest_btn, 1)

with open('src/pages/SettingsView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('SettingsView.tsx updated successfully!')
