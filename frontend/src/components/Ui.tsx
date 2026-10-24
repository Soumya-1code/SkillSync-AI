import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, LoaderCircle } from "lucide-react";

export function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-intro"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action && <div className="intro-action">{action}</div>}</div>;
}

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.32, delay: reduced ? 0 : delay }}>{children}</motion.div>;
}

export function Notice({ kind = "info", children }: { kind?: "info" | "error" | "success"; children: ReactNode }) {
  const Icon = kind === "error" ? AlertCircle : kind === "success" ? CheckCircle2 : Info;
  return <div className={`notice notice-${kind}`} role={kind === "error" ? "alert" : "status"}><Icon size={18} /><span>{children}</span></div>;
}

export function LoadingButton({ busy, children, ...props }: { busy: boolean; children: ReactNode; type?: "button" | "submit"; disabled?: boolean; onClick?: () => void; className?: string }) {
  return <button {...props} disabled={props.disabled || busy}>{busy && <LoaderCircle className="spin" size={17} />}{children}</button>;
}

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="empty-state"><span className="empty-icon">{icon}</span><h3>{title}</h3><p>{description}</p></div>;
}
