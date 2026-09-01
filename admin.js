(() => {
'use strict';
const $=id=>document.getElementById(id);
let currentUser=null,currentRole=null;
let db=null,unsubOrders=null,unsubMenu=null;
const DEFAULT_MENU=[{"id":1,"cat":"Entradas","name":"Harumaki Salmão (5un)","desc":"","price":23.9},{"id":2,"cat":"Entradas","name":"Guiosa (6un)","desc":"","price":24.9},{"id":3,"cat":"Entradas","name":"Sunomono","desc":"","price":19.9},{"id":4,"cat":"Entradas","name":"Harumaki Queijo","desc":"","price":23.9},{"id":5,"cat":"Entradas","name":"Shimeji","desc":"","price":27.9},{"id":6,"cat":"Entradas","name":"Canapes Salmão (10un)","desc":"","price":34.9},{"id":7,"cat":"Temaki","name":"Salmão Grelhado","desc":"","price":33.9},{"id":8,"cat":"Temaki","name":"California","desc":"","price":24.9},{"id":9,"cat":"Temaki","name":"Skin","desc":"","price":24.9},{"id":10,"cat":"Temaki","name":"Shimeji","desc":"","price":27.9},{"id":11,"cat":"Temaki","name":"Salmão Hot Holls","desc":"","price":33.9},{"id":12,"cat":"Temaki","name":"Salmão Nachos","desc":"","price":34.9},{"id":13,"cat":"Temaki","name":"Salmão Croc","desc":"","price":36.9},{"id":14,"cat":"Temaki","name":"À Moda (2 Sabor)","desc":"","price":42.9},{"id":15,"cat":"Temaki","name":"À Moda do Cheff","desc":"","price":49.9},{"id":16,"cat":"Temaki","name":"Kani","desc":"","price":22.9},{"id":17,"cat":"Temaki","name":"Filadelfia","desc":"","price":34.9},{"id":18,"cat":"Temaki","name":"Salmão Simples","desc":"","price":31.9},{"id":19,"cat":"Hot Holl","name":"Hot Salmão Filadélfia (8un)","desc":"","price":30.9},{"id":20,"cat":"Hot Holl","name":"Hot Salmão Grelhado (8un)","desc":"","price":30.9},{"id":21,"cat":"Hot Holl","name":"Hot Premium (8un)","desc":"","price":34.9},{"id":22,"cat":"Hot Holl","name":"Big Hot Grelhado (8un)","desc":"","price":47.9},{"id":23,"cat":"Hot Holl","name":"Big Hot Filadélfia (8un)","desc":"","price":47.9},{"id":24,"cat":"Hot Holl","name":"Hot Akatsuky (8un)","desc":"","price":39.9},{"id":25,"cat":"Hossomaki","name":"Hossomaki Salmão (8un)","desc":"","price":24.9},{"id":26,"cat":"Hossomaki","name":"Hossomaki Kani (8un)","desc":"","price":21.9},{"id":27,"cat":"Hossomaki","name":"Hossomaki Skin (8un)","desc":"","price":19.9},{"id":28,"cat":"Hossomaki","name":"Hossomaki Pepino (8un)","desc":"","price":19.9},{"id":29,"cat":"Uramaki","name":"Uramaki Salmão (8un)","desc":"","price":30.9},{"id":30,"cat":"Uramaki","name":"Uramaki Skin (8un)","desc":"","price":24.9},{"id":31,"cat":"Uramaki","name":"Uramaki California (8un)","desc":"","price":25.9},{"id":32,"cat":"Uramaki","name":"Uramaki Salm. Grelhado (8un)","desc":"","price":30.9},{"id":33,"cat":"Uramaki","name":"Uramaki Premium (8un)","desc":"","price":34.9},{"id":34,"cat":"Uramaki","name":"Uramaki Filadélfia (8un)","desc":"","price":31.9},{"id":35,"cat":"Sashimi","name":"Sashimi Salmão - 10 Fatias","desc":"","price":44.9},{"id":36,"cat":"Sashimi","name":"Sashimi Salmão - 15 Fatias","desc":"","price":49.9},{"id":37,"cat":"Nigiri Double","name":"Nigiri Salmão","desc":"","price":8.9},{"id":38,"cat":"Nigiri Double","name":"Nigiri Skin","desc":"","price":7.9},{"id":39,"cat":"Nigiri Double","name":"Nigiri Kani","desc":"","price":7.9},{"id":40,"cat":"Nigiri Double","name":"Nigiri Salmão Premium","desc":"","price":11.9},{"id":41,"cat":"Nigiri","name":"Nigiri Salmão (9un)","desc":"","price":36.9},{"id":42,"cat":"Nigiri","name":"Nigiri Kani (9un)","desc":"","price":31.9},{"id":43,"cat":"Nigiri","name":"Nigiri Skin (9un)","desc":"","price":31.9},{"id":44,"cat":"Nigiri","name":"Nigiri Salmão Premium (9un)","desc":"","price":42.9},{"id":45,"cat":"Joe Double","name":"Double Joe Salmão","desc":"","price":11.9},{"id":46,"cat":"Joe Double","name":"Double Joe Pepino","desc":"","price":8.9},{"id":47,"cat":"Joe Double","name":"Double Joe Crispy","desc":"","price":11.9},{"id":48,"cat":"Joe Double","name":"Double Joe Cream","desc":"","price":11.9},{"id":49,"cat":"Joe Double","name":"Double Joe Geleia de Pimenta","desc":"","price":11.9},{"id":50,"cat":"Joe","name":"Porção Joe Salmão (8un)","desc":"","price":35.9},{"id":51,"cat":"Joe","name":"Porção Joe Pepino (8un)","desc":"","price":31.9},{"id":52,"cat":"Joe","name":"Porção Joe Geleia de Pimenta (8un)","desc":"","price":35.9},{"id":53,"cat":"Joe","name":"Porção Joe Crispy (8un)","desc":"","price":37.9},{"id":54,"cat":"Joe","name":"Porção Joe Cream (8un)","desc":"","price":37.9},{"id":55,"cat":"Sobremesas","name":"Haru Hot Banana c/ Nutella (8un)","desc":"","price":39.9},{"id":56,"cat":"Sobremesas","name":"Harumaki Romeu e Julieta (2un)","desc":"","price":11.9},{"id":57,"cat":"Sobremesas","name":"Harumaki Nutella (2un)","desc":"","price":16.9},{"id":58,"cat":"Bebidas","name":"Água","desc":"","price":6.0},{"id":59,"cat":"Bebidas","name":"Água com gás","desc":"","price":7.9},{"id":60,"cat":"Bebidas","name":"Refrigerante Lata","desc":"","price":8.9},{"id":61,"cat":"Bebidas","name":"Refrigerante 600 ml","desc":"","price":12.9},{"id":62,"cat":"Bebidas","name":"Suco Del Vale","desc":"","price":9.9},{"id":63,"cat":"Bebidas","name":"Limoneto","desc":"","price":11.9},{"id":64,"cat":"Bebidas","name":"H2O","desc":"","price":11.9},{"id":65,"cat":"Bebidas","name":"Cerveja Long Neck (Corona/Budweiser/Heineken)","desc":"","price":15.0},{"id":66,"cat":"Combos","name":"Combo 1","desc":"3 Niguiri Salmão • 3 Uramaki Grelhado • 3 Joe Pepino • 3 Hot Holl • 3 Sashimis Maçaricados","price":54.9},{"id":67,"cat":"Combos","name":"Combo 2","desc":"4 Uramaki Filadélfia • 4 Hossomaki Salmão • 4 Hot Holl • 5 Sashimis • 4 Joe Geleia de Pimenta","price":89.9},{"id":68,"cat":"Combos","name":"Combo 3","desc":"1 Temaki Califórnia • 4 Uramaki Califórnia • 4 Hossomaki Pepino • 4 Hossomaki Kani • 2 Niguiri Skin • 2 Niguiri Kani • 4 Joe de Pepino","price":69.9},{"id":69,"cat":"Combos","name":"Combo 4","desc":"1 Temaki Filadélfia • 8 Sashimi Salmão • 8 Uramaki Salmão Grelhado • 8 Hossomaki Salmão com Kani • 6 Niguiri Salmão Premium • 8 Hot Holls Filadélfia","price":129.9},{"id":70,"cat":"Combos","name":"Combo 5","desc":"10 Sashimis Salmão • 4 Joe Salmão Crispy • 4 Uramaki Skin • 4 Uramaki Premium • 5 Hot Premium • 1 Sunomono","price":109.9},{"id":71,"cat":"Combos","name":"Combo Grelhado","desc":"1 Temaki Hot Grelhado • 4 Uramaki Salmão Grelhado • 4 Hot Holl","price":59.9},{"id":72,"cat":"Combos","name":"Combo Filadélfia","desc":"1 Temaki Salmão Filadélfia • 5 Sashimi • 4 Uramaki Filadélfia","price":59.9},{"id":73,"cat":"Barcas","name":"Barca Salmão","desc":"6 Sashimi Salmão • 3 Joe Salmão • 4 Uramaki Filadélfia • 4 Hossomaki Salmão • 6 Niguiri Salmão • 1 Temaki Salmão Simples","price":119.9},{"id":74,"cat":"Barcas","name":"Barca Casal","desc":"4 Joe Salmão • 4 Joe Crispy • 4 Joe Pepino • 10 Sashimi Salmão • 4 Uramaki Salmão Grelhado • 4 Uramaki Salmão • 6 Hot Holl Filadélfia • 8 Hossomaki Salmão","price":147.9},{"id":75,"cat":"Barcas","name":"Barca Premium","desc":"6 Joe Salmão • 6 Joe Crispy • 6 Joe Geleia de Pimenta • 20 Sashimi Salmão • 10 Hot Premium • 10 Uramaki Premium • 5 Niguiri Skin • 5 Niguiri Salmão • 5 Niguiri Kani • 10 Hossomaki Salmão com Kani","price":259.9},{"id":76,"cat":"Barcas","name":"Barca Akatsuky","desc":"30 Sashimis Salmão • 10 Uramaki Filadélfia • 10 Uramaki Salmão Grelhado • 10 Uramaki Salmão Premium • 10 Hossomaki Salmão • 10 Hossomaki Salmão com Kani • 10 Hossomaki Skin • 10 Hot Holls Filadélfia • 10 Hot Premium • 10 Niguiri Salmão • 10 Niguiri Skin • 8 Joe Salmão • 8 Joe Crispy • 8 Joe Pepino","price":419.9}];const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
let allOrders=[],orderSearch='',statusFilter='todos',cashDate=new Date(),lastOrderCount=0,storeOpen=true,currentCash=null,operatorName='',orderTimer=null;
function pad(n){return String(n).padStart(2,'0')}
function isoDate(d=new Date()){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function dateTime(ts){return ts?new Date(ts).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'—'}
function dateLabel(s){if(!s)return '—';const [y,m,d]=s.split('-');return `${d}/${m}/${y}`}
function conn(t,c){$('connection').className='notice '+c;$('connection').textContent=t}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function paymentKey(v){v=String(v||'').toLowerCase();if(v.includes('crédito')||v.includes('credito'))return 'credito';if(v.includes('débito')||v.includes('debito'))return 'debito';if(v.includes('pix'))return 'pix';return 'dinheiro'}
function ordersForDate(date){const [y,m,d]=date.split('-').map(Number);const start=new Date(y,m-1,d).getTime();const end=start+86400000;return allOrders.filter(([id,o])=>{const t=Number(o.createdAt||0);return t>=start&&t<end})}
function formatDuration(ms){ms=Math.max(0,Number(ms||0));const sec=Math.floor(ms/1000),h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return h?`${pad(h)}:${pad(m)}:${pad(s)}`:`${pad(m)}:${pad(s)}`}
function orderElapsed(o){const start=Number(o.createdAt||0);if(!start)return 0;const end=o.status==='entregue'?Number(o.statusTimes?.entregue||o.deliveredAt||start):Date.now();return Math.max(0,end-start)}
function averageDeliveredTime(date){const rows=ordersForDate(date),done=rows.filter(([id,o])=>o.status==='entregue'&&o.createdAt&&(o.statusTimes?.entregue||o.deliveredAt));if(!done.length)return 0;return done.reduce((sum,[id,o])=>sum+Math.max(0,Number(o.statusTimes?.entregue||o.deliveredAt)-Number(o.createdAt)),0)/done.length}
function updateAverageTime(){const el=$('statAvgTime');if(el)el.textContent=formatDuration(averageDeliveredTime(isoDate()));}
function refreshOrderTimers(){document.querySelectorAll('[data-timer]').forEach(el=>{const pair=allOrders.find(x=>x[0]===el.dataset.timer);if(pair)el.textContent=formatDuration(orderElapsed(pair[1]));});updateAverageTime()}
function renderOrders(){const q=orderSearch.toLowerCase();const arr=allOrders.filter(([id,o])=>(statusFilter==='todos'||o.status===statusFilter)&&(!q||(`${id} ${o.customer?.name||''} ${o.customer?.phone||''}`).toLowerCase().includes(q)));$('orders').innerHTML=arr.length?arr.map(([id,o])=>card(id,o)).join(''):'<div class="empty">Nenhum pedido encontrado com esses filtros.</div>';refreshOrderTimers()}
function card(id,o){const c=o.customer||{},items=(o.items||[]).map(x=>`${x.qty}x ${escapeHtml(x.name)} — ${money(x.price*x.qty)}`).join('<br>');const states=['recebido','preparando','saiu para entrega','entregue'];const subtotal=Number(o.subtotal??(Number(o.total||0)-Number(o.deliveryFee||0)));const fee=Number(o.deliveryFee||0);const timerLabel=o.status==='entregue'?'Tempo total':'Tempo decorrido';return `<article class="order"><div class="ordertop"><b>Pedido #${escapeHtml(id.slice(-6))}</b><span class="status">${escapeHtml(o.status||'recebido')}</span></div><div class="orderTimer">⏱️ ${timerLabel}: <b data-timer="${escapeHtml(id)}">${formatDuration(orderElapsed(o))}</b></div><h3>${escapeHtml(c.name||'Cliente')}</h3><div class="orderMeta">Recebido em ${dateTime(o.createdAt)}</div><p>📱 ${escapeHtml(c.phone||'')}<br>📍 ${escapeHtml(c.street||'')}, ${escapeHtml(c.number||'')} — ${escapeHtml(c.neighborhood||'')}, ${escapeHtml(c.city||'')}/${escapeHtml(c.uf||'')} — CEP ${escapeHtml(c.cep||'')}<br>💳 ${escapeHtml(c.payment||'')}</p><hr><p>${items}</p><div class="orderTotals"><div><span>Subtotal</span><b>${money(subtotal)}</b></div><div><span>🛵 Taxa de entrega</span><b>${money(fee)}</b></div><div class="orderTotalGrand"><span>Total</span><b>${money(o.total)}</b></div></div>${c.notes?`<p>📝 ${escapeHtml(c.notes)}</p>`:''}<div class="actions"><button class="printBtn" data-print="${escapeHtml(id)}">🖨️ IMPRIMIR COMANDA</button>${states.map(s=>`<button class="${o.status===s?'active':''}" data-status="${escapeHtml(s)}" data-id="${escapeHtml(id)}">${s.toUpperCase()}</button>`).join('')}</div></article>`}
window.setStatus=async(id,status)=>{if(!db||!currentUser||!['admin','operator'].includes(currentRole))return alert('Sem permissão para alterar o pedido.');try{const update={status};update['statusTimes/'+status]=firebase.database.ServerValue.TIMESTAMP;if(status==='entregue')update.deliveredAt=firebase.database.ServerValue.TIMESTAMP;await db.ref('orders/'+id).update(update)}catch(e){console.error(e);alert('Firebase recusou a alteração. Verifique as regras.')}};
function renderMenuEditor(items){const arr=Array.isArray(items)?items:Object.values(items||{});$('menuEditor').innerHTML=`<table class="menu-table"><thead><tr><th>Categoria</th><th>Produto</th><th>Descrição</th><th>Preço</th></tr></thead><tbody>${arr.map((x,i)=>`<tr><td><input data-i="${i}" data-k="cat" value="${escapeHtml(x.cat)}"></td><td><input data-i="${i}" data-k="name" value="${escapeHtml(x.name)}"></td><td><input data-i="${i}" data-k="desc" value="${escapeHtml(x.desc)}"></td><td><input data-i="${i}" data-k="price" type="number" step="0.01" min="0" value="${Number(x.price||0)}"></td></tr>`).join('')}</tbody></table>`;window.currentMenu=arr.map(x=>({...x}))}
async function saveCash(){if(!db)return;const date=$('cashDate').value||isoDate();const orders=ordersForDate(date);const existing=(await db.ref('cashClosings/'+date).get()).val();if(existing?.finalized)return alert('Este caixa já foi finalizado e está bloqueado.');const manual={credito:Number($('cashCredito').value||0),debito:Number($('cashDebito').value||0),dinheiro:Number($('cashDinheiro').value||0),pix:Number($('cashPix').value||0)};const adjustments={trocoInicial:Number($('cashTrocoInicial').value||0),suprimento:Number($('cashSuprimento').value||0),sangria:Number($('cashSangria').value||0)};const manualTotal=Object.values(manual).reduce((a,b)=>a+b,0);const sales=orders.reduce((s,[id,o])=>s+Number(o.total||0),0);const expectedCash=orders.reduce((s,[id,o])=>s+(paymentKey(o.customer?.payment)==='dinheiro'?Number(o.total||0):0),0)+adjustments.trocoInicial+adjustments.suprimento-adjustments.sangria;const difference=manualTotal-sales;const data={date,salesTotal:sales,manualInputs:manual,adjustments,closingTotal:manualTotal,expectedCash,difference,orderCount:orders.length,operator:$('cashOperator').value.trim(),finalized:false,savedAt:Date.now()};try{await db.ref('cashClosings/'+date).set(data);currentCash=data;$('cashSaved').textContent=`Caixa de ${dateLabel(date)} salvo em ${new Date().toLocaleString('pt-BR')}.`;renderCashSummary(date,data);await loadCashRange()}catch(e){console.error(e);alert('Não foi possível salvar o fechamento. Verifique as regras do Firebase.')}}
async function resetOrdersAfterClosing(date, finalData){
  if(!db || !currentUser) return {count:0};

  const snap = await db.ref('orders').get();
  const data = snap.val() || {};
  const entries = Object.entries(data);

  const selectedOrders = entries.filter(([id, o]) => {
    const orderDate = isoDate(new Date(Number(o.createdAt || 0)));
    return orderDate === date;
  });

  if(!selectedOrders.length){
    allOrders = entries;
    lastOrderCount = entries.length;

    $('statOrders').textContent = entries.length;
    $('statNew').textContent =
      entries.filter(([id,o]) => o.status === 'recebido').length;

    $('statTotal').textContent = money(
      entries.reduce((s,[id,o]) => s + Number(o.total || 0), 0)
    );

    renderOrders();

    return {count:0};
  }

  const updates = {};
  const closedAt = Date.now();

  selectedOrders.forEach(([id,o]) => {
    updates['ordersHistory/' + date + '/' + id] = {
      ...o,
      archivedAt: closedAt,
      archivedBy: currentUser.uid,
      archivedWithCashDate: date
    };

    updates['orders/' + id] = null;
  });

  await db.ref().update(updates);

  const selectedIds = new Set(
    selectedOrders.map(([id]) => id)
  );

  const remaining = entries.filter(
    ([id]) => !selectedIds.has(id)
  );

  allOrders = remaining;
  lastOrderCount = remaining.length;

  $('statOrders').textContent = remaining.length;

  $('statNew').textContent =
    remaining.filter(([id,o]) => o.status === 'recebido').length;

  $('statTotal').textContent = money(
    remaining.reduce((s,[id,o]) => s + Number(o.total || 0), 0)
  );

  renderOrders();

  return {
    count: selectedOrders.length
  };
}
async function finalizeCash(){
  if(!db)return;
  const date=$('cashDate').value||isoDate();
  const existing=(await db.ref('cashClosings/'+date).get()).val();
  if(existing?.finalized)return alert('Este caixa já está finalizado.');
  await saveCash();
  const snap=await db.ref('cashClosings/'+date).get();
  const v=snap.val();
  if(!v)return;
  const finalData={...v,finalized:true,finalizedAt:Date.now(),finalizedBy:$('cashOperator').value.trim()||v.operator||'Não informado'};
  try{
    await db.ref('cashClosings/'+date).set(finalData);
    currentCash=finalData;
    setCashLocked(true,finalData);
    const result=await resetOrdersAfterClosing(date,finalData);
    $('cashSaved').textContent=`CAIXA DE ${dateLabel(date)} FINALIZADO E BLOQUEADO. ${result.count} pedido(s) foram arquivados. O painel de pedidos foi zerado para o próximo caixa.`;
    await loadCashRange();
    alert(`Caixa finalizado com sucesso!\n\n${result.count} pedido(s) foram arquivados.\nO painel de pedidos foi zerado para iniciar um novo caixa.`);
  }catch(e){
    console.error(e);
    alert('O caixa foi salvo, mas não foi possível zerar/arquivar os pedidos. Verifique as regras do Firebase e tente novamente.');
  }
}
function setCashLocked(locked,v){['cashDate','cashOperator','cashCredito','cashDebito','cashDinheiro','cashPix','cashTrocoInicial','cashSuprimento','cashSangria'].forEach(id=>{const el=$(id);if(el)el.disabled=locked});$('saveCash').disabled=locked;$('finalizeCash').disabled=locked;$('finalizeCash').textContent=locked?'🔒 CAIXA BLOQUEADO':'🔒 FINALIZAR E BLOQUEAR CAIXA';if(v?.finalized)$('cashSaved').textContent=`Caixa finalizado por ${v.finalizedBy||v.operator||'—'} em ${dateTime(v.finalizedAt)}.`}
function renderCashSummary(date,saved){const orders=ordersForDate(date),by={credito:0,debito:0,dinheiro:0,pix:0};orders.forEach(([id,o])=>by[paymentKey(o.customer?.payment)]+=Number(o.total||0));const sales=orders.reduce((s,[id,o])=>s+Number(o.total||0),0);const manual={credito:Number($('cashCredito')?.value||0),debito:Number($('cashDebito')?.value||0),dinheiro:Number($('cashDinheiro')?.value||0),pix:Number($('cashPix')?.value||0)};const adjustments=saved?.adjustments||{trocoInicial:Number($('cashTrocoInicial')?.value||0),suprimento:Number($('cashSuprimento')?.value||0),sangria:Number($('cashSangria')?.value||0)};const manualTotal=Object.values(manual).reduce((a,b)=>a+b,0);$('cashSales').textContent=money(sales);$('cashOrders').textContent=orders.length;$('cashCredSales').textContent=money(by.credito);$('cashDebSales').textContent=money(by.debito);$('cashDinSales').textContent=money(by.dinheiro);$('cashPixSales').textContent=money(by.pix);$('cashManualTotal').textContent=money(saved?Number(saved.closingTotal||0):manualTotal);$('cashDifference').textContent=money(saved?Number(saved.difference||0):manualTotal-sales);$('cashExpected').textContent=money(saved?Number(saved.expectedCash||0):(by.dinheiro+adjustments.trocoInicial+adjustments.suprimento-adjustments.sangria));$('cashOpeningLabel').textContent=money(adjustments.trocoInicial);$('cashSupplyLabel').textContent=money(adjustments.suprimento);$('cashWithdrawalLabel').textContent=money(adjustments.sangria);}
async function loadCashDate(date){if(!db)return;const snap=await db.ref('cashClosings/'+date).get();const v=snap.val();$('cashDate').value=date;currentCash=v||null;if(v){$('cashCredito').value=Number(v.manualInputs?.credito||0);$('cashDebito').value=Number(v.manualInputs?.debito||0);$('cashDinheiro').value=Number(v.manualInputs?.dinheiro||0);$('cashPix').value=Number(v.manualInputs?.pix||0);$('cashTrocoInicial').value=Number(v.adjustments?.trocoInicial||0);$('cashSuprimento').value=Number(v.adjustments?.suprimento||0);$('cashSangria').value=Number(v.adjustments?.sangria||0);$('cashOperator').value=v.operator||v.finalizedBy||'';$('cashSaved').textContent=v.finalized?`CAIXA FINALIZADO E BLOQUEADO • ${v.finalizedBy||v.operator||'—'}`:`Fechamento salvo em ${new Date(v.savedAt||0).toLocaleString('pt-BR')}.`;setCashLocked(!!v.finalized,v)}else{['cashCredito','cashDebito','cashDinheiro','cashPix','cashTrocoInicial','cashSuprimento','cashSangria'].forEach(id=>$(id).value='');$('cashOperator').value='';$('cashSaved').textContent='Ainda não existe fechamento salvo para esta data.';setCashLocked(false,null)}renderCashSummary(date,v)}
async function loadCashRange(){if(!db)return;const from=$('cashFrom').value,to=$('cashTo').value;if(!from||!to||from>to)return;const snap=await db.ref('cashClosings').once('value');const rows=[];Object.entries(snap.val()||{}).forEach(([date,v])=>{if(date>=from&&date<=to)rows.push({date,...v})});rows.sort((a,b)=>a.date.localeCompare(b.date));$('cashHistory').innerHTML=rows.length?`<table class="cash-table"><thead><tr><th>Data</th><th>Vendas</th><th>Pedidos</th><th>Crédito</th><th>Débito</th><th>Dinheiro</th><th>PIX</th><th>Fechamento</th><th>Diferença</th><th>Operador</th><th>Status</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${dateLabel(r.date)}</td><td>${money(r.salesTotal)}</td><td>${r.orderCount||0}</td><td>${money(r.manualInputs?.credito)}</td><td>${money(r.manualInputs?.debito)}</td><td>${money(r.manualInputs?.dinheiro)}</td><td>${money(r.manualInputs?.pix)}</td><td><b>${money(r.closingTotal)}</b></td><td>${money(r.difference)}</td><td>${escapeHtml(r.operator||r.finalizedBy||'—')}</td><td>${r.finalized?'🔒 Finalizado':'Aberto'}</td></tr>`).join('')}</tbody></table>`:'<div class="empty">Nenhum fechamento encontrado nesse período.</div>';window.cashRows=rows}
function printCashRange(){const rows=window.cashRows||[];if(!rows.length)return alert('Não há fechamentos no período selecionado.');const total=rows.reduce((s,r)=>s+Number(r.closingTotal||0),0);const html=`<!doctype html><html><head><meta charset="utf-8"><title>Fechamento de Caixa</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#111}h1{margin:0 0 5px}p{color:#555}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ccc;padding:8px;text-align:right}th:first-child,td:first-child{text-align:left}tfoot td{font-weight:bold;background:#eee}</style></head><body><h1>AKATSUKY DELIVERY SUSHI</h1><p>Relatório de caixa: ${dateLabel($('cashFrom').value)} até ${dateLabel($('cashTo').value)}</p><table><thead><tr><th>Data</th><th>Vendas</th><th>Pedidos</th><th>Crédito</th><th>Débito</th><th>Dinheiro</th><th>PIX</th><th>Fechamento</th><th>Diferença</th><th>Operador</th><th>Status</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${dateLabel(r.date)}</td><td>${money(r.salesTotal)}</td><td>${r.orderCount||0}</td><td>${money(r.manualInputs?.credito)}</td><td>${money(r.manualInputs?.debito)}</td><td>${money(r.manualInputs?.dinheiro)}</td><td>${money(r.manualInputs?.pix)}</td><td>${money(r.closingTotal)}</td><td>${money(r.difference)}</td><td>${escapeHtml(r.operator||r.finalizedBy||'—')}</td><td>${r.finalized?'Finalizado':'Aberto'}</td></tr>`).join('')}</tbody><tfoot><tr><td>TOTAL</td><td>${money(rows.reduce((s,r)=>s+Number(r.salesTotal||0),0))}</td><td>${rows.reduce((s,r)=>s+Number(r.orderCount||0),0)}</td><td>${money(rows.reduce((s,r)=>s+Number(r.manualInputs?.credito||0),0))}</td><td>${money(rows.reduce((s,r)=>s+Number(r.manualInputs?.debito||0),0))}</td><td>${money(rows.reduce((s,r)=>s+Number(r.manualInputs?.dinheiro||0),0))}</td><td>${money(rows.reduce((s,r)=>s+Number(r.manualInputs?.pix||0),0))}</td><td>${money(total)}</td></tr></tfoot></table><p>Emitido em ${new Date().toLocaleString('pt-BR')}</p><script>window.onload=()=>window.print()<\/script></body></html>`;const w=window.open('','_blank');w.document.write(html);w.document.close()}
function printOrder(id){const pair=allOrders.find(x=>x[0]===id);if(!pair)return;const o=pair[1],c=o.customer||{};const rows=(o.items||[]).map(x=>`<tr><td>${x.qty}x ${escapeHtml(x.name)}</td><td>${money(Number(x.price||0)*Number(x.qty||0))}</td></tr>`).join('');const html=`<!doctype html><html><head><meta charset="utf-8"><title>Comanda #${escapeHtml(id.slice(-6))}</title><style>body{font-family:Arial,sans-serif;width:80mm;margin:0 auto;padding:8px;color:#111;font-size:12px}h2{text-align:center;margin:4px 0}h3{margin:8px 0}hr{border:0;border-top:1px dashed #333}table{width:100%;border-collapse:collapse}td{padding:4px 0}td:last-child{text-align:right}.total{font-size:18px;font-weight:bold;text-align:right}.center{text-align:center}</style></head><body><h2>AKATSUKY DELIVERY SUSHI</h2><div class="center">COMANDA #${escapeHtml(id.slice(-6))}</div><hr><b>Cliente:</b> ${escapeHtml(c.name||'')}<br><b>Telefone:</b> ${escapeHtml(c.phone||'')}<br><b>Pagamento:</b> ${escapeHtml(c.payment||'')}<br><b>Data:</b> ${dateTime(o.createdAt)}<h3>ENDEREÇO</h3>${escapeHtml(c.street||'')}, ${escapeHtml(c.number||'')}<br>${escapeHtml(c.neighborhood||'')} - ${escapeHtml(c.city||'')}/${escapeHtml(c.uf||'')}<br>CEP: ${escapeHtml(c.cep||'')}<hr><h3>PEDIDOS</h3><table>${rows}</table><hr><div><b>Subtotal:</b> ${money(o.subtotal??(Number(o.total||0)-Number(o.deliveryFee||0)))}</div><div><b>Taxa de entrega:</b> ${money(o.deliveryFee||0)}</div><div class="total">TOTAL: ${money(o.total)}</div>${c.notes?`<hr><b>OBS:</b> ${escapeHtml(c.notes)}`:''}<script>window.onload=()=>window.print()<\/script></body></html>`;const w=window.open('','_blank');w.document.write(html);w.document.close()}
async function loadStoreState(){if(!db)return;try{const snap=await db.ref('settings/storeOpen').get();storeOpen=snap.val()!==false;renderStoreToggle()}catch(e){console.error(e)}}
async function loadDeliveryFee(){if(!db)return;try{const snap=await db.ref('settings/deliveryFee').get();const fee=Number(snap.val()||0);$('deliveryFee').value=fee.toFixed(2);$('deliveryFeeSaved').textContent=`Taxa atual: ${money(fee)}`}catch(e){console.error(e)}}
function renderStoreToggle(){const b=$('storeToggle');if(!b)return;b.textContent=storeOpen?'🏪 LOJA ABERTA':'🔴 LOJA FECHADA';b.classList.toggle('closed',!storeOpen)}
async function toggleStore(){if(!db)return;storeOpen=!storeOpen;await db.ref('settings/storeOpen').set(storeOpen);renderStoreToggle();alert(storeOpen?'Loja aberta para receber pedidos.':'Loja fechada. O cliente verá a loja como fechada e não poderá finalizar pedidos.')}
function listen(){if(!db){conn('🔴 Firebase não carregou. Verifique a conexão.','error');return}unsubOrders&&unsubOrders();unsubMenu&&unsubMenu();const ro=db.ref('orders');unsubOrders=ro.on('value',snap=>{const data=snap.val()||{},arr=Object.entries(data).sort((a,b)=>(b[1].createdAt||0)-(a[1].createdAt||0));if(lastOrderCount&&arr.length>lastOrderCount&&Notification&&Notification.permission==='granted'){new Notification('Novo pedido - Akatsuky Sushi',{body:`Pedido #${arr[0][0].slice(-6)} • ${money(arr[0][1].total)}`})}lastOrderCount=arr.length;$('statOrders').textContent=arr.length;$('statNew').textContent=arr.filter(x=>x[1].status==='recebido').length;$('statTotal').textContent=money(arr.reduce((s,x)=>s+Number(x[1].total||0),0));allOrders=arr;renderOrders();updateAverageTime();conn('🟢 Firebase conectado • pedidos em tempo real','ok');},err=>{console.error(err);conn('🟠 Firebase conectou, mas as regras não permitem ler os pedidos.','warn')});unsubMenu=db.ref('settings/menu').on('value',snap=>renderMenuEditor(snap.val()?.items||DEFAULT_MENU),err=>console.error(err))}
async function signIn(email,password,allowedRoles,success){
  try{
    const cleanEmail=String(email||'').trim();
    if(!cleanEmail||!password)return alert('Informe e-mail e senha.');
    if(!window.firebase||!firebase.apps?.length) throw Object.assign(new Error('Firebase não inicializado'),{code:'firebase-not-initialized'});
    if(!db) throw Object.assign(new Error('Realtime Database não inicializado'),{code:'database-not-initialized'});
    const cred=await firebase.auth().signInWithEmailAndPassword(cleanEmail,password);
    const roleSnap=await db.ref('users/'+cred.user.uid+'/role').get();
    const role=roleSnap.val();
    if(!allowedRoles.includes(role)){
      await firebase.auth().signOut();
      return alert('Usuário autenticado, mas sem permissão.\n\nUID: '+cred.user.uid+'\nRole encontrada: '+(role||'NENHUMA')+'\nEsperado: '+allowedRoles.join(' ou '));
    }
    currentUser=cred.user; currentRole=role; success(role);
  }catch(e){
    console.error('AKATSUKY LOGIN ERROR',e);
    const code=e?.code||'sem-codigo';
    const msg=e?.message||String(e);
    if(code==='auth/api-key-not-valid') return alert('API Key inválida. Confira o firebase-config.js do Firebase novo.');
    if(code==='auth/invalid-credential'||code==='auth/wrong-password'||code==='auth/user-not-found') return alert('E-mail ou senha incorretos. Código: '+code);
    if(code==='auth/invalid-email') return alert('E-mail inválido.');
    if(code==='auth/too-many-requests') return alert('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
    if(code==='auth/operation-not-allowed') return alert('Login por e-mail/senha está desativado no Firebase Authentication.');
    if(code==='auth/network-request-failed') return alert('Falha de rede ao conectar ao Firebase.');
    return alert('Falha no login.\n\nCódigo: '+code+'\nMensagem: '+msg);
  }
}
async function enterAdmin(){await signIn($('adminEmail').value,$('adminPassword').value,['admin','operator'],()=>{ $('login').classList.add('hidden');$('cashLogin').classList.add('hidden');$('cashPanel').classList.add('hidden');$('dashboard').classList.remove('hidden');listen();if('Notification'in window)Notification.requestPermission().catch(()=>{});});}
async function enterCash(){await signIn($('cashEmail').value,$('cashPassword').value,['admin','cashier'],async(role)=>{if(role==='cashier'){const saved=localStorage.getItem('akatsukyCashOperator')||'';const name=prompt('👤 Nome do operador do caixa:',saved);if(!name||!name.trim()){await firebase.auth().signOut();return alert('É necessário informar o nome do operador para abrir o caixa.')}operatorName=name.trim();localStorage.setItem('akatsukyCashOperator',operatorName)}else{operatorName=localStorage.getItem('akatsukyCashOperator')||'';} $('cashOperator').value=operatorName;$('login').classList.add('hidden');$('cashLogin').classList.add('hidden');$('dashboard').classList.add('hidden');$('cashPanel').classList.remove('hidden');const today=isoDate();$('cashDate').value=today;$('cashFrom').value=today;$('cashTo').value=today;await loadCashDate(today);if(!currentCash||!currentCash.operator)$('cashOperator').value=operatorName;await loadCashRange()})}
window.addEventListener('DOMContentLoaded',()=>{
 $('cashEnter').onclick=e=>{e.preventDefault();enterCash()};$('cashPassword').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();enterCash()}});
 $('enter').onclick=e=>{e.preventDefault();enterAdmin()};$('adminPassword').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();enterAdmin()}});
 $('orderSearch').oninput=e=>{orderSearch=e.target.value;renderOrders()};setInterval(refreshOrderTimers,1000);$('statusFilter').onchange=e=>{statusFilter=e.target.value;renderOrders()};$('refresh').onclick=listen;
 $('logout').onclick=()=>firebase.auth().signOut().then(()=>location.reload());
 $('storeToggle').onclick=toggleStore;$('openCash').onclick=()=>{$('cashLogin').classList.remove('hidden');$('dashboard').classList.add('hidden');$('cashEmail').focus()};
 $('backAdmin').onclick=()=>{$('cashLogin').classList.add('hidden');$('cashPanel').classList.add('hidden');$('dashboard').classList.remove('hidden')};
 $('cashBack').onclick=()=>firebase.auth().signOut().then(()=>{location.reload()});$('cashLogout').onclick=()=>firebase.auth().signOut().then(()=>location.reload());
 $('cashDate').onchange=e=>loadCashDate(e.target.value);$('saveCash').onclick=saveCash;$('finalizeCash').onclick=finalizeCash;$('cashFrom').onchange=loadCashRange;$('cashTo').onchange=loadCashRange;$('loadRange').onclick=loadCashRange;$('printCash').onclick=printCashRange;
 ['cashCredito','cashDebito','cashDinheiro','cashPix','cashTrocoInicial','cashSuprimento','cashSangria'].forEach(id=>$(id).oninput=()=>renderCashSummary($('cashDate').value));$('cashOperator').oninput=e=>{operatorName=e.target.value.trim();if(operatorName)localStorage.setItem('akatsukyCashOperator',operatorName)};
 document.addEventListener('click',e=>{const b=e.target.closest('[data-status]');if(b)window.setStatus(b.dataset.id,b.dataset.status);const p=e.target.closest('[data-print]');if(p)printOrder(p.dataset.print)});
 $('saveDeliveryFee').onclick=async()=>{if(currentRole!=='admin')return alert('Somente o administrador pode alterar a taxa de entrega.');const fee=Math.max(0,Number($('deliveryFee').value||0));try{await db.ref('settings/deliveryFee').set(fee);$('deliveryFeeSaved').textContent=`Taxa salva: ${money(fee)}`;alert('Taxa de entrega salva com sucesso!')}catch(e){console.error(e);alert('Não foi possível salvar a taxa. Verifique as regras do Firebase.')}};
 $('saveMenu').onclick=async()=>{if(currentRole!=='admin')return alert('Somente o administrador pode alterar o cardápio.');const arr=window.currentMenu||[];document.querySelectorAll('#menuEditor [data-i]').forEach(el=>{const i=Number(el.dataset.i),k=el.dataset.k;arr[i][k]=k==='price'?Number(el.value):el.value});try{await db.ref('settings/menu').set({items:arr,savedAt:Date.now()});alert('Cardápio salvo com sucesso!')}catch(e){console.error(e);alert('Não foi possível salvar. Verifique as regras do Firebase.')}};
 try{if(!window.firebase)throw new Error('firebase');firebase.initializeApp(window.AKATSUKY_FIREBASE_CONFIG);db=firebase.database();firebase.auth().onAuthStateChanged(async user=>{if(!user){currentUser=null;currentRole=null;return;}const role=(await db.ref('users/'+user.uid+'/role').get()).val();if(!role){await firebase.auth().signOut();return alert('Usuário autenticado sem função cadastrada em users/UID/role.');}currentUser=user;currentRole=role;if(['admin','operator'].includes(role)){ $('login').classList.add('hidden');$('dashboard').classList.remove('hidden');listen();loadStoreState();loadDeliveryFee();}});conn('🟢 Firebase carregado • autenticação segura ativada','ok');}catch(e){console.error(e);conn('🔴 Não foi possível carregar o Firebase.','error')}
});

})();
