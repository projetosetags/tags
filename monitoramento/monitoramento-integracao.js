/*=========================================================
001 MONITORAMENTO-INTEGRACAO.JS • ORQUESTRAÇÃO V2
SEDAM + SEPAT • Evidências • Relatórios • Exportações
=========================================================*/
window.SYNC_EM_EXECUCAO=false
window.SYNC_ULTIMA_EXECUCAO=null
window.MT_LIBS={}

/*=========================================================
002 STATUS E CRITICIDADE — DADO DECLARADO NO TAG
=========================================================*/
function calcularStatusMonitoramento(percentual){
const p=Number(percentual||0)
if(p>=100)return'EXECUTADA'
if(p<=0)return'NÃO EXECUTADA'
return'PARCIALMENTE EXECUTADA'
}
function calcularCriticidadeMonitoramento(percentual){
const p=Number(percentual||0)
if(p<40)return'ALTA'
if(p<80)return'MÉDIA'
return'BAIXA'
}

/*=========================================================
003 UTILITÁRIOS GERAIS
=========================================================*/
function mtEsc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function mtText(v,fallback='-'){const s=String(v??'').trim();return s||fallback}
function mtNL(v){return mtEsc(mtText(v)).replace(/\n/g,'<br>')}
function mtNum(v){const n=Number(v);return Number.isFinite(n)?n:0}
function mtData(v){if(!v)return'-';const d=new Date(v);return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('pt-BR')}
function mtClasseStatus(s){const t=String(s||'').toUpperCase();if(t==='EXECUTADA'||t.includes('CUMPRIDA'))return'rel-ok';if(t.includes('PARCIAL'))return'rel-parcial';if(t.includes('NÃO')||t.includes('NAO'))return'rel-nao';return'rel-andamento'}
function mtOrdenar(lista){return typeof ordenarDataGlobal==='function'?ordenarDataGlobal(lista||[]):typeof ordenarItensMonitoramento==='function'?ordenarItensMonitoramento(lista||[]):(lista||[])}
function mtMap(lista,campo){const m={};(lista||[]).forEach(x=>{const k=String(x[campo]??'');if(!m[k])m[k]=[];m[k].push(x)});return m}
function mtMes100(f){
const meses=[['jan','JAN'],['fev','FEV'],['mar','MAR'],['abr','ABR'],['mai','MAI'],['jun','JUN'],['jul','JUL'],['ago','AGO'],['set','SET'],['out','OUT'],['nov','NOV'],['dez','DEZ']]
for(const [k,l] of meses){if(Number(f?.[k])>=100)return l}
return'-'
}
function mtHistoricoMeses(f){
const meses=[['jan','JAN'],['fev','FEV'],['mar','MAR'],['abr','ABR'],['mai','MAI'],['jun','JUN'],['jul','JUL'],['ago','AGO'],['set','SET'],['out','OUT'],['nov','NOV'],['dez','DEZ']]
return meses.map(([k,l])=>{const v=f?.[k];const n=Number(v);const tem=v!==null&&v!==undefined&&v!=='';return`<span class="mt-mes ${n>=100?'mt-cem':''}">${l}: ${tem&&Number.isFinite(n)?n.toFixed(0)+'%':'-'}</span>`}).join('')
}
function mtAnaliseValida(a){return !!a&&String(a.workflow_status||'').toUpperCase()==='VALIDADO'}
function mtSituacaoTecnica(a){return mtAnaliseValida(a)?mtText(a.situacao,'VALIDADA'):'PENDENTE DE VALIDAÇÃO TÉCNICA'}
function mtUnicos(arr){return[...new Set((arr||[]).map(x=>String(x||'').trim()).filter(Boolean))]}
function mtOrigemAtual(){return String(document.getElementById('filtroOrigem')?.value||window.ORIGEM_ATUAL||'TODAS').toUpperCase()}

/*=========================================================
004 SINCRONIZAÇÃO AUTOMÁTICA SEDAM/SEPAT
A atualização preserva evidências, análises e resultados técnicos.
=========================================================*/
async function sincronizarTAGsMonitoramento(opcoes={}){
if(window.SYNC_EM_EXECUCAO)return{inseridos:0,atualizados:0}
window.SYNC_EM_EXECUCAO=true
const silencioso=opcoes.silencioso===true
try{
let origem=mtOrigemAtual()
let monitoramento=null
if(window.MONITORAMENTO_ATUAL&&typeof carregarMonitoramentoAtual==='function'){
monitoramento=await carregarMonitoramentoAtual()
if(monitoramento?.origem)origem=String(monitoramento.origem).toUpperCase().trim()
}
let query=client.from('vw_monitoramento_integrado').select('*')
if(origem&&origem!=='TODAS')query=query.eq('origem',origem)
const{data:fontes,error}=await query
if(error)throw error
const{data:mons,error:erroMons}=await client.from('monitoramentos').select('id,origem')
if(erroMons)throw erroMons
const ids={};(mons||[]).forEach(m=>ids[String(m.origem||'').toUpperCase()]=m.id)
let inseridos=0,atualizados=0
for(const d of(fontes||[])){
const origemItem=String(d.origem||origem||'').toUpperCase()
const monitoramentoId=ids[origemItem]||window.MONITORAMENTO_ATUAL||null
if(!monitoramentoId)continue
const percentual=mtNum(d.percentual??d.total_cumprimento)
const payload={
monitoramento_id:monitoramentoId,
deliberacao_id:d.id,
origem:origemItem,
item:mtText(d.codigo_item||d.item),
subitem:mtText(d.codigo_subitem||d.subitem),
descricao:mtText(d.descricao||d.descricao_subitem||d.acao),
achado:mtText(d.achado||d.descricao_item||d.deliberacao||d.descricao),
deliberacao:mtText(d.achado||d.deliberacao||d.descricao_item||d.descricao),
acao_gestor:mtText(d.acao||d.descricao),
produto:mtText(d.produto),
produto_esperado:mtText(d.produto),
entrega_esperada:mtText(d.prazo_texto||d.data_fim),
beneficio_esperado:mtText(d.meta,'' )||null,
responsavel:mtText(d.responsavel),
percentual,
status:calcularStatusMonitoramento(percentual),
criticidade:calcularCriticidadeMonitoramento(percentual),
sincronizado_em:new Date().toISOString()
}
const{data:existe,error:erroExiste}=await client.from('monitoramento_itens').select('id').eq('deliberacao_id',d.id).eq('origem',origemItem).limit(1)
if(erroExiste){console.warn(erroExiste);continue}
if(existe?.length){
const{error:upErr}=await client.from('monitoramento_itens').update(payload).eq('id',existe[0].id)
if(upErr)console.warn(upErr);else atualizados++
}else{
const{error:inErr}=await client.from('monitoramento_itens').insert([payload])
if(inErr)console.warn(inErr);else inseridos++
}
}
window.SYNC_ULTIMA_EXECUCAO=new Date().toISOString()
if(typeof registrarLog==='function'){try{await registrarLog('RECONCILIAÇÃO AUTOMÁTICA TAGS','monitoramento_itens',window.MONITORAMENTO_ATUAL||0)}catch(e){console.warn(e)}}
if(typeof carregarDashboard==='function')await carregarDashboard()
if(typeof carregarItensMatriz==='function')await carregarItensMatriz()
if(document.getElementById('tela-evidencias')&&!document.getElementById('tela-evidencias').classList.contains('hidden'))await renderPainelEvidencias()
if(!silencioso)alert(`TAGs atualizadas: ${inseridos} novo(s) e ${atualizados} registro(s) reconciliado(s). Evidências e análises técnicas foram preservadas.`)
return{inseridos,atualizados}
}catch(e){
console.error('Erro na sincronização TAGS:',e)
if(!silencioso)alert('Não foi possível concluir a sincronização. Consulte o console técnico.')
return{inseridos:0,atualizados:0,error:e}
}finally{window.SYNC_EM_EXECUCAO=false}
}
window.sincronizarTAGsMonitoramento=sincronizarTAGsMonitoramento
window.sincronizarTAGSedam=sincronizarTAGsMonitoramento
window.atualizarMonitoramentoAutomatico=async()=>sincronizarTAGsMonitoramento({silencioso:true})

