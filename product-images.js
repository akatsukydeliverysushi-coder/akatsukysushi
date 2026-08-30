(() => {
  'use strict';

  // Imagens padrão para o cardápio. Se o produto tiver "image" ou
  // "imageUrl" salvo no Firebase, essa imagem personalizada continua tendo prioridade.
  const IMAGES = {
    sushi: 'https://images.unsplash.com/photo-1712183718506-41a054650697?auto=format&fit=crop&w=900&q=80',
    salmon: 'https://images.unsplash.com/photo-1744360515510-db7bf0f6def8?auto=format&fit=crop&w=900&q=80',
    platter: 'https://images.unsplash.com/photo-1560689011-2ceb5b1bfcb7?auto=format&fit=crop&w=900&q=80',
    variety: 'https://images.unsplash.com/photo-1736885978380-8d7d9f7d7880?auto=format&fit=crop&w=900&q=80',
    rolls: 'https://images.unsplash.com/photo-1583571560096-eb4462cdba30?auto=format&fit=crop&w=900&q=80',
    dessert: 'https://images.unsplash.com/photo-1675870793010-b73def5d5398?auto=format&fit=crop&w=900&q=80',
    beer: 'https://images.unsplash.com/photo-1779635593982-de148852cb54?auto=format&fit=crop&w=900&q=80'
  };

  function imageFor(id, category) {
    const c = String(category || '').toLowerCase();
    if (c.includes('bebida')) return IMAGES.beer;
    if (c.includes('sobremesa')) return IMAGES.dessert;
    if (c.includes('sashimi') || c.includes('nigiri')) return IMAGES.salmon;
    if (c.includes('temaki')) return IMAGES.sushi;
    if (c.includes('hossomaki') || c.includes('uramaki')) return IMAGES.rolls;
    if (c.includes('joe')) return IMAGES.variety;
    if (c.includes('combo') || c.includes('barca')) return IMAGES.platter;
    return [IMAGES.platter, IMAGES.variety, IMAGES.sushi, IMAGES.rolls][Number(id || 1) % 4];
  }

  function addImages() {
    document.querySelectorAll('.product.card').forEach(card => {
      if (card.querySelector('.productImage')) return;
      const button = card.querySelector('[data-add]');
      const category = card.querySelector('.catname')?.textContent || '';
      if (!button) return;
      const id = button.getAttribute('data-add');
      const img = document.createElement('img');
      img.className = 'productImage';
      img.alt = (card.querySelector('h3')?.textContent || 'Produto Akatsuky').trim();
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = imageFor(id, category);
      img.onerror = () => {
        img.onerror = null;
        img.src = IMAGES.sushi;
      };
      const first = card.querySelector('.catname');
      if (first) card.insertBefore(img, first);
      else card.prepend(img);
    });
  }

  const observer = new MutationObserver(addImages);
  window.addEventListener('DOMContentLoaded', () => {
    addImages();
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
