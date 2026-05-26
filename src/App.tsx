import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
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
import InscriptionList from './pages/inscriptions/InscriptionList';
import DepenseList from './pages/depenses/DepenseList';
import DepenseForm from './pages/depenses/DepenseForm';
import UserList from './pages/users/UserList';
import MoisList from './pages/Mois/MoisList';
import Reports from './pages/rapports/Reports';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function HomeRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="eleves" element={<ProtectedRoute><EleveList /></ProtectedRoute>} />
            <Route path="eleves/nouveau" element={<ProtectedRoute><EleveForm /></ProtectedRoute>} />
            <Route path="eleves/:id" element={<ProtectedRoute><EleveDetail /></ProtectedRoute>} />
            <Route path="eleves/:id/modifier" element={<ProtectedRoute><EleveForm /></ProtectedRoute>} />
            <Route path="parents" element={<ProtectedRoute><ParentList /></ProtectedRoute>} />
            <Route path="parents/nouveau" element={<ProtectedRoute><ParentForm /></ProtectedRoute>} />
            <Route path="parents/:id/modifier" element={<ProtectedRoute><ParentForm /></ProtectedRoute>} />
            <Route path="classes" element={<ProtectedRoute><ClasseList /></ProtectedRoute>} />
            <Route path="classes/nouveau" element={<ProtectedRoute><ClasseForm /></ProtectedRoute>} />
            <Route path="classes/:id/modifier" element={<ProtectedRoute><ClasseForm /></ProtectedRoute>} />
            <Route path="annees" element={<ProtectedRoute><AnneeList /></ProtectedRoute>} />
            <Route path="annees/nouveau" element={<ProtectedRoute><AnneeForm /></ProtectedRoute>} />
            <Route path="annees/:id/modifier" element={<ProtectedRoute><AnneeForm /></ProtectedRoute>} />
            <Route path="inscriptions" element={<ProtectedRoute><InscriptionList /></ProtectedRoute>} />
            <Route path="paiements" element={<ProtectedRoute><PaiementList /></ProtectedRoute>} />
            <Route path="paiements/nouveau" element={<ProtectedRoute><PaiementForm /></ProtectedRoute>} />
            <Route path="mois" element={<ProtectedRoute><MoisList /></ProtectedRoute>} />
            <Route path="depenses" element={<ProtectedRoute><DepenseList /></ProtectedRoute>} />
            <Route path="depenses/nouvelle" element={<ProtectedRoute><DepenseForm /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
            <Route path="rapports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}