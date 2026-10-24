import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { useAuth } from "../hooks/useAuth";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  if (user) return <Navigate to="/app" replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSuccess(false);
    if (isSignup && password.length < 10) { setError("Use at least 10 characters for your password."); return; }
    setBusy(true);
    try {
      if (isSignup) await signup(email, password); else await login(email, password);
      setSuccess(true);
      const destination = (location.state as { from?: string } | null)?.from || "/app";
      window.setTimeout(() => navigate(destination, { replace: true }), 180);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "We couldn’t complete that request."); }
    finally { setBusy(false); }
  }
  return <main className="auth-page">
    <Link to="/" className="auth-back"><ArrowLeft size={16} /> Back to SkillSync</Link>
    <div className="auth-decoration auth-decoration-one" /><div className="auth-decoration auth-decoration-two" />
    <section className="auth-card">
      <BrandMark />
      <div className="auth-heading"><span className="eyebrow">{isSignup ? "YOUR LOCAL WORKSPACE" : "WELCOME BACK"}</span><h1>{isSignup ? "Create your account" : "Good to have you back."}</h1><p>{isSignup ? "Set up a local account to keep your analysis workspace organized." : "Sign in to continue to your SkillSync workspace."}</p></div>
      <form className="auth-form" onSubmit={submit}>
        <label htmlFor="auth-email">Email address</label><input id="auth-email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        <div className="password-label"><label htmlFor="auth-password">Password</label>{isSignup && <small>At least 10 characters</small>}</div>
        <div className="password-input"><input id="auth-password" type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} required minLength={isSignup ? 10 : undefined} maxLength={128} placeholder={isSignup ? "Choose a strong password" : "Enter your password"} value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
        <AnimatePresence>{error && <motion.div className="auth-message auth-error" role="alert" initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>{error}</motion.div>}{success && <motion.div className="auth-message auth-success" role="status"><ShieldCheck size={16} /> {isSignup ? "Account created. Opening your workspace…" : "Signed in. Opening your workspace…"}</motion.div>}</AnimatePresence>
        <button type="submit" className="button button-primary auth-submit" disabled={busy}>{busy && <span className="button-spinner" />}{busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}<ArrowRight size={16} /></button>
      </form>
      <div className="auth-switch">{isSignup ? "Already have an account?" : "New to SkillSync AI?"} <Link to={isSignup ? "/login" : "/signup"}>{isSignup ? "Sign in" : "Create an account"}</Link></div>
      <div className="auth-note"><LockKeyhole size={15} /><span>Local demo accounts use securely hashed passwords. Your resume files aren’t saved.</span></div>
    </section>
    <p className="auth-footer">SkillSync AI <span>·</span> Understand skills. Reveal potential.</p>
  </main>;
}
