"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { BookOpen, Upload, FileText, Target, ArrowLeft, Sparkles, CheckSquare, Square, Settings2, LogOut, BookText, BarChart3, TrendingUp, BrainCircuit } from "lucide-react";
import Link from "next/link";

interface Document {
  id: string;
  filename: string;
}

export default function SubjectDetail() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [quizzesTaken, setQuizzesTaken] = useState(0);
  const [masteryLevel, setMasteryLevel] = useState(0);
  const [subjectName, setSubjectName] = useState("Subject");

  const params = useParams();
  const subjectId = params.id as string;
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserId(session.user.id);
      fetchMaterials();
      fetchStats(session.user.id);
      fetchSubjectName(session.user.id);
    };
    init();
  }, [router, subjectId]);

  const fetchSubjectName = async (uid: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/subjects/${uid}`, { cache: "no-store" });
      if (res.ok) {
        const subjects = await res.json();
        const found = subjects.find((s: any) => s.id === subjectId);
        if (found) setSubjectName(found.name);
      }
    } catch (e) { console.log(e); }
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/materials/${subjectId}`, { cache: "no-store" });
      if (res.ok) setDocuments(await res.json());
    } catch (e) { console.log(e); }
  };

  const fetchStats = async (uid: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/evaluations/history/${uid}`, { cache: "no-store" });
      if (res.ok) {
        const history = await res.json();
        const subjectQuizzes = history.filter((q: any) => q.quiz_id === `quiz-${subjectId}`);
        setQuizzesTaken(subjectQuizzes.length);
        if (subjectQuizzes.length > 0) {
          setMasteryLevel(Math.round(subjectQuizzes.reduce((acc: number, q: any) => acc + q.score, 0) / subjectQuizzes.length));
        }
      }
    } catch (e) { console.log("Failed to load stats", e); }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!userId) return;
    setUploading(true);
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subject_id", subjectId);
      formData.append("student_id", userId);
      try {
        await fetch(`http://127.0.0.1:8000/api/v1/materials/upload`, { method: "POST", body: formData });
      } catch (e) { console.log("Upload failed", e); }
    }
    await fetchMaterials();
    setUploading(false);
  }, [subjectId, userId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const toggleDocSelection = (id: string) => {
    setSelectedDocs(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  const aiTutorHref = `/chat?subject_id=${subjectId}${selectedDocs.length > 0 ? `&docs=${selectedDocs.join(",")}` : ""}`;
  const quizHref = `/dashboard/subjects/${subjectId}/quiz?num_questions=${numQuestions}${selectedDocs.length > 0 ? `&docs=${selectedDocs.join(",")}` : ""}`;

  const masteryColor = masteryLevel >= 80 ? "text-emerald-500" : masteryLevel >= 50 ? "text-amber-500" : "text-red-500";

  return (
    <div className="flex fixed inset-0 bg-slate-50 text-slate-900 font-sans overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes float-up { to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .nav-item { color: #64748b; transition: all 0.2s; }
        .nav-item:hover { color: #0f172a; background: #f1f5f9; }
        .cta-btn { background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 0 30px rgba(59,130,246,0.3); }
        .cta-btn:hover { box-shadow: 0 0 50px rgba(59,130,246,0.5); transform: scale(1.03); }
      ` }} />

      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)" }}></div>

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
        <nav className="flex-1 py-5 px-3 space-y-1">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 mb-3">Navigation</p>
          <Link href="/dashboard" className="nav-item flex items-center px-3 py-3 rounded-xl font-bold text-sm"><BookOpen className="w-4 h-4 mr-3 text-blue-500" />Subjects</Link>
          <Link href="/dashboard/evaluations" className="nav-item flex items-center px-3 py-3 rounded-xl font-bold text-sm"><Target className="w-4 h-4 mr-3" />Evaluations</Link>
          <Link href="/chat" className="nav-item flex items-center px-3 py-3 rounded-xl font-bold text-sm"><BookText className="w-4 h-4 mr-3" />AI Tutor</Link>
        </nav>
        <div className="p-3 pb-8 border-t space-y-1" style={{ borderColor: "#e2e8f0" }}>
          <Link href="/dashboard" className="nav-item flex items-center px-3 py-3 rounded-xl font-bold text-sm"><ArrowLeft className="w-4 h-4 mr-3" />Back to Dashboard</Link>
          <button onClick={handleLogout} className="nav-item hover:text-red-500 hover:bg-red-50 w-full flex items-center px-3 py-3 rounded-xl font-bold text-sm"><LogOut className="w-4 h-4 mr-3" />Log out</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto relative z-10 custom-scrollbar">
        {/* Header */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b sticky top-0 z-30" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", borderColor: "#e2e8f0" }}>
          <div>
            <h1 className="text-lg font-black text-slate-900">{subjectName}</h1>
            <p className="text-slate-500 text-xs font-medium mt-0.5">Course materials & study tools</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Question Count */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <Settings2 className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500">Questions:</span>
              <select value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} className="bg-transparent text-slate-900 font-black focus:outline-none cursor-pointer">
                {[5, 10, 15, 20].map(n => <option key={n} value={n} className="bg-white">{n}</option>)}
              </select>
            </div>
            <Link href={aiTutorHref} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 transition-all bg-white shadow-sm hover:shadow-md" style={{ border: "1px solid #e2e8f0" }}>
              <Sparkles className="w-4 h-4 text-blue-500" />AI Tutor
            </Link>
            <Link href={quizHref} className="cta-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all">
              <Target className="w-4 h-4" />Generate Quiz
            </Link>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Materials */}
            <div className="lg:col-span-2 space-y-6">

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900">Course Materials</h2>
                <div className="flex items-center gap-2">
                  {documents.length > 0 && selectedDocs.length > 0 && (
                    <span className="text-xs font-bold text-blue-600 px-3 py-1.5 rounded-lg" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                      {selectedDocs.length} selected
                    </span>
                  )}
                  {documents.length > 0 && (
                    <span className="text-xs font-bold text-slate-500 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                      {documents.length} file{documents.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Upload Zone */}
              <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragActive ? "border-blue-500 scale-[1.01]" : "hover:border-blue-300"}`} style={{ borderColor: isDragActive ? "" : "#cbd5e1", background: isDragActive ? "rgba(59,130,246,0.05)" : "white" }}>
                <input {...getInputProps()} />
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-slate-50 border border-slate-200">
                  <Upload className={`w-6 h-6 ${isDragActive ? "text-blue-500" : "text-slate-400"}`} />
                </div>
                <p className="text-base font-bold text-slate-900 mb-1">
                  {uploading ? "Uploading..." : isDragActive ? "Drop your files here" : "Drag & drop files here"}
                </p>
                <p className="text-sm font-medium text-slate-500">or click to browse · PDF, TXT, DOCX</p>
              </div>

              {/* Hint */}
              {documents.length > 0 && (
                <p className="text-xs text-slate-500 font-medium px-1">
                  ✓ Click documents to select them for targeted AI quiz & tutoring
                </p>
              )}

              {/* Document List */}
              <div className="space-y-3">
                {documents.length === 0 && !uploading && (
                  <div className="text-center py-10 rounded-2xl bg-white border border-dashed border-slate-300">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm font-medium">No materials uploaded yet</p>
                  </div>
                )}
                {documents.map((doc, idx) => {
                  const isSelected = selectedDocs.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDocSelection(doc.id)}
                      className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 group bg-white shadow-sm hover:shadow-md"
                      style={{
                        border: isSelected ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                        animation: `float-up 0.4s ease-out forwards`, animationDelay: `${idx * 0.06}s`, opacity: 0, transform: "translateY(12px)"
                      }}
                    >
                      <div className="flex-shrink-0">
                        {isSelected
                          ? <CheckSquare className="w-5 h-5 text-blue-500" />
                          : <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
                        }
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isSelected ? "rgba(59,130,246,0.1)" : "#f8fafc" }}>
                        <FileText className={`w-5 h-5 ${isSelected ? "text-blue-500" : "text-slate-400"}`} />
                      </div>
                      <span className={`font-semibold text-sm truncate flex-1 ${isSelected ? "text-slate-900" : "text-slate-600"}`}>{doc.filename}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Stats */}
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">Quick Stats</h2>
              {[
                { label: "Materials", value: documents.length, icon: <FileText className="w-5 h-5" />, color: "text-blue-500" },
                { label: "Quizzes Taken", value: quizzesTaken, icon: <BarChart3 className="w-5 h-5" />, color: "text-cyan-500" },
                { label: "Mastery Level", value: `${masteryLevel}%`, icon: <TrendingUp className="w-5 h-5" />, color: masteryColor },
              ].map((stat, i) => (
                <div key={i} className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                  <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                  <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}

              {/* Quick Actions */}
              <div className="pt-2 space-y-3">
                <Link href={aiTutorHref} className="flex items-center gap-3 p-4 rounded-2xl font-bold text-sm text-blue-700 hover:text-blue-800 transition-all w-full shadow-sm hover:shadow-md" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                  <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  {selectedDocs.length > 0 ? `Chat about ${selectedDocs.length} doc${selectedDocs.length > 1 ? "s" : ""}` : "Start AI Tutor"}
                </Link>
                <Link href={quizHref} className="cta-btn flex items-center gap-3 p-4 rounded-2xl font-black text-sm text-white transition-all w-full">
                  <Target className="w-4 h-4 flex-shrink-0" />
                  Generate {numQuestions}-Question Quiz
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
