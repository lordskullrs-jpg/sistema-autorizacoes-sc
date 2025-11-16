import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Solicitar from './pages/Solicitar';
import Consultar from './pages/Consultar';
import Dashboard from './pages/Dashboard';
import AprovacaoPais from './pages/AprovacaoPais';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota principal redireciona para login */}
          <Route path="/" element={<Login />} />
          
          {/* Rotas Públicas */}
          <Route path="/solicitar" element={<Solicitar />} />
          <Route path="/consultar" element={<Consultar />} />
          <Route path="/aprovacao-pais/:token" element={<AprovacaoPais />} />
          
          {/* Rotas Autenticadas (Staff) */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Rota 404 - redireciona para login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
