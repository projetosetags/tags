/*=========================================================
RIO MADEIRA • PAINEL V3 • 06/10/2026
Carregamento autônomo e sincronizado com Supabase
=========================================================*/
(function(){
'use strict';

const RM3={
  dados:[],ciclos:[],cheias:[],secas:[],curva:[],chuvas:[],
  carregado:false,carregando:false,
  graficoHistorico:null,graficoExtremos:null,graficoChuva:null,
  timer:null
};

const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const br=v=>{if(!v)return'—';const p=String(v).slice(0,10).split('-');return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:String(v)};
const fmt=(v,d=2)=>{const n=num(v);return n===null?'—':n.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d})};
const client=()=>window.clientPublic||window.client||window.supabaseClient||null;

function css(){
  if(document.getElementById('rm3-css'))return;
  const s=document.createElement('style');s.id='rm3-css';s.textContent=`
  #abaRioMadeira .rm3-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:10px 0 14px;padding:12px 14px;border:1px solid #bae6fd;background:#f0f9ff;border-radius:12px;color:#0c4a6e;font-size:11px}
  #abaRioMadeira .rm3-toolbar button{border:0;border-radius:9px;padding:9px 13px;background:#0369a1;color:#fff;font-weight:900;cursor:pointer}
  #abaRioMadeira .rm3-status{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}
  #abaRioMadeira .rm3-pill{display:inline-flex;padding:5px 9px;border-radius:999px;background:#e0f2fe;color:#075985;font-weight:900;font-size:9px}
  #abaRioMadeira .rm3-loading{padding:14px;border-radius:10px;background:#eff6ff;border:1px solid #bfdbfe;color:#1e3a8a;font-weight:900}
  #abaRioMadeira .rm3-erro{padding:14px;border-radius:10px;background:#fef2f2;border:1px solid #fecaca;color:#991b1b;font-weight:900}
  #abaRioMadeira .rm3-chuva-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px;margin:10px 0}
  #abaRioMadeira .rm3-chuva-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:11px}
  #abaRioMadeira .rm3-chuva-card span{display:block;font-size:9px;font-weight:900;color:#64748b;text-transform:uppercase}
  #abaRioMadeira .rm3-chuva-card b{display:block;font-size:18px;margin-top:5px;color:#0f172a}
  #abaRioMadeira .rm3-chart{height:280px;margin:12px 0}
  #abaRioMadeira .rm3-wrap{overflow:auto;max-height:430px;border:1px solid #e2e8f0;border-radius:10px}
  #abaRioMadeira .rm3-table{width:100%;border-collapse:collapse;font-size:11px}
  #abaRioMadeira .rm3-table th{position:sticky;top:0;background:#0f172a;color:#fff;padding:8px;text-align:center}
  #abaRioMadeira .rm3-table td{padding:7px 8px;border-bottom:1px solid #e2e8f0;text-align:right}
  #abaRioMadeira .rm3-table td:first-child{text-align:left;font-weight:800}
  #abaRioMadeira .rm3-neg{color:#b91c1c}.rm3-pos{color:#047857}
  #abaRioMadeira .rm3-aviso{padding:10px 12px;border-radius:10px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;font-size:10px;font-weight:800;margin-top:10px}
  @media(max-width:900px){#abaRioMadeira .rm3-chuva-grid{grid-template-columns:1fr 1fr}#abaRioMadeira .rm3-toolbar{align-items:flex-start;flex-direction:column}}
  `;document.head.appendChild(s);
}

async function todos(tabela,colunas,ordem){
  const c=client(); if(!c)throw new Error('Cliente Supabase não encontrado');
  const out=[];
  for(let ini=0;ini<100000;ini+=1000){
    let q=c.from(tabela).select(colunas);
    if(ordem)q=q.order(ordem,{ascending:true});
    const{data,error}=await q.range(ini,ini+999);
    if(error)throw error;
    const lote=data||[];out.push(...lote);
    if(lote.length<1000)break;
  }
  return out;
}

function cicloMaisRecente(){
  return [...new Set(RM3.ciclos.map(x=>x.ciclo_hidrologico).filter(Boolean))]
    .sort((a,b)=>String(b).localeCompare(String(a)))[0]||'';
}

