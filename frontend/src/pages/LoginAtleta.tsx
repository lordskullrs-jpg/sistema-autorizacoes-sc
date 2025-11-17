import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Alert from '../components/Alert';

const API_URL = import.meta.env.VITE_API_URL || 'https://autorizacoes-backend.lordskull-rs.workers.dev';

export default function LoginAtleta() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  
  const [dados, setDados] = useState({
    email: 'atleta@inter.com',
    senha: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao fazer login');
      }

      // Verificar se é perfil atleta
      if (result.perfil !== 'atleta') {
        throw new Error('Esta área é exclusiva para atletas. Use o login principal para staff.');
      }

      // Salvar token no localStorage
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify({
        email: result.email,
        nome: result.nome,
        perfil: result.perfil
      }));

      // Redirecionar para formulário de solicitação
      navigate('/solicitar');
      
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '120px',
            height: '120px',
            margin: '0 auto',
            background: '#cc0d2e',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            color: 'white',
            fontWeight: 'bold'
          }}>
            SC
          </div>
          <h1 style={{ 
            color: '#cc0d2e', 
            marginTop: '1rem',
            fontSize: '1.8rem'
          }}>
            Alojamentos
          </h1>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            Sistema de Gestão de Atletas Alojados
          </p>
        </div>

        <Card title="🔐 Login de Atleta">
          {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
          
          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={dados.email}
                readOnly
                disabled={loading}
                style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <small style={{ color: '#666', fontSize: '0.85rem' }}>
                Email compartilhado por todos os atletas
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Senha *</label>
              <input
                type="password"
                className="form-control"
                value={dados.senha}
                onChange={(e) => setDados({...dados, senha: e.target.value})}
                placeholder="Digite a senha compartilhada"
                required
                disabled={loading}
                autoFocus
              />
              <small style={{ color: '#666', fontSize: '0.85rem' }}>
                Senha fornecida pelo departamento de serviço social
              </small>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              background: '#fff3cd', 
              borderRadius: '8px',
              border: '1px solid #ffc107'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>
                <strong>ℹ️ Informação:</strong><br/>
                Todos os atletas usam o mesmo email e senha. Após o login, você poderá criar suas solicitações de autorização de saída.
              </p>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary"
                disabled={loading}
              >
                ← Voltar ao Início
              </button>
            </div>
          </form>
        </Card>

        <div style={{ 
          marginTop: '2rem', 
          textAlign: 'center',
          color: '#666',
          fontSize: '0.85rem'
        }}>
          <p>Departamento de Serviço Social</p>
          <p>Sport Club Internacional</p>
        </div>
      </div>
    </div>
  );
}
