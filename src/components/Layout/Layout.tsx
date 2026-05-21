import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import Sidebar from './Sidebar';

const SIDEBAR_WIDTH = 260;

export default function Layout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0, left: 0,
        width: SIDEBAR_WIDTH,
        height: '100vh',
        overflowY: 'auto',
        zIndex: 1000,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
      }}>
        <Sidebar />
      </div>

      <div style={{
        marginLeft: SIDEBAR_WIDTH,
        minHeight: '100vh',
        backgroundColor: '#f4f9f6',
      }}>
        <Outlet />
      </div>
    </>
  );
}