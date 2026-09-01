(() => {
'use strict';
window.addEventListener('DOMContentLoaded', () => {
  let db=null, auth=null, previousPending=new Set(), firstSnapshot=true, soundTimer=null, waitingCount=0, audioCtx=null;
  const doc=document;
  function unlockAudio(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;audioCtx=audioCtx||new C();if(audioCtx.state==='suspended')audioCtx.resume()}catch(_) {}}
  ['click','keydown','pointerdown','touchstart'].forEach(e=>window.addEventListener(e,unlockAudio,{passive:true}));
  function sound(){try{unlockAudio();if(!audioCtx)return;const t=audioCtx.currentTime;[0,.18,.36].forEach((d,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=i===1?1046:880;g.gain.setValueAtTime(.0001,t+d);g.gain.exponentialRampToValueAtTime(.22,t+d+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d+.15);o.connect(g);g.connect(audioCtx.destination);o.start(t+d);o.stop(t+d+.17)})}catch(_) {}}
  function stopLoop(){if(soundTimer){clearInterval(soundTimer);soundTimer=null}}
  function updateLoop(n){waitingCount=n;if(n>0&&!soundTimer)soundTimer=setInterval(()=>waitingCount?sound():stopLoop(),5000);if(!n)stopLoop()}
  function status(o){return String(o?.status||'').trim().toLowerCase()}
  function pending(o){const s=status(o);return s==='aguardando'||s==='recebido'||s==='novo'||s==='pending'}
  function accepted(o){const s=status(o);return s==='preparando'||s==='em preparo'||s==='saiu para entrega'||s==='entregue'||s==='cancelado'}
  function mesa(o){const m=o?.mesa??o?.table??o?.numeroMesa??o?.tableNumber??o?.mesaNumero;const x=String(o?.origem??o?.source??o?.tipo??o?.type??o?.orderType??'').toLowerCase();return String(m??'').trim()!==''||x.includes('mesa')||x.includes('garcom')||x.includes('garçom')}
  function install(){if(doc.getElementById('akPendingStyle'))return;const s=doc.createElement('style');s.id='akPendingStyle';s.textContent=`
    body.new-order-alert,body.new-order-flash{animation:none!important}
    .ak-pending-order{border:3px solid #ef1731!important;animation:akPending .7s infinite!important;box-shadow:0 0 0 2px #ef173155,0 0 22px #ef173188!important}
    @keyframes akPending{0%,100%{border-color:#ef1731;box-shadow:0 0 0 2px #ef173155,0 0 12px #ef173166}50%{border-color:#ff7180;box-shadow:0 0 0 6px #ef173199,0 0 30px #ef1731dd}}
    #akatsukyPendingAlerts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
    .akPendingBox{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border:2px solid #343844;border-radius:11px;background:#11141a;color:#fff;cursor:pointer}
    .akPendingBox b{display:block;font-size:11px}.akPendingBox small{display:block;color:#9da3b0;font-size:9px;margin-top:3px}.akPendingBox strong{min-width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#292e38;font-size:17px}.akPendingBox.active{border-color:#ef1731;background:#260a10;animation:akBox .8s infinite}.akPendingBox.active strong{background:#ef1731}@keyframes akBox{50%{box-shadow:0 0 18px #ef173188}}
  `;doc.head.appendChild(s)}
  function host(){let h=doc.getElementById('akatsukyPendingAlerts');if(h)return h;h=doc.createElement('div');h.id='akatsukyPendingAlerts';h.innerHTML='<div id="akMesaPending" class="akPendingBox"><div><b>🍽️ PEDIDOS DE MESA</b><small>Nenhum pedido pendente</small></div><strong>0</strong></div><div id="akDeliveryPending" class="akPendingBox"><div><b>🛵 PEDIDOS DELIVERY</b><small>Nenhum pedido pendente</small></div><strong>0</strong></div>';const target=doc.querySelector('.toolbar')||doc.querySelector('#orders')?.parentElement||doc.querySelector('.wrap');if(target)target.parentElement.insertBefore(h,target);h.querySelectorAll('.akPendingBox').forEach(x=>x.onclick=()=>{const f=doc.getElementById('filter');if(f){f.value='todos';f.dispatchEvent(new Event('change',{bubbles:true}))}doc.getElementById('orders')?.scrollIntoView({behavior:'smooth'})});return h}
  function cards(data,pendingIds){doc.querySelectorAll('.order').forEach(card=>{const id=card.getAttribute('data-order-id')||card.dataset.orderId;if(id)card.classList.toggle('ak-pending-order',pendingIds.has(id));});}
  function render(data){install();const h=host();const rows=Object.entries(data||{}).filter(([,o])=>o&&pending(o));const ids=new Set(rows.map(([id])=>id));cards(data,ids);let fresh=false;ids.forEach(id=>{if(!firstSnapshot&&!previousPending.has(id))fresh=true});if(fresh)sound();firstSnapshot=false;previousPending=ids;updateLoop(ids.size);const m=rows.filter(([,o])=>mesa(o)).length,d=rows.length-m;const mb=h.querySelector('#akMesaPending'),dbx=h.querySelector('#akDeliveryPending');mb.querySelector('strong').textContent=m;dbx.querySelector('strong').textContent=d;mb.classList.toggle('active',m>0);dbx.classList.toggle('active',d>0);mb.querySelector('small').textContent=m?'⚠️ AGUARDANDO ACEITE':'Nenhum pedido pendente';dbx.querySelector('small').textContent=d?'⚠️ AGUARDANDO ACEITE':'Nenhum pedido pendente'}
  function start(){try{if(!window.firebase||!firebase.database)return setTimeout(start,500);db=firebase.database();auth=firebase.auth();auth.onAuthStateChanged(u=>{if(!u){stopLoop();return}db.ref('orders').on('value',s=>render(s.val()||{}),()=>{})})}catch(_){setTimeout(start,700)}}
  install();host();start();
});
})();
