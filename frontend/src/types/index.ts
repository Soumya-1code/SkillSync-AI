export type User = { id: number; email: string };
export type AuthResult = { access_token: string; token_type: "bearer"; user: User };
export type Entry = { title: string; organization: string; dates: string; description: string };
export type ResumeProfile = {
  name: string; email: string; phone: string; skills: string[];
  education: Entry[]; projects: Entry[]; experience: Entry[];
  certifications: string[]; profile_links: string[]; institutions: string[];
  text: string; warnings: string[];
};
export type MatchResult = {
  requirements: string[]; matched: string[]; missing: string[];
  score: number; evidence: Record<string, string>;
};
export type IntegrityFinding = { page: number; reason: string; snippet: string };
export type IntegrityResult = { keyword_counts: Record<string, number>; findings: IntegrityFinding[] };
