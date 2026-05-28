"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) setError(error.message);
    else { setSuccess(true); setTimeout(() => router.push("/login"), 3000); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden py-16" style={{ fontFamily: "'Inter', sans-serif" }}>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        .animate-float { animation: float 7s ease-in-out infinite; }
        .cta-btn { background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 0 40px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.25); }
        .cta-btn:hover { box-shadow: 0 0 60px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.25); }
        .input-field { background: white; border: 1px solid #cbd5e1; color: #0f172a; }
        .input-field:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
        .input-field::placeholder { color: #94a3b8; }
        @keyframes success-in { 0%{opacity:0;transform:scale(0.9)} 100%{opacity:1;transform:scale(1)} }
        .success-card { animation: success-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
      ` }} />

      {/* Background */}
      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
      <div className="absolute top-0 right-0 w-full h-full" style={{ background: "radial-gradient(ellipse at 70% 20%, rgba(59,130,246,0.05) 0%, transparent 60%)" }}></div>
      <div className="absolute bottom-0 left-0 w-full h-full" style={{ background: "radial-gradient(ellipse at 30% 80%, rgba(37,99,235,0.04) 0%, transparent 60%)" }}></div>
      <div className="absolute top-[15%] right-[5%] w-72 h-72 rounded-full blur-[80px] animate-float pointer-events-none" style={{ background: "rgba(59,130,246,0.1)" }}></div>
      <div className="absolute bottom-[15%] left-[5%] w-72 h-72 rounded-full blur-[80px] animate-float pointer-events-none" style={{ background: "rgba(37,99,235,0.1)", animationDelay: "3s" }}></div>

      <div className="relative z-10 w-full max-w-md mx-4">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <span className="font-black text-3xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">EduMind</span>
          </Link>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Create account</h1>
          <p className="text-slate-500 font-medium">Start mastering your subjects with AI</p>
        </div>

        {success ? (
          <div className="success-card rounded-[2rem] p-10 text-center shadow-xl bg-white border border-slate-200">
            <div className="w-20 h-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">You're all set!</h2>
            <p className="text-slate-500 font-medium mb-2">Account created successfully.</p>
            <p className="text-slate-400 text-sm">Redirecting to login...</p>
          </div>
        ) : (
          <div className="rounded-[2rem] p-8 shadow-xl bg-white border border-slate-200">

            {error && (
              <div className="mb-6 p-4 rounded-xl text-sm font-semibold text-red-600 text-center bg-red-50 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Full Name</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="input-field w-full px-5 py-4 rounded-xl text-base font-medium transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Email address</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="input-field w-full px-5 py-4 rounded-xl text-base font-medium transition-all"
                  placeholder="you@university.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                    className="input-field w-full px-5 py-4 rounded-xl text-base font-medium transition-all pr-14"
                    placeholder="Min. 8 characters"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold">
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit" disabled={loading}
                  className="cta-btn w-full py-4 rounded-xl text-white font-black text-base transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Creating account...</>
                  ) : (
                    <>Create Account <span className="text-xl">→</span></>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <p className="text-slate-500 text-sm font-medium">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">Sign in</Link>
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-slate-400 text-xs font-medium mt-8">By signing up, you agree to our Terms & Privacy Policy</p>
      </div>
    </div>
  );
}
