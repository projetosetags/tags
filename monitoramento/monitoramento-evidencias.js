/*=========================================================
001 MONITORAMENTO-EVIDENCIAS.JS ESTADO
=========================================================*/
window.ITEM_EVIDENCIA_ATUAL=null
window.MAPA_EVIDENCIAS={}
window.MAPA_ANALISES={}
window.MAPA_FONTE_MONITORAMENTO={}

/*=========================================================
002 MONITORAMENTO-EVIDENCIAS.JS UTILITÁRIOS
=========================================================*/
function escaparHTML(v){
return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))
}
function textoOuTraco(v){const s=String(v??'').trim();return s?s:'-'}
function classeStatusMonitoramento(status){
const s=String(status||'').toUpperCase()
if(s==='EXECUTADA')return'badge-executada'
if(s.includes('PARCIAL'))return'badge-parcial'
if(s.includes('NÃO'))return'badge-nao'
return'badge-andamento'
}
function formatarDataSegura(v){
if(!v)return'-'
const d=new Date(v)
if(Number.isNaN(d.getTime()))return String(v)
return d.toLocaleDateString('pt-BR')
}
function obterFonteItem(item){
return window.MAPA_FONTE_MONITORAMENTO[String(item.deliberacao_id||'')]||{}
}
function resumoValidacaoEvidencias(itemId,textoManual=''){
const docs=window.MAPA_EVIDENCIAS[itemId]||[]
const validas=docs.filter(e=>e.status_validacao==='VALIDADA').length
const rejeitadas=docs.filter(e=>e.status_validacao==='REJEITADA').length
const pendentes=docs.length-validas-rejeitadas
const temTexto=String(textoManual||'').trim().length>0
let status='PENDENTE'
if((temTexto||docs.length>0)&&validas===0)status='PARCIAL'
if(validas>0&&(pendentes>0||rejeitadas>0))status='PARCIAL'
if(validas>0&&pendentes===0&&rejeitadas===0)status='COMPLETA'
return{status,total:docs.length,validas,pendentes,rejeitadas}
}

