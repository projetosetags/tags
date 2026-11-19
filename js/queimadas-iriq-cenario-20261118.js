/* IRIQ 4C — Cenário de triagem, não homologado (2026-11-18).
   Todas as telas continuam apresentando os dados do projeto; este aviso
   impede que notas aproximadas sejam confundidas com decisão oficial. */
(function(){
  'use strict';
/* Fonte única do IRIQ proporcional usada pelos painéis e relatórios.
   Os valores seguem como cenário preliminar, sem homologação. */
let promessaIRIQBaseMunicipal=null;
window.carregarIRIQBaseMunicipal=async function(){
  if(!promessaIRIQBaseMunicipal)promessaIRIQBaseMunicipal=fetch('./data/iriq-cenario-20261118.json?v=20261119-5',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Base municipal IRIQ indisponível');return r.json()}).then(j=>{
    const pesos=[0.30,0.10,0.35,0.25],chaves=['r100','ipt100','aq100','des100'];
    const dados=(j.municipios||[]).map(x=>{
      const bruto=chaves.map(k=>Number(x[k])||0),soma=bruto.reduce((a,v,i)=>a+v*pesos[i],0);
      const alvo=Number(x.iriq_original),fator=soma>0?alvo/soma:0;
      const notas=bruto.map(v=>v*fator),pontos=notas.map((v,i)=>v*pesos[i]);
      const faixa=alvo>=75?'CRÍTICO':alvo>=50?'ALTO':alvo>=25?'MODERADO':'BAIXO';
      return {...x,focos:Number(x.focos)||0,area_queimada_ha:Number(x.area_queimada_ha)||0,desmatamento_ha:Number(x.desmatamento_ha)||0,
        indice_final:alvo,iriq:alvo,pontuacao_iriq:alvo,classificacao:faixa,nivel:faixa,
        risco:Number(x.risco_original??x.risco_maximo_5x5??0),
        r100_proporcional:notas[0],ipt100_proporcional:notas[1],aq100_proporcional:notas[2],des100_proporcional:notas[3],
        pontos_risco:pontos[0],pontos_ipt:pontos[1],pontos_area_queimada:pontos[2],pontos_desmatamento:pontos[3],
        iriq_total_proporcional:pontos.reduce((a,v)=>a+v,0),fonte_iriq:'BASE PROPORCIONAL DO PROJETO',
        status_validacao:x.status_validacao||j.status};
    }).sort((a,b)=>b.iriq-a.iriq);
    return {data:dados,error:null,versao:j.versao,status:j.status,data_atualizacao:j.data_atualizacao};
  }).catch(error=>({data:[],error}));
  return promessaIRIQBaseMunicipal;
};

  const VERSAO='IRIQ-4C-2026-11-v2-TRIAGEM';
  function fmt(v){const n=Number(v);return Number.isFinite(n)?n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';}
  function renderProporcional(){
    const host=document.getElementById('iriqProporcionalTabela');
    const resumo=document.getElementById('iriqProporcionalResumo');
    if(!host||!resumo)return;
    fetch('data/iriq-cenario-20261118.json?v=20261119-2',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Dados indisponíveis');return r.json()}).then(j=>{
      const pesos=[0.30,0.10,0.35,0.25], chaves=['r100','ipt100','aq100','des100'];
      const confirmados={'Porto Velho':75.25,'Nova Mamoré':43.02,'Candeias do Jamari':41.06,'Buritis':28.98};
      const nfmt=v=>Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
      const rows=(j.municipios||[]).map(x=>{
        const bruto=chaves.map(k=>Number(x[k])||0),s=bruto.reduce((a,v,i)=>a+v*pesos[i],0);
        const ref=Number(x.iriq_original),k=s>0?ref/s:1,nota=bruto.map(v=>v*k),pontos=nota.map((v,i)=>v*pesos[i]);
        const rt=Object.prototype.hasOwnProperty.call(confirmados,x.municipio)&&Math.abs(confirmados[x.municipio]-ref)<0.005;
        return {municipio:x.municipio,ref,k,nota,pontos,total:pontos.reduce((a,v)=>a+v,0),rt};
      }).sort((a,b)=>b.ref-a.ref);
      const somaRef=rows.reduce((a,x)=>a+x.ref,0),media=somaRef/(rows.length||1);
      const somaComp=[0,1,2,3].map(i=>rows.reduce((a,x)=>a+x.pontos[i],0));
      const nomes=['Risco municipal','IPT','Queimadas / área queimada','Desmatamento'];
      resumo.innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin:10px 0">'+
       '<div style="padding:10px;background:#eff6ff;border-radius:8px"><strong>Soma da base municipal</strong><br>'+nfmt(somaRef)+' pontos-município</div>'+
       '<div style="padding:10px;background:#f0fdf4;border-radius:8px"><strong>Média estadual (52)</strong><br>'+nfmt(media)+' / 100</div>'+
       '<div style="padding:10px;background:#fff7ed;border-radius:8px"><strong>Municípios calculados</strong><br>'+rows.length+'</div></div>'+
       '<div style="font-size:12px;color:#475569">Soma por indicador = parcela ponderada acumulada dos municípios. Cada coluna de parcelas é parte do total de '+nfmt(somaRef)+' pontos-município.</div>'+
       '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:8px 0">'+somaComp.map((v,i)=>'<span style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:6px 8px"><strong>'+nomes[i]+':</strong> '+nfmt(v)+' ('+nfmt(somaRef?v/somaRef*100:0)+'%)</span>').join('')+'</div>';
      host.innerHTML='<div style="overflow:auto;max-height:620px"><table style="width:100%;min-width:1050px;border-collapse:collapse;font-size:12px"><caption style="text-align:left;padding:7px">Nota ajustada / pontos ponderados. Base de cenário atualizada em '+(j.data_atualizacao||'—')+'.</caption><thead><tr style="position:sticky;top:0;background:#e2e8f0"><th>Município</th><th>IRIQ-base</th><th>Fator K</th><th>Risco municipal<br><small>nota / pontos</small></th><th>IPT<br><small>nota / pontos</small></th><th>Queimadas / AQ<br><small>nota / pontos</small></th><th>Desmatamento<br><small>nota / pontos</small></th><th>Total</th><th>Referência</th></tr></thead><tbody>'+rows.map(x=>'<tr style="border-top:1px solid #e2e8f0"><td>'+x.municipio+'</td><td>'+nfmt(x.ref)+'</td><td>'+nfmt(x.k*100)+'%</td>'+x.nota.map((v,i)=>'<td>'+nfmt(v)+' <small>/ '+nfmt(x.pontos[i])+' pts</small></td>').join('')+'<td><strong>'+nfmt(x.total)+'</strong></td><td>'+(x.rt?'RT confirmado':'Base provisória')+'</td></tr>').join('')+
       '<tr style="position:sticky;bottom:0;background:#f1f5f9;font-weight:700;border-top:2px solid #94a3b8"><td>SOMATÓRIO ESTADUAL</td><td>'+nfmt(somaRef)+'</td><td>—</td>'+somaComp.map(v=>'<td>— / '+nfmt(v)+' pts</td>').join('')+'<td>'+nfmt(somaComp.reduce((a,v)=>a+v,0))+'</td><td>Não homologado</td></tr></tbody></table></div>';
    }).catch(e=>{resumo.textContent='Não foi possível carregar a distribuição proporcional: '+e.message;});
  }
  function avisar(){
    if(document.getElementById('iriqAvisoProvisorio'))return;
    const aviso=document.createElement('aside');
    aviso.id='iriqAvisoProvisorio';
    aviso.setAttribute('role','status');
    aviso.style.cssText='display:block;position:static;z-index:auto;background:transparent;color:#64748b;border:0;border-top:1px solid #e2e8f0;padding:5px 10px;margin:0;font:400 11px/1.45 system-ui,sans-serif;text-align:center;box-shadow:none;opacity:.90';
    aviso.innerHTML='<span aria-label="Nota metodológica">Nota metodológica:</span> IRIQ proporcional em cenário preliminar de triagem, ainda não homologado; componentes com estimativas sujeitos a validação. <small>Versão '+VERSAO+'</small>';
    const principal=document.getElementById('abaExecutivo')||document.querySelector('main');
    if(principal)principal.appendChild(aviso);
    else document.body.appendChild(aviso);
  }
  async function atualizarQuadro(){
    const sec=document.getElementById('iriqConferencia');
    if(!sec)return;
    const {data,error}=await window.carregarIRIQBaseMunicipal();
    if(error||!Array.isArray(data)||data.length!==52){console.warn('IRIQ 4C: quadro não carregado',error);return;}
    sec.innerHTML='<h2>IRIQ — 52 MUNICÍPIOS · SIMULAÇÃO NÃO HOMOLOGADA</h2>'+
      '<p>Valores calculados com os pesos 30% R, 10% IPT, 35% AQ e 25% DES. Dados aproximados nos municípios sem validação documental. Não equivalem a pontuação homologada.</p>'+
      '<div style="max-height:380px;overflow:auto"><table style="width:100%;border-collapse:collapse;text-align:left">'+
      '<thead><tr><th>Posição</th><th>Município</th><th>IRIQ-base proporcional</th><th>Faixa provisória</th></tr></thead><tbody>'+
      data.map((d,i)=>'<tr><td>'+(i+1)+'</td><td>'+String(d.municipio||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))+'</td><td>'+fmt(d.iriq)+'</td><td>'+String(d.classificacao||'—')+'</td></tr>').join('')+
      '</tbody></table></div>'+
      '<p class="fonte-card">Fonte: base TCE-RO, cenário '+VERSAO+' · MapBiomas e PRODES com período histórico ainda sujeito a comprovação · IPT/R não homologados.</p>';
  }
  document.addEventListener('DOMContentLoaded',()=>{
    avisar();
    renderProporcional();
    // A tabela proporcional é uma decomposição da base do projeto; não substitui o RT.
  });
  window.iriqCenarioVersao=VERSAO;
})();