/*=========================================================
001 MONITORAMENTO-INTEGRACAO.JS ESTADO
=========================================================*/
window.SYNC_EM_EXECUCAO=false
window.SYNC_ULTIMA_EXECUCAO=null

/*=========================================================
002 MONITORAMENTO-INTEGRACAO.JS STATUS E CRITICIDADE
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
003 MONITORAMENTO-INTEGRACAO.JS SINCRONIZAÇÃO DE SEGURANÇA
OBS.: o banco também possui gatilhos SEDAM/SEPAT. Esta função
faz reconciliação ao abrir o painel e após pedido manual.
=========================================================*/
async function sincronizarTAGsMonitoramento(opcoes={}){
if(window.SYNC_EM_EXECUCAO)return{inseridos:0,atualizados:0}
window.SYNC_EM_EXECUCAO=true
const silencioso=opcoes.silencioso===true
try{
let origem=String(document.getElementById('filtroOrigem')?.value||'TODAS').toUpperCase().trim()
let monitoramento=null
if(window.MONITORAMENTO_ATUAL&&typeof carregarMonitoramentoAtual==='function'){
monitoramento=await carregarMonitoramentoAtual()
if(monitoramento?.origem)origem=String(monitoramento.origem).toUpperCase().trim()
}
let query=client.from('vw_monitoramento_integrado').select('*')
if(origem&&origem!=='TODAS')query=query.eq('origem',origem)
let{data,error}=await query
if(error)throw error
const fontes=data||[]
const idsMonitoramentos={}
let{data:mons,error:erroMons}=await client.from('monitoramentos').select('id,origem')
if(erroMons)throw erroMons
;(mons||[]).forEach(m=>{idsMonitoramentos[String(m.origem||'').toUpperCase()]=m.id})
let inseridos=0
let atualizados=0
for(const d of fontes){
const origemItem=String(d.origem||origem||'').toUpperCase()
const monitoramentoId=idsMonitoramentos[origemItem]||window.MONITORAMENTO_ATUAL||null
if(!monitoramentoId)continue
const percentual=Number(d.percentual||0)
const payload={
monitoramento_id:monitoramentoId,
deliberacao_id:d.id,
origem:origemItem,
item:d.item||'-',
subitem:d.subitem||'-',
descricao:d.descricao||'-',
deliberacao:d.achado||d.descricao_item||d.descricao||'-',
acao_gestor:d.acao||d.descricao||'-',
produto:d.produto||'-',
produto_esperado:d.produto||'-',
entrega_esperada:d.prazo_texto||'-',
responsavel:d.responsavel||'-',
percentual,
status:calcularStatusMonitoramento(percentual),
criticidade:calcularCriticidadeMonitoramento(percentual),
sincronizado_em:new Date().toISOString()
}
let{data:existe,error:erroExiste}=await client
.from('monitoramento_itens')
.select('id')
.eq('deliberacao_id',d.id)
.eq('origem',origemItem)
.limit(1)
if(erroExiste){console.error(erroExiste);continue}
if(existe?.length){
let{error:updateError}=await client.from('monitoramento_itens').update(payload).eq('id',existe[0].id)
if(updateError)console.error(updateError);else atualizados++
}else{
payload.achado=d.achado||d.descricao_item||d.descricao||'-'
let{error:insertError}=await client.from('monitoramento_itens').insert([payload])
if(insertError)console.error(insertError);else inseridos++
}
}
window.SYNC_ULTIMA_EXECUCAO=new Date().toISOString()
if(typeof registrarLog==='function'){
try{await registrarLog('RECONCILIAÇÃO AUTOMÁTICA TAGS','monitoramento_itens',window.MONITORAMENTO_ATUAL||0)}catch(e){console.warn(e)}
}
if(typeof carregarDashboard==='function')await carregarDashboard()
if(typeof carregarItensMatriz==='function')await carregarItensMatriz()
if(typeof renderPainelEvidencias==='function'&&document.getElementById('tela-evidencias')&&!document.getElementById('tela-evidencias').classList.contains('hidden'))await renderPainelEvidencias()
if(!silencioso)alert(`Sincronização concluída: ${inseridos} novo(s) e ${atualizados} atualizado(s).`)
return{inseridos,atualizados}
}catch(e){
console.error('Erro na sincronização TAGS:',e)
if(!silencioso)alert('Não foi possível concluir a sincronização. Consulte o console técnico.')
return{inseridos:0,atualizados:0,error:e}
}finally{
window.SYNC_EM_EXECUCAO=false
}
}

