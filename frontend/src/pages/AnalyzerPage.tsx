import { FileSearch, RotateCcw } from "lucide-react";
import { useState } from "react";
import { PageIntro, LoadingButton, Notice, EmptyState } from "../components/Ui";
import { ResumeResults } from "../components/ResumeResults";
import { ResumeUpload } from "../components/ResumeUpload";
import { useResume } from "../hooks/useResume";
import { api } from "../services/api";

export function AnalyzerPage() {
  const { file, profile, setProfile } = useResume();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function analyze() {
    if (!file) { setError("Choose a resume file to get started."); return; }
    setBusy(true); setError("");
    try { setProfile(await api.analyze(file)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Resume analysis failed."); }
    finally { setBusy(false); }
  }
  return <>
    <PageIntro eyebrow="RESUME ANALYZER" title="A clearer picture of experience" description="Extract resume details and review what the parser could identify with confidence." />
    <section className="data-card upload-card"><div className="card-heading"><div><h2>Upload a resume</h2><p>Files are sent to the local API for analysis and are not saved by the app.</p></div><span className="mini-icon"><FileSearch size={18} /></span></div><ResumeUpload disabled={busy} /><div className="upload-action-row"><span className="quiet-text">PDF or DOCX · Maximum 15 MB</span><LoadingButton busy={busy} className="button button-primary" type="button" onClick={analyze}>Analyze resume</LoadingButton></div></section>
    {error && <div className="notice-wrap"><Notice kind="error">{error}</Notice></div>}
    {profile ? <section className="analyzer-results"><div className="results-heading"><div><span className="eyebrow">EXTRACTION RESULTS</span><h2>Review the details</h2></div><button className="button button-quiet button-small" onClick={() => setProfile(null)}><RotateCcw size={14} /> Clear results</button></div><ResumeResults profile={profile} /></section> : <div className="analyzer-empty"><EmptyState icon={<FileSearch size={22} />} title="Your review will appear here" description="Upload a resume and select Analyze resume. If something is uncertain, it will be labeled rather than guessed." /></div>}
  </>;
}
