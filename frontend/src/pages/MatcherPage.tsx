import { ArrowDownRight, Check, ScanSearch, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { useState, type FormEvent } from "react";
import { EmptyState, LoadingButton, Notice, PageIntro } from "../components/Ui";
import { ResumeUpload } from "../components/ResumeUpload";
import { useResume } from "../hooks/useResume";
import { api } from "../services/api";
import type { MatchResult } from "../types";

export function MatcherPage() {
  const { file } = useResume();
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setResult(null);
    if (!file) { setError("Add a resume before comparing job skills."); return; }
    setBusy(true);
    try { setResult(await api.match(file, description)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The comparison failed."); }
    finally { setBusy(false); }
  }
  return <>
    <PageIntro eyebrow="JOB MATCHER" title="Connect skills to an opportunity" description="Compare an actual resume with a role and see why each skill is marked as a match or a gap." />
    <form className="data-card match-form" onSubmit={submit}><div className="card-heading"><div><h2>Compare a resume to a role</h2><p>The score counts identified skills only. It does not predict hiring outcomes.</p></div><span className="mini-icon"><ScanSearch size={18} /></span></div><label className="field-title">Resume</label><ResumeUpload disabled={busy} /><label className="field-title" htmlFor="job-description">Job description</label><textarea id="job-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Paste the job description, including the skills and qualifications you want to compare…" rows={8} maxLength={30000} required /><div className="upload-action-row"><span className="quiet-text">{description.length.toLocaleString()} / 30,000 characters</span><LoadingButton busy={busy} className="button button-primary" type="submit">Compare skills</LoadingButton></div></form>
    {error && <div className="notice-wrap"><Notice kind="error">{error}</Notice></div>}
    {result && (result.requirements.length ? <section className="match-results"><div className="match-score-card"><div className="score-ring" style={{ "--score": `${result.score}%` } as CSSProperties}><div><strong>{result.score}%</strong><small>alignment</small></div></div><div className="score-copy"><span className="eyebrow">EXPLAINABLE BASELINE</span><h2>{result.matched.length} of {result.requirements.length} listed skills matched</h2><p>Matched identified resume skills divided by the job skills found in our finite vocabulary. This is not a hiring prediction.</p></div></div><div className="match-lists"><section className="data-card"><h3><span className="mini-icon success-icon"><Check size={17} /></span>Matched skills <span className="count-pill">{result.matched.length}</span></h3>{result.matched.length ? result.matched.map((skill) => <article key={skill} className="match-item"><strong>{skill}</strong><p><span>Resume evidence</span>{result.evidence[skill]}</p></article>) : <p className="quiet-text">No identified job skills appeared in the resume text.</p>}</section><section className="data-card"><h3><span className="mini-icon gap-icon"><ArrowDownRight size={17} /></span>Skills to develop or clarify <span className="count-pill">{result.missing.length}</span></h3>{result.missing.length ? result.missing.map((skill) => <article key={skill} className="match-item missing-item"><strong>{skill}</strong><p><span>Suggested next step</span>Build a project or add relevant evidence if you have it.</p></article>) : <p className="quiet-text">All identified requirements had matching evidence.</p>}</section></div></section> : <Notice>No identifiable skill requirements were found in that job description, so a reliable alignment score cannot be calculated.</Notice>)}
    {!result && !error && <div className="analyzer-empty"><EmptyState icon={<Sparkles size={22} />} title="Your comparison will appear here" description="Select a resume, paste a job description, and compare skills to see evidence and gaps." /></div>}
  </>;
}
