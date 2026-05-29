/*=========================================================
001 MONITORAMENTO-INTEGRACAO.JS VARIÁVEIS GLOBAIS
=========================================================*/
window.SYNC_EM_EXECUCAO=false

/*=========================================================
002 MONITORAMENTO-INTEGRACAO.JS SINCRONIZAR TAGS
=========================================================*/
async function sincronizarTAGSedam(){

if(!MONITORAMENTO_ATUAL){
alert('Selecione um monitoramento')
return
}

let monitoramento=await carregarMonitoramentoAtual()

if(!monitoramento){
alert('Monitoramento não encontrado')
return
}

let origem=(monitoramento.origem||'SEDAM')
.toUpperCase()
.trim()

let query=client
.from('vw_monitoramento_integrado')
.select('*')
.order('item',{ascending:true})

if(origem&&origem!=='TODAS'){
query=query.eq('origem',origem)
}

let{data,error}=await query

if(error){
console.log(error)
alert('Erro ao sincronizar integração')
return
}

data=ordenarDataGlobal(data||[])

let inseridos=0
let atualizados=0

for(let d of(data||[])){

let percentual=Number(d.percentual||0)

let criticidade='BAIXA'

if(percentual<40){
criticidade='ALTA'
}else if(percentual<80){
criticidade='MÉDIA'
}

let status='EM ANDAMENTO'

if(percentual>=100){
status='EXECUTADA'
}else if(percentual===0){
status='NÃO EXECUTADA'
}else if(percentual>0&&percentual<100){
status='PARCIALMENTE EXECUTADA'
}

let payload={
monitoramento_id:MONITORAMENTO_ATUAL,
deliberacao_id:d.id||null,
origem:(d.origem||origem||'SEDAM').toUpperCase(),
item:d.item||'-',
subitem:d.subitem||'-',
descricao:d.descricao||'-',
status:status,
criticidade:criticidade,
percentual:percentual,
achado:d.descricao||'-',
causa:'Acompanhar execução',
efeito:'Risco institucional',
deliberacao:d.descricao||'-',
acao_gestor:d.produto||'-',
produto_esperado:d.produto||'-',
beneficio_esperado:d.beneficio_esperado||'Fortalecimento institucional',
responsavel:d.responsavel||'-',
prazo:d.prazo_texto||null,
sincronizado_em:new Date().toISOString()
}

let{data:existe,error:erroExiste}=await client
.from('monitoramento_itens')
.select('id')
.eq('deliberacao_id',d.id)
.limit(1)

if(erroExiste){
console.log(erroExiste)
continue
}

if(existe&&existe.length>0){

let{error:updateError}=await client
.from('monitoramento_itens')
.update(payload)
.eq('id',existe[0].id)

if(updateError){
console.log(updateError)
}else{
atualizados++
}

}else{

let{error:insertError}=await client
.from('monitoramento_itens')
.insert([payload])

if(insertError){
console.log(insertError)
}else{
inseridos++
}

}

}

await registrarLog(
'SINCRONIZAÇÃO TAG '+origem,
'monitoramento_itens',
MONITORAMENTO_ATUAL
)

if(typeof carregarItensMatriz==='function'){
await carregarItensMatriz()
}

if(typeof carregarDashboard==='function'){
await carregarDashboard()
}

if(typeof carregarPainelExecutivo==='function'){
await carregarPainelExecutivo()
}

if(typeof carregarPainelRiscos==='function'){
await carregarPainelRiscos()
}

if(typeof carregarHistorico==='function'){
await carregarHistorico()
}

if(typeof carregarPainelBeneficios==='function'){
await carregarPainelBeneficios()
}

alert(
origem+
': '+
inseridos+
' inseridos e '+
atualizados+
' atualizados'
)

}