function dataDoDiaCiclo(d,ciclo){
  const ano=Number(String(ciclo||'').slice(0,4));
  if(!ano||!Number.isFinite(Number(d)))return String(d??'');
  const dt=new Date(Date.UTC(ano,9,1));dt.setUTCDate(dt.getUTCDate()+Number(d)-1);
  return`${String(dt.getUTCDate()).padStart(2,'0')}/${String(dt.getUTCMonth()+1).padStart(2,'0')}`;
}

function sincronizarGlobais(){
  window.RM_DADOS=RM3.dados;
  window.RM_CICLOS=RM3.ciclos;
  window.RM_CHEIAS=RM3.cheias;
  window.RM_SECAS=RM3.secas;
  window.RM_CURVA=RM3.curva;
  window.RM_CARREGADO=RM3.carregado;
}

function preencherFiltros(){
  const ciclos=[...new Set(RM3.ciclos.map(x=>x.ciclo_hidrologico).filter(Boolean))].sort((a,b)=>String(b).localeCompare(String(a)));
  const atual=document.getElementById('rmCicloAtual'),comp=document.getElementById('rmCicloComparacao'),tab=document.getElementById('rmFiltroCicloTabela');
  let sel=atual?.value;if(!ciclos.includes(sel))sel=ciclos[0]||'';
  if(atual)atual.innerHTML=ciclos.map(c=>`<option value="${esc(c)}"${c===sel?' selected':''}>CICLO ${esc(c)}</option>`).join('');
  if(comp){const anterior=comp.value;comp.innerHTML='<option value="">COMPARAR COM...</option>'+ciclos.filter(c=>c!==sel).map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');if(ciclos.includes(anterior)&&anterior!==sel)comp.value=anterior}
  if(tab){const anterior=tab.value;tab.innerHTML=ciclos.map(c=>`<option value="${esc(c)}"${c===(anterior||sel)?' selected':''}>${esc(c)}</option>`).join('')}
}

function renderToolbar(){
  const aba=document.getElementById('abaRioMadeira');if(!aba)return;
  let bar=document.getElementById('rm3Toolbar');if(!bar){bar=document.createElement('div');bar.id='rm3Toolbar';bar.className='rm3-toolbar';aba.querySelector('.painelTitulo')?.insertAdjacentElement('afterend',bar)}
  const u=[...RM3.dados].filter(x=>x.data).sort((a,b)=>String(b.data).localeCompare(String(a.data)))[0];
  const ch=[...RM3.chuvas].sort((a,b)=>String(b.data).localeCompare(String(a.data)))[0];
  bar.innerHTML=`<div><b>🌊 BASE HIDROLÓGICA SINCRONIZADA</b><div class="rm3-status"><span class="rm3-pill">Nível: ${br(u?.data)} • ${fmt(u?.nivel_m,2)} m</span><span class="rm3-pill">Precipitação: ${br(ch?.data)}</span><span class="rm3-pill">${RM3.ciclos.length} ciclos históricos</span><span class="rm3-pill">${RM3.dados.length.toLocaleString('pt-BR')} registros</span></div></div><button type="button" onclick="carregarRioMadeira(true)">↻ ATUALIZAR PAINEL</button>`;
}

function renderKPIs(){
  const d=[...RM3.dados].filter(x=>x.data).sort((a,b)=>String(a.data).localeCompare(String(b.data))),u=d.at(-1),ant=d.at(-2);
  const nv=num(u?.nivel_m),na=num(ant?.nivel_m),v=nv!==null&&na!==null?nv-na:null,cheia=RM3.cheias[0],seca=RM3.secas[0];
  let e=document.getElementById('rmNivelAtual');if(e)e.innerHTML=`${nv===null?'—':fmt(nv,2)+' m'}<small class="rmKpiData">${br(u?.data)}</small>`;
  e=document.getElementById('rmVariacao24h');if(e)e.innerHTML=v===null?'—':`<span class="${v<0?'rm3-neg':v>0?'rm3-pos':''}">${v>0?'+':''}${fmt(v,2)} m</span><small class="rmKpiData">último intervalo disponível</small>`;
  e=document.getElementById('rmCheiaHistorica');if(e)e.innerHTML=`${cheia?.nivel_m==null?'—':fmt(cheia.nivel_m,2)+' m'}<small class="rmKpiData">${br(cheia?.data)}</small>`;
  e=document.getElementById('rmSecaHistorica');if(e)e.innerHTML=`${seca?.nivel_m==null?'—':fmt(seca.nivel_m,3)+' m'}<small class="rmKpiData">${br(seca?.data)}</small>`;
  e=document.getElementById('rmCiclosHistoricos');if(e)e.textContent=RM3.ciclos.length;
}

function renderRanking(){
  const monta=lista=>`<div class="tabelaMunicipiosWrap"><table class="tabelaMunicipios"><thead><tr><th>#</th><th>CICLO</th><th>DATA</th><th>NÍVEL</th></tr></thead><tbody>${lista.slice(0,10).map((x,i)=>`<tr><td><b>${i+1}</b></td><td>${esc(x.ciclo_hidrologico||'—')}</td><td>${br(x.data)}</td><td><b>${fmt(x.nivel_m,3)} m</b></td></tr>`).join('')||'<tr><td colspan="4">Sem dados.</td></tr>'}</tbody></table></div>`;
  const a=document.getElementById('painelRioMadeiraCheias'),b=document.getElementById('painelRioMadeiraSecas');if(a)a.innerHTML=monta(RM3.cheias);if(b)b.innerHTML=monta(RM3.secas);
}

function renderSituacao(){
  const box=document.getElementById('painelRioMadeiraSituacao');if(!box)return;
  const ciclo=document.getElementById('rmCicloAtual')?.value||cicloMaisRecente();
  const dados=RM3.dados.filter(x=>x.ciclo_hidrologico===ciclo).sort((a,b)=>String(a.data).localeCompare(String(b.data))),u=dados.at(-1);
  if(!u){box.innerHTML='<div class="rm3-erro">Sem dados para o ciclo selecionado.</div>';return}
  const h=RM3.curva.find(x=>Number(x.dia_ciclo)===Number(u.dia_ciclo));
  const n=num(u.nivel_cm),m=num(h?.media_cm),p10=num(h?.p10_cm),p90=num(h?.p90_cm);
  let texto='SEM REFERÊNCIA HISTÓRICA',classe='rmNeutro';
  if(n!==null&&p10!==null&&n<=p10){texto='MUITO ABAIXO DO PADRÃO HISTÓRICO';classe='rmSeca'}
  else if(n!==null&&p90!==null&&n>=p90){texto='MUITO ACIMA DO PADRÃO HISTÓRICO';classe='rmCheia'}
  else if(n!==null&&m!==null&&n<m){texto='ABAIXO DA MÉDIA HISTÓRICA';classe='rmAtencao'}
  else if(n!==null&&m!==null){texto='DENTRO/ACIMA DA MÉDIA HISTÓRICA';classe='rmNormal'}
  const dif=n!==null&&m!==null?(n-m)/100:null;
  box.innerHTML=`<div style="margin-bottom:10px;padding:9px 12px;border:1px solid #bfdbfe;border-radius:9px;background:#eff6ff;font-size:11px;font-weight:800">Série de nível: <b>ANA/CPRM-REPO</b> • análise/gráficos: <b>CENSIPAM/NUHIDRO CR-PV</b> • base até <b>${br(u.data)}</b></div><div class="rmSituacao ${classe}"><div class="rmSituacaoTitulo">${texto}</div><div class="rmSituacaoNivel">${fmt(u.nivel_m,2)} m</div><div class="rmSituacaoData">${br(u.data)} • ciclo ${esc(ciclo)}</div></div><div class="rmResumoGrid"><div><span>Média histórica do dia</span><b>${m===null?'—':fmt(m/100,2)+' m'}</b></div><div><span>P10 histórico</span><b>${p10===null?'—':fmt(p10/100,2)+' m'}</b></div><div><span>P90 histórico</span><b>${p90===null?'—':fmt(p90/100,2)+' m'}</b></div><div><span>Diferença da média</span><b>${dif===null?'—':(dif>0?'+':'')+fmt(dif,2)+' m'}</b></div></div>${Number(u.dia_ciclo)>366?'<div class="rm3-aviso">O arquivo-fonte possui registros além do dia 366 no ciclo 2025–2026. Esses registros são exibidos normalmente; quando não existir referência histórica equivalente, o painel informa ausência de percentil.</div>':''}`;
}

function renderExtremos(){
  const box=document.getElementById('painelRioMadeiraExtremos');if(!box)return;
  const d=[...RM3.dados].sort((a,b)=>String(a.data).localeCompare(String(b.data))),c=RM3.cheias[0],s=RM3.secas[0];
  box.innerHTML=`<div class="rmExtremosGrid"><div class="rmExtremoCard"><span>🌊 CHEIA RECORDE</span><strong>${c?.nivel_m==null?'—':fmt(c.nivel_m,2)+' m'}</strong><small>${br(c?.data)}</small></div><div class="rmExtremoCard"><span>🏜️ SECA RECORDE</span><strong>${s?.nivel_m==null?'—':fmt(s.nivel_m,3)+' m'}</strong><small>${br(s?.data)}</small></div><div class="rmExtremoCard"><span>📚 SÉRIE HISTÓRICA</span><strong>${RM3.ciclos.length} ciclos</strong><small>${br(d[0]?.data)} a ${br(d.at(-1)?.data)}</small></div><div class="rmExtremoCard"><span>📍 ESTAÇÃO</span><strong>15400000</strong><small>Porto Velho • Rio Madeira</small></div></div>`;
}

function renderGraficoHistorico(){
  const canvas=document.getElementById('graficoRioMadeiraHistorico');if(!canvas||typeof Chart==='undefined')return;
  const ciclo=document.getElementById('rmCicloAtual')?.value||cicloMaisRecente(),comp=document.getElementById('rmCicloComparacao')?.value||'';
  const atual=RM3.dados.filter(x=>x.ciclo_hidrologico===ciclo),compar=RM3.dados.filter(x=>x.ciclo_hidrologico===comp);
  const dias=[...new Set([...RM3.curva.map(x=>Number(x.dia_ciclo)),...atual.map(x=>Number(x.dia_ciclo)),...compar.map(x=>Number(x.dia_ciclo))])].filter(Number.isFinite).sort((a,b)=>a-b);
  const m1=new Map(atual.map(x=>[Number(x.dia_ciclo),num(x.nivel_m)])),m2=new Map(compar.map(x=>[Number(x.dia_ciclo),num(x.nivel_m)])),hist=new Map(RM3.curva.map(x=>[Number(x.dia_ciclo),x]));
  const ds=[{label:`Ciclo ${ciclo}`,data:dias.map(d=>m1.get(d)??null),borderWidth:3,pointRadius:0,tension:.15}];
  if(comp)ds.push({label:`Ciclo ${comp}`,data:dias.map(d=>m2.get(d)??null),borderWidth:2,pointRadius:0,tension:.15});
  ds.push({label:'Mediana histórica',data:dias.map(d=>{const x=hist.get(d);return x?.mediana_cm==null?null:Number(x.mediana_cm)/100}),borderWidth:2,pointRadius:0},{label:'P10 histórico',data:dias.map(d=>{const x=hist.get(d);return x?.p10_cm==null?null:Number(x.p10_cm)/100}),borderWidth:1,pointRadius:0,borderDash:[5,5]},{label:'P90 histórico',data:dias.map(d=>{const x=hist.get(d);return x?.p90_cm==null?null:Number(x.p90_cm)/100}),borderWidth:1,pointRadius:0,borderDash:[5,5]});
  if(RM3.graficoHistorico)RM3.graficoHistorico.destroy();
  RM3.graficoHistorico=new Chart(canvas,{type:'line',data:{labels:dias.map(d=>dataDoDiaCiclo(d,ciclo)),datasets:ds},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{datalabels:{display:false},legend:{position:'top'}},scales:{x:{title:{display:true,text:'Data (dia/mês)'},ticks:{maxTicksLimit:22,maxRotation:0}},y:{title:{display:true,text:'Nível (m)'}}}}});
}

