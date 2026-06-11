import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import ArLayout from './components/Layout/ArLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import EleveList from './pages/eleves/EleveList';
import EleveForm from './pages/eleves/EleveForm';
import EleveDetail from './pages/eleves/EleveDetail';
import ParentList from './pages/parents/ParentList';
import ParentForm from './pages/parents/ParentForm';
import ClasseList from './pages/classes/ClasseList';
import ClasseForm from './pages/classes/ClasseForm';
import AnneeList from './pages/Annees/AnneeList';
import AnneeForm from './pages/Annees/AnneeForm';
import PaiementList from './pages/paiements/PaiementList';
import PaiementForm from './pages/paiements/PaiementForm';
import SituationInscriptionPage from './pages/paiements/SituationInscriptionPage';
import SituationAnnuellePage from './pages/paiements/SituationAnnuellePage';
import ElevesImpayesPage from './pages/paiements/ElevesImpayesPage';
import InscriptionList from './pages/inscriptions/InscriptionList';
import DepenseList from './pages/depenses/DepenseList';
import DepenseForm from './pages/depenses/DepenseForm';
import UserList from './pages/users/UserList';
import MoisList from './pages/Mois/MoisList';
import Reports from './pages/rapports/Reports';
import ArDashboardPage from './pages/ar/ArDashboardPage';
import ArSeanceCoranPage from './pages/ar/SeanceCoranPage';
import ArHistoriqueCoranPage from './pages/ar/HistoriqueCoranPage';
import ArStatistiquesCoranPage from './pages/ar/StatistiquesCoranPage';
import ArLoginPage from './pages/ar/ArLoginPage';
import ArRapportCoranPage from './pages/ar/RapportCoranPage';
import ArRevisionCoranPage from './pages/ar/RevisionCoranPage';

// ========== PROTECTED ROUTE FRANÇAIS ==========
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const portail = localStorage.getItem('portail');
  
  console.log('=== ProtectedRoute (FR) DEBUG ===');
  console.log('Token:', !!token);
  console.log('Portail:', portail);
  
  if (!token) {
    console.log('Pas de token → redirection /login');
    return <Navigate to="/login" replace />;
  }
  
  if (portail === 'AR') {
    console.log('Portail AR détecté → redirection /ar/dashboard');
    return <Navigate to="/ar/dashboard" replace />;
  }
  
  console.log('Accès FR autorisé');
  return <>{children}</>;
}

// ========== PROTECTED ROUTE ARABE (CORRIGÉ) ==========
function ArProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const portail = localStorage.getItem('portail');
  const role = localStorage.getItem('role');
  
  console.log('=== ArProtectedRoute (AR) DEBUG ===');
  console.log('Token:', !!token);
  console.log('Portail:', portail);
  console.log('Role:', role);
  console.log('Portail attendu: AR');
  
  if (!token) {
    console.log('Pas de token → redirection /ar/login');
    return <Navigate to="/ar/login" replace />;
  }
  
  if (portail !== 'AR') {
    console.log(`Portail = ${portail} (n\'est pas AR) → redirection /dashboard`);
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('Accès AR autorisé ✅');
  return <>{children}</>;
}

// ========== HOME REDIRECT ==========
function HomeRedirect() {
  const { isAuthenticated } = useAuth();
  const portail = localStorage.getItem('portail');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Rediriger vers le bon dashboard selon le portail
  if (portail === 'AR') {
    return <Navigate to="/ar/dashboard" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
}

// ========== WRAPPERS ==========
function EleveFormWrapper() {
  const navigate = useNavigate();
  return <EleveForm onClose={() => navigate('/eleves')} />;
}

function ParentFormWrapper() {
  const navigate = useNavigate();
  return <ParentForm onClose={() => navigate('/parents')} />;
}

function ClasseFormWrapper() {
  const navigate = useNavigate();
  return <ClasseForm onClose={() => navigate('/classes')} />;
}

function AnneeFormWrapper() {
  const navigate = useNavigate();
  return <AnneeForm onClose={() => navigate('/annees')} />;
}

function PaiementFormWrapper() {
  const navigate = useNavigate();
  return <PaiementForm onClose={() => navigate('/paiements')} />;
}

function DepenseFormWrapper() {
  const navigate = useNavigate();
  return <DepenseForm onClose={() => navigate('/depenses')} />;
}

// ========== APP PRINCIPALE (CORRIGÉE) ==========
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Page de connexion publique */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Page de connexion arabe spécifique */}
          <Route path="/ar/login" element={<ArLoginPage />} />
          
          {/* Route home avec redirection intelligente */}
          <Route path="/home" element={<Home />} />
          
          {/* Route racine */}
          <Route path="/" element={<HomeRedirect />} />
          
          {/* ⚠️ CORRECTION IMPORTANTE ICI : Routes ARABES */}
          {/* Le chemin doit être "/ar" et non "ar" */}
          <Route 
            path="/ar" 
            element={
              <ArProtectedRoute>
                <ArLayout />
              </ArProtectedRoute>
            }
          >
            {/* Routes relatives au chemin parent "/ar" */}
            <Route path="dashboard" element={<ArDashboardPage />} />
            <Route path="seance" element={<ArSeanceCoranPage />} />
            <Route path="revision" element={<ArRevisionCoranPage />} />
            <Route path="historique" element={<ArHistoriqueCoranPage />} />
            <Route path="stats" element={<ArStatistiquesCoranPage />} />
            <Route path="rapports" element={<ArRapportCoranPage />} />

            {/* Redirection par défaut pour /ar */}
            <Route index element={<Navigate to="/ar/dashboard" replace />} />
          </Route>
          
          {/* Routes FRANÇAISES */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="eleves" element={<EleveList />} />
            <Route path="eleves/nouveau" element={<EleveFormWrapper />} />
            <Route path="eleves/:id" element={<EleveDetail />} />
            <Route path="eleves/:id/modifier" element={<EleveFormWrapper />} />
            <Route path="parents" element={<ParentList />} />
            <Route path="parents/nouveau" element={<ParentFormWrapper />} />
            <Route path="parents/:id/modifier" element={<ParentFormWrapper />} />
            <Route path="classes" element={<ClasseList />} />
            <Route path="classes/nouveau" element={<ClasseFormWrapper />} />
            <Route path="classes/:id/modifier" element={<ClasseFormWrapper />} />
            <Route path="annees" element={<AnneeList />} />
            <Route path="annees/nouveau" element={<AnneeFormWrapper />} />
            <Route path="annees/:id/modifier" element={<AnneeFormWrapper />} />
            <Route path="inscriptions" element={<InscriptionList />} />
            <Route path="paiements" element={<PaiementList />} />
            <Route path="paiements/nouveau" element={<PaiementFormWrapper />} />
            <Route path="paiements/situation-inscription" element={<SituationInscriptionPage />} />
            <Route path="paiements/situation-annuelle" element={<SituationAnnuellePage />} />
            <Route path="paiements/impayés" element={<ElevesImpayesPage />} />
            <Route path="mois" element={<MoisList />} />
            <Route path="depenses" element={<DepenseList />} />
            <Route path="depenses/nouvelle" element={<DepenseFormWrapper />} />
            <Route path="users" element={<UserList />} />
            <Route path="rapports" element={<Reports />} />
          </Route>
          
          {/* Route 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}