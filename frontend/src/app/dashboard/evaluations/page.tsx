"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Target, AlertTriangle, CheckCircle, BarChart3, LogOut, BookText, Sparkles, TrendingDown, TrendingUp, Award, BrainCircuit } from "lucide-react";

interface QuizAttempt {
  id: string;
  score: number;
  feedback: string;
  quiz_id: string;
}

interface Weakness {
  id: string;
  description: string;
  severity: "high" | "medium" | "low";
}

interface Subject {
  id: string;
  name: string;
}

export default function Evaluations() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const userId = session.user.id;
      try {
        const [attemptsRes, weaknessesRes, subjectsRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/v1/evaluations/history/${userId}`, { cache: "no-store" }),
          fetch(`http://127.0.0.1:8000/api/v1/evaluations/weaknesses/${userId}`, { cache: "no-store" }),
          fetch(`http://127.0.0.1:8000/api/v1/subjects/${userId}`, { cache: "no-store" })
        ]);
        let fetchedAttempts: QuizAttempt[] = [];
        let fetchedWeaknesses: Weakness[] = [];
        let subMap: Record<string, string> = {};
        if (attemptsRes.ok) fetchedAttempts = await attemptsRes.json();
        if (weaknessesRes.ok) fetchedWeaknesses = await weaknessesRes.json();
        if (subjectsRes.ok) {
          const subs: Subject[] = await subjectsRes.json();
          subs.forEach(s => subMap[s.id] = s.name);
          setSubjects(subMap);
        }
        const subjectScores: Record<string, number[]> = {};
        fetchedAttempts.forEach((attempt: QuizAttempt) => {
          const score = typeof attempt.score === 'number' ? attempt.score : parseFloat(String(attempt.score));
          const validScore = isNaN(score) ? 0 : score;
          
          if (!subjectScores[attempt.quiz_id]) {
            subjectScores[attempt.quiz_id] = [];
          }
          subjectScores[attempt.quiz_id].push(validScore);
        });

        const generatedWeaknesses: Weakness[] = [];
        Object.entries(subjectScores).forEach(([quizId, scores]) => {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          if (avg < 80) {
            const subjectName = subMap[quizId.replace('quiz-', '')] || "General Assessment";
            generatedWeaknesses.push({
              id: `gen-subj-${quizId}`,
              description: `Averaging ${Math.round(avg)}% in ${subjectName}. Review the study materials and take more quizzes to improve.`,
              severity: avg < 40 ? "high" : "medium"
            });
          }
        });

        setAttempts(fetchedAttempts);
        setWeaknesses([...fetchedWeaknesses, ...generatedWeaknesses]);
      } catch (e) { console.log("Failed to load evaluations", e); }
      finally { setLoading(false); }
    };
    init();
  }, [router]);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  const getSubjectName = (quizId: string) => {
    if (!quizId) return "General Assessment";
    if (quizId.startsWith("quiz-")) return subjects[quizId.replace("quiz-", "")] || "Subject Quiz";
    return "Assessment";
  };

  const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length) : 0;

  if (loading) return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">Loading your progress...</p>
      </div>
    </div>
  );

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
        .nav-item.active { color: #0f172a; background: #f1f5f9; border: 1px solid #e2e8f0; }
      ` }} />

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
        <nav className="flex-1 py-5 px-3 space-y-1">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 mb-3">Navigation</p>
          <Link href="/dashboard" className="nav-item flex items-center px-3 py-3 rounded-xl font-bold text-sm"><BookOpen className="w-4 h-4 mr-3" />Subjects</Link>
          <Link href="/dashboard/evaluations" className="nav-item active flex items-center px-3 py-3 rounded-xl font-bold text-sm"><Target className="w-4 h-4 mr-3 text-amber-500" />Evaluations</Link>
          <Link href="/chat" className="nav-item flex items-center px-3 py-3 rounded-xl font-bold text-sm"><BookText className="w-4 h-4 mr-3" />AI Tutor</Link>
        </nav>
        <div className="p-3 pb-8 border-t" style={{ borderColor: "#e2e8f0" }}>
          <button onClick={handleLogout} className="nav-item hover:text-red-500 hover:bg-red-50 w-full flex items-center px-3 py-3 rounded-xl font-bold text-sm"><LogOut className="w-4 h-4 mr-3" />Log out</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto relative z-10 custom-scrollbar">
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b sticky top-0 z-30" style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", borderColor: "#e2e8f0" }}>
          <h1 className="text-lg font-black text-slate-900">Evaluations & Progress</h1>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full space-y-10">

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Quizzes Taken", value: attempts.length, icon: <CheckCircle className="w-5 h-5" />, color: "text-blue-500" },
              { label: "Average Score", value: `${avgScore}%`, icon: <BarChart3 className="w-5 h-5" />, color: attempts.length === 0 ? "text-slate-400" : avgScore >= 70 ? "text-emerald-500" : "text-amber-500" },
              { label: "Weak Areas", value: weaknesses.length, icon: <AlertTriangle className="w-5 h-5" />, color: weaknesses.length === 0 ? "text-emerald-500" : "text-amber-500" },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                <div className={`${stat.color} mb-3`}>{stat.icon}</div>
                <p className="text-slate-900 text-2xl font-black">{stat.value}</p>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                {stat.label === 'Average Score' && attempts.length > 0 && (
                  <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-1000 ${avgScore >= 70 ? 'bg-emerald-400' : avgScore >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${avgScore}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Areas for Improvement */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <TrendingDown className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Areas for Improvement</h2>
            </div>
            {weaknesses.length === 0 ? (
              <div className="p-8 rounded-2xl text-center" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
                <Award className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <p className="text-slate-900 font-bold mb-1">No weak areas detected!</p>
                <p className="text-slate-500 text-sm font-medium">Keep scoring above 80% to maintain this status.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weaknesses.map((w, i) => (
                  <div key={w.id} className="p-5 rounded-2xl transition-all" style={{ background: "white", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", animation: `float-up 0.5s ease-out forwards`, animationDelay: `${i * 0.08}s`, opacity: 0, transform: "translateY(16px)" }}>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg flex-shrink-0 mt-0.5" style={{ background: w.severity === "high" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)" }}>
                        <AlertTriangle className={`w-4 h-4 ${w.severity === "high" ? "text-red-500" : "text-amber-500"}`} />
                      </div>
                      <div>
                        <span className={`text-xs font-black uppercase tracking-widest ${w.severity === "high" ? "text-red-500" : "text-amber-500"}`}>{w.severity} priority</span>
                        <p className="text-slate-600 text-sm font-medium mt-1 leading-relaxed">{w.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quiz History */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Quiz History</h2>
            </div>

            {attempts.length === 0 ? (
              <div className="p-10 rounded-2xl text-center" style={{ background: "rgba(0,0,0,0.02)", border: "1px dashed #cbd5e1" }}>
                <CheckCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-900 font-bold mb-1">No quizzes taken yet</p>
                <p className="text-slate-500 text-sm font-medium">Go to a Subject and hit Generate Quiz to test your knowledge.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {attempts.map((attempt, idx) => (
                  <div key={attempt.id} className="p-6 rounded-2xl" style={{ background: "white", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", animation: `float-up 0.5s ease-out forwards`, animationDelay: `${idx * 0.08}s`, opacity: 0, transform: "translateY(16px)" }}>
                    <div className="flex items-center justify-between mb-5 pb-5 border-b" style={{ borderColor: "#e2e8f0" }}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                          <BookText className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900">{getSubjectName(attempt.quiz_id)}</h3>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Quiz Assessment</p>
                        </div>
                      </div>
                      <div className={`px-5 py-2 rounded-xl font-black text-lg ${attempt.score >= 80 ? "text-emerald-600 bg-emerald-50 border-emerald-200" : attempt.score >= 50 ? "text-amber-600 bg-amber-50 border-amber-200" : "text-red-600 bg-red-50 border-red-200"}`} style={{ border: "1px solid" }}>
                        {attempt.score}%
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Quiz Feedback</span>
                      </div>
                      <p className="text-slate-600 text-sm font-medium leading-relaxed">
                        {attempt.feedback && attempt.feedback.trim() !== "" && attempt.feedback !== "Automated Quiz Completion"
                          ? attempt.feedback
                          : attempt.score >= 80
                          ? "Excellent work! You demonstrated strong mastery of the subject material. Keep up the great performance."
                          : `You scored ${attempt.score}%. Focus on the weaker concepts identified above and use the AI Tutor to review challenging sections before retaking the quiz.`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
