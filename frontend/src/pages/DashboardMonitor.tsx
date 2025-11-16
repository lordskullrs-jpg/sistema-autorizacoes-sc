import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Alert from '../components/Alert';
import Loading from '../components/Loading';

export default function DashboardMonitor() {
  const { token } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<any>(null);
  const [observacao, setObservacao] = useState('');
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    carregarSolicitacoes();
  }, []);

  const carregarSolicitacoes = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8787/api/solicitacoes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar solicitações');
      }

      setSolicitacoes(result.solicitacoes || []);
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcaoMonitor = async (acao: string) => {
    if (!solicitacaoSelecionada) return;

    setProcessando(true);
    setErro('');

    try {
      const response = await fetch(
        `http://127.0.0.1:8787/api/solicitacoes/${solicitacaoSelecionada.id}/monitor`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            acao,
            observacao: observacao.trim()
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar ação');
      }

      let mensagem = '';
      switch (acao) {
        case 'confirmar_saida':
          mensagem = 'Saída confirmada com sucesso!';
          break;
        case 'confirmar_retorno':
          mensagem = 'Retorno confirmado com sucesso!';
          break;
        case 'arquivar':
          mensagem = 'Solicitação arquivada com sucesso!';
          break;
      }

      setSucesso(mensagem);
      setSolicitacaoSelecionada(null);
      setObservacao('');
      carregarSolicitacoes();
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setProcessando(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />

      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2>🚪 Dashboard Monitor</h2>
          <p style={{ color: '#666' }}>
            Controle físico de saída e retorno. Você vê TODAS as solicitações (aprovadas, reprovadas, em análise).
          </p>
        </div>

        {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
        {sucesso && <Alert type="success" message={sucesso} onClose={() => setSucesso('')} />}

        {solicitacaoSelecionada ? (
          <Card title="📋 Controle de Saída/Retorno">
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h3>Status Atual:</h3>
                <StatusBadge status={solicitacaoSelecionada.status_geral} />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#cc0d2e' }}>Dados do Atleta</h3>
                <table style={{ width: '100%', marginTop: '1rem' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold', width: '200px' }}>Código:</td>
                      <td style={{ padding: '0.5rem' }}>{solicitacaoSelecionada.codigo_unico}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Nome:</td>
                      <td style={{ padding: '0.5rem' }}>{solicitacaoSelecionada.nome}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Categoria:</td>
                      <td style={{ padding: '0.5rem' }}>{solicitacaoSelecionada.categoria}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Telefone:</td>
                      <td style={{ padding: '0.5rem' }}>{solicitacaoSelecionada.telefone}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#cc0d2e' }}>Dados da Saída</h3>
                <table style={{ width: '100%', marginTop: '1rem' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold', width: '200px' }}>Saída:</td>
                      <td style={{ padding: '0.5rem' }}>
                        {new Date(solicitacaoSelecionada.data_saida).toLocaleDateString('pt-BR')} às {solicitacaoSelecionada.horario_saida}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Retorno Previsto:</td>
                      <td style={{ padding: '0.5rem' }}>
                        {new Date(solicitacaoSelecionada.data_retorno).toLocaleDateString('pt-BR')} às {solicitacaoSelecionada.horario_retorno}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Motivo:</td>
                      <td style={{ padding: '0.5rem' }}>{solicitacaoSelecionada.motivo_destino}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                <h4>Histórico de Aprovações:</h4>
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Supervisor:</strong> <StatusBadge status={solicitacaoSelecionada.status_supervisor} /></p>
                  <p><strong>Pais:</strong> <StatusBadge status={solicitacaoSelecionada.status_pais} /></p>
                  <p><strong>Serviço Social:</strong> <StatusBadge status={solicitacaoSelecionada.status_servico_social} /></p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Observação (opcional):</label>
                <textarea
                  className="form-control"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={2}
                  placeholder="Digite uma observação se necessário..."
                  disabled={processando}
                />
              </div>

              {/* Ações baseadas no status */}
              {solicitacaoSelecionada.status_geral === 'Aprovado - Aguardando Saída' && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button
                    onClick={() => handleAcaoMonitor('confirmar_saida')}
                    className="btn btn-primary"
                    disabled={processando}
                    style={{ flex: 1 }}
                  >
                    ✅ Confirmar Saída
                  </button>
                  <button
                    onClick={() => {
                      setSolicitacaoSelecionada(null);
                      setObservacao('');
                    }}
                    className="btn btn-secondary"
                    disabled={processando}
                  >
                    Voltar
                  </button>
                </div>
              )}

              {solicitacaoSelecionada.status_geral === 'Saiu' && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button
                    onClick={() => handleAcaoMonitor('confirmar_retorno')}
                    className="btn btn-primary"
                    disabled={processando}
                    style={{ flex: 1 }}
                  >
                    ✅ Confirmar Retorno
                  </button>
                  <button
                    onClick={() => {
                      setSolicitacaoSelecionada(null);
                      setObservacao('');
                    }}
                    className="btn btn-secondary"
                    disabled={processando}
                  >
                    Voltar
                  </button>
                </div>
              )}

              {solicitacaoSelecionada.status_geral === 'Retornou' && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button
                    onClick={() => handleAcaoMonitor('arquivar')}
                    className="btn btn-primary"
                    disabled={processando}
                    style={{ flex: 1 }}
                  >
                    📁 Arquivar
                  </button>
                  <button
                    onClick={() => {
                      setSolicitacaoSelecionada(null);
                      setObservacao('');
                    }}
                    className="btn btn-secondary"
                    disabled={processando}
                  >
                    Voltar
                  </button>
                </div>
              )}

              {!['Aprovado - Aguardando Saída', 'Saiu', 'Retornou'].includes(solicitacaoSelecionada.status_geral) && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <p style={{ color: '#666', marginBottom: '1rem' }}>
                    {solicitacaoSelecionada.status_geral.includes('Reprovado') 
                      ? '❌ Esta solicitação foi reprovada. Atleta não pode sair.'
                      : '⏳ Aguardando aprovações. Atleta ainda não pode sair.'}
                  </p>
                  <button
                    onClick={() => {
                      setSolicitacaoSelecionada(null);
                      setObservacao('');
                    }}
                    className="btn btn-secondary"
                  >
                    Voltar
                  </button>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card title="📋 Todas as Solicitações">
            {solicitacoes.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                <p>Nenhuma solicitação no momento.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Código</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Nome</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Categoria</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Saída</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Retorno</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitacoes.map((sol) => (
                      <tr key={sol.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '1rem' }}>{sol.codigo_unico}</td>
                        <td style={{ padding: '1rem' }}>{sol.nome}</td>
                        <td style={{ padding: '1rem' }}>{sol.categoria}</td>
                        <td style={{ padding: '1rem' }}>
                          {new Date(sol.data_saida).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {new Date(sol.data_retorno).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <StatusBadge status={sol.status_geral} />
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => setSolicitacaoSelecionada(sol)}
                            className="btn btn-primary"
                            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                          >
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
