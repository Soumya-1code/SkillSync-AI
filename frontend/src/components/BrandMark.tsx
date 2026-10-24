import { Link } from "react-router-dom";

export function BrandMark({ light = false, compact = false, to = "/" }: { light?: boolean; compact?: boolean; to?: string }) {
  return <Link to={to} className={`brand-lockup ${light ? "brand-light" : ""}`} aria-label="SkillSync AI home">
    <svg className="brand-symbol" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect width="48" height="48" rx="15" fill="currentColor" opacity=".12" />
      <path d="M14 9.5h13l8 8V37H14V9.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M27 10v8h8M19 25h10M19 30h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="31.5" cy="27.5" r="2.5" fill="#B8A8FF" /><circle cx="28" cy="34" r="2" fill="#B8A8FF" />
      <path d="m30 30-1 2" stroke="#B8A8FF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
    {!compact && <span className="brand-type"><strong>SkillSync<span> AI</span></strong><small>Understand skills. Reveal potential.</small></span>}
  </Link>;
}
