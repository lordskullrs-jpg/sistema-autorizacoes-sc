import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCard from '../components/DashboardCard';
import '../styles/dashboard.css';

export default function DashboardAtleta() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <DashboardHeader title="Sistema de Autorizações Digitais" userName="Atleta" />

      <div className="dashboard-main">
        {/* Card de Boas-vindas */}
        <DashboardCard title="Painel do Atleta">
          <p>
            Bem-vindo ao sistema de autorizações digitais do SC Internacional. 
            Aqui você pode solicitar autorizações de saída e consultar o status 
            das suas solicitações.
          </p>
          <div className="attention-box">
            <strong>⚠️ Atenção:</strong>
            <p>
              Todas as solicitações precisam ser aprovadas pelo supervisor da sua categoria,
              pelos seus pais/responsáveis e pelo serviço social antes de serem liberadas.
            </p>
          </div>
        </DashboardCard>

        {/* Card de Ações */}
        <DashboardCard title="O que deseja fazer?">
          <div className="dashboard-buttons">
            <button 
              className="btn-dashboard btn-primary"
              onClick={() => navigate('/solicitar')}
            >
              📝 Solicitar Nova Autorização
            </button>
            <button 
              className="btn-dashboard btn-primary"
              onClick={() => navigate('/consultar')}
            >
              🔍 Consultar Solicitações
            </button>
            <button 
              className="btn-dashboard btn-secondary"
              onClick={() => navigate('/')}
            >
              🚪 Sair do Sistema
            </button>
          </div>
        </DashboardCard>

        {/* Card de Informações Legais */}
        <DashboardCard title="Informações Legais">
          <div className="legal-info">
            <p>
              Este sistema está em conformidade com as seguintes legislações:
            </p>
            <ul>
              <li>📋 Lei nº 8.069/1990 - Estatuto da Criança e do Adolescente (ECA)</li>
              <li>🔒 Lei nº 13.709/2018 - Lei Geral de Proteção de Dados (LGPD)</li>
              <li>⚽ Lei nº 9.615/1998 - Lei Pelé (Lei do Esporte)</li>
              <li>👨‍👩‍👧 Lei nº 10.406/2002 - Código Civil (Responsabilidade Parental)</li>
            </ul>
            <p style={{ marginTop: '15px', fontSize: '0.9rem', color: '#6c757d' }}>
              Todas as autorizações são registradas digitalmente e possuem validade jurídica.
              Os dados são armazenados de forma segura e utilizados exclusivamente para 
              fins de controle de saídas e proteção dos atletas.
            </p>
          </div>
        </DashboardCard>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <img 
          src="https://imgur.com/HIsH9X5.png" 
          alt="Logo Serviço Social" 
          className="footer-logo"
        />
        <p className="footer-text">Sistema de gerenciamento de autorizações</p>
        <p className="footer-text">Departamento de Serviço Social</p>
        <p className="footer-text">Sport Club Internacional</p>
        <p className="footer-copyright">© 2025 TechVamp</p>
      </div>
    </div>
  );
}