function renderGraficoExtremos(){
  const canvas=document.getElementById('graficoRioMadeiraExtremos');if(!canvas||typeof Chart==='undefined')return;
  const l=[...RM3.ciclos].filter(x=>x.ciclo_hidrologico).sort((a,b)=>String(a.ciclo_hidrologico).localeCompare(String(b.ciclo_hidrologico)));
  if(RM3.graficoExtremos)RM3.graficoExtremos.destroy();
  RM3.graficoExtremos=new Chart(canvas,{type:'line',data:{labels:l.map(x=>x.ciclo_hidrologico),datasets:[{label:'Máxima do ciclo',data:l.map(x=>num(x.maximo_cm)==null?null:Number(x.maximo_cm)/100),borderWidth:2,pointRadius:2},{label:'Mínima do ciclo',data:l.map(x=>num(x.minimo_cm)==null?null:Number(x.minimo_cm)/100),borderWidth:2,pointRadius:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{datalabels:{display:false}},scales:{y:{title:{display:true,text:'Nível (m)'}}}}});
}

function renderTabela(){
  const box=document.getElementById('painelTabelaRioMadeira');if(!box)return;
  const ciclo=document.getElementById('rmFiltroCicloTabela')?.value||document.getElementById('rmCicloAtual')?.value||cicloMaisRecente();
  const busca=(document.getElementById('rmBuscaTabela')?.value||'').trim().toLowerCase();
  let lista=RM3.dados.filter(x=>x.ciclo_hidrologico===ciclo).sort((a,b)=>String(b.data).localeCompare(String(a.data)));
  if(busca)lista=lista.filter(x=>br(x.data).toLowerCase().includes(busca)||String(x.data||'').includes(busca)||String(x.nivel_m||'').replace('.',',').includes(busca));
  box.innerHTML=`<div class="tabelaMunicipiosWrap"><table class="tabelaMunicipios"><thead><tr><th>DATA</th><th>CICLO</th><th>DIA DO CICLO</th><th>NÍVEL CM</th><th>NÍVEL M</th></tr></thead><tbody>${lista.map(x=>`<tr><td>${br(x.data)}</td><td>${esc(x.ciclo_hidrologico||'—')}</td><td>${x.dia_ciclo??'—'}</td><td>${fmt(x.nivel_cm,0)} cm</td><td><b>${fmt(x.nivel_m,3)} m</b></td></tr>`).join('')||'<tr><td colspan="5">Nenhum registro encontrado.</td></tr>'}</tbody></table></div>`;
}

function renderPrecipitacao(){
  const box=document.getElementById('painelRioMadeiraPrecipitacao');if(!box)return;
  const rows=[...RM3.chuvas].sort((a,b)=>String(a.data).localeCompare(String(b.data)));if(!rows.length){box.innerHTML='<div class="rm3-aviso">Não há registros de precipitação disponíveis.</div>';return}
  const u=rows.at(-1),ult7=rows.slice(-7),ult30=rows.slice(-30),soma=(arr,k)=>arr.reduce((a,x)=>a+(num(x[k])||0),0),max=[...rows].sort((a,b)=>(num(b.total_bacia)||0)-(num(a.total_bacia)||0))[0];
  box.innerHTML=`<div class="rm3-chuva-grid"><div class="rm3-chuva-card"><span>Última média da bacia</span><b>${fmt(u.total_bacia,2)} mm</b><small>${br(u.data)}</small></div><div class="rm3-chuva-card"><span>Acumulado 7 registros</span><b>${fmt(soma(ult7,'total_bacia'),2)} mm</b></div><div class="rm3-chuva-card"><span>Acumulado 30 registros</span><b>${fmt(soma(ult30,'total_bacia'),2)} mm</b></div><div class="rm3-chuva-card"><span>Maior chuva diária</span><b>${fmt(max.total_bacia,2)} mm</b><small>${br(max.data)}</small></div><div class="rm3-chuva-card"><span>Fonte</span><b style="font-size:14px">GPM/NASA</b></div></div><div class="rm3-chart"><canvas id="rm3GraficoChuva"></canvas></div><div class="rm3-wrap"><table class="rm3-table"><thead><tr><th>DATA</th><th>BENI</th><th>MAMORÉ</th><th>GUAPORÉ</th><th>ABUNÃ</th><th>OUTROS</th><th>MÉDIA BACIA</th></tr></thead><tbody>${rows.slice(-60).reverse().map(x=>`<tr><td>${br(x.data)}</td><td>${fmt(x.beni,2)}</td><td>${fmt(x.mamore,2)}</td><td>${fmt(x.guapore,2)}</td><td>${fmt(x.abuna,2)}</td><td>${fmt(x.outros,2)}</td><td><b>${fmt(x.total_bacia,2)}</b></td></tr>`).join('')}</tbody></table></div>`;
  const cv=document.getElementById('rm3GraficoChuva');if(cv&&typeof Chart!=='undefined'){if(RM3.graficoChuva)RM3.graficoChuva.destroy();const r=rows.slice(-45);RM3.graficoChuva=new Chart(cv,{type:'bar',data:{labels:r.map(x=>br(x.data).slice(0,5)),datasets:[{label:'Média da bacia (mm)',data:r.map(x=>num(x.total_bacia))}]},options:{responsive:true,maintainAspectRatio:false,plugins:{datalabels:{display:false}},scales:{y:{beginAtZero:true,title:{display:true,text:'mm'}}}}})}
}

async function renderIntegracao(){
  const box=document.getElementById('painelRioMadeiraIntegracao');if(!box)return;
  const d=[...RM3.dados].sort((a,b)=>String(a.data).localeCompare(String(b.data))),u=d.at(-1),a=d.at(-2),ch=[...RM3.chuvas].sort((a,b)=>String(a.data).localeCompare(String(b.data))).at(-1);
  const v=u&&a?Number(u.nivel_m)-Number(a.nivel_m):null;
  let focos='—';try{if(window.clientQueimadas){const{count,error}=await window.clientQueimadas.from('queimadas_focos_inpe').select('*',{count:'exact',head:true}).gte('data_foco','2026-01-01');if(!error&&Number.isFinite(count))focos=Number(count).toLocaleString('pt-BR')}}catch(_){ }
  const tendencia=v===null?'SEM COMPARAÇÃO':v<0?`QUEDA ${fmt(Math.abs(v),2)} m`:v>0?`ALTA ${fmt(v,2)} m`:'ESTÁVEL';
  box.innerHTML=`<div class="rioMadeiraIntegracaoFluxo"><div><strong>PRECIPITAÇÃO</strong><span>🌧️</span><b>${fmt(ch?.total_bacia,2)} mm</b><small>${br(ch?.data)} • média da bacia</small></div><div class="rioMadeiraSeta">→</div><div><strong>RIO MADEIRA</strong><span>🌊</span><b>${fmt(u?.nivel_m,2)} m</b><small>${br(u?.data)} • Estação 15400000</small></div><div class="rioMadeiraSeta">→</div><div><strong>TENDÊNCIA</strong><span>☀️</span><b>${tendencia}</b><small>último intervalo</small></div><div class="rioMadeiraSeta">→</div><div><strong>QUEIMADAS</strong><span>🔥</span><b>${focos} focos</b><small>Rondônia • 2026</small></div><div class="rioMadeiraSeta">→</div><div><strong>RISCO</strong><span>🚨</span><b>MONITORAMENTO INTEGRADO</b><small>hidrologia + focos</small></div></div>`;
}

function renderFontes(){
  const aba=document.getElementById('abaRioMadeira');if(!aba)return;
  let aviso=document.getElementById('rmAvisoFonteSIPAM');const u=[...RM3.dados].sort((a,b)=>String(a.data).localeCompare(String(b.data))).at(-1),ch=[...RM3.chuvas].sort((a,b)=>String(a.data).localeCompare(String(b.data))).at(-1);
  const html=`🌊 <b>RIO MADEIRA • BASE ATUALIZADA</b><br>Último nível disponível: <b>${br(u?.data)} • ${fmt(u?.nivel_m,2)} m</b>. Precipitação disponível até <b>${br(ch?.data)}</b>. Série histórica de nível: <b>ANA/CPRM-REPO</b>. Precipitação: <b>GPM/NASA</b>. Análise e gráficos: <b>CENSIPAM/NUHIDRO CR-PV</b>.`;
  if(!aviso){aviso=document.createElement('div');aviso.id='rmAvisoFonteSIPAM';aviso.style.cssText='margin:12px 0;padding:12px 14px;border-radius:10px;background:#eff6ff;border:1px solid #93c5fd;color:#1e3a8a;font-size:12px;font-weight:800;line-height:1.5';aba.querySelector('.painelTitulo')?.insertAdjacentElement('afterend',aviso)}
  aviso.innerHTML=html;
}

async function renderTudo(){
  preencherFiltros();renderToolbar();renderKPIs();renderRanking();renderSituacao();renderExtremos();renderGraficoHistorico();renderGraficoExtremos();renderTabela();renderPrecipitacao();await renderIntegracao();renderFontes();
}

async function carregar(forcar=false){
  css();const c=client(),box=document.getElementById('painelRioMadeiraSituacao');
  if(!c){if(box)box.innerHTML='<div class="rm3-erro">Cliente Supabase não encontrado.</div>';return}
  if(RM3.carregando)return;
  if(RM3.carregado&&!forcar){await renderTudo();return}
  RM3.carregando=true;if(box)box.innerHTML='<div class="rm3-loading">🌊 Atualizando níveis, ciclos, extremos, precipitação e referências históricas...</div>';
  try{
    const[r1,r2,r3,r4,r5,r6]=await Promise.all([
      todos('rio_madeira_niveis','data,ciclo_hidrologico,ano_inicio_ciclo,mes,dia,dia_ciclo,nivel_cm,nivel_m,fonte,arquivo_origem','data'),
      todos('vw_rio_madeira_ciclos','*','data_inicio'),
      todos('vw_rio_madeira_ranking_cheias','*','data'),
      todos('vw_rio_madeira_ranking_secas','*','data'),
      todos('vw_rio_madeira_curva_historica','*','dia_ciclo'),
      todos('rio_madeira_precipitacao','data,ciclo_hidrologico,beni,mamore,guapore,abuna,outros,total_bacia,unidade,fonte,observacao','data')
    ]);
    RM3.dados=r1;RM3.ciclos=r2;RM3.cheias=[...r3].sort((a,b)=>Number(b.nivel_cm||0)-Number(a.nivel_cm||0));RM3.secas=[...r4].sort((a,b)=>Number(a.nivel_cm||0)-Number(b.nivel_cm||0));RM3.curva=[...r5].sort((a,b)=>Number(a.dia_ciclo||0)-Number(b.dia_ciclo||0));RM3.chuvas=r6;RM3.carregado=true;sincronizarGlobais();await renderTudo();
  }catch(e){console.error('Rio Madeira V3:',e);RM3.carregado=false;sincronizarGlobais();if(box)box.innerHTML=`<div class="rm3-erro"><b>Rio Madeira indisponível.</b><br>${esc(e?.message||e)}</div>`}
  finally{RM3.carregando=false}
}

window.carregarRioMadeira=carregar;
window.alterarCicloRioMadeira=()=>{renderSituacao();renderGraficoHistorico();renderTabela()};
window.renderGraficoRioMadeiraComparacao=renderGraficoHistorico;
window.renderTabelaRioMadeira=renderTabela;
window.renderKPIsRioMadeira=renderKPIs;
window.renderRankingRioMadeira=renderRanking;
window.renderSituacaoRioMadeira=renderSituacao;
window.renderExtremosRioMadeira=renderExtremos;
window.renderGraficoRioMadeiraHistorico=renderGraficoHistorico;
window.renderGraficoRioMadeiraExtremos=renderGraficoExtremos;
window.rmCicloMaisRecente=cicloMaisRecente;

function ligar(){
  css();
  document.addEventListener('click',e=>{if(e.target?.id==='btnAbaRioMadeira')setTimeout(()=>carregar(true),250)});
  const aba=document.getElementById('abaRioMadeira');if(aba&&!aba.classList.contains('hidden'))setTimeout(()=>carregar(true),250);
  if(RM3.timer)clearInterval(RM3.timer);RM3.timer=setInterval(()=>{const a=document.getElementById('abaRioMadeira');if(a&&!a.classList.contains('hidden'))carregar(true)},300000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ligar,{once:true});else ligar();
})();
