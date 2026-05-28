"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Target, Plus, BookText, LogOut, ArrowRight, TrendingUp, Zap, BrainCircuit } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  description: string;
}

export default function Dashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDesc, setNewSubjectDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserName(session.user.user_metadata?.full_name?.split(" ")[0] || "Student");
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/subjects/${session.user.id}`, { cache: "no-store" });
        if (res.ok) setSubjects(await res.json());
        else setSubjects([]);
      } catch (e) { console.log("Failed to fetch subjects:", e); }
      finally { setLoading(false); }
    };
    checkAuth();
  }, [router]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/subjects/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubjectName, description: newSubjectDesc, student_id: session.user.id })
      });
      if (res.ok) {
        setSubjects([...subjects, await res.json()]);
        setIsModalOpen(false); setNewSubjectName(""); setNewSubjectDesc("");
      }
    } catch (error) { console.log("Failed to create subject", error); }
    finally { setCreating(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  const subjectColors = [
    "from-purple-500/20 to-indigo-500/20 border-purple-500/20",
    "from-blue-500/20 to-cyan-500/20 border-blue-500/20",
    "from-emerald-500/20 to-teal-500/20 border-emerald-500/20",
    "from-orange-500/20 to-red-500/20 border-orange-500/20",
    "from-pink-500/20 to-rose-500/20 border-pink-500/20",
    "from-yellow-500/20 to-amber-500/20 border-yellow-500/20",
  ];

  const subjectIcons = ["📚", "🔬", "📐", "🌍", "💡", "🎯"];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex fixed inset-0 bg-slate-50 text-slate-900 font-sans overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes float-up { to { opacity: 1; transform: translateY(0); } }
        @keyframes modal-in { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-enter { animation: modal-in 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.15); }
        .cta-btn { background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 0 30px rgba(59,130,246,0.3); }
        .cta-btn:hover { box-shadow: 0 0 50px rgba(59,130,246,0.5); transform: scale(1.03); }
        .input-field { background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a; }
        .input-field:focus { outline: none; border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .input-field::placeholder { color: #94a3b8; }
        .nav-item { color: #64748b; transition: all 0.2s; }
        .nav-item:hover { color: #0f172a; background: #f1f5f9; }
        .nav-item.active { color: #0f172a; background: #f1f5f9; border: 1px solid #e2e8f0; }
      ` }} />

      {/* Ambient background */}
      <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)" }}></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)" }}></div>

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col relative z-10 hidden md:flex flex-shrink-0" style={{ borderColor: "#e2e8f0" }}>
        <div className="h-20 flex items-center px-6 border-b" style={{ borderColor: "#e2e8f0" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-500/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">EduMind</span>
          </div>
        </div>

        {/* User Badge */}
        <div className="px-4 py-4 border-b" style={{ borderColor: "#e2e8f0" }}>
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-slate-900 font-bold text-sm truncate">{userName}</p>
              <p className="text-slate-500 text-xs font-medium">Student</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 mb-3">Navigation</p>
          <Link href="/dashboard" className="nav-item active flex items-center px-3 py-3 rounded-xl font-bold text-sm">
            <BookOpen className="w-4 h-4 mr-3 text-blue-500" />Subjects
          </Link>
          <Link href="/dashboard/evaluations" className="nav-item flex items-center px-3 py-3 rounded-xl font-bold text-sm">
            <Target className="w-4 h-4 mr-3" />Evaluations
          </Link>
          <Link href="/chat" className="nav-item flex items-center px-3 py-3 rounded-xl font-bold text-sm">
            <BookText className="w-4 h-4 mr-3" />AI Tutor
          </Link>
        </nav>

        <div className="p-3 pb-8 border-t" style={{ borderColor: "#e2e8f0" }}>
          <button onClick={handleLogout} className="nav-item flex w-full items-center px-3 py-3 rounded-xl font-bold text-sm hover:text-red-500 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-3" />Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto relative z-10 custom-scrollbar">

        {/* Top Header */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b sticky top-0 z-30" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", borderColor: "#e2e8f0" }}>
          <div>
            <h1 className="text-lg font-black text-slate-900">Your Dashboard</h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="cta-btn flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-all"
          >
            <Plus className="w-4 h-4" /> New Subject
          </button>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full flex-1">

          {/* Welcome Banner */}
          <div className="mb-8 p-6 rounded-2xl relative overflow-hidden" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "1px solid #bfdbfe" }}>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px]" style={{ background: "rgba(59,130,246,0.3)" }}></div>
            <div className="relative z-10">
              <p className="text-blue-600 text-sm font-black uppercase tracking-widest mb-1">Good day, {userName}!</p>
              <h2 className="text-2xl font-black text-slate-900 mb-1">What are you studying today?</h2>
              <p className="text-slate-600 font-medium text-sm">Select a subject or create a new one to begin.</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Subjects", value: subjects.length, icon: <BookOpen className="w-5 h-5" />, color: "text-blue-600" },
              { label: "AI Sessions", value: "∞", icon: <Zap className="w-5 h-5" />, color: "text-blue-500" },
              { label: "Progress", value: "Active", icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-500" },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                <div className={`${stat.color} mb-3`}>{stat.icon}</div>
                <p className="text-slate-900 text-2xl font-black">{stat.value}</p>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900">My Subjects</h2>
            {subjects.length > 0 && (
              <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">{subjects.length} subject{subjects.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {subjects.length === 0 ? (
            <div
              className="border-2 border-dashed rounded-[2rem] p-16 text-center cursor-pointer transition-all duration-300 group hover:border-blue-500/40"
              style={{ borderColor: "#cbd5e1", background: "white" }}
              onClick={() => setIsModalOpen(true)}
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">No subjects yet</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium leading-relaxed">Create your first subject to start uploading course materials and generating AI-powered quizzes.</p>
              <span className="cta-btn inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-xl font-black text-sm transition-all">
                <Plus className="w-4 h-4" /> Create First Subject
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((sub, idx) => (
                <Link key={sub.id} href={`/dashboard/subjects/${sub.id}`}>
                  <div
                    className="border rounded-[1.75rem] p-7 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:border-blue-400 group h-full flex flex-col relative overflow-hidden"
                    style={{ background: "white", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", animation: `float-up 0.5s ease-out forwards`, animationDelay: `${idx * 0.08}s`, opacity: 0, transform: "translateY(20px)" }}
                  >
                    <div className="absolute -top-4 -right-4 text-[80px] opacity-[0.03] select-none">{subjectIcons[idx % subjectIcons.length]}</div>
                    <div className="text-3xl mb-5 relative z-10">{subjectIcons[idx % subjectIcons.length]}</div>
                    <h3 className="text-lg font-black text-slate-900 mb-2 relative z-10">{sub.name}</h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed flex-1 line-clamp-2 relative z-10">{sub.description || "Upload materials and start studying with AI."}</p>
                    <div className="mt-6 pt-5 flex items-center justify-between relative z-10" style={{ borderTop: "1px solid #e2e8f0" }}>
                      <span className="text-slate-400 group-hover:text-blue-500 transition-colors text-xs font-bold uppercase tracking-wider">Open Subject</span>
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-500 group-hover:translate-x-1 transition-all">
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="modal-enter bg-white rounded-[2rem] p-8 w-full max-w-md shadow-[0_40px_80px_rgba(0,0,0,0.15)] relative z-10" style={{ border: "1px solid #e2e8f0" }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900">New Subject</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">Add a new subject to your dashboard</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all">✕</button>
            </div>
            <form onSubmit={handleCreateSubject} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2.5">Subject Name *</label>
                <input type="text" required value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="e.g. Cell Biology, Data Structures" className="input-field w-full px-5 py-4 rounded-xl text-sm font-medium transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2.5">Description <span className="text-slate-400 font-medium">(optional)</span></label>
                <textarea value={newSubjectDesc} onChange={e => setNewSubjectDesc(e.target.value)} placeholder="Brief overview of the subject..." className="input-field w-full px-5 py-4 rounded-xl text-sm font-medium transition-all resize-none h-28" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 text-slate-500 hover:text-slate-700 font-bold transition-colors rounded-xl text-sm" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>Cancel</button>
                <button type="submit" disabled={creating} className="cta-btn flex-1 py-3.5 text-white font-black rounded-xl transition-all text-sm disabled:opacity-60">
                  {creating ? "Creating..." : "Create Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
