(() => {
'use strict';
window.addEventListener('DOMContentLoaded', () => {
  let db=null, auth=null, previousWaiting=new Set(), firstSnapshot=true, soundTimer=null, waitingCount=0, audioCtx=null;

  const doc=document;
  const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

  function unlockAudio(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;audioCtx=audioCtx||new C();if(audioCtx.state==='suspended')audioCtx.resume()}catch(_){}}
  ['click','keydown','pointerdown','touchstart'].forEach(e=>window.addEventListener(e,unlockAudio,{passive:true}));
  function sound(){try{unlockAudio();if(!audioCtx)return;const t=audioCtx.currentTime;[0,.18,.36].forEach((d,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=i===1?1046:880;g.gain.setValueAtTime(.0001,t+d);g.gain.exponentialRampToValueAtTime(.22,t+d+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d+.15);o.connect(g);g.connect(audioCtx.destination);o.start(t+d);o.stop(t+d+.17)})}catch(_){}}

  function stopLoop(){if(soundTimer){clearInterval(soundTimer);soundTimer=null}}
  function updateLoop(n){waitingCount=n;if(n>0&&!soundTimer)soundTimer=setInterval(()=>waitingCount?sound():stopLoop(),5000);if(!n)stopLoop()}

  function isWaiting(o){const s=String(o?.status||'').trim().toLowerCase();return s==='aguardando'||s==='novo'||s==='pending'}
  function isMesa(o){
    const mesa=o?.mesa??o?.table??o?.numeroMesa??o?.tableNumber??o?.mesaNumero??o?.tableNumber;
    const origem=String(o?.origem??o?.source??o?.tipo??o?.type??o?.orderType??'').toLowerCase();
    return String(mesa??'').trim()!==''||origem.includes('mesa')||origem.includes('garcom')||origem.includes('garçom');
  }

  function installCss(){
    if(doc.getElementById('akatsukyPendingCss'))return;
    const s=doc.createElement('style');s.id='akatsukyPendingCss';
    s.textContent=`
      /* Somente o pedido pendente pisca. O bloco PEDIDOS HOJE nunca pisca. */
      body.new-order-alert,body.new-order-flash{animation:none!important}
      .new-order-alert .stat.red:first-child,.new-order-flash .stat.red:first-child,.new-order-flash .top{animation:none!important;transform:none!important;box-shadow:none!important}
      .order.ak-pending-order{border:3px solid #ef1731!important;box-shadow:0 0 0 2px #ef173155,0 0 22px #ef173188!important;animation:akPendingBorder .75s infinite!important}
      .order.ak-pending-order .status{border-color:#ef1731!important;background:#5a0712!important;color:#fff!important}
      @keyframes akPendingBorder{0%,100%{border-color:#ef1731;box-shadow:0 0 0 2px #ef173155,0 0 12px #ef173166}50%{border-color:#ff7180;box-shadow:0 0 0 5px #ef173199,0 0 32px #ef1731dd}}
      #akatsukyPendingAlerts{display:grid;gap:8px;margin:10px 0}
      .akPendingBox{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid #343844;border-radius:11px;background:#11141a;color:#fff;cursor:pointer}
      .akPendingBox b{display:block;font-size:11px}.akPendingBox small{display:block;color:#9da3b0;font-size:9px;margin-top:3px}
      .akPendingBox strong{display:flex;align-items:center;justify-content:center;min-width:32px;height:32px;border-radius:50%;background:#292e38;font-size:16px}
      .akPendingBox.active{border-color:#ef1731;background:#260a10;animation:akBoxPulse .8s infinite}.akPendingBox.active strong{background:#ef1731}
      @keyframes akBoxPulse{50%{box-shadow:0 0 18px #ef173188}}
    `;doc.head.appendChild(s);
  }

  function getAlertHost(){
    let host=doc.getElementById('akatsukyPendingAlerts');if(host)return host;
    host=doc.createElement('div');host.id='akatsukyPendingAlerts';
    host.innerHTML='<div id="akMesaPending" class="akPendingBox"><div><b>🍽️ PEDIDOS DE MESA</b><small>Nenhum pedido aguardando aceite</small></div><strong>0</strong></div><div id="akDeliveryPending" class="akPendingBox"><div><b>🛵 PEDIDOS DELIVERY</b><small>Nenhum pedido aguardando aceite</small></div><strong>0</strong></div>';
    const target=doc.querySelector('.toolbar')||doc.querySelector('#orders')?.parentElement||doc.querySelector('.dashboardGrid');
    if(target)target.parentElement.insertBefore(host,target);
    else doc.querySelector('.wrap')?.prepend(host);
    const open=()=>{const f=doc.getElementById('filter');if(f){f.value='todos';f.dispatchEvent(new Event('change',{bubbles:true}))}const d=doc.getElementById('dateFilter');if(d){d.value='all';d.dispatchEvent(new Event('change',{bubbles:true}))}doc.getElementById('orders')?.scrollIntoView({behavior:'smooth',block:'start'})};
    host.querySelectorAll('.akPendingBox').forEach(x=>x.addEventListener('click',open));
    return host;
  }

  function clearWrongGlobalFlash(){
    doc.body.classList.remove('new-order-alert','new-order-flash');
    // painel.js pode recolocar as classes; removemos continuamente sem interferir nos cards.
    if(!clearWrongGlobalFlash.started){clearWrongGlobalFlash.started=true;setInterval(()=>doc.body.classList.remove('new-order-alert','new-order-flash'),200)}
  }

  function markCards(data){
    const pending=new Set(Object.entries(data).filter(([,o])=>o&&isWaiting(o)).map(([id])=>id));
    doc.querySelectorAll('.order[data-order-id]').forEach(card=>{
      const id=card.getAttribute('data-order-id');
      card.classList.toggle('ak-pending-order',pending.has(id));
    });
    return pending;
  }

  function render(data){
    installCss();clearWrongGlobalFlash();const host=getAlertHost();if(!host)return;
    const waiting=Object.entries(data).filter(([,o])=>o&&isWaiting(o));
    const mesa=waiting.filter(([,o])=>isMesa(o));const delivery=waiting.filter(([,o])=>!isMesa(o));
    const ids=markCards(data);
    let fresh=false;ids.forEach(id=>{if(!firstSnapshot&&!previousWaiting.has(id))fresh=true});
    if(fresh)sound();
    firstSnapshot=false;previousWaiting=ids;updateLoop(waiting.length);
    const mb=host.querySelector('#akMesaPending'),dbx=host.querySelector('#akDeliveryPending');
    mb.classList.toggle('active',mesa.length>0);dbx.classList.toggle('active',delivery.length>0);
    mb.querySelector('strong').textContent=mesa.length;dbx.querySelector('strong').textContent=delivery.length;
    mb.querySelector('small').textContent=mesa.length?'⚠️ AGUARDANDO ACEITE':'Nenhum pedido aguardando aceite';
    dbx.querySelector('small').textContent=delivery.length?'⚠️ AGUARDANDO ACEITE':'Nenhum pedido aguardando aceite';
  }

  function refreshCards(){
    if(!db)return;db.ref('orders').once('value').then(s=>render(s.val()||{})).catch(()=>{});
  }

  function start(){
    try{
      if(!window.firebase||!firebase.database)return setTimeout(start,500);
      db=firebase.database();auth=firebase.auth();
      auth.onAuthStateChanged(u=>{
        if(!u){stopLoop();return}
        db.ref('orders').on('value',s=>render(s.val()||{}),()=>{});
        setInterval(refreshCards,1200);
      });
    }catch(e){setTimeout(start,700)}
  }

  installCss();getAlertHost();start();
});
})();
