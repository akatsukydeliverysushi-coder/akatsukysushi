(() => {
  'use strict';

  // Imagens padrão do cardápio.
  // Se o produto tiver "image" ou "imageUrl" salvo no Firebase,
  // a imagem cadastrada pelo restaurante continua tendo prioridade.
  const IMAGES = {
    sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=85',
    salmon: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85',
    platter: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1000&q=85',
    variety: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1000&q=85',
    rolls: 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&w=1000&q=85',
    dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1000&q=85',
    beer: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=85'
  };

  function imageFor(id, category) {
    const c = String(category || '').toLowerCase();
    if (c.includes('bebida')) return IMAGES.beer;
    if (c.includes('sobremesa')) return IMAGES.dessert;
    if (c.includes('sashimi') || c.includes('nigiri')) return IMAGES.salmon;
    if (c.includes('temaki')) return IMAGES.sushi;
    if (c.includes('hossomaki') || c.includes('uramaki') || c.includes('hot holl')) return IMAGES.rolls;
    if (c.includes('joe')) return IMAGES.variety;
    if (c.includes('combo') || c.includes('barca')) return IMAGES.platter;
    return [IMAGES.platter, IMAGES.variety, IMAGES.sushi, IMAGES.rolls][Number(id || 1) % 4];
  }

  function addImages() {
    document.querySelectorAll('.product.card').forEach(card => {
      const button = card.querySelector('[data-add]');
      if (!button) return;
      if (card.querySelector('.productImage')) return;

      const category = card.querySelector('.catname')?.textContent || '';
      const id = button.getAttribute('data-add');
      const img = document.createElement('img');
      img.className = 'productImage';
      img.alt = (card.querySelector('h3')?.textContent || 'Produto Akatsuky').trim();
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      img.src = imageFor(id, category);
      img.onerror = () => {
        if (img.dataset.fallback === '1') return;
        img.dataset.fallback = '1';
        img.src = IMAGES.sushi;
      };

      const first = card.querySelector('.catname');
      if (first) card.insertBefore(img, first);
      else card.prepend(img);
    });
  }

  function start() {
    addImages();
    const observer = new MutationObserver(addImages);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
