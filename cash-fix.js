/* Akatsuky - correção do login do Caixa
   O Firebase compat pode retornar um DataSnapshot somente pelo once('value').
   Esta correção garante que chamadas antigas a ref.get() recebam um snapshot válido.
*/
(function () {
  'use strict';

  function patchDatabaseGet() {
    try {
      if (!window.firebase || typeof firebase.database !== 'function') return false;
      const ref = firebase.database().ref('__akatsuky_probe__');
      const proto = Object.getPrototypeOf(ref);
      if (!proto || proto.__akatsukyGetPatched) return true;

      const originalGet = proto.get;
      proto.get = function () {
        const self = this;
        return self.once('value').then(function (snapshot) {
          if (snapshot && typeof snapshot.val === 'function') return snapshot;
          if (originalGet) return Promise.resolve(originalGet.apply(self, arguments));
          return snapshot;
        });
      };
      proto.__akatsukyGetPatched = true;
      return true;
    } catch (e) {
      console.warn('Akatsuky cash fix:', e);
      return false;
    }
  }

  // Executa imediatamente e novamente antes dos handlers de login.
  patchDatabaseGet();
  window.addEventListener('DOMContentLoaded', patchDatabaseGet);
  window.addEventListener('load', patchDatabaseGet);
})();
