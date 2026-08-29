/* Akatsuky Delivery Sushi - versão estável sem módulos ES */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const brl = n => Number(n || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const RESTAURANT_WHATSAPP = '5519989860770';
  const DEFAULT_MENU = [
    ['Combinados','Combinado Akatsuky','Seleção especial da casa.',59.90],
    ['Combinados','Combinado Sushi','Variedade para compartilhar.',79.90],
    ['Sushi','Uramaki Salmão','8 unidades.',32.90],
    ['Sushi','Hot Roll','8 unidades.',29.90],
    ['Sashimi','Sashimi Salmão','Fatias frescas.',39.90],
    ['Temaki','Temaki Salmão','Salmão e arroz.',28.90],
    ['Bebidas','Refrigerante Lata','Escolha o sabor.',6],
    ['Bebidas','Água','Água mineral.',4]
  ].map((x,i)=>({id:i+1,cat:x[0],name:x[1],desc:x[2],price:x[3]}));

  let menu = [...DEFAULT_MENU], cart = [], cat = 'Todos', db = null, searchTerm = '', storeOpen = true, deliveryFee = 0;
  const CART_KEY='akatsukyCart', CUSTOMER_KEY='akatsukyCustomer';

  function setConnection(text, type='ok') {
    const el=$('connection'); if(!el) return;
    el.className='notice '+type;
    el.textContent=text;
  }

  function renderCats(){
    const cats=['Todos',...new Set(menu.map(x=>x.cat))];
    $('cats').innerHTML=cats.map(x=>`<button class="cat ${x===cat?'on':''}" data-cat="${escapeHtml(x)}">${escapeHtml(x)}</button>`).join('');
    document.querySelectorAll('.cat').forEach(b=>b.onclick=()=>{cat=b.dataset.cat;renderCats();renderMenu();});
  }
  function renderMenu(){
    const q=searchTerm.trim().toLowerCase();
    const list=menu.filter(x=>(cat==='Todos'||x.cat===cat)&&(!q||`${x.name} ${x.desc} ${x.cat}`.toLowerCase().includes(q)));
    $('menu').innerHTML=list.length?list.map(x=>`<article class="card product"><div class="catname">${escapeHtml(x.cat)}</div><h3>${escapeHtml(x.name)}</h3><p>${escapeHtml(x.desc)}</p><div class="price">${brl(x.price)}</div><button class="add" data-add="${x.id}">+ ADICIONAR</button></article>`).join(''):`<div class="empty wideEmpty">Nenhum produto encontrado. Tente outro termo.</div>`;
    document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>add(Number(b.dataset.add)));
    renderCart();
  }
  function persistCart(){localStorage.setItem(CART_KEY,JSON.stringify(cart));}
  function add(id){if(!storeOpen)return alert('A loja está fechada no momento.');const x=cart.find(i=>i.id===id);x?x.q++:cart.push({id,q:1});persistCart();renderCart();}
  function clearCart(){cart=[];persistCart();renderCart();}
  function inc(id){add(id);}
  function del(id){const x=cart.find(i=>i.id===id);if(x&&x.q>1)x.q--;else cart=cart.filter(i=>i.id!==id);persistCart();renderCart();}
  function renderCart(){
    const subtotal=cart.reduce((s,i)=>{const x=menu.find(m=>m.id===i.id);return s+(x?x.price*i.q:0)},0);
    const fee=cart.length?Number(deliveryFee||0):0;
    const total=subtotal+fee;
    $('count').textContent=cart.reduce((s,i)=>s+i.q,0)+' itens'; $('total').textContent=brl(total);
    $('cart').className=cart.length?'':'empty';
    $('cart').innerHTML=cart.length?cart.map(i=>{const x=menu.find(m=>m.id===i.id);if(!x)return '';return `<div class="cartrow"><span><b>${i.q}x</b> ${escapeHtml(x.name)}<small>${brl(x.price)} un.</small></span><b>${brl(x.price*i.q)}</b><div class="qtyControls"><button type="button" class="remove" data-del="${i.id}">−</button><button type="button" class="remove" data-inc="${i.id}">+</button></div></div>`}).join('')+`<div class="cartSummary"><div><span>Subtotal</span><b>${brl(subtotal)}</b></div><div><span>🛵 Taxa de entrega</span><b>${brl(fee)}</b></div><div class="cartGrand"><span>Total</span><b>${brl(total)}</b></div></div><button type="button" class="clearCart" id="clearCart">🗑 Limpar pedido</button>`:'Carrinho vazio. Adicione produtos acima.';
    document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>del(Number(b.dataset.del)));
    document.querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>inc(Number(b.dataset.inc)));
    const clear=$('clearCart'); if(clear) clear.onclick=clearCart;
  }
  function renderStoreStatus(){let el=document.getElementById('storeStatus');if(!el){el=document.createElement('div');el.id='storeStatus';el.className='storeClosed hidden';document.body.prepend(el)}el.classList.toggle('hidden',storeOpen);el.innerHTML='<div><b>🔴 LOJA FECHADA</b><span>No momento não estamos recebendo novos pedidos.</span></div>'}
