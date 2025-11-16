import { Link } from 'react-router-dom';
import Card from '../components/Card';

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #cc0d2e 0%, #a00a25 100%)', 
      padding: '2rem' 
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', color: 'white', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔴 SC Internacional</h1>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'normal' }}>Sistema de Autorizações de Saída</h2>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem' 
        }}>
          <Card>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>Nova Solicitação</h3>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                Atleta: solicite autorização de saída
              </p>
              <Link 
                to="/solicitar" 
                className="btn btn-primary" 
                style={{ 
                  width: '100%', 
                  display: 'block', 
                  textAlign: 'center', 
                  textDecoration: 'none',
                  padding: '0.75rem'
                }}
              >
                Criar Solicitação
              </Link>
            </div>
          </Card>

          <Card>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>Consultar Status</h3>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                Consulte sua solicitação por código
              </p>
              <Link 
                to="/consultar" 
                className="btn btn-secondary" 
                style={{ 
                  width: '100%', 
                  display: 'block', 
                  textAlign: 'center', 
                  textDecoration: 'none',
                  padding: '0.75rem'
                }}
              >
                Consultar
              </Link>
            </div>
          </Card>

          <Card>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍💼</div>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>Acesso Staff</h3>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                Login para supervisores e equipe
              </p>
              <Link 
                to="/login" 
                className="btn btn-secondary" 
                style={{ 
                  width: '100%', 
                  display: 'block', 
                  textAlign: 'center', 
                  textDecoration: 'none',
                  padding: '0.75rem'
                }}
              >
                Fazer Login
              </Link>
            </div>
          </Card>
        </div>

        <div style={{ 
          marginTop: '3rem', 
          textAlign: 'center', 
          color: 'white', 
          opacity: 0.8 
        }}>
          <p>Sistema de Autorizações v2.0</p>
        </div>
      </div>
    </div>
  );
}