/*=========================================================
003 MONITORAMENTO-EVIDENCIAS.JS CARREGAMENTO INTEGRADO
=========================================================*/
async function renderPainelEvidencias(){
const box=document.getElementById('painelEvidenciasItens')
if(!box)return
box.innerHTML='<div class="evidencia-loading">Carregando dados do monitoramento...</div>'
const busca=String(document.getElementById('buscaEvidencia')?.value||'').toLowerCase().trim()
const origem=String(document.getElementById('filtroOrigemEvidencia')?.value||document.getElementById('filtroOrigem')?.value||'TODAS').toUpperCase()
let query=client.from('monitoramento_itens').select('*').order('id',{ascending:true})
if(window.MONITORAMENTO_ATUAL)query=query.eq('monitoramento_id',Number(window.MONITORAMENTO_ATUAL))
if(origem!=='TODAS')query=query.eq('origem',origem)
const[{data:itens,error},{data:fontes,error:erroFonte},{data:evidencias,error:erroEvid},{data:analises,error:erroAnalises}]=await Promise.all([
query,
client.from('vw_monitoramento_integrado').select('*'),
client.from('monitoramento_evidencias').select('*').order('created_at',{ascending:false}),
client.from('monitoramento_analises').select('*').order('created_at',{ascending:false})
])
if(error){console.error(error);box.innerHTML='<div class="alerta-vermelho">Erro ao carregar os itens.</div>';return}
if(erroFonte)console.warn(erroFonte)
if(erroEvid)console.warn(erroEvid)
if(erroAnalises)console.warn(erroAnalises)
window.MAPA_FONTE_MONITORAMENTO={}
;(fontes||[]).forEach(f=>{window.MAPA_FONTE_MONITORAMENTO[String(f.id)]=f})
window.MAPA_EVIDENCIAS={}
;(evidencias||[]).forEach(e=>{if(!window.MAPA_EVIDENCIAS[e.item_id])window.MAPA_EVIDENCIAS[e.item_id]=[];window.MAPA_EVIDENCIAS[e.item_id].push(e)})
window.MAPA_ANALISES={}
;(analises||[]).forEach(a=>{if(!window.MAPA_ANALISES[a.item_id])window.MAPA_ANALISES[a.item_id]=a})
let dados=typeof ordenarDataGlobal==='function'?ordenarDataGlobal(itens||[]):(itens||[])
if(busca){
dados=dados.filter(i=>{
const f=obterFonteItem(i)
return [i.item,i.subitem,i.descricao,i.produto,i.responsavel,f.achado,f.acao,f.produto,f.meta].join(' ').toLowerCase().includes(busca)
})
}
const resumo={total:dados.length,comEvidencia:0,validadas:0,semEvidencia:0,comAnalise:0}
let html=''
for(const i of dados){
const f=obterFonteItem(i)
const docs=window.MAPA_EVIDENCIAS[i.id]||[]
const analise=window.MAPA_ANALISES[i.id]
const val=resumoValidacaoEvidencias(i.id,i.evidencia)
if(val.total>0||String(i.evidencia||'').trim())resumo.comEvidencia++;else resumo.semEvidencia++
if(val.status==='COMPLETA')resumo.validadas++
if(analise)resumo.comAnalise++
const achado=textoOuTraco(f.achado||i.achado||i.deliberacao)
const acao=textoOuTraco(f.acao||i.acao_gestor||i.descricao)
const produto=textoOuTraco(f.produto||i.produto||i.produto_esperado)
const prazo=textoOuTraco(f.prazo_texto||i.entrega_esperada||i.prazo)
const meta=textoOuTraco(f.meta||i.beneficio_esperado)
const orgao=String(i.origem||'-').toUpperCase()
const codigoItem=f.codigo_item||i.item
const codigoSubitem=f.codigo_subitem||i.subitem
let evidenciasHtml=''
if(docs.length){
evidenciasHtml='<div class="evidencia-documentos">'+docs.map((e,n)=>`
<div class="evidencia-documento">
<div class="evidencia-documento-num">${n+1}</div>
<div class="evidencia-documento-corpo">
<div><b>${escaparHTML(textoOuTraco(e.tipo_evidencia))}</b>${e.numero_documento?` - ${escaparHTML(e.numero_documento)}`:''}</div>
<div class="evidencia-documento-desc">${escaparHTML(textoOuTraco(e.descricao))}</div>
<div class="evidencia-documento-meta">${escaparHTML(textoOuTraco(e.orgao_setor||e.orgao))} • ${formatarDataSegura(e.data_documento)} • ${escaparHTML(textoOuTraco(e.confiabilidade))}</div>
<div class="evidencia-documento-acoes">
${e.link_arquivo?`<a class="btn-mini" target="_blank" rel="noopener" href="${escaparHTML(e.link_arquivo)}">Abrir arquivo</a>`:''}
${e.link_sei?`<a class="btn-mini" target="_blank" rel="noopener" href="${escaparHTML(e.link_sei)}">Abrir SEI</a>`:''}
<span class="evidencia-validacao evidencia-${String(e.status_validacao||'PENDENTE').toLowerCase()}">${escaparHTML(e.status_validacao||'PENDENTE')}</span>
<button class="btn-mini verde" onclick="validarEvidencia(${e.id},'VALIDADA')">Validar</button>
<button class="btn-mini vermelho" onclick="validarEvidencia(${e.id},'REJEITADA')">Rejeitar</button>
<button class="btn-mini" onclick="editarEvidencia(${e.id})">Editar</button>
</div>
</div>
</div>`).join('')+'</div>'
}else{
evidenciasHtml='<div class="evidencia-vazia">Nenhum documento estruturado lançado.</div>'
}
html+=`
<article class="evidencia-ficha" data-evidencia-item="${i.id}">
<header class="evidencia-ficha-header">
<div>
<div class="evidencia-origem">${escaparHTML(orgao)}</div>
<h3>ITEM ${escaparHTML(textoOuTraco(codigoItem))} • SUBITEM ${escaparHTML(textoOuTraco(codigoSubitem))}</h3>
</div>
<div class="evidencia-status-area">
<span class="badge-status-evidencia ${classeStatusMonitoramento(i.status)}">${escaparHTML(i.status||'-')}</span>
<strong>${Number(i.percentual||0).toFixed(0)}%</strong>
</div>
</header>
<div class="evidencia-quadro-fonte">
<div class="evidencia-quadro-cab">Achado / Situação Encontrada</div><div>${escaparHTML(achado)}</div>
<div class="evidencia-quadro-cab">Ação a ser Adotada</div><div>${escaparHTML(acao)}</div>
<div class="evidencia-quadro-cab">Prazo</div><div>${escaparHTML(prazo)}</div>
<div class="evidencia-quadro-cab">Produto Esperado</div><div>${escaparHTML(produto)}</div>
<div class="evidencia-quadro-cab">Responsável</div><div>${escaparHTML(textoOuTraco(i.responsavel||f.responsavel))}</div>
${meta!=='-'?`<div class="evidencia-quadro-cab">Meta / Resultado Esperado</div><div>${escaparHTML(meta)}</div>`:''}
</div>
<section class="evidencia-secao">
<h4>Informações prestadas pela ${escaparHTML(orgao)}</h4>
<textarea id="obsEvidencia_${i.id}" class="evidencia-textarea" placeholder="Registre aqui, de forma objetiva e numerada, os documentos e informações apresentados pelo jurisdicionado.">${escaparHTML(i.evidencia||'')}</textarea>
<div class="evidencia-toolbar">
<button class="btn-padrao" onclick="salvarResumoEvidencia(${i.id},this)">💾 Salvar informações</button>
<button class="btn-padrao verde" onclick="abrirModalUpload(${i.id})">📎 Adicionar evidência</button>
<button class="btn-padrao azul" onclick="abrirAnaliseDoItem(${i.id})">🧠 Análise técnica</button>
</div>
${evidenciasHtml}
</section>
<section class="evidencia-secao evidencia-analise-resumo">
<h4>Análise Técnica</h4>
${analise?`<div class="analise-salva"><div class="analise-salva-topo"><b>${escaparHTML(analise.situacao||i.status||'-')}</b><span>${formatarDataSegura(analise.created_at)}</span></div><div>${escaparHTML(analise.analise_tecnica||'-')}</div></div>`:'<div class="evidencia-vazia">Análise técnica ainda não registrada.</div>'}
</section>
<footer class="evidencia-situacao evidencia-situacao-${val.status.toLowerCase()}">
<span>EVIDÊNCIAS: ${val.validas} validada(s), ${val.pendentes} pendente(s), ${val.rejeitadas} rejeitada(s)</span>
<strong>SITUAÇÃO DA EVIDÊNCIA: ${val.status}</strong>
</footer>
</article>`
}
box.innerHTML=`
<div class="evidencia-resumo-grid">
<div><span>Subitens</span><strong>${resumo.total}</strong></div>
<div><span>Com evidência</span><strong>${resumo.comEvidencia}</strong></div>
<div><span>Evidência validada</span><strong>${resumo.validadas}</strong></div>
<div><span>Sem evidência</span><strong>${resumo.semEvidencia}</strong></div>
<div><span>Com análise</span><strong>${resumo.comAnalise}</strong></div>
</div>${html||'<div class="evidencia-vazia">Nenhum item encontrado para o filtro informado.</div>'}`
}

