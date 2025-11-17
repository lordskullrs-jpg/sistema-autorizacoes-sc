import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import Loading from '../components/Loading';
import ModalRedefinirSenha from '../components/ModalRedefinirSenha';

const API_URL = import.meta.env.VITE_API_URL || 'https://autorizacoes-backend.lordskull-rs.workers.dev';

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [configuracoes, setConfiguracoes] = useState<any[]>([]);
  const [mostrarModalRedefinir, setMostrarModalRedefinir] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Carregar usuários
      const usersResponse = await fetch(`${API_URL}/admin/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsuarios(usersData.usuarios || []);
      }

      // Carregar configurações
      const configResponse = await fetch(`${API_URL}/admin/configuracoes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (configResponse.ok) {
        const configData = await configResponse.json();
        setConfiguracoes(configData.configuracoes || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <Loading />;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header com botão Redefinir Senha */}
      <div style={{
        background: 'white',
        borderBottom: '2px solid #cc0d2e',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
            Política de Privacidade LGPD
          </a>
          <button
            onClick={() => setMostrarModalRedefinir(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#cc0d2e',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            Redefinir Senha
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>{user.email}</span>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Sair
          </button>
        </div>
      </div>

      <DashboardHeader
        titulo="Painel de Administração"
        subtitulo="Gerenciamento de Usuários e Configurações"
        perfil="admin"
      />

      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Seção de Usuários */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#cc0d2e', marginBottom: '1.5rem' }}>
            👥 Gerenciamento de Usuários
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Nome</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Perfil</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Categoria</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Último Login</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>{usuario.email}</td>
                    <td style={{ padding: '1rem' }}>{usuario.nome}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        background: usuario.perfil === 'admin' ? '#ffc107' : '#17a2b8',
                        color: 'white'
                      }}>
                        {usuario.perfil}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{usuario.categoria || '-'}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        color: usuario.ativo ? '#28a745' : '#dc3545',
                        fontWeight: 'bold'
                      }}>
                        {usuario.ativo ? '✅ Ativo' : '🔴 Inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>
                      {usuario.ultimo_login ? new Date(usuario.ultimo_login).toLocaleString('pt-BR') : 'Nunca'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seção de Configurações */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#cc0d2e', marginBottom: '1.5rem' }}>
            ⚙️ Configurações do Sistema
          </h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {configuracoes.map((config) => (
              <div key={config.chave} style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#333' }}>{config.chave}</strong>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                      {config.descricao}
                    </p>
                  </div>
                  <div style={{
                    padding: '0.5rem 1rem',
                    background: '#f5f5f5',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    color: '#cc0d2e'
                  }}>
                    {config.valor}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffc107'
          }}>
            <p style={{ margin: 0, color: '#856404', fontSize: '0.9rem' }}>
              ℹ️ <strong>Nota:</strong> Para alterar as configurações, use as rotas da API ou atualize diretamente no banco de dados.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Redefinir Senha */}
      {mostrarModalRedefinir && (
        <ModalRedefinirSenha onClose={() => setMostrarModalRedefinir(false)} />
      )}
    </div>
  );
}
