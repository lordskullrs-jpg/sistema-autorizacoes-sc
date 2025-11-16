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
  data_nascimento: string;
  data_saida: string;
  horario_saida: string;
  data_retorno: string;
  horario_retorno: string;
  motivo_destino: string;
  nome_responsavel: string;
  telefone_responsavel: string;
  status_supervisor: string;
  status_pais: string;
  status_servico_social: string;
  status_geral: string;
  status_final: string;
  observacao_supervisor?: string;
  criado_em: string;
}

export default function DashboardSupervisor() {
  const { token, usuario } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const [observacao, setObservacao] = useState('');
  const [processando, setProcessando] = useState(false);
  const [filtro, setFiltro] = useState<string>('pendentes');

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

      // Filtrar apenas solicitações da categoria do supervisor
      const minhasSolicitacoes = (result.solicitacoes || []).filter(
        (s: Solicitacao) => s.categoria === usuario?.categoria
      );

      setSolicitacoes(minhasSolicitacoes);
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (aprovado: boolean) => {
    if (!solicitacaoSelecionada) return;

    if (!aprovado && !observacao.trim()) {
      setErro('⚠️ O motivo da reprovação é obrigatório!');
      return;
    }

    setProcessando(true);
    setErro('');
    setSucesso('');

    try {
      const response = await fetch(
        `${API_URL}/api/solicitacoes/${solicitacaoSelecionada.id}/supervisor`,
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

      setSucesso(aprovado ? '✅ Solicitação aprovada com sucesso!' : '❌ Solicitação reprovada');
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
    if (filtro === 'pendentes') return s.status_supervisor === 'Pendente';
    if (filtro === 'aprovadas') return s.status_supervisor === 'Aprovado';
    if (filtro === 'reprovadas') return s.status_supervisor === 'Reprovado';
    return true;
  });

  const stats = {
    pendentes: solicitacoes.filter(s => s.status_supervisor === 'Pendente').length,
    aprovadas: solicitacoes.filter(s => s.status_supervisor === 'Aprovado').length,
    reprovadas: solicitacoes.filter(s => s.status_supervisor === 'Reprovado').length,
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
        <DashboardHeader title="Análise de Solicitação" userName={usuario?.nome || 'Supervisor'} />

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
              <span className={`status-badge ${getStatusBadgeClass(solicitacaoSelecionada.status_supervisor)}`}>
                Status: {solicitacaoSelecionada.status_supervisor}
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
                  <span className="info-value">
                    <span className="category-badge">{solicitacaoSelecionada.categoria}</span>
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Data Nascimento:</span>
                  <span className="info-value">
                    {new Date(solicitacaoSelecionada.data_nascimento).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Telefone:</span>
                  <span className="info-value">{solicitacaoSelecionada.telefone}</span>
                </div>
                <div className="info-item full-width">
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
              <h3>👨‍👩‍👦 Dados do Responsável</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Nome:</span>
                  <span className="info-value">{solicitacaoSelecionada.nome_responsavel}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Telefone:</span>
                  <span className="info-value">{solicitacaoSelecionada.telefone_responsavel}</span>
                </div>
              </div>
            </div>

            {solicitacaoSelecionada.status_supervisor === 'Pendente' && (
              <>
                <div className="form-group">
                  <label className="form-label">Observação:</label>
                  <textarea
                    className="form-control"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows={4}
                    placeholder="Digite uma observação (obrigatória em caso de reprovação)..."
                    disabled={processando}
                  />
                </div>

                <div className="action-buttons">
                  <button
                    onClick={() => handleAprovar(true)}
                    className="btn btn-success"
                    disabled={processando}
                  >
                    {processando ? 'Processando...' : '✅ Aprovar Solicitação'}
                  </button>
                  <button
                    onClick={() => handleAprovar(false)}
                    className="btn btn-danger"
                    disabled={processando}
                  >
                    {processando ? 'Processando...' : '❌ Reprovar Solicitação'}
                  </button>
                </div>
              </>
            )}

            {solicitacaoSelecionada.status_supervisor !== 'Pendente' && (
              <div className="alert alert-info">
                <strong>ℹ️ Esta solicitação já foi {solicitacaoSelecionada.status_supervisor.toLowerCase()}a.</strong>
                {solicitacaoSelecionada.observacao_supervisor && (
                  <p style={{marginTop: '0.5rem'}}>
                    <strong>Observação:</strong> {solicitacaoSelecionada.observacao_supervisor}
                  </p>
                )}
              </div>
            )}
          </DashboardCard>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader 
        title={`Painel do Supervisor - ${usuario?.categoria || ''}`} 
        userName={usuario?.nome || 'Supervisor'} 
      />

      <div className="dashboard-main">
        <DashboardCard title="👋 Bem-vindo, Supervisor!">
          <p>
            Você é responsável por aprovar ou reprovar as solicitações de autorização de saída 
            dos atletas da categoria <strong>{usuario?.categoria}</strong>.
          </p>
          <div className="attention-box">
            <strong>⚠️ Importante:</strong> Você visualiza apenas solicitações da sua categoria. 
            Analise cada solicitação com atenção antes de aprovar ou reprovar.
          </div>
        </DashboardCard>

        {/* Estatísticas */}
        <DashboardCard title="📊 Visão Geral">
          <div className="stats-grid">
            <div className="stat-card stat-warning">
              <div className="stat-icon">⏳</div>
              <div className="stat-number">{stats.pendentes}</div>
              <div className="stat-label">Pendentes</div>
            </div>
            <div className="stat-card stat-success">
              <div className="stat-icon">✅</div>
              <div className="stat-number">{stats.aprovadas}</div>
              <div className="stat-label">Aprovadas</div>
            </div>
            <div className="stat-card stat-danger">
              <div className="stat-icon">❌</div>
              <div className="stat-number">{stats.reprovadas}</div>
              <div className="stat-label">Reprovadas</div>
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
              className={`filter-btn ${filtro === 'pendentes' ? 'active' : ''}`}
              onClick={() => setFiltro('pendentes')}
            >
              Pendentes ({stats.pendentes})
            </button>
            <button 
              className={`filter-btn ${filtro === 'aprovadas' ? 'active' : ''}`}
              onClick={() => setFiltro('aprovadas')}
            >
              Aprovadas ({stats.aprovadas})
            </button>
            <button 
              className={`filter-btn ${filtro === 'reprovadas' ? 'active' : ''}`}
              onClick={() => setFiltro('reprovadas')}
            >
              Reprovadas ({stats.reprovadas})
            </button>
            <button 
              className={`filter-btn ${filtro === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltro('todos')}
            >
              Todas ({solicitacoes.length})
            </button>
          </div>
        </DashboardCard>

        {/* Lista de Solicitações */}
        <DashboardCard title={`📋 Solicitações - ${usuario?.categoria}`}>
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
                    <th>Saída</th>
                    <th>Retorno</th>
                    <th>Motivo</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitacoesFiltradas.map((sol) => (
                    <tr key={sol.id}>
                      <td className="code-cell">{sol.codigo_unico}</td>
                      <td>{sol.nome}</td>
                      <td>{new Date(sol.data_saida).toLocaleDateString('pt-BR')}</td>
                      <td>{new Date(sol.data_retorno).toLocaleDateString('pt-BR')}</td>
                      <td className="motivo-cell">{sol.motivo_destino}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(sol.status_supervisor)}`}>
                          {sol.status_supervisor}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSolicitacaoSelecionada(sol)}
                          className="btn btn-sm btn-primary"
                        >
                          {sol.status_supervisor === 'Pendente' ? 'Analisar' : 'Ver Detalhes'}
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
