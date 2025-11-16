import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Alert from '../components/Alert';
import Loading from '../components/Loading';

export default function DashboardServicoSocial() {
  const { token } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<any>(null);
  const [observacao, setObservacao] = useState('');
  const [processando, setProcessando] = useState(false);
  const [linkWhatsApp, setLinkWhatsApp] = useState('');

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

  const handleEnviarPais = async () => {
    if (!solicitacaoSelecionada) return;

    setProcessando(true);
    setErro('');

    try {
      const response = await fetch(
        `http://127.0.0.1:8787/api/solicitacoes/${solicitacaoSelecionada.id}/enviar-pais`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao gerar link');
      }

      setLinkWhatsApp(result.linkWhatsApp);
      setSucesso('Link gerado com sucesso! Envie pelo WhatsApp.');
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setProcessando(false);
    }
  };

  const handleAprovarFinal = async (aprovado: boolean) => {
    if (!solicitacaoSelecionada) return;

    if (!aprovado && !observacao.trim()) {
      setErro('Motivo da reprovação é obrigatório');
      return;
    }

    setProcessando(true);
    setErro('');

    try {
      const response = await fetch(
        `http://127.0.0.1:8787/api/solicitacoes/${solicitacaoSelecionada.id}/servico-social`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            aprovado,
            observacao: observacao.trim() || (aprovado ? 'Aprovado' : '')
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar solicitação');
      }

      setSucesso(aprovado ? 'Solicitação aprovada! Enviada para o Monitor.' : 'Solicitação reprovada');
      setSolicitacaoSelecionada(null);
      setObservacao('');
      setLinkWhatsApp('');
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

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2>👩‍💼 Dashboard Serviço Social</h2>
          <p style={{ color: '#666' }}>
            Você é o mediador final. Decide se envia para os pais e faz aprovação final.
          </p>
        </div>

        {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
        {sucesso && <Alert type="success" message={sucesso} onClose={() => setSucesso('')} />}

        {solicitacaoSelecionada ? (
          <Card title="📋 Detalhes da Solicitação">
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
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Saída:</td>
                      <td style={{ padding: '0.5rem' }}>
                        {new Date(solicitacaoSelecionada.data_saida).toLocaleDateString('pt-BR')} às {solicitacaoSelecionada.horario_saida}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Motivo:</td>
                      <td style={{ padding: '0.5rem' }}>{solicitacaoSelecionada.motivo_destino}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#cc0d2e' }}>Responsável</h3>
                <table style={{ width: '100%', marginTop: '1rem' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold', width: '200px' }}>Nome:</td>
                      <td style={{ padding: '0.5rem' }}>{solicitacaoSelecionada.nome_responsavel}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Telefone:</td>
                      <td style={{ padding: '0.5rem' }}>{solicitacaoSelecionada.telefone_responsavel}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Aprovação do Supervisor */}
              {solicitacaoSelecionada.status_supervisor && (
                <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                  <strong>Supervisor:</strong> <StatusBadge status={solicitacaoSelecionada.status_supervisor} />
                  {solicitacaoSelecionada.observacao_supervisor && (
                    <p style={{ marginTop: '0.5rem', color: '#666' }}>
                      💬 {solicitacaoSelecionada.observacao_supervisor}
                    </p>
                  )}
                </div>
              )}

              {/* Aprovação dos Pais */}
              {solicitacaoSelecionada.status_pais && (
                <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                  <strong>Pais/Responsáveis:</strong> <StatusBadge status={solicitacaoSelecionada.status_pais} />
                  {solicitacaoSelecionada.observacao_pais && (
                    <p style={{ marginTop: '0.5rem', color: '#666' }}>
                      💬 {solicitacaoSelecionada.observacao_pais}
                    </p>
                  )}
                </div>
              )}

              {/* Link WhatsApp */}
              {linkWhatsApp && (
                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#e8f5e9', borderRadius: '8px', border: '2px solid #4caf50' }}>
                  <h4 style={{ color: '#2e7d32', marginBottom: '1rem' }}>✅ Link Gerado com Sucesso!</h4>
                  <p style={{ marginBottom: '1rem' }}>Envie este link para os pais via WhatsApp:</p>
                  <a 
                    href={linkWhatsApp} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'block', textAlign: 'center' }}
                  >
                    📱 Abrir WhatsApp
                  </a>
                </div>
              )}

              {/* Ações baseadas no status */}
              {solicitacaoSelecionada.status_geral === 'Aprovado pelo Supervisor' && !linkWhatsApp && (
                <div>
                  <h4 style={{ color: '#cc0d2e', marginBottom: '1rem' }}>Decisão:</h4>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={handleEnviarPais}
                      className="btn btn-primary"
                      disabled={processando}
                      style={{ flex: 1 }}
                    >
                      📱 Enviar para Pais
                    </button>
                    <button
                      onClick={() => handleAprovarFinal(false)}
                      className="btn"
                      disabled={processando}
                      style={{ flex: 1, background: '#dc3545', color: 'white' }}
                    >
                      ❌ Reprovar Direto
                    </button>
                  </div>
                </div>
              )}

              {solicitacaoSelecionada.status_geral === 'Aprovado pelos Pais' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Observação (obrigatória para reprovação):</label>
                    <textarea
                      className="form-control"
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      rows={3}
                      placeholder="Digite sua observação..."
                      disabled={processando}
                    />
                  </div>

                  <h4 style={{ color: '#cc0d2e', marginBottom: '1rem' }}>Aprovação Final:</h4>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => handleAprovarFinal(true)}
                      className="btn btn-primary"
                      disabled={processando}
                      style={{ flex: 1 }}
                    >
                      ✅ Aprovar Final
                    </button>
                    <button
                      onClick={() => handleAprovarFinal(false)}
                      className="btn"
                      disabled={processando}
                      style={{ flex: 1, background: '#dc3545', color: 'white' }}
                    >
                      ❌ Reprovar
                    </button>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '2rem' }}>
                <button
                  onClick={() => {
                    setSolicitacaoSelecionada(null);
                    setObservacao('');
                    setLinkWhatsApp('');
                  }}
                  className="btn btn-secondary"
                  disabled={processando}
                >
                  Voltar
                </button>
              </div>
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
