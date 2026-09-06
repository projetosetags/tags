/*=========================================================
310 CADASTRO MUNICIPAL • LAYOUT EM COLUNAS V3
Uma linha por município • respostas e complementações no histórico
=========================================================*/
(function(){
function qmtObsCompleta(i,movs){
let itens=[]
if(i.observacao)itens.push(i.observacao)
movs.forEach(x=>{
if(x.observacao)itens.push(x.observacao)
if(x.situacao_resultante)itens.push(x.situacao_resultante)
if(x.referencia)itens.push(x.referencia)
})
let unicos=[...new Set(itens.map(x=>String(x).trim()).filter(Boolean).filter(x=>!/migrad[oa]/i.test(x)))]
if(!unicos.length)return'—'
return unicos.map(x=>`<div class="qmtObsLinha">${qmtEsc(x)}</div>`).join('')
}
function qmtDilatacao(i,movs){
let a=movs.filter(x=>x.tipo_evento==='PEDIDO_DILACAO')
if(!a.length){
let legado=String(i?.dilacao_prazo||'').trim()
return legado&&legado!=='false'&&legado!=='0'?`<div class="qmtDilacao"><b>${qmtEsc(legado)}</b></div>`:'<span class="qmtSub">—</span>'
}
return`<div class="qmtListaVertical">${a.map(x=>`<div class="qmtDilacao"><b>${qmtEsc(x.numero_documento||'Pedido de dilação')}</b>${x.data_envio||x.data_recebimento||x.data_documento?`<br>${qmtData(x.data_envio||x.data_recebimento||x.data_documento)}`:''}${x.situacao_resultante?`<br><span>${qmtEsc(x.situacao_resultante)}</span>`:''}</div>`).join('')}</div>`
}
function qmtCssV3(){
let antigo=document.getElementById('qmtStyleV2');if(antigo)antigo.remove()
if(document.getElementById('qmtStyleV3'))return
let s=document.createElement('style');s.id='qmtStyleV3';s.textContent=`
.qmtTable{min-width:1880px!important;table-layout:auto}.qmtTable th{font-size:9px!important;text-align:center!important;vertical-align:middle!important}.qmtTable thead tr:first-child th{background:#0f3d2e!important;color:#fff!important;font-weight:900!important}.qmtTable thead tr:nth-child(2) th{background:#e8f3ee!important;color:#153d31!important;font-weight:900!important;border-top:1px solid #b8d4c8!important}.qmtTable td{vertical-align:middle!important;font-size:10px!important}.qmtTable td.qmtMun{text-align:left!important;white-space:normal!important;line-height:1.25}.qmtListaVertical{display:grid;gap:4px}.qmtCelItem{padding:4px 6px;border-bottom:1px solid #e2e8f0;white-space:nowrap;text-align:center}.qmtCelItem:last-child{border-bottom:0}.qmtObsCol{min-width:320px;max-width:460px;white-space:normal!important;line-height:1.45!important;text-align:left!important}.qmtObsLinha{padding:3px 0;border-bottom:1px dashed #e2e8f0;overflow-wrap:anywhere}.qmtObsLinha:last-child{border-bottom:0}.qmtDilacao{padding:5px 7px;background:#fff7ed;border-left:4px solid #d97706;border-radius:6px;line-height:1.35;white-space:normal}.qmtOficioCircular{white-space:nowrap;color:#0f172a}.qmtOficioCircular strong{font-weight:900}.qmtDataCol,.qmtPagCol,.qmtEditCol{text-align:center!important;white-space:nowrap}.qmtRespDoc{font-weight:850;color:#0f172a}.qmtComp{font-size:8px;font-weight:900;color:#1d4ed8;display:block;margin-top:1px}
`;
document.head.appendChild(s)
}
qmtCssV3()
qmtHtml=function(filtro=''){
let f=String(filtro||'').trim().toUpperCase()
let lista=QMT_DADOS.filter(i=>!f||String(i.municipio||'').toUpperCase().includes(f))
return`<div class="qmtTopBar"><input id="qmtBusca" class="qmtBusca" placeholder="Pesquisar município..." value="${qmtEsc(filtro)}" oninput="qmtRenderLocal(this.value)"><div class="qmtLegenda"><b>${lista.length}</b> município(s) • acompanhamento documental contínuo</div></div><div class="qmtWrap"><table class="qmtTable"><thead><tr><th rowspan="2">Município</th><th rowspan="2">Situação</th><th rowspan="2">Ofício Circular TCE</th><th rowspan="2">Data envio</th><th rowspan="2">Pág.</th><th colspan="2">Reiterações TCE</th><th colspan="3">Respostas Jurisdicionado</th><th rowspan="2">Dilação</th><th rowspan="2">Observações</th><th rowspan="2">Editar</th></tr><tr><th>Of. n.</th><th>Data</th><th>Data</th><th>Doc. n.</th><th>Págs.</th></tr></thead><tbody>${lista.map(i=>{
let movs=qmtMovMun(i.municipio),sit=qmtSit(i),ini=movs.find(x=>x.tipo_evento==='OFICIO_TCE')
let respostas=movs.filter(x=>x.tipo_evento==='RESPOSTA'||x.tipo_evento==='COMPLEMENTACAO').sort((a,b)=>String(a.data_recebimento||a.data_documento||'').localeCompare(String(b.data_recebimento||b.data_documento||''))||Number(a.ordem||0)-Number(b.ordem||0))
let reiteracoes=movs.filter(x=>x.tipo_evento==='REITERACAO_TCE')
return`<tr><td class="qmtMun">${qmtEsc(i.municipio)}</td><td><span class="qmtStatus" style="color:${sit[2]};background:${sit[3]}">${sit[0]} ${sit[1]}</span></td><td><div class="qmtOficioCircular">n. <strong>16/2026/GABPRES/TCERO</strong></div></td><td class="qmtDataCol">${qmtData(ini?.data_envio||i.dataenviodoc)}</td><td class="qmtPagCol">${qmtEsc(ini?.pagina||i.paginaenviodoc||'—')}</td><td>${reiteracoes.length?`<div class="qmtListaVertical">${reiteracoes.map(x=>`<div class="qmtCelItem qmtRespDoc">${qmtEsc(x.numero_documento||'—')}</div>`).join('')}</div>`:'—'}</td><td class="qmtDataCol">${reiteracoes.length?`<div class="qmtListaVertical">${reiteracoes.map(x=>`<div class="qmtCelItem">${qmtData(x.data_envio||x.data_documento||x.data_recebimento)}</div>`).join('')}</div>`:'—'}</td><td class="qmtDataCol">${respostas.length?`<div class="qmtListaVertical">${respostas.map(x=>`<div class="qmtCelItem">${qmtData(x.data_recebimento||x.data_documento||x.data_envio)}${x.tipo_evento==='COMPLEMENTACAO'?'<span class="qmtComp">COMPLEMENTAÇÃO</span>':''}</div>`).join('')}</div>`:'—'}</td><td>${respostas.length?`<div class="qmtListaVertical">${respostas.map(x=>`<div class="qmtCelItem qmtRespDoc">${qmtEsc(x.numero_documento||'—')}</div>`).join('')}</div>`:'—'}</td><td class="qmtPagCol">${respostas.length?`<div class="qmtListaVertical">${respostas.map(x=>`<div class="qmtCelItem">${qmtEsc(x.pagina||'—')}</div>`).join('')}</div>`:'—'}</td><td>${qmtDilatacao(i,movs)}</td><td class="qmtObsCol">${qmtObsCompleta(i,movs)}</td><td class="qmtEditCol"><button class="qmtEdit" onclick="qmtAutorizar('${qmtEsc(String(i.municipio).replace(/'/g,"\\'"))}')">✏ EDITAR</button></td></tr>`
}).join('')}</tbody></table></div>`
}
setTimeout(()=>{let a=document.getElementById('abaExecutivoMunicipal');if(a&&!a.classList.contains('hidden')&&typeof qmtRenderLocal==='function')qmtRenderLocal(document.getElementById('qmtBusca')?.value||'')},250)
})();
