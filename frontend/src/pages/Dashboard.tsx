import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardSupervisor from './DashboardSupervisor';
import DashboardServicoSocial from './DashboardServicoSocial';
import DashboardMonitor from './DashboardMonitor';
import DashboardAdmin from './DashboardAdmin';

export default function Dashboard() {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  // Rotear para dashboard específico baseado no perfil
  switch (usuario.perfil) {
    case 'supervisor':
      return <DashboardSupervisor />;
    case 'servicosocial':
      return <DashboardServicoSocial />;
    case 'monitor':
      return <DashboardMonitor />;
    case 'admin':
      return <DashboardAdmin />;
    default:
      return <Navigate to="/login" />;
  }
}
