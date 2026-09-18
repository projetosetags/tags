/*=========================================================
MONITORAMENTO INTELIGENTE • DOCUMENTOS OFICIAIS QUEIMADAS 2026
Integra protocolos, planos, ações, metas e pontos de verificação.
=========================================================*/
(function(){
function B(){return window.QUEIMADAS_DOCUMENTOS_OFICIAIS_2026||{docs:[]}}
function E(v){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]))}
function BR(v){if(!v)return'—';let p=String(v).slice(0,10).split('-');return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:E(v)}
function estilo(){
 if(document.getElementById('qmonStyle'))return
 let s=document.createElement('style');s.id='qmonStyle';s.textContent=`
 .qmon-faixa{border:1px solid #fdba74;border-left:5px solid #ea580c;border-radius:14px;background:#fff7ed;padding:12px 14px;margin:0 0 14px;color:#7c2d12}
 .qmon-faixa b{display:block;font-size:13px}.qmon-faixa span{font-size:11px;color:#9a3412}
 .qmon-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0}.qmon-kpi{background:#fff;border:1px solid #dbe3ef;border-radius:13px;padding:12px}.qmon-kpi b{display:block;font-size:24px;color:#0f172a}.qmon-kpi span{font-size:10px;color:#64748b;font-weight:800}
 .qmon-doc{background:#fff;border:1px solid #dbe3ef;border-radius:15px;padding:14px;margin-bottom:12px;box-shadow:0 6px 18px rgba(15,23,42,.05)}
 .qmon-doc-head{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid #eef2f7;padding-bottom:9px}.qmon-doc-head h3{margin:0;color:#0f172a;font-size:17px}.qmon-doc-head p{margin:3px 0 0;color:#64748b;font-size:10px}.qmon-badge{background:#dcfce7;color:#166534;border:1px solid #86efac;border-radius:999px;padding:5px 8px;height:max-content;font-size:9px;font-weight:900}
 .qmon-meta{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:9px 0}.qmon-meta div{background:#f8fafc;border-radius:8px;padding:7px;font-size:9px}.qmon-meta b{display:block;color:#64748b;font-size:8px;text-transform:uppercase}.qmon-resumo{font-size:10px;line-height:1.5;color:#334155;border-left:4px solid #0f2f55;padding:8px 10px;background:#f8fafc}
 .qmon-secao{margin-top:10px}.qmon-secao h4{font-size:10px;margin:0 0 5px;color:#0f2f55}.qmon-secao ul{margin:0;padding-left:18px}.qmon-secao li{font-size:9px;line-height:1.45;color:#334155;margin-bottom:3px}
 .qmon-table{width:100%;border-collapse:collapse;font-size:9px}.qmon-table th,.qmon-table td{padding:6px;border:1px solid #e2e8f0;text-align:left;vertical-align:top}.qmon-table th{background:#f8fafc}
 .qmon-pendente{display:inline-block;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;border-radius:999px;padding:3px 7px;font-size:8px;font-weight:900}
 .qmon-relatorio{margin-top:18px;border-top:2px solid #ea580c;padding-top:14px}.qmon-relatorio h2{background:#fff7ed!important;color:#7c2d12!important}
 @media(max-width:900px){.qmon-kpis{grid-template-columns:repeat(2,1fr)}.qmon-meta{grid-template-columns:1fr}}
 `;document.head.appendChild(s)
}
function tabelaIndicadores(d){
 if(!d.indicadores?.length)return''
 return `<div class="qmon-secao"><h4>Itens de monitoramento derivados do Plano</h4><div style="overflow:auto"><table class="qmon-table"><thead><tr><th>Ação</th><th>Meta</th><th>Período</th><th>Validação</th></tr></thead><tbody>${d.indicadores.map(i=>`<tr><td>${E(i.acao)}</td><td>${E(i.meta)}</td><td>${E(i.periodo)}</td><td><span class="qmon-pendente">PENDENTE DE EVIDÊNCIA/VALIDAÇÃO</span></td></tr>`).join('')}</tbody></table></div></div>`
}
function docCard(d){
 return `<article class="qmon-doc">
 <div class="qmon-doc-head"><div><h3>${E(d.municipio)} • Doc. ${E(d.id)}</h3><p>${E(d.documento_origem)}</p></div><span class="qmon-badge">${E(d.situacao)}</span></div>
 <div class="qmon-meta"><div><b>Entrada</b>${BR(d.data_entrada)}</div><div><b>Processo</b>${E(d.processo)}</div><div><b>Órgão</b>${E(d.orgao_origem)}</div><div><b>Páginas</b>${E(d.paginas)}</div></div>
 <div class="qmon-resumo">${E(d.resumo)}</div>
 <div class="qmon-secao"><h4>Procedimentos de controle / acompanhamento</h4><ul>${(d.procedimentos||[]).map(x=>`<li>${E(x)}</li>`).join('')}</ul></div>
 ${tabelaIndicadores(d)}
 <div class="qmon-secao"><h4>Pontos para análise documental</h4><ul>${[...(d.areas_prioritarias||[]).slice(0,8),...(d.monitoramento||[])].map(x=>`<li>${E(x)}</li>`).join('')}</ul></div>
 </article>`
}
function renderTela(){
 let sec=document.getElementById('tela-documentosqueimadas');if(!sec)return
 let docs=B().docs||[],mun=[...new Set(docs.map(d=>d.municipio))]
 sec.innerHTML=`<div class="qmon-faixa"><b>🔥 BASE DOCUMENTAL • QUEIMADAS 2026</b><span>Documentos oficiais protocolizados incorporados ao Monitoramento Inteligente. Declarações e metas permanecem sujeitas à verificação de evidências e validação técnica.</span></div>
 <div class="qmon-kpis"><div class="qmon-kpi"><b>${docs.length}</b><span>DOCUMENTOS</span></div><div class="qmon-kpi"><b>${mun.length}</b><span>MUNICÍPIOS ATUALIZADOS</span></div><div class="qmon-kpi"><b>${docs.filter(d=>d.plano_recebido).length}</b><span>PLANOS RECEBIDOS</span></div><div class="qmon-kpi"><b>${docs.reduce((n,d)=>n+(d.indicadores?.length||0),0)}</b><span>METAS/INDICADORES MAPEADOS</span></div></div>
 ${docs.map(docCard).join('')}`
}
function faixaDashboard(){
 let tela=document.getElementById('tela-dashboard');if(!tela)return
 let box=document.getElementById('qmonResumoDashboard')
 if(!box){box=document.createElement('div');box.id='qmonResumoDashboard';tela.prepend(box)}
 let docs=B().docs||[]
 box.innerHTML=`<div class="qmon-faixa"><b>🔥 QUEIMADAS • DOCUMENTAÇÃO NOVA INCORPORADA</b><span>Campo Novo de Rondônia: 06843/26 e 06844/26 • Porto Velho: 06916/26 • última entrada ${BR(docs.map(d=>d.data_entrada).sort().at(-1))}. Acesse “Docs. Queimadas” para procedimentos, metas e pontos de validação.</span></div>`
}
function faixaEvidencias(){
 let tela=document.getElementById('tela-evidencias');if(!tela||document.getElementById('qmonEvidenciasAviso'))return
 let d=document.createElement('div');d.id='qmonEvidenciasAviso';d.className='qmon-faixa'
 d.innerHTML='<b>📎 EVIDÊNCIAS • QUEIMADAS</b><span>Os novos planos foram decompostos em metas e procedimentos. A execução declarada não é tratada como evidência validada; cada item deve receber documento comprobatório e análise técnica.</span>'
 tela.prepend(d)
}
function montar(){
 estilo()
 let nav=document.getElementById('navMonitoramento')
 if(nav&&!document.getElementById('navDocsQueimadas')){
  let b=document.createElement('button');b.id='navDocsQueimadas';b.className='nav-btn';b.setAttribute('onclick',"abrirTela('documentosqueimadas')");b.innerHTML='🔥 Docs. Queimadas'
  let evid=[...nav.querySelectorAll('.nav-btn')].find(x=>x.getAttribute('onclick')==="abrirTela('evidencias')")
  if(evid)evid.insertAdjacentElement('afterend',b);else nav.appendChild(b)
 }
 let main=document.querySelector('.conteudo-monitoramento')
 if(main&&!document.getElementById('tela-documentosqueimadas')){
  let s=document.createElement('section');s.id='tela-documentosqueimadas';s.className='tela-monitoramento hidden';main.appendChild(s)
 }
 renderTela();faixaDashboard();faixaEvidencias();envolverRelatorios()
}
function relatorioHTML(){
 let docs=B().docs||[]
 return `<section class="qmon-relatorio"><h2>6. DOCUMENTOS OFICIAIS — QUEIMADAS 2026</h2><p>Foram incorporados ${docs.length} documentos oficiais relacionados a ${new Set(docs.map(d=>d.municipio)).size} municípios. Os conteúdos abaixo constituem fonte documental para o acompanhamento e permanecem sujeitos à análise de suficiência, adequação e confiabilidade das evidências.</p>${docs.map(d=>`<h3>${E(d.municipio)} — Doc. ${E(d.id)}</h3><p><b>Entrada:</b> ${BR(d.data_entrada)} • <b>Situação:</b> ${E(d.situacao)} • <b>Referência:</b> ${E(d.processo)}</p><p>${E(d.resumo)}</p>${d.indicadores?.length?`<table class="qmon-table"><thead><tr><th>Ação/Indicador</th><th>Meta</th><th>Período</th><th>Análise</th></tr></thead><tbody>${d.indicadores.map(i=>`<tr><td>${E(i.acao)}</td><td>${E(i.meta)}</td><td>${E(i.periodo)}</td><td>Pendente de validação técnica</td></tr>`).join('')}</tbody></table>`:''}`).join('')}</section>`
}
function anexarRelatorio(){
 let p=document.getElementById('previewRelatorio');if(!p||p.querySelector('.qmon-relatorio'))return
 p.insertAdjacentHTML('beforeend',relatorioHTML())
}
let relatoriosEnvolvidos=false
function envolverRelatorios(){
 if(relatoriosEnvolvidos)return
 let nomes=['gerarRelatorioCompleto','gerarResumoExecutivo','gerarQuadroEvidenciasOficial']
 let ok=false
 nomes.forEach(n=>{
  let fn=window[n];if(typeof fn!=='function'||fn.__qmonWrapped)return
  let w=async function(...args){let r=await fn.apply(this,args);anexarRelatorio();return r};w.__qmonWrapped=true;window[n]=w;ok=true
 })
 if(ok)relatoriosEnvolvidos=true
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(montar,800),{once:true})
else setTimeout(montar,800)
setTimeout(montar,1800)
})();