/*=========================================================
004 MONITORAMENTO-INTEGRACAO.JS COMPATIBILIDADE
=========================================================*/
window.sincronizarTAGsMonitoramento=sincronizarTAGsMonitoramento
window.sincronizarTAGSedam=sincronizarTAGsMonitoramento
window.atualizarMonitoramentoAutomatico=async()=>sincronizarTAGsMonitoramento({silencioso:true})

/*=========================================================
005 MONITORAMENTO-INTEGRACAO.JS FILTRO ORIGEM
=========================================================*/
function filtrarOrigemMonitoramento(){
window.ORIGEM_ATUAL=String(document.getElementById('filtroOrigem')?.value||'TODAS').toUpperCase()
if(typeof carregarListaMonitoramentos==='function')carregarListaMonitoramentos()
if(typeof carregarDashboard==='function')carregarDashboard()
if(typeof carregarItensMatriz==='function')carregarItensMatriz()
if(typeof renderPainelEvidencias==='function'&&document.getElementById('tela-evidencias')&&!document.getElementById('tela-evidencias').classList.contains('hidden'))renderPainelEvidencias()
}

/*=========================================================
006 MONITORAMENTO-INTEGRACAO.JS AUTO RECONCILIAÇÃO
=========================================================*/
document.addEventListener('DOMContentLoaded',()=>{
setTimeout(()=>{
if(window.MONITORAMENTO_ATUAL)sincronizarTAGsMonitoramento({silencioso:true})
},1200)
})

/*=========================================================
007 MONITORAMENTO-INTEGRACAO.JS DASHBOARD COERENTE
TOTAL E STATUS CONTAM A MESMA UNIDADE: SUBITENS.
=========================================================*/
async function carregarDashboard(){
try{
const origem=String(document.getElementById('filtroOrigem')?.value||'TODAS').toUpperCase()
let query=client.from('monitoramento_itens').select('*')
if(window.MONITORAMENTO_ATUAL)query=query.eq('monitoramento_id',Number(window.MONITORAMENTO_ATUAL))
if(origem!=='TODAS')query=query.eq('origem',origem)
let{data,error}=await query
if(error)throw error
data=typeof ordenarDataGlobal==='function'?ordenarDataGlobal(data||[]):(data||[])
const total=data.length
const executadas=data.filter(i=>i.status==='EXECUTADA').length
const parciais=data.filter(i=>String(i.status||'').includes('PARCIAL')).length
const naoExecutadas=data.filter(i=>String(i.status||'').includes('NÃO')).length
const andamento=data.filter(i=>i.status==='EM ANDAMENTO').length
const semEvidencia=data.filter(i=>!String(i.evidencia||'').trim()&&!(Array.isArray(i.evidencias_check)&&i.evidencias_check.length)&&!i.evidencia_upload).length
const evidCompleta=data.filter(i=>i.evidencia_status==='COMPLETA').length
const pctEvid=total?(evidCompleta/total)*100:0
const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v}
set('kpiTotal',total);set('kpiExecutadas',executadas);set('kpiParciais',parciais);set('kpiNaoExecutadas',naoExecutadas);set('kpiAndamento',andamento);set('kpiSemEvidencia',semEvidencia);set('kpiPercentualEvidencia',pctEvid.toFixed(1)+'%')
if(typeof carregarGraficoStatus==='function')await carregarGraficoStatus(executadas,parciais,naoExecutadas,andamento)
const alto=data.filter(i=>Number(i.percentual||0)<40).length
const medio=data.filter(i=>Number(i.percentual||0)>=40&&Number(i.percentual||0)<80).length
const baixo=data.filter(i=>Number(i.percentual||0)>=80).length
if(typeof carregarGraficoCriticidade==='function')await carregarGraficoCriticidade(alto,medio,baixo)
await carregarGraficoEvolucao()
await carregarGraficoBeneficios()
if(typeof carregarCardsDashboard==='function')await carregarCardsDashboard(data)
}catch(e){console.error('Dashboard:',e)}
}

