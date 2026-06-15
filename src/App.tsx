import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
import Layout from './components/Layout/Layout';
import ArLayout from './components/Layout/ArLayout';
import NotFoundPage from './pages/NotFoundPage';

// ── Auth pages ──────────────────────────────────────────────────────────────
const LoginPage       = React.lazy(() => import('./pages/auth/LoginPage'));
const ArLoginPage     = React.lazy(() => import('./pages/ar/ArLoginPage'));

// ── Portail arabe ───────────────────────────────────────────────────────────
const ArDashboardPage   = React.lazy(() => import('./pages/ar/ArDashboardPage'));
const ArSeanceCoranPage = React.lazy(() => import('./pages/ar/SeanceCoranPage'));
const ArRevisionCoranPage = React.lazy(() => import('./pages/ar/RevisionCoranPage'));
const ArRapportCoranPage  = React.lazy(() => import('./pages/ar/RapportCoranPage'));

// ── Portail français ────────────────────────────────────────────────────────
const Dashboard             = React.lazy(() => import('./pages/Dashboard'));
const EleveList             = React.lazy(() => import('./pages/eleves/EleveList'));
const EleveForm             = React.lazy(() => import('./pages/eleves/EleveForm'));
const EleveDetail           = React.lazy(() => import('./pages/eleves/EleveDetail'));
const ParentList            = React.lazy(() => import('./pages/parents/ParentList'));
const ParentForm            = React.lazy(() => import('./pages/parents/ParentForm'));
const ClasseList            = React.lazy(() => import('./pages/classes/ClasseList'));
const ClasseForm            = React.lazy(() => import('./pages/classes/ClasseForm'));
const AnneeList             = React.lazy(() => import('./pages/Annees/AnneeList'));
const AnneeForm             = React.lazy(() => import('./pages/Annees/AnneeForm'));
const PaiementList          = React.lazy(() => import('./pages/paiements/PaiementList'));
const PaiementForm          = React.lazy(() => import('./pages/paiements/PaiementForm'));
const SituationInscriptionPage = React.lazy(() => import('./pages/paiements/SituationInscriptionPage'));
const SituationAnnuellePage    = React.lazy(() => import('./pages/paiements/SituationAnnuellePage'));
const ElevesImpayesPage        = React.lazy(() => import('./pages/paiements/ElevesImpayesPage'));
const InscriptionList   = React.lazy(() => import('./pages/inscriptions/InscriptionList'));
const DepenseList       = React.lazy(() => import('./pages/depenses/DepenseList'));
const DepenseForm       = React.lazy(() => import('./pages/depenses/DepenseForm'));
const UserList          = React.lazy(() => import('./pages/users/UserList'));
const MoisList          = React.lazy(() => import('./pages/Mois/MoisList'));
const Reports           = React.lazy(() => import('./pages/rapports/Reports'));
const EtablissementPage = React.lazy(() => import('./pages/etablissement/EtablissementPage'));

// ── Spinner de chargement ───────────────────────────────────────────────────
function SuspenseFallback() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="spinner-border" style={{ color: '#0A6E3F', width: 40, height: 40 }} role="status" />
    </div>
  );
}

// ── Route protégée français ─────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const portail = localStorage.getItem('portail');
  if (!token) return <Navigate to="/login" replace />;
  if (portail === 'AR') return <Navigate to="/ar/dashboard" replace />;
  return <>{children}</>;
}

// ── Route protégée arabe ────────────────────────────────────────────────────
function ArProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const portail = localStorage.getItem('portail');
  if (!token) return <Navigate to="/ar/login" replace />;
  if (portail !== 'AR') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// ── Redirection intelligente selon portail ──────────────────────────────────
function HomeRedirect() {
  const { isAuthenticated } = useAuth();
  const portail = localStorage.getItem('portail');
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={portail === 'AR' ? '/ar/dashboard' : '/dashboard'} replace />;
}

// ── Wrappers formulaires ────────────────────────────────────────────────────
function EleveFormWrapper()   { const n = useNavigate(); return <EleveForm   onClose={() => n('/eleves')} />; }
function ParentFormWrapper()  { const n = useNavigate(); return <ParentForm  onClose={() => n('/parents')} />; }
function ClasseFormWrapper()  { const n = useNavigate(); return <ClasseForm  onClose={() => n('/classes')} />; }
function AnneeFormWrapper()   { const n = useNavigate(); return <AnneeForm   onClose={() => n('/annees')} />; }
function PaiementFormWrapper(){ const n = useNavigate(); return <PaiementForm onClose={() => n('/paiements')} />; }
function DepenseFormWrapper() { const n = useNavigate(); return <DepenseForm  onClose={() => n('/depenses')} />; }

// ── App principale ──────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<SuspenseFallback />}>
          <Routes>
            {/* Pages publiques */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/ar/login" element={<ArLoginPage />} />

            {/* Redirection racine et /home */}
            <Route path="/"     element={<HomeRedirect />} />
            <Route path="/home" element={<HomeRedirect />} />

            {/* Portail arabe */}
            <Route path="/ar" element={<ArProtectedRoute><ArLayout /></ArProtectedRoute>}>
              <Route index        element={<Navigate to="/ar/dashboard" replace />} />
              <Route path="dashboard" element={<ArDashboardPage />} />
              <Route path="seance"    element={<ArSeanceCoranPage />} />
              <Route path="revision"  element={<ArRevisionCoranPage />} />
              <Route path="rapports"  element={<ArRapportCoranPage />} />
            </Route>

            {/* Portail français */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="dashboard"   element={<Dashboard />} />
              <Route path="eleves"      element={<EleveList />} />
              <Route path="eleves/nouveau"       element={<EleveFormWrapper />} />
              <Route path="eleves/:id"           element={<EleveDetail />} />
              <Route path="eleves/:id/modifier"  element={<EleveFormWrapper />} />
              <Route path="parents"              element={<ParentList />} />
              <Route path="parents/nouveau"      element={<ParentFormWrapper />} />
              <Route path="parents/:id/modifier" element={<ParentFormWrapper />} />
              <Route path="classes"              element={<ClasseList />} />
              <Route path="classes/nouveau"      element={<ClasseFormWrapper />} />
              <Route path="classes/:id/modifier" element={<ClasseFormWrapper />} />
              <Route path="annees"               element={<AnneeList />} />
              <Route path="annees/nouveau"       element={<AnneeFormWrapper />} />
              <Route path="annees/:id/modifier"  element={<AnneeFormWrapper />} />
              <Route path="inscriptions"         element={<InscriptionList />} />
              <Route path="paiements"            element={<PaiementList />} />
              <Route path="paiements/nouveau"    element={<PaiementFormWrapper />} />
              <Route path="paiements/situation-inscription" element={<SituationInscriptionPage />} />
              <Route path="paiements/situation-annuelle"    element={<SituationAnnuellePage />} />
              <Route path="paiements/impayés"               element={<ElevesImpayesPage />} />
              <Route path="mois"         element={<MoisList />} />
              <Route path="depenses"     element={<DepenseList />} />
              <Route path="depenses/nouvelle" element={<DepenseFormWrapper />} />
              <Route path="users"        element={<UserList />} />
              <Route path="rapports"     element={<Reports />} />
              <Route path="etablissement" element={<EtablissementPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
