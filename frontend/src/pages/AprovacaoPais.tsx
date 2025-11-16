import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/Card';

import Alert from '../components/Alert';
import Loading from '../components/Loading';

export default function AprovacaoPais() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [solicitacao, setSolicitacao] = useState<any>(null);
  const [observacao, setObservacao] = useState('');
  const [processando, setProcessando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    carregarSolicitacao();
  }, [token]);

  const carregarSolicitacao = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8787/api/aprovacao/${token}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Link inválido ou expirado');
      }

      setSolicitacao(result.solicitacao);
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (aprovado: boolean) => {
    if (!aprovado && !observacao.trim()) {
      setErro('Motivo da reprovação é obrigatório');
      return;
    }

    setProcessando(true);
    setErro('');

    try {
      const response = await fetch(`http://127.0.0.1:8787/api/aprovacao/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aprovado,
          observacao: observacao.trim() || (aprovado ? 'Aprovado pelos pais' : '')
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar aprovação');
      }

      setConcluido(true);
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setProcessando(false);
    }
  };

  if (loading) return <Loading />;

  if (erro && !solicitacao) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem', background: '#f5f5f5' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Card title="❌ Erro">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#dc3545', fontSize: '1.2rem', marginBottom: '2rem' }}>
                {erro}
              </p>
              <p style={{ color: '#666' }}>
                O link pode estar inválido, expirado ou já foi utilizado.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (concluido) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem', background: '#f5f5f5' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Card title="✅ Resposta Enviada com Sucesso!">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ color: '#28a745', marginBottom: '1rem' }}>
                Sua resposta foi registrada!
              </h3>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                O Serviço Social do SC Internacional foi notificado e dará continuidade ao processo.
              </p>
              <p style={{ color: '#999', fontSize: '0.9rem' }}>
                Você pode fechar esta página.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: 'linear-gradient(135deg, #cc0d2e 0%, #a00a25 100%)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', color: 'white', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔴 SC Internacional</h1>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 'normal' }}>Autorização de Saída</h2>
        </div>

        <Card title="👨‍👩‍👦 Aprovação dos Pais/Responsáveis">
          {erro && <Alert type="error" message={erro} onClose={() => setErro('')} />}

          <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
              <p style={{ margin: 0, color: '#856404' }}>
                ⚠️ <strong>Importante:</strong> Esta é uma solicitação de autorização de saída do alojamento. 
                Por favor, analise os dados com atenção antes de decidir.
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#cc0d2e', marginBottom: '1rem' }}>Dados do Atleta</h3>
              <table style={{ width: '100%', background: '#f9f9f9', borderRadius: '8px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', width: '200px' }}>Nome:</td>
                    <td style={{ padding: '0.75rem' }}>{solicitacao.nome}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Categoria:</td>
                    <td style={{ padding: '0.75rem' }}>{solicitacao.categoria}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Telefone:</td>
                    <td style={{ padding: '0.75rem' }}>{solicitacao.telefone}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#cc0d2e', marginBottom: '1rem' }}>Detalhes da Saída</h3>
              <table style={{ width: '100%', background: '#f9f9f9', borderRadius: '8px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', width: '200px' }}>Data de Saída:</td>
                    <td style={{ padding: '0.75rem' }}>
                      {new Date(solicitacao.data_saida).toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Horário de Saída:</td>
                    <td style={{ padding: '0.75rem' }}>{solicitacao.horario_saida}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Data de Retorno:</td>
                    <td style={{ padding: '0.75rem' }}>
                      {new Date(solicitacao.data_retorno).toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Horário de Retorno:</td>
                    <td style={{ padding: '0.75rem' }}>{solicitacao.horario_retorno}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Motivo/Destino:</td>
                    <td style={{ padding: '0.75rem' }}>{solicitacao.motivo_destino}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#e8f5e9', borderRadius: '8px', border: '1px solid #4caf50' }}>
              <p style={{ margin: 0, color: '#2e7d32' }}>
                ✅ <strong>Aprovado pelo Supervisor:</strong> Esta solicitação já foi aprovada pelo supervisor da categoria.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Observação {!observacao.trim() && '(obrigatória para reprovação)'}:
              </label>
              <textarea
                className="form-control"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={3}
                placeholder="Digite uma observação (obrigatória se reprovar)..."
                disabled={processando}
              />
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem', 
              marginTop: '2rem' 
            }}>
              <button
                onClick={() => handleAprovar(true)}
                className="btn btn-primary"
                disabled={processando}
                style={{ 
                  padding: '1rem',
                  fontSize: '1.1rem',
                  background: '#28a745',
                  border: 'none'
                }}
              >
                ✅ Aprovar Saída
              </button>
              <button
                onClick={() => handleAprovar(false)}
                className="btn"
                disabled={processando}
                style={{ 
                  padding: '1rem',
                  fontSize: '1.1rem',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none'
                }}
              >
                ❌ Não Aprovar
              </button>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
              <p>
                Após sua decisão, o Serviço Social será notificado e dará continuidade ao processo.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
