import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ResumeProfile } from "../types";

type ResumeContextValue = {
  file: File | null; profile: ResumeProfile | null;
  setFile: (file: File | null) => void; setProfile: (profile: ResumeProfile | null) => void;
};
const ResumeContext = createContext<ResumeContextValue | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const value = useMemo(() => ({
    file, profile,
    setFile: (next: File | null) => { setFile(next); if (!next) setProfile(null); },
    setProfile,
  }), [file, profile]);
  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
}

export function useResume() {
  const value = useContext(ResumeContext);
  if (!value) throw new Error("useResume must be used inside ResumeProvider");
  return value;
}
