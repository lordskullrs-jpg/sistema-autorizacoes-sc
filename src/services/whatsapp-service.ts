// Serviço de Integração com WhatsApp

import { gerarLinkWhatsApp } from '../utils';

export class WhatsAppService {
  /**
   * Gera link do WhatsApp para enviar mensagem de aprovação aos pais
   */
  gerarLinkAprovacao(
    telefone: string,
    nomeAtleta: string,
    token: string,
    baseUrl: string
  ): string {
    const linkAprovacao = `${baseUrl}/aprovacao/${token}`;
    
    const mensagem = `
🔴 *SC Internacional - Autorização de Saída*

Olá! O atleta *${nomeAtleta}* solicitou autorização de saída do alojamento.

Para aprovar ou reprovar esta solicitação, acesse o link abaixo:

${linkAprovacao}

⚠️ Este link é válido por 30 dias.

_Mensagem automática do Sistema de Autorizações - SC Internacional_
    `.trim();

    return gerarLinkWhatsApp(telefone, mensagem);
  }

  /**
   * Gera link do WhatsApp para notificar aprovação
   */
  gerarLinkNotificacaoAprovacao(
    telefone: string,
    nomeAtleta: string,
    dataSaida: string,
    horarioSaida: string
  ): string {
    const mensagem = `
✅ *SC Internacional - Autorização Aprovada*

A autorização de saída do atleta *${nomeAtleta}* foi aprovada!

📅 Data de saída: ${dataSaida}
🕐 Horário: ${horarioSaida}

_Mensagem automática do Sistema de Autorizações - SC Internacional_
    `.trim();

    return gerarLinkWhatsApp(telefone, mensagem);
  }

  /**
   * Gera link do WhatsApp para notificar reprovação
   */
  gerarLinkNotificacaoReprovacao(
    telefone: string,
    nomeAtleta: string,
    motivo?: string
  ): string {
    const mensagem = `
❌ *SC Internacional - Autorização Reprovada*

A autorização de saída do atleta *${nomeAtleta}* foi reprovada.

${motivo ? `Motivo: ${motivo}` : ''}

_Mensagem automática do Sistema de Autorizações - SC Internacional_
    `.trim();

    return gerarLinkWhatsApp(telefone, mensagem);
  }

  /**
   * Gera link do WhatsApp para lembrete de retorno
   */
  gerarLinkLembreteRetorno(
    telefone: string,
    nomeAtleta: string,
    dataRetorno: string,
    horarioRetorno: string
  ): string {
    const mensagem = `
⏰ *SC Internacional - Lembrete de Retorno*

Lembrete: O atleta *${nomeAtleta}* deve retornar ao alojamento.

📅 Data de retorno: ${dataRetorno}
🕐 Horário: ${horarioRetorno}

_Mensagem automática do Sistema de Autorizações - SC Internacional_
    `.trim();

    return gerarLinkWhatsApp(telefone, mensagem);
  }
}
