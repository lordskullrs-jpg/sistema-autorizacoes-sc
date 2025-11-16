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

// Criar aplicação Hono
const app = new Hono<{ Bindings: Env }>();

// Configurar CORS
app.use('/*', cors({
  origin: '*', // Em produção, especificar domínio do frontend
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
app.get('/api', (c) => {
  return c.json({
    message: 'API de Autorizações - SC Internacional',
    version: '2.0.0',
    endpoints: {
      publico: '/api/publico (sem autenticação)',
      auth: '/api/auth (login staff)',
      solicitacoes: '/api/solicitacoes (staff)',
      aprovacao: '/api/aprovacao (pais)',
    },
  });
});

// Registrar rotas
app.route('/api/publico', publico);  // Rotas públicas (atletas)
app.route('/api/auth', auth);        // Autenticação (staff)
app.route('/api/solicitacoes', solicitacoes);  // Solicitações (staff)
app.route('/api/aprovacao', aprovacao);  // Aprovação pais

// Exportar aplicação
export default app;
