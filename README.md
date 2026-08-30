# Akatsuky Delivery Sushi — versão com promoções e imagens

Arquivos principais:
- index.html
- style.css
- app.js
- manifest.json
- sw.js

## Campos novos suportados nos produtos do Firebase

Dentro de `settings/menu/items`, cada produto pode ter:
- `image`: URL da imagem
- `promoPrice`: preço promocional
- `featured`: true/false
- `available`: true/false

Exemplo:
{
  "id": 1,
  "cat": "Temaki",
  "name": "Salmão Grelhado",
  "desc": "Descrição",
  "price": 33.9,
  "promoPrice": 29.9,
  "image": "https://seu-site/imagens/temaki.jpg",
  "featured": true,
  "available": true
}

O cliente calcula carrinho, subtotal, taxa e pedido usando o preço promocional quando ele existir.

IMPORTANTE:
Mantenha seu `firebase-config.js` atual e sua `logo.png` no mesmo diretório.
