/*=========================================================
QUEIMADAS 2026 • PAINEL DE DOCUMENTOS OFICIAIS
Integra os documentos protocolizados em todos os painéis do projeto.
=========================================================*/
(function(){
function esc(v){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]))}
function br(v){if(!v)return'—';const p=String(v).slice(0,10).split('-');return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:esc(v)}
function base(){return window.QUEIMADAS_DOCUMENTOS_OFICIAIS_2026||{docs:[]}}
function lista(titulo,itens){
 if(!itens?.length)return''
 return `<div class="qdocBloco"><h4>${esc(titulo)}</h4><ul>${itens.map(x=>`<li>${esc(typeof x==='string'?x:(x.acao||x.item||''))}</li>`).join('')}</ul></div>`
}
function tabelaCronograma(lista){
 if(!lista?.length)return''
 return `<div class="qdocBloco"><h4>CRONOGRAMA</h4><div class="qdocTabelaWrap"><table class="qdocTabela"><thead><tr><th>Período</th><th>Ação</th></tr></thead><tbody>${lista.map(x=>`<tr><td>${esc(x.periodo)}</td><td>${esc(x.acao)}</td></tr>`).join('')}</tbody></table></div></div>`
}
function tabelaIndicadores(lista){
 if(!lista?.length)return''
 return `<div class="qdocBloco"><h4>METAS E INDICADORES</h4><div class="qdocTabelaWrap"><table class="qdocTabela"><thead><tr><th>Ação</th><th>Meta</th><th>Período</th></tr></thead><tbody>${lista.map(x=>`<tr><td>${esc(x.acao)}</td><td>${esc(x.meta)}</td><td>${esc(x.periodo)}</td></tr>`).join('')}</tbody></table></div></div>`
}
function recursos(lista){
 if(!lista?.length)return''
 return `<div class="qdocBloco"><h4>RECURSOS</h4>${lista.map(x=>typeof x==='string'?`<div class="qdocLinha">• ${esc(x)}</div>`:`<div class="qdocRecurso"><b>${esc(x.item)}</b><span>${esc(x.dotacao||'')}</span><small>${esc(x.finalidade||'')}</small></div>`).join('')}</div>`
}
function card(d){
 return `<article class="qdocCard">
 <div class="qdocCab"><div><span class="qdocNumero">DOC. ${esc(d.id)}</span><h3>${esc(d.municipio)}</h3><p>${esc(d.documento_origem)}</p></div><span class="qdocStatus">${esc(d.situacao)}</span></div>
 <div class="qdocMeta">
 <div><b>Entrada TCE-RO</b><span>${br(d.data_entrada)}</span></div>
 <div><b>Data do documento</b><span>${br(d.data_documento)}</span></div>
 <div><b>Processo/Referência</b><span>${esc(d.processo)}</span></div>
 <div><b>Órgão de origem</b><span>${esc(d.orgao_origem)}</span></div>
 <div><b>Subcategoria</b><span>${esc(d.subcategoria)}</span></div>
 <div><b>Páginas</b><span>${esc(d.paginas)}</span></div>
 </div>
 <div class="qdocResumo"><b>Descrição técnica</b><p>${esc(d.resumo)}</p></div>
 <details class="qdocDetalhe"><summary>VER PROCEDIMENTOS, AÇÕES, CRONOGRAMA E INDICADORES</summary>
 ${lista('PROCEDIMENTOS DE ACOMPANHAMENTO',d.procedimentos)}
 ${lista('ELEMENTOS TÉCNICOS',d.elementos_tecnicos)}
 ${lista('ÁREAS PRIORITÁRIAS',d.areas_prioritarias)}
 ${lista('AÇÕES PREVISTAS',d.acoes)}
 ${tabelaCronograma(d.cronograma)}
 ${tabelaIndicadores(d.indicadores)}
 ${lista('PARCERIAS / ARTICULAÇÃO',d.parcerias)}
 ${recursos(d.recursos)}
 ${lista('MONITORAMENTO E AVALIAÇÃO',d.monitoramento)}
 ${lista('RISCOS DE EXECUÇÃO',d.riscos_execucao)}
 ${lista('RESPONSÁVEIS IDENTIFICADOS NO PLANO',d.responsaveis)}
 </details>
 <div class="qdocRodape"><span>${esc(d.fonte)}</span>${d.id_origem?`<span>ID origem: ${esc(d.id_origem)}${d.crc?' • CRC '+esc(d.crc):''}</span>`:''}</div>
 </article>`
}
function css(){
 if(document.getElementById('qdocStyle'))return
 const s=document.createElement('style');s.id='qdocStyle';s.textContent=`
 .qdocFaixa{margin:10px 0 14px;padding:10px 12px;border:1px solid #fed7aa;border-left:5px solid #ea580c;border-radius:12px;background:linear-gradient(135deg,#fff7ed,#fff);display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 5px 16px rgba(15,23,42,.05)}
 .qdocFaixa strong{display:block;color:#9a3412;font-size:11px}.qdocFaixa span{color:#64748b;font-size:9px}.qdocFaixa button{border:0;border-radius:9px;background:#ea580c;color:#fff;font-size:9px;font-weight:900;padding:8px 11px;cursor:pointer;white-space:nowrap}
 #abaDocumentosOficiais{padding:14px}.qdocTopo{display:flex;justify-content:space-between;align-items:end;gap:12px;margin-bottom:12px}.qdocTopo h2{margin:0;color:#0f172a;font-size:20px}.qdocTopo p{margin:4px 0 0;color:#64748b;font-size:10px}
 .qdocKPIs{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin:10px 0 14px}.qdocKPI{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:10px}.qdocKPI b{display:block;font-size:20px;color:#0f172a}.qdocKPI span{font-size:8px;font-weight:900;color:#64748b;text-transform:uppercase}
 .qdocFiltros{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.qdocFiltros button{border:1px solid #cbd5e1;border-radius:999px;background:#fff;padding:7px 10px;font-size:8px;font-weight:900;cursor:pointer}.qdocFiltros button.ativo{background:#0f172a;color:#fff}
 .qdocGrid{display:grid;grid-template-columns:1fr;gap:12px}.qdocCard{background:#fff;border:1px solid #dbe3ef;border-radius:16px;padding:14px;box-shadow:0 6px 18px rgba(15,23,42,.06)}
 .qdocCab{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;border-bottom:1px solid #eef2f7;padding-bottom:9px}.qdocCab h3{margin:4px 0 2px;font-size:17px;color:#0f172a}.qdocCab p{margin:0;font-size:9px;color:#64748b}.qdocNumero{font-size:8px;font-weight:900;color:#ea580c}.qdocStatus{font-size:8px;font-weight:900;color:#166534;background:#dcfce7;border:1px solid #86efac;border-radius:999px;padding:5px 8px;white-space:nowrap}
 .qdocMeta{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:10px 0}.qdocMeta div{background:#f8fafc;border:1px solid #e2e8f0;border-radius:9px;padding:8px}.qdocMeta b{display:block;font-size:7px;color:#64748b;text-transform:uppercase}.qdocMeta span{display:block;margin-top:3px;font-size:9px;font-weight:800;color:#0f172a;line-height:1.3}
 .qdocResumo{background:#f8fafc;border-left:4px solid #0f2f55;padding:9px 10px;border-radius:8px}.qdocResumo b{font-size:8px;color:#0f2f55;text-transform:uppercase}.qdocResumo p{font-size:9.5px;line-height:1.5;color:#334155;margin:4px 0 0}
 .qdocDetalhe{margin-top:10px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden}.qdocDetalhe summary{cursor:pointer;background:#f8fafc;padding:9px 10px;font-size:8px;font-weight:900;color:#0f172a}.qdocBloco{padding:9px 11px;border-top:1px solid #eef2f7}.qdocBloco h4{margin:0 0 6px;color:#0f2f55;font-size:9px}.qdocBloco ul{margin:0;padding-left:17px}.qdocBloco li,.qdocLinha{font-size:8.5px;line-height:1.5;color:#334155;margin-bottom:3px}
 .qdocTabelaWrap{overflow:auto}.qdocTabela{width:100%;border-collapse:collapse;font-size:8px}.qdocTabela th,.qdocTabela td{border:1px solid #e2e8f0;padding:6px;text-align:left;vertical-align:top}.qdocTabela th{background:#f8fafc;color:#334155}
 .qdocRecurso{display:grid;grid-template-columns:1.1fr .9fr 1.5fr;gap:8px;border-bottom:1px solid #eef2f7;padding:5px 0;font-size:8px}.qdocRecurso span{font-family:monospace}.qdocRecurso small{font-size:8px;color:#64748b}
 .qdocRodape{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:9px;color:#94a3b8;font-size:7.5px}
 @media(max-width:800px){.qdocKPIs{grid-template-columns:repeat(2,1fr)}.qdocMeta{grid-template-columns:1fr}.qdocFaixa{align-items:flex-start;flex-direction:column}.qdocRecurso{grid-template-columns:1fr}}
 `;document.head.appendChild(s)
}
function renderTela(){
 const docs=base().docs||[],sec=document.getElementById('abaDocumentosOficiais');if(!sec)return
 const mun=[...new Set(docs.map(d=>d.municipio))]
 sec.innerHTML=`<div class="qdocTopo"><div><h2>📚 DOCUMENTOS OFICIAIS • QUEIMADAS 2026</h2><p>Protocolos, planos, procedimentos, metas, indicadores, cronogramas e pontos de monitoramento incorporados ao projeto.</p></div><div style="font-size:8px;color:#64748b">Atualização documental: 18/09/2026</div></div>
 <div class="qdocKPIs"><div class="qdocKPI"><b>${docs.length}</b><span>Documentos incorporados</span></div><div class="qdocKPI"><b>${mun.length}</b><span>Municípios atualizados</span></div><div class="qdocKPI"><b>${docs.filter(d=>d.plano_recebido).length}</b><span>Planos recebidos</span></div><div class="qdocKPI"><b>${br(docs.map(d=>d.data_entrada).sort().at(-1))}</b><span>Última entrada</span></div></div>
 <div class="qdocFiltros"><button class="ativo" data-municipio="TODOS" onclick="qdocFiltrar('TODOS')">TODOS</button>${mun.map(m=>`<button data-municipio="${esc(m)}" onclick="qdocFiltrar(this.dataset.municipio)">${esc(m)}</button>`).join('')}</div>
 <div id="qdocLista" class="qdocGrid">${docs.map(d=>`<div class="qdocCardWrap" data-municipio="${esc(d.municipio)}">${card(d)}</div>`).join('')}</div>`
}
function adicionarFaixas(){
 const docs=base().docs||[];if(!docs.length)return
 document.querySelectorAll('.abaQueimadas').forEach(a=>{
  if(a.id==='abaDocumentosOficiais'||a.querySelector('.qdocFaixa'))return
  const f=document.createElement('div');f.className='qdocFaixa'
  f.innerHTML=`<div><strong>📚 BASE DOCUMENTAL ATUALIZADA • 18/09/2026</strong><span>${docs.length} documentos oficiais incorporados • Campo Novo de Rondônia: 06843/26 e 06844/26 • Porto Velho: 06916/26 • última entrada ${br(docs.map(d=>d.data_entrada).sort().at(-1))}</span></div><button onclick="abrirDocumentosQueimadasOficiais()">VER DOCUMENTOS</button>`
  const titulo=a.querySelector('.painelTitulo');if(titulo)titulo.insertAdjacentElement('afterend',f);else a.prepend(f)
 })
}
window.qdocFiltrar=function(nome){
 document.querySelectorAll('.qdocFiltros button').forEach(b=>b.classList.toggle('ativo',b.dataset.municipio===nome))
 document.querySelectorAll('#qdocLista .qdocCardWrap').forEach(c=>{c.style.display=(nome==='TODOS'||c.dataset.municipio===nome)?'block':'none'})
}
window.abrirDocumentosQueimadasOficiais=function(){
 document.querySelectorAll('.abaQueimadas').forEach(a=>{a.style.display='none';a.classList.add('hidden')})
 const s=document.getElementById('abaDocumentosOficiais');if(s){s.style.display='block';s.classList.remove('hidden');renderTela()}
 document.querySelectorAll('.btnAbaQueimadas').forEach(b=>b.classList.remove('ativa','active'))
 const b=document.getElementById('btnAbaDocumentosOficiais');if(b)b.classList.add('ativa','active')
 window.scrollTo({top:0,behavior:'smooth'})
}
function montar(){
 css()
 const nav=document.querySelector('.menuQueimadas')
 if(nav&&!document.getElementById('btnAbaDocumentosOficiais')){
  const b=document.createElement('button');b.id='btnAbaDocumentosOficiais';b.className='btnAbaQueimadas';b.innerHTML='📚 DOCUMENTOS OFICIAIS';b.onclick=window.abrirDocumentosQueimadasOficiais
  const auditor=document.getElementById('btnAbaAuditor');nav.insertBefore(b,auditor||null)
 }
 if(!document.getElementById('abaDocumentosOficiais')){
  const sec=document.createElement('section');sec.id='abaDocumentosOficiais';sec.className='abaQueimadas hidden';sec.style.display='none'
  const app=document.querySelector('.layoutPrincipal');if(app)app.appendChild(sec)
 }
 renderTela();adicionarFaixas()
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(montar,450),{once:true})
else setTimeout(montar,450)
document.addEventListener('queimadas:documentos-sincronizados',()=>setTimeout(()=>{renderTela();adicionarFaixas()},120))
})();
