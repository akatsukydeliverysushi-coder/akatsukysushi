(() => {
'use strict';
const $=id=>document.getElementById(id);
const brl=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const CART_KEY='akatsukyCart',CUSTOMER_KEY='akatsukyCustomer';
let menu=[],cart=[],cat='Todos',db=null,searchTerm='',storeOpen=true,deliveryFee=4,deferredPrompt=null;
const DEFAULT_MENU=[];
function getPrice(x){const p=Number(x?.promoPrice);return p>0&&p<Number(x?.price||0)?p:Number(x?.price||0)}
function syncTopCart(){
 const qty=cart.reduce((s,i)=>s+Number(i.q||0),0);
 const total=cart.reduce((s,i)=>{const x=menu.find(m=>Number(m.id)===Number(i.id));return s+(x?getPrice(x)*Number(i.q||0):0)},0);
 const c=$('navCartCount'),t=$('navCartTotal'),pill=$('count');
 if(c)c.textContent=qty;
 if(t)t.textContent=total.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
 if(pill)pill.textContent=qty+' '+(qty===1?'item':'itens');
}
function persistCart(){localStorage.setItem(CART_KEY,JSON.stringify(cart));syncTopCart()}
function add(id){if(!storeOpen)return alert('A loja está fechada no momento.');const x=cart.find(i=>Number(i.id)===Number(id));x?x.q++:cart.push({id:Number(id),q:1});persistCart();renderCart()}
function inc(id){add(id)}
function del(id){const x=cart.find(i=>Number(i.id)===Number(id));if(x&&x.q>1)x.q--;else cart=cart.filter(i=>Number(i.id)!==Number(id));persistCart();renderCart()}
function clearCart(){cart=[];persistCart();renderCart()}
function renderCart(){
 const subtotal=cart.reduce((s,i)=>{const x=menu.find(m=>Number(m.id)===Number(i.id));return s+(x?getPrice(x)*i.q:0)},0),fee=cart.length?Number(deliveryFee||0):0,total=subtotal+fee;
 const el=$('cart');if(!el)return;
 el.className=cart.length?'':'empty';
 el.innerHTML=cart.length?cart.map(i=>{const x=menu.find(m=>Number(m.id)===Number(i.id));return x?`<div class="cartrow"><span><b>${i.q}x</b> ${String(x.name).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}<small>${brl(getPrice(x))} un.</small></span><b>${brl(getPrice(x)*i.q)}</b><div class="qtyControls"><button type="button" class="remove" data-del="${i.id}">−</button><button type="button" class="remove" data-inc="${i.id}">+</button></div></div>`:''}).join('')+`<div class="cartSummary"><div><span>Subtotal</span><b>${brl(subtotal)}</b></div><div><span>🛵 Taxa de entrega</span><b>${brl(fee)}</b></div><div class="cartGrand"><span>Total</span><b>${brl(total)}</b></div></div><button type="button" class="clearCart" id="clearCart">🗑 Limpar pedido</button>`:'Carrinho vazio. Adicione produtos acima.';
 document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>del(Number(b.dataset.del)));document.querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>inc(Number(b.dataset.inc)));const cl=$('clearCart');if(cl)cl.onclick=clearCart;syncTopCart();
}
window.addEventListener('DOMContentLoaded',()=>{try{cart=JSON.parse(localStorage.getItem(CART_KEY)||'[]').filter(i=>i&&i.id&&Number(i.q)>0)}catch(e){cart=[]}syncTopCart();renderCart()});
window.addEventListener('storage',e=>{if(e.key===CART_KEY){try{cart=JSON.parse(e.newValue||'[]')}catch(_){cart=[]}syncTopCart();renderCart()}});
window.AKATSUKY_CART={syncTopCart,persistCart,getCart:()=>cart};
})();