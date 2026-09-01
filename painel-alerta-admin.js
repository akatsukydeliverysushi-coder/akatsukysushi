(() => {
'use strict';

// Melhorias do painel ADM:
// 1) Pedidos "saiu para entrega" ficam fora da lista principal quando o filtro está em "Todos".
// 2) Pedido novo (status aguardando) gera um chamado visual + som.
// 3) O chamado continua piscando enquanto houver pedido aguardando.
// 4) O chamado some quando o pedido é aceito (status recebido).

window.addEventListener('DOMContentLoaded', () => {
  if (!window.firebase || !window.AKATSUKY_FIREBASE_CONFIG) return;

  let db = null;
  let previousWaiting = new Set();
  let firstSnapshot = true;
  let audioCtx = null;

  function unlockAudio() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = audioCtx || new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) {}
  }

  ['click', 'keydown', 'touchstart'].forEach(type => {
    window.addEventListener(type, unlockAudio, { passive: true });
  });

  function beep() {
    try {
      unlockAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      [0, 0.18, 0.36].forEach((delay, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = index === 1 ? 880 : 660;
        gain.gain.setValueAtTime(0.0001, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.22, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.17);
      });
    } catch (e) {}
  }

  function ensureAlertBox() {
    if (document.getElementById('akatsukyNewOrderAlert')) return;
    const style = document.createElement('style');
    style.id = 'akatsukyNewOrderAlertStyle';
    style.textContent = `
      #akatsukyNewOrderAlert{
        position:fixed;right:24px;top:98px;z-index:99999;
        width:min(390px,calc(100vw - 32px));
        display:none;align-items:center;gap:14px;
        padding:15px 18px;border:3px solid #ef1731;border-radius:16px;
        background:#21070c;color:#fff;box-shadow:0 12px 45px #000b;
        cursor:pointer;user-select:none;
      }
      #akatsukyNewOrderAlert.waiting{display:flex;animation:akatsukyAlertPulse .75s infinite}
      #akatsukyNewOrderAlert .bell{font-size:34px;line-height:1}
      #akatsukyNewOrderAlert .title{font-size:18px;font-weight:1000;letter-spacing:.3px}
      #akatsukyNewOrderAlert .detail{font-size:13px;color:#ffd7dc;margin-top:4px}
      #akatsukyNewOrderAlert .count{margin-left:auto;min-width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#ef1731;color:#fff;font-size:20px;font-weight:1000}
      @keyframes akatsukyAlertPulse{0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.035);filter:brightness(1.45);box-shadow:0 0 32px #ef173188}}
      @media(max-width:760px){#akatsukyNewOrderAlert{right:10px;top:86px;width:calc(100vw - 20px)}}
    `;
    document.head.appendChild(style);
    const box = document.createElement('div');
    box.id = 'akatsukyNewOrderAlert';
    box.innerHTML = '<span class="bell">🔔</span><div><div class="title">NOVO PEDIDO!</div><div class="detail">Pedido aguardando aceitação</div></div><span class="count">0</span>';
    box.title = 'Clique para ir aos pedidos aguardando';
    box.addEventListener('click', () => {
      const filter = document.getElementById('filter');
      if (filter) {
        filter.value = 'aguardando';
        filter.dispatchEvent(new Event('change'));
      }
      document.getElementById('orders')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      unlockAudio();
    });
    document.body.appendChild(box);
  }

  function getWaitingRows(data) {
    return Object.entries(data || {}).filter(([, order]) => {
      return order && String(order.status || 'aguardando').toLowerCase() === 'aguardando';
    });
  }

  function renderAlert(data) {
    ensureAlertBox();
    const rows = getWaitingRows(data);
    const ids = new Set(rows.map(([id]) => id));
    let hasNew = false;
    ids.forEach(id => { if (!previousWaiting.has(id)) hasNew = true; });

    if (!firstSnapshot && hasNew) beep();
    firstSnapshot = false;
    previousWaiting = ids;

    const box = document.getElementById('akatsukyNewOrderAlert');
    if (!box) return;
    box.classList.toggle('waiting', rows.length > 0);
    box.querySelector('.count').textContent = rows.length;
    const first = rows[0]?.[1];
    const kind = first && (first.mesa !== undefined || String(first.origem || '').toLowerCase().includes('garcom')) ? 'mesa/garçom' : 'delivery';
    box.querySelector('.detail').textContent = rows.length === 1
      ? `Pedido #${String(rows[0][0]).slice(-6)} • ${kind} • aguardando aceitação`
      : `${rows.length} pedidos aguardando aceitação • clique para ver`;
  }

  function hideDeliveryOrders() {
    const ordersBox = document.getElementById('orders');
    if (!ordersBox) return;
    const filter = document.getElementById('filter');
    const hide = !filter || filter.value === 'todos';

    ordersBox.querySelectorAll('.order').forEach(card => {
      const status = card.querySelector('.status');
      const text = String(status?.textContent || '').toLowerCase();
      const isDelivery = text.includes('saiu para entrega');
      card.style.display = hide && isDelivery ? 'none' : '';
    });
  }

  function addAcceptedStateButton() {
    document.querySelectorAll('#orders .order').forEach(card => {
      const status = card.querySelector('.status');
      const waiting = String(status?.textContent || '').toLowerCase().includes('aguardando');
      if (!waiting) return;
      if (card.querySelector('[data-status="recebido"]')) return;
      const actions = card.querySelector('.actions');
      const id = card.querySelector('[data-id]')?.getAttribute('data-id');
      if (!actions || !id) return;
      const btn = document.createElement('button');
      btn.className = 'accept';
      btn.dataset.status = 'recebido';
      btn.dataset.id = id;
      btn.textContent = '✅ ACEITAR PEDIDO';
      actions.prepend(btn);
    });
  }

  function watchDom() {
    const ordersBox = document.getElementById('orders');
    if (!ordersBox) return;
    const observer = new MutationObserver(() => {
      hideDeliveryOrders();
      addAcceptedStateButton();
    });
    observer.observe(ordersBox, { childList: true, subtree: true });
    hideDeliveryOrders();
    addAcceptedStateButton();

    const filter = document.getElementById('filter');
    if (filter) filter.addEventListener('change', () => setTimeout(hideDeliveryOrders, 0));
  }

  try {
    firebase.initializeApp(window.AKATSUKY_FIREBASE_CONFIG);
    db = firebase.database();
    firebase.auth().onAuthStateChanged(user => {
      if (!user || !db) return;
      db.ref('orders').on('value', snap => renderAlert(snap.val() || {}));
      watchDom();
    });
  } catch (e) {
    console.warn('AKATSUKY painel-alerta-admin:', e);
  }
});
})();
