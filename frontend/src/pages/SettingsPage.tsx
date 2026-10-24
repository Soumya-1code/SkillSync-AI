import { ArrowUpRight, LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageIntro } from "../components/Ui";
import { useAuth } from "../hooks/useAuth";
import { useResume } from "../hooks/useResume";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { setFile } = useResume();
  const navigate = useNavigate();
  function signOut() { logout(); setFile(null); navigate("/", { replace: true }); }
  return <>
    <PageIntro eyebrow="ACCOUNT SETTINGS" title="Your local workspace" description="Manage this demo session and review how the application handles your data." />
    <section className="data-card settings-card"><div className="settings-avatar">{user?.email.slice(0, 1).toUpperCase()}</div><div className="settings-info"><span className="eyebrow">SIGNED-IN ACCOUNT</span><h2>{user?.email}</h2><p>Account details are stored in the local SkillSync SQLite database.</p></div></section>
    <section className="data-card settings-card"><span className="mini-icon success-icon"><ShieldCheck size={18} /></span><div className="settings-info"><span className="eyebrow">PRIVACY</span><h2>Resume files stay temporary</h2><p>Files are uploaded for each requested analysis and are not kept in application storage. The multipart framework may use short-lived temporary storage during a request. The frontend keeps your selected file in this browser tab only.</p></div></section>
    <section className="data-card settings-card"><span className="mini-icon"><ArrowUpRight size={18} /></span><div className="settings-info"><span className="eyebrow">DEMO LIMITATION</span><h2>Local account authentication</h2><p>Passwords are salted and hashed. Access tokens are signed and expire after 12 hours. This implementation is intended for a local project demo, not an internet-facing production identity service.</p></div></section>
    <button className="button button-danger-outline" onClick={signOut}><LogOut size={16} /> Sign out and clear this tab’s resume</button>
  </>;
}