/*=========================================================
004 MONITORAMENTO-EVIDENCIAS.JS RESUMO DO JURISDICIONADO
=========================================================*/
async function salvarResumoEvidencia(id,btn){
const texto=document.getElementById(`obsEvidencia_${id}`)?.value?.trim()||''
if(btn){btn.disabled=true;btn.textContent='SALVANDO...'}
const val=resumoValidacaoEvidencias(id,texto)
const{error}=await client.from('monitoramento_itens').update({
evidencia:texto||null,
evidencia_usuario:window.USER_MONITORAMENTO?.username||window.USER_MONITORAMENTO?.nome||'auditor',
evidencia_data:new Date().toISOString(),
evidencia_status:val.status
}).eq('id',id)
if(error){console.error(error);alert('Erro ao salvar as informações da evidência.')}else{
if(typeof registrarLog==='function')await registrarLog('INFORMAÇÕES DE EVIDÊNCIA ATUALIZADAS','monitoramento_itens',id)
}
if(btn){btn.disabled=false;btn.textContent='💾 Salvar informações'}
await renderPainelEvidencias()
}

/*=========================================================
005 MONITORAMENTO-EVIDENCIAS.JS MODAL E UPLOAD
=========================================================*/
function abrirModalUpload(itemId){
window.ITEM_EVIDENCIA_ATUAL=itemId
const modal=document.getElementById('modalUploadEvidencia')
if(!modal)return
modal.classList.remove('hidden')
const form=document.getElementById('formEvidenciaEstruturada')
if(form)form.reset()
const item=document.querySelector(`[data-evidencia-item="${itemId}"] .evidencia-origem`)?.textContent||''
const org=document.getElementById('evOrgaoSetor')
if(org&&!org.value)org.value=item
}
function fecharModalUpload(){document.getElementById('modalUploadEvidencia')?.classList.add('hidden')}
function abrirModalEvidencia(itemId){abrirModalUpload(itemId)}
function fecharModalEvidencia(){fecharModalUpload()}

async function uploadEvidencia(){
const itemId=window.ITEM_EVIDENCIA_ATUAL
if(!itemId){alert('Selecione um item.');return}
const tipo=document.getElementById('evTipo')?.value?.trim()||''
const numero=document.getElementById('evNumero')?.value?.trim()||''
const linkSei=document.getElementById('evSei')?.value?.trim()||''
const orgaoSetor=document.getElementById('evOrgaoSetor')?.value?.trim()||''
const descricao=document.getElementById('evDescricao')?.value?.trim()||''
const confiabilidade=document.getElementById('evConfiabilidade')?.value||'MÉDIA'
const dataDocumento=document.getElementById('evData')?.value||new Date().toISOString().slice(0,10)
const file=document.getElementById('arquivoEvidencia')?.files?.[0]||null
if(!tipo){alert('Informe o tipo de evidência.');return}
if(!descricao&&!numero&&!file&&!linkSei){alert('Informe ao menos uma descrição, número, arquivo ou link SEI.');return}
let linkArquivo=null
if(file){
const nomeSeguro=file.name.replace(/[^a-zA-Z0-9._-]/g,'_')
const caminho=`${itemId}/${Date.now()}_${nomeSeguro}`
const{error:uploadError}=await client.storage.from('monitoramento-evidencias').upload(caminho,file,{upsert:false})
if(uploadError){console.error(uploadError);alert('Erro no upload do arquivo.');return}
const{data:urlData}=client.storage.from('monitoramento-evidencias').getPublicUrl(caminho)
linkArquivo=urlData?.publicUrl||null
}
const{error}=await client.from('monitoramento_evidencias').insert([{
item_id:itemId,
tipo_evidencia:tipo,
numero_documento:numero||null,
descricao:descricao||null,
orgao:orgaoSetor||null,
orgao_setor:orgaoSetor||null,
link_arquivo:linkArquivo,
link_sei:linkSei||null,
status_validacao:'PENDENTE',
confiabilidade:confiabilidade,
data_documento:dataDocumento
}])
if(error){console.error(error);alert('Erro ao registrar a evidência.');return}
await client.from('monitoramento_itens').update({evidencia_upload:!!file,evidencia_status:'PARCIAL'}).eq('id',itemId)
if(typeof registrarLog==='function')await registrarLog('EVIDÊNCIA ADICIONADA','monitoramento_evidencias',itemId)
fecharModalUpload()
await renderPainelEvidencias()
}

