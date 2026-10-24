import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, FileSearch, Fingerprint, LockKeyhole, ScanSearch, ShieldCheck, Sparkles, Upload, WandSparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { useAuth } from "../hooks/useAuth";

const features = [
  { icon: FileSearch, number: "01", title: "Resume extraction", body: "Turn PDF and Word resumes into clear, reviewable skills, education, project, and experience details.", tone: "lilac" },
  { icon: ScanSearch, number: "02", title: "Job matching", body: "Compare an actual resume to a job description, with matched skills and source evidence in view.", tone: "blue" },
  { icon: Fingerprint, number: "03", title: "Integrity signals", body: "Inspect PDF keyword counts and formatting clues that could deserve a closer human look.", tone: "peach" },
  { icon: ShieldCheck, number: "04", title: "Bias-blind review", body: "Mask selected identity details in a separate view while keeping relevant qualifications visible.", tone: "mint" },
];

export function LandingPage() {
  const { user } = useAuth();
  const reduced = useReducedMotion();
  const enter = (delay = 0) => reduced ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay } };
  return <div className="landing-page">
    <nav className="public-nav"><div className="public-nav-inner"><BrandMark /><div className="public-links"><a href="#features">Features</a><a href="#workflow">How it works</a><a href="#privacy">Privacy</a></div><div className="public-actions"><Link className="nav-login" to={user ? "/app" : "/login"}>{user ? "Open workspace" : "Log in"}</Link><Link className="button button-dark button-small" to={user ? "/app" : "/signup"}>Get started <ArrowRight size={15} /></Link></div></div></nav>
    <main>
      <section className="landing-hero">
        <div className="hero-copy">
          <motion.div {...enter(0)} className="announcement"><span className="announcement-dot" /> A more thoughtful way to review skills <ArrowUpRight size={13} /></motion.div>
          <motion.h1 {...enter(0.08)}>See the skills.<br /><span>Not just the resume.</span></motion.h1>
          <motion.p {...enter(0.15)} className="hero-lede">Understand skills. Reveal potential. SkillSync AI brings resume insight, job alignment, and thoughtful review into one clear workspace.</motion.p>
          <motion.div {...enter(0.22)} className="hero-actions"><Link to={user ? "/app" : "/signup"} className="button button-primary button-large">Get started free <ArrowRight size={17} /></Link><a href="#features" className="button button-quiet button-large">Explore features <ArrowDown size={16} /></a></motion.div>
          <motion.div {...enter(0.28)} className="hero-proof"><span className="proof-icon"><LockKeyhole size={15} /></span><span>Local-first analysis</span><i /> <span>No paid AI or external API</span></motion.div>
        </div>
        <motion.div {...enter(0.18)} className="hero-visual" aria-label="Preview of the SkillSync workspace">
          <div className="preview-orbit orbit-one" /><div className="preview-orbit orbit-two" />
          <div className="preview-window"><div className="preview-bar"><span className="preview-brand"><span className="preview-logo"><Sparkles size={14} /></span> SkillSync <b>AI</b></span><span className="preview-user"><span /> workspace</span></div>
            <div className="preview-body"><div className="preview-heading"><div><small>YOUR WORKSPACE</small><strong>A little more clarity.</strong></div><span className="preview-date">Ready when you are</span></div>
              <div className="preview-resume"><div className="preview-file-icon"><FileSearch size={19} /></div><div><small>RESUME ANALYSIS</small><strong>Understand what’s there</strong><span>Skills · education · experience</span></div><span className="preview-arrow"><ArrowUpRight size={16} /></span></div>
              <div className="preview-columns"><div className="preview-mini-card"><span className="preview-card-top"><ScanSearch size={16} /> JOB MATCH</span><strong>Connect skills to a role</strong><div className="preview-skill-row"><i /><i /><i className="soft" /></div><small>Evidence-backed alignment</small></div><div className="preview-mini-card"><span className="preview-card-top"><ShieldCheck size={16} /> BIAS-BLIND</span><strong>Review with more care</strong><div className="preview-mask"><span>Candidate name</span><b>Masked in this view</b></div></div></div>
              <div className="preview-footer"><span><span className="status-led" /> Temporary request processing</span><span>Explore the workspace <ArrowRight size={12} /></span></div>
            </div>
          </div><div className="float-note float-note-left"><span><Check size={13} /></span> Evidence stays visible</div><div className="float-note float-note-right"><span><Upload size={13} /></span> PDF or DOCX</div>
        </motion.div>
      </section>
      <section id="features" className="section features-section"><div className="section-heading"><span className="eyebrow">A useful toolkit</span><h2>One workspace. Four ways to<br className="desktop-break" /> see a little more clearly.</h2><p>Practical tools that help make skills and evidence easier to understand.</p></div><div className="feature-grid">{features.map(({ icon: Icon, number, title, body, tone }, index) => <motion.article key={number} className="feature-card" initial={reduced ? false : { opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: reduced ? 0 : 0.35, delay: index * 0.06 }} whileHover={reduced ? undefined : { y: -4 }}><div className={`feature-icon ${tone}`}><Icon size={20} strokeWidth={1.8} /></div><span className="feature-number">{number}</span><h3>{title}</h3><p>{body}</p><span className="feature-link">Explore in the workspace <ArrowRight size={14} /></span></motion.article>)}</div></section>
      <section id="workflow" className="section workflow-section"><div className="workflow-intro"><span className="eyebrow">A simple workflow</span><h2>From a document<br />to a clearer view.</h2><p>No long setup. No opaque scoring. Start with the resume you have.</p><Link className="text-link" to={user ? "/app" : "/signup"}>Start your first review <ArrowRight size={15} /></Link></div><div className="steps-list"><article><span className="step-number">01</span><div><h3>Bring a resume</h3><p>Upload a PDF or DOCX. It stays in your browser tab and is sent for analysis only when you choose a feature.</p></div><span className="step-line" /></article><article><span className="step-number">02</span><div><h3>Explore what’s inside</h3><p>Review identified skills, experience, and education. Check the original text when something is uncertain.</p></div><span className="step-line" /></article><article><span className="step-number">03</span><div><h3>Connect it to a role</h3><p>Compare with a job description and see which listed skills have matching resume evidence.</p></div></article></div></section>
      <section id="privacy" className="privacy-band"><div className="privacy-mark"><LockKeyhole size={22} /></div><div><span className="eyebrow">Thoughtful by default</span><h2>Your files don’t become a database.</h2><p>Resumes are processed for each request and not kept in application storage. The upload framework may use short-lived temporary storage while handling a request. Analysis is not sent to an AI service.</p></div><div className="privacy-checks"><span><Check size={15} /> No resume archive</span><span><Check size={15} /> No third-party AI</span><span><Check size={15} /> Clear limitations</span></div></section>
      <section className="closing-cta"><div><span className="eyebrow">Make the next review clearer</span><h2>Good decisions start with<br />better information.</h2></div><Link to={user ? "/app" : "/signup"} className="button button-white button-large">Get started free <ArrowRight size={16} /></Link><WandSparkles className="cta-decoration" size={108} strokeWidth={0.7} /></section>
    </main>
    <footer className="public-footer"><BrandMark /><span>Built as a local-first college project. No hiring predictions, just clearer evidence.</span><div><a href="#features">Features</a><a href="#workflow">How it works</a><Link to="/login">Login</Link></div><small>© 2026 SkillSync AI</small></footer>
  </div>;
}
