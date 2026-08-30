(() => {
  'use strict';
  const money = n => Number(n || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

  function init() {
    const box = document.querySelector('.delivery-setting');
    if (!box || !window.firebase || !firebase.database) return;

    const oldLabel = document.getElementById('deliveryFee')?.closest('label');
    if (oldLabel) oldLabel.style.display = 'none';
    const oldButton = document.getElementById('saveDeliveryFee');
    if (oldButton) oldButton.style.display = 'none';

    if (document.getElementById('deliveryRulesEditor')) return;

    const editor = document.createElement('div');
    editor.id = 'deliveryRulesEditor';
    editor.style.cssText = 'margin-top:14px;padding:16px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.15)';
    editor.innerHTML = `
      <h3 style="margin-top:0">📍 Taxa automática por cidade</h3>
      <p class="sub">Águas de Lindóia/SP usa uma taxa e qualquer outra cidade usa a segunda taxa. O valor é aplicado automaticamente após o endereço/CEP ser informado.</p>
      <div class="delivery-setting-row" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;align-items:end">
        <label>Águas de Lindóia / SP (R$)<input id="deliveryAguas" type="number" step="0.01" min="0" value="4.00"></label>
        <label>Outras cidades (R$)<input id="deliveryOutras" type="number" step="0.01" min="0" value="8.00"></label>
        <button class="save-menu" id="saveDeliveryRules">💾 SALVAR TAXAS</button>
      </div>
      <div id="deliveryRulesSaved" class="sub" style="display:block;margin-top:10px"></div>
      <div style="margin-top:10px;font-size:.9em">🟢 Exemplo: Águas de Lindóia/SP → taxa local. 🔵 Demais cidades → taxa externa.</div>
    `;
    box.appendChild(editor);

    const db = firebase.database();
    const aguas = document.getElementById('deliveryAguas');
    const outras = document.getElementById('deliveryOutras');
    const saved = document.getElementById('deliveryRulesSaved');

    db.ref('settings/deliveryRules').on('value', snap => {
      const v = snap.val() || {};
      aguas.value = Number(v.aguasDeLindoia ?? 4).toFixed(2);
      outras.value = Number(v.outrasCidades ?? 8).toFixed(2);
      saved.textContent = `Taxas atuais: Águas de Lindóia ${money(aguas.value)} • Outras cidades ${money(outras.value)}`;
    });

    document.getElementById('saveDeliveryRules').onclick = async () => {
      const roleSnap = await db.ref('users/' + firebase.auth().currentUser.uid + '/role').get();
      if (roleSnap.val() !== 'admin') return alert('Somente o administrador pode alterar as taxas de entrega.');
      const data = {
        aguasDeLindoia: Math.max(0, Number(aguas.value || 0)),
        outrasCidades: Math.max(0, Number(outras.value || 0)),
        savedAt: Date.now()
      };
      try {
        await db.ref('settings/deliveryRules').set(data);
        // Mantém compatibilidade com versões antigas do aplicativo.
        await db.ref('settings/deliveryFee').set(data.outrasCidades);
        saved.textContent = `Taxas salvas: Águas de Lindóia ${money(data.aguasDeLindoia)} • Outras cidades ${money(data.outrasCidades)}`;
        alert('Taxas de entrega salvas com sucesso!');
      } catch (e) {
        console.error(e);
        alert('Não foi possível salvar as taxas. Verifique as regras do Firebase.');
      }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
