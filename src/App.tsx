import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EleveList from './pages/eleves/EleveList';
import EleveForm from './pages/eleves/EleveForm';
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="eleves" element={<EleveList />} />
            <Route path="eleves/nouveau" element={<EleveForm />} />
            <Route path="eleves/:id/modifier" element={<EleveForm />} />
            <Route path="parents" element={<ParentList />} />
            <Route path="parents/nouveau" element={<ParentForm />} />
            <Route path="parents/:id/modifier" element={<ParentForm />} />
            <Route path="classes" element={<ClasseList />} />
            <Route path="classes/nouveau" element={<ClasseForm />} />
            <Route path="classes/:id/modifier" element={<ClasseForm />} />
            <Route path="annees" element={<AnneeList />} />
            <Route path="annees/nouveau" element={<AnneeForm />} />
            <Route path="annees/:id/modifier" element={<AnneeForm />} />
            <Route path="inscriptions" element={<InscriptionList />} />
            <Route path="paiements" element={<PaiementList />} />
            <Route path="paiements/nouveau" element={<PaiementForm />} />
            <Route path="depenses" element={<DepenseList />} />
            <Route path="depenses/nouvelle" element={<DepenseForm />} />
            <Route path="users" element={<UserList />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}