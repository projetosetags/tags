/*=========================================================
000 MONITORAMENTO CLIENT
=========================================================*/
const client = window.clientPublic
console.log('CLIENT:', client)
console.log('CLIENTPUBLIC:', window.clientPublic)

let MONITORAMENTO_ATUAL=null
let USER_MONITORAMENTO=null
let ORIGEM_ATUAL='TODAS'
/*=========================================================
001 MONITORAMENTO CORE FUNCTION ABRIRTELA
=========================================================*/
function abrirTela(nome){
localStorage.setItem(
'tela_monitoramento',
nome
)
if(typeof USER_MONITORAMENTO==='undefined'||!USER_MONITORAMENTO){
return
}
document.querySelectorAll('.tela-monitoramento').forEach(t=>{
t.classList.add('hidden')
t.style.display='none'
})
let tela=document.getElementById('tela-'+nome)
if(tela){
tela.classList.remove('hidden')
tela.style.display='block'
}
document.querySelectorAll('.nav-btn').forEach(b=>{
b.classList.remove('nav-active')
})
document.querySelectorAll('.nav-btn').forEach(b=>{
if(b.getAttribute('onclick')===`abrirTela('${nome}')`){
b.classList.add('nav-active')
}
})
let painelDashboard=document.getElementById('painelDashboardTopo')
if(painelDashboard){
painelDashboard.style.display=(nome==='dashboard')?'block':'none'
}
requestAnimationFrame(async()=>{
try{
if(nome==='dashboard'){
if(typeof carregarDashboard==='function'){
carregarDashboard()
}
if(typeof carregarAlertasTecnicos==='function'){
carregarAlertasTecnicos()
}
}
if(nome==='monitoramentos'){
if(typeof carregarListaMonitoramentos==='function'){
carregarListaMonitoramentos()
}
}
if(nome==='matriz'){
if(typeof carregarItensMatriz==='function'){
carregarItensMatriz()
}
}
if(nome==='evidencias'){
if(typeof carregarEvidencias==='function'){
carregarEvidencias()
}
}
if(nome==='analises'){
if(typeof carregarAnalises==='function'){
carregarAnalises()
}
}
if(nome==='resultados'){
if(typeof carregarResultados==='function'){
carregarResultados()
}
}
if(nome==='auditoria'){
if(typeof carregarAuditoriaCompleta==='function'){
carregarAuditoriaCompleta()
}
}
if(nome==='historico'){

if(typeof popularSelectHistorico==='function'){
await popularSelectHistorico()
}

if(typeof carregarHistorico==='function'){
carregarHistorico()
}

}
if(nome==='riscos'){
if(typeof carregarPainelRiscos==='function'){
carregarPainelRiscos()
}
}
if(nome==='workflow'){
if(typeof carregarWorkflow==='function'){
carregarWorkflow()
}
}
if(nome==='executivo'){
if(typeof carregarPainelExecutivo==='function'){
carregarPainelExecutivo()
}
}
if(nome==='central'){
if(typeof carregarCentralEvidencias==='function'){
carregarCentralEvidencias()
}
}
if(nome==='beneficios'){
if(typeof carregarPainelBeneficios==='function'){
carregarPainelBeneficios()
}
}
}catch(e){
console.log(e)
}
})
/*=========================================================
047 MONITORAMENTO-CORE.JS FUNCTION ABRIRTELA
=========================================================*/
if(tela==='evidencias'){
/*=========================================================
101 MONITORAMENTO-CORE.JS INIT EVIDENCIAS
=========================================================*/
document.addEventListener('DOMContentLoaded',()=>{

if(typeof renderPainelEvidencias==='function'){
renderPainelEvidencias()
}

})
}
}