/*=========================================================
005 FILTRO DE ORIGEM
=========================================================*/
function filtrarOrigemMonitoramento(){
window.ORIGEM_ATUAL=mtOrigemAtual()
if(typeof carregarListaMonitoramentos==='function')carregarListaMonitoramentos()
if(typeof carregarDashboard==='function')carregarDashboard()
if(typeof carregarItensMatriz==='function')carregarItensMatriz()
if(document.getElementById('tela-evidencias')&&!document.getElementById('tela-evidencias').classList.contains('hidden'))renderPainelEvidencias()
if(document.getElementById('tela-relatorios')&&!document.getElementById('tela-relatorios').classList.contains('hidden'))mtStatusRelatorio()
}

/*=========================================================
006 DASHBOARD COERENTE — MESMA UNIDADE: SUBITENS
=========================================================*/
async function carregarDashboard(){
try{
const origem=mtOrigemAtual()
let query=client.from('monitoramento_itens').select('*')
if(window.MONITORAMENTO_ATUAL)query=query.eq('monitoramento_id',Number(window.MONITORAMENTO_ATUAL))
if(origem!=='TODAS')query=query.eq('origem',origem)
let{data,error}=await query;if(error)throw error
data=mtOrdenar(data||[])
const total=data.length
const executadas=data.filter(i=>i.status==='EXECUTADA').length
const parciais=data.filter(i=>String(i.status||'').includes('PARCIAL')).length
const naoExecutadas=data.filter(i=>String(i.status||'').includes('NÃO')).length
const andamento=data.filter(i=>i.status==='EM ANDAMENTO').length
const semEvidencia=data.filter(i=>!String(i.evidencia||'').trim()&&!i.evidencia_upload).length
const evidCompleta=data.filter(i=>i.evidencia_status==='COMPLETA').length
const pctEvid=total?(evidCompleta/total)*100:0
const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v}
set('kpiTotal',total);set('kpiExecutadas',executadas);set('kpiParciais',parciais);set('kpiNaoExecutadas',naoExecutadas);set('kpiAndamento',andamento);set('kpiSemEvidencia',semEvidencia);set('kpiPercentualEvidencia',pctEvid.toFixed(1)+'%')
if(typeof carregarGraficoStatus==='function')await carregarGraficoStatus(executadas,parciais,naoExecutadas,andamento)
const alto=data.filter(i=>mtNum(i.percentual)<40).length,medio=data.filter(i=>mtNum(i.percentual)>=40&&mtNum(i.percentual)<80).length,baixo=data.filter(i=>mtNum(i.percentual)>=80).length
if(typeof carregarGraficoCriticidade==='function')await carregarGraficoCriticidade(alto,medio,baixo)
await carregarGraficoEvolucao();await carregarGraficoBeneficios()
if(typeof carregarCardsDashboard==='function')await carregarCardsDashboard(data)
}catch(e){console.error('Dashboard:',e)}
}
async function carregarGraficoEvolucao(){
const ctx=document.getElementById('graficoEvolucao');if(!ctx)return
const origem=mtOrigemAtual();let q=client.from('vw_monitoramento_integrado').select('origem,jan,fev,mar,abr,mai,jun,jul,ago,set,out,nov,dez');if(origem!=='TODAS')q=q.eq('origem',origem)
const{data,error}=await q;if(error){console.warn(error);return}
const campos=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],labels=campos.map(x=>x.toUpperCase())
const valores=campos.map(c=>{const arr=(data||[]).map(r=>r[c]).filter(v=>v!==null&&v!==undefined&&v!=='').map(Number).filter(Number.isFinite);return arr.length?Number((arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1)):null})
if(window.graficoEvolucao?.destroy)window.graficoEvolucao.destroy()
window.graficoEvolucao=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Execução média declarada no TAG',data:valores,fill:true,tension:.3,spanGaps:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#fff'}},datalabels:{color:'#fff',anchor:'end',align:'top',formatter:v=>v===null?'':v+'%'}},scales:{x:{ticks:{color:'#fff'},grid:{color:'rgba(255,255,255,.05)'}},y:{beginAtZero:true,max:100,ticks:{color:'#fff',callback:v=>v+'%'},grid:{color:'rgba(255,255,255,.05)'}}}},plugins:[ChartDataLabels]})
}
async function carregarGraficoBeneficios(){
const ctx=document.getElementById('graficoBeneficios');if(!ctx)return
const{data,error}=await client.from('monitoramento_resultados').select('item_id,beneficio_financeiro,beneficio_operacional,beneficio_social,beneficio_ambiental,beneficio_governanca');if(error){console.warn(error);return}
let permitidos=null;if(window.MONITORAMENTO_ATUAL){const{data:itens}=await client.from('monitoramento_itens').select('id').eq('monitoramento_id',Number(window.MONITORAMENTO_ATUAL));permitidos=new Set((itens||[]).map(i=>i.id))}
const linhas=(data||[]).filter(r=>!permitidos||permitidos.has(r.item_id)),soma=c=>linhas.reduce((s,r)=>s+mtNum(r[c]),0),valores=[soma('beneficio_financeiro'),soma('beneficio_operacional'),soma('beneficio_social'),soma('beneficio_ambiental'),soma('beneficio_governanca')]
if(window.graficoBeneficios?.destroy)window.graficoBeneficios.destroy()
window.graficoBeneficios=new Chart(ctx,{type:'bar',data:{labels:['Financeiro','Operacional','Social','Ambiental','Governança'],datasets:[{label:'Benefícios registrados',data:valores}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#fff'}},datalabels:{color:'#fff',anchor:'end',align:'top',formatter:v=>v||''}},scales:{x:{ticks:{color:'#fff'},grid:{color:'rgba(255,255,255,.05)'}},y:{beginAtZero:true,ticks:{color:'#fff'},grid:{color:'rgba(255,255,255,.05)'}}}},plugins:[ChartDataLabels]})
}

/*=========================================================
007 PACOTE INTEGRADO PARA EVIDÊNCIAS E RELATÓRIOS
=========================================================*/
async function mtPacote(itemId=null){
const origem=mtOrigemAtual()
let qM=client.from('monitoramentos').select('*').order('id',{ascending:true})
if(window.MONITORAMENTO_ATUAL)qM=qM.eq('id',Number(window.MONITORAMENTO_ATUAL));else if(origem!=='TODAS')qM=qM.eq('origem',origem)
let qI=client.from('monitoramento_itens').select('*')
if(itemId)qI=qI.eq('id',Number(itemId));else if(window.MONITORAMENTO_ATUAL)qI=qI.eq('monitoramento_id',Number(window.MONITORAMENTO_ATUAL));else if(origem!=='TODAS')qI=qI.eq('origem',origem)
let qF=client.from('vw_monitoramento_integrado').select('*');if(origem!=='TODAS')qF=qF.eq('origem',origem)
const[rM,rI,rF,rE,rA,rR]=await Promise.all([qM,qI,qF,client.from('monitoramento_evidencias').select('*').order('created_at',{ascending:false}),client.from('monitoramento_analises').select('*').order('created_at',{ascending:false}),client.from('monitoramento_resultados').select('*').order('created_at',{ascending:false})])
if(rM.error||rI.error)throw(rM.error||rI.error)
const fonteMap={};(rF.data||[]).forEach(f=>fonteMap[String(f.id)]=f)
const evidMap=mtMap(rE.data||[],'item_id'),resultadoMap=mtMap(rR.data||[],'item_id'),analiseMap={};(rA.data||[]).forEach(a=>{if(!analiseMap[String(a.item_id)])analiseMap[String(a.item_id)]=a})
return{monitoramentos:rM.data||[],itens:mtOrdenar(rI.data||[]),fontes:rF.data||[],fonteMap,evidencias:rE.data||[],evidMap,analises:rA.data||[],analiseMap,resultados:rR.data||[],resultadoMap}
}

/*=========================================================
008 PAINEL EVIDÊNCIAS — MODELO TÉCNICO INTEGRADO
=========================================================*/
function mtResumoValidacao(itemId,manual,map){
const docs=map[String(itemId)]||[],validas=docs.filter(e=>String(e.status_validacao).toUpperCase()==='VALIDADA').length,rejeitadas=docs.filter(e=>String(e.status_validacao).toUpperCase()==='REJEITADA').length,pendentes=docs.length-validas-rejeitadas,temManual=String(manual||'').trim().length>0
let status='SEM EVIDÊNCIA';if(temManual||docs.length)status='EM CONFERÊNCIA';if(validas>0&&pendentes===0&&rejeitadas===0)status='EVIDÊNCIA VALIDADA'
return{docs,validas,rejeitadas,pendentes,status}
}
async function renderPainelEvidencias(){
const box=document.getElementById('painelEvidenciasItens');if(!box)return
box.innerHTML='<div class="mt-vazio">Carregando TAG, evidências e análises...</div>'
try{
const p=await mtPacote(),busca=String(document.getElementById('buscaEvidencia')?.value||'').toLowerCase().trim(),origemEv=String(document.getElementById('filtroOrigemEvidencia')?.value||mtOrigemAtual()).toUpperCase()
let dados=p.itens;if(origemEv!=='TODAS')dados=dados.filter(i=>String(i.origem).toUpperCase()===origemEv)
if(busca)dados=dados.filter(i=>{const f=p.fonteMap[String(i.deliberacao_id)]||{};return[i.item,i.subitem,i.descricao,i.produto,i.responsavel,f.achado,f.acao,f.produto,f.meta].join(' ').toLowerCase().includes(busca)})
let comE=0,validadas=0,comA=0,analisesVal=0,html=''
for(const i of dados){
const f=p.fonteMap[String(i.deliberacao_id)]||{},a=p.analiseMap[String(i.id)],ev=mtResumoValidacao(i.id,i.evidencia,p.evidMap)
if(ev.status!=='SEM EVIDÊNCIA')comE++;if(ev.status==='EVIDÊNCIA VALIDADA')validadas++;if(a)comA++;if(mtAnaliseValida(a))analisesVal++
const achado=f.achado||i.achado||i.deliberacao,acao=f.acao||i.acao_gestor||i.descricao,produto=f.produto||i.produto||i.produto_esperado,prazo=f.prazo_texto||i.entrega_esperada||i.prazo,meta=f.meta||i.beneficio_esperado,orgao=String(i.origem||'-').toUpperCase(),codigoItem=f.codigo_item||i.item,codigoSub=f.codigo_subitem||i.subitem
const docs=(p.evidMap[String(i.id)]||[]).map((e,n)=>`<div class="mt-doc"><div class="mt-doc-num">${n+1}</div><div><div class="mt-doc-title">${mtEsc(mtText(e.tipo_evidencia))}${e.numero_documento?' — '+mtEsc(e.numero_documento):''}</div><div class="mt-doc-desc">${mtEsc(mtText(e.descricao))}</div><div class="mt-doc-meta">${mtEsc(mtText(e.orgao_setor||e.orgao))} • ${mtData(e.data_documento)} • Confiabilidade: ${mtEsc(mtText(e.confiabilidade))}</div><div class="mt-doc-actions">${e.link_arquivo?`<a class="mt-mini" href="${mtEsc(e.link_arquivo)}" target="_blank" rel="noopener">Abrir arquivo</a>`:''}${e.link_sei?`<a class="mt-mini" href="${mtEsc(e.link_sei)}" target="_blank" rel="noopener">Abrir SEI</a>`:''}<span class="mt-validacao ${mtEsc(e.status_validacao||'PENDENTE')}">${mtEsc(e.status_validacao||'PENDENTE')}</span><button class="mt-mini ok" onclick="validarEvidencia(${e.id},'VALIDADA')">Validar</button><button class="mt-mini no" onclick="validarEvidencia(${e.id},'REJEITADA')">Rejeitar</button>${typeof editarEvidencia==='function'?`<button class="mt-mini" onclick="editarEvidencia(${e.id})">Editar</button>`:''}</div></div></div>`).join('')
html+=`<article class="mt-evidencia-ficha" data-evidencia-item="${i.id}"><header class="mt-evidencia-topo"><div><div class="mt-origem">${mtEsc(orgao)}</div><h3>ITEM ${mtEsc(mtText(codigoItem))} • SUBITEM ${mtEsc(mtText(codigoSub))}</h3><div style="margin-top:7px"><span class="mt-chip">Primeiro 100% no histórico: ${mtEsc(mtMes100(f))}</span></div></div><div class="mt-status-box"><strong>${mtNum(i.percentual).toFixed(0)}%</strong><small>execução declarada no TAG</small><span class="mt-chip">${mtEsc(i.status||'-')}</span></div></header><div class="mt-fonte-grid"><div class="mt-label">Situação Encontrada / Achado</div><div class="mt-wide">${mtNL(achado)}</div><div class="mt-label">Ação a ser Adotada</div><div>${mtNL(acao)}</div><div class="mt-label">Prazo</div><div>${mtNL(prazo)}</div><div class="mt-label">Produto Esperado</div><div>${mtNL(produto)}</div><div class="mt-label">Responsável</div><div>${mtNL(i.responsavel||f.responsavel)}</div>${meta?`<div class="mt-label">Meta / Resultado esperado</div><div>${mtNL(meta)}</div>`:''}</div><div class="mt-historico-meses">${mtHistoricoMeses(f)}</div><section class="mt-secao-evidencia"><h4>Informações prestadas pela ${mtEsc(orgao)}</h4><textarea id="obsEvidencia_${i.id}" placeholder="Registre, de forma objetiva e numerada, os documentos e informações apresentados pelo jurisdicionado.">${mtEsc(i.evidencia||'')}</textarea><div class="mt-toolbar"><button class="btn-padrao" onclick="salvarResumoEvidencia(${i.id},this)">💾 Salvar informações</button><button class="btn-padrao verde" onclick="abrirModalUpload(${i.id})">📎 Adicionar evidência estruturada</button><button class="btn-padrao azul" onclick="abrirAnaliseDoItem(${i.id})">🧠 Análise técnica</button><button class="btn-padrao" onclick="gerarQuadroEvidenciasOficial(${i.id})">📄 Ficha</button></div><div class="mt-docs">${docs||'<div class="mt-vazio">Nenhum documento estruturado cadastrado para este subitem.</div>'}</div></section><section class="mt-secao-evidencia"><h4>Análise Técnica</h4>${a?`<div class="mt-doc-desc" style="font-size:13px">${mtNL(a.analise_tecnica)}</div><div style="margin-top:8px"><span class="mt-chip">Workflow: ${mtEsc(a.workflow_status||'RASCUNHO')}</span> <span class="mt-chip">Situação: ${mtEsc(a.situacao||'-')}</span></div>`:'<div class="mt-vazio">Análise técnica ainda não registrada. O percentual do TAG não é tratado automaticamente como conclusão de auditoria.</div>'}</section><footer class="mt-rodape-ficha"><span class="${ev.status==='EVIDÊNCIA VALIDADA'?'mt-pronto':'mt-pendente'}">EVIDÊNCIAS: ${ev.status} • ${ev.validas} validada(s), ${ev.pendentes} pendente(s), ${ev.rejeitadas} rejeitada(s)</span><span class="${mtAnaliseValida(a)?'mt-pronto':'mt-pendente'}">ANÁLISE: ${mtAnaliseValida(a)?'VALIDADA':'PENDENTE'}</span></footer></article>`
}
box.innerHTML=`<div class="mt-fonte-aviso"><strong>Integração automática ativa.</strong> Achado, ação, produto, responsável, prazo, evolução mensal e percentual vêm dos TAGs SEDAM/SEPAT. Evidências e conclusão técnica permanecem sob validação da equipe de auditoria.</div><div class="mt-resumo-grid"><div class="mt-resumo-card"><span>Subitens</span><strong>${dados.length}</strong></div><div class="mt-resumo-card"><span>Com evidência</span><strong>${comE}</strong></div><div class="mt-resumo-card"><span>Evidência validada</span><strong>${validadas}</strong></div><div class="mt-resumo-card"><span>Com análise</span><strong>${comA}</strong></div><div class="mt-resumo-card"><span>Análise validada</span><strong>${analisesVal}</strong></div></div>${html||'<div class="mt-vazio">Nenhum subitem localizado.</div>'}`
}catch(e){console.error(e);box.innerHTML='<div class="alerta-vermelho">Erro ao integrar as evidências. Verifique a conexão e os dados.</div>'}
}
window.renderPainelEvidencias=renderPainelEvidencias
window.carregarEvidencias=renderPainelEvidencias

/*=========================================================
009 MODAL ÚNICO DE EVIDÊNCIA ESTRUTURADA
=========================================================*/
function mtCriarModalEvidencia(){
document.querySelectorAll('#modalUploadEvidencia').forEach(x=>x.remove())
const modal=document.createElement('div');modal.id='modalUploadEvidencia';modal.className='mt-modal hidden';modal.innerHTML=`<div class="mt-modal-card"><div class="mt-modal-head"><h3>📎 Evidência Estruturada</h3><button class="btn-padrao vermelho" onclick="fecharModalUpload()">✖ Fechar</button></div><div class="mt-modal-body"><form id="formEvidenciaEstruturada" onsubmit="event.preventDefault();uploadEvidencia();"><div class="mt-form-grid"><div class="mt-campo"><label>Tipo de evidência *</label><select id="evTipo"><option value="">Selecione</option><option>Ofício</option><option>Memorando</option><option>Despacho</option><option>Relatório</option><option>Planilha</option><option>Nota Técnica</option><option>Processo SEI</option><option>Imagem/Fotografia</option><option>Outro documento</option></select></div><div class="mt-campo"><label>Número / ID do documento</label><input id="evNumero" placeholder="Ex.: SEI 0028.017407_2025-24"></div><div class="mt-campo"><label>Órgão / Setor</label><input id="evOrgaoSetor" placeholder="SEDAM-COMRAR, SEPAT..."></div><div class="mt-campo"><label>Data do documento</label><input id="evData" type="date"></div><div class="mt-campo"><label>Confiabilidade</label><select id="evConfiabilidade"><option>ALTA</option><option selected>MÉDIA</option><option>BAIXA</option></select></div><div class="mt-campo"><label>Link do SEI</label><input id="evSei" type="url" placeholder="https://..."></div><div class="mt-campo mt-span2"><label>Descrição / síntese da evidência *</label><textarea id="evDescricao" placeholder="Descreva o conteúdo, o que comprova e a relação com a ação/produto monitorado."></textarea></div><div class="mt-campo mt-span2"><label>Arquivo</label><input type="file" id="arquivoEvidencia" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"></div></div><div class="mt-toolbar"><button class="btn-padrao verde" type="submit">📤 Salvar evidência</button><button class="btn-padrao" type="button" onclick="fecharModalUpload()">Cancelar</button></div></form></div></div>`;document.body.appendChild(modal)
}
function abrirModalUpload(itemId){
window.ITEM_EVIDENCIA_ATUAL=itemId
let modal=document.getElementById('modalUploadEvidencia');if(!modal||!document.getElementById('evTipo')){mtCriarModalEvidencia();modal=document.getElementById('modalUploadEvidencia')}
document.getElementById('formEvidenciaEstruturada')?.reset();const org=document.getElementById('evOrgaoSetor');if(org)org.value=document.querySelector(`[data-evidencia-item="${itemId}"] .mt-origem`)?.textContent||'';const data=document.getElementById('evData');if(data)data.value=new Date().toISOString().slice(0,10);modal.classList.remove('hidden')
}
function fecharModalUpload(){document.getElementById('modalUploadEvidencia')?.classList.add('hidden')}
window.abrirModalUpload=abrirModalUpload;window.abrirModalEvidencia=abrirModalUpload;window.fecharModalUpload=fecharModalUpload;window.fecharModalEvidencia=fecharModalUpload

/*=========================================================
010 RELATÓRIO — CABEÇALHO, METADADOS E FICHA
=========================================================*/
function mtCab(){return`<div class="rel-institucional-v2"><div class="orgao">TRIBUNAL DE CONTAS DO ESTADO DE RONDÔNIA</div><div>Secretaria-Geral de Controle Externo – SGCE</div><div>Coordenadoria Especializada em Políticas Públicas – CECEX-9</div></div>`}
function mtMeta(m){return`<table class="rel-meta-v2"><tr><th>PROCESSO</th><td>${mtEsc(mtText(m.processo))}</td></tr><tr><th>UNIDADE JURISDICIONADA</th><td>${mtEsc(mtText(m.orgao))}</td></tr><tr><th>INTERESSADO</th><td>Tribunal de Contas do Estado de Rondônia – TCE-RO</td></tr><tr><th>CATEGORIA</th><td>Auditoria e Inspeção</td></tr><tr><th>SUBCATEGORIA</th><td>Monitoramento</td></tr><tr><th>ASSUNTO</th><td>${mtNL(m.assunto||m.assuntos||'Acompanhamento e monitoramento da execução do Termo de Ajustamento de Gestão.')}</td></tr><tr><th>ACÓRDÃO / ATO DE REFERÊNCIA</th><td>${mtNL(m.acordao)}</td></tr><tr><th>RELATOR</th><td>${mtEsc(mtText(m.relator))}</td></tr><tr><th>AUDITOR RESPONSÁVEL</th><td>${mtEsc(mtText(m.auditor_responsavel))}</td></tr></table>`}
function mtFicha(i,p){
const f=p.fonteMap[String(i.deliberacao_id)]||{},docs=p.evidMap[String(i.id)]||[],a=p.analiseMap[String(i.id)],achado=f.achado||i.achado||i.deliberacao,acao=f.acao||i.acao_gestor||i.descricao,produto=f.produto||i.produto||i.produto_esperado,prazo=f.prazo_texto||i.entrega_esperada||i.prazo,orgao=String(i.origem||'JURISDICIONADO').toUpperCase(),item=f.codigo_item||i.item,sub=f.codigo_subitem||i.subitem
const manual=String(i.evidencia||'').trim(),lista=docs.length?`<ol class="rel-evidence-list-v2">${docs.map(e=>`<li><b>${mtEsc(mtText(e.tipo_evidencia))}${e.numero_documento?' – '+mtEsc(e.numero_documento):''}</b>${e.descricao?': '+mtEsc(e.descricao):''}${e.orgao_setor||e.orgao?` (${mtEsc(e.orgao_setor||e.orgao)})`:''} — <b>${mtEsc(e.status_validacao||'PENDENTE')}</b>.</li>`).join('')}</ol>`:''
const info=manual?`<div class="rel-info-v2">${mtNL(manual)}</div>${lista}`:lista||'<p class="rel-pendente-v2">Não há informação/evidência registrada para este subitem.</p>'
const analise=a?`<div class="rel-tech-box-v2">${mtNL(a.analise_tecnica)}${a.conclusao?`<p><b>Conclusão:</b> ${mtNL(a.conclusao)}</p>`:''}${a.encaminhamento?`<p><b>Encaminhamento:</b> ${mtNL(a.encaminhamento)}</p>`:''}<p><b>Workflow:</b> ${mtEsc(a.workflow_status||'RASCUNHO')}${a.validado_por?` • Validado por ${mtEsc(a.validado_por)}`:''}</p></div>`:'<div class="rel-tech-box-v2 rel-pendente-v2">Análise técnica pendente. O sistema não converte automaticamente o percentual informado pelo jurisdicionado em conclusão de auditoria.</div>'
return`<section class="rel-ficha-v2"><div class="rel-ficha-title-v2">Achado: ${mtEsc(mtText(achado))} <span>(Item ${mtEsc(mtText(item))}${sub&&sub!=='-'?' – Subitem '+mtEsc(sub):''} do Plano de Ação)</span></div><table class="rel-quadro-v2"><thead><tr><th>Situação Encontrada</th><th>Ação a ser Adotada</th><th>Prazo</th></tr></thead><tbody><tr><td>${mtNL(achado)}</td><td>${mtNL(acao)}</td><td>${mtNL(prazo)}</td></tr><tr><td class="rotulo">Produto esperado</td><td colspan="2">${mtNL(produto)}</td></tr></tbody></table><div class="rel-subtitle-v2">Informações prestadas pela ${mtEsc(orgao)}</div>${info}<div class="rel-subtitle-v2">Análise Técnica</div>${analise}<div class="rel-situacao-v2"><div class="${mtClasseStatus(i.status)}">EXECUÇÃO DECLARADA NO TAG: ${mtNum(i.percentual).toFixed(0)}% — ${mtEsc(i.status||'-')}</div><div class="${mtAnaliseValida(a)?mtClasseStatus(a.situacao):'rel-andamento'}">CONCLUSÃO TÉCNICA: ${mtEsc(mtSituacaoTecnica(a))}</div></div></section>`
}

/*=========================================================
011 RELATÓRIO COMPLETO OFICIAL / PRELIMINAR
=========================================================*/
async function gerarRelatorioCompleto(){
const box=document.getElementById('previewRelatorio');if(!box)return
box.innerHTML='<div class="mt-vazio">Gerando relatório integrado a partir dos TAGs...</div>'
try{
await sincronizarTAGsMonitoramento({silencioso:true});const p=await mtPacote();if(!p.monitoramentos.length){box.innerHTML='<div class="mt-vazio">Nenhum monitoramento localizado para o filtro atual.</div>';return}
let html=''
for(const m of p.monitoramentos){
const itens=mtOrdenar(p.itens.filter(i=>Number(i.monitoramento_id)===Number(m.id))),total=itens.length,exec=itens.filter(i=>i.status==='EXECUTADA').length,parciais=itens.filter(i=>String(i.status||'').includes('PARCIAL')).length,nao=itens.filter(i=>String(i.status||'').includes('NÃO')).length,andamento=itens.filter(i=>i.status==='EM ANDAMENTO').length,media=total?itens.reduce((s,i)=>s+mtNum(i.percentual),0)/total:0,comE=itens.filter(i=>String(i.evidencia||'').trim()||(p.evidMap[String(i.id)]||[]).length).length,comA=itens.filter(i=>p.analiseMap[String(i.id)]).length,valA=itens.filter(i=>mtAnaliseValida(p.analiseMap[String(i.id)])).length,docs=itens.flatMap(i=>p.evidMap[String(i.id)]||[]),docsVal=docs.filter(e=>String(e.status_validacao).toUpperCase()==='VALIDADA').length,preliminar=valA<total
const resultados=itens.flatMap(i=>p.resultadoMap[String(i.id)]||[]),barreiras=mtUnicos(resultados.map(r=>r.causas)),beneficios=mtUnicos(resultados.map(r=>r.beneficios)),encA=mtUnicos(itens.map(i=>p.analiseMap[String(i.id)]?.encaminhamento)),encR=mtUnicos(resultados.map(r=>r.encaminhamento)),encaminhamentos=mtUnicos([...encA,...encR]),parciaisLista=itens.filter(i=>String(i.status||'').includes('PARCIAL'))
html+=`<article class="relatorio-oficial-v2">${mtCab()}<section class="rel-capa-v2"><div class="faixa">${preliminar?'RELATÓRIO PRELIMINAR DE MONITORAMENTO':'RELATÓRIO DE MONITORAMENTO'}</div><h1>${mtEsc(m.titulo||`TAG ${m.origem||''}`)}</h1><p>${mtEsc(mtText(m.orgao))}</p><p class="processo"><b>Processo:</b> ${mtEsc(mtText(m.processo))}<br><b>Referência:</b> ${mtEsc(mtText(m.acordao))}</p><div class="data">Porto Velho, ${new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}.</div></section>${mtMeta(m)}<h2>1. SUMÁRIO EXECUTIVO</h2><p>O presente relatório consolida o monitoramento da execução das ações pactuadas no ${mtEsc(mtText(m.titulo||'TAG'))}, mantendo rastreabilidade entre o Plano de Ação, os lançamentos efetuados pelo jurisdicionado, os documentos apresentados e a análise técnica da equipe de controle externo.</p><div class="rel-kpis-v2"><div><span>Subitens monitorados</span><b>${total}</b></div><div><span>Execução declarada média</span><b>${media.toFixed(1)}%</b></div><div><span>Declarados em 100%</span><b>${exec}</b></div><div><span>Com evidência</span><b>${comE}/${total}</b></div><div><span>Evidências validadas</span><b>${docsVal}/${docs.length}</b></div><div><span>Análises validadas</span><b>${valA}/${total}</b></div></div><p>Quanto à execução declarada no TAG, há ${exec} subitem(ns) em 100%, ${parciais} parcialmente executado(s), ${nao} sem execução e ${andamento} em andamento. Esses percentuais constituem informação de acompanhamento e <b>não substituem a conclusão técnica</b>, que depende da suficiência, adequação, confiabilidade e rastreabilidade das evidências.</p><h2>2. INTRODUÇÃO</h2><p>O monitoramento tem por objeto o cumprimento do Plano de Ação associado ao ${mtEsc(mtText(m.acordao||'ato de referência'))}, com verificação do grau de implementação das medidas pactuadas e de sua aderência às deliberações desta Corte de Contas.</p><h3>2.1 Identificação do objeto da fiscalização</h3><p>${mtNL(m.objeto||m.assuntos||m.assunto||'Acompanhamento e subsequente monitoramento da execução do Termo de Ajustamento de Gestão.')}</p><h3>2.2 Objetivos e escopo do monitoramento</h3><p>Verificar o grau de implementação das ações previstas no Plano de Ação, identificar barreiras e dificuldades, avaliar a suficiência das evidências apresentadas, aferir possíveis benefícios e registrar diagnóstico evolutivo do cumprimento das medidas pactuadas.</p><h3>2.3 Critérios</h3><p>São considerados o Acórdão/ato de referência, o TAG e seu Plano de Ação, os produtos, metas e prazos pactuados, bem como os atributos de suficiência, adequação, confiabilidade e rastreabilidade aplicáveis à avaliação das evidências.</p><h3>2.4 Métodos utilizados</h3><p>Os procedimentos compreendem análise documental, confronto entre ação, produto e evidência, rastreabilidade dos documentos e processos, verificação dos registros administrativos, triangulação das fontes disponíveis e validação técnica por subitem. O histórico mensal permanece vinculado aos lançamentos do TAG de origem.</p><h2>3. ANÁLISE QUANTO À EXECUÇÃO DAS AÇÕES HOMOLOGADAS</h2><p>As fichas seguintes reproduzem automaticamente os campos estruturantes do TAG e separam expressamente a <b>execução declarada pelo jurisdicionado</b> da <b>conclusão técnica validada</b>.</p>${itens.map(i=>mtFicha(i,p)).join('')}<h3>3.2 Indicação das evidências</h3><p>Foram localizados ${docs.length} documento(s) estruturado(s), dos quais ${docsVal} está(ão) validado(s), ${docs.filter(e=>String(e.status_validacao||'PENDENTE').toUpperCase()==='PENDENTE').length} pendente(s) e ${docs.filter(e=>String(e.status_validacao).toUpperCase()==='REJEITADA').length} rejeitado(s). Além disso, ${comE} de ${total} subitem(ns) possuem informação ou evidência registrada no painel.</p><h3>3.3 Principais barreiras ou dificuldades</h3>${barreiras.length?`<ul>${barreiras.map(x=>`<li>${mtNL(x)}</li>`).join('')}</ul>`:'<p class="rel-pendente-v2">Não há barreiras/dificuldades estruturadas no painel Resultados para este recorte. O tópico deverá ser complementado quando identificado pela análise técnica.</p>'}<h3>3.4 Principais ações implementadas parcialmente e benefícios observados</h3>${parciaisLista.length?`<table class="rel-table-list-v2"><thead><tr><th>Item</th><th>Subitem</th><th>Execução declarada</th><th>Produto</th></tr></thead><tbody>${parciaisLista.map(i=>{const f=p.fonteMap[String(i.deliberacao_id)]||{};return`<tr><td>${mtEsc(i.item)}</td><td>${mtEsc(i.subitem)}</td><td>${mtNum(i.percentual).toFixed(0)}%</td><td>${mtEsc(mtText(f.produto||i.produto))}</td></tr>`}).join('')}</tbody></table>`:'<p>Não há ações declaradas como parcialmente executadas no recorte atual.</p>'}${beneficios.length?`<p><b>Benefícios registrados:</b></p><ul>${beneficios.map(x=>`<li>${mtNL(x)}</li>`).join('')}</ul>`:'<p class="rel-pendente-v2">Benefícios ainda não registrados ou validados.</p>'}<h3>3.5 Continuidade do acompanhamento</h3><p>Os subitens sem evidência suficiente ou sem análise técnica validada permanecem sujeitos a complementação documental e nova avaliação pela equipe responsável, preservando-se o histórico dos lançamentos efetuados nos TAGs.</p><h3>3.6 Outras ações correlatas ao monitoramento</h3><p class="rel-pendente-v2">Registrar neste tópico fatos supervenientes, reuniões de acompanhamento, diligências, manifestações ou outras ações correlatas que sejam relevantes para a compreensão do monitoramento.</p><h2>4. CONCLUSÃO</h2><p>O monitoramento abrange ${total} subitem(ns). A execução média <b>declarada no TAG</b> é de ${media.toFixed(1)}%. Há ${comA} análise(s) técnica(s) registrada(s), das quais ${valA} está(ão) validada(s). ${preliminar?'Enquanto houver subitens sem análise técnica validada, este documento deve ser tratado como relatório preliminar e não como conclusão definitiva do monitoramento.':'Todos os subitens do recorte possuem análise técnica validada, permitindo a consolidação das conclusões registradas.'}</p><h2>5. PROPOSTAS DE ENCAMINHAMENTO</h2>${encaminhamentos.length?`<ol>${encaminhamentos.map(x=>`<li>${mtNL(x)}</li>`).join('')}</ol>`:'<p class="rel-pendente-v2">As propostas de encaminhamento serão consolidadas pela equipe técnica após a validação das evidências e das conclusões individuais.</p>'}<div class="rel-nota-v2">Documento gerado automaticamente pelo Monitoramento Técnico a partir dos TAGs SEDAM/SEPAT e dos registros de evidências, análises e resultados. Dados declaratórios não são convertidos automaticamente em conclusão de auditoria.</div><div class="rel-assinatura-v2"><div class="linha">${mtEsc(mtText(m.auditor_responsavel,'Equipe de Monitoramento'))}</div><div>Auditoria de Controle Externo</div></div></article>`
}
box.innerHTML=html;mtStatusRelatorio(p)
}catch(e){console.error(e);box.innerHTML='<div class="mt-vazio">Erro ao gerar o relatório integrado.</div>'}
}
window.gerarRelatorioCompleto=gerarRelatorioCompleto

/*=========================================================
012 RESUMO EXECUTIVO
=========================================================*/
async function gerarResumoExecutivo(){
const box=document.getElementById('previewRelatorio');if(!box)return
try{const p=await mtPacote(),itens=p.itens,total=itens.length,exec=itens.filter(i=>i.status==='EXECUTADA').length,par=itens.filter(i=>String(i.status||'').includes('PARCIAL')).length,media=total?itens.reduce((s,i)=>s+mtNum(i.percentual),0)/total:0,docs=itens.flatMap(i=>p.evidMap[String(i.id)]||[]),aVal=itens.filter(i=>mtAnaliseValida(p.analiseMap[String(i.id)])).length;box.innerHTML=`<article class="relatorio-oficial-v2">${mtCab()}<div class="rel-faixa-v2">RESUMO EXECUTIVO DO MONITORAMENTO</div><div class="rel-kpis-v2"><div><span>Subitens</span><b>${total}</b></div><div><span>Média declarada</span><b>${media.toFixed(1)}%</b></div><div><span>Declarados em 100%</span><b>${exec}</b></div><div><span>Parciais</span><b>${par}</b></div><div><span>Evidências validadas</span><b>${docs.filter(e=>e.status_validacao==='VALIDADA').length}/${docs.length}</b></div><div><span>Análises validadas</span><b>${aVal}/${total}</b></div></div><p>Este resumo apresenta o estado atual dos TAGs selecionados e preserva a separação metodológica entre a execução informada pelo jurisdicionado e a validação técnica das evidências.</p><div class="rel-nota-v2">Resumo automático para apoio gerencial. A conclusão processual deve observar as análises técnicas validadas.</div></article>`;mtStatusRelatorio(p)}catch(e){console.error(e)}}
window.gerarResumoExecutivo=gerarResumoExecutivo
window.gerarResumoIA=gerarResumoExecutivo

/*=========================================================
013 QUADRO / FICHA DE EVIDÊNCIAS
=========================================================*/
async function gerarQuadroEvidenciasOficial(itemId=null){
const box=document.getElementById('previewRelatorio');if(!box)return
try{const p=await mtPacote(itemId);box.innerHTML=`<article class="relatorio-oficial-v2">${mtCab()}<div class="rel-faixa-v2">${itemId?'FICHA DE ANÁLISE DO SUBITEM':'QUADRO DE ANÁLISE DAS EVIDÊNCIAS'}</div>${p.itens.map(i=>mtFicha(i,p)).join('')||'<p class="rel-pendente-v2">Nenhum item localizado.</p>'}</article>`;if(typeof abrirTela==='function')abrirTela('relatorios');mtStatusRelatorio(p)}catch(e){console.error(e)}}
window.gerarQuadroEvidenciasOficial=gerarQuadroEvidenciasOficial
window.gerarQuadroAnaliseItens=gerarQuadroEvidenciasOficial

/*=========================================================
014 BIBLIOTECAS DE EXPORTAÇÃO
=========================================================*/
function mtLoadScript(src,chave){
if(window.MT_LIBS[chave])return window.MT_LIBS[chave]
window.MT_LIBS[chave]=new Promise((resolve,reject)=>{const existente=[...document.scripts].find(s=>s.src===src);if(existente){if((chave==='docx'&&window.htmlDocx)||(chave==='pdf'&&window.html2pdf))return resolve();existente.addEventListener('load',resolve,{once:true});existente.addEventListener('error',reject,{once:true});return}const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})
return window.MT_LIBS[chave]
}
async function mtGarantirLibs(){await Promise.all([mtLoadScript('https://cdnjs.cloudflare.com/ajax/libs/html-docx-js/0.3.1/html-docx.js','docx'),mtLoadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js','pdf')])}
async function mtGarantirRelatorio(){const box=document.getElementById('previewRelatorio');if(!box?.querySelector('.relatorio-oficial-v2'))await gerarRelatorioCompleto()}

/*=========================================================
015 EXPORTAÇÃO WORD REAL (.DOCX)
=========================================================*/
async function exportarWordMonitoramento(){
await mtGarantirRelatorio();try{await mtGarantirLibs()}catch(e){console.error(e);alert('Não foi possível carregar o componente Word. Verifique a conexão.');return}
if(!window.htmlDocx?.asBlob){alert('Componente Word indisponível.');return}
const conteudo=document.getElementById('previewRelatorio')?.innerHTML||''
const css=`<style>@page{size:A4;margin:1.7cm}body{font-family:Arial,sans-serif;font-size:10.5pt;color:#111;line-height:1.45}.mt-report-status{display:none}.rel-institucional-v2{text-align:center;border-bottom:1px solid #111;padding-bottom:8px;margin-bottom:20px}.rel-institucional-v2 .orgao{font-weight:bold}.rel-capa-v2{text-align:center;page-break-after:always;padding-top:150px}.rel-capa-v2 .faixa,.rel-faixa-v2,h2{background:#f8eec8;padding:6px;font-weight:bold}.rel-capa-v2 .data{margin-top:180px;font-weight:bold}.rel-meta-v2,.rel-quadro-v2,.rel-table-list-v2{width:100%;border-collapse:collapse;margin:10px 0}.rel-meta-v2 th,.rel-meta-v2 td,.rel-quadro-v2 th,.rel-quadro-v2 td,.rel-table-list-v2 th,.rel-table-list-v2 td{border:1px solid #999;padding:6px;vertical-align:top}.rel-meta-v2 th{width:30%;background:#d1d5db}.rel-quadro-v2 th,.rel-table-list-v2 th{background:#dbe4f0}.rel-quadro-v2 .rotulo{background:#e5e7eb;font-weight:bold}.rel-subtitle-v2{text-align:center;font-weight:bold;margin:10px 0 6px}.rel-ficha-v2{page-break-inside:avoid;margin:14px 0 20px}.rel-ficha-title-v2{background:#f8eec8;border:1px solid #999;padding:6px;font-weight:bold}.rel-tech-box-v2{border:1px solid #bbb;padding:8px}.rel-situacao-v2{width:100%;display:table;border:1px solid #999}.rel-situacao-v2>div{display:table-cell;width:50%;padding:7px;font-weight:bold}.rel-ok{background:#d9ead3}.rel-parcial{background:#fff2cc}.rel-nao{background:#f4cccc}.rel-andamento{background:#cfe2f3}.rel-kpis-v2{display:table;width:100%;margin:10px 0}.rel-kpis-v2>div{display:table-cell;border:1px solid #bbb;padding:7px;text-align:center}.rel-kpis-v2 span{display:block;font-size:8pt}.rel-nota-v2{border-left:4px solid #d97706;background:#fff7ed;padding:8px;margin-top:15px}.rel-pendente-v2{font-style:italic;color:#555}</style>`
const blob=window.htmlDocx.asBlob(`<!doctype html><html><head><meta charset="utf-8">${css}</head><body>${conteudo}</body></html>`,{orientation:'portrait',margins:{top:900,right:850,bottom:900,left:850}})
const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`RELATORIO_MONITORAMENTO_TAGS_${mtOrigemAtual()}_${new Date().toISOString().slice(0,10)}.docx`;document.body.appendChild(a);a.click();const u=a.href;a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500)
}
window.exportarWordMonitoramento=exportarWordMonitoramento
window.gerarPlanoMonitoramentoWord=async()=>{await gerarRelatorioCompleto();await exportarWordMonitoramento()}

/*=========================================================
016 EXPORTAÇÃO PDF A4
=========================================================*/
async function gerarPDFMonitoramento(){
await mtGarantirRelatorio();try{await mtGarantirLibs()}catch(e){console.error(e);alert('Não foi possível carregar o gerador PDF. Use Imprimir > Salvar como PDF.');return}
const elemento=document.getElementById('previewRelatorio');if(!window.html2pdf||!elemento)return
await window.html2pdf().set({margin:[7,7,9,7],filename:`RELATORIO_MONITORAMENTO_TAGS_${mtOrigemAtual()}_${new Date().toISOString().slice(0,10)}.pdf`,image:{type:'jpeg',quality:.98},html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff'},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:['css','legacy'],avoid:['.rel-ficha-v2']}}).from(elemento).save()
}
window.gerarPDFMonitoramento=gerarPDFMonitoramento

/*=========================================================
017 STATUS DE PRONTIDÃO DO RELATÓRIO
=========================================================*/
async function mtStatusRelatorio(pacote=null){
const tela=document.getElementById('tela-relatorios'),preview=document.getElementById('previewRelatorio');if(!tela||!preview)return
let p=pacote;try{if(!p)p=await mtPacote()}catch(e){return}
const total=p.itens.length,comE=p.itens.filter(i=>String(i.evidencia||'').trim()||(p.evidMap[String(i.id)]||[]).length).length,valA=p.itens.filter(i=>mtAnaliseValida(p.analiseMap[String(i.id)])).length,ultima=window.SYNC_ULTIMA_EXECUCAO?new Date(window.SYNC_ULTIMA_EXECUCAO).toLocaleString('pt-BR'):'aguardando sincronização'
let status=tela.querySelector('.mt-report-status');if(!status){status=document.createElement('div');status.className='mt-report-status';preview.parentNode.insertBefore(status,preview)}status.innerHTML=`<span><strong>Prontidão:</strong> evidências ${comE}/${total} • análises validadas ${valA}/${total}</span><span><strong>Fonte:</strong> TAGs SEDAM/SEPAT • última integração: ${mtEsc(ultima)}</span>`
}

/*=========================================================
018 UI ENXUTA — PAINÉIS ESSENCIAIS E RELATÓRIOS
=========================================================*/
function mtConfigurarUI(){
if(!document.getElementById('monitoramentoV2CSS')){const l=document.createElement('link');l.id='monitoramentoV2CSS';l.rel='stylesheet';l.href='monitoramento-v2.css?v=20260909-1';document.head.appendChild(l)}
const nav=document.getElementById('navMonitoramento');if(nav){
const ordem=['dashboard','monitoramentos','evidencias','analises','relatorios','matriz','resultados','historico'],ocultar=['auditoria','riscos','workflow','executivo','central','beneficios']
const botoes=[...nav.querySelectorAll('.nav-btn')];ocultar.forEach(n=>botoes.filter(b=>b.getAttribute('onclick')===`abrirTela('${n}')`).forEach(b=>b.style.display='none'));ordem.forEach(n=>{const b=botoes.find(x=>x.getAttribute('onclick')===`abrirTela('${n}')`);if(b)nav.appendChild(b)})
}
const acoes=document.querySelector('#tela-relatorios .relatorio-actions');if(acoes)acoes.innerHTML=`<button class="btn-padrao" onclick="sincronizarTAGsMonitoramento()">🔄 Atualizar TAGs</button><button class="btn-padrao verde" onclick="gerarRelatorioCompleto()">📑 Relatório Completo</button><button class="btn-padrao azul" onclick="gerarResumoExecutivo()">🧠 Resumo Executivo</button><button class="btn-padrao azul" onclick="gerarQuadroEvidenciasOficial()">📎 Quadro de Evidências</button><button class="btn-padrao verde" onclick="exportarWordMonitoramento()">📝 Exportar Word</button><button class="btn-padrao vermelho" onclick="gerarPDFMonitoramento()">📄 Exportar PDF</button>`
mtCriarModalEvidencia();mtStatusRelatorio()
}

/*=========================================================
019 AUTO RECONCILIAÇÃO / INICIALIZAÇÃO
=========================================================*/
document.addEventListener('DOMContentLoaded',()=>{
setTimeout(async()=>{mtConfigurarUI();if(window.MONITORAMENTO_ATUAL)await sincronizarTAGsMonitoramento({silencioso:true})},650)
})
