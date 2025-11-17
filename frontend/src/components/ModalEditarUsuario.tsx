import React, { useState, useEffect } from 'react';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  perfil: string;
  categoria?: string;
  ativo: number;
}

interface ModalEditarUsuarioProps {
  isOpen: boolean;
  usuario: Usuario | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalEditarUsuario: React.FC<ModalEditarUsuarioProps> = ({
  isOpen,
  usuario,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    perfil: '',
    categoria: '',
    ativo: true,
    senha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (usuario) {
      setFormData({
        email: usuario.email,
        nome: usuario.nome,
        perfil: usuario.perfil,
        categoria: usuario.categoria || '',
        ativo: usuario.ativo === 1,
        senha: '',
        confirmarSenha: ''
      });
    }
  }, [usuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    // Validar senhas se foram preenchidas
    if (formData.senha || formData.confirmarSenha) {
      if (formData.senha !== formData.confirmarSenha) {
        setErro('As senhas não coincidem');
        return;
      }
      if (formData.senha.length < 6) {
        setErro('A senha deve ter no mínimo 6 caracteres');
        return;
      }
    }

    if (formData.perfil === 'supervisor' && !formData.categoria) {
      setErro('Supervisores devem ter uma categoria definida');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload: any = {
        email: formData.email,
        nome: formData.nome,
        perfil: formData.perfil,
        categoria: formData.categoria || null,
        ativo: formData.ativo
      };

      // Só incluir senha se foi preenchida
      if (formData.senha) {
        payload.senha = formData.senha;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/usuarios/${usuario?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao editar usuário');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !usuario) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-red-600 mb-6">Editar Usuário</h2>

        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nome Completo</label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Perfil</label>
            <select
              value={formData.perfil}
              onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-red-500"
            >
              <option value="supervisor">Supervisor</option>
              <option value="servicosocial">Serviço Social</option>
              <option value="monitor">Monitor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {formData.perfil === 'supervisor' && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Categoria</label>
              <select
                required
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-red-500"
              >
                <option value="">Selecione...</option>
                <option value="Sub14">Sub-14</option>
                <option value="Sub15">Sub-15</option>
                <option value="Sub16">Sub-16</option>
                <option value="Sub17">Sub-17</option>
                <option value="Sub20">Sub-20</option>
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="mr-2"
              />
              <span className="text-gray-700">Usuário ativo</span>
            </label>
          </div>

          <hr className="my-4" />
          <p className="text-sm text-gray-600 mb-3">Deixe em branco para manter a senha atual</p>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nova Senha (opcional)</label>
            <input
              type="password"
              minLength={6}
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-red-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Confirmar Nova Senha</label>
            <input
              type="password"
              minLength={6}
              value={formData.confirmarSenha}
              onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-red-500"
              placeholder="Digite a senha novamente"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
