import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCard from '../components/DashboardCard';
import '../styles/dashboard.css';

interface Solicitacao {
  id: string;
  codigo_unico: string;
  nome: string;
  email: string;
  categoria: string;
  telefone: string;
  data_saida: string;
  horario_saida: string;
  data_retorno: string;
  horario_retorno: string;
  motivo_destino: string;
  status_supervisor: string;
  status_pais: string;
  status_servico_social: string;
  status_monitor: string;
  status_geral: string;
  status_final: string;
  observacao_monitor?: string;
  saida_confirmada_em?: string;
  retorno_confirmado_em?: string;
}

export default function DashboardMonitor() {
  const { token, usuario } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const [observacao, setObservacao] = useState('');
  const [processando, setProcessando] = useState(false);
  const [filtro, setFiltro] = useState<string>('todos');
  const [mostrarRelatorio, setMostrarRelatorio] = useState(false);
  const [relatorioData, setRelatorioData] = useState<any>(null);
  const [dataConsulta, setDataConsulta] = useState(new Date().toISOString().split('T')[0]);
  const [horaConsulta, setHoraConsulta] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));

  const API_URL = import.meta.env.VITE_API_URL || 'https://autorizacoes-backend.lordskullrs-jpg.workers.dev';

  useEffect(() => {
    carregarSolicitacoes();
  }, []);

  const buscarRelatorioChamada = async () => {
    setErro('');
    try {
      const response = await fetch(
        `${API_URL}/api/solicitacoes/relatorio-chamada?data=${dataConsulta}&hora=${horaConsulta}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar relatório');
      }

      setRelatorioData(result);
      setMostrarRelatorio(true);
    } catch (error: any) {
      setErro(error.message);
    }
  };

  const carregarSolicitacoes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/solicitacoes`, {
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
    setSucesso('');

    try {
      const response = await fetch(
        `${API_URL}/api/solicitacoes/${solicitacaoSelecionada.id}/monitor`,
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
          mensagem = '✅ Saída confirmada com sucesso!';
          break;
        case 'confirmar_retorno':
          mensagem = '✅ Retorno confirmado com sucesso!';
          break;
        case 'arquivar':
          mensagem = '📁 Solicitação arquivada com sucesso!';
          break;
      }

      setSucesso(mensagem);
      setSolicitacaoSelecionada(null);
      setObservacao('');
      await carregarSolicitacoes();
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setProcessando(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'badge-success';
      case 'Reprovado':
        return 'badge-danger';
      case 'Pendente':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  const solicitacoesFiltradas = solicitacoes.filter(s => {
    if (filtro === 'todos') return true;
    if (filtro === 'aguardando_saida') return s.status_geral === 'Aprovado - Aguardando Saída';
    if (filtro === 'saiu') return s.status_geral === 'Saiu';
    if (filtro === 'retornou') return s.status_geral === 'Retornou';
    return true;
  });

  const stats = {
    aguardandoSaida: solicitacoes.filter(s => s.status_geral === 'Aprovado - Aguardando Saída').length,
    saiu: solicitacoes.filter(s => s.status_geral === 'Saiu').length,
    retornou: solicitacoes.filter(s => s.status_geral === 'Retornou').length,
    total: solicitacoes.length
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Carregando solicitações...</p>
        </div>
      </div>
    );
  }

  if (solicitacaoSelecionada) {
    return (
      <div className="dashboard-container">
        <DashboardHeader title="Controle de Saída/Retorno" userName={usuario?.nome || 'Monitor'} />

        <div className="dashboard-main">
          <button 
            onClick={() => {
              setSolicitacaoSelecionada(null);
              setObservacao('');
              setErro('');
              setSucesso('');
            }}
            className="btn-back"
            disabled={processando}
          >
            ← Voltar para Lista
          </button>

          {erro && <div className="alert alert-danger">{erro}</div>}
          {sucesso && <div className="alert alert-success">{sucesso}</div>}

          <DashboardCard title={`📋 Solicitação #${solicitacaoSelecionada.codigo_unico}`}>
            <div className="status-badge-container">
              <span className={`status-badge ${getStatusBadgeClass(solicitacaoSelecionada.status_final)}`}>
                {solicitacaoSelecionada.status_geral}
              </span>
            </div>

            <div className="info-section">
              <h3>👤 Dados do Atleta</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Nome:</span>
                  <span className="info-value">{solicitacaoSelecionada.nome}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Categoria:</span>
                  <span className="info-value">{solicitacaoSelecionada.categoria}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Telefone:</span>
                  <span className="info-value">{solicitacaoSelecionada.telefone}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{solicitacaoSelecionada.email}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h3>📅 Dados da Saída</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Data/Hora Saída:</span>
                  <span className="info-value">
                    {new Date(solicitacaoSelecionada.data_saida).toLocaleDateString('pt-BR')} às {solicitacaoSelecionada.horario_saida}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Data/Hora Retorno:</span>
                  <span className="info-value">
                    {new Date(solicitacaoSelecionada.data_retorno).toLocaleDateString('pt-BR')} às {solicitacaoSelecionada.horario_retorno}
                  </span>
                </div>
                <div className="info-item full-width">
                  <span className="info-label">Motivo/Destino:</span>
                  <span className="info-value">{solicitacaoSelecionada.motivo_destino}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h3>✅ Histórico de Aprovações</h3>
              <div className="approval-history">
                <div className="approval-item">
                  <span className="approval-label">Supervisor:</span>
                  <span className={`status-badge ${getStatusBadgeClass(solicitacaoSelecionada.status_supervisor)}`}>
                    {solicitacaoSelecionada.status_supervisor}
                  </span>
                </div>
                <div className="approval-item">
                  <span className="approval-label">Pais/Responsáveis:</span>
                  <span className={`status-badge ${getStatusBadgeClass(solicitacaoSelecionada.status_pais)}`}>
                    {solicitacaoSelecionada.status_pais}
                  </span>
                </div>
                <div className="approval-item">
                  <span className="approval-label">Serviço Social:</span>
                  <span className={`status-badge ${getStatusBadgeClass(solicitacaoSelecionada.status_servico_social)}`}>
                    {solicitacaoSelecionada.status_servico_social}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Observação (opcional):</label>
              <textarea
                className="form-control"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={3}
                placeholder="Digite uma observação se necessário..."
                disabled={processando}
              />
            </div>

            <div className="action-buttons">
              {solicitacaoSelecionada.status_geral === 'Aprovado - Aguardando Saída' && (
                <button
                  onClick={() => handleAcaoMonitor('confirmar_saida')}
                  className="btn btn-success"
                  disabled={processando}
                >
                  {processando ? 'Processando...' : '✅ Confirmar Saída'}
                </button>
              )}

              {solicitacaoSelecionada.status_geral === 'Saiu' && (
                <button
                  onClick={() => handleAcaoMonitor('confirmar_retorno')}
                  className="btn btn-success"
                  disabled={processando}
                >
                  {processando ? 'Processando...' : '✅ Confirmar Retorno'}
                </button>
              )}

              {solicitacaoSelecionada.status_geral === 'Retornou' && (
                <button
                  onClick={() => handleAcaoMonitor('arquivar')}
                  className="btn btn-primary"
                  disabled={processando}
                >
                  {processando ? 'Processando...' : '📁 Arquivar Solicitação'}
                </button>
              )}
            </div>
          </DashboardCard>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader title="Painel do Monitor" userName={usuario?.nome || 'Monitor'} />

      <div className="dashboard-main">
        <DashboardCard title="👋 Bem-vindo, Monitor!">
          <p>
            Aqui você controla as saídas e retornos dos atletas. Todas as solicitações aprovadas 
            pelo Serviço Social aparecem aqui para você registrar quando o atleta sai e retorna.
          </p>
          <div className="attention-box">
            <strong>⚠️ Importante:</strong> Registre as saídas e retornos assim que acontecerem 
            para manter o controle atualizado.
          </div>
          
          {/* Botão de Relatório de Chamada */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={() => {
                setDataConsulta(new Date().toISOString().split('T')[0]);
                setHoraConsulta(new Date().toTimeString().split(' ')[0].substring(0, 5));
                buscarRelatorioChamada();
              }}
              className="btn-dashboard btn-primary"
              style={{ maxWidth: '400px' }}
            >
              📋 Gerar Relatório de Chamada
            </button>
          </div>
        </DashboardCard>

        {/* Estatísticas */}
        <DashboardCard title="📊 Visão Geral">
          <div className="stats-grid">
            <div className="stat-card stat-warning">
              <div className="stat-icon">⏳</div>
              <div className="stat-number">{stats.aguardandoSaida}</div>
              <div className="stat-label">Aguardando Saída</div>
            </div>
            <div className="stat-card stat-info">
              <div className="stat-icon">🚶</div>
              <div className="stat-number">{stats.saiu}</div>
              <div className="stat-label">Saíram</div>
            </div>
            <div className="stat-card stat-success">
              <div className="stat-icon">✅</div>
              <div className="stat-number">{stats.retornou}</div>
              <div className="stat-label">Retornaram</div>
            </div>
            <div className="stat-card stat-primary">
              <div className="stat-icon">📋</div>
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
        </DashboardCard>

        {erro && <div className="alert alert-danger">{erro}</div>}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}

        {/* Filtros */}
        <DashboardCard title="🔍 Filtrar Solicitações">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filtro === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltro('todos')}
            >
              Todas ({solicitacoes.length})
            </button>
            <button 
              className={`filter-btn ${filtro === 'aguardando_saida' ? 'active' : ''}`}
              onClick={() => setFiltro('aguardando_saida')}
            >
              Aguardando Saída ({stats.aguardandoSaida})
            </button>
            <button 
              className={`filter-btn ${filtro === 'saiu' ? 'active' : ''}`}
              onClick={() => setFiltro('saiu')}
            >
              Saíram ({stats.saiu})
            </button>
            <button 
              className={`filter-btn ${filtro === 'retornou' ? 'active' : ''}`}
              onClick={() => setFiltro('retornou')}
            >
              Retornaram ({stats.retornou})
            </button>
          </div>
        </DashboardCard>

        {/* Lista de Solicitações */}
        <DashboardCard title="📋 Solicitações">
          {solicitacoesFiltradas.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma solicitação encontrada com este filtro.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Atleta</th>
                    <th>Categoria</th>
                    <th>Saída</th>
                    <th>Retorno</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitacoesFiltradas.map((sol) => (
                    <tr key={sol.id}>
                      <td className="code-cell">{sol.codigo_unico}</td>
                      <td>{sol.nome}</td>
                      <td><span className="category-badge">{sol.categoria}</span></td>
                      <td>{new Date(sol.data_saida).toLocaleDateString('pt-BR')}</td>
                      <td>{new Date(sol.data_retorno).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(sol.status_final)}`}>
                          {sol.status_geral}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSolicitacaoSelecionada(sol)}
                          className="btn btn-sm btn-primary"
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
        </DashboardCard>
      </div>

      {/* Modal de Relatório de Chamada */}
      {mostrarRelatorio && relatorioData && (
        <div className="modal-overlay" onClick={() => setMostrarRelatorio(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Relatório de Chamada</h2>
              <button className="modal-close" onClick={() => setMostrarRelatorio(false)}>×</button>
            </div>

            <div className="modal-body">
              {/* Filtros de Data/Hora */}
              <div style={{ marginBottom: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '15px', color: '#C8102E' }}>📅 Consultar Data/Hora</h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'end' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Data:</label>
                    <input
                      type="date"
                      value={dataConsulta}
                      onChange={(e) => setDataConsulta(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da' }}
                    />
                  </div>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Hora:</label>
                    <input
                      type="time"
                      value={horaConsulta}
                      onChange={(e) => setHoraConsulta(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da' }}
                    />
                  </div>
                  <button
                    onClick={buscarRelatorioChamada}
                    className="btn-dashboard btn-primary"
                    style={{ padding: '10px 30px', height: 'fit-content' }}
                  >
                    🔄 Atualizar
                  </button>
                </div>
              </div>

              {/* Resumo */}
              <div style={{ marginBottom: '25px', padding: '15px', background: '#d4edda', borderRadius: '8px', border: '1px solid #28a745' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>
                  📊 Resumo da Consulta
                </h3>
                <p style={{ margin: '5px 0', color: '#155724' }}>
                  <strong>Data/Hora:</strong> {new Date(`${relatorioData.dataConsulta}T${relatorioData.horaConsulta}`).toLocaleString('pt-BR')}
                </p>
                <p style={{ margin: '5px 0', color: '#155724' }}>
                  <strong>Total de atletas autorizados a estar fora:</strong> {relatorioData.totalAtletas}
                </p>
              </div>

              {/* Lista de Atletas */}
              {relatorioData.totalAtletas === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                  <p style={{ fontSize: '1.1rem' }}>✅ Todos os atletas devem estar no alojamento neste horário!</p>
                </div>
              ) : (
                <div>
                  <h3 style={{ marginBottom: '15px', color: '#C8102E' }}>🏃 Atletas Autorizados a Estar Fora:</h3>
                  {relatorioData.atletas.map((atleta: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: '15px',
                        padding: '20px',
                        background: 'white',
                        border: `2px solid ${
                          atleta.statusAtual === 'ATRASADO' ? '#dc3545' :
                          atleta.statusAtual === 'RETORNOU' ? '#28a745' :
                          atleta.statusAtual === 'SAIU' ? '#ffc107' : '#6c757d'
                        }`,
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: '#495057' }}>{atleta.nome}</h4>
                          <span className="category-badge">{atleta.categoria}</span>
                        </div>
                        <span
                          style={{
                            padding: '6px 14px',
                            borderRadius: '12px',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            background:
                              atleta.statusAtual === 'ATRASADO' ? '#f8d7da' :
                              atleta.statusAtual === 'RETORNOU' ? '#d4edda' :
                              atleta.statusAtual === 'SAIU' ? '#fff3cd' : '#e9ecef',
                            color:
                              atleta.statusAtual === 'ATRASADO' ? '#721c24' :
                              atleta.statusAtual === 'RETORNOU' ? '#155724' :
                              atleta.statusAtual === 'SAIU' ? '#856404' : '#495057'
                          }}
                        >
                          {atleta.statusAtual === 'ATRASADO' ? '⚠️ ATRASADO' :
                           atleta.statusAtual === 'RETORNOU' ? '✅ RETORNOU' :
                           atleta.statusAtual === 'SAIU' ? '🚶 SAIU' :
                           atleta.statusAtual === 'AGUARDANDO_SAIDA' ? '⏳ AGUARDANDO' : '🚫 FORA'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <strong style={{ color: '#6c757d', fontSize: '0.85rem' }}>Saída:</strong>
                          <p style={{ margin: '4px 0', color: '#495057' }}>
                            {new Date(`${atleta.data_saida}T${atleta.horario_saida}`).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <strong style={{ color: '#6c757d', fontSize: '0.85rem' }}>Retorno Previsto:</strong>
                          <p style={{ margin: '4px 0', color: '#495057' }}>
                            {new Date(`${atleta.data_retorno}T${atleta.horario_retorno}`).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <strong style={{ color: '#6c757d', fontSize: '0.85rem' }}>Motivo:</strong>
                          <p style={{ margin: '4px 0', color: '#495057' }}>{atleta.motivo_destino}</p>
                        </div>
                      </div>

                      {atleta.observacaoStatus && (
                        <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', marginTop: '10px' }}>
                          <strong style={{ color: '#6c757d', fontSize: '0.85rem' }}>Status:</strong>
                          <p style={{ margin: '4px 0', color: '#495057' }}>{atleta.observacaoStatus}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Botão Imprimir */}
              <div style={{ marginTop: '25px', textAlign: 'center' }}>
                <button
                  onClick={() => window.print()}
                  className="btn-dashboard btn-secondary"
                  style={{ maxWidth: '300px' }}
                >
                  🖨️ Imprimir Relatório
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