async function carregarUsuarioMonitoramento(){
let userLocal=localStorage.getItem('user_monitoramento')
if(!userLocal){
let box=document.getElementById('usuarioCabecalho')
if(box){
box.innerHTML='NÃO IDENTIFICADO'
}
return
}
try{
let perfil=JSON.parse(userLocal)
USER_MONITORAMENTO={
id:perfil.id||null,
nome:perfil.nome_completo||perfil.nome||'USUÁRIO',
username:perfil.username||'',
nivel:Number(perfil.nivel_acesso||4),
origem:perfil.origem||'TCERO'
}
let box=document.getElementById('usuarioCabecalho')
if(box){

let nome=
USER_MONITORAMENTO.nome||
USER_MONITORAMENTO.username||
'USUÁRIO'

nome=String(nome).trim()

let partes=nome.split(' ')

if(partes.length>=3){

nome=
partes[0]+
' '+
partes[1]+
' '+
partes[2].charAt(0)+'.'

}

box.innerHTML=
nome+
' • N'+
USER_MONITORAMENTO.nivel

}
await aplicarPermissoesMonitoramento()
}catch(e){
console.log(e)
let box=document.getElementById('usuarioCabecalho')
if(box){
box.innerHTML='NÃO IDENTIFICADO'
}
}
}
async function aplicarPermissoesMonitoramento(){
if(!USER_MONITORAMENTO){
return
}
let nivel=Number(USER_MONITORAMENTO.nivel||4)
let botoesAdmin=[...document.querySelectorAll('.admin-only')]
if(nivel>2){
botoesAdmin.forEach(b=>{
b.style.display='none'
})
}
if((USER_MONITORAMENTO.username||'').toLowerCase()==='manoel'){
botoesAdmin.forEach(b=>{
b.style.display='flex'
})
}
}
document.addEventListener('DOMContentLoaded',async()=>{
await carregarUsuarioMonitoramento()
let monitoramentoSalvo=localStorage.getItem('monitoramentoAtual')
if(monitoramentoSalvo){
MONITORAMENTO_ATUAL=Number(monitoramentoSalvo)
}
if(USER_MONITORAMENTO){
await carregarDashboard()
let telaSalva=
localStorage.getItem(
'tela_monitoramento'
)

if(
telaSalva&&
typeof abrirTela==='function'
){
abrirTela(telaSalva)
}
}
if(typeof atualizarMonitoramentoAutomatico==='function'){
await atualizarMonitoramentoAutomatico()
window.MONITORAMENTO_SYNC_ATIVO=false
setInterval(async()=>{
if(window.MONITORAMENTO_SYNC_ATIVO){
return
}
window.MONITORAMENTO_SYNC_ATIVO=true
try{
await atualizarMonitoramentoAutomatico()
}catch(e){
console.log(e)
}
window.MONITORAMENTO_SYNC_ATIVO=false
},300000)
}
})
window.addEventListener('error',e=>{
console.log('ERRO GLOBAL:',e.error)
})
window.addEventListener('unhandledrejection',e=>{
console.log('PROMISE ERROR:',e.reason)
})
async function carregarMonitoramentoAtual(){
if(!MONITORAMENTO_ATUAL){
return null
}
let resposta=await window.client.from('monitoramentos').select('*').eq('id',MONITORAMENTO_ATUAL).single()
console.log('RESPOSTA COMPLETA MONITORAMENTO')
console.log(resposta)
let data=resposta.data
let error=resposta.error
if(error){
console.log('ERRO REAL SUPABASE:')
console.log(error)
alert(JSON.stringify(error,null,2))
return null
}
return data
}
function ordenarItensMonitoramento(lista){
return(lista||[]).sort((a,b)=>{
let ia=String(a.item||'0.0').split('.').map(v=>parseInt(v)||0)
let ib=String(b.item||'0.0').split('.').map(v=>parseInt(v)||0)
for(let i=0;i<Math.max(ia.length,ib.length);i++){
let va=ia[i]||0
let vb=ib[i]||0
if(va!==vb){
return va-vb
}
}
let sa=String(a.subitem||'0.0').split('.').map(v=>parseInt(v)||0)
let sb=String(b.subitem||'0.0').split('.').map(v=>parseInt(v)||0)
for(let i=0;i<Math.max(sa.length,sb.length);i++){
let va=sa[i]||0
let vb=sb[i]||0
if(va!==vb){
return va-vb
}
}
return 0
})
}
function ordenarDataGlobal(data){
return ordenarItensMonitoramento(data)
}
function aplicarFiltroOrigem(data){
if(!ORIGEM_ATUAL||ORIGEM_ATUAL==='TODAS'){
return data||[]
}
return(data||[]).filter(i=>
String(i.origem||'').toUpperCase()===
String(ORIGEM_ATUAL||'').toUpperCase()
)
}
/*=========================================================001 MONITORAMENTO CORE LOGIN=========================================================*/
async function loginMonitoramento(){
let usuario=document.getElementById('usuario').value.trim().toLowerCase()
let senha=document.getElementById('senha').value.trim()
if(!usuario||!senha){
alert('Informe usuário e senha')
return
}
let{data,error}=await client.from('perfistce').select('*').eq('username',usuario).eq('senha',senha).limit(1)
if(error){
console.log(error)
alert('Erro no login')
return
}
if(!data||data.length===0){
alert('Usuário inválido')
return
}
let perfil=data[0]
let permitidos=['manoel','jane']
if(!permitidos.includes(String(perfil.username||'').toLowerCase())){
alert('Sem permissão para o Monitoramento Técnico')
return
}
window.USER_MONITORAMENTO=perfil
atualizarUsuarioTopo()
localStorage.setItem('user_monitoramento',JSON.stringify(perfil))
let boxUsuario=document.getElementById('usuarioCabecalho')
if(boxUsuario){
atualizarUsuarioTopo()
}
let login=document.getElementById('loginMonitoramento')
if(login){
login.style.display='none'
}
let app=document.getElementById('appMonitoramento')
if(app){
app.style.display='block'
}
await carregarDashboard()
await carregarUsuarioMonitoramento()
setTimeout(()=>{
if(typeof carregarGraficoStatus==='function'){
carregarDashboard()
}
},120)
}
/*=========================================================002 MONITORAMENTO CORE AUTOLOGIN=========================================================*/
document.addEventListener('DOMContentLoaded',async()=>{
let salvo=localStorage.getItem('user_monitoramento')
let login=document.getElementById('loginMonitoramento')
let app=document.getElementById('appMonitoramento')
if(!salvo){
if(login){
login.style.display='flex'
}
if(app){
app.style.display='none'
}
return
}
try{
window.USER_MONITORAMENTO=JSON.parse(salvo)
}catch(e){
console.log(e)
localStorage.removeItem('user_monitoramento')
if(login){
login.style.display='flex'
}
if(app){
app.style.display='none'
}
return
}
if(!USER_MONITORAMENTO){
localStorage.removeItem('user_monitoramento')
if(login){
login.style.display='flex'
}
if(app){
app.style.display='none'
}
return
}
let boxUsuario=document.getElementById('usuarioCabecalho')
if(boxUsuario){
atualizarUsuarioTopo()
}
if(login){
login.style.display='none'
}
if(app){
app.style.display='block'
}
await carregarDashboard()
})
/*=========================================================003 MONITORAMENTO CORE LOGOUT=========================================================*/
function logoutMonitoramento(){
localStorage.removeItem('user_monitoramento')
location.reload()
}
/*=========================================================
099 MONITORAMENTO-CORE.JS TOPO COLAPSAVEL
=========================================================*/
function toggleTopoMonitoramento(){
let topo=document.getElementById(
'topoMonitoramento'
)
if(!topo){
return
}
topo.classList.toggle('recolhido')
}

