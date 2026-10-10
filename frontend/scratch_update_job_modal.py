with open('src/components/NewJobModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

content = content.replace("import React, { useState, useEffect } from 'react';",
                          "import React, { useState, useEffect } from 'react';\nimport { X, Edit3, Zap, Sparkles, Trash2, Save, ArrowRight } from 'lucide-react';")

content = content.replace("setAiGeneratedNotice('✨ Job description successfully generated using AI')",
                          "setAiGeneratedNotice('Job description successfully generated using AI')")
content = content.replace("setAiGeneratedNotice('✨ Job description generated using built-in template')",
                          "setAiGeneratedNotice('Job description generated using built-in template')")

content = content.replace("{initialJob ? '✏️' : '⚡'}",
                          "{initialJob ? <Edit3 className=\"w-5 h-5 text-white\" /> : <Zap className=\"w-5 h-5 text-white\" />}")

content = content.replace("""          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-all"
          >
            ✕
          </button>""",
                          """          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-all"
          >
            <X className="w-4 h-4" />
          </button>""")

content = content.replace('<button onClick={() => setAiGeneratedNotice(null)} className="text-emerald-600 hover:text-emerald-900 text-xs">✕</button>',
                          '<button onClick={() => setAiGeneratedNotice(null)} className="text-emerald-600 hover:text-emerald-900 text-xs"><X className="w-3.5 h-3.5" /></button>')

content = content.replace('<span>✨</span>', '<Sparkles className="w-3.5 h-3.5 text-white" />')

content = content.replace("""                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600 text-[10px]"
                  >
                    ✕
                  </button>""",
                          """                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600 text-[10px]"
                  >
                    <X className="w-3 h-3" />
                  </button>""")

content = content.replace("""                  <button
                    type="button"
                    onClick={() => handleRemovePreferred(skill)}
                    className="hover:text-rose-600 text-[10px]"
                  >
                    ✕
                  </button>""",
                          """                  <button
                    type="button"
                    onClick={() => handleRemovePreferred(skill)}
                    className="hover:text-rose-600 text-[10px]"
                  >
                    <X className="w-3 h-3" />
                  </button>""")

content = content.replace('🗑️ Delete Job', '<span className="flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete Job</span>')

content = content.replace("{initialJob ? '💾 Save Changes' : '🚀 Publish Job Opening'}",
                          "{initialJob ? <span className=\"flex items-center gap-1.5\"><Save className=\"w-3.5 h-3.5 text-white\" /> Save Changes</span> : <span className=\"flex items-center gap-1.5\"><ArrowRight className=\"w-3.5 h-3.5 text-white\" /> Publish Job Opening</span>}")

with open('src/components/NewJobModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('NewJobModal.tsx updated!')
