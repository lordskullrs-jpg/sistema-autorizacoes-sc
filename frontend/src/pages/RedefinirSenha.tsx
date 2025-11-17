import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Alert from '../components/Alert';

const API_URL = import.meta.env.VITE_API_URL || 'https://autorizacoes-backend.lordskull-rs.workers.dev';

export default function RedefinirSenha() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [validando, setValidando] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [usuarioEmail, setUsuarioEmail] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  
  const [dados, setDados] = useState({
    nova_senha: '',
    confirmar_senha: ''
  });

  // Validar token ao carregar
  useEffect(() => {
    validarToken();
  }, [token]);

  const validarToken = async () => {
    try {
      const response = await fetch(`${API_URL}/reset-password/validar/${token}`);
      const result = await response.json();

      if (response.ok && result.valido) {
        setTokenValido(true);
        setUsuarioEmail(result.usuario_email);
      } else {
        setErro(result.error || 'Token inválido ou expirado');
        setTokenValido(false);
      }
    } catch (error: any) {
      setErro('Erro ao validar token');
      setTokenValido(false);
    } finally {
      setValidando(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // Validar senhas
      if (dados.nova_senha !== dados.confirmar_senha) {
        throw new Error('As senhas não coincidem');
      }

      if (dados.nova_senha.length < 6) {
        throw new Error('A senha deve ter no mínimo 6 caracteres');
      }

      const response = await fetch(`${API_URL}/reset-password/redefinir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          nova_senha: dados.nova_senha,
          confirmar_senha: dados.confirmar_senha
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao redefinir senha');
      }

      setSucesso(true);
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (validando) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p>Validando link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValido) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem', background: '#f5f5f5' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <Card title="❌ Link Inválido">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#dc3545', marginBottom: '1.5rem' }}>
                {erro}
              </p>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                O link pode ter expirado ou já foi utilizado. Entre em contato com o administrador para gerar um novo link.
              </p>
              <button
                onClick={() => navigate('/')}
                className="btn btn-primary"
              >
                Voltar ao Início
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem', background: '#f5f5f5' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <Card title="✅ Senha Redefinida!">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 1.5rem',
                background: '#28a745',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem'
              }}>
                ✓
              </div>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Sua senha foi redefinida com sucesso!
              </p>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Você já pode fazer login com a nova senha.
              </p>
              <p style={{ color: '#999', fontSize: '0.9rem' }}>
                Redirecionando para o login em 3 segundos...
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto',
            background: '#cc0d2e',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            color: 'white',
            fontWeight: 'bold'
          }}>
            SC
          </div>
          <h1 style={{ color: '#cc0d2e', marginTop: '1rem' }}>
            Alojamentos
          </h1>
        </div>

        <Card title="🔐 Redefinir Senha">
          {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
          
          <div style={{ padding: '2rem' }}>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Olá, <strong>{usuarioEmail}</strong>!
            </p>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Digite sua nova senha abaixo:
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nova Senha *</label>
                <input
                  type="password"
                  className="form-control"
                  value={dados.nova_senha}
                  onChange={(e) => setDados({...dados, nova_senha: e.target.value})}
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirmar Senha *</label>
                <input
                  type="password"
                  className="form-control"
                  value={dados.confirmar_senha}
                  onChange={(e) => setDados({...dados, confirmar_senha: e.target.value})}
                  placeholder="Digite a senha novamente"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {loading ? 'Salvando...' : '💾 Salvar Nova Senha'}
              </button>
            </form>
          </div>
        </Card>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
          <p>Departamento de Serviço Social</p>
        </div>
      </div>
    </div>
  );
}
