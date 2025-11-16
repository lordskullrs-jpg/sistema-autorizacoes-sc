import { useAuth } from '../contexts/AuthContext';
import '../styles/global.css';

export default function Header() {
  const { usuario, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          🔴 SC Internacional - Autorizações de Saída
        </div>
        {usuario && (
          <div className="header-user">
            <span>
              <strong>{usuario.nome}</strong> ({usuario.perfil})
            </span>
            <button onClick={logout} className="btn btn-secondary">
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
