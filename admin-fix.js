(() => {
  'use strict';

  // Correção de compatibilidade: em algumas versões do Firebase compat, o get()
  // pode não estar disponível como esperado. O fallback usa once('value').
  function patchFirebaseGet() {
    try {
      const Ref = window.firebase?.database?.Reference;
      if (!Ref?.prototype || Ref.prototype.__akatsukyGetFixed) return;
      const originalGet = Ref.prototype.get;
      Ref.prototype.get = function (...args) {
        if (typeof originalGet === 'function') {
          try {
            const result = originalGet.apply(this, args);
            if (result && typeof result.then === 'function') {
              return result.then(snap => snap || this.once('value'));
            }
            if (result) return Promise.resolve(result);
          } catch (_) {}
        }
        return this.once('value');
      };
      Ref.prototype.__akatsukyGetFixed = true;
    } catch (e) {
      console.warn('Firebase get fallback:', e);
    }
  }

  function money(n) {
    return Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  function esc(v) {
    return String(v ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  }
  function dateTime(ts) {
    return ts ? new Date(Number(ts)).toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' }) : '—';
  }
  function duration(ms) {
    ms = Math.max(0, Number(ms || 0));
    const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }
  function paymentKey(v) {
    v = String(v || '').toLowerCase();
    if (v.includes('crédito') || v.includes('credito')) return 'credito';
    if (v.includes('débito') || v.includes('debito')) return 'debito';
    if (v.includes('pix')) return 'pix';
    return 'dinheiro';
  }
  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  let fixOrders = [];
  let cutoff = 0;
  let filterText = '';
  let filterStatus = 'todos';

  function orderElapsed(o) {
    const start = Number(o.createdAt || 0);
    if (!start) return 0;
    const end = o.status === 'entregue' ? Number(o.statusTimes?.entregue || o.deliveredAt || start) : Date.now();
    return Math.max(0, end - start);
  }

  function render() {
    const box = document.getElementById('orders');
    if (!box) return;
    const q = filterText.toLowerCase();
    const rows = fixOrders.filter(([id,o]) => {
      const statusOk = filterStatus === 'todos' || o.status === filterStatus;
      const text = `${id} ${o.customer?.name || ''} ${o.customer?.phone || ''}`.toLowerCase();
      return statusOk && (!q || text.includes(q));
    });

    box.innerHTML = rows.length ? rows.map(([id,o]) => {
      const c = o.customer || {};
      const items = (o.items || []).map(x => `${x.qty}x ${esc(x.name)} — ${money(Number(x.price||0)*Number(x.qty||0))}`).join('<br>');
      const subtotal = Number(o.subtotal ?? (Number(o.total||0) - Number(o.deliveryFee||0)));
      const fee = Number(o.deliveryFee || 0);
      const states = ['recebido','preparando','saiu para entrega','entregue'];
      return `<article class="order">
        <div class="ordertop"><b>Pedido #${esc(String(id).slice(-6))}</b><span class="status">${esc(o.status || 'recebido')}</span></div>
        <div class="orderTimer">⏱️ ${o.status === 'entregue' ? 'Tempo total' : 'Tempo decorrido'}: <b>${duration(orderElapsed(o))}</b></div>
        <h3>${esc(c.name || 'Cliente')}</h3>
        <div class="orderMeta">Recebido em ${dateTime(o.createdAt)}</div>
        <p>📱 ${esc(c.phone || '')}<br>📍 ${esc(c.street || '')}, ${esc(c.number || '')} — ${esc(c.neighborhood || '')}, ${esc(c.city || '')}/${esc(c.uf || '')} — CEP ${esc(c.cep || '')}<br>💳 ${esc(c.payment || '')}</p>
        <hr><p>${items}</p>
        <div class="orderTotals"><div><span>Subtotal</span><b>${money(subtotal)}</b></div><div><span>🛵 Taxa de entrega</span><b>${money(fee)}</b></div><div class="orderTotalGrand"><span>Total</span><b>${money(o.total)}</b></div></div>
        ${c.notes ? `<p>📝 ${esc(c.notes)}</p>` : ''}
        <div class="actions"><button class="printBtn" data-print="${esc(id)}">🖨️ IMPRIMIR COMANDA</button>${states.map(s => `<button class="${o.status===s?'active':''}" data-status="${esc(s)}" data-id="${esc(id)}">${s.toUpperCase()}</button>`).join('')}</div>
      </article>`;
    }).join('') : '<div class="empty">Nenhum pedido no caixa atual.</div>';

    const statOrders = document.getElementById('statOrders');
    const statNew = document.getElementById('statNew');
    const statTotal = document.getElementById('statTotal');
    if (statOrders) statOrders.textContent = rows.length;
    if (statNew) statNew.textContent = rows.filter(x => x[1].status === 'recebido').length;
    if (statTotal) statTotal.textContent = money(rows.reduce((s,x) => s + Number(x[1].total || 0), 0));
  }

  async function loadCutoff(db) {
    try {
      const snap = await db.ref('cashClosings/' + today()).once('value');
      const v = snap.val();
      cutoff = v?.finalized ? Number(v.finalizedAt || 0) : 0;
    } catch (e) {
      console.warn('Não foi possível ler o fechamento do caixa:', e);
      cutoff = 0;
    }
  }

  function listenFixedOrders(db) {
    db.ref('orders').on('value', async snap => {
      const data = snap.val() || {};
      await loadCutoff(db);
      fixOrders = Object.entries(data)
        .filter(([id,o]) => Number(o?.createdAt || 0) > cutoff)
        .sort((a,b) => Number(b[1]?.createdAt || 0) - Number(a[1]?.createdAt || 0));
      render();
    });
    db.ref('cashClosings/' + today()).on('value', snap => {
      const v = snap.val();
      cutoff = v?.finalized ? Number(v.finalizedAt || 0) : 0;
      fixOrders = fixOrders.filter(([id,o]) => Number(o?.createdAt || 0) > cutoff);
      render();
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    patchFirebaseGet();

    const search = document.getElementById('orderSearch');
    const status = document.getElementById('statusFilter');
    if (search) search.addEventListener('input', e => { filterText = e.target.value; render(); });
    if (status) status.addEventListener('change', e => { filterStatus = e.target.value; render(); });

    // O Firebase do admin.js já foi inicializado neste ponto. Reutilizamos a mesma conexão.
    setTimeout(() => {
      try {
        if (!window.firebase) return;
        const db = firebase.database();
        listenFixedOrders(db);
      } catch (e) {
        console.warn('Painel de caixa auxiliar:', e);
      }
    }, 100);
  });

  // Atualiza o tempo exibido sem alterar o estado do Firebase.
  setInterval(() => {
    if (fixOrders.length) render();
  }, 1000);
})();
