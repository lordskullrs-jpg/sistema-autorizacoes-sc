import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Solicitar from './pages/Solicitar';
import Consultar from './pages/Consultar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AprovacaoPais from './pages/AprovacaoPais';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/solicitar" element={<Solicitar />} />
          <Route path="/consultar" element={<Consultar />} />
          <Route path="/aprovacao-pais/:token" element={<AprovacaoPais />} />
          
          {/* Rotas Autenticadas (Staff) */}
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
