import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Alert from '../components/Alert';
import '../styles/global.css';

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
      
      // Redirecionar baseado no perfil será feito no App.tsx
      navigate('/dashboard');
    } catch (error: any) {
      setErro(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #cc0d2e 0%, #a00a25 100%)'
    }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '1rem' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: '#cc0d2e', marginBottom: '0.5rem' }}>
              🔴 SC Internacional
            </h1>
            <p style={{ color: '#666' }}>Sistema de Autorizações de Saída</p>
          </div>

          {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu.email@inter.com.br"
                disabled={carregando}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                type="password"
                className="form-control"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                placeholder="••••••••"
                disabled={carregando}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={carregando}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px', fontSize: '0.875rem' }}>
            <strong>Usuários de teste:</strong>
            <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
              <li>joao.silva@inter.com.br</li>
              <li>supervisor.sub17@inter.com.br</li>
              <li>servicosocial@inter.com.br</li>
              <li>monitor@inter.com.br</li>
              <li>admin@inter.com.br</li>
            </ul>
            <p style={{ marginTop: '0.5rem' }}><strong>Senha:</strong> senha123</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
