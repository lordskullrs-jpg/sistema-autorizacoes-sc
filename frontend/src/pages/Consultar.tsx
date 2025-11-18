import { useState, type FormEvent, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Alert from '../components/Alert';
import { api } from '../services/api';

export default function Consultar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState(searchParams.get('codigo') || '');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [solicitacao, setSolicitacao] = useState<any>(null);

  useEffect(() => {
    if (searchParams.get('codigo')) {
      handleConsultar();
    }
  }, []);

  const handleConsultar = async (e?: FormEvent) => {
    e?.preventDefault();
    setErro('');
    setLoading(true);
    setSolicitacao(null);

    try {
      const result: any = await api.consultarPublico(codigo);
      setSolicitacao(result.solicitacao);
    } catch (error: any) {
      setErro(error.message || 'Código não encontrado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Card title="🔍 Consultar Solicitação">
          {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
          
          <form onSubmit={handleConsultar} style={{ padding: '2rem' }}>
            <div className="form-group">
              <label className="form-label">Digite seu código de solicitação:</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="text"
                  className="form-control"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  placeholder="AUTH-2024-001"
                  required
                  style={{ flex: 1 }}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Consultando...' : 'Consultar'}
                </button>
              </div>
            </div>
          </form>

          {solicitacao && (
            <div style={{ padding: '2rem', borderTop: '1px solid #ddd' }}>
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '1rem' }}>Status Atual:</h3>
                <StatusBadge status={solicitacao.status_geral} />
              </div>

              <h4 style={{ color: '#cc0d2e', marginBottom: '1rem' }}>Dados da Solicitação</h4>
              <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <table style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold', width: '200px' }}>Código:</td>
                      <td style={{ padding: '0.5rem' }}>{solicitacao.codigo_unico}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Nome:</td>
                      <td style={{ padding: '0.5rem' }}>{solicitacao.nome}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Categoria:</td>
                      <td style={{ padding: '0.5rem' }}>{solicitacao.categoria}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Saída:</td>
                      <td style={{ padding: '0.5rem' }}>
                        {new Date(solicitacao.data_saida).toLocaleDateString('pt-BR')} às {solicitacao.horario_saida}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Retorno:</td>
                      <td style={{ padding: '0.5rem' }}>
                        {new Date(solicitacao.data_retorno).toLocaleDateString('pt-BR')} às {solicitacao.horario_retorno}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Motivo:</td>
                      <td style={{ padding: '0.5rem' }}>{solicitacao.motivo_destino}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 style={{ color: '#cc0d2e', marginBottom: '1rem' }}>Histórico de Aprovações</h4>
              <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #ddd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>👨‍💼 Supervisor:</strong>
                    <StatusBadge status={solicitacao.status_supervisor} />
                  </div>
                  {solicitacao.observacao_supervisor && (
                    <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                      💬 {solicitacao.observacao_supervisor}
                    </p>
                  )}
                  {solicitacao.data_aprovacao_supervisor && (
                    <p style={{ marginTop: '0.25rem', color: '#999', fontSize: '0.85rem' }}>
                      📅 {new Date(solicitacao.data_aprovacao_supervisor).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #ddd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>👨‍👩‍👦 Pais/Responsáveis:</strong>
                    <StatusBadge status={solicitacao.status_pais} />
                  </div>
                  {solicitacao.observacao_pais && (
                    <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                      💬 {solicitacao.observacao_pais}
                    </p>
                  )}
                  {solicitacao.data_aprovacao_pais && (
                    <p style={{ marginTop: '0.25rem', color: '#999', fontSize: '0.85rem' }}>
                      📅 {new Date(solicitacao.data_aprovacao_pais).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #ddd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>👩‍💼 Serviço Social:</strong>
                    <StatusBadge status={solicitacao.status_servico_social} />
                  </div>
                  {solicitacao.observacao_servico_social && (
                    <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                      💬 {solicitacao.observacao_servico_social}
                    </p>
                  )}
                  {solicitacao.data_aprovacao_servico_social && (
                    <p style={{ marginTop: '0.25rem', color: '#999', fontSize: '0.85rem' }}>
                      📅 {new Date(solicitacao.data_aprovacao_servico_social).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>🚪 Monitor:</strong>
                    <StatusBadge status={solicitacao.status_monitor} />
                  </div>
                  {solicitacao.observacao_monitor && (
                    <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                      💬 {solicitacao.observacao_monitor}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button onClick={() => navigate('/')} className="btn btn-secondary">
                  Voltar ao Início
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
