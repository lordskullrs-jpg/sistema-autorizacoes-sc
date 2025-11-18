import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Alert from '../components/Alert';
import DateInput from '../components/DateInput';

const API_URL = import.meta.env.VITE_API_URL || 'https://autorizacoes-backend.lordskull-rs.workers.dev';

export default function Solicitar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [codigo, setCodigo] = useState('');
  
  const [dados, setDados] = useState({
    nome: '',
    email: '',
    data_nascimento: '',
    telefone: '',
    categoria: 'Sub17',
    data_saida: '',
    horario_saida: '',
    data_retorno: '',
    horario_retorno: '',
    motivo_destino: '',
    nome_responsavel: '',
    telefone_responsavel: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login-atleta');
        return;
      }

      const response = await fetch(`${API_URL}/atleta/solicitar`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(dados)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar solicitação');
      }

      setCodigo(result.codigo);
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (codigo) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem', background: '#f5f5f5' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Card title="✅ Solicitação Criada com Sucesso!">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                Guarde este código para consultar o status:
              </p>
              <div style={{ 
                background: '#cc0d2e', 
                color: 'white', 
                padding: '1.5rem', 
                borderRadius: '8px',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '2rem',
                letterSpacing: '2px'
              }}>
                {codigo}
              </div>
              <p style={{ fontSize: '0.95rem', color: '#6c757d', marginBottom: '2rem' }}>
                Sua solicitação foi criada e está aguardando aprovação do supervisor.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-primary"
                >
                  🏠 Voltar ao Dashboard
                </button>
                <button 
                  onClick={() => navigate(`/consultar?codigo=${codigo}`)}
                  className="btn btn-secondary"
                >
                  🔍 Consultar Status
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card title="📝 Nova Solicitação de Autorização">
          {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
          
          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            <h3 style={{ color: '#cc0d2e', marginBottom: '1rem' }}>Dados do Atleta</h3>
            
            <div className="form-group">
              <label className="form-label">Nome Completo *</label>
              <input
                type="text"
                className="form-control"
                value={dados.nome}
                onChange={(e) => setDados({...dados, nome: e.target.value})}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-control"
                value={dados.email}
                onChange={(e) => setDados({...dados, email: e.target.value})}
                required
                disabled={loading}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <DateInput
                label="Data de Nascimento"
                value={dados.data_nascimento}
                onChange={(value) => setDados({...dados, data_nascimento: value})}
                required
                disabled={loading}
              />

              <div className="form-group">
                <label className="form-label">Telefone *</label>
                <input
                  type="tel"
                  className="form-control"
                  value={dados.telefone}
                  onChange={(e) => setDados({...dados, telefone: e.target.value})}
                  placeholder="(51) 99999-9999"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Categoria *</label>
              <select
                className="form-control"
                value={dados.categoria}
                onChange={(e) => setDados({...dados, categoria: e.target.value})}
                required
                disabled={loading}
              >
                <option value="Sub14">Sub-14</option>
                <option value="Sub15">Sub-15</option>
                <option value="Sub16">Sub-16</option>
                <option value="Sub17">Sub-17</option>
                <option value="Sub20">Sub-20</option>
              </select>
            </div>

            <h3 style={{ color: '#cc0d2e', marginTop: '2rem', marginBottom: '1rem' }}>Dados da Saída</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <DateInput
                label="Data de Saída"
                value={dados.data_saida}
                onChange={(value) => setDados({...dados, data_saida: value})}
                required
                disabled={loading}
              />

              <div className="form-group">
                <label className="form-label">Horário de Saída *</label>
                <input
                  type="time"
                  className="form-control"
                  value={dados.horario_saida}
                  onChange={(e) => setDados({...dados, horario_saida: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>

              <DateInput
                label="Data de Retorno"
                value={dados.data_retorno}
                onChange={(value) => setDados({...dados, data_retorno: value})}
                required
                disabled={loading}
              />

              <div className="form-group">
                <label className="form-label">Horário de Retorno *</label>
                <input
                  type="time"
                  className="form-control"
                  value={dados.horario_retorno}
                  onChange={(e) => setDados({...dados, horario_retorno: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Motivo/Destino *</label>
              <textarea
                className="form-control"
                value={dados.motivo_destino}
                onChange={(e) => setDados({...dados, motivo_destino: e.target.value})}
                rows={3}
                required
                disabled={loading}
                placeholder="Descreva o motivo da saída..."
              />
            </div>

            <h3 style={{ color: '#cc0d2e', marginTop: '2rem', marginBottom: '1rem' }}>Dados do Responsável</h3>

            <div className="form-group">
              <label className="form-label">Nome do Responsável *</label>
              <input
                type="text"
                className="form-control"
                value={dados.nome_responsavel}
                onChange={(e) => setDados({...dados, nome_responsavel: e.target.value})}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telefone do Responsável (WhatsApp) *</label>
              <input
                type="tel"
                className="form-control"
                value={dados.telefone_responsavel}
                onChange={(e) => setDados({...dados, telefone_responsavel: e.target.value})}
                placeholder="(51) 98888-8888"
                required
                disabled={loading}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
              <button 
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
