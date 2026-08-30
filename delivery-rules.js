(() => {
  'use strict';

  const DEFAULT_RULES = { aguasDeLindoia: 4, outrasCidades: 8 };
  let rules = { ...DEFAULT_RULES };
  let patched = false;
  const listeners = new Set();

  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  function getFee() {
    const city = document.getElementById('city')?.value || '';
    const uf = normalize(document.getElementById('uf')?.value || '');
    const isAguas = uf === 'sp' && normalize(city) === 'aguas de lindoia';
    return Number(isAguas ? rules.aguasDeLindoia : rules.outrasCidades) || 0;
  }

  function notify() {
    const value = getFee();
    listeners.forEach(fn => { try { fn({ val: () => value }); } catch (e) {} });
    document.dispatchEvent(new CustomEvent('akatsuky:delivery-fee', { detail: { fee: value } }));
  }

  function bindAddress() {
    ['cep','city','uf','street','neighborhood'].forEach(id => {
      const el = document.getElementById(id);
      if (!el || el.dataset.deliveryRulesBound) return;
      el.dataset.deliveryRulesBound = '1';
      el.addEventListener('input', notify);
      el.addEventListener('change', notify);
    });
  }

  function normalizeRules(value) {
    const v = value || {};
    const aguas = Number(v.aguasDeLindoia ?? v.aguas ?? DEFAULT_RULES.aguasDeLindoia);
    const outras = Number(v.outrasCidades ?? v.outras ?? DEFAULT_RULES.outrasCidades);
    rules = {
      aguasDeLindoia: Number.isFinite(aguas) && aguas >= 0 ? aguas : DEFAULT_RULES.aguasDeLindoia,
      outrasCidades: Number.isFinite(outras) && outras >= 0 ? outras : DEFAULT_RULES.outrasCidades
    };
  }

  function patchFirebase() {
    if (patched) return true;
    if (!window.firebase || !firebase.database || !firebase.database.Database) return false;
    const proto = firebase.database.Database.prototype;
    if (!proto || !proto.ref) return false;
    const originalRef = proto.ref;
    proto.ref = function(path) {
      const ref = originalRef.call(this, path);
      if (path !== 'settings/deliveryFee') return ref;
      return {
        on: (eventType, callback, cancelCallbackOrContext, context) => {
          listeners.add(callback);
          bindAddress();
          notify();
          const rulesRef = originalRef.call(this, 'settings/deliveryRules');
          return rulesRef.on(eventType, snap => {
            normalizeRules(snap.val());
            bindAddress();
            callback({ val: () => getFee() });
          }, cancelCallbackOrContext, context);
        },
        off: () => {},
        once: async () => ({ val: () => getFee() })
      };
    };
    patched = true;
    return true;
  }

  function start() {
    if (!patchFirebase()) setTimeout(start, 100);
    bindAddress();
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindAddress();
    setTimeout(bindAddress, 300);
    setTimeout(bindAddress, 1000);
  });

  start();
  window.AKATSUKY_DELIVERY_RULES = {
    getFee,
    getRules: () => ({ ...rules }),
    setRules: value => { normalizeRules(value); notify(); }
  };
})();
