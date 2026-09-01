(() => {
  'use strict';

  const DEFAULT_RULES = { aguasDeLindoia: 4, outrasCidades: 8 };
  let rules = { ...DEFAULT_RULES };
  let patched = false;
  let lastAddressKey = '';
  const listeners = new Set();
  let lastAutoCep = '';
  let autoCepTimer = null;

  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  function getAddressKey() {
    const city = document.getElementById('city')?.value || '';
    const uf = document.getElementById('uf')?.value || '';
    const cep = document.getElementById('cep')?.value || '';
    return `${normalize(city)}|${normalize(uf)}|${String(cep).replace(/\D/g, '')}`;
  }

  function getFee() {
    const city = document.getElementById('city')?.value || '';
    const uf = normalize(document.getElementById('uf')?.value || '');
    const isAguas = uf === 'sp' && normalize(city) === 'aguas de lindoia';
    return Number(isAguas ? rules.aguasDeLindoia : rules.outrasCidades) || 0;
  }

  function notify(force = false) {
    const key = getAddressKey();
    if (!force && key === lastAddressKey) return;
    lastAddressKey = key;
    const value = getFee();
    listeners.forEach(fn => { try { fn({ val: () => value }); } catch (e) {} });
    document.dispatchEvent(new CustomEvent('akatsuky:delivery-fee', { detail: { fee: value } }));
  }

  function bindAddress() {
    ['cep','city','uf','street','neighborhood'].forEach(id => {
      const el = document.getElementById(id);
      if (!el || el.dataset.deliveryRulesBound) return;
      el.dataset.deliveryRulesBound = '1';
      el.addEventListener('input', () => notify(true));
      el.addEventListener('change', () => notify(true));
    });
    notify(true);
  }

  async function autoLookupCep() {
    const cepEl = document.getElementById('cep');
    if (!cepEl) return;
    const cep = String(cepEl.value || '').replace(/\D/g, '');
    if (cep.length !== 8) {
      lastAutoCep = '';
      return;
    }
    if (cep === lastAutoCep) return;
    lastAutoCep = cep;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error('Falha na consulta');
      const data = await response.json();
      if (data.erro) throw new Error('CEP não encontrado');

      const values = {
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        uf: data.uf || ''
      };
      Object.entries(values).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) {
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      notify(true);
    } catch (e) {
      console.warn('Consulta automática de CEP:', e.message || e);
    }
  }

  function bindAutoCep() {
    const cep = document.getElementById('cep');
    if (!cep || cep.dataset.autoCepBound) return;
    cep.dataset.autoCepBound = '1';

    const button = document.getElementById('searchCep');
    if (button) button.style.display = 'none';

    const trigger = () => {
      clearTimeout(autoCepTimer);
      const digits = String(cep.value || '').replace(/\D/g, '');
      if (digits.length !== 8) {
        lastAutoCep = '';
        return;
      }
      autoCepTimer = setTimeout(autoLookupCep, 250);
    };

    cep.addEventListener('input', trigger);
    trigger();
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
    bindAutoCep();
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindAddress();
    bindAutoCep();
    setTimeout(bindAddress, 300);
    setTimeout(bindAutoCep, 300);
    setTimeout(bindAddress, 1000);
    setTimeout(bindAutoCep, 1000);
    setInterval(() => {
      bindAddress();
      bindAutoCep();
      notify(false);
    }, 500);
  });

  start();
  window.AKATSUKY_DELIVERY_RULES = {
    getFee,
    getRules: () => ({ ...rules }),
    setRules: value => { normalizeRules(value); notify(true); }
  };
})();
