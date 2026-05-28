"use client";

import Link from "next/link";
import { useEffect, useState, useRef, ReactNode } from "react";
import { Sparkles, BookOpen, Target, ArrowRight, CheckCircle2, Zap, ArrowUpRight, Github, Twitter, Linkedin, Star, Users, BrainCircuit } from "lucide-react";

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-[1200ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"} ${className}`} style={{ transitionDelay: `${delay}s`, transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}>
      {children}
    </div>
  );
}

const features = [
  { icon: "📄", title: "Upload Any Material", desc: "Drag & drop PDFs, DOCX or TXT. Our AI instantly parses and indexes every page." },
  { icon: "⚡", title: "AI-Generated Quizzes", desc: "Choose the number of questions, select which docs to use, and get a personalized quiz in seconds." },
  { icon: "🎯", title: "Weakness Detection", desc: "Every quiz auto-detects knowledge gaps and builds a personal improvement roadmap for you." },
  { icon: "🤖", title: "24/7 AI Tutor", desc: "An intelligent chat assistant that knows your subject materials and answers like a real professor." },
  { icon: "📊", title: "Mastery Tracking", desc: "A live mastery score that evolves with every quiz you take—see your growth in real time." },
  { icon: "🔒", title: "Secure & Private", desc: "Your notes and data are encrypted and tied exclusively to your account. Always private." },
];

const testimonials = [
  { quote: "EduMind's dynamic quizzes instantly found my weak points in Calculus. I improved my grade from a C to an A in just 3 weeks.", author: "Sarah K.", role: "Computer Science Major", avatar: "SK" },
  { quote: "It feels like having a personal tutor in my pocket. I upload my professor's notes and the AI explains everything perfectly.", author: "Aisha M.", role: "Engineering Student", avatar: "AM" },
  { quote: "The mastery tracking is incredibly motivating. Seeing my weak points turn green gives me so much confidence before exams.", author: "David L.", role: "High School Senior", avatar: "DL" },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouse);
    return () => { window.removeEventListener("scroll", handleScroll); window.removeEventListener("mousemove", handleMouse); };
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        @keyframes float { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-18px) rotate(3deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(22px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.08);opacity:0.4} 100%{transform:scale(1);opacity:0.8} }
        @keyframes grid-fade { 0%,100%{opacity:0.03} 50%{opacity:0.07} }
        @keyframes badge-enter { 0%{opacity:0;transform:translateY(20px) scale(0.95)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes dot-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float2 { animation: float2 7s ease-in-out infinite; }
        .animate-pulse-ring { animation: pulse-ring 3s ease-in-out infinite; }
        .animate-grid { animation: grid-fade 6s ease-in-out infinite; }
        
        .gradient-text {
          background: linear-gradient(135deg, #0f172a 0%, #334155 50%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gradient-text-amber {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #1e40af 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .shimmer-text {
          background: linear-gradient(90deg, #1e293b 0%, #3b82f6 25%, #2563eb 50%, #3b82f6 75%, #1e293b 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .glass-card {
          background: white;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
          backdrop-filter: blur(20px);
        }
        .glass-card:hover {
          background: #f8fafc;
          border-color: #93c5fd;
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.03);
        }
        .cta-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          box-shadow: 0 0 40px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.25);
          color: white !important;
        }
        .cta-btn:hover {
          box-shadow: 0 0 60px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.25);
          transform: scale(1.03);
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .badge-enter { animation: badge-enter 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .dot-1 { animation: dot-pulse 1.4s ease-in-out infinite; }
        .dot-2 { animation: dot-pulse 1.4s ease-in-out 0.2s infinite; }
        .dot-3 { animation: dot-pulse 1.4s ease-in-out 0.4s infinite; }
      ` }} />

      {/* Cursor glow follower */}
      <div
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none z-0 transition-all duration-700"
        style={{ left: mousePos.x - 300, top: mousePos.y - 300, background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)" }}
      />

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex justify-center ${scrolled ? "h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm" : "h-24 bg-transparent"}`}>
        <div className="flex items-center justify-between w-full max-w-6xl px-6 h-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-900">EduMind</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">How it works</a>
            <a href="#reviews" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Reviews</a>
          </nav>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors">Log in</Link>
            <Link href="/signup" className="text-sm font-black bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all">Get Started</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 overflow-hidden">

        {/* Grid background */}
        <div className="absolute inset-0 animate-grid opacity-10" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }}></div>
        
        {/* Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(37,99,235,0.04) 40%, transparent 70%)" }}></div>
        <div className="absolute top-[20%] left-[5%] w-72 h-72 rounded-full blur-[100px]" style={{ background: "rgba(59,130,246,0.1)" }}></div>
        <div className="absolute bottom-[20%] right-[5%] w-72 h-72 rounded-full blur-[100px]" style={{ background: "rgba(37,99,235,0.1)" }}></div>

        {/* 3-column layout: badges | hero text | badge */}
        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr_220px] items-center gap-8 px-4">

          {/* Left badges column */}
          <div className="hidden lg:flex flex-col gap-5 items-start">
            <div className="glass-card rounded-2xl p-4 shadow-xl w-full badge-enter animate-float" style={{ animationDelay: "0.6s", opacity: 0 }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full dot-1"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Tutor</span>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed text-left">&ldquo;Mitosis produces two genetically identical daughter cells via 4 phases...&rdquo;</p>
            </div>
            <div className="glass-card rounded-2xl p-4 shadow-xl w-full badge-enter animate-float2" style={{ animationDelay: "1.2s", opacity: 0 }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 text-left">Quiz Generated</p>
              <p className="text-2xl font-black text-slate-900 text-left">10 Qs</p>
              <p className="text-xs text-emerald-500 font-bold mt-1 text-left">&uarr; from Biology.pdf</p>
            </div>
          </div>

          {/* Center: Hero Content */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white border border-blue-200 rounded-full px-4 py-2 mb-8 backdrop-blur-sm shadow-md shadow-blue-500/10">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">AI-Powered Study Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-[86px] font-black leading-[0.95] tracking-tight mb-8 text-slate-900">
              <span className="gradient-text">Study smarter.</span>
              <br />
              <span>Score higher.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-xl mx-auto mb-12 leading-relaxed">
              Upload your study materials, and let AI generate personalized quizzes, detect your weak spots, and tutor you 24/7.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="cta-btn text-white text-lg font-black px-10 py-4 rounded-full transition-all flex items-center gap-2">
                Start for Free
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
              <Link href="/login" className="text-slate-600 hover:text-slate-900 text-base font-bold transition-colors flex items-center gap-2 px-6 py-4">
                Already have an account? Log in &rarr;
              </Link>
            </div>

            <p className="text-slate-400 text-sm font-medium mt-6">No credit card required &middot; Free forever</p>
          </div>

          {/* Right badge column */}
          <div className="hidden lg:flex flex-col gap-5 items-end">
            <div className="glass-card rounded-2xl p-4 shadow-xl w-full badge-enter animate-float2" style={{ animationDelay: "0.9s", opacity: 0 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-[10px] text-white">📊</div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mastery</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-1.5">
                <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: "78%" }}></div>
              </div>
              <p className="text-right text-xs font-black text-blue-500">78%</p>
            </div>
          </div>

        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Scroll</span>
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M19 12l-7 7-7-7"/></svg>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)" }}></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <Reveal>
            <div className="text-center mb-20">
              <p className="text-blue-500 text-sm font-black uppercase tracking-widest mb-4">How It Works</p>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">Three steps to <span className="gradient-text-amber">mastery</span></h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: "📤", title: "Upload Materials", desc: "Drop any PDF, DOCX, or TXT. Our AI reads and indexes the content instantly." },
              { step: "02", icon: "🧠", title: "Pick Your Docs & Quiz Size", desc: "Check which documents to study from and choose how many questions to generate." },
              { step: "03", icon: "🏆", title: "Learn & Track Progress", desc: "Take quizzes, chat with your AI tutor, and watch your mastery score grow." },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className="glass-card rounded-[2rem] p-8 transition-all duration-500 group relative overflow-hidden h-full">
                  <div className="absolute top-4 right-6 text-[80px] font-black text-slate-100 leading-none select-none">{item.step}</div>
                  <div className="text-4xl mb-6">{item.icon}</div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative py-32 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)" }}></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Reveal>
            <div className="text-center mb-20">
              <p className="text-blue-500 text-sm font-black uppercase tracking-widest mb-4">Platform Features</p>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">Everything you need <br className="hidden md:block" /><span className="shimmer-text">to excel</span></h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="glass-card rounded-[2rem] p-8 h-full transition-all duration-500 group cursor-default">
                  <div className="text-3xl mb-5">{f.icon}</div>
                  <h3 className="text-lg font-black text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="reviews" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-20">
              <p className="text-blue-500 text-sm font-black uppercase tracking-widest mb-4">Student Stories</p>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">Loved by students <br className="hidden md:block" />worldwide</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className="glass-card rounded-[2rem] p-8 h-full flex flex-col justify-between transition-all duration-500">
                  <div>
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, s) => <span key={s} className="text-yellow-400 text-lg">★</span>)}
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed text-base mb-8">"{t.quote}"</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-black text-white flex-shrink-0">{t.avatar}</div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{t.author}</p>
                      <p className="text-blue-500 text-xs font-semibold">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-40 px-6 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(59,130,246,0.05) 0%, transparent 70%)" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full animate-pulse-ring" style={{ border: "1px solid rgba(59,130,246,0.15)" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full animate-pulse-ring" style={{ border: "1px solid rgba(59,130,246,0.07)", animationDelay: "1s" }}></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <Reveal>
            <h2 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 leading-tight">
              Ready to <span className="gradient-text-amber">ace</span><br />your exams?
            </h2>
            <p className="text-xl text-slate-500 font-medium mb-12 max-w-xl mx-auto">Join thousands of students using AI to unlock their full academic potential.</p>
            <Link href="/signup" className="cta-btn inline-flex items-center gap-3 text-white text-xl font-black px-14 py-5 rounded-full transition-all">
              Get Started for Free
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
            <p className="text-slate-400 text-sm font-medium mt-6">No credit card required</p>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 py-10 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl text-slate-900">EduMind</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 EduMind. Built with AI for students, by students.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
