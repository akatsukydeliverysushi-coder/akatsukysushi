(() => {
'use strict';
window.addEventListener('DOMContentLoaded',()=>{
  if(!window.firebase||!window.AKATSUKY_FIREBASE_CONFIG)return;
  let audioCtx=null,previous=new Set(),first=true;
  const mesaBox=document.getElementById('mesa'),deliveryBox=document.getElementById('delivery');
  const frame=document.querySelector('iframe');
  if(!mesaBox||!deliveryBox)return;

  function unlock(){try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;audioCtx=audioCtx||new Ctx();if(audioCtx.state==='suspended')audioCtx.resume()}catch(e){}}
  ['click','keydown','touchstart'].forEach(e=>window.addEventListener(e,unlock,{passive:true}));
  function beep(){try{unlock();if(!audioCtx)return;const n=audioCtx.currentTime;[0,.18,.36].forEach((d,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=i===1?880:660;g.gain.setValueAtTime(.0001,n+d);g.gain.exponentialRampToValueAtTime(.22,n+d+.02);g.gain.exponentialRampToValueAtTime(.0001,n+d+.15);o.connect(g);g.connect(audioCtx.destination);o.start(n+d);o.stop(n+d+.17)})}catch(e){}}

  function filter(type){try{const doc=frame?.contentDocument;if(!doc)return;const filterEl=doc.getElementById('filter');if(filterEl){filterEl.value=type==='aguardando'?'aguardando':'todos';filterEl.dispatchEvent(new Event('change'))}doc.getElementById('orders')?.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){}}

  function hideDeliveryFromMain(){
    try{
      const doc=frame?.contentDocument;if(!doc)return;
      const filterEl=doc.getElementById('filter');
      const showDelivery=filterEl&&filterEl.value==='saiu para entrega';
      doc.querySelectorAll('#orders .order').forEach(card=>{
        const status=(card.querySelector('.status')?.textContent||'').toLowerCase();
        const isDelivery=status.includes('saiu para entrega');
        card.style.display=(!showDelivery&&isDelivery)?'none':'';
      });
    }catch(e){}
  }

  function render(s){
    const data=s.val()||{};
    const rows=Object.entries(data).filter(([,o])=>o&&String(o.status||'aguardando').toLowerCase()==='aguardando');
    const mesas=rows.filter(([,o])=>o&&((o.mesa!==undefined&&o.mesa!==null&&String(o.mesa).trim()!=='')||String(o.origem||'').toLowerCase().includes('garcom')));
    const delivery=rows.filter(([id])=>!mesas.some(([mid])=>mid===id));
    const ids=new Set(rows.map(([id])=>id));let novo=false;ids.forEach(id=>{if(!previous.has(id))novo=true});
    if(!first&&novo)beep();
    first=false;previous=ids;
    mesaBox.classList.toggle('wait',mesas.length>0);deliveryBox.classList.toggle('wait',delivery.length>0);
    mesaBox.querySelector('.n').textContent=mesas.length;deliveryBox.querySelector('.n').textContent=delivery.length;
    mesaBox.querySelector('small').textContent=mesas.length?'🔔 NOVO PEDIDO — ACEITE NO PAINEL':'Nenhum pedido de mesa aguardando';
    deliveryBox.querySelector('small').textContent=delivery.length?'🔔 NOVO PEDIDO — ACEITE NO PAINEL':'Nenhum pedido delivery aguardando';
    mesaBox.querySelector('b').textContent=mesas.length?'🍽️ NOVO PEDIDO DE MESA / GARÇOM':'🍽️ PEDIDOS DE MESA / GARÇOM';
    deliveryBox.querySelector('b').textContent=delivery.length?'🛵 NOVO PEDIDO DELIVERY':'🛵 PEDIDOS DELIVERY';
    hideDeliveryFromMain();
  }

  try{
    if(!firebase.apps.length)firebase.initializeApp(window.AKATSUKY_FIREBASE_CONFIG);
    firebase.auth().onAuthStateChanged(u=>{if(u)firebase.database().ref('orders').on('value',render)});
  }catch(e){console.error('Alertas:',e)}

  mesaBox.onclick=()=>filter('aguardando');
  deliveryBox.onclick=()=>filter('aguardando');
  frame?.addEventListener('load',()=>{
    hideDeliveryFromMain();
    try{frame.contentDocument?.getElementById('filter')?.addEventListener('change',hideDeliveryFromMain)}catch(e){}
  });
  setInterval(hideDeliveryFromMain,1000);
});
})();
