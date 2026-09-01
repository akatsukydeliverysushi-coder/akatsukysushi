(() => {
'use strict';
window.addEventListener('DOMContentLoaded', () => {
  const frame = document.querySelector('iframe');
  if (!frame) return;

  let previousWaiting = new Set();
  let firstSnapshot = true;
  let db = null;
  let auth = null;
  let audioCtx = null;
  let alertSoundTimer = null;
  let waitingCount = 0;

  function unlockAudio() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = audioCtx || new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (_) {}
  }
  ['click','keydown','touchstart'].forEach(type => window.addEventListener(type, unlockAudio, {passive:true}));

  function sound() {
    try {
      unlockAudio();
      if (!audioCtx) return;
      const t = audioCtx.currentTime;
      [0,.18,.36].forEach((delay,i) => {
        const osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
        osc.type='sine'; osc.frequency.value=i===1?880:660;
        gain.gain.setValueAtTime(.0001,t+delay);
        gain.gain.exponentialRampToValueAtTime(.25,t+delay+.02);
        gain.gain.exponentialRampToValueAtTime(.0001,t+delay+.16);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(t+delay); osc.stop(t+delay+.18);
      });
    } catch (_) {}
  }

  function updateSoundLoop(count) {
    waitingCount = Number(count || 0);
    if (waitingCount > 0) {
      if (!alertSoundTimer) {
        alertSoundTimer = setInterval(() => {
          if (waitingCount > 0) sound();
          else stopSoundLoop();
        }, 5000);
      }
    } else {
      stopSoundLoop();
    }
  }

  function stopSoundLoop() {
    if (alertSoundTimer) {
      clearInterval(alertSoundTimer);
      alertSoundTimer = null;
    }
  }

  function getDoc(){try{return frame.contentDocument||frame.contentWindow.document}catch(_){return null}}

  function ensureAlerts() {
    const doc=getDoc();
    if(!doc) return null;
    let box=doc.getElementById('akatsukyOrderAlerts');
    if(box) return box;
    const logout=doc.getElementById('logout');
    if(!logout) return null;
    box=doc.createElement('div');
    box.id='akatsukyOrderAlerts';
    box.innerHTML=`
      <div id="akMesa" class="akAlert akMesa"><div><b>🍽️ PEDIDOS DE MESA</b><small>Nenhum pedido aguardando</small></div><span>0</span></div>
      <div id="akDelivery" class="akAlert akDelivery"><div><b>🛵 PEDIDOS DELIVERY</b><small>Nenhum pedido aguardando</small></div><span>0</span></div>`;
    const style=doc.createElement('style');
    style.id='akatsukyOrderAlertsStyle';
    style.textContent=`
      #akatsukyOrderAlerts{display:grid;gap:7px;margin-top:8px}
      .akAlert{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 8px;border:1px solid #303540;border-radius:10px;background:#11141a;color:#fff;cursor:pointer;box-shadow:0 4px 14px #0004}
      .akAlert b{display:block;font-size:10px;line-height:1.2}
      .akAlert small{display:block;color:#9da3b0;font-size:9px;margin-top:3px}
      .akAlert>span{min-width:29px;height:29px;padding:0 6px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#292e38;font-size:15px;font-weight:900}
      .akAlert.wait{border-color:#ef1731;background:#250a10;animation:akPulse .8s infinite}
      .akAlert.wait>span{background:#ef1731;color:#fff;animation:akNumberPulse .8s infinite}
      @keyframes akPulse{50%{transform:scale(1.025);box-shadow:0 0 22px #ef173188}}
      @keyframes akNumberPulse{50%{transform:scale(1.12)}}
    `;
    doc.head.appendChild(style);
    logout.parentElement?.appendChild(box);
    const open=()=>{
      const f=doc.getElementById('filter');
      if(f){f.value='todos';f.dispatchEvent(new Event('change',{bubbles:true}))}
      doc.getElementById('orders')?.scrollIntoView({behavior:'smooth',block:'start'});
    };
    box.querySelector('#akMesa').onclick=open;
    box.querySelector('#akDelivery').onclick=open;
    return box;
  }

  // Somente pedidos realmente aguardando aceite geram contador e alerta.
  // 'recebido' significa que o pedido já foi aceito e não deve mais alertar.
  function isWaiting(order) {
    const s=String(order?.status||'').trim().toLowerCase();
    return s==='aguardando'||s==='novo'||s==='pending';
  }

  function isMesa(order) {
    const mesa=String(order?.mesa??order?.table??order?.numeroMesa??order?.tableNumber??'').trim();
    const origin=String(order?.origem??order?.source??order?.tipo??order?.type??'').toLowerCase();
    return !!mesa || origin.includes('garcom') || origin.includes('garçom') || origin.includes('mesa');
  }

  function render(snapshot) {
    const box=ensureAlerts();
    if(!box) return;
    const data=snapshot.val()||{};
    const waiting=Object.entries(data).filter(([,o])=>o&&isWaiting(o));
    const mesaRows=waiting.filter(([,o])=>isMesa(o));
    const deliveryRows=waiting.filter(([id])=>!mesaRows.some(([mid])=>mid===id));
    const ids=new Set(waiting.map(([id])=>id));
    let newOrder=false;
    ids.forEach(id=>{if(previousWaiting.size&&!previousWaiting.has(id))newOrder=true});
    if(!firstSnapshot&&newOrder)sound();
    firstSnapshot=false;
    previousWaiting=ids;
    updateSoundLoop(waiting.length);

    const mesa=box.querySelector('#akMesa'), delivery=box.querySelector('#akDelivery');
    mesa.classList.toggle('wait',mesaRows.length>0);
    delivery.classList.toggle('wait',deliveryRows.length>0);
    mesa.querySelector('span').textContent=mesaRows.length;
    delivery.querySelector('span').textContent=deliveryRows.length;
    mesa.querySelector('b').textContent=mesaRows.length?'🔴 NOVO PEDIDO DE MESA':'🍽️ PEDIDOS DE MESA';
    delivery.querySelector('b').textContent=deliveryRows.length?'🔴 NOVO PEDIDO DELIVERY':'🛵 PEDIDOS DELIVERY';
    mesa.querySelector('small').textContent=mesaRows.length?'⚠️ AGUARDANDO ACEITE • ALERTA ATIVO':'Nenhum pedido aguardando';
    delivery.querySelector('small').textContent=deliveryRows.length?'⚠️ AGUARDANDO ACEITE • ALERTA ATIVO':'Nenhum pedido aguardando';
  }

  function startFromIframe() {
    try {
      const win=frame.contentWindow;
      if(!win||!win.firebase) return setTimeout(startFromIframe,300);
      auth=win.firebase.auth();
      db=win.firebase.database();
      ensureAlerts();
      auth.onAuthStateChanged(user=>{
        if(!user){stopSoundLoop();waitingCount=0;return;}
        db.ref('orders').off('value',render);
        db.ref('orders').on('value',render,err=>console.error('Akatsuky alertas:',err));
      });
    } catch(e) { console.error('Akatsuky alertas:',e); setTimeout(startFromIframe,500); }
  }

  frame.addEventListener('load',()=>{
    setTimeout(()=>{
      ensureAlerts();
      startFromIframe();
    },100);
  });
  setTimeout(()=>{ensureAlerts();startFromIframe()},500);
});
})();
