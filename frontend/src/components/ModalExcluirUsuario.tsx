import React, { useState } from 'react';

interface Usuario {
  id: string;
  email: string;
  nome: string;
}

interface ModalExcluirUsuarioProps {
  isOpen: boolean;
  usuario: Usuario | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalExcluirUsuario: React.FC<ModalExcluirUsuarioProps> = ({
  isOpen,
  usuario,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleExcluir = async () => {
    if (!usuario) return;

    setLoading(true);
    setErro('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/usuarios/${usuario.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir usuário');
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
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Confirmar Exclusão</h2>

        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {erro}
          </div>
        )}

        <p className="text-gray-700 mb-2">
          Tem certeza que deseja excluir o usuário:
        </p>
        <p className="font-bold text-gray-900 mb-4">
          {usuario.nome} ({usuario.email})
        </p>
        <p className="text-sm text-red-600 mb-6">
          ⚠️ Esta ação não pode ser desfeita!
        </p>

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
            type="button"
            onClick={handleExcluir}
            className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Excluindo...' : 'Excluir Usuário'}
          </button>
        </div>
      </div>
    </div>
  );
};
