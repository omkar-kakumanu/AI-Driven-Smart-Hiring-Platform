import React, { useState } from 'react';
import { HelpCircle, Bot, Send, CheckCircle2 } from 'lucide-react';
import type { ChatMessage, Candidate } from '../types';

interface InterviewAssistantViewProps {
  candidates?: Candidate[];
}

export const InterviewAssistantView: React.FC<InterviewAssistantViewProps> = ({ candidates = [] }) => {
  const activeCandName = candidates.length > 0 ? candidates[0].fullName : 'Sarah Johnson';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello ${activeCandName}, I'm your AI interviewer today. Let's start with a technical question about your system architecture and deployment experience.`,
      timestamp: '10:00 AM'
    },
    {
      id: 'msg-2',
      sender: 'user',
      text: "I'd be happy to discuss my technical background and deployment experience.",
      timestamp: '10:01 AM'
    },
    {
      id: 'msg-3',
      sender: 'ai',
      text: "Great! Can you describe your approach to monitoring production backend systems and how you handle service degradation under high load?",
      timestamp: '10:01 AM'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const questions = [
    {
      id: 1,
      category: 'Technical',
      difficulty: 'Hard',
      question: 'Describe a project where you had to optimize performance. What techniques did you use and what was the quantifiable outcome?',
      timeEstimate: '3-5 min response'
    },
    {
      id: 2,
      category: 'Technical',
      difficulty: 'Medium',
      question: 'How would you approach deploying a scalable machine learning or microservice system in production using modern DevOps tools?',
      timeEstimate: '4-6 min response'
    },
    {
      id: 3,
      category: 'Behavioral',
      difficulty: 'Medium',
      question: 'Tell me about a time when you had to explain complex technical concepts to non-technical stakeholders. How did you ensure understanding?',
      timeEstimate: '2-4 min response'
    }
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: "Thank you for that explanation. Could you also elaborate on how you handle database queries, indexing strategies, or caching to prevent bottlenecks?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiReply]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interview Assistance & ATS Integration</h2>
          <p className="text-slate-500 text-sm mt-0.5">Generate role-tailored questions, conduct AI interview simulations, and sync ATS data</p>
        </div>
        <span className="px-3 py-1 bg-amber-500 text-white rounded-md text-xs font-bold uppercase tracking-wider shadow-sm">
          Milestone 3
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interview Question Generator */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
              <HelpCircle className="w-5 h-5 text-blue-600" /> Interview Question Generator
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Position</label>
              <select className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option>Senior Machine Learning Engineer</option>
                <option>Senior Java Backend Engineer</option>
                <option>Frontend React Developer</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Question Domain</label>
              <select className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option>Technical Architecture</option>
                <option>Behavioral & Leadership</option>
                <option>Problem-Solving Scenarios</option>
              </select>
            </div>
          </div>

          {/* Generated Question Cards */}
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2 relative">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                    {q.id}
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">{q.question}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold pl-9">
                  <span>{q.category}</span> • <span>{q.difficulty}</span> • <span>{q.timeEstimate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Interview Simulation Chatbot */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col h-[480px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">AI Interview Simulation Chatbot</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Candidate: <strong className="text-slate-900">{activeCandName}</strong></span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">Active Chat</span>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-sm font-medium'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200 font-medium'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 text-xs text-slate-500 animate-pulse font-medium">
                    AI Interviewer is analyzing response...
                  </div>
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="Type your response to the interviewer..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </div>
          </div>

          {/* ATS Status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs">ATS Provider Sync Status</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
