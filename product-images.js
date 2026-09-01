(() => {
  'use strict';

  // Imagens automáticas do cardápio.
  // Se o produto tiver "image" ou "imageUrl" salvo no Firebase,
  // a imagem cadastrada pelo restaurante sempre tem prioridade.
  const IMAGES = {
    salmon: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85',
    sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=85',
    platter: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1000&q=85',
    variety: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1000&q=85',
    rolls: 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&w=1000&q=85',
    dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1000&q=85',
    beer: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=85',
    temaki: 'https://images.unsplash.com/photo-1563612116625-3012372fccce?auto=format&fit=crop&w=1000&q=85',
    hot: 'https://images.unsplash.com/photo-1558985212-92c9777b5e58?auto=format&fit=crop&w=1000&q=85',
    sashimi: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=1000&q=85',
    ramen: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=85',
    shrimp: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1000&q=85'
  };

  const NAME_RULES = [
    [/temaki|cone/i, 'temaki'],
    [/sashimi/i, 'sashimi'],
    [/niguiri|nigiri|joe/i, 'salmon'],
    [/hot\s*holl|hot\s*roll|hot\s*philadelphia|empanad/i, 'hot'],
    [/salm[aã]o|shakemaki|philad[eé]lfia/i, 'salmon'],
    [/atum|teka|tekamaki|spice tuna/i, 'sashimi'],
    [/kani|calif[oó]rnia|kappamaki|kapamaki|hossomaki|uramaki|maki|roll/i, 'rolls'],
    [/camar[aã]o|ebi|ebiten|shrimp|guioza/i, 'shrimp'],
    [/yakissoba|ramen|massa/i, 'ramen'],
    [/sobremesa|banana|sorvete|petit|doce/i, 'dessert'],
    [/cerveja|bebida|refrigerante|coca|fanta|[aá]gua|suco|energ[eé]tico|sake|saqu[eê]|vodka|campari|whisky/i, 'beer'],
    [/combo|barca|rod[ií]zio|ninja/i, 'platter']
  ];

  function imageFor(product) {
    const name = String(product?.name || '').trim();
    const category = String(product?.cat || '').trim();
    const custom = product?.image || product?.imageUrl;
    if (custom) return custom;

    for (const [rule, key] of NAME_RULES) {
      if (rule.test(name)) return IMAGES[key];
    }

    if (/bebida/i.test(category)) return IMAGES.beer;
    if (/sobremesa/i.test(category)) return IMAGES.dessert;
    if (/temaki/i.test(category)) return IMAGES.temaki;
    if (/sashimi/i.test(category)) return IMAGES.sashimi;
    if (/combo|barca/i.test(category)) return IMAGES.platter;
    if (/quente|entrada/i.test(category)) return IMAGES.shrimp;

    // Fallback determinístico: produtos diferentes não ficam todos com a mesma foto.
    const pool = [IMAGES.sushi, IMAGES.variety, IMAGES.rolls, IMAGES.salmon, IMAGES.temaki];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
    return pool[Math.abs(hash) % pool.length];
  }

  function addImages() {
    document.querySelectorAll('.product.card').forEach(card => {
      const button = card.querySelector('[data-add]');
      if (!button) return;

      // O app.js já coloca a imagem cadastrada no Firebase.
      // Só adicionamos uma imagem quando o produto ainda não tem nenhuma.
      if (card.querySelector('.productImage')) return;

      const name = (card.querySelector('h3')?.textContent || 'Produto Akatsuky').trim();
      const category = (card.querySelector('.catname')?.textContent || '').trim();
      const img = document.createElement('img');
      img.className = 'productImage';
      img.alt = name;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      img.src = imageFor({ name, cat: category });
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
