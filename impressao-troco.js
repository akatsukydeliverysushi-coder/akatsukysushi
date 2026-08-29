
window.AKATSUKY_PRINT_PAYMENT = function(order){
  if(!order) return '';
  const method = String(order.paymentMethod||order.payment||'');
  if(!/dinheiro|cash/i.test(method)) return '';
  const received = Number(order.cashReceived||order.valorRecebido||0);
  const change = Number(order.change||order.troco||0);
  if(!received && !change) return '';
  return '\nVALOR RECEBIDO: ' +
    received.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) +
    '\nTROCO: ' +
    change.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) + '\n';
};
