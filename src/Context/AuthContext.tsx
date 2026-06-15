import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Role } from '../Types';

type Portail = 'FR' | 'AR';

interface AuthContextType {
  token: string | null;
  role: Role | null;
  nom: string | null;
  prenom: string | null;
  userId: number | null;
  portail: Portail | null;
  login: (token: string, role: Role, nom: string, portail: Portail, prenom?: string, userId?: number) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [role, setRole] = useState<Role | null>(() => localStorage.getItem('role') as Role | null);
  const [nom, setNom] = useState<string | null>(() => localStorage.getItem('nom'));
  const [prenom, setPrenom] = useState<string | null>(() => localStorage.getItem('prenom'));
  const [userId, setUserId] = useState<number | null>(() => {
    const uid = localStorage.getItem('userId');
    return uid ? Number(uid) : null;
  });
  const [portail, setPortail] = useState<Portail | null>(() => localStorage.getItem('portail') as Portail | null);

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setRole(localStorage.getItem('role') as Role | null);
      setNom(localStorage.getItem('nom'));
      setPortail(localStorage.getItem('portail') as Portail | null);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (token: string, role: Role, nom: string, portail: Portail, prenom?: string, userId?: number) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('nom', nom);
    localStorage.setItem('portail', portail);
    if (prenom) localStorage.setItem('prenom', prenom);
    if (userId) localStorage.setItem('userId', String(userId));

    setToken(token);
    setRole(role);
    setNom(nom);
    setPortail(portail);
    if (prenom !== undefined) setPrenom(prenom);
    if (userId !== undefined) setUserId(userId);
  };

  const logout = () => {
    localStorage.clear();
    document.documentElement.dir = 'ltr';
    setToken(null);
    setRole(null);
    setNom(null);
    setPortail(null);
    window.location.href = '/login';
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, role, nom, prenom, userId, portail, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
