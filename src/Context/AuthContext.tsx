// AuthContext.tsx - VERSION CORRIGÉE
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Role } from '../Types';

type Portail = 'FR' | 'AR';

interface AuthContextType {
  token: string | null;
  role: Role | null;
  nom: string | null;
  portail: Portail | null;
  login: (token: string, role: Role, nom: string, portail: Portail) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialisation depuis localStorage
  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem('token');
    console.log('Init token:', !!t);
    return t;
  });
  
  const [role, setRole] = useState<Role | null>(() => {
    const r = localStorage.getItem('role') as Role | null;
    console.log('Init role:', r);
    return r;
  });
  
  const [nom, setNom] = useState<string | null>(() => {
    const n = localStorage.getItem('nom');
    console.log('Init nom:', n);
    return n;
  });
  
  const [portail, setPortail] = useState<Portail | null>(() => {
    const p = localStorage.getItem('portail') as Portail | null;
    console.log('Init portail:', p);
    return p;
  });

  // Écouter les changements de localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('Storage event detected');
      setToken(localStorage.getItem('token'));
      setRole(localStorage.getItem('role') as Role | null);
      setNom(localStorage.getItem('nom'));
      setPortail(localStorage.getItem('portail') as Portail | null);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (token: string, role: Role, nom: string, portail: Portail) => {
    console.log('=== LOGIN CONTEXT ===');
    console.log('Paramètres reçus:');
    console.log('  - token:', token.substring(0, 20) + '...');
    console.log('  - role:', role);
    console.log('  - nom:', nom);
    console.log('  - portail:', portail);
    
    // Sauvegarde dans localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('nom', nom);
    localStorage.setItem('portail', portail);
    
    // Vérification immédiate
    console.log('Vérification après stockage localStorage:');
    console.log('  - token:', !!localStorage.getItem('token'));
    console.log('  - role:', localStorage.getItem('role'));
    console.log('  - portail:', localStorage.getItem('portail'));
    
    // Mise à jour du state
    setToken(token);
    setRole(role);
    setNom(nom);
    setPortail(portail);
    
    console.log('État après mise à jour state:');
    console.log('  - portail state:', portail);
  };

  const logout = () => {
    console.log('=== LOGOUT ===');
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
    <AuthContext.Provider 
      value={{ 
        token, 
        role, 
        nom, 
        portail, 
        login, 
        logout, 
        isAuthenticated 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};