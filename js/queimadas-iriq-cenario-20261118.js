/* IRIQ 4C — Cenário de triagem, não homologado (2026-11-18).
   Todas as telas continuam apresentando os dados do projeto; este aviso
   impede que notas aproximadas sejam confundidas com decisão oficial. */
(function(){
  'use strict';
  const VERSAO='IRIQ-4C-2026-11-v2-TRIAGEM';
  function fmt(v){const n=Number(v);return Number.isFinite(n)?n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';}
  function avisar(){
    if(document.getElementById('iriqAvisoProvisorio'))return;
    const aviso=document.createElement('aside');
    aviso.id='iriqAvisoProvisorio';
    aviso.setAttribute('role','status');
    aviso.style.cssText='position:sticky;top:0;z-index:10020;background:#fff7ed;color:#7c2d12;border-bottom:2px solid #ea580c;padding:9px 14px;font:600 13px/1.45 system-ui,sans-serif;text-align:center;box-shadow:0 2px 7px #00000015';
    aviso.innerHTML='⚠️ <strong>IRIQ DOS 52 MUNICÍPIOS — CENÁRIO PRELIMINAR NÃO HOMOLOGADO</strong> · Fórmula: R 30% + IPT 10% + AQ 35% + DES 25%. Notas de IPT e risco ainda utilizam aproximações onde faltam evidências. Não utilizar isoladamente para decisões de fiscalização. <small style="white-space:nowrap">Versão '+VERSAO+'</small>';
    document.body.prepend(aviso);
  }
  async function atualizarQuadro(){
    const sec=document.getElementById('iriqConferencia');
    if(!sec)return;
    const client=window.clientQueimadas;
    if(!client||!client.from)return;
    const {data,error}=await client.from('queimadas_heatmap').select('municipio,iriq,classificacao').order('iriq',{ascending:false});
    if(error||!Array.isArray(data)||data.length!==52){console.warn('IRIQ 4C: quadro não carregado',error);return;}
    sec.innerHTML='<h2>IRIQ — 52 MUNICÍPIOS · SIMULAÇÃO NÃO HOMOLOGADA</h2>'+
      '<p>Valores calculados com os pesos 30% R, 10% IPT, 35% AQ e 25% DES. Dados aproximados nos municípios sem validação documental. Não equivalem a pontuação homologada.</p>'+
      '<div style="max-height:380px;overflow:auto"><table style="width:100%;border-collapse:collapse;text-align:left">'+
      '<thead><tr><th>Posição</th><th>Município</th><th>IRIQ provisório</th><th>Faixa provisória</th></tr></thead><tbody>'+
      data.map((d,i)=>'<tr><td>'+(i+1)+'</td><td>'+String(d.municipio||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))+'</td><td>'+fmt(d.iriq)+'</td><td>'+String(d.classificacao||'—')+'</td></tr>').join('')+
      '</tbody></table></div>'+
      '<p class="fonte-card">Fonte: base TCE-RO, cenário '+VERSAO+' · MapBiomas e PRODES com período histórico ainda sujeito a comprovação · IPT/R não homologados.</p>';
  }
  document.addEventListener('DOMContentLoaded',()=>{
    avisar();
    atualizarQuadro();
  });
  window.iriqCenarioVersao=VERSAO;
})();