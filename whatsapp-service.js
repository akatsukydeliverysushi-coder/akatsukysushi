/*
 * Akatsuky Delivery Sushi - serviço WhatsApp
 *
 * Modo atual: DESATIVADO.
 * O frontend apenas prepara o evento; nenhuma chamada externa é feita enquanto
 * AKATSUKY_WHATSAPP_CONFIG.enabled === false ou apiBaseUrl estiver vazio.
 *
 * Futuro fluxo recomendado:
 * cliente/admin -> backend seguro -> WhatsApp Cloud API.
 * Nunca colocar User Access Token/segredo da Meta no JavaScript público.
 */
(() => {
  'use strict';

  const STATUS = Object.freeze({
    recebido: 'recebido',
    preparando: 'preparando',
    saiuParaEntrega: 'saiu_para_entrega',
    entregue: 'entregue',
    cancelado: 'cancelado'
  });

  const DEFAULT_MESSAGES = Object.freeze({
    recebido: '🍣 Akatsuky Delivery Sushi\nOlá, {{nome}}! Recebemos seu pedido #{{pedido}}.\n💰 Total: {{total}}\nSeu pedido aguarda confirmação do restaurante.',
    preparando: '👨‍🍳 Akatsuky Delivery Sushi\nSeu pedido #{{pedido}} foi aceito e já está sendo preparado!',
    saiuParaEntrega: '🛵 Akatsuky Delivery Sushi\nSeu pedido #{{pedido}} saiu para entrega!',
    entregue: '✅ Akatsuky Delivery Sushi\nSeu pedido #{{pedido}} foi entregue.\nObrigado por pedir conosco! ❤️',
    cancelado: '❌ Akatsuky Delivery Sushi\nSeu pedido #{{pedido}} foi cancelado. {{motivo}}'
  });

  function config() {
    return window.AKATSUKY_WHATSAPP_CONFIG || { enabled: false, apiBaseUrl: '' };
  }

  function normalizePhone(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function fill(template, data) {
    return String(template || '').replace(/\{\{(\w+)\}\}/g, (_, key) => String(data?.[key] ?? ''));
  }

  function buildMessage(status, orderId, order) {
    const c = order?.customer || {};
    const template = DEFAULT_MESSAGES[status] || '';
    return fill(template, {
      nome: c.name || 'cliente',
      pedido: String(orderId || '').slice(-6),
      total: Number(order?.total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      motivo: order?.cancelReason || ''
    });
  }

  async function notifyOrderStatus(status, orderId, order) {
    const cfg = config();
    const phone = normalizePhone(order?.customer?.phone);

    const event = {
      status,
      orderId: String(orderId || ''),
      phone,
      message: buildMessage(status, orderId, order),
      createdAt: Date.now()
    };

    // Segurança: enquanto não houver backend configurado, não envia nada.
    if (!cfg.enabled || !cfg.apiBaseUrl || !phone) {
      return { sent: false, disabled: true, event };
    }

    // Backend futuro: o token da Meta ficará no servidor, nunca aqui.
    const response = await fetch(cfg.apiBaseUrl.replace(/\/$/, '') + '/whatsapp/order-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error(`WhatsApp backend HTTP ${response.status}`);
    }

    return { sent: true, disabled: false, data: await response.json().catch(() => ({})) };
  }

  window.AkatsukyWhatsApp = Object.freeze({
    STATUS,
    buildMessage,
    notifyOrderStatus,
    isEnabled: () => Boolean(config().enabled && config().apiBaseUrl)
  });
})();
