import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/dashboard.css';

interface DashboardHeaderProps {
  title?: string;
  userName?: string;
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <div className="dashboard-logo-container">
        <img 
          src="https://i.imgur.com/odzcc03.png" 
          alt="Logo SC Internacional" 
          className="dashboard-logo-top"
        />
      </div>
      
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="header-title">Sistema de Autorizações Digitais</h1>
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </div>
      </div>

      {userName && (
        <div className="welcome-section">
          <h2 className="welcome-title">Bem-vindo, {userName}</h2>
        </div>
      )}
    </>
  );
}
