import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Alert from '../components/Alert';
import Loading from '../components/Loading';

export default function DashboardSupervisor() {
  const { usuario, token } = useAuth();
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

  const handleAprovar = async (aprovado: boolean) => {
    if (!solicitacaoSelecionada) return;

    if (!aprovado && !observacao.trim()) {
      setErro('Motivo da reprovação é obrigatório');
      return;
    }

    setProcessando(true);
    setErro('');

    try {
      const response = await fetch(
        `http://127.0.0.1:8787/api/solicitacoes/${solicitacaoSelecionada.id}/supervisor`,
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

      setSucesso(aprovado ? 'Solicitação aprovada com sucesso!' : 'Solicitação reprovada');
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

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2>👨‍💼 Dashboard Supervisor - {usuario?.categoria}</h2>
          <p style={{ color: '#666' }}>
            Você visualiza apenas solicitações da categoria {usuario?.categoria}
          </p>
        </div>

        {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}
        {sucesso && <Alert type="success" message={sucesso} onClose={() => setSucesso('')} />}

        {solicitacaoSelecionada ? (
          <Card title="📋 Detalhes da Solicitação">
            <div style={{ padding: '2rem' }}>
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
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Email:</td>
                      <td style={{ padding: '0.5rem' }}>{solicitacaoSelecionada.email}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Telefone:</td>
                      <td style={{ padding: '0.5rem' }}>{solicitacaoSelecionada.telefone}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Categoria:</td>
                      <td style={{ padding: '0.5rem' }}>{solicitacaoSelecionada.categoria}</td>
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
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Retorno:</td>
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

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  onClick={() => handleAprovar(true)}
                  className="btn btn-primary"
                  disabled={processando}
                  style={{ flex: 1 }}
                >
                  ✅ Aprovar
                </button>
                <button
                  onClick={() => handleAprovar(false)}
                  className="btn"
                  disabled={processando}
                  style={{ 
                    flex: 1,
                    background: '#dc3545',
                    color: 'white'
                  }}
                >
                  ❌ Reprovar
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
            </div>
          </Card>
        ) : (
          <Card title="📋 Solicitações Pendentes">
            {solicitacoes.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                <p>Nenhuma solicitação pendente no momento.</p>
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
                            Analisar
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
