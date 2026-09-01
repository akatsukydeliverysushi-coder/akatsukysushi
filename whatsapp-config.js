/*
 * Akatsuky Delivery Sushi - WhatsApp
 * Configuração preparada para futura integração com a WhatsApp Cloud API.
 *
 * IMPORTANTE: não coloque tokens, segredos ou credenciais da Meta neste arquivo.
 * Este arquivo é público (GitHub Pages). As credenciais deverão ficar em um
 * backend/Cloud Function quando a integração for ativada.
 */
window.AKATSUKY_WHATSAPP_CONFIG = Object.freeze({
  enabled: false,
  provider: 'meta-cloud-api',
  apiBaseUrl: '',
  phoneNumberId: '',
  businessAccountId: '',
  messages: {
    recebido: true,
    preparando: true,
    saiuParaEntrega: true,
    entregue: true,
    cancelado: true
  }
});
