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
  observacao_servico_social?: string;
  link_aprovacao_pais?: string;
  token_pais?: string;
  token_pais_expira_em?: string;
  criado_em: string;
}

export default function DashboardServicoSocial() {
  const { token, usuario } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const [observacao, setObservacao] = useState('');
  const [processando, setProcessando] = useState(false);
  const [filtro, setFiltro] = useState<string>('pendentes');
  const [linkWhatsApp, setLinkWhatsApp] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'https://autorizacoes-backend.lordskull-rs.workers.dev';

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

  const handleEnviarPais = async () => {
    if (!solicitacaoSelecionada) return;

    setProcessando(true);
    setErro('');
    setSucesso('');

    try {
      const response = await fetch(
        `${API_URL}/api/solicitacoes/${solicitacaoSelecionada.id}/enviar-link-pais`,
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

      setLinkWhatsApp(result.whatsapp_link);
      setSucesso('✅ Link gerado com sucesso! Envie pelo WhatsApp.');
      await carregarSolicitacoes();
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setProcessando(false);
    }
  };

  const handleAprovarFinal = async (aprovado: boolean) => {
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
        `${API_URL}/api/solicitacoes/${solicitacaoSelecionada.id}/servico-social`,
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

      setSucesso(aprovado ? '✅ Solicitação aprovada! Enviada para o Monitor.' : '❌ Solicitação reprovada');
      setSolicitacaoSelecionada(null);
      setObservacao('');
      setLinkWhatsApp('');
      await carregarSolicitacoes();
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setProcessando(false);
    }
  };

  const copiarLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setSucesso('✅ Link copiado para a área de transferência!');
    setTimeout(() => setSucesso(''), 3000);
  };

  const abrirWhatsApp = (solicitacao: Solicitacao, link: string) => {
    const telefone = solicitacao.telefone_responsavel.replace(/\D/g, '');
    const mensagem = encodeURIComponent(
      `🔴 SC Internacional - Autorização de Saída\n\n` +
      `Olá! Seu filho(a) ${solicitacao.nome} solicitou autorização de saída.\n\n` +
      `📅 Data: ${new Date(solicitacao.data_saida).toLocaleDateString('pt-BR')}\n` +
      `🕐 Horário: ${solicitacao.horario_saida}\n` +
      `📍 Motivo: ${solicitacao.motivo_destino}\n\n` +
      `Por favor, clique no link abaixo para aprovar ou reprovar:\n` +
      `${link}`
    );
    window.open(`https://wa.me/${telefone}?text=${mensagem}`, '_blank');
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
    if (filtro === 'pendentes') return s.status_servico_social === 'Pendente' && s.status_supervisor === 'Aprovado' && s.status_pais === 'Aprovado';
    if (filtro === 'aprovadas') return s.status_servico_social === 'Aprovado';
    if (filtro === 'reprovadas') return s.status_servico_social === 'Reprovado';
    if (filtro === 'aguardando_anteriores') return s.status_supervisor === 'Pendente' || s.status_pais === 'Pendente';
    if (filtro === 'aguardando_pais') return s.status_supervisor === 'Aprovado' && s.status_pais === 'Pendente';
    return true;
  });

  const stats = {
    pendentes: solicitacoes.filter(s => s.status_servico_social === 'Pendente' && s.status_supervisor === 'Aprovado' && s.status_pais === 'Aprovado').length,
    aprovadas: solicitacoes.filter(s => s.status_servico_social === 'Aprovado').length,
    reprovadas: solicitacoes.filter(s => s.status_servico_social === 'Reprovado').length,
    aguardandoPais: solicitacoes.filter(s => s.status_supervisor === 'Aprovado' && s.status_pais === 'Pendente').length,
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
    const linkCompleto = solicitacaoSelecionada.link_aprovacao_pais 
      ? `${API_URL}/aprovacao-pais/${solicitacaoSelecionada.link_aprovacao_pais}`
      : null;

    return (
      <div className="dashboard-container">
        <DashboardHeader title="Análise de Solicitação" userName={usuario?.nome || 'Serviço Social'} />

        <div className="dashboard-main">
          <button 
            onClick={() => {
              setSolicitacaoSelecionada(null);
              setObservacao('');
              setErro('');
              setSucesso('');
              setLinkWhatsApp('');
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
              <span className={`status-badge ${getStatusBadgeClass(solicitacaoSelecionada.status_servico_social)}`}>
                Status: {solicitacaoSelecionada.status_servico_social}
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

            <div className="info-section">
              <h3>✅ Histórico de Aprovações</h3>
              <div className="approval-history">
                <div className="approval-item">
                  <span className="approval-label">Supervisor ({solicitacaoSelecionada.categoria}):</span>
                  <span className={`status-badge ${getStatusBadgeClass(solicitacaoSelecionada.status_supervisor)}`}>
                    {solicitacaoSelecionada.status_supervisor}
                  </span>
                </div>
                {solicitacaoSelecionada.observacao_supervisor && (
                  <div className="approval-obs">
                    <strong>Observação:</strong> {solicitacaoSelecionada.observacao_supervisor}
                  </div>
                )}
                
                <div className="approval-item">
                  <span className="approval-label">Pais/Responsáveis:</span>
                  <span className={`status-badge ${getStatusBadgeClass(solicitacaoSelecionada.status_pais)}`}>
                    {solicitacaoSelecionada.status_pais}
                  </span>
                </div>
              </div>
            </div>

            {/* Link existente no banco de dados */}
            {linkCompleto && !linkWhatsApp && (
              <div className="alert alert-info" style={{padding: '1.5rem'}}>
                <h4 style={{marginBottom: '1rem'}}>🔗 Link de Aprovação dos Pais</h4>
                <p style={{marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666'}}>
                  Este link já foi gerado anteriormente. Você pode copiá-lo e enviá-lo via WhatsApp.
                </p>
                <div style={{
                  background: '#f5f5f5',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  border: '1px solid #ddd'
                }}>
                  {linkCompleto}
                </div>
                <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                  <button
                    onClick={() => copiarLink(linkCompleto)}
                    className="btn btn-primary"
                  >
                    📋 Copiar Link
                  </button>
                  <button
                    onClick={() => abrirWhatsApp(solicitacaoSelecionada, linkCompleto)}
                    className="btn btn-success"
                  >
                    📱 Abrir WhatsApp
                  </button>
                </div>
              </div>
            )}

            {/* Link recém-gerado via API */}
            {linkWhatsApp && (
              <div className="alert alert-success" style={{padding: '1.5rem'}}>
                <h4 style={{marginBottom: '1rem'}}>✅ Link Gerado com Sucesso!</h4>
                <p style={{marginBottom: '1rem'}}>Envie este link para os pais via WhatsApp:</p>
                <a 
                  href={linkWhatsApp} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-success"
                  style={{width: '100%', display: 'block', textAlign: 'center'}}
                >
                  📱 Abrir WhatsApp
                </a>
              </div>
            )}

            {/* Ações baseadas no status */}
            {solicitacaoSelecionada.status_supervisor === 'Aprovado' && 
             solicitacaoSelecionada.status_pais === 'Pendente' && 
             !linkWhatsApp && (
              <div className="action-buttons">
                <button
                  onClick={handleEnviarPais}
                  className="btn btn-primary"
                  disabled={processando}
                >
                  {processando ? 'Processando...' : linkCompleto ? '🔄 Gerar Novo Link' : '📱 Enviar para Pais'}
                </button>
                <button
                  onClick={() => handleAprovarFinal(false)}
                  className="btn btn-danger"
                  disabled={processando}
                >
                  {processando ? 'Processando...' : '❌ Reprovar Direto'}
                </button>
              </div>
            )}

            {solicitacaoSelecionada.status_supervisor === 'Aprovado' && 
             solicitacaoSelecionada.status_pais === 'Aprovado' && 
             solicitacaoSelecionada.status_servico_social === 'Pendente' && (
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
                    onClick={() => handleAprovarFinal(true)}
                    className="btn btn-success"
                    disabled={processando}
                  >
                    {processando ? 'Processando...' : '✅ Aprovar Final'}
                  </button>
                  <button
                    onClick={() => handleAprovarFinal(false)}
                    className="btn btn-danger"
                    disabled={processando}
                  >
                    {processando ? 'Processando...' : '❌ Reprovar'}
                  </button>
                </div>
              </>
            )}

            {solicitacaoSelecionada.status_supervisor !== 'Aprovado' && (
              <div className="alert alert-warning">
                <strong>⏳ Aguardando aprovação do supervisor</strong>
                <p>Esta solicitação ainda precisa ser aprovada pelo supervisor da categoria {solicitacaoSelecionada.categoria}.</p>
              </div>
            )}

            {solicitacaoSelecionada.status_servico_social !== 'Pendente' && (
              <div className="alert alert-info">
                <strong>ℹ️ Esta solicitação já foi {solicitacaoSelecionada.status_servico_social.toLowerCase()}a.</strong>
                {solicitacaoSelecionada.observacao_servico_social && (
                  <p style={{marginTop: '0.5rem'}}>
                    <strong>Observação:</strong> {solicitacaoSelecionada.observacao_servico_social}
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
      <DashboardHeader title="Painel do Serviço Social" userName={usuario?.nome || 'Serviço Social'} />

      <div className="dashboard-main">
        <DashboardCard title="👋 Bem-vindo ao Serviço Social!">
          <p>
            Você é responsável pela aprovação final das solicitações de autorização de saída. 
            Você pode enviar o link para os pais aprovarem e depois fazer a aprovação final.
          </p>
          <div className="attention-box">
            <strong>⚠️ Importante:</strong> Você tem acesso a todas as categorias. Analise cada 
            solicitação com atenção, pois sua aprovação é a última etapa antes da liberação para o monitor.
          </div>
        </DashboardCard>

        {/* Estatísticas */}
        <DashboardCard title="📊 Visão Geral">
          <div className="stats-grid">
            <div className="stat-card stat-warning">
              <div className="stat-icon">⏳</div>
              <div className="stat-number">{stats.pendentes}</div>
              <div className="stat-label">Prontas para Análise</div>
            </div>
            <div className="stat-card stat-info">
              <div className="stat-icon">👨‍👩‍👦</div>
              <div className="stat-number">{stats.aguardandoPais}</div>
              <div className="stat-label">Aguardando Pais</div>
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
              Prontas para Análise ({stats.pendentes})
            </button>
            <button 
              className={`filter-btn ${filtro === 'aguardando_pais' ? 'active' : ''}`}
              onClick={() => setFiltro('aguardando_pais')}
            >
              Aguardando Pais ({stats.aguardandoPais})
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
                    <th>Supervisor</th>
                    <th>Pais</th>
                    <th>Serv. Social</th>
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
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(sol.status_supervisor)}`}>
                          {sol.status_supervisor}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(sol.status_pais)}`}>
                          {sol.status_pais}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(sol.status_servico_social)}`}>
                          {sol.status_servico_social}
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