/*=========================================================
003 MONITORAMENTO-INTEGRACAO.JS AUTO SINCRONIZAÇÃO
=========================================================*/
async function atualizarMonitoramentoAutomatico(){

if(window.SYNC_EM_EXECUCAO){
return
}

window.SYNC_EM_EXECUCAO=true

try{

let monitoramento=await carregarMonitoramentoAtual()

if(!monitoramento){
window.SYNC_EM_EXECUCAO=false
return
}

let origem=(monitoramento.origem||'')
.toUpperCase()
.trim()

let query=client
.from('vw_monitoramento_integrado')
.select('*')

if(origem&&origem!=='TODAS'){
query=query.eq('origem',origem)
}

let{data,error}=await query

if(error){
console.log(error)
window.SYNC_EM_EXECUCAO=false
return
}

data=ordenarDataGlobal(data||[])

let inseridos=0
let atualizados=0

for(let d of(data||[])){

let percentual=Number(d.percentual||0)

let criticidade='BAIXA'

if(percentual<40){
criticidade='ALTA'
}else if(percentual<80){
criticidade='MÉDIA'
}

let status='EM ANDAMENTO'

if(percentual>=100){
status='EXECUTADA'
}else if(percentual===0){
status='NÃO EXECUTADA'
}else if(percentual>0&&percentual<100){
status='PARCIALMENTE EXECUTADA'
}

let payload={
monitoramento_id:MONITORAMENTO_ATUAL,
deliberacao_id:d.id||null,
origem:(d.origem||origem||'SEDAM').toUpperCase(),
item:d.item||'-',
subitem:d.subitem||'-',
descricao:d.descricao||'-',
status:status,
criticidade:criticidade,
percentual:percentual,
achado:d.descricao||'-',
causa:'Acompanhar execução',
efeito:'Risco institucional',
deliberacao:d.descricao||'-',
acao_gestor:d.produto||'-',
produto_esperado:d.produto||'-',
beneficio_esperado:d.beneficio_esperado||'Fortalecimento institucional',
responsavel:d.responsavel||'-',
prazo:d.prazo_texto||null,
sincronizado_em:new Date().toISOString()
}

let{data:existe,error:erroExiste}=await client
.from('monitoramento_itens')
.select('id')
.eq('deliberacao_id',d.id)
.limit(1)

if(erroExiste){
console.log(erroExiste)
continue
}

if(existe&&existe.length){

let{error:updateError}=await client
.from('monitoramento_itens')
.update(payload)
.eq('id',existe[0].id)

if(updateError){
console.log(updateError)
}else{
atualizados++
}

}else{

let{error:insertError}=await client
.from('monitoramento_itens')
.insert([payload])

if(insertError){
console.log(insertError)
}else{
inseridos++
}

}

}

await registrarLog(
'SINCRONIZAÇÃO AUTOMÁTICA',
'monitoramento_itens',
MONITORAMENTO_ATUAL
)

if(typeof carregarItensMatriz==='function'){
await carregarItensMatriz()
}

if(typeof carregarDashboard==='function'){
await carregarDashboard()
}

if(typeof carregarPainelExecutivo==='function'){
await carregarPainelExecutivo()
}

if(typeof carregarPainelRiscos==='function'){
await carregarPainelRiscos()
}

if(typeof carregarHistorico==='function'){
await carregarHistorico()
}

if(typeof carregarPainelBeneficios==='function'){
await carregarPainelBeneficios()
}

console.log('SINCRONIZAÇÃO OK',{
inseridos:inseridos,
atualizados:atualizados
})

}catch(e){

console.log(e)

}

window.SYNC_EM_EXECUCAO=false

}

/*=========================================================
004 MONITORAMENTO-INTEGRACAO.JS FILTRO ORIGEM
=========================================================*/
function filtrarOrigemMonitoramento(){

ORIGEM_ATUAL=
document.getElementById('filtroOrigem')
.value||''

if(typeof carregarListaMonitoramentos==='function'){
carregarListaMonitoramentos()
}

if(typeof carregarDashboard==='function'){
carregarDashboard()
}

if(typeof carregarItensMatriz==='function'){
carregarItensMatriz()
}

}

/*=========================================================
005 MONITORAMENTO-INTEGRACAO.JS AUTO START
=========================================================*/
document.addEventListener('DOMContentLoaded',async()=>{

try{

if(typeof atualizarMonitoramentoAutomatico==='function'){
await atualizarMonitoramentoAutomatico()
}

}catch(e){

console.log(e)

}

})
