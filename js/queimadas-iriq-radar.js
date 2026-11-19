/* IRIQ 4C — Radar e contribuições (18/11/2026)
 * Exclusivamente: R 30%, IPT 10%, AQ 35%, DES 25%.
 * Focos = contexto, fora da fórmula. Versão preliminar NÃO HOMOLOGADA.
 */
(function(){
'use strict';
const COLORS=['#2563eb','#0d9488','#ea580c','#7c3aed'];
const LABELS=['Risco Municipal','IPT','Área Queimada','Desmatamento'];
const WEIGHTS=[0.30,0.10,0.35,0.25];
const FORMAT=new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
let cache=null,loading=null;
const charts={};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>Number(v)||0;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const fmt=v=>FORMAT.format(num(v));
function normalizarRegisto(x){
 const brutos=[num(x.risco_municipal??x.r100),num(x.ipt??x.ipt100),num(x.area_queimada??x.aq100),num(x.desmatamento??x.des100)];
 const pontosCenario=brutos.map((v,i)=>v*WEIGHTS[i]);
 const iriqCenario=num(x.iriq_provisorio??pontosCenario.reduce((s,v)=>s+v,0));
 const referencia=x.iriq_original??x.iriq_armazenado??x.iriq;
 const iriqBase=referencia==null?iriqCenario:num(referencia);
 const fator=iriqCenario>0?iriqBase/iriqCenario:1;
 const vals=brutos.map(v=>v*fator);
 const pontos=vals.map((v,i)=>v*WEIGHTS[i]);
 const soma=pontos.reduce((s,v)=>s+v,0);
 const scoresRT={'Porto Velho':75.25,'Nova Mamoré':43.02,'Candeias do Jamari':41.06,'Buritis':28.98};
 const confirmadoRT=Object.prototype.hasOwnProperty.call(scoresRT,x.municipio||'')&&Math.abs(scoresRT[x.municipio||'']-iriqBase)<0.005;
 return {municipio:x.municipio||'',valores:vals,valores_cenario:brutos,pontos,pontos_cenario:pontosCenario,percentuais:pontos.map(v=>soma>0?100*v/soma:0),
 iriq:iriqBase,iriq_original:x.iriq_original==null?null:num(x.iriq_original),
 iriq_cenario:iriqCenario,fator_calibracao:fator,referencia_confirmada_rt:confirmadoRT,
 risco_maximo_5x5:x.risco_maximo_5x5==null?null:num(x.risco_maximo_5x5),
 risco_original:x.risco_original==null?null:num(x.risco_original),
 focos:num(x.focos),origem_ipt:x.origem_ipt||'',origem_r:x.origem_r||'',
 status:x.status_validacao||'SIMULACAO_NAO_HOMOLOGADA',
 versao:x.versao_metodo||'IRIQ-4C-2026-11-v2-TRIAGEM'};
}
async function dados(){
 if(cache)return cache;
 if(loading)return loading;
 loading=(async()=>{
   let rows=null,estado=null,origem='Supabase';
   const c=window.clientQueimadas;
   try{
    if(c&&typeof c.from==='function'){
      const [a,b]=await Promise.all([
        c.from('vw_iriq_componentes_municipio').select('*').order('iriq',{ascending:false}),
        c.from('vw_iriq_componentes_estado').select('*').maybeSingle()
      ]);
      if(!a.error&&Array.isArray(a.data)&&a.data.length===52){
        rows=a.data;estado=b.error?null:b.data;
      }else console.warn('IRIQ radar: usando cópia verificada; visão inacessível',a.error,b.error);
    }
   }catch(e){console.warn('IRIQ radar: fallback JSON',e)}
   if(!rows){
     origem='Cópia consolidada 18/11/2026';
     const r=await fetch('data/iriq-cenario-20261118.json?v=20261118-1',{cache:'no-store'});
     if(!r.ok)throw Error('Sem dados de IRIQ: '+r.status);
     const j=await r.json();
     rows=j.municipios;
     if(!Array.isArray(rows)||rows.length!==52)throw Error('O arquivo não contém os 52 municípios');
   }
   const municipios=rows.map(normalizarRegisto).sort((a,b)=>b.iriq-a.iriq);
   let geral;
   if(estado){
     geral=normalizarRegisto({municipio:'Rondônia (média de 52 municípios)',
       risco_municipal:estado.risco_medio,ipt:estado.ipt_medio,area_queimada:estado.aq_media,
       desmatamento:estado.des_medio,iriq:estado.iriq_medio,
       focos:estado.focos_base_cenario});
     // Evitar erro de arredondamento da média: usa médias das parcelas originais quando disponíveis.
     geral.pontos=[num(estado.contrib_risco),num(estado.contrib_ipt),num(estado.contrib_aq),num(estado.contrib_des)];
     const s=geral.pontos.reduce((v,x)=>v+x,0);
     geral.percentuais=geral.pontos.map(v=>s?100*v/s:0);
   }else{
     const media=k=>municipios.reduce((s,m)=>s+m[k],0)/municipios.length;
     const vals=LABELS.map((_,i)=>municipios.reduce((s,m)=>s+m.valores[i],0)/municipios.length);
     const pontos=LABELS.map((_,i)=>municipios.reduce((s,m)=>s+m.pontos[i],0)/municipios.length);
     const sum=pontos.reduce((a,b)=>a+b,0);
     geral={municipio:'Rondônia (média de 52 municípios)',valores:vals,pontos,
       percentuais:pontos.map(v=>sum?100*v/sum:0),iriq:media('iriq'),
       focos:municipios.reduce((s,m)=>s+m.focos,0),
       status:'SIMULACAO_NAO_HOMOLOGADA',versao:'IRIQ-4C-2026-11-v2-TRIAGEM'};
   }
   cache={municipios,geral,origem};
   return cache;
 })();
 try{return await loading}finally{loading=null}
}
function cardHTML(prefix,titulo,temSeletor){
 return '<section class="cardExecutivo iriqRadarBloco" id="'+prefix+'-bloco" style="margin:14px 0;padding:18px;border:1px solid #dbeafe;border-radius:13px;background:#fff">'+
 '<h2 style="margin:0 0 5px;color:#164e63">📡 '+titulo+'</h2>'+
 '<p style="font-size:13px;color:#475569">Componentes usados na fórmula definida: R 30% + IPT 10% + AQ 35% + DES 25%. O radar mostra índices normalizados do cenário; as barras mostram a parcela ponderada estimada. <strong>Não homologado: não substitui a pontuação armazenada no RT.</strong></p>'+
 (temSeletor?'<label style="display:block;margin:10px 0">Município: <select id="'+prefix+'-seletor" aria-label="Selecionar município no radar" style="padding:9px;max-width:100%;min-width:220px;border:1px solid #cbd5e1;border-radius:6px"></select></label>':'')+
 '<div class="iriqRadarGrade" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(285px,1fr));gap:16px;align-items:start">'+
 '<div><h3 style="font-size:15px">Radar: intensidade dos indicadores</h3><div style="position:relative;height:300px"><canvas id="'+prefix+'-radar" role="img" aria-label="Radar dos quatro indicadores do IRIQ"></canvas></div></div>'+
 '<div><h3 style="font-size:15px">Como os componentes se repartem no total?</h3><div style="position:relative;height:245px"><canvas id="'+prefix+'-barras" role="img" aria-label="Barras com percentuais de contribuição do IRIQ"></canvas></div>'+
 '<div id="'+prefix+'-legenda" style="font-size:13px;margin-top:7px"></div></div></div>'+
 '<div id="'+prefix+'-contexto" style="background:#f8fafc;padding:10px;border-radius:8px;font-size:12px;margin-top:13px"></div>'+
 '<details style="margin-top:10px;padding:10px 12px;border:1px solid #dbeafe;border-radius:8px;background:#f8fafc;color:#334155;font-size:12px;line-height:1.55">'+
 '<summary style="cursor:pointer;font-weight:700;color:#164e63">Como usar e calcular o Risco Municipal</summary>'+
 '<div style="margin-top:8px"><p><strong>Escala:</strong> quando existe matriz municipal 5×5, a nota bruta de risco (probabilidade × impacto, máximo 25) é convertida para 0–100 por R = 100 × nota/25. Assim, 25/25 vira 100/100. Isso é uma pontuação de matriz, não probabilidade de queimadas.</p>'+
 '<p><strong>Estimativas:</strong> na base de cenário de 18/11/2026, 10 dos 52 municípios estão marcados como MATRIZ_5X5; 41 usam PROXY_QUINTIS_FOCOS, convertendo posição relativa em quintis para 20, 40, 60, 80 ou 100; e 1 usa HEATMAP_HISTORICO_NAO_RECONCILIADO. Os três tipos continuam em cenário não homologado. O proxy por focos mede posição relativa nessa base, não risco absoluto, e não deve ser tratado como matriz validada.</p>'+
 '<p><strong>Distinção:</strong> este Risco Municipal não é o Risco de Fogo do INPE. O índice do INPE considera principalmente precipitação acumulada nos 120 dias anteriores, além de temperatura máxima, umidade relativa mínima, vegetação e ocorrência de focos. Consulte a <a href="https://data.inpe.br/queimadas/faq/" target="_blank" rel="noopener">metodologia oficial do Programa Queimadas</a>.</p>'+
 '<p><strong>IRIQ e ajuste proporcional:</strong> primeiro calcula-se o cenário bruto S = 0,30×R + 0,10×IPT + 0,35×AQ + 0,25×DES. Depois, para cada município, K = IRIQ-base/S; cada nota ajustada = nota bruta×K; pontos ponderados = nota ajustada×peso. Assim, a soma dos quatro pontos ponderados fecha exatamente no IRIQ-base municipal. IPT usa o teto 20; AQ e DES são normalizados pelo maior valor municipal da base do cenário.</p>'+
 '<p><strong>Porto Velho:</strong> cenário bruto 100; referência-base 75,25; fator K=75,25%. Como os quatro valores brutos são 100, cada nota ajustada passa a 75,25. Os pontos ponderados ficam R=22,575, IPT=7,525, AQ=26,3375 e DES=18,8125; total=75,25. A linha mantém divergência a reconciliar entre risco_original=90 e risco normalizado 100.</p>'+
 '<p><strong>Somatório estadual:</strong> a soma dos 52 IRIQs-base é uma soma de pontos-município, não um índice estadual. A média simples dos 52 é apresentada à parte. Os totais proporcionais por componente devem somar o total estadual da base.</p>'+
 '<p><strong>Como aumentar a precisão:</strong> substituir proxies por matrizes municipais documentadas, com probabilidade, impacto, período, evidência e responsável; reconciliar o heatmap histórico; validar os períodos e denominadores de AQ/DES e a base do IPT; depois recalcular e homologar.</p></div></details>'+
 '</section>';
}
function mount(){
 const initial=document.getElementById('iriqConferencia');
 if(initial&&!document.getElementById('iriq-geral-bloco')){
   initial.insertAdjacentHTML('beforebegin',cardHTML('iriq-geral','IRIQ estadual — comparativo dos 52 municípios',false));
 }
 const municipality=document.getElementById('abaExecutivoMunicipal');
 if(municipality&&!document.getElementById('iriq-municipal-bloco')){
   const inner=municipality.querySelector('#painelTabelaMunicipios');
   if(inner)inner.insertAdjacentHTML('beforebegin',cardHTML('iriq-municipal','IRIQ municipal — composição e comparação com o Estado',true));
   else municipality.insertAdjacentHTML('afterbegin',cardHTML('iriq-municipal','IRIQ municipal — composição e comparação com o Estado',true));
 }
 const tempo=document.getElementById('painelTempoRealMunicipio');
 if(tempo&&!document.getElementById('iriq-tempo-bloco')){
   tempo.insertAdjacentHTML('beforebegin',cardHTML('iriq-tempo','IRIQ do município — tempo real (cenário de referência)',true));
 }
 const auditor=document.getElementById('abaAuditor');
 if(auditor&&!document.getElementById('iriq-auditor-bloco')){
   const se=auditor.querySelector('.boxSumarioMunicipalAuditoria');
   if(se)se.insertAdjacentHTML('afterend',cardHTML('iriq-auditor','Prévia dos componentes para o sumário executivo',true));
 }
}
function chartRadar(prefix,atual,geral){
 const target=document.getElementById(prefix+'-radar');
 if(!target||!window.Chart)return;
 const datasets=[{label:atual.municipio,data:atual.valores,fill:true,backgroundColor:'rgba(37,99,235,.18)',borderColor:'#2563eb',pointBackgroundColor:'#2563eb',borderWidth:2,pointRadius:4}];
 if(geral&&atual!==geral)datasets.push({label:'Média estadual',data:geral.valores,fill:false,borderColor:'#ea580c',borderWidth:2,borderDash:[5,4],pointRadius:3});
 if(charts[prefix+'radar'])charts[prefix+'radar'].destroy();
 charts[prefix+'radar']=new Chart(target,{type:'radar',data:{labels:LABELS,datasets},
 options:{responsive:true,maintainAspectRatio:false,animation:false,
 plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:c=>c.dataset.label+': '+fmt(c.raw)+'/100'}},datalabels:{display:false}},
 scales:{r:{beginAtZero:true,min:0,max:100,ticks:{stepSize:20,display:true,backdropColor:'transparent'},pointLabels:{font:{size:12}}}}}});
}
function chartBarras(prefix,atual){
 const target=document.getElementById(prefix+'-barras');
 if(!target||!window.Chart)return;
 if(charts[prefix+'barras'])charts[prefix+'barras'].destroy();
 charts[prefix+'barras']=new Chart(target,{type:'bar',
 data:{labels:LABELS,datasets:[{label:'Participação no IRIQ (%)',data:atual.percentuais,backgroundColor:COLORS,borderRadius:5}]},
 options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,animation:false,
 plugins:{legend:{display:false},datalabels:{display:false},tooltip:{callbacks:{label:c=>fmt(c.raw)+'% do IRIQ'}}},
 scales:{x:{beginAtZero:true,max:100,ticks:{callback:v=>v+'%'}},y:{ticks:{font:{size:12}}}}}});
}
function origemRisco(atual){
 if(atual.origem_r==='MATRIZ_5X5'){
  let texto='Matriz 5×5; nota bruta '+(atual.risco_maximo_5x5==null?'não informada':fmt(atual.risco_maximo_5x5)+'/25')+'; escala mostrada '+fmt(atual.valores[0])+'/100.';
  if(atual.risco_original!=null&&Math.abs(atual.risco_original-atual.valores[0])>0.01)texto+=' Divergência a reconciliar: risco_original='+fmt(atual.risco_original)+' e nota normalizada='+fmt(atual.valores[0])+'.';
  return texto;
 }
 if(atual.origem_r==='PROXY_QUINTIS_FOCOS')return 'estimativa por quintis de focos (posição relativa; não é probabilidade nem matriz validada).';
 if(atual.origem_r==='HEATMAP_HISTORICO_NAO_RECONCILIADO')return 'heatmap histórico ainda não reconciliado; nota não validada.';
 return atual.origem_r?'fonte '+atual.origem_r+'; validação pendente.':'origem do risco não informada nesta linha.';
}
function draw(prefix,atual,geral){
 const div=document.getElementById(prefix+'-bloco');
 if(!div)return;
 div.style.display='';
 chartRadar(prefix,atual,geral);
 chartBarras(prefix,atual);
 const legend=document.getElementById(prefix+'-legenda');
 if(legend)legend.innerHTML='<strong>IRIQ de referência proporcional: '+fmt(atual.iriq)+' pontos · '+esc(atual.municipio)+'</strong>'+
 '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;margin-top:7px;font-size:12px"><thead><tr><th style="text-align:left">Indicador</th><th>Nota /100</th><th>Peso</th><th>Pontos proporcionais</th><th>% da pontuação</th></tr></thead><tbody>'+
 LABELS.map((nome,i)=>'<tr style="border-top:1px solid #e2e8f0"><td style="padding:4px"><span style="color:'+COLORS[i]+'">■</span> '+nome+'</td><td style="text-align:center">'+fmt(atual.valores[i])+'</td><td style="text-align:center">'+fmt(WEIGHTS[i]*100)+'%</td><td style="text-align:center">'+fmt(atual.pontos[i])+'</td><td style="text-align:center"><strong>'+fmt(atual.percentuais[i])+'%</strong></td></tr>').join('')+
 '</tbody></table></div>';
 const contexto=document.getElementById(prefix+'-contexto');
 const maior=atual.percentuais.indexOf(Math.max(...atual.percentuais));
 if(contexto)contexto.innerHTML='<strong>Maior parcela proporcional:</strong> '+esc(LABELS[maior])+' ('+fmt(atual.percentuais[maior])+'% da pontuação de referência). '+
 '<strong>Focos de calor:</strong> '+new Intl.NumberFormat('pt-BR').format(atual.focos)+' registros no conjunto de dados do cenário, <em>indicador contextual, NÃO integra diretamente o IRIQ e NÃO representa contagem em tempo real</em>. '+
 '<br><strong>Rastreabilidade:</strong> '+esc(atual.versao||geral.versao||'IRIQ-4C')+' · '+esc(atual.status||'SIMULACAO_NAO_HOMOLOGADA')+
 (atual.origem_ipt?'<br>IPT: '+esc(atual.origem_ipt):'')+
 '<br><strong>Origem do Risco Municipal:</strong> '+esc(origemRisco(atual))+
 '<br><strong>Fator proporcional:</strong> '+fmt(atual.fator_calibracao*100)+'% do cenário ('+fmt(atual.iriq)+' ÷ '+fmt(atual.iriq_cenario)+'). '+(atual.referencia_confirmada_rt?'<strong>Referência confirmada no RT.</strong>':'<strong>Referência da base do projeto; ainda não confirmada no RT.</strong>')+
 '<br><small>As notas ajustadas preservam a proporção dos quatro componentes e sua soma ponderada fecha no IRIQ-base do município. A validação da série continua pendente.</small>';
}
let attached=false;
async function iniciar(){
 mount();
 try{
  const all=await dados();
  draw('iriq-geral',all.geral,all.geral);
  for(const prefix of ['iriq-municipal','iriq-tempo','iriq-auditor']){
    const selector=document.getElementById(prefix+'-seletor');
    if(!selector)continue;
    if(!selector.options.length){
      selector.innerHTML=all.municipios.map(m=>'<option value="'+esc(m.municipio)+'">'+esc(m.municipio)+'</option>').join('');
      if(prefix==='iriq-auditor')selector.value='Porto Velho';
      selector.addEventListener('change',()=>{const m=all.municipios.find(t=>t.municipio===selector.value);if(m)draw(prefix,m,all.geral)});
    }
    const match=all.municipios.find(t=>t.municipio===selector.value)||all.municipios[0];
    if(match)draw(prefix,match,all.geral);
  }
  if(!attached){
    attached=true;
    const timer=document.getElementById('selectMunicipioTempoReal');
    if(timer)timer.addEventListener('change',()=>{const sel=document.getElementById('iriq-tempo-seletor');if(!sel)return;const m=all.municipios.find(v=>norm(v.municipio)===norm(timer.value));if(m){sel.value=m.municipio;draw('iriq-tempo',m,all.geral)}});
    const aud=document.getElementById('selectMunicipioSumarioAuditoria');
    if(aud)aud.addEventListener('change',()=>{const sel=document.getElementById('iriq-auditor-seletor');if(!sel)return;const m=all.municipios.find(v=>norm(v.municipio)===norm(aud.value));if(m){sel.value=m.municipio;draw('iriq-auditor',m,all.geral)}});
    document.querySelectorAll('.btnAbaQueimadas').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{for(const k of ['iriq-geral','iriq-municipal','iriq-tempo','iriq-auditor']){if(charts[k+'radar'])charts[k+'radar'].resize();if(charts[k+'barras'])charts[k+'barras'].resize()}},200)));
  }
 }catch(e){console.error('IRIQ gráficos:',e);for(const id of ['iriq-geral','iriq-municipal','iriq-tempo','iriq-auditor']){const el=document.getElementById(id+'-contexto');if(el)el.textContent='Erro ao consultar indicadores: '+String(e.message||e)}}
}
// PDF: radar vetorial (mantém legibilidade em impressão, não depende do canvas).
function pdfRadar(doc,entry,cx,cy,rad){
 const vals=entry.valores;
 doc.setLineWidth(.22);
 for(const nivel of [25,50,75,100]){
  const r=rad*nivel/100;
  const pts=[[cx,cy-r],[cx+r,cy],[cx,cy+r],[cx-r,cy]];
  doc.setDrawColor(209,218,229);
  for(let i=0;i<4;i++)doc.line(pts[i][0],pts[i][1],pts[(i+1)%4][0],pts[(i+1)%4][1]);
 }
 doc.setDrawColor(155,169,187);
 for(let i=0;i<4;i++){const t=-Math.PI/2+i*Math.PI/2;doc.line(cx,cy,cx+rad*Math.cos(t),cy+rad*Math.sin(t));}
 const p=vals.map((v,i)=>{const t=-Math.PI/2+i*Math.PI/2;return [cx+rad*v/100*Math.cos(t),cy+rad*v/100*Math.sin(t)]});
 doc.setDrawColor(37,99,235);doc.setLineWidth(.9);
 for(let i=0;i<4;i++){doc.line(p[i][0],p[i][1],p[(i+1)%4][0],p[(i+1)%4][1]);doc.setFillColor(37,99,235);doc.circle(p[i][0],p[i][1],1.3,'F')}
 doc.setFont('helvetica','bold');doc.setFontSize(7);doc.setTextColor(30,41,59);
 doc.text('RISCO '+fmt(vals[0]),cx,cy-rad-8,{align:'center'});
 doc.text('IPT '+fmt(vals[1]),cx+rad+3,cy,{align:'left'});
 doc.text('ÁREA QUEIMADA '+fmt(vals[2]),cx,cy+rad+9,{align:'center'});
 doc.text('DES '+fmt(vals[3]),cx-rad-3,cy,{align:'right'});
}
async function adicionarPaginaPDF(doc,municipio){
 if(!doc||typeof doc.addPage!=='function')return;
 const d=await dados();
 const e=municipio?d.municipios.find(x=>norm(x.municipio)===norm(municipio)):d.geral;
 if(!e)throw Error('Município não encontrado para o comparativo IRIQ: '+municipio);
 doc.addPage();
 doc.setFillColor(15,45,76);doc.rect(0,0,210,24,'F');
 doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(13);
 doc.text('IRIQ — COMPOSIÇÃO DOS QUATRO INDICADORES',12,12);
 doc.setFontSize(8);
 doc.text(e.municipio+'  |  SIMULAÇÃO NÃO HOMOLOGADA',12,19);
 doc.setTextColor(30,41,59);doc.setFontSize(9);
 doc.text('IRIQ: '+fmt(e.iriq)+' / 100   ·   '+(municipio?'Município':'Média aritmética dos 52 municípios'),12,33);
 pdfRadar(doc,e,104,83,36);
 doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text('Contribuição de cada componente para o IRIQ',12,142);
 const largura=70;
 for(let i=0;i<4;i++){
  const y=154+i*19;doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(30,41,59);
  doc.text(LABELS[i],12,y);
  doc.setFillColor(230,237,244);doc.roundedRect(75,y-5,largura,6,1.5,1.5,'F');
  const rgb=[[37,99,235],[13,148,136],[234,88,12],[124,58,237]][i];
  doc.setFillColor(...rgb);doc.roundedRect(75,y-5,Math.max(.5,largura*e.percentuais[i]/100),6,1.5,1.5,'F');
  doc.text(fmt(e.pontos[i])+' pts · '+fmt(e.percentuais[i])+'% do IRIQ',149,y);
 }
 doc.setDrawColor(203,213,225);doc.line(12,235,198,235);
 doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text('Focos de calor (contexto): '+new Intl.NumberFormat('pt-BR').format(e.focos),12,244);
 doc.setFont('helvetica','normal');doc.setFontSize(7.8);
 doc.text(doc.splitTextToSize('Focos de calor não entram diretamente na fórmula. Sua contagem acima pertence à base do cenário, não ao monitoramento em tempo real. As contribuições refletem o IRIQ provisório: 30% R + 10% IPT + 35% AQ + 25% DES.',184),12,252);
 doc.setTextColor(146,64,14);doc.setFont('helvetica','bold');doc.setFontSize(8);
 doc.text('NÃO HOMOLOGADO — notas provisórias exigem validação documental.',12,274);
 doc.setTextColor(71,85,105);doc.setFontSize(7);
 doc.text('Fonte: TCE-RO • Supabase tags/queimadas • IRIQ-4C-2026-11-v2-TRIAGEM • 18/11/2026',12,283);
}
window.iriqAdicionarPaginaPDF=adicionarPaginaPDF;
window.iriqDadosComparativo=dados;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
})();