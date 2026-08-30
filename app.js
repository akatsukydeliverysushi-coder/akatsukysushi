(() => {
'use strict';
const $=id=>document.getElementById(id);
const brl=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const RESTAURANT_WHATSAPP='5519989860770';
const CART_KEY='akatsukyCart',CUSTOMER_KEY='akatsukyCustomer';
let menu=[],cart=[],cat='Todos',db=null,searchTerm='',storeOpen=true,deliveryFee=4,deferredPrompt=null;

const DEFAULT_MENU = [
{"id":1,"cat":"Entradas","name":"Harumaki Salmão (5un)","desc":"","price":23.9},{"id":2,"cat":"Entradas","name":"Guiosa (6un)","desc":"","price":24.9},{"id":3,"cat":"Entradas","name":"Sunomono","desc":"","price":19.9},{"id":4,"cat":"Entradas","name":"Harumaki Queijo","desc":"","price":23.9},{"id":5,"cat":"Entradas","name":"Shimeji","desc":"","price":27.9},{"id":6,"cat":"Entradas","name":"Canapes Salmão (10un)","desc":"","price":34.9},
{"id":7,"cat":"Temaki","name":"Salmão Grelhado","desc":"","price":33.9},{"id":8,"cat":"Temaki","name":"California","desc":"","price":24.9},{"id":9,"cat":"Temaki","name":"Skin","desc":"","price":24.9},{"id":10,"cat":"Temaki","name":"Shimeji","desc":"","price":27.9},{"id":11,"cat":"Temaki","name":"Salmão Hot Holls","desc":"","price":33.9},{"id":12,"cat":"Temaki","name":"Salmão Nachos","desc":"","price":34.9},{"id":13,"cat":"Temaki","name":"Salmão Croc","desc":"","price":36.9},{"id":14,"cat":"Temaki","name":"À Moda (2 Sabor)","desc":"","price":42.9},{"id":15,"cat":"Temaki","name":"À Moda do Cheff","desc":"","price":49.9},{"id":16,"cat":"Temaki","name":"Kani","desc":"","price":22.9},{"id":17,"cat":"Temaki","name":"Filadelfia","desc":"","price":34.9},{"id":18,"cat":"Temaki","name":"Salmão Simples","desc":"","price":31.9},
{"id":19,"cat":"Hot Holl","name":"Hot Salmão Filadélfia (8un)","desc":"","price":30.9},{"id":20,"cat":"Hot Holl","name":"Hot Salmão Grelhado (8un)","desc":"","price":30.9},{"id":21,"cat":"Hot Holl","name":"Hot Premium (8un)","desc":"","price":34.9},{"id":22,"cat":"Hot Holl","name":"Big Hot Grelhado (8un)","desc":"","price":47.9},{"id":23,"cat":"Hot Holl","name":"Big Hot Filadélfia (8un)","desc":"","price":47.9},{"id":24,"cat":"Hot Holl","name":"Hot Akatsuky (8un)","desc":"","price":39.9},
{"id":25,"cat":"Hossomaki","name":"Hossomaki Salmão (8un)","desc":"","price":24.9},{"id":26,"cat":"Hossomaki","name":"Hossomaki Kani (8un)","desc":"","price":21.9},{"id":27,"cat":"Hossomaki","name":"Hossomaki Skin (8un)","desc":"","price":19.9},{"id":28,"cat":"Hossomaki","name":"Hossomaki Pepino (8un)","desc":"","price":19.9},
{"id":29,"cat":"Uramaki","name":"Uramaki Salmão (8un)","desc":"","price":30.9},{"id":30,"cat":"Uramaki","name":"Uramaki Skin (8un)","desc":"","price":24.9},{"id":31,"cat":"Uramaki","name":"Uramaki California (8un)","desc":"","price":25.9},{"id":32,"cat":"Uramaki","name":"Uramaki Salm. Grelhado (8un)","desc":"","price":30.9},{"id":33,"cat":"Uramaki","name":"Uramaki Premium (8un)","desc":"","price":34.9},{"id":34,"cat":"Uramaki","name":"Uramaki Filadélfia (8un)","desc":"","price":31.9},
{"id":35,"cat":"Sashimi","name":"Sashimi Salmão - 10 Fatias","desc":"","price":44.9},{"id":36,"cat":"Sashimi","name":"Sashimi Salmão - 15 Fatias","desc":"","price":49.9},
{"id":37,"cat":"Nigiri Double","name":"Nigiri Salmão","desc":"","price":8.9},{"id":38,"cat":"Nigiri Double","name":"Nigiri Skin","desc":"","price":7.9},{"id":39,"cat":"Nigiri Double","name":"Nigiri Kani","desc":"","price":7.9},{"id":40,"cat":"Nigiri Double","name":"Nigiri Salmão Premium","desc":"","price":11.9},
{"id":41,"cat":"Nigiri","name":"Nigiri Salmão (9un)","desc":"","price":36.9},{"id":42,"cat":"Nigiri","name":"Nigiri Kani (9un)","desc":"","price":31.9},{"id":43,"cat":"Nigiri","name":"Nigiri Skin (9un)","desc":"","price":31.9},{"id":44,"cat":"Nigiri","name":"Nigiri Salmão Premium (9un)","desc":"","price":42.9},
{"id":45,"cat":"Joe Double","name":"Double Joe Salmão","desc":"","price":11.9},{"id":46,"cat":"Joe Double","name":"Double Joe Pepino","desc":"","price":8.9},{"id":47,"cat":"Joe Double","name":"Double Joe Crispy","desc":"","price":11.9},{"id":48,"cat":"Joe Double","name":"Double Joe Cream","desc":"","price":11.9},{"id":49,"cat":"Joe Double","name":"Double Joe Geleia de Pimenta","desc":"","price":11.9},
{"id":50,"cat":"Joe","name":"Porção Joe Salmão (8un)","desc":"","price":35.9},{"id":51,"cat":"Joe","name":"Porção Joe Pepino (8un)","desc":"","price":31.9},{"id":52,"cat":"Joe","name":"Porção Joe Geleia de Pimenta (8un)","desc":"","price":35.9},{"id":53,"cat":"Joe","name":"Porção Joe Crispy (8un)","desc":"","price":37.9},{"id":54,"cat":"Joe","name":"Porção Joe Cream (8un)","desc":"","price":37.9},
{"id":55,"cat":"Sobremesas","name":"Haru Hot Banana c/ Nutella (8un)","desc":"","price":39.9},{"id":56,"cat":"Sobremesas","name":"Harumaki Romeu e Julieta (2un)","desc":"","price":11.9},{"id":57,"cat":"Sobremesas","name":"Harumaki Nutella (2un)","desc":"","price":16.9},
{"id":58,"cat":"Bebidas","name":"Água","desc":"","price":6},{"id":59,"cat":"Bebidas","name":"Água com gás","desc":"","price":7.9},{"id":60,"cat":"Bebidas","name":"Refrigerante Lata","desc":"","price":8.9},{"id":61,"cat":"Bebidas","name":"Refrigerante 600 ml","desc":"","price":12.9},{"id":62,"cat":"Bebidas","name":"Suco Del Vale","desc":"","price":9.9},{"id":63,"cat":"Bebidas","name":"Limoneto","desc":"","price":11.9},{"id":64,"cat":"Bebidas","name":"H2O","desc":"","price":11.9},{"id":65,"cat":"Bebidas","name":"Cerveja Long Neck (Corona/Budweiser/Heineken)","desc":"","price":15},
{"id":66,"cat":"Combos","name":"Combo 1","desc":"3 Niguiri Salmão • 3 Uramaki Grelhado • 3 Joe Pepino • 3 Hot Holl • 3 Sashimis Maçaricados","price":54.9},
{"id":67,"cat":"Combos","name":"Combo 2","desc":"4 Uramaki Filadélfia • 4 Hossomaki Salmão • 4 Hot Holl • 5 Sashimis • 4 Joe Geleia de Pimenta","price":89.9},
{"id":68,"cat":"Combos","name":"Combo 3","desc":"1 Temaki Califórnia • 4 Uramaki Califórnia • 4 Hossomaki Pepino • 4 Hossomaki Kani • 2 Niguiri Skin • 2 Niguiri Kani • 4 Joe de Pepino","price":69.9},
{"id":69,"cat":"Combos","name":"Combo 4","desc":"1 Temaki Filadélfia • 8 Sashimi Salmão • 8 Uramaki Salmão Grelhado • 8 Hossomaki Salmão com Kani • 6 Niguiri Salmão Premium • 8 Hot Holls Filadélfia","price":129.9},
{"id":70,"cat":"Combos","name":"Combo 5","desc":"10 Sashimis Salmão • 4 Joe Salmão Crispy • 4 Uramaki Skin • 4 Uramaki Premium • 5 Hot Premium • 1 Sunomono","price":109.9},
{"id":71,"cat":"Combos","name":"Combo Grelhado","desc":"1 Temaki Hot Grelhado • 4 Uramaki Salmão Grelhado • 4 Hot Holl","price":59.9},
{"id":72,"cat":"Combos","name":"Combo Filadélfia","desc":"1 Temaki Salmão Filadélfia • 5 Sashimi • 4 Uramaki Filadélfia","price":59.9},
{"id":73,"cat":"Barcas","name":"Barca Salmão","desc":"6 Sashimi Salmão • 3 Joe Salmão • 4 Uramaki Filadélfia • 4 Hossomaki Salmão • 6 Niguiri Salmão • 1 Temaki Salmão Simples","price":119.9},
{"id":74,"cat":"Barcas","name":"Barca Casal","desc":"4 Joe Salmão • 4 Joe Crispy • 4 Joe Pepino • 10 Sashimi Salmão • 4 Uramaki Salmão Grelhado • 4 Uramaki Salmão • 6 Hot Holl Filadélfia • 8 Hossomaki Salmão","price":147.9},
{"id":75,"cat":"Barcas","name":"Barca Premium","desc":"6 Joe Salmão • 6 Joe Crispy • 6 Joe Geleia de Pimenta • 20 Sashimi Salmão • 10 Hot Premium • 10 Uramaki Premium • 5 Niguiri Skin • 5 Niguiri Salmão • 5 Niguiri Kani • 10 Hossomaki Salmão com Kani","price":259.9},
{"id":76,"cat":"Barcas","name":"Barca Akatsuky","desc":"30 Sashimis Salmão • 10 Uramaki Filadélfia • 10 Uramaki Salmão Grelhado • 10 Uramaki Salmão Premium • 10 Hossomaki Salmão • 10 Hossomaki Salmão com Kani • 10 Hossomaki Skin • 10 Hot Holls Filadélfia • 10 Hot Premium • 10 Niguiri Salmão • 10 Niguiri Skin • 8 Joe Salmão • 8 Joe Crispy • 8 Joe Pepino","price":419.9}
];

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function priceOf(x){const p=Number(x.promoPrice);return p>0&&p<Number(x.price)?p:Number(x.price||0);}
function imageOf(x){return x.image||x.imageUrl||'';}
function promo(x){const p=Number(x.promoPrice);return p>0&&p<Number(x.price);}
function setConnection(t,type='ok'){$('connection').className='notice '+type;$('connection').textContent=t;}

function renderCats(){
 const cats=['Todos',...new Set(menu.map(x=>x.cat).filter(Boolean))];
 $('cats').innerHTML=cats.map(x=>`<button class="cat ${x===cat?'on':''}" data-cat="${esc(x)}">${esc(x)}</button>`).join('');
 document.querySelectorAll('.cat').forEach(b=>b.onclick=()=>{cat=b.dataset.cat;renderCats();renderMenu();});
}
function card(x,featured=false){
 const hasPromo=promo(x),p=priceOf(x),old=Number(x.price||0),disc=hasPromo?Math.round((1-p/old)*100):0;
 const img=imageOf(x);
 return `<article class="card product ${featured?'featuredCard':''}">
 ${img?`<img class="productImage" src="${esc(img)}" alt="${esc(x.name)}" loading="lazy">`:''}
 <div class="catname">${esc(x.cat||'')}</div>
 ${hasPromo?`<span class="discount">🔥 ${disc}% OFF</span>`:''}
 <h3>${esc(x.name)}</h3><p>${esc(x.desc)}</p>
 <div class="price">${hasPromo?`<span class="oldPrice">${brl(old)}</span><span class="promoPrice">${brl(p)}</span>`:brl(p)}</div>
 <button class="add" data-add="${Number(x.id)}" ${storeOpen?'':'disabled'}>+ ADICIONAR</button>
 </article>`;
}
function renderFeatured(){
 const list=menu.filter(x=>x.featured===true||x.featured==='true'||x.highlight===true||x.destaque===true);
 $('featuredSection').classList.toggle('hidden',!list.length);
 $('featured').innerHTML=list.map(x=>card(x,true)).join('');
 bindAdd();
}
function renderMenu(){
 const q=searchTerm.trim().toLowerCase();
 const list=menu.filter(x=>(cat==='Todos'||x.cat===cat)&&(!q||`${x.name} ${x.desc} ${x.cat}`.toLowerCase().includes(q)));
 $('menu').innerHTML=list.length?list.map(x=>card(x)).join(''):'<div class="empty">Nenhum produto encontrado.</div>';
 bindAdd();renderCart();
}
function bindAdd(){document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>add(Number(b.dataset.add)));}
function persistCart(){localStorage.setItem(CART_KEY,JSON.stringify(cart));}
function add(id){if(!storeOpen)return alert('A loja está fechada no momento.');const x=cart.find(i=>i.id===id);x?x.q++:cart.push({id,q:1});persistCart();renderCart();}
function del(id){const x=cart.find(i=>i.id===id);if(x&&x.q>1)x.q--;else cart=cart.filter(i=>i.id!==id);persistCart();renderCart();}
function renderCart(){
 let subtotal=0;
 const rows=cart.map(i=>{const x=menu.find(m=>Number(m.id)===Number(i.id));if(!x)return '';const p=priceOf(x);subtotal+=p*i.q;return `<div class="cartrow"><span><b>${i.q}x</b> ${esc(x.name)}<small>${brl(p)} un.${promo(x)?' • PROMOÇÃO':''}</small></span><b>${brl(p*i.q)}</b><div class="qtyControls"><button type="button" class="remove" data-del="${i.id}">−</button><button type="button" class="remove" data-inc="${i.id}">+</button></div></div>`}).join('');
 const fee=cart.length?Number(deliveryFee||0):0,total=subtotal+fee;
 $('count').textContent=cart.reduce((s,i)=>s+i.q,0)+' itens';$('total').textContent=brl(total);
 $('cart').className=cart.length?'':'empty';
 $('cart').innerHTML=cart.length?rows+`<div class="cartSummary"><div><span>Subtotal</span><b>${brl(subtotal)}</b></div><div><span>🛵 Taxa de entrega</span><b>${brl(fee)}</b></div><div class="cartGrand"><span>Total</span><b>${brl(total)}</b></div></div><button type="button" class="clearCart" id="clearCart">🗑 Limpar pedido</button>`:'Carrinho vazio. Adicione produtos acima.';
 document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>del(Number(b.dataset.del)));
 document.querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>add(Number(b.dataset.inc)));
 const c=$('clearCart');if(c)c.onclick=()=>{cart=[];persistCart();renderCart();};
}
function renderStoreStatus(){let e=$('storeStatus');if(!e){e=document.createElement('div');e.id='storeStatus';e.className='storeClosed hidden';document.body.prepend(e)}e.classList.toggle('hidden',storeOpen);}
async function searchCep(){
 const c=$('cep').value.replace(/\D/g,'');if(c.length!==8)return alert('Digite um CEP válido.');
 const b=$('searchCep');b.disabled=true;b.textContent='Consultando...';
 try{const r=await fetch(`https://viacep.com.br/ws/${c}/json/`),d=await r.json();if(d.erro)throw Error();$('street').value=d.logradouro||'';$('neighborhood').value=d.bairro||'';$('city').value=d.localidade||'';$('uf').value=d.uf||'';$('number').focus();}catch(e){alert('Não foi possível consultar o CEP. Preencha o endereço manualmente.')}finally{b.disabled=false;b.textContent='🔎 Buscar CEP';}
}
function saveCustomer(){localStorage.setItem(CUSTOMER_KEY,JSON.stringify(['name','phone','cep','street','number','neighborhood','city','uf','payment','notes'].reduce((o,k)=>(o[k]=$(k).value,o),{})));}
function loadCustomer(){try{const c=JSON.parse(localStorage.getItem(CUSTOMER_KEY)||'null');if(c)Object.entries(c).forEach(([k,v])=>{if($(k))$(k).value=v})}catch(e){}}
function maskPhone(v){v=v.replace(/\D/g,'').slice(0,11);return v.length<=10?v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3'):v.replace(/(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3');}
function openWhatsApp(id,o){
 const itens=o.items.map(x=>`${x.qty}x ${x.name} — ${brl(x.price*x.qty)}`).join('\n'),c=o.customer;
 const msg=`🍣 *NOVO PEDIDO - AKATSUKY DELIVERY SUSHI*\n\nPedido: #${String(id||'LOCAL').slice(-6)}\nNome: ${c.name}\nCelular: ${c.phone}\n\n*Itens:*\n${itens}\n\n*Subtotal:* ${brl(o.subtotal)}\n*Taxa de entrega:* ${brl(o.deliveryFee)}\n*Total:* ${brl(o.total)}\n*Pagamento:* ${c.payment}\n\n*Endereço:*\n${c.street}, ${c.number}\n${c.neighborhood} - ${c.city}/${c.uf}\nCEP: ${c.cep}${c.notes?`\n\nObs.: ${c.notes}`:''}`;
 location.href=`https://wa.me/${RESTAURANT_WHATSAPP}?text=${encodeURIComponent(msg)}`;
}
async function submitOrder(e){
 e.preventDefault();if(!storeOpen)return alert('A loja está fechada no momento.');if(!cart.length)return alert('Adicione produtos ao carrinho.');saveCustomer();
 const items=cart.map(i=>{const x=menu.find(m=>Number(m.id)===Number(i.id));const p=priceOf(x);return{name:x.name,qty:i.q,price:p,originalPrice:Number(x.price||0)}}).filter(Boolean);
 const subtotal=items.reduce((s,x)=>s+x.price*x.qty,0),fee=Number(deliveryFee||0),total=subtotal+fee;
 const customer={name:$('name').value.trim(),phone:$('phone').value.trim(),cep:$('cep').value,street:$('street').value.trim(),number:$('number').value.trim(),neighborhood:$('neighborhood').value.trim(),city:$('city').value.trim(),uf:$('uf').value.trim().toUpperCase(),payment:$('payment').value,notes:$('notes').value.trim()};
 const o={createdAt:firebase.database.ServerValue.TIMESTAMP,status:'recebido',subtotal,deliveryFee:fee,customer,items,total};
 let id='LOCAL-'+Date.now();
 try{if(db){const r=await db.ref('orders').push(o);id=r.key;localStorage.setItem('lastOrder',id);showTracking(id);}}catch(err){console.error(err);alert('O pedido será aberto no WhatsApp mesmo assim.')}
 openWhatsApp(id,o);cart=[];persistCart();renderCart();
}
function showTracking(id){if(!db||!id||id.startsWith('LOCAL-'))return;$('tracking').classList.remove('hidden');db.ref('orders/'+id).on('value',s=>{const o=s.val();if(!o)return;const steps=['recebido','preparando','saiu para entrega','entregue'],idx=Math.max(0,steps.indexOf(o.status));$('trackingBox').innerHTML=`<p><b>Pedido #${id.slice(-6)}</b> <span class="status">${String(o.status).toUpperCase()}</span></p><p>Total: <b>${brl(o.total)}</b></p><div class="timeline">${steps.map((x,i)=>`<div class="step ${i<=idx?'active':''}">${x.toUpperCase()}</div>`).join('')}</div>`})}
function loadFirebase(){
 if(!window.firebase){setConnection('🟠 Cardápio local ativo • Firebase carregando...','warn');return setTimeout(loadFirebase,700)}
 try{
  firebase.initializeApp(window.AKATSUKY_FIREBASE_CONFIG);db=firebase.database();
  db.ref('settings/menu').on('value',s=>{const v=s.val();menu=v&&Array.isArray(v.items)&&v.items.length?v.items.map((x,i)=>({...x,id:Number(x.id)||i+1,price:Number(x.price)||0})):DEFAULT_MENU.slice();renderCats();renderFeatured();renderMenu();setConnection('🟢 Sistema conectado • cardápio e pedidos em tempo real','ok')},err=>{console.error(err);menu=DEFAULT_MENU.slice();renderCats();renderFeatured();renderMenu();setConnection('🟠 Cardápio local • Firebase não autorizou a leitura','warn')});
  db.ref('settings/storeOpen').on('value',s=>{storeOpen=s.val()!==false;renderStoreStatus();renderMenu();renderFeatured()});
  db.ref('settings/deliveryFee').on('value',s=>{deliveryFee=Math.max(0,Number(s.val()||0));renderCart()});
 }catch(e){console.error(e);menu=DEFAULT_MENU.slice();renderCats();renderFeatured();renderMenu();setConnection('🟠 Cardápio local • configuração Firebase inválida','warn')}
}
window.addEventListener('DOMContentLoaded',()=>{
 $('searchCep').onclick=searchCep;$('menuSearch').oninput=e=>{searchTerm=e.target.value;renderMenu()};$('phone').oninput=e=>e.target.value=maskPhone(e.target.value);
 $('cep').oninput=e=>{let c=e.target.value.replace(/\D/g,'').slice(0,8);e.target.value=c.length>5?c.slice(0,5)+'-'+c.slice(5):c};
 $('orderForm').onsubmit=submitOrder;loadCustomer();
 try{cart=JSON.parse(localStorage.getItem(CART_KEY)||'[]').filter(x=>x&&x.id)}catch(e){cart=[]}
 renderCats();renderMenu();loadFirebase();
 const last=localStorage.getItem('lastOrder');if(last)showTracking(last);
 if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('install').classList.add('show')});
 $('installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('install').classList.remove('show')}else alert("No celular, abra o menu do navegador e escolha 'Adicionar à tela inicial'.")};
});
})();