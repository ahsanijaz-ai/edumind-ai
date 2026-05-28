"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Sparkles, BookOpen, Target, LogOut, ArrowLeft, Loader2, BrainCircuit, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

interface Subject {
  id: string;
  name: string;
  description: string;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subject_id");
  const router = useRouter();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isFetchingSubjects, setIsFetchingSubjects] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: "smooth" });
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserId(session.user.id);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/subjects/${session.user.id}`, { cache: "no-store" });
        if (res.ok) setSubjects(await res.json());
      } catch (e) { console.log("Failed to fetch subjects:", e); }
      finally { setIsFetchingSubjects(false); }
    };
    init();
  }, [router]);

  useEffect(() => {
    if (isFetchingSubjects) return;
    const currentSubject = subjects.find(s => s.id === subjectId);
    const greeting = subjectId && currentSubject
      ? `Hello! I'm ready to help you master **${currentSubject.name}**. Ask me anything, or let's dive into your materials!`
      : "Hello! I'm EduMind AI, your personal tutor. What would you like to explore today?";
    setMessages([{ id: "1", role: "ai", content: greeting }]);
  }, [subjectId, subjects, isFetchingSubjects]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: userId, message: userMsg.content, subject_id: subjectId, current_difficulty: "beginner", mastery_level: 0, weak_concepts: [] }),
      });
      const aiContent = res.ok ? (await res.json()).response : "Sorry, the backend isn't responding. Please ensure the server is running.";
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: aiContent }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: "Failed to connect to the backend. Please ensure the server is running." }]);
    } finally { setLoading(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };
  const currentSubject = subjects.find(s => s.id === subjectId);

  const clearChat = async () => {
    if (!userId) return;
    try {
      await fetch(`http://127.0.0.1:8000/api/v1/chat/${userId}/clear?subject_id=${subjectId || ''}`, { method: "DELETE" });
    } catch {}
    const currentSubject = subjects.find(s => s.id === subjectId);
    const greeting = subjectId && currentSubject
      ? `Hello! I'm ready to help you master **${currentSubject.name}**. Ask me anything about your uploaded materials!`
      : "Hello! I'm EduMind AI, your personal study assistant. What would you like to learn today?";
    setMessages([{ id: Date.now().toString(), role: "ai", content: greeting }]);
  };

  const renderMessage = (content: string) => {
    // Convert markdown to styled spans
    return content
      .replace(/```(.*?)```/gs, '<code class="block bg-slate-100 rounded-lg p-3 my-2 text-sm font-mono text-slate-800">$1</code>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 rounded px-1.5 py-0.5 text-sm font-mono text-blue-600">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="flex fixed inset-0 bg-slate-50 text-slate-900 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.15); }
        @keyframes msg-in { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .msg-enter { animation: msg-in 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
        .nav-item { color: #64748b; transition: all 0.2s; }
        .nav-item:hover { color: #0f172a; background: #f1f5f9; }
        .nav-item.active { color: #0f172a; background: #f1f5f9; border: 1px solid #e2e8f0; }
      ` }} />

      {/* Ambient background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)" }}></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)" }}></div>

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex-col relative z-10 hidden md:flex flex-shrink-0" style={{ borderColor: "#e2e8f0" }}>
        <div className="h-20 flex items-center px-6 border-b" style={{ borderColor: "#e2e8f0" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-500/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">EduMind</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-5 custom-scrollbar">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 mb-3">Your Subjects</p>
            {isFetchingSubjects ? (
              <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 text-blue-500 animate-spin" /></div>
            ) : subjects.length > 0 ? (
              <div className="space-y-1">
                {subjects.map(subject => (
                  <Link key={subject.id} href={`/chat?subject_id=${subject.id}`}
                    className={`nav-item ${subject.id === subjectId ? "active" : ""} flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm`}
                  >
                    <BookOpen className={`w-4 h-4 flex-shrink-0 ${subject.id === subjectId ? "text-blue-500" : ""}`} />
                    <span className="truncate">{subject.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="px-3 text-sm text-slate-500 font-medium">No subjects yet.</p>
            )}
          </div>

          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 mb-3">General</p>
            <Link href="/chat" className={`nav-item ${!subjectId ? "active" : ""} flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm`}>
              <MessageSquare className={`w-4 h-4 flex-shrink-0 ${!subjectId ? "text-emerald-500" : ""}`} />
              <span>General Assistant</span>
            </Link>
          </div>
        </div>

        <div className="p-3 pb-8 border-t space-y-1" style={{ borderColor: "#e2e8f0" }}>
          <Link href="/dashboard" className="nav-item flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm">
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />Back to Dashboard
          </Link>
          <button onClick={handleLogout} className="nav-item hover:text-red-500 hover:bg-red-50 w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm">
            <LogOut className="w-4 h-4 flex-shrink-0" />Log out
          </button>
        </div>
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col h-full min-h-0 relative z-10">

        {/* Header */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", borderColor: "#e2e8f0" }}>
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Link href="/dashboard" className="p-2 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900">{currentSubject ? currentSubject.name : "General Assistant"}</h1>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">
                <Sparkles className="w-3 h-3" /> Powered by Gemini AI
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearChat}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
              title="Clear conversation history"
            >
              Clear chat
            </button>
            {currentSubject && (
              <Link href={`/dashboard/subjects/${currentSubject.id}`} className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 transition-all bg-white shadow-sm hover:shadow-md" style={{ border: "1px solid #e2e8f0" }}>
                <BookOpen className="w-4 h-4" /> View Materials
              </Link>
            )}
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((m, i) => (
              <div key={m.id} className={`flex gap-3 msg-enter ${m.role === "user" ? "justify-end" : "justify-start"}`} style={{ animationDelay: `${i * 0.03}s` }}>
                {m.role === "ai" && (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-blue-50 border border-blue-200">
                    <Sparkles size={16} className="text-blue-500" />
                  </div>
                )}
                <div className={`max-w-[82%] rounded-2xl px-5 py-4 text-[15px] font-medium leading-relaxed ${
                  m.role === "user"
                    ? "text-black rounded-br-sm shadow-sm"
                    : "text-slate-700 rounded-bl-sm shadow-sm"
                }`} style={m.role === "user"
                    ? { background: "white", border: "1px solid #e2e8f0" }
                    : { background: "white", border: "1px solid #e2e8f0" }
                }>
                  {m.role === "ai" ? (
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderMessage(m.content) }} />
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
                {m.role === "user" && (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-slate-100 border border-slate-200">
                    <User size={16} className="text-slate-500" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-50 border border-blue-200">
                  <Sparkles size={16} className="text-blue-500" />
                </div>
                <div className="px-5 py-4 rounded-2xl rounded-bl-sm flex items-center bg-white shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
                  <div className="flex gap-1.5 items-center">
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div className="h-2" />
          </div>
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-4 md:px-8 py-4 border-t" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", borderColor: "#e2e8f0" }}>
          <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                  placeholder={loading ? "AI is thinking..." : "Ask anything about your subject..."}
                  disabled={loading}
                  rows={1}
                  className="w-full px-5 py-3.5 pr-5 rounded-2xl text-[15px] text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-50 font-medium resize-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                  style={{ background: "white", border: "1px solid #cbd5e1", lineHeight: "1.6", maxHeight: "120px" }}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-12 h-12 flex items-center justify-center rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}
              >
                <Send size={18} className="text-white" />
              </button>
            </div>
            <p className="text-center text-[11px] text-slate-400 font-medium mt-3 tracking-wide">
              EduMind AI can make mistakes · Press Enter to send, Shift+Enter for new line
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
