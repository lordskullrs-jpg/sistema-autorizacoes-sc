import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await login(email, senha);
      navigate('/dashboard');
    } catch (error: any) {
      setErro(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <img 
            src="https://i.imgur.com/odzcc03.png" 
            alt="Logo SC Internacional" 
            className="logo"
          />
          <h1 className="system-title">Sistema de Controle de Autorizações</h1>
        </div>

        <div className="login-form-section">
          <h2 className="login-title">Login</h2>
          
          {erro && (
            <div className="error-message">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="email@inter.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={carregando}
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha:</label>
              <input
                type="password"
                id="senha"
                name="senha"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={carregando}
              />
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <span>Entrando...</span>
                  <i className="fas fa-spinner fa-spin"></i>
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        <div className="social-service-block">
          <img 
            src="https://imgur.com/HIsH9X5.png" 
            alt="Logo Serviço Social" 
            className="footer-social-logo"
          />
          <p>Sistema de gerenciamento de autorizações</p>
          <p>Departamento de Serviço Social</p>
        </div>
      </div>

      <footer className="login-footer">
        <p>© 2025 TechVamp</p>
      </footer>
    </div>
  );
}
