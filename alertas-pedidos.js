(() => {
'use strict';
window.addEventListener('DOMContentLoaded', () => {
  const connection = document.getElementById('connection');
  if (!connection || !window.firebase || !window.AKATSUKY_FIREBASE_CONFIG) return;

  const style = document.createElement('style');
  style.textContent = `
    .order-alerts{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 18px}
    .order-alert{min-height:78px;border:2px solid #303540;border-radius:15px;padding:14px 18px;background:linear-gradient(145deg,#151820,#0e1015);display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer}
    .order-alert.waiting{border-color:#ef1731;box-shadow:0 0 0 2px #ef173122,0 0 24px #ef173144;animation:orderAlertPulse 1.15s infinite}
    .order-alert .label{font-weight:900;font-size:13px}.order-alert .count{font-size:30px;font-weight:1000;line-height:1}
    .order-alert .sub{font-size:11px;color:#9da3b0;margin-top:4px}.order-alert.mesa .count{color:#ff4056}.order-alert.delivery .count{color:#63b8ff}
    .order-alert .dot{width:13px;height:13px;border-radius:50%;background:#666;display:inline-block;margin-right:6px;vertical-align:middle}.order-alert.waiting .dot{background:#ef1731;box-shadow:0 0 12px #ef1731}
    @keyframes orderAlertPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.012)}}
    @media(max-width:760px){.order-alerts{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const box = document.createElement('div');
  box.id = 'orderAlerts';
  box.className = 'order-alerts';
  connection.parentNode.insertBefore(box, connection.nextSibling);

  let audioCtx = null;
  let previousWaiting = new Set();
  let firstSnapshot = true;

  function unlockAudio(){
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if(audioCtx.state === 'suspended') audioCtx.resume();
    } catch(e) {}
  }
  ['click','keydown','touchstart'].forEach(ev => window.addEventListener(ev, unlockAudio, {passive:true}));

  function beep(){
    try {
      unlockAudio(); if(!audioCtx) return;
      const now = audioCtx.currentTime;
      [0,.18,.36].forEach((delay,i)=>{
        const osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
        osc.type='sine'; osc.frequency.value=i===1?880:660;
        gain.gain.setValueAtTime(.0001,now+delay);
        gain.gain.exponentialRampToValueAtTime(.18,now+delay+.02);
        gain.gain.exponentialRampToValueAtTime(.0001,now+delay+.14);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(now+delay); osc.stop(now+delay+.16);
      });
    } catch(e) {}
  }

  function render(snapshot){
    const data=snapshot.val()||{};
    const rows=Object.entries(data).filter(([,o])=>o && String(o.status||'aguardando')==='aguardando');
    const mesaRows=rows.filter(([,o])=>o && ((o.mesa!==undefined && o.mesa!==null && String(o.mesa).trim()!=='') || String(o.origem||'').toLowerCase()==='garcom'));
    const deliveryRows=rows.filter(([,o])=>!mesaRows.some(([id])=>id===Object.entries(data).find(([k,v])=>v===o)?.[0]));
    const mesa=mesaRows.length, delivery=deliveryRows.length;
    const ids=new Set(rows.map(([id])=>id));
    let newOrder=false; ids.forEach(id=>{if(previousWaiting.has(id)===false)newOrder=true});
    if(!firstSnapshot && newOrder) beep();
    firstSnapshot=false; previousWaiting=ids;
    box.innerHTML=`
      <div class="order-alert mesa ${mesa?'waiting':''}" data-type="mesa"><div><span class="dot"></span><span class="label">🍽️ PEDIDOS DE MESA / GARÇOM</span><div class="sub">${mesa?'NOVOS PEDIDOS AGUARDANDO':'Nenhum pedido de mesa aguardando'}</div></div><div class="count">${mesa}</div></div>
      <div class="order-alert delivery ${delivery?'waiting':''}" data-type="delivery"><div><span class="dot"></span><span class="label">🛵 PEDIDOS DELIVERY</span><div class="sub">${delivery?'NOVOS PEDIDOS AGUARDANDO':'Nenhum pedido delivery aguardando'}</div></div><div class="count">${delivery}</div></div>`;
  }

  box.addEventListener('click', e=>{
    const target=e.target.closest('.order-alert'); if(!target) return;
    const type=target.dataset.type;
    const cards=[...document.querySelectorAll('#orders .order')];
    cards.forEach(card=>{
      const text=card.textContent||'';
      const isMesa=/MESA\s+\d+|GARÇOM/i.test(text);
      card.style.display=type==='mesa' ? (isMesa?'':'none') : (isMesa?'none':'');
    });
    document.getElementById('orders')?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  try{
    if(!firebase.apps.length) firebase.initializeApp(window.AKATSUKY_FIREBASE_CONFIG);
    firebase.auth().onAuthStateChanged(user=>{
      if(!user) return;
      firebase.database().ref('orders').on('value',render);
    });
  }catch(e){ console.error('Alertas de pedidos:',e); }
});
})();
