import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import { ResumeProvider } from "./hooks/useResume";
import { AnalyzerPage } from "./pages/AnalyzerPage";
import { AuthPage } from "./pages/AuthPage";
import { BiasBlindPage } from "./pages/BiasBlindPage";
import { IntegrityPage } from "./pages/IntegrityPage";
import { LandingPage } from "./pages/LandingPage";
import { MatcherPage } from "./pages/MatcherPage";
import { OverviewPage } from "./pages/OverviewPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return <AuthProvider><ResumeProvider><BrowserRouter><Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/signup" element={<AuthPage mode="signup" />} />
    <Route element={<ProtectedRoute />}><Route path="/app" element={<AppShell />}>
      <Route index element={<OverviewPage />} />
      <Route path="analyzer" element={<AnalyzerPage />} />
      <Route path="matcher" element={<MatcherPage />} />
      <Route path="integrity" element={<IntegrityPage />} />
      <Route path="bias-blind" element={<BiasBlindPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter></ResumeProvider></AuthProvider>;
}
