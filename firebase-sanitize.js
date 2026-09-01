(() => {
  'use strict';
  function clean(value) {
    if (Array.isArray(value)) return value.map(clean);
    if (value && typeof value === 'object') {
      const out = {};
      Object.keys(value).forEach(k => {
        if (value[k] !== undefined) out[k] = clean(value[k]);
      });
      return out;
    }
    return value;
  }
  function patch() {
    try {
      const Ref = window.firebase?.database?.Reference;
      if (!Ref?.prototype || Ref.prototype.__akatsukySanitized) return !!Ref?.prototype;
      const originalSet = Ref.prototype.set;
      const originalUpdate = Ref.prototype.update;
      Ref.prototype.set = function(value, onComplete) {
        return originalSet.call(this, clean(value), onComplete);
      };
      Ref.prototype.update = function(values, onComplete) {
        return originalUpdate.call(this, clean(values), onComplete);
      };
      Ref.prototype.__akatsukySanitized = true;
      console.info('Akatsuky: Firebase sanitizer ativo.');
      return true;
    } catch (e) {
      console.warn('Akatsuky: sanitizer não aplicado.', e);
      return false;
    }
  }
  if (!patch()) {
    let tries = 0;
    const timer = setInterval(() => {
      if (patch() || ++tries > 50) clearInterval(timer);
    }, 100);
  }
})();
