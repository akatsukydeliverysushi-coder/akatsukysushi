(() => {
  'use strict';
  let deferredPrompt = null;
  const installBox = document.getElementById('install');
  const installBtn = document.getElementById('installBtn');

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function showInstallButton() {
    if (!installBox || isStandalone()) return;
    installBox.classList.add('show');
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (installBox) installBox.classList.remove('show');
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        try { await deferredPrompt.userChoice; } catch (_) {}
        deferredPrompt = null;
        if (installBox) installBox.classList.remove('show');
        return;
      }

      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const isAndroid = /android/i.test(navigator.userAgent);
      if (isIOS) {
        alert('No iPhone/iPad: toque em Compartilhar e depois em “Adicionar à Tela de Início”.');
      } else if (isAndroid) {
        alert('No Android: abra o menu ⋮ do navegador e escolha “Instalar aplicativo” ou “Adicionar à tela inicial”.');
      } else {
        alert('Para instalar no computador, use Chrome ou Edge. Quando aparecer a opção de instalação na barra de endereço, escolha “Instalar Akatsuky Delivery Sushi”.');
      }
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(console.warn);
    });
  }

  if (!isStandalone()) setTimeout(showInstallButton, 1200);
})();
