(() => {
  'use strict';

  // Mantém a sessão do Firebase isolada por aba/janela.
  // Isso evita que ADM e Garçom, quando usados no mesmo navegador,
  // sobrescrevam a autenticação um do outro.
  async function setAuthPersistence() {
    try {
      if (!window.firebase || !firebase.auth) return;
      await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
      console.log('AKATSUKY: persistência Firebase configurada como SESSION.');
    } catch (e) {
      console.warn('AKATSUKY: não foi possível configurar persistência SESSION:', e);
    }
  }

  function patchFirebaseGet() {
    try {
      if (!window.firebase || typeof firebase.database !== 'function') return;
      const ref = firebase.database().ref('__akatsuky_probe__');
      const RefProto = Object.getPrototypeOf(ref);
      if (!RefProto || RefProto.__akatsukyGetFixed) return;
      const originalGet = RefProto.get;
      RefProto.get = function (...args) {
        const self = this;
        return self.once('value').then(snapshot => {
          if (snapshot && typeof snapshot.val === 'function') return snapshot;
          if (typeof originalGet === 'function') {
            return Promise.resolve(originalGet.apply(self, args)).then(s => s || self.once('value'));
          }
          return snapshot;
        });
      };
      RefProto.__akatsukyGetFixed = true;
    } catch (e) { console.warn('Firebase get fallback:', e); }
  }
  function money(n){return Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
  function esc(v){return String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
  function dateTime(ts){return ts?new Date(Number(ts)).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'—'}
  function duration(ms){ms=Math.max(0,Number(ms||0));const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return h?`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`}
  let fixOrders=[],cutoff=0,filterText='',filterStatus='todos';
  function orderElapsed(o){const start=Number(o.createdAt||0);if(!start)return 0;const end=o.status==='entregue'?Number(o.statusTimes?.entregue||o.deliveredAt||start):Date.now();return Math.max(0,end-start)}
  function render(){const box=document.getElementById('orders');if(!box)return;const q=filterText.toLowerCase();const rows=fixOrders.filter(([id,o])=>(filterStatus==='todos'||o.status===filterStatus)&&(!q||(`${id} ${o.customer?.name||''} ${o.customer?.phone||''}`).toLowerCase().includes(q)));box.innerHTML=rows.length?rows.map(([id,o])=>{const c=o.customer||{},items=(o.items||[]).map(x=>`${x.qty}x ${esc(x.name)} — ${money(Number(x.price||0)*Number(x.qty||0))}`).join('<br>'),subtotal=Number(o.subtotal??(Number(o.total||0)-Number(o.deliveryFee||0))),fee=Number(o.deliveryFee||0),states=['recebido','preparando','saiu para entrega','entregue'];return `<article class="order"><div class="ordertop"><b>Pedido #${esc(String(id).slice(-6))}</b><span class="status">${esc(o.status||'recebido')}</span></div><div class="orderTimer">⏱️ ${o.status==='entregue'?'Tempo total':'Tempo decorrido'}: <b>${duration(orderElapsed(o))}</b></div><h3>${esc(c.name||'Cliente')}</h3><div class="orderMeta">Recebido em ${dateTime(o.createdAt)}</div><p>📱 ${esc(c.phone||'')}<br>📍 ${esc(c.street||'')}, ${esc(c.number||'')} — ${esc(c.neighborhood||'')}, ${esc(c.city||'')}/${esc(c.uf||'')} — CEP ${esc(c.cep||'')}<br>💳 ${esc(c.payment||'')}</p><hr><p>${items}</p><div class="orderTotals"><div><span>Subtotal</span><b>${money(subtotal)}</b></div><div><span>🛵 Taxa de entrega</span><b>${money(fee)}</b></div><div class="orderTotalGrand"><span>Total</span><b>${money(o.total)}</b></div></div>${c.notes?`<p>📝 ${esc(c.notes)}</p>`:''}<div class="actions"><button class="printBtn" data-print="${esc(id)}">🖨️ IMPRIMIR COMANDA</button>${states.map(s=>`<button class="${o.status===s?'active':''}" data-status="${esc(s)}" data-id="${esc(id)}">${s.toUpperCase()}</button>`).join('')}</div></article>`}).join(''):'<div class="empty">Nenhum pedido no caixa atual.</div>';const statOrders=document.getElementById('statOrders'),statNew=document.getElementById('statNew'),statTotal=document.getElementById('statTotal');if(statOrders)statOrders.textContent=rows.length;if(statNew)statNew.textContent=rows.filter(x=>x[1].status==='recebido').length;if(statTotal)statTotal.textContent=money(rows.reduce((s,x)=>s+Number(x[1].total||0),0))}
  async function loadCutoff(db){try{const snap=await db.ref('cashClosings/'+new Date().toISOString().slice(0,10)).once('value'),v=snap.val();cutoff=v?.finalized?Number(v.finalizedAt||0):0}catch(e){cutoff=0}}
  function listenFixedOrders(db){db.ref('orders').on('value',async snap=>{const data=snap.val()||{};await loadCutoff(db);fixOrders=Object.entries(data).filter(([id,o])=>Number(o?.createdAt||0)>cutoff).sort((a,b)=>Number(b[1]?.createdAt||0)-Number(a[1]?.createdAt||0));render()});db.ref('cashClosings/'+new Date().toISOString().slice(0,10)).on('value',snap=>{const v=snap.val();cutoff=v?.finalized?Number(v.finalizedAt||0):0;fixOrders=fixOrders.filter(([id,o])=>Number(o?.createdAt||0)>cutoff);render()})}
  window.addEventListener('DOMContentLoaded',async()=>{await setAuthPersistence();patchFirebaseGet();const search=document.getElementById('orderSearch'),status=document.getElementById('statusFilter');if(search)search.addEventListener('input',e=>{filterText=e.target.value;render()});if(status)status.addEventListener('change',e=>{filterStatus=e.target.value;render()});setTimeout(()=>{try{if(window.firebase)listenFixedOrders(firebase.database())}catch(e){console.warn('Painel de caixa auxiliar:',e)}},100)});
  setInterval(()=>{if(fixOrders.length)render()},1000);

  function loadDeliveryAdmin(){
    if(document.getElementById('deliveryAdminScript')) return;
    const s=document.createElement('script');s.id='deliveryAdminScript';s.src='delivery-admin.js?v=1.0';s.onload=()=>{};document.body.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(loadDeliveryAdmin,150));
  else setTimeout(loadDeliveryAdmin,150);
})();