/*=========================================================
006 MONITORAMENTO-EVIDENCIAS.JS VALIDAR/EDITAR/EXCLUIR
=========================================================*/
async function validarEvidencia(id,status='VALIDADA'){
const{error}=await client.from('monitoramento_evidencias').update({status_validacao:status}).eq('id',id)
if(error){console.error(error);alert('Erro ao validar evidência.');return}
if(typeof registrarLog==='function')await registrarLog(`EVIDÊNCIA ${status}`,'monitoramento_evidencias',id)
await atualizarStatusEvidenciaItemPorDocumento(id)
await renderPainelEvidencias()
}
async function atualizarStatusEvidenciaItemPorDocumento(evidenciaId){
const{data:e}=await client.from('monitoramento_evidencias').select('item_id').eq('id',evidenciaId).single()
if(!e)return
const[{data:docs},{data:item}]=await Promise.all([
client.from('monitoramento_evidencias').select('status_validacao').eq('item_id',e.item_id),
client.from('monitoramento_itens').select('evidencia').eq('id',e.item_id).single()
])
window.MAPA_EVIDENCIAS[e.item_id]=docs||[]
const val=resumoValidacaoEvidencias(e.item_id,item?.evidencia||'')
await client.from('monitoramento_itens').update({evidencia_status:val.status}).eq('id',e.item_id)
}
async function editarEvidencia(id){
const{data,error}=await client.from('monitoramento_evidencias').select('*').eq('id',id).single()
if(error||!data){console.error(error);return}
const descricao=prompt('Descrição da evidência:',data.descricao||'')
if(descricao===null)return
const numero=prompt('Número/identificador do documento:',data.numero_documento||'')
if(numero===null)return
const{error:updateError}=await client.from('monitoramento_evidencias').update({descricao,numero_documento:numero||null}).eq('id',id)
if(updateError){console.error(updateError);alert('Erro ao editar evidência.');return}
if(typeof registrarLog==='function')await registrarLog('EVIDÊNCIA EDITADA','monitoramento_evidencias',id)
await renderPainelEvidencias()
}
async function excluirEvidencia(id){
if(!confirm('Excluir este registro de evidência?'))return
const{data:e}=await client.from('monitoramento_evidencias').select('item_id').eq('id',id).single()
const{error}=await client.from('monitoramento_evidencias').delete().eq('id',id)
if(error){console.error(error);alert('Erro ao excluir evidência.');return}
if(typeof registrarLog==='function')await registrarLog('EVIDÊNCIA EXCLUÍDA','monitoramento_evidencias',id)
if(e?.item_id){window.MAPA_EVIDENCIAS[e.item_id]=[]}
await renderPainelEvidencias()
}

/*=========================================================
007 MONITORAMENTO-EVIDENCIAS.JS ANÁLISE TÉCNICA
=========================================================*/
async function abrirAnaliseDoItem(itemId){
window.ITEM_EVIDENCIA_ATUAL=itemId
if(typeof abrirTela==='function')abrirTela('analises')
const{data:item}=await client.from('monitoramento_itens').select('*').eq('id',itemId).single()
const{data:analises}=await client.from('monitoramento_analises').select('*').eq('item_id',itemId).order('created_at',{ascending:false}).limit(1)
const editor=document.getElementById('textoAnalise')
if(editor){
if(analises?.length)editor.innerText=analises[0].analise_tecnica||''
else editor.innerText=`ITEM: ${item?.item||'-'}\nSUBITEM: ${item?.subitem||'-'}\n\nANÁLISE TÉCNICA:\n\nCONCLUSÃO:\n`
}
if(typeof carregarAnalises==='function')await carregarAnalises()
}

/*=========================================================
008 MONITORAMENTO-EVIDENCIAS.JS PDF INDIVIDUAL SIMPLES
=========================================================*/
async function gerarPDFItem(id){
window.ITEM_EVIDENCIA_ATUAL=id
if(typeof gerarQuadroAnaliseItens==='function'){
await gerarQuadroAnaliseItens(id)
if(typeof gerarPDFMonitoramento==='function')await gerarPDFMonitoramento()
}
}

/*=========================================================
009 MONITORAMENTO-EVIDENCIAS.JS LOG
=========================================================*/
async function registrarLog(acao,tabela,registro){
try{
await client.from('monitoramento_logs').insert([{
usuario:window.USER_MONITORAMENTO?.nome||window.USER_MONITORAMENTO?.username||'AUDITOR',
acao,tabela,registro_id:registro||0,monitoramento_id:window.MONITORAMENTO_ATUAL||null,
origem:window.USER_MONITORAMENTO?.origem||document.getElementById('filtroOrigem')?.value||'-',
nivel:window.USER_MONITORAMENTO?.nivel||4,dados:{data:new Date().toISOString()}
}])
}catch(e){console.warn('Log não registrado:',e)}
}

/*=========================================================
010 MONITORAMENTO-EVIDENCIAS.JS COMPATIBILIDADE
=========================================================*/
window.carregarEvidencias=renderPainelEvidencias
