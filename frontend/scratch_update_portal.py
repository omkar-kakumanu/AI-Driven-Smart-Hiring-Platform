with open('src/pages/CandidatePortalView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# 1. Imports
content = content.replace("import { UserAvatar } from '../components/UserAvatar';",
                          "import { UserAvatar } from '../components/UserAvatar';\nimport { Target, Share2, Mic, Bot, Check, Briefcase, MapPin, Calendar, Video, Zap, Sparkles, Bell, ArrowRight } from 'lucide-react';")

# 2. Status badge
content = content.replace("● Status: {activeCandidate.status || 'Applied'}",
                          "Status: {activeCandidate.status || 'Applied'}")

# 3. Action buttons
content = content.replace("<span>🎯 Skill Gap Analysis</span>",
                          "<span className=\"flex items-center gap-1.5\"><Target className=\"w-3.5 h-3.5\" /> Skill Gap Analysis</span>")

content = content.replace("<span>📊 ATS Status</span>",
                          "<span className=\"flex items-center gap-1.5\"><Share2 className=\"w-3.5 h-3.5\" /> ATS Status</span>")

content = content.replace("<span>🎙️ Voice Screening</span>",
                          "<span className=\"flex items-center gap-1.5\"><Mic className=\"w-3.5 h-3.5\" /> Voice Screening</span>")

content = content.replace("<span>🤖 Practice Interview</span>",
                          "<span className=\"flex items-center gap-1.5\"><Bot className=\"w-3.5 h-3.5\" /> Practice Interview</span>")

# 4. Pipeline stepper
content = content.replace("{isPassed ? '✓' : idx + 1}",
                          "{isPassed ? <Check className=\"w-3.5 h-3.5\" /> : idx + 1}")

content = content.replace("● In Progress", "In Progress")
content = content.replace("✓ Completed", "Completed")

# 5. Active jobs header
content = content.replace("<span>💼 Active Job Openings & Instant Fit Match</span>",
                          "<span className=\"flex items-center gap-2\"><Briefcase className=\"w-4 h-4 text-blue-600\" /> Active Job Openings & Instant Fit Match</span>")

# 6. Job location & salary
content = content.replace("<p>📍 {formatIndianLocation(job.location)}</p>",
                          "<p className=\"flex items-center gap-1.5\"><MapPin className=\"w-3.5 h-3.5 text-slate-400 shrink-0\" /> {formatIndianLocation(job.location)}</p>")

content = content.replace("<p>💰 {formatIndianSalary(job.minSalary, job.maxSalary)}</p>",
                          "<p className=\"flex items-center gap-1.5 text-slate-700 font-semibold\"><span className=\"text-slate-400 font-bold\">₹</span> {formatIndianSalary(job.minSalary, job.maxSalary)}</p>")

# 7. Scheduled interviews
content = content.replace("""<div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                  📅
                </div>""",
                          """<div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                  <Calendar className="w-4 h-4" />
                </div>""")

content = content.replace("""<span className="text-2xl">🗓️</span>""",
                          """<Calendar className="w-8 h-8 text-slate-400 mx-auto" />""")

content = content.replace("<span>📹 Join Meeting Room</span>",
                          "<span className=\"flex items-center gap-1.5\"><Video className=\"w-3.5 h-3.5\" /> Join Meeting Room</span>")

# 8. AI Assessment
content = content.replace("""<div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                ⚡
              </div>""",
                          """<div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                <Zap className="w-4 h-4" />
              </div>""")

content = content.replace("""<p className="font-black text-purple-900 flex items-center gap-1.5">
                <span>💡</span> AI Interviewer Feedback Summary
              </p>""",
                          """<p className="font-black text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" /> AI Interviewer Feedback Summary
              </p>""")

# 9. Notifications Center
content = content.replace("""<div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                  🔔
                </div>""",
                          """<div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                  <Bell className="w-4 h-4" />
                </div>""")

content = content.replace("Mark Read ✓", "Mark Read")

with open('src/pages/CandidatePortalView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('CandidatePortalView.tsx updated!')
