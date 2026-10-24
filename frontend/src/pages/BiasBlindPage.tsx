import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { EmptyState, LoadingButton, Notice, PageIntro } from "../components/Ui";
import { ResumeResults } from "../components/ResumeResults";
import { ResumeUpload } from "../components/ResumeUpload";
import { useResume } from "../hooks/useResume";
import { api } from "../services/api";
import type { ResumeProfile } from "../types";

export function BiasBlindPage() {
  const { file } = useResume();
  const [masked, setMasked] = useState<ResumeProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function createView() {
    if (!file) { setError("Choose a resume to create a bias-blind view."); return; }
    setError(""); setMasked(null); setBusy(true);
    try { setMasked(await api.biasBlind(file)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create the masked view."); }
    finally { setBusy(false); }
  }
  return <>
    <PageIntro eyebrow="BIAS-BLIND REVIEW" title="Review qualifications with fewer identifiers" description="Create a separate masked presentation while keeping relevant skills, education, projects, and experience available." />
    <section className="data-card blind-explainer"><span className="blind-shield"><ShieldCheck size={22} /></span><div><h2>What gets masked</h2><p>Candidate name, email, phone, detected profile links, and confidently detected institution names are hidden in this view. The source document and original extracted profile are not changed.</p><span className="small-warning">Anonymization is imperfect. It cannot remove every identity clue or process embedded profile photos.</span></div></section>
    <section className="data-card upload-card"><div className="card-heading"><div><h2>Build the anonymized view</h2><p>The response shown below comes from the backend masking layer.</p></div></div><ResumeUpload disabled={busy} /><div className="upload-action-row"><span className="quiet-text">Masked details are not displayed on this page.</span><LoadingButton busy={busy} className="button button-primary" type="button" onClick={createView}>Create bias-blind view</LoadingButton></div></section>
    {error && <div className="notice-wrap"><Notice kind="error">{error}</Notice></div>}
    {masked ? <section className="analyzer-results"><div className="results-heading"><div><span className="eyebrow">MASKED PRESENTATION</span><h2>Qualifications in view</h2></div></div><ResumeResults profile={masked} masked /></section> : <div className="analyzer-empty"><EmptyState icon={<ShieldCheck size={22} />} title="A separate view, with selected details hidden" description="Choose a resume to see its qualifications with detected identifiers masked. Always keep imperfect anonymization in mind." /></div>}
  </>;
}
