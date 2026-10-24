import { Award, BriefcaseBusiness, GraduationCap, Lightbulb, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import type { ResumeProfile } from "../types";
import { Notice } from "./Ui";

function EntryList({ title, icon, entries }: { title: string; icon: ReactNode; entries: ResumeProfile["education"] }) {
  return <section className="data-card"><h3><span className="mini-icon">{icon}</span>{title}</h3>{entries.length ? <div className="entry-list">{entries.map((entry, index) => <article key={`${entry.title}-${index}`}><strong>{entry.title}</strong>{entry.organization && <span>{entry.organization}</span>}{entry.dates && <small>{entry.dates}</small>}{entry.description && <p>{entry.description}</p>}</article>)}</div> : <p className="quiet-text">No entries confidently identified.</p>}</section>;
}

export function ResumeResults({ profile, masked = false }: { profile: ResumeProfile; masked?: boolean }) {
  return <div className="results-stack">
    {masked && <Notice>Bias-blind view: selected identifiers are masked. Anonymization is imperfect and may leave indirect identity clues.</Notice>}
    {profile.warnings.length > 0 && <Notice>{profile.warnings.join(" ")}</Notice>}
    <section className="data-card candidate-card"><div className="candidate-avatar"><UserRound size={21} /></div><div className="candidate-info"><span className="eyebrow">CANDIDATE DETAILS</span><h2>{profile.name || "Name not confidently identified"}</h2><p>{[profile.email, profile.phone].filter(Boolean).join(" · ") || "No contact details identified"}</p></div><span className="source-label">Extracted from resume</span></section>
    <section className="data-card"><h3><span className="mini-icon"><Lightbulb size={17} /></span>Identified skills <span className="count-pill">{profile.skills.length}</span></h3>{profile.skills.length ? <div className="skill-cloud">{profile.skills.map((skill) => <span key={skill} className="skill-pill">{skill}</span>)}</div> : <p className="quiet-text">No skills confidently identified. Use the text preview to review context.</p>}</section>
    <div className="results-grid"><EntryList title="Education" icon={<GraduationCap size={17} />} entries={profile.education} /><EntryList title="Projects" icon={<Lightbulb size={17} />} entries={profile.projects} /><EntryList title="Experience" icon={<BriefcaseBusiness size={17} />} entries={profile.experience} /><section className="data-card"><h3><span className="mini-icon"><Award size={17} /></span>Certifications</h3>{profile.certifications.length ? <ul className="simple-list">{profile.certifications.map((cert) => <li key={cert}>{cert}</li>)}</ul> : <p className="quiet-text">No certifications identified.</p>}</section></div>
    <details className="text-preview"><summary>Review extracted text</summary><pre>{profile.text || "No text available."}</pre></details>
  </div>;
}
