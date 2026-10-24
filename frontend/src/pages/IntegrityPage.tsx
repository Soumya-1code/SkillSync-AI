import { AlertTriangle, FileSearch, SearchCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { EmptyState, LoadingButton, Notice, PageIntro } from "../components/Ui";
import { ResumeUpload } from "../components/ResumeUpload";
import { useResume } from "../hooks/useResume";
import { api } from "../services/api";
import type { IntegrityResult } from "../types";

export function IntegrityPage() {
  const { file } = useResume();
  const [keywords, setKeywords] = useState("");
  const [result, setResult] = useState<IntegrityResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setResult(null);
    if (!file) { setError("Choose a PDF resume to inspect."); return; }
    if (!file.name.toLowerCase().endsWith(".pdf")) { setError("Formatting inspection is available for PDF resumes only."); return; }
    setBusy(true);
    try { setResult(await api.integrity(file, keywords)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "PDF inspection failed."); }
    finally { setBusy(false); }
  }
  return <>
    <PageIntro eyebrow="RESUME INTEGRITY" title="Review document signals" description="Inspect PDF text for selected keyword counts and formatting clues that could merit a closer look." />
    <form className="data-card integrity-form" onSubmit={submit}><div className="card-heading"><div><h2>Inspect a PDF resume</h2><p>Findings are potentially suspicious signals and always need human review.</p></div><span className="mini-icon"><SearchCheck size={18} /></span></div><label className="field-title">PDF resume</label><ResumeUpload disabled={busy} /><label htmlFor="integrity-keywords" className="field-title">Keywords to count <small>Optional · comma-separated</small></label><input id="integrity-keywords" value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="Python, leadership, certification" maxLength={2000} /><div className="upload-action-row"><span className="quiet-text">PDF text and span colors are inspected locally.</span><LoadingButton busy={busy} className="button button-primary" type="submit">Inspect PDF</LoadingButton></div></form>
    {error && <div className="notice-wrap"><Notice kind="error">{error}</Notice></div>}
    {result && <section className="integrity-results"><Notice>Repeated terms and light-colored text can have benign causes. PDF inspection can miss cases and is not a verdict.</Notice><div className="data-card"><div className="card-heading"><div><h2>Keyword frequency</h2><p>Occurrences in selectable PDF text</p></div></div>{Object.keys(result.keyword_counts).length ? <div className="keyword-list">{Object.entries(result.keyword_counts).map(([term, count]) => <div key={term}><span>{term}</span><strong>{count}</strong><small>{count === 1 ? "occurrence" : "occurrences"}</small></div>)}</div> : <p className="quiet-text">No keywords were entered. Add terms and run the inspection to count them.</p>}</div><div className="data-card"><div className="card-heading"><div><h2>Potentially suspicious findings</h2><p>Review the indicated page and snippet in the source PDF.</p></div><span className="count-pill">{result.findings.length}</span></div>{result.findings.length ? <div className="finding-list">{result.findings.map((finding, index) => <article key={`${finding.page}-${index}`} className="finding-item"><span className="finding-icon"><AlertTriangle size={17} /></span><div><span className="page-tag">PAGE {finding.page}</span><p>{finding.reason}</p><blockquote>{finding.snippet}</blockquote></div></article>)}</div> : <div className="empty-inline"><span className="empty-icon"><SearchCheck size={19} /></span><div><strong>No configured signal was identified</strong><p>This does not certify the document as authentic.</p></div></div>}</div></section>}
    {!result && !error && <div className="analyzer-empty"><EmptyState icon={<FileSearch size={22} />} title="A human review starts with context" description="Select a PDF and optional terms. Any formatting flags are only signals, not proof of misconduct." /></div>}
  </>;
}
