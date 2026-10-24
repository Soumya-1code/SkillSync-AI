import { ArrowRight, ArrowUpRight, FileSearch, Fingerprint, ScanSearch, ShieldCheck, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import { PageIntro, Reveal } from "../components/Ui";
import { useAuth } from "../hooks/useAuth";
import { useResume } from "../hooks/useResume";

const cards = [
  { to: "/app/analyzer", icon: FileSearch, label: "Resume analyzer", text: "Pull key skills, education, projects, and experience into a readable profile.", color: "lilac", action: "Analyze a resume" },
  { to: "/app/matcher", icon: ScanSearch, label: "Job matcher", text: "See which job requirements have evidence in the resume and which are missing.", color: "blue", action: "Compare to a role" },
  { to: "/app/integrity", icon: Fingerprint, label: "Integrity review", text: "Review PDF text and formatting signals that may deserve a closer look.", color: "peach", action: "Inspect a PDF" },
  { to: "/app/bias-blind", icon: ShieldCheck, label: "Bias-blind review", text: "Create a separate view with selected identity details masked.", color: "mint", action: "Open masked view" },
];

export function OverviewPage() {
  const { user } = useAuth();
  const { file } = useResume();
  return <>
    <PageIntro eyebrow="YOUR WORKSPACE" title={`Welcome${user?.email ? `, ${user.email.split("@")[0]}` : ""}.`} description="A little more clarity for every resume you review." action={<Link className="button button-primary" to="/app/analyzer"><UploadCloud size={16} /> Analyze a resume</Link>} />
    <Reveal className="overview-banner"><div><span className="eyebrow">START WITH A DOCUMENT</span><h2>{file ? "Your resume is ready to review." : "Bring a resume into focus."}</h2><p>{file ? `${file.name} is selected in this tab. Choose a tool to continue.` : "Choose a PDF or DOCX to explore skills, compare a role, or run a PDF review."}</p><Link className="text-link" to="/app/analyzer">{file ? "Continue to analysis" : "Upload a resume"} <ArrowRight size={15} /></Link></div><div className="banner-art"><span className="banner-sheet"><FileSearch size={28} /></span><span className="banner-spark spark-a" /><span className="banner-spark spark-b" /><span className="banner-ring" /></div></Reveal>
    <div className="section-line"><div><span className="eyebrow">TOOLS FOR A THOUGHTFUL REVIEW</span><h2>What would you like to explore?</h2></div><span className="quiet-text">Pick a feature to get started <ArrowUpRight size={14} /></span></div>
    <div className="dashboard-tools">{cards.map(({ to, icon: Icon, label, text, color, action }, index) => <Reveal key={label} delay={index * 0.045}><Link to={to} className="tool-card"><span className={`feature-icon ${color}`}><Icon size={20} /></span><span className="tool-arrow"><ArrowUpRight size={16} /></span><h3>{label}</h3><p>{text}</p><span className="tool-action">{action} <ArrowRight size={14} /></span></Link></Reveal>)}</div>
    <section className="activity-empty"><div className="activity-title"><div><span className="eyebrow">YOUR RECENT WORK</span><h2>Recent analyses</h2></div><span className="quiet-text">Stored locally? No.</span></div><div className="empty-inline"><span className="empty-icon"><FileSearch size={20} /></span><div><strong>No saved analysis history</strong><p>Analysis results stay in this browser tab and are not recorded as activity.</p></div></div></section>
  </>;
}
