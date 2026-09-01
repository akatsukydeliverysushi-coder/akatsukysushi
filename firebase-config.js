window.AKATSUKY_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAbiPpJpBi0HGTSAoB9NYjbOOvbBpiXPYc",
  authDomain: "akatsuky-delivery-5b1db.firebaseapp.com",
  databaseURL: "https://akatsuky-delivery-5b1db-default-rtdb.firebaseio.com",
  projectId: "akatsuky-delivery-5b1db",
  storageBucket: "akatsuky-delivery-5b1db.firebasestorage.app",
  messagingSenderId: "207130261943",
  appId: "1:207130261943:web:694b5d913acf16aecc1032",
  measurementId: "G-L7DE6BM973"
};

// Mantém a autenticação isolada por aba/janela.
// Isso evita que ADM e Garçom compartilhem a mesma sessão quando
// os dois painéis são usados no mesmo navegador para testes.
(function(){
  try{
    if(window.firebase && typeof firebase.auth === 'function'){
      const auth=firebase.auth();
      auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .then(()=>console.log('AKATSUKY: persistência de autenticação SESSION configurada.'))
        .catch(e=>console.warn('AKATSUKY: falha ao configurar SESSION:',e));
    }
  }catch(e){console.warn('AKATSUKY: erro na configuração da persistência:',e)}
})();

// Gate de autenticação do Garçom. A autorização definitiva é feita pelas Firebase Rules.
(function(){
  if(!/\/garcom\.html(?:$|\?)/.test(location.pathname)) return;
  const css=document.createElement('style');
  css.textContent='#garcomAuthGate{position:fixed;inset:0;z-index:99999;background:#111;display:flex;align-items:center;justify-content:center;padding:18px;font-family:Arial,sans-serif}#garcomAuthBox{width:min(420px,100%);background:#fff;border-radius:18px;padding:24px;box-shadow:0 12px 50px #0008}#garcomAuthBox h2{margin-top:0}#garcomAuthBox input{width:100%;padding:13px;margin:7px 0;border:1px solid #ccc;border-radius:9px;box-sizing:border-box}#garcomAuthBox button{width:100%;padding:13px;margin-top:8px;border:0;border-radius:9px;background:#111;color:#fff;font-weight:800;cursor:pointer}#garcomAuthMsg{margin-top:10px;color:#a00;font-size:14px;min-height:18px}';
  document.head.appendChild(css);
  const gate=document.createElement('div'); gate.id='garcomAuthGate';
  gate.innerHTML='<div id="garcomAuthBox"><h2>👨‍🍳 Akatsuky Garçom</h2><p>Entre com a conta autorizada do garçom.</p><input id="garcomEmail" type="email" autocomplete="username" placeholder="E-mail"><input id="garcomPassword" type="password" autocomplete="current-password" placeholder="Senha"><button id="garcomLogin">ENTRAR</button><div id="garcomAuthMsg"></div></div>';
  document.documentElement.appendChild(gate);
  function msg(t){document.getElementById('garcomAuthMsg').textContent=t||''}
  const base='https://www.gstatic.com/firebasejs/10.14.1/';
  function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  (async function(){
    try{
      await load(base+'firebase-app-compat.js');
      await load(base+'firebase-auth-compat.js');
      await load(base+'firebase-database-compat.js');
      const app=firebase.apps.length?firebase.app():firebase.initializeApp(window.AKATSUKY_FIREBASE_CONFIG);
      const auth=app.auth(), db=app.database();
      await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
      document.getElementById('garcomLogin').onclick=async function(){
        const email=document.getElementById('garcomEmail').value.trim(), password=document.getElementById('garcomPassword').value;
        if(!email||!password){msg('Informe e-mail e senha.');return}
        msg('Entrando...');
        try{await auth.signInWithEmailAndPassword(email,password)}catch(e){msg('Não foi possível entrar. Verifique e-mail e senha.');console.error(e)}
      };
      auth.onAuthStateChanged(async user=>{
        if(!user){gate.style.display='flex';return}
        try{
          const snap=await db.ref('users/'+user.uid+'/role').once('value');
          const role=snap.val();
          if(role!=='garcom'){
            msg('Esta conta não tem permissão de Garçom.');
            await auth.signOut();
            return;
          }
          gate.style.display='none';
          window.AKATSUKY_GARCOM_AUTH={uid:user.uid,email:user.email,role};
        }catch(e){console.error(e);msg('Não foi possível validar a permissão desta conta.');await auth.signOut()}
      });
    }catch(e){console.error(e);msg('Erro ao carregar autenticação.');}
  })();
})();