function listenStoreState(){if(!db)return;db.ref('settings/storeOpen').on('value',snap=>{storeOpen=snap.val()!==false;renderStoreStatus();document.querySelectorAll('.add').forEach(b=>b.disabled=!storeOpen);const form=document.getElementById('orderForm');if(form)form.classList.toggle('storeLocked',!storeOpen);});}
function listenDeliveryFee(){if(!db)return;db.ref('settings/deliveryFee').on('value',snap=>{deliveryFee=Math.max(0,Number(snap.val()||0));renderCart();});}
function loadMenu(){
    if(!window.firebase){setConnection('🟠 Firebase ainda não carregou. O cardápio local está disponível.','warn');renderCats();renderMenu();return;}
    try{
      db=firebase.database();
      const menuRef=db.ref('settings/menu');
      menuRef.on('value',snap=>{
        const v=snap.val();
        if(v&&Array.isArray(v.items)&&v.items.length) menu=v.items.map((x,i)=>({...x,id:Number(x.id)||i+1,price:Number(x.price)||0}));
        renderCats();renderMenu();
        setConnection('🟢 Sistema conectado • cardápio e pedidos em tempo real','ok');
      },err=>{console.error(err);renderCats();renderMenu();setConnection('🟠 Cardápio local ativo • Firebase não autorizou a leitura','warn');});
    }catch(e){console.error(e);renderCats();renderMenu();setConnection('🟠 Cardápio local ativo • erro na conexão','warn');}
  }
  async function searchCep(){
    const c=$('cep').value.replace(/\D/g,'');
    if(c.length!==8)return alert('Digite um CEP válido.');
    const btn=$('searchCep');btn.disabled=true;btn.textContent='Consultando...';
    try{const r=await fetch(`https://viacep.com.br/ws/${c}/json/`);const d=await r.json();if(d.erro)throw new Error('notfound');$('street').value=d.logradouro||'';$('neighborhood').value=d.bairro||'';$('city').value=d.localidade||'';$('uf').value=d.uf||'';$('number').focus();}
    catch(e){alert(e.message==='notfound'?'CEP não encontrado.':'Não foi possível consultar o CEP. Preencha o endereço manualmente.');}
    finally{btn.disabled=false;btn.textContent='🔎 Buscar CEP';}
  }
  function openWhatsApp(id,o){
    const itens=o.items.map(x=>`${x.qty}x ${x.name} — ${brl(x.price*x.qty)}`).join('\n'); const c=o.customer;
    const msg=`🍣 *NOVO PEDIDO - AKATSUKY DELIVERY SUSHI*\n\nPedido: #${String(id||'LOCAL').slice(-6)}\nNome: ${c.name}\nCelular: ${c.phone}\n\n*Itens:*\n${itens}\n\n*Subtotal:* ${brl(o.subtotal??(Number(o.total||0)-Number(o.deliveryFee||0)))}\n*Taxa de entrega:* ${brl(o.deliveryFee||0)}\n*Total:* ${brl(o.total)}\n*Pagamento:* ${c.payment}\n\n*Endereço:*\n${c.street}, ${c.number}\n${c.neighborhood} - ${c.city}/${c.uf}\nCEP: ${c.cep}${c.notes?`\n\nObs.: ${c.notes}`:''}`;
    window.location.href=`https://wa.me/${RESTAURANT_WHATSAPP}?text=${encodeURIComponent(msg)}`;
  }
  function saveCustomer(){localStorage.setItem(CUSTOMER_KEY,JSON.stringify({name:$('name').value,phone:$('phone').value,cep:$('cep').value,street:$('street').value,number:$('number').value,neighborhood:$('neighborhood').value,city:$('city').value,uf:$('uf').value,payment:$('payment').value,notes:$('notes').value}));}
  function loadCustomer(){try{const c=JSON.parse(localStorage.getItem(CUSTOMER_KEY)||'null');if(!c)return;Object.entries(c).forEach(([k,v])=>{const el=$(k);if(el&&v!=null)el.value=v;});}catch(e){}}
  function maskPhone(v){v=v.replace(/\D/g,'').slice(0,11);return v.length<=10?v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3').replace(/-$/,''):v.replace(/(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3').replace(/-$/,'');}
    async function submitOrder(e){
    e.preventDefault();
    if(!storeOpen)return alert('A loja está fechada no momento.');
    if(!cart.length)return alert('Adicione produtos ao carrinho.');
    saveCustomer();
    const subtotal=cart.reduce((s,i)=>{const x=menu.find(m=>m.id===i.id);return s+x.price*i.q},0);
    const fee=Number(deliveryFee||0);
    const total=subtotal+fee;
    const o={createdAt:firebase.database.ServerValue.TIMESTAMP,status:'recebido',subtotal,deliveryFee:fee,customer:{name:$('name').value.trim(),phone:$('phone').value.trim(),cep:$('cep').value,street:$('street').value.trim(),number:$('number').value.trim(),neighborhood:$('neighborhood').value.trim(),city:$('city').value.trim(),uf:$('uf').value.trim().toUpperCase(),payment:$('payment').value,notes:$('notes').value.trim()},items:cart.map(i=>{const x=menu.find(m=>m.id===i.id);return{name:x.name,qty:i.q,price:x.price}}),total};
    let id='LOCAL-'+Date.now();
    try{if(db){const r=await db.ref('orders').push(o);id=r.key;localStorage.setItem('lastOrder',id);showTracking(id);}}
    catch(err){console.error(err);alert('O Firebase não aceitou o pedido. O pedido será aberto no WhatsApp mesmo assim.');}
    openWhatsApp(id,o);cart=[];persistCart();renderCart();
  }
  function showTracking(id){
    if(!db||!id||id.startsWith('LOCAL-'))return;
    $('tracking').classList.remove('hidden');
    db.ref('orders/'+id).on('value',s=>{const o=s.val();if(!o)return;const steps=['recebido','preparando','saiu para entrega','entregue'],idx=Math.max(0,steps.indexOf(o.status));$('trackingBox').innerHTML=`<p><b>Pedido #${id.slice(-6)}</b> <span class="status">${String(o.status).toUpperCase()}</span></p><p>Subtotal: <b>${brl(o.subtotal??(Number(o.total||0)-Number(o.deliveryFee||0)))}</b> • Taxa: <b>${brl(o.deliveryFee||0)}</b> • Total: <b>${brl(o.total)}</b></p><div class="timeline">${steps.map((x,i)=>`<div class="step ${i<=idx?'active':''}">${x.toUpperCase()}</div>`).join('')}</div>`;});
  }
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  window.addEventListener('DOMContentLoaded',()=>{
    $('searchCep').onclick=searchCep;
    const search=$('menuSearch'); if(search) search.oninput=e=>{searchTerm=e.target.value;renderMenu();};
    const phone=$('phone'); if(phone) phone.oninput=e=>e.target.value=maskPhone(e.target.value);
    loadCustomer(); try{cart=JSON.parse(localStorage.getItem(CART_KEY)||'[]').filter(i=>i&&i.id); }catch(e){cart=[];}
    $('cep').addEventListener('input',e=>{let c=e.target.value.replace(/\D/g,'').slice(0,8);e.target.value=c.length>5?c.slice(0,5)+'-'+c.slice(5):c;});
    $('orderForm').onsubmit=submitOrder;
    const last=localStorage.getItem('lastOrder'); if(last)showTracking(last);
    renderCats();renderMenu();
    if(window.firebase){try{firebase.initializeApp(window.AKATSUKY_FIREBASE_CONFIG);loadMenu();listenStoreState();listenDeliveryFee();}catch(e){console.error(e);setConnection('🟠 Cardápio local ativo • configuração Firebase inválida','warn');}}else{setConnection('🟠 Cardápio local ativo • carregando conexão...','warn');setTimeout(loadMenu,1000);}
    if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(console.warn);
    let deferredPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('install').classList.add('show');});$('installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('install').classList.remove('show');}else alert("No celular, abra o menu do navegador e escolha 'Adicionar à tela inicial'.");};
  });
})();
