import { useState, type FormEvent } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://autorizacoes-backend.lordskull-rs.workers.dev';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalRedefinirSenha({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [linkGerado, setLinkGerado] = useState<{
    link: string;
    whatsapp_link: string;
    expira_em: string;
    usuario: { email: string; nome: string };
  } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Não autenticado');
      }

      // Buscar ID do usuário pelo email
      const usersResponse = await fetch(`${API_URL}/admin/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!usersResponse.ok) {
        throw new Error('Erro ao buscar usuários');
      }

      const usersData = await usersResponse.json();
      const usuario = usersData.usuarios.find((u: any) => u.email === email);

      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }

      // Gerar link de redefinição
      const response = await fetch(`${API_URL}/admin/usuarios/${usuario.id}/gerar-link-redefinicao`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao gerar link');
      }

      setLinkGerado(result);
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copiarLink = () => {
    if (linkGerado) {
      navigator.clipboard.writeText(linkGerado.link);
      alert('Link copiado para a área de transferência!');
    }
  };

  const abrirWhatsApp = () => {
    if (linkGerado) {
      window.open(linkGerado.whatsapp_link, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto',
            background: '#cc0d2e',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'white',
            fontWeight: 'bold'
          }}>
            SC
          </div>
          <h2 style={{ color: '#cc0d2e', marginTop: '1rem', marginBottom: '0.5rem' }}>
            Alojamentos
          </h2>
        </div>

        <h3 style={{ color: '#cc0d2e', marginBottom: '1rem', textAlign: 'center' }}>
          Gerar Link de Redefinição
        </h3>

        <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Digite o email do usuário para gerar um link seguro de redefinição de senha
        </p>

        {linkGerado && (
          <div style={{
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <p style={{ margin: 0, color: '#155724', fontSize: '0.9rem' }}>
              ✅ Link gerado com sucesso para <strong>{linkGerado.usuario.email}</strong>
            </p>
          </div>
        )}

        {erro && (
          <div style={{
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <p style={{ margin: 0, color: '#721c24', fontSize: '0.9rem' }}>
              ❌ {erro}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email do Usuário:</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@exemplo.com"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'Gerando...' : 'Gerar Link'}
          </button>
        </form>

        {linkGerado && (
          <>
            <div className="form-group">
              <label className="form-label">Link Gerado:</label>
              <textarea
                className="form-control"
                value={linkGerado.link}
                readOnly
                rows={3}
                style={{ fontSize: '0.85rem', background: '#f5f5f5' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button
                onClick={copiarLink}
                className="btn"
                style={{
                  flex: 1,
                  background: '#007bff',
                  color: 'white',
                  border: 'none'
                }}
              >
                📋 Copiar
              </button>
              <button
                onClick={abrirWhatsApp}
                className="btn"
                style={{
                  flex: 1,
                  background: '#25d366',
                  color: 'white',
                  border: 'none'
                }}
              >
                📱 WhatsApp
              </button>
            </div>

            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1rem'
            }}>
              <p style={{ margin: 0, color: '#856404', fontSize: '0.85rem' }}>
                ⚠️ O link expira em 1 hora
              </p>
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="btn btn-secondary"
          style={{ width: '100%' }}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
