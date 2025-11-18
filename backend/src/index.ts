// Backend Principal
// Sistema de Autorizações de Saída - SC Internacional

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';

// Importar rotas
import auth from './routes/auth';
import solicitacoes from './routes/solicitacoes';
import aprovacao from './routes/aprovacao';
import publico from './routes/publico';
import atleta from './routes/atleta';
import admin from './routes/admin';
import resetPassword from './routes/reset-password';
import { authMiddleware } from './middleware/auth';

// Criar aplicação Hono
const app = new Hono<{ Bindings: Env }>();

// Configurar CORS
app.use('/*', cors({
  origin: [
    'https://sistema-autorizacoes-sc.pages.dev',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// Rota de health check
app.get('/', (c) => {
  return c.json({
    name: 'Sistema de Autorizações de Saída - SC Internacional',
    version: '2.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

// Rota de health check da API
app.get('/api-status', (c) => {
  return c.json({
    message: 'API de Autorizações - SC Internacional',
    version: '2.0.0',
    endpoints: {
      publico: '/api/publico (consulta sem auth)',
      auth: '/api/auth (login)',
      atleta: '/api/atleta (atletas autenticados)',
      solicitacoes: '/api/solicitacoes (staff)',
      aprovacao: '/api/aprovacao-pais (pais)',
      admin: '/api/admin (administradores)',
      resetPassword: '/api/reset-password (redefinição de senha)',
    },
  });
});

// Registrar rotas
app.route('/api/publico', publico);  // Rotas públicas (consulta)
app.route('/api/auth', auth);       // Autenticação

// Aplicar middleware de autenticação nas rotas protegidas de atletas
app.use('/api/atleta/*', authMiddleware);
app.route('/api/atleta', atleta);    // Rotas protegidas de atletas (requer auth)

// Aplicar middleware de autenticação nas rotas de solicitações
app.use('/api/solicitacoes/*', authMiddleware);
app.route('/api/solicitacoes', solicitacoes);  // Solicitações (staff)

app.route('/api/aprovacao-pais', aprovacao);  // Aprovação pais

// Rotas de admin (requer auth de admin)
app.use('/api/admin/*', authMiddleware);
app.route('/api/admin', admin);

// Rotas de redefinição de senha (públicas)
app.route('/api/reset-password', resetPassword);

// Exportar aplicação
export default app;
