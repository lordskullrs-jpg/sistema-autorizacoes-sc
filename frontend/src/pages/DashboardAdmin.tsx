import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import ModalRedefinirSenha from '../components/ModalRedefinirSenha';
import { ModalAdicionarUsuario } from '../components/ModalAdicionarUsuario';
import { ModalEditarUsuario } from '../components/ModalEditarUsuario';
import { ModalExcluirUsuario } from '../components/ModalExcluirUsuario';

const API_URL = import.meta.env.VITE_API_URL || 'https://autorizacoes-backend.lordskull-rs.workers.dev';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  perfil: string;
  categoria?: string;
  ativo: number;
  criado_em: string;
  ultimo_login?: string;
}

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [configuracoes, setConfiguracoes] = useState<any[]>([]);
  
  // Modais
  const [mostrarModalRedefinir, setMostrarModalRedefinir] = useState(false);
  const [mostrarModalAdicionar, setMostrarModalAdicionar] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);

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

  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setMostrarModalEditar(true);
  };

  const handleExcluirUsuario = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setMostrarModalExcluir(true);
  };

  const handleSuccessModal = () => {
    carregarDados(); // Recarregar lista de usuários
  };

  if (loading) {
    return <Loading />;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getPerfilBadge = (perfil: string) => {
    const cores: any = {
      admin: 'bg-purple-100 text-purple-800',
      supervisor: 'bg-blue-100 text-blue-800',
      servicosocial: 'bg-green-100 text-green-800',
      monitor: 'bg-yellow-100 text-yellow-800',
      atleta: 'bg-gray-100 text-gray-800'
    };
    
    const nomes: any = {
      admin: 'Admin',
      supervisor: 'Supervisor',
      servicosocial: 'Serviço Social',
      monitor: 'Monitor',
      atleta: 'Atleta'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${cores[perfil] || 'bg-gray-100 text-gray-800'}`}>
        {nomes[perfil] || perfil}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b-2 border-red-600 px-8 py-4 flex justify-between items-center">
        <div className="flex gap-8 items-center">
          <a href="#" className="text-gray-600 text-sm hover:text-red-600">
            Política de Privacidade LGPD
          </a>
          <button
            onClick={() => setMostrarModalRedefinir(true)}
            className="text-red-600 font-bold text-sm hover:text-red-700"
          >
            Redefinir Senha
          </button>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-gray-600 text-sm">{user.email}</span>
          <button
            onClick={handleLogout}
            className="text-gray-600 text-sm hover:text-red-600"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-red-600">Painel de Administração</h1>
            <p className="text-gray-600 mt-1">Gerencie usuários e configurações do sistema</p>
          </div>
          <div className="w-16 h-16">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/f/f1/Escudo_do_Sport_Club_Internacional.svg" 
              alt="SC Internacional"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Seção de Usuários */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">👥 Gerenciamento de Usuários</h2>
            <button
              onClick={() => setMostrarModalAdicionar(true)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Adicionar Usuário
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Perfil</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Categoria</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{usuario.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{usuario.nome}</td>
                    <td className="px-4 py-3 text-sm">{getPerfilBadge(usuario.perfil)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{usuario.categoria || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        usuario.ativo === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.ativo === 1 ? '✓ Ativo' : '✗ Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditarUsuario(usuario)}
                          className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleExcluirUsuario(usuario)}
                          className="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {usuarios.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhum usuário cadastrado</p>
          )}
        </div>

        {/* Seção de Configurações */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">⚙️ Configurações do Sistema</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configuracoes.map((config) => (
              <div key={config.chave} className="border rounded p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{config.descricao}</h3>
                <p className="text-2xl font-bold text-red-600">{config.valor}</p>
                <p className="text-xs text-gray-500 mt-1">Chave: {config.chave}</p>
              </div>
            ))}
          </div>

          {configuracoes.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhuma configuração disponível</p>
          )}
        </div>
      </div>

      {/* Modais */}
      <ModalRedefinirSenha
        isOpen={mostrarModalRedefinir}
        onClose={() => setMostrarModalRedefinir(false)}
      />

      <ModalAdicionarUsuario
        isOpen={mostrarModalAdicionar}
        onClose={() => setMostrarModalAdicionar(false)}
        onSuccess={handleSuccessModal}
      />

      <ModalEditarUsuario
        isOpen={mostrarModalEditar}
        usuario={usuarioSelecionado}
        onClose={() => {
          setMostrarModalEditar(false);
          setUsuarioSelecionado(null);
        }}
        onSuccess={handleSuccessModal}
      />

      <ModalExcluirUsuario
        isOpen={mostrarModalExcluir}
        usuario={usuarioSelecionado}
        onClose={() => {
          setMostrarModalExcluir(false);
          setUsuarioSelecionado(null);
        }}
        onSuccess={handleSuccessModal}
      />
    </div>
  );
}
