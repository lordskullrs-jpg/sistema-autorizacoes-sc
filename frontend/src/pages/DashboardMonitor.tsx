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

  const API_URL = import.meta.env.VITE_API_URL || 'https://autorizacoes-backend.lordskullrs-jpg.workers.dev';

  useEffect(() => {
    carregarSolicitacoes();
  }, []);

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
    </div>
  );
}
