(() => {
'use strict';
window.addEventListener('DOMContentLoaded', () => {
  const mesa = document.getElementById('mesa');
  const delivery = document.getElementById('delivery');
  const frame = document.querySelector('iframe');
  if (!mesa || !delivery) return;

  let audioCtx = null;
  let previousWaiting = new Set();
  let firstSnapshot = true;
  let db = null;

  function unlockAudio() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = audioCtx || new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (_) {}
  }

  ['click','keydown','touchstart'].forEach(type =>
    window.addEventListener(type, unlockAudio, { passive: true })
  );

  function sound() {
    try {
      unlockAudio();
      if (!audioCtx) return;
      const t = audioCtx.currentTime;
      [0, .18, .36].forEach((delay, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = i === 1 ? 880 : 660;
        gain.gain.setValueAtTime(.0001, t + delay);
        gain.gain.exponentialRampToValueAtTime(.25, t + delay + .02);
        gain.gain.exponentialRampToValueAtTime(.0001, t + delay + .16);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + .18);
      });
    } catch (_) {}
  }

  function getIframeDocument() {
    try { return frame && frame.contentDocument; } catch (_) { return null; }
  }

  function hideDeliveryCards() {
    const doc = getIframeDocument();
    if (!doc) return;
    const filter = doc.getElementById('filter');
    const showOnlyDelivery = filter && filter.value === 'saiu para entrega';
    doc.querySelectorAll('#orders .order').forEach(card => {
      const status = (card.querySelector('.status')?.textContent || '').toLowerCase();
      const isDeliveryStatus = status.includes('saiu para entrega');
      card.style.display = (!showOnlyDelivery && isDeliveryStatus) ? 'none' : '';
    });
  }

  function openWaitingOrders() {
    const doc = getIframeDocument();
    if (!doc) return;
    const filter = doc.getElementById('filter');
    if (filter) {
      filter.value = 'todos';
      filter.dispatchEvent(new Event('change', { bubbles: true }));
    }
    setTimeout(() => {
      doc.querySelectorAll('#orders .order').forEach(card => {
        const status = (card.querySelector('.status')?.textContent || '').toLowerCase();
        card.style.display = status.includes('saiu para entrega') ? 'none' : '';
      });
      doc.getElementById('orders')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function render(snapshot) {
    const data = snapshot.val() || {};
    const waiting = Object.entries(data).filter(([, order]) =>
      order && String(order.status || 'aguardando').trim().toLowerCase() === 'aguardando'
    );

    const mesaRows = waiting.filter(([, order]) => {
      const mesaValue = String(order.mesa ?? order.table ?? '').trim();
      const origin = String(order.origem ?? order.source ?? '').toLowerCase();
      return !!mesaValue || origin.includes('garcom') || origin.includes('garçom') || origin.includes('mesa');
    });
    const deliveryRows = waiting.filter(([id]) => !mesaRows.some(([mid]) => mid === id));

    const ids = new Set(waiting.map(([id]) => id));
    let newOrder = false;
    ids.forEach(id => { if (previousWaiting.size && !previousWaiting.has(id)) newOrder = true; });
    if (!firstSnapshot && newOrder) sound();
    firstSnapshot = false;
    previousWaiting = ids;

    mesa.classList.toggle('wait', mesaRows.length > 0);
    delivery.classList.toggle('wait', deliveryRows.length > 0);
    mesa.querySelector('.n').textContent = mesaRows.length;
    delivery.querySelector('.n').textContent = deliveryRows.length;
    mesa.querySelector('b').textContent = mesaRows.length ? '🔔 NOVO PEDIDO DE MESA / GARÇOM' : '🍽️ PEDIDOS DE MESA / GARÇOM';
    delivery.querySelector('b').textContent = deliveryRows.length ? '🔔 NOVO PEDIDO DELIVERY' : '🛵 PEDIDOS DELIVERY';
    mesa.querySelector('small').textContent = mesaRows.length ? 'CLIQUE PARA ABRIR • AGUARDANDO ACEITE' : 'Nenhum pedido de mesa aguardando';
    delivery.querySelector('small').textContent = deliveryRows.length ? 'CLIQUE PARA ABRIR • AGUARDANDO ACEITE' : 'Nenhum pedido delivery aguardando';

    hideDeliveryCards();
  }

  function start() {
    try {
      if (!window.firebase || !window.AKATSUKY_FIREBASE_CONFIG) return;
      if (!firebase.apps.length) firebase.initializeApp(window.AKATSUKY_FIREBASE_CONFIG);
      db = firebase.database();
      firebase.auth().onAuthStateChanged(user => {
        if (!user) return;
        db.ref('orders').on('value', render, err => console.error('Alertas pedidos:', err));
      });
    } catch (e) { console.error('Alertas pedidos:', e); }
  }

  mesa.addEventListener('click', openWaitingOrders);
  delivery.addEventListener('click', openWaitingOrders);
  frame?.addEventListener('load', () => {
    hideDeliveryCards();
    try {
      frame.contentDocument?.getElementById('filter')?.addEventListener('change', hideDeliveryCards);
    } catch (_) {}
  });
  setInterval(hideDeliveryCards, 500);
  start();
});
})();