/*=========================================================
008 MONITORAMENTO-INTEGRACAO.JS EVOLUÇÃO MENSAL REAL
=========================================================*/
async function carregarGraficoEvolucao(){
const ctx=document.getElementById('graficoEvolucao');if(!ctx)return
const origem=String(document.getElementById('filtroOrigem')?.value||'TODAS').toUpperCase()
let q=client.from('vw_monitoramento_integrado').select('origem,jan,fev,mar,abr,mai,jun,jul,ago,set,out,nov,dez')
if(origem!=='TODAS')q=q.eq('origem',origem)
const{data,error}=await q
if(error){console.error(error);return}
const campos=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const labels=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
const valores=campos.map(c=>{
const arr=(data||[]).map(r=>r[c]).filter(v=>v!==null&&v!==undefined&&v!=='').map(Number).filter(Number.isFinite)
return arr.length?Number((arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1)):null
})
if(window.graficoEvolucao&&typeof window.graficoEvolucao.destroy==='function')window.graficoEvolucao.destroy()
window.graficoEvolucao=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Execução média declarada no TAG',data:valores,fill:true,tension:.3,spanGaps:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#fff'}},datalabels:{color:'#fff',anchor:'end',align:'top',formatter:v=>v===null?'':v+'%'}},scales:{x:{ticks:{color:'#fff'},grid:{color:'rgba(255,255,255,.05)'}},y:{beginAtZero:true,max:100,ticks:{color:'#fff',callback:v=>v+'%'},grid:{color:'rgba(255,255,255,.05)'}}}},plugins:[ChartDataLabels]})
}

/*=========================================================
009 MONITORAMENTO-INTEGRACAO.JS BENEFÍCIOS REAIS
=========================================================*/
async function carregarGraficoBeneficios(){
const ctx=document.getElementById('graficoBeneficios');if(!ctx)return
let q=client.from('monitoramento_resultados').select('item_id,beneficio_financeiro,beneficio_operacional,beneficio_social,beneficio_ambiental,beneficio_governanca')
const{data,error}=await q
if(error){console.warn(error);return}
let permitidos=null
if(window.MONITORAMENTO_ATUAL){
const{data:itens}=await client.from('monitoramento_itens').select('id').eq('monitoramento_id',Number(window.MONITORAMENTO_ATUAL))
permitidos=new Set((itens||[]).map(i=>i.id))
}
const linhas=(data||[]).filter(r=>!permitidos||permitidos.has(r.item_id))
const soma=c=>linhas.reduce((s,r)=>s+Number(r[c]||0),0)
const valores=[soma('beneficio_financeiro'),soma('beneficio_operacional'),soma('beneficio_social'),soma('beneficio_ambiental'),soma('beneficio_governanca')]
if(window.graficoBeneficios&&typeof window.graficoBeneficios.destroy==='function')window.graficoBeneficios.destroy()
window.graficoBeneficios=new Chart(ctx,{type:'bar',data:{labels:['Financeiro','Operacional','Social','Ambiental','Governança'],datasets:[{label:'Benefícios registrados',data:valores}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#fff'}},datalabels:{color:'#fff',anchor:'end',align:'top',formatter:v=>v||''}},scales:{x:{ticks:{color:'#fff'},grid:{color:'rgba(255,255,255,.05)'}},y:{beginAtZero:true,ticks:{color:'#fff'},grid:{color:'rgba(255,255,255,.05)'}}}},plugins:[ChartDataLabels]})
}