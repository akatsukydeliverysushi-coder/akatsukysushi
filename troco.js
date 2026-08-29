
(function(){
  'use strict';

  function money(v){
    return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  }

  function normalize(v){
    return String(v||'').replace(/\./g,'').replace(',','.').replace(/[^\d.-]/g,'');
  }

  window.AKATSUKY_CHANGE = {
    money: money,
    normalize: normalize,
    calc: function(total, received){
      total = Number(total||0);
      received = Number(received||0);
      return Math.max(0, received-total);
    }
  };

  function findPaymentSelect(){
    const sels = Array.from(document.querySelectorAll('select'));
    return sels.find(s => /pagamento|payment|forma/i.test(s.name+' '+s.id+' '+(s.previousElementSibling?.textContent||'')));
  }

  function findTotal(){
    const candidates = Array.from(document.querySelectorAll('[data-total], #total, .total, .cart-total, .order-total'));
    for(const el of candidates){
      const n = parseFloat(normalize(el.textContent||el.value));
      if(Number.isFinite(n) && n>0) return n;
    }
    return 0;
  }

  function setup(){
    const sel = findPaymentSelect();
    if(!sel || document.getElementById('akatsuky-troco-box')) return;

    const box = document.createElement('div');
    box.id = 'akatsuky-troco-box';
    box.style.display='none';
    box.innerHTML = `
      <div style="margin-top:10px;padding:12px;border:1px solid #ddd;border-radius:10px;background:#fff">
        <label style="display:block;font-weight:700;margin-bottom:6px">💵 Valor recebido</label>
        <input id="akatsuky-valor-recebido" type="number" min="0" step="0.01"
          inputmode="decimal" placeholder="Ex.: 100,00"
          style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px">
        <div id="akatsuky-troco-display" style="margin-top:8px;font-weight:800"></div>
        <div id="akatsuky-troco-error" style="margin-top:4px;color:#b00020;font-size:13px"></div>
      </div>`;
    sel.parentNode.insertBefore(box, sel.nextSibling);

    const input=box.querySelector('#akatsuky-valor-recebido');
    const display=box.querySelector('#akatsuky-troco-display');
    const err=box.querySelector('#akatsuky-troco-error');

    function isCash(){
      return /dinheiro|cash/i.test(sel.value+' '+sel.options[sel.selectedIndex]?.text);
    }
    function update(){
      if(!isCash()){ box.style.display='none'; display.textContent=''; err.textContent=''; return; }
      box.style.display='block';
      const total=findTotal();
      const received=Number(input.value||0);
      if(received>0 && received<total){
        display.textContent='';
        err.textContent='Valor recebido é menor que o total.';
      } else {
        err.textContent='';
        const change=received>=total && received>0 ? received-total : 0;
        display.textContent='Troco: '+money(change);
      }
    }
    sel.addEventListener('change', update);
    input.addEventListener('input', update);
    update();

    window.AKATSUKY_GET_CASH_CHANGE = function(){
      if(!isCash()) return {paymentMethod:sel.value||'', received:0, change:0};
      const total=findTotal(), received=Number(input.value||0);
      return {paymentMethod:sel.value||'dinheiro', received, change:Math.max(0,received-total)};
    };
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