/*=========================================================
007 MONITORAMENTO-CORE.JS USUÁRIO LGPD TOPO
=========================================================*/
function formatarNomeLGPD(nome){
if(!nome){
return'USUÁRIO'
}
let partes=String(nome).trim().split(' ')
if(partes.length===1){
return partes[0]
}
if(partes.length===2){
return partes[0]+' '+partes[1].charAt(0)+'.'
}
let primeiro=partes[0]
let meio=partes[1].charAt(0)+'.'
let ultimo=partes[partes.length-1]
return primeiro+' '+meio+' '+ultimo
}

function atualizarUsuarioTopo(){
let el=document.getElementById('usuarioCabecalho')
if(!el){
return
}
let nome=
USER_MONITORAMENTO?.nome_completo||
USER_MONITORAMENTO?.nome||
USER_MONITORAMENTO?.username||
'USUÁRIO'
nome=formatarNomeLGPD(nome)
el.innerHTML=nome
el.innerText=nome
el.textContent=nome
}
/*=========================================================
100 MONITORAMENTO-CORE.JS COLAPSAR GRAFICOS
=========================================================*/
function toggleGraficosDashboard(){

let painel=document.getElementById(
'painelGraficosDashboard'
)

if(!painel){
return
}

painel.classList.toggle(
'graficos-recolhidos'
)

}

if(typeof renderPainelEvidencias==='function'){
renderPainelEvidencias()
}
