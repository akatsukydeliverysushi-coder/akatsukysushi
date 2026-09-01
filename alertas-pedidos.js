(() => {
'use strict';
window.addEventListener('DOMContentLoaded',()=>{
  if(!window.firebase||!window.AKATSUKY_FIREBASE_CONFIG)return;
  let audioCtx=null,previous=new Set(),first=true;
  const mesaBox=document.getElementById('mesa'),deliveryBox=document.getElementById('delivery');
  if(!mesaBox||!deliveryBox)return;
  function unlock(){try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume()}catch(e){}}
  ['click','keydown','touchstart'].forEach(e=>window.addEventListener(e,unlock,{passive:true}));
  function beep(){try{unlock();if(!audioCtx)return;const n=audioCtx.currentTime;[0,.18,.36].forEach((d,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=i===1?880:660;g.gain.setValueAtTime(.0001,n+d);g.gain.exponentialRampToValueAtTime(.18,n+d+.02);g.gain.exponentialRampToValueAtTime(.0001,n+d+.14);o.connect(g);g.connect(audioCtx.destination);o.start(n+d);o.stop(n+d+.16)})}catch(e){}}
  function render(s){
    const data=s.val()||{};
    const rows=Object.entries(data).filter(([,o])=>o&&String(o.status||'aguardando')==='aguardando');
    const mesas=rows.filter(([,o])=>o&&((o.mesa!==undefined&&o.mesa!==null&&String(o.mesa).trim()!=='')||String(o.origem||'').toLowerCase()==='garcom'));
    const delivery=rows.filter(([,o])=>!((o&&o.mesa!==undefined&&o.mesa!==null&&String(o.mesa).trim()!=='')||String(o?.origem||'').toLowerCase()==='garcom'));
    const ids=new Set(rows.map(([id])=>id));let novo=false;ids.forEach(id=>{if(!previous.has(id))novo=true});if(!first&&novo)beep();first=false;previous=ids;
    mesaBox.classList.toggle('wait',mesas.length>0);deliveryBox.classList.toggle('wait',delivery.length>0);
    mesaBox.querySelector('.n').textContent=mesas.length;deliveryBox.querySelector('.n').textContent=delivery.length;
    mesaBox.querySelector('small').textContent=mesas.length?'NOVOS PEDIDOS AGUARDANDO':'Nenhum pedido de mesa aguardando';
    deliveryBox.querySelector('small').textContent=delivery.length?'NOVOS PEDIDOS AGUARDANDO':'Nenhum pedido delivery aguardando';
  }
  try{if(!firebase.apps.length)firebase.initializeApp(window.AKATSUKY_FIREBASE_CONFIG);firebase.auth().onAuthStateChanged(u=>{if(u)firebase.database().ref('orders').on('value',render)})}catch(e){console.error('Alertas:',e)}
});
})();
