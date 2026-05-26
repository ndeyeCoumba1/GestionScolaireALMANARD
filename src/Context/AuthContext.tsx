import { createContext, useContext, useState} from 'react';
import type { ReactNode } from 'react';
import type { Role } from '../Types';

interface AuthContextType {
  token: string | null;
  role: Role | null;
  nom: string | null;
  login: (token: string, role: Role, nom: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<Role | null>(localStorage.getItem('role') as Role | null);
  const [nom, setNom] = useState<string | null>(localStorage.getItem('nom'));

  const login = (token: string, role: Role, nom: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('nom', nom);
    setToken(token);
    setRole(role);
    setNom(nom);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setNom(null);
    window.location.href = '/home';
  };

  return (
    <AuthContext.Provider value={{ token, role, nom, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};