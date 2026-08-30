(() => {
  'use strict';
  function createStatus() {
    if (document.getElementById('mobileStoreStatus')) return document.getElementById('mobileStoreStatus');
    const el = document.createElement('div');
    el.id = 'mobileStoreStatus';
    el.setAttribute('role','status');
    el.textContent = '🟢 LOJA ABERTA';
    Object.assign(el.style, {
      position:'fixed', top:'12px', left:'50%', transform:'translateX(-50%)',
      zIndex:'9999', padding:'9px 18px', borderRadius:'999px',
      fontWeight:'800', fontSize:'14px', letterSpacing:'.3px',
      border:'1px solid rgba(255,255,255,.2)', boxShadow:'0 8px 25px rgba(0,0,0,.35)',
      color:'#fff', background:'#16a34a', backdropFilter:'blur(8px)',
      cursor:'default', textAlign:'center'
    });
    document.body.appendChild(el);
    return el;
  }
  function setStatus(open) {
    const el = createStatus();
    el.textContent = open ? '🟢 LOJA ABERTA' : '🔴 LOJA FECHADA';
    el.style.background = open ? '#16a34a' : '#dc2626';
  }
  function start() {
    if (!window.firebase || !window.AKATSUKY_FIREBASE_CONFIG) return setTimeout(start, 500);
    try {
      const app = firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(window.AKATSUKY_FIREBASE_CONFIG);
      const database = firebase.database(app);
      database.ref('settings/storeOpen').on('value', snap => setStatus(snap.val() !== false), () => setStatus(true));
    } catch (e) {
      console.error('store-status:', e);
      setStatus(true);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
