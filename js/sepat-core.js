/*=========================================================
001 SEPAT CORE CONFIG
=========================================================*/
const SEPAT_SUPABASE_URL=window.S_URL||window.SUPABASE_URL||''
const SEPAT_SUPABASE_KEY=window.S_KEY||window.SUPABASE_ANON_KEY||''
const sepatClient=supabase.createClient(SEPAT_SUPABASE_URL,SEPAT_SUPABASE_KEY)
let sepatUser=null
let sepatData=[]
let sepatFiltrados=[]
let modoResumoSepat='item'
let modoTabelaSepat='subitem'
let modoConclusaoSepat='item'
let graficoLinhaSepat=null
let graficoPizzaSepat=null
let graficoBarrasSepat=null
let graficoMasterSepat=null
const MESES_SEPAT=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const MES_ATUAL_SEPAT=new Date().getMonth()
const MESES_LABEL_SEPAT=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
const NOTA_TECNICA_SEPAT='As informações constantes neste painel, gráficos, indicadores e relatórios possuem caráter preliminar e meramente informativo, sendo baseadas nos dados declarados e apresentados até o presente momento pelos jurisdicionados envolvidos. Ressalta-se que tais informações ainda não passaram pela análise técnica de consistência documental, verificação de evidências, validação metodológica e conferência conclusiva pela equipe técnica de auditores designados.'
/*=========================================================
008 FORMATAR DATA SEPAT
=========================================================*/
function formatarDataSepat(v){
if(!v)return'-'
let d=new Date(v)
if(isNaN(d))return v
let dia=String(d.getDate()).padStart(2,'0')
let mes=String(d.getMonth()+1).padStart(2,'0')
let ano=d.getFullYear()
return`${dia}-${mes}-${ano}`
}
/*=========================================================
008 MESES AUTOMATICOS SEPAT
=========================================================*/
function controlarMesesSepat(){
let mesAtual=new Date().getMonth()+1
let meses=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
meses.forEach((m,index)=>{
let numero=index+1
document.querySelectorAll('.mes-'+m).forEach(el=>{
if(numero<=mesAtual){
el.classList.remove('hidden')
el.style.display='table-cell'
}else{
el.classList.add('hidden')
el.style.display='none'
}
})
})
let lista=[...(sepatData||[])]
lista.forEach(async i=>{
for(let x=0;x<11;x++){
let atual=meses[x]
let prox=meses[x+1]
if(Number(i[atual]||0)>=100&&Number(i[prox]||0)<=0){
i[prox]=100
await sepatClient.from('sepat_deliberacoes').update({[prox]:100}).eq('id',i.id)
}
}
})
}
/*=========================================================
002 SEPAT CORE DOMCONTENTLOADED
=========================================================*/
document.addEventListener('DOMContentLoaded',async()=>{

try{

document.body.style.visibility='hidden'

let salvo=localStorage.getItem('sepatUser')

if(salvo){

try{

sepatUser=JSON.parse(salvo)

document.getElementById('login-sepat').classList.add('hidden')

document.getElementById('app-sepat').classList.remove('hidden')

document.getElementById('sepat-user-info').innerText=
(sepatUser.nome_completo||'-')+
' • '+
(sepatUser.cargo||'-')+
' • '+
(sepatUser.origem||'SEPAT')

aplicarPermissoesSepat()

await carregarSepatDados()

controlarMesesSepat()

let abaSalva=localStorage.getItem('sepat_tab')||'dashboard'
switchSepatTab(abaSalva)

}catch(e){

console.log(e)

localStorage.removeItem('sepatUser')

document.getElementById('login-sepat').classList.remove('hidden')

document.getElementById('app-sepat').classList.add('hidden')

}

}else{

document.getElementById('login-sepat').classList.remove('hidden')

document.getElementById('app-sepat').classList.add('hidden')

}

}catch(e){

console.log(e)

document.getElementById('login-sepat').classList.remove('hidden')

document.getElementById('app-sepat').classList.add('hidden')

}

document.body.style.visibility='visible'

})
/*=========================================================
003 SEPAT CORE LOGIN
=========================================================*/
async function loginSepat(){
let usuario=document.getElementById('sepat-user').value.trim().toLowerCase()
let senha=document.getElementById('sepat-pass').value.trim()

if(!usuario||!senha){
alert('Informe usuário e senha')
return
}

let perfil=null

let r1=await sepatClient
.from('sepat_perfis')
.select('*')
.eq('username',usuario)
.limit(1)

if(r1.data&&r1.data.length){
perfil=r1.data[0]
perfil.origem='SEPAT'
}

if(!perfil){

let r2=await sepatClient
.from('perfistce')
.select('*')
.eq('username',usuario)
.limit(1)

if(r2.data&&r2.data.length){
perfil=r2.data[0]
perfil.origem='TCERO'
}

}

if(!perfil){
alert('Usuário não encontrado')
return
}

if(String(perfil.senha||'')!==String(senha)){
alert('Senha inválida')
return
}

if(perfil.ativo===false){
alert('Usuário inativo')
return
}

sepatUser=perfil

localStorage.setItem('sepatUser',JSON.stringify(perfil))

document.getElementById('login-sepat').classList.add('hidden')

document.getElementById('app-sepat').classList.remove('hidden')

document.getElementById('sepat-user-info').innerText=
(perfil.nome_completo||'-')+
' • '+
(perfil.cargo||'-')+
' • '+
(perfil.origem||'SEPAT')

aplicarPermissoesSepat()

await carregarSepatDados()
controlarMesesSepat()
aplicarAcessoMonitoramentoSepat()
switchSepatTab('dashboard')

}
/*=========================================================
004 SEPAT CORE LOGOUT
=========================================================*/
function logoutSepat(){
localStorage.removeItem('sepatUser')
sepatUser=null
sepatData=[]
sepatFiltrados=[]
document.getElementById('app-sepat').classList.add('hidden')
document.getElementById('login-sepat').classList.remove('hidden')
}

/*=========================================================
006 SEPAT CORE PERMISSOES
=========================================================*/
function aplicarPermissoesSepat(){
let tabPerfis=document.getElementById('tab-perfis')
if(tabPerfis){
if(
sepatUser&&
Number(sepatUser.nivel_acesso||0)===1
){
tabPerfis.classList.remove('hidden')
}else{
tabPerfis.classList.add('hidden')
}
}
let tabPerfisTCERO=document.getElementById('tab-perfistce')
if(tabPerfisTCERO){
if(
sepatUser&&
Number(sepatUser.nivel_acesso||0)===1
){
tabPerfisTCERO.classList.remove('hidden')
}else{
tabPerfisTCERO.classList.add('hidden')
}
}
let adminsBackup=['manoel','vagner']

let btnBackup=document.getElementById('btnBackupSepat')

if(btnBackup){

if(
adminsBackup.includes(
String(sepatUser?.username||'')
.toLowerCase()
)
){
btnBackup.classList.remove('hidden')
}else{
btnBackup.classList.add('hidden')
}

}
}
/*=========================================================
007 SEPAT CORE SWITCHTAB
=========================================================*/
function switchSepatTab(t){

localStorage.setItem('sepat_tab',t)

document.querySelectorAll('.view-sepat').forEach(v=>{
v.classList.add('hidden')
})

document.querySelectorAll('.tab-sepat').forEach(b=>{
b.classList.remove('tab-active')
})

let view=document.getElementById('view-'+t)
let tab=document.getElementById('tab-'+t)

if(view)view.classList.remove('hidden')
if(tab)tab.classList.add('tab-active')

let mini=document.getElementById('miniKpisSepat')

if(mini){

if(t==='dashboard'){
mini.classList.add('hidden')
}else{
mini.classList.remove('hidden')
}

}

if(t==='dashboard'){
renderDashboardSepat()
controlarMesesSepat()
}

if(t==='resumo'){
renderResumoSepat()
controlarMesesSepat()
}

if(t==='monitoramento'){
renderTabelaSepat()
controlarMesesSepat()
}

if(t==='graficos'){
popularItensSepat()
popularSubitensSepat()
renderGraficoMasterSepat()
controlarMesesSepat()
}

if(t==='concluidos'){
renderConcluidosSepat()
controlarMesesSepat()
}

if(t==='perfis'){

if(
!sepatUser||
Number(sepatUser.nivel_acesso||0)!==1
){
switchSepatTab('dashboard')
return
}

carregarPerfisSepat()

}

if(t==='perfistce'){

if(
!sepatUser||
Number(sepatUser.nivel_acesso||0)!==1
){
switchSepatTab('dashboard')
return
}

carregarPerfisTCEROSepat()

}

}
/*=========================================================
008 SEPAT CORE HELPERS
=========================================================*/
function getTotalSepat(i){
let vals=MESES_SEPAT.slice(0,MES_ATUAL_SEPAT+1).map(m=>{
let v=Number(i[m]||0)
return isNaN(v)?0:v
})
let maior=Math.max(...vals,0)
let total=Number(i.total_cumprimento||0)
if(isNaN(total))total=0
return Math.max(maior,total)
}

function compareSepat(a,b){
let ga=grupoOrdemSepat(a.siglaitem)
let gb=grupoOrdemSepat(b.siglaitem)
if(ga!==gb)return ga-gb
let sa=String(a.siglaitem||'')
let sb=String(b.siglaitem||'')
let c=sa.localeCompare(sb,'pt-BR',{numeric:true,sensitivity:'base'})
if(c!==0)return c
let na=Number(a.numsubitem||0)
let nb=Number(b.numsubitem||0)
if(na!==nb)return na-nb
let pa=Number(a.numproduto||0)
let pb=Number(b.numproduto||0)
if(pa!==pb)return pa-pb
return String(a.produto||'').localeCompare(String(b.produto||''),'pt-BR',{numeric:true})
}

function grupoOrdemSepat(sigla){
sigla=String(sigla||'').toUpperCase()
if(sigla.startsWith('PI'))return 1
if(sigla.startsWith('IL'))return 2
if(sigla.startsWith('P')&&!sigla.startsWith('PI'))return 3
if(sigla.startsWith('GR'))return 4
return 9
}
function truncarSepat(txt,n){
txt=String(txt||'-').replace(/\s+/g,' ').trim()
return txt.length>n?txt.substring(0,n)+'...':txt
}
function corClasseSepat(v){
if(v>=100)return'verde'
if(v>0&&v<100)return'amarelo'
return'vermelho'
}
/*=========================================================
009 SEPAT CORE CARREGAR DADOS
=========================================================*/
async function carregarSepatDados(){
let {data,error}=await sepatClient.from('sepat_deliberacoes').select('*').order('siglaitem',{ascending:true})
if(error){
console.log(error)
alert('Erro ao carregar dados da SEPAT')
sepatData=[]
sepatFiltrados=[]
return
}
let meses=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
let mesAtual=new Date().getMonth()+1
sepatData=(data||[]).map(i=>{
let obj={
...i,
siglaitem:String(i.siglaitem||'').trim(),
item:String(i.item||'').trim(),
subitem:String(i.subitem||'').trim(),
produto:String(i.produto||'').trim(),
jan:Number(i.jan||0),
fev:Number(i.fev||0),
mar:Number(i.mar||0),
abr:Number(i.abr||0),
mai:Number(i.mai||0),
jun:Number(i.jun||0),
jul:Number(i.jul||0),
ago:Number(i.ago||0),
set:Number(i.set||0),
out:Number(i.out||0),
nov:Number(i.nov||0),
dez:Number(i.dez||0),
total_cumprimento:Number(i.total_cumprimento||0)
}
for(let x=1;x<mesAtual;x++){
let anterior=meses[x-1]
let atual=meses[x]
if(Number(obj[anterior]||0)>=100){
obj[atual]=100
}
}
return obj
}).sort(compareSepat)

sepatFiltrados=[...sepatData]

renderDashboardSepat()
controlarMesesSepat()

let miniItens=document.getElementById('miniItensSepat')
let miniSubitens=document.getElementById('miniSubitensSepat')
let miniProdutos=document.getElementById('miniProdutosSepat')

let ocultar100Resumo=document.getElementById('ocultar100ResumoSepat')?.checked||false
let ocultar100Tabela=document.getElementById('ocultar100Sepat')?.checked||false

let listaContagem=[...(sepatData||[])]

if(ocultar100Resumo||ocultar100Tabela){
listaContagem=listaContagem.filter(i=>getTotalSepat(i)<100)
}

let itens=[...new Set(
listaContagem
.map(i=>String(i.siglaitem||'').trim())
.filter(v=>v&&v!=='-')
)].length

let subitens=listaContagem.filter(i=>
String(i.subitem||'').trim()!==''
).length

let produtos=[...new Set(
listaContagem
.map(i=>String(i.produto||'').trim())
.filter(v=>v&&v!=='-')
)].length

if(miniItens)miniItens.innerText=itens||0
if(miniSubitens)miniSubitens.innerText=subitens||0
if(miniProdutos)miniProdutos.innerText=produtos||0
}
/*=========================================================
009A SEPAT CORE MINI KPIS
=========================================================*/
function atualizarMiniKPIsSepat(){

let ocultar100Resumo=document.getElementById('ocultar100ResumoSepat')?.checked||false
let ocultar100Tabela=document.getElementById('ocultar100Sepat')?.checked||false

let lista=[...(sepatData||[])]

if(ocultar100Resumo||ocultar100Tabela){
lista=lista.filter(i=>getTotalSepat(i)<100)
}

let itens=[...new Set(
lista.map(i=>String(i.siglaitem||'').trim()).filter(Boolean)
)].length

let subitens=lista.length

let produtos=[...new Set(
lista.map(i=>String(i.produto||'').trim()).filter(Boolean)
)].length

let miniItens=document.getElementById('miniItensSepat')
let miniSubitens=document.getElementById('miniSubitensSepat')
let miniProdutos=document.getElementById('miniProdutosSepat')

if(miniItens)miniItens.innerText=itens
if(miniSubitens)miniSubitens.innerText=subitens
if(miniProdutos)miniProdutos.innerText=produtos

}
/*=========================================================
010 SEPAT CORE RENDER DASHBOARD
=========================================================*/
function renderDashboardSepat(){

let lista=[...(sepatData||[])].sort(compareSepat)

let totalItens=[...new Set(lista.map(i=>String(i.siglaitem||'').trim()).filter(Boolean))].length

let totalSubitens=lista.length

let totalProdutos=[...new Set(lista.map(i=>String(i.produto||'').trim()).filter(Boolean))].length

let media=calcularMediaSepat(lista)

let kpiItens=document.getElementById('kpiItensSepat')
let kpiSubitens=document.getElementById('kpiSubitensSepat')
let kpiProdutos=document.getElementById('kpiProdutosSepat')
let kpiMedia=document.getElementById('kpiMediaSepat')

if(kpiItens)kpiItens.innerText=totalItens
if(kpiSubitens)kpiSubitens.innerText=totalSubitens
if(kpiProdutos)kpiProdutos.innerText=totalProdutos
if(kpiMedia)kpiMedia.innerText=media+'%'

renderGraficoLinhaSepat(lista)
renderGraficoPizzaSepat(lista)
renderGraficoBarrasSepat(lista)

}
/*=========================================================
010AA PERIODO REFERENCIA
=========================================================*/
function obterPeriodoReferenciaSepat(){
const meses=[
'Janeiro',
'Fevereiro',
'Março',
'Abril',
'Maio',
'Junho',
'Julho',
'Agosto',
'Setembro',
'Outubro',
'Novembro',
'Dezembro'
]
let indice=MES_ATUAL_SEPAT
return meses[0]+' a '+meses[indice]+'/2026'
}

/*=========================================================
010AB DATA HORA
=========================================================*/
function obterDataHoraAtualSepat(){
let d=new Date()
let dia=String(d.getDate()).padStart(2,'0')
let mes=String(d.getMonth()+1).padStart(2,'0')
let ano=d.getFullYear()
let hora=String(d.getHours()).padStart(2,'0')
let min=String(d.getMinutes()).padStart(2,'0')
return dia+'/'+mes+'/'+ano+' '+hora+':'+min
}
/*=========================================================
010A SEPAT PDF DASHBOARD
=========================================================*/
async function gerarPDFDashboardSepat(){

let doc=criarDocSepat('p')

let totalItens=document.getElementById('kpiItensSepat')?.innerText||'0'
let totalSubitens=document.getElementById('kpiSubitensSepat')?.innerText||'0'
let totalProdutos=document.getElementById('kpiProdutosSepat')?.innerText||'0'
let media=document.getElementById('kpiMediaSepat')?.innerText||'0%'

doc.setFontSize(18)
doc.setTextColor(15,23,42)

doc.text('DASHBOARD EXECUTIVO - TAG SEPAT 2026',10,14)
doc.setFontSize(9)
doc.setTextColor(90)

doc.text(
'Período de Referência: '+obterPeriodoReferenciaSepat(),
10,
20
)

doc.text(
'Atualizado em: '+obterDataHoraAtualSepat(),
200,
20,
{
align:'right'
}
)
doc.setDrawColor(220,220,220)

doc.line(10,18,200,18)

doc.setFontSize(11)

doc.setTextColor(30,41,59)

doc.text('Itens Estratégicos: '+totalItens,12,30)
doc.text('Subitens Monitorados: '+totalSubitens,12,38)
doc.text('Produtos Estratégicos: '+totalProdutos,12,46)
doc.text('Média Geral Consolidada: '+media,12,54)

let linha=document.getElementById('graficoLinhaSepat')
let pizza=document.getElementById('graficoPizzaSepat')
let barras=document.getElementById('graficoBarrasSepat')

/*=========================================================
PAGINA 1 EVOLUÇÃO
=========================================================*/
if(linha){

let imgLinha=await gerarImagemHDChartSepat('graficoLinhaSepat')

doc.setFontSize(13)

doc.text('EVOLUÇÃO MENSAL',10,68)

doc.addImage(imgLinha,'PNG',10,74,190,78)

doc.setFontSize(9)

doc.setTextColor(80)

doc.text(
'Análise consolidada da evolução mensal do desempenho da TAG SEPAT 2026.',
10,
160,
{
maxWidth:188
}
)

}

/*=========================================================
PAGINA 2 DISTRIBUIÇÃO
=========================================================*/
if(pizza){

doc.addPage()

doc.setFontSize(16)

doc.setTextColor(15,23,42)

doc.text('DISTRIBUIÇÃO PERCENTUAL',10,14)

let imgPizza=await gerarImagemHDChartSepat('graficoPizzaSepat')

doc.addImage(imgPizza,'PNG',20,28,165,110)

doc.setFontSize(9)

doc.setTextColor(80)

doc.text(
'Distribuição consolidada dos percentuais de cumprimento dos subitens monitorados.',
10,
150,
{
maxWidth:188
}
)

}

/*=========================================================
PAGINA 3 DESEMPENHO
=========================================================*/
if(barras){

doc.addPage()

doc.setFontSize(16)

doc.setTextColor(15,23,42)

doc.text('DESEMPENHO POR ITEM ESTRATÉGICO',10,14)

let imgBarras=await gerarImagemHDChartSepat('graficoBarrasSepat')

doc.addImage(imgBarras,'PNG',10,28,190,100)

doc.setFontSize(9)

doc.setTextColor(80)

doc.text(
'Comparativo consolidado do desempenho percentual entre os itens estratégicos da TAG SEPAT 2026.',
10,
142,
{
maxWidth:188
}
)

}

/*=========================================================
RODAPÉ EM TODAS AS PÁGINAS
=========================================================*/
let totalPages=doc.internal.getNumberOfPages()

for(let i=1;i<=totalPages;i++){

doc.setPage(i)

rodapeSepat(doc)

}
doc.setFontSize(8)

doc.setTextColor(110)

doc.text(
'Período de Referência: '+obterPeriodoReferenciaSepat(),
10,
280
)

doc.text(
'Atualização automática: '+obterDataHoraAtualSepat(),
200,
280,
{
align:'right'
}
)
doc.save('pdf_dashboard_tag_sepat.pdf')

}
/*=========================================================
011 SEPAT CORE GRAFICO LINHA
=========================================================*/
function renderGraficoLinhaSepat(lista){

lista=[...(lista||[])]

let canvas=document.getElementById('graficoLinhaSepat')
if(!canvas)return

let ctx=canvas.getContext('2d')

if(graficoLinhaSepat){
graficoLinhaSepat.destroy()
}

let indiceMes=MES_ATUAL_SEPAT

let labels=MESES_LABEL_SEPAT.slice(0,indiceMes+1)

let valores=[]

MESES_SEPAT.slice(0,indiceMes+1).forEach(m=>{

let soma=0

lista.forEach(i=>{
let valor=Number(i[m]||0)
if(isNaN(valor))valor=0
soma+=valor
})

valores.push(
lista.length
?Math.round(soma/lista.length)
:0
)

})

graficoLinhaSepat=new Chart(ctx,{
type:'line',
data:{
labels:labels,
datasets:[{
label:'EVOLUÇÃO GERAL',
data:valores,
borderColor:'#16a34a',
backgroundColor:'rgba(34,197,94,.18)',
borderWidth:4,
pointRadius:6,
pointHoverRadius:8,
pointBackgroundColor:'#16a34a',
pointBorderColor:'#ffffff',
pointBorderWidth:2,
tension:.35,
fill:true
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
display:true,
position:'top',
labels:{
font:{size:14,weight:'900'},
color:'#111827'
}
},
tooltip:{
callbacks:{
label:(ctx)=>ctx.raw+'%'
}
},
datalabels:{
display:true,
anchor:'end',
align:'top',
font:{weight:'1000',size:14},
color:'#111827',
formatter:(v)=>v+'%'
}
},
scales:{
y:{
beginAtZero:true,
max:100,
ticks:{
callback:(v)=>v+'%'
}
},
x:{
ticks:{
font:{weight:'800',size:10}
}
}
}
},
plugins:[ChartDataLabels]
})

}
/*=========================================================
012 SEPAT CORE GRAFICO PIZZA
=========================================================*/
function renderGraficoPizzaSepat(lista){

lista=[...(lista||[])]

let canvas=document.getElementById('graficoPizzaSepat')
if(!canvas)return

let ctx=canvas.getContext('2d')

if(graficoPizzaSepat){
graficoPizzaSepat.destroy()
}

let concluidos=0
let andamento=0
let criticos=0
let pendentes=0

lista.forEach(i=>{

let v=Number(getTotalSepat(i))

if(isNaN(v))v=0

if(v>=100){

concluidos++

}else if(v>30){

andamento++

}else if(v>0){

criticos++

}else{

pendentes++

}

})

graficoPizzaSepat=new Chart(ctx,{
type:'doughnut',
data:{
labels:[
'100% Cumpridos',
'Em andamento',
'Abaixo de 30%',
'Pendentes'
],
datasets:[{
data:[
concluidos,
andamento,
criticos,
pendentes
],
backgroundColor:[
'#22c55e',
'#eab308',
'#ef4444',
'#94a3b8'
],
borderWidth:3,
borderColor:'#ffffff'
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
cutout:'58%',
plugins:{
legend:{
position:'right',
labels:{
font:{
weight:'1000',
size:16
},
color:'#111827',
padding:24,
boxWidth:18
}
},
tooltip:{
callbacks:{
label:(ctx)=>ctx.label+': '+ctx.raw
}
},
datalabels:{
display:true,
font:{
weight:'1000',
size:18
},
color:'#111827',
formatter:(v,ctx)=>{
let total=ctx.chart.data.datasets[0].data.reduce((a,b)=>a+b,0)
if(!total)return'0%'
return Math.round((v*100)/total)+'%'
}
}
}
},
plugins:[ChartDataLabels]
})

}
/*=========================================================
013 SEPAT CORE GRAFICO BARRAS
=========================================================*/
function renderGraficoBarrasSepat(lista){
let canvas=document.getElementById('graficoBarrasSepat')
if(!canvas)return
let ctx=canvas.getContext('2d')
if(graficoBarrasSepat)graficoBarrasSepat.destroy()
let mapa={}
lista.forEach(i=>{
let chave=String(i.siglaitem||'SEM ITEM')
if(!mapa[chave]){
mapa[chave]={siglaitem:chave,item:i.item||'',total:0,qtd:0,base:i}
}
mapa[chave].total+=Number(getTotalSepat(i))
mapa[chave].qtd++
})
let itens=Object.values(mapa).sort((a,b)=>compareSepat(a.base,b.base))
let labels=itens.map(i=>i.siglaitem)
let valores=itens.map(i=>{
return Math.round(Number(i.total)/(i.qtd||1))
})
graficoBarrasSepat=new Chart(ctx,{
type:'bar',
data:{
labels:labels,
datasets:[{
label:'MÉDIA POR ITEM ESTRATÉGICO',
data:valores,
backgroundColor:valores.map(v=>{
if(v>=100)return'#22c55e'
if(v>=30)return'#eab308'
if(v>0)return'#ef4444'
return'#94a3b8'
}),
borderRadius:10,
borderSkipped:false,
maxBarThickness:28
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{display:false},
tooltip:{callbacks:{label:(ctx)=>ctx.raw+'%'}},
datalabels:{
display:true,
anchor:'end',
align:'top',
font:{weight:'1000',size:12},
color:'#111827',
formatter:(v)=>v+'%'
}
},
scales:{
y:{beginAtZero:true,max:100,ticks:{callback:(v)=>v+'%'}},
x:{
ticks:{
font:{weight:'1000',size:11},
color:'#111827',
maxRotation:55,
minRotation:55
}
}
}
},
plugins:[ChartDataLabels]
})
}
/*=========================================================
014 SEPAT CORE RENDER RESUMO
=========================================================*/
function renderResumoSepat(){
let box=document.getElementById('cardsResumoSepat')
if(!box)return
let lista=[...(sepatData||[])].sort(compareSepat)
let ocultar100Resumo=document.getElementById('ocultar100ResumoSepat')?.checked||false
if(ocultar100Resumo){
lista=lista.filter(i=>getTotalSepat(i)<100)
}
let mapa={}
lista.forEach(i=>{
let chave=modoResumoSepat==='item'?String(i.siglaitem||''):String(i.subitem||'')
if(!chave)return
if(!mapa[chave]){
mapa[chave]=[]
}
mapa[chave].push(i)
})
let grupos=Object.keys(mapa).map(k=>{
let arr=mapa[k]||[]
let base=arr[0]||{}
let media=Math.round(arr.reduce((acc,c)=>acc+getTotalSepat(c),0)/(arr.length||1))
return{
chave:k,
base:base,
lista:arr,
media:media
}
}).sort((a,b)=>compareSepat(a.base,b.base))
box.innerHTML=grupos.map(g=>{
let titulo=modoResumoSepat==='item'?g.base.siglaitem:g.base.subitem
let subtitulo=modoResumoSepat==='item'?g.base.item:g.base.produto
let desc=modoResumoSepat==='item'?g.base.item:g.base.descricaoitem
return`
<div class="card-resumo-sepat ${corClasseSepat(g.media)}" onclick="abrirModalResumoSepat('${g.chave}')">
<div>
<div class="card-resumo-head">${modoResumoSepat==='item'?'ITEM':'SUBITEM'} ${titulo||'-'}</div>
<div class="card-resumo-desc">${subtitulo||desc||'-'}</div>
</div>
<div class="card-resumo-total">${g.media}%</div>
</div>
`
}).join('')
atualizarMiniKPIsSepat()
}

/*=========================================================
015 SEPAT CORE ABRIR MODAL RESUMO
=========================================================*/
function abrirModalResumoSepat(chave){
let modal=document.getElementById('modalSepat')
let conteudo=document.getElementById('modalConteudoSepat')
if(!modal||!conteudo)return
let lista=[...(sepatData||[])].filter(i=>{
if(modoResumoSepat==='item'){
return String(i.siglaitem||'')===String(chave)
}
return String(i.subitem||'')===String(chave)
}).sort(compareSepat)
if(!lista.length){
alert('Nenhum dado encontrado')
return
}
let base=lista[0]
let media=Math.round(lista.reduce((acc,c)=>acc+getTotalSepat(c),0)/(lista.length||1))
conteudo.innerHTML=`
<div class="modal-title-sepat">${modoResumoSepat==='item'?'ITEM':'SUBITEM'} ${modoResumoSepat==='item'?base.siglaitem:base.subitem} • ${media}%</div>
<div class="modal-text-sepat"><b>Item:</b> ${base.item||'-'}</div>
<div class="modal-text-sepat"><b>Descrição:</b> ${base.descricaoitem||'-'}</div>
<div class="modal-text-sepat"><b>Total de registros:</b> ${lista.length}</div>
${lista.map(i=>`
<div style="margin-top:14px;border-top:1px solid #e5e7eb;padding-top:12px;">
<div class="modal-text-sepat"><b>Subitem:</b> ${i.subitem||'-'}</div>
<div class="modal-text-sepat"><b>Produto:</b> ${i.produto||'-'}</div>
<div class="modal-text-sepat"><b>Responsável:</b> ${i.cargo||'-'}</div>
<div class="modal-grid-sepat">
${MESES_SEPAT.slice(0,5).map(m=>`
<div class="modal-mes-sepat">
<div>${m.toUpperCase()}</div>
<div>${Number(i[m]||0)}%</div>
</div>
`).join('')}
</div>
</div>
`).join('')}
`
modal.classList.remove('hidden')
}


/*=========================================================
016 SEPAT CORE FECHAR MODAL
=========================================================*/
function fecharModalSepat(){
let modal=document.getElementById('modalSepat')
if(modal)modal.classList.add('hidden')
}
/*=========================================================
017 SEPAT CORE RENDER TABELA MONITORAMENTO
=========================================================*/
function renderTabelaSepat(){
let view=document.getElementById('view-monitoramento')
if(view){
if(modoTabelaSepat==='item'){
view.classList.add('tabela-item-sepat')
}else{
view.classList.remove('tabela-item-sepat')
}
}
let tbody=document.getElementById('tbodySepat')
if(!tbody)return
let busca=String(
document.getElementById('buscaMonitoramentoSepat')?.value||''
)
.toLowerCase()
.trim()
let ocultar100=document.getElementById('ocultar100Sepat')?.checked||false
let lista=[...(sepatData||[])].sort(compareSepat)
if(busca){
lista=lista.filter(i=>{
return[
i.siglaitem,
i.subitem,
i.item,
i.produto,
i.cargo
]
.join(' ')
.toLowerCase()
.includes(busca)
})

}
if(ocultar100){
lista=lista.filter(i=>getTotalSepat(i)<100)
}
const mesesOrdem=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const mesAtual=mesesOrdem[new Date().getMonth()]
const indiceAtual=mesesOrdem.indexOf(mesAtual)
let thModo=document.getElementById('thModoSepat')
let thDescricao=document.getElementById('thDescricaoSepat')

if(modoTabelaSepat==='item'){
if(thModo)thModo.innerText='ITEM'
if(thDescricao)thDescricao.innerText='DESCRIÇÃO ITEM'
}else{
if(thModo)thModo.innerText='SUBITEM'
if(thDescricao)thDescricao.innerText='DESCRIÇÃO'
}
tbody.innerHTML=lista.map(i=>{
let total=getTotalSepat(i)
let html=`
<tr>
<td class="col-subitem" style="width:340px;min-width:340px;max-width:340px;font-size:10px;font-weight:900;line-height:1.5;white-space:normal;word-break:break-word;vertical-align:top;">
${modoTabelaSepat==='item'?(i.item||'-'):(i.siglaitem||'-')}
</td>
<td style="max-width:760px;font-size:9px;line-height:1.55;vertical-align:top;">
${modoTabelaSepat==='item'?(i.descricaoitem||'-'):(i.subitem||'-')}
</td>
<td style="font-size:9px;line-height:1.4;max-width:170px;vertical-align:top;">
${i.produto||'-'}
</td>
<td style="font-size:9px;line-height:1.35;max-width:130px;vertical-align:top;">
${i.cargo||'-'}
</td>
<td style="font-size:9px;text-align:center;white-space:nowrap;">
${formatarDataSepat(i.data_inicio)}
</td>
`
MESES_SEPAT
.filter(m=>mesesOrdem.indexOf(m)<=indiceAtual)
.forEach(mes=>{
let nivel=Number(sepatUser?.nivel_acesso||99)
let valorAtual=Number(i[mes]||0)
let podeEditar=false
/*=========================================================
NIVEL 1
EDITA SEMPRE
=========================================================*/
if(nivel===1){
podeEditar=true
}
/*=========================================================
NIVEL 2
SOMENTE MES VIGENTE
E APENAS PRIMEIRO PREENCHIMENTO
=========================================================*/
if(
nivel===2 &&
mes===mesAtual &&
valorAtual===0
){
podeEditar=true
}

let clsMes=
mes===mesAtual
?'mes-atual-sepat'
:''

html+=`
<td class="mes-col mes-${mes} ${clsMes}">
<input
type="text"
inputmode="numeric"
min="0"
max="100"
step="1"
value="${parseInt(Number(i[mes]||0))}"
${podeEditar?'':'disabled'}
class="input-mes-sepat"
onchange="salvarPercentualSepat('${i.id}','${mes}',this.value)"
>
</td>
`

})

html+=`
<td class="td-total-sepat">
${total}%
</td>
</tr>
`

return html

}).join('')
let ocultas=JSON.parse(
localStorage.getItem('sepatColunasOcultas')||'[]'
)

ocultas.forEach(mes=>{
document.querySelectorAll('.mes-'+mes).forEach(el=>{
el.style.display='none'
})
})
atualizarMiniKPIsSepat()
}
/*=========================================================
018 SEPAT CORE SALVAR PERCENTUAL
=========================================================*/
async function salvarPercentualSepat(id,mes,valor){

valor=Number(valor||0)

if(isNaN(valor))valor=0

if(valor<0)valor=0
if(valor>100)valor=100

let itemAtual=sepatData.find(i=>String(i.id)===String(id))||{}

itemAtual[mes]=valor

let total=Math.max(
Number(itemAtual.jan||0),
Number(itemAtual.fev||0),
Number(itemAtual.mar||0),
Number(itemAtual.abr||0),
Number(itemAtual.mai||0),
Number(itemAtual.jun||0),
Number(itemAtual.jul||0),
Number(itemAtual.ago||0),
Number(itemAtual.set||0),
Number(itemAtual.out||0),
Number(itemAtual.nov||0),
Number(itemAtual.dez||0)
)

let update={}
update[mes]=valor
update.total_cumprimento=total

let {error}=await sepatClient
.from('sepat_deliberacoes')
.update(update)
.eq('id',id)

if(error){
console.log(error)
alert('Erro ao salvar percentual')
return
}
let item=sepatData.find(i=>String(i.id)===String(id))

if(item){
item[mes]=valor
item.total_cumprimento=getTotalSepat(item)
}
atualizarTodosPaineisSepat()
}

/*=========================================================
019 SEPAT CORE RENDER CONCLUIDOS
=========================================================*/
function renderConcluidosSepat(){
let box=document.getElementById('cardsConcluidosSepat')
if(!box)return
let lista=[...(sepatData||[])].filter(i=>getTotalSepat(i)>=100).sort(compareSepat)
if(!lista.length){
box.innerHTML=`
<div class="card-resumo-sepat cinza">
<div>
<div class="card-resumo-head">100% CUMPRIDOS</div>
<div class="card-resumo-desc">Nenhum subitem/produto está com 100% de execução até o momento.</div>
</div>
<div class="card-resumo-total">0</div>
</div>
`
return
}
box.innerHTML=lista.map(i=>`
<div class="card-resumo-sepat verde" onclick="abrirModalResumoSepat('${i.subitem}')">

<div>

${modoConclusaoSepat==='item'
?`
<div class="card-resumo-head">
${i.item||'-'}
</div>

<div class="card-resumo-desc">
${i.tematica||'-'}
</div>

<div class="card-resumo-desc">
${i.descricaoitem||'-'}
</div>

<div style="margin-top:14px;font-size:12px;line-height:1.45;font-weight:700;color:#334155;">
<b>Produto:</b><br>
${i.produto||'-'}
</div>
`
:`
<div class="card-resumo-head">
${i.siglaitem||i.subitem||'-'}
</div>

<div class="card-resumo-desc">
${i.subitem||'-'}
</div>

<div style="margin-top:14px;font-size:12px;line-height:1.45;font-weight:700;color:#334155;">
<b>Produto:</b><br>
${i.produto||'-'}
</div>
`
}

</div>

<div class="card-resumo-total">
100%
</div>

</div>
`).join('')
}
/*=========================================================
020 SEPAT CORE POPULAR ITENS GRAFICOS
=========================================================*/
function popularItensSepat(){
let sel=document.getElementById('filtroItemSepat')
if(!sel)return
let mapa={}
;(sepatData||[]).forEach(i=>{
let chave=String(i.siglaitem||'').trim()
if(!chave)return
if(!mapa[chave]){
mapa[chave]={siglaitem:chave,item:i.item||'',base:i}
}
})
let lista=Object.values(mapa).sort((a,b)=>compareSepat(a.base,b.base))
sel.innerHTML='<option value="todos">TODOS OS ITENS</option>'+lista.map(i=>`<option value="${i.siglaitem}">${i.siglaitem} - ${truncarSepat(i.item,90)}</option>`).join('')
}
/*=========================================================
021 SEPAT CORE POPULAR SUBITENS GRAFICOS
=========================================================*/
function popularSubitensSepat(){
let sel=document.getElementById('filtroSubitemSepat')
let item=document.getElementById('filtroItemSepat')
if(!sel||!item)return
let itemSelecionado=String(item.value||'todos')
let lista=[...(sepatData||[])]
if(itemSelecionado!=='todos'){
lista=lista.filter(i=>String(i.siglaitem||'')===itemSelecionado)
}
lista=lista.sort(compareSepat)
let html=`<option value="TOTAL">TODOS OS SUBITENS (${lista.length})</option>`
html+=lista.map(i=>{
let id=i.id||i.subitem
return `<option value="${id}" title="${i.subitem} • ${getTotalSepat(i)}% • ${i.produto||'-'}">${i.subitem} • ${getTotalSepat(i)}% • ${truncarSepat(i.produto||'-',80)}</option>`
}).join('')
sel.innerHTML=html
}
/*=========================================================
022 SEPAT CORE RENDER GRAFICO MASTER
=========================================================*/
function renderGraficoMasterSepat(){
let canvas=document.getElementById('graficoMasterSepat')
if(!canvas)return
let ctx=canvas.getContext('2d')
if(graficoMasterSepat)graficoMasterSepat.destroy()
let itemSelecionado=String(document.getElementById('filtroItemSepat')?.value||'todos')
let subSelecionado=String(document.getElementById('filtroSubitemSepat')?.value||'TOTAL')
let lista=[...(sepatData||[])]
if(itemSelecionado!=='todos'){
lista=lista.filter(i=>String(i.siglaitem||'')===itemSelecionado)
}
let titulo='TOTAL CONSOLIDADO SEPAT'
let desc='Evolução média consolidada dos subitens/produtos selecionados.'
if(subSelecionado!=='TOTAL'){
let achado=lista.find(i=>String(i.id)===subSelecionado||String(i.subitem)===subSelecionado)
if(achado){
lista=[achado]
titulo='SUBITEM '+(achado.subitem||'-')+' • '+(achado.siglaitem||'-')
desc=(achado.produto||'-')+'<br><br><b>Item:</b> '+(achado.item||'-')
}
}
let valores=MESES_SEPAT.slice(0,MES_ATUAL_SEPAT+1).map((m,indice)=>{
if(indice===MES_ATUAL_SEPAT){
return calcularMediaSepat(lista)
}
let total=0
lista.forEach(i=>{
let v=Number(i[m]||0)
if(isNaN(v))v=0
total+=v
})
return Math.round(total/(lista.length||1))
})
graficoMasterSepat=new Chart(ctx,{
type:'bar',
data:{
labels:MESES_LABEL_SEPAT.slice(0,MES_ATUAL_SEPAT+1),
datasets:[{
label:titulo,
data:valores,
borderWidth:2,
borderRadius:10,
borderSkipped:false,
maxBarThickness:42
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
display:true,
position:'bottom',
labels:{
font:{weight:'900',size:12}
}
},
tooltip:{
callbacks:{
label:(ctx)=>ctx.raw+'%'
}
},
datalabels:{
display:true,
anchor:'end',
align:'top',
font:{weight:'900',size:11},
formatter:(v)=>v+'%'
}
},
scales:{
y:{
beginAtZero:true,
max:100,
ticks:{
callback:(v)=>v+'%'
}
},
x:{
ticks:{
font:{weight:'900',size:11}
}
}
}
},
plugins:[ChartDataLabels]
})
let box=document.getElementById('descGraficoSepat')
if(box){
let textoMeses=''
valores.forEach((valor,indice)=>{
textoMeses+=MESES_LABEL_SEPAT[indice]+': <b>'+valor+'%</b>'
if(indice<valores.length-1){
textoMeses+=' | '
}
})
box.innerHTML=`
<b>${titulo}</b><br>
${desc}
<br><br>
${textoMeses}
`
}
}
/*=========================================================
023 SEPAT CORE CARREGAR PERFIS
=========================================================*/
async function carregarPerfisSepat(){
let box=document.getElementById('listaPerfisSepat')
if(!box)return
if(!sepatUser||Number(sepatUser.nivel_acesso||0)!==1){
box.innerHTML='Sem permissão.'
return
}
let {data,error}=await sepatClient
.from('sepat_perfis')
.select('*')
.order('ordem',{ascending:true})
if(error){
console.log(error)
box.innerHTML='Erro ao carregar perfis.'
return
}
sepatPerfis=data||[]
box.innerHTML=`
<div class="perfil-grid-sepat">

<div class="perfil-head-sepat">Nº</div>
<div class="perfil-head-sepat">NOME COMPLETO</div>
<div class="perfil-head-sepat">USERNAME</div>
<div class="perfil-head-sepat">CARGO</div>
<div class="perfil-head-sepat">NÍVEL ACESSO</div>
<div class="perfil-head-sepat" style="text-align:center">EXCLUIR</div>
${sepatPerfis.map((p,idx)=>`
<div class="perfil-row-sepat">
<div>
${String(idx+1).padStart(2,'0')}
</div>
<div>
${editandoPerfisSepat?`<input class="inputPerfilSepat" data-id="${p.id}" data-campo="nome_completo" value="${p.nome_completo||''}">`:(p.nome_completo||'-')}
</div>
<div>
${editandoPerfisSepat?`<input class="inputPerfilSepat" data-id="${p.id}" data-campo="username" value="${p.username||''}">`:(p.username||'-')}
</div>
<div>
${editandoPerfisSepat?`<input class="inputPerfilSepat" data-id="${p.id}" data-campo="cargo" value="${p.cargo||''}">`:(p.cargo||'-')}
</div>
<div>
${editandoPerfisSepat?`<input class="inputPerfilSepat" data-id="${p.id}" data-campo="nivel_acesso" value="${p.nivel_acesso||4}">`:(p.nivel_acesso||'-')}
</div>
<div style="display:flex;justify-content:flex-end">
${editandoPerfisSepat?`<button onclick="excluirPerfilSepat('${p.id}')" style="width:28px;height:28px;border:none;border-radius:8px;background:#ef4444;color:#fff;font-weight:1000;cursor:pointer">×</button>`:''}
</div>
</div>
`).join('')}

</div>
`
}
/*=========================================================
024 SEPAT PDF HELPERS
=========================================================*/
function criarDocSepat(orientacao='p'){
const {jsPDF}=window.jspdf
let doc=new jsPDF({
orientation:orientacao,
unit:'mm',
format:'a4',
compress:true,
putOnlyUsedFonts:true,
precision:16
})
doc.setProperties({
title:'TAG SEPAT 2026',
subject:'Monitoramento TAG SEPAT',
author:'Tribunal de Contas do Estado de Rondônia',
creator:'TCE-RO'
})
doc.setFont('helvetica')
return doc
}

function rodapeSepat(doc){

let total=doc.internal.getNumberOfPages()

for(let i=1;i<=total;i++){

doc.setPage(i)

let h=doc.internal.pageSize.height

let w=doc.internal.pageSize.width

doc.setFillColor(255,255,255)

doc.rect(0,h-36,w,36,'F')

doc.setDrawColor(220,220,220)

doc.line(6,h-37,w-6,h-37)

doc.setFontSize(7)

doc.setTextColor(60,60,60)

doc.text(
'Tribunal de Contas do Estado de Rondônia - TAG SEPAT 2026',
8,
h-30
)

doc.setFontSize(4.8)

doc.setTextColor(90,90,90)

let linhas=doc.splitTextToSize(
NOTA_TECNICA_SEPAT,
w-24
)

doc.text(
linhas,
8,
h-24,
{
align:'justify'
}
)

doc.setFontSize(7)

doc.setTextColor(80,80,80)

doc.text(
'Página '+i+' de '+total,
w-8,
h-6,
{
align:'right'
}
)

}

}
/*=========================================================
024A SEPAT PDF CANVAS HD
=========================================================*/
async function gerarImagemHDChartSepat(canvasId){

let canvas=document.getElementById(canvasId)

if(!canvas)return null

let originalChart=Chart.getChart(canvas)

if(!originalChart)return null

let tempCanvas=document.createElement('canvas')

tempCanvas.width=2400

tempCanvas.height=1200

let tempCtx=tempCanvas.getContext('2d')

new Chart(tempCtx,{
type:originalChart.config.type,
data:JSON.parse(JSON.stringify(originalChart.config.data)),
options:{
...JSON.parse(JSON.stringify(originalChart.config.options)),
responsive:false,
animation:false,
plugins:{
legend:{
display:true,
labels:{
font:{
size:20,
weight:'bold'
},
color:'#111827'
}
},
datalabels:{
display:true,
font:{
size:18,
weight:'bold'
}
}
},
scales:{
x:{
ticks:{
font:{
size:16,
weight:'bold'
}
}
},
y:{
ticks:{
font:{
size:16,
weight:'bold'
}
}
}
}
}
})

await new Promise(r=>setTimeout(r,500))

return tempCanvas.toDataURL('image/png',1.0)

}
/*=========================================================
025 SEPAT PDF RESUMO
=========================================================*/
function gerarPDFResumoSepat(){
let doc=criarDocSepat('p')
let lista=[...(sepatData||[])].sort(compareSepat)
let mapa={}
lista.forEach(i=>{
let chave=String(i.siglaitem||'')
if(!mapa[chave]){
mapa[chave]=[]
}
mapa[chave].push(i)
})
let rows=[]
Object.keys(mapa).sort((a,b)=>{
let aa=mapa[a]?.[0]||{}
let bb=mapa[b]?.[0]||{}
return compareSepat(aa,bb)
}).forEach(k=>{
let arr=mapa[k]||[]
if(!arr.length)return
let base=arr[0]
let media=Math.round(arr.reduce((acc,c)=>acc+getTotalSepat(c),0)/(arr.length||1))
rows.push([
'ITEM '+(base.siglaitem||'-'),
String(base.item||base.descricaoitem||'-'),
'',
media+'%'
])
arr.sort(compareSepat).forEach(i=>{
rows.push([
'SUBITEM '+(i.subitem||'-'),
String(i.descricaoitem||i.subitem||'-'),
String(i.produto||'-'),
getTotalSepat(i)+'%'
])
})
})
doc.setFontSize(14)
doc.setTextColor(0,0,0)
doc.text('RESUMO EXECUTIVO - TAG SEPAT 2026',10,12)
doc.autoTable({
startY:22,
head:[['ITEM/SUBITEM','DESCRIÇÃO','PRODUTO','%']],
body:rows,
styles:{
fontSize:6.6,
overflow:'linebreak',
cellPadding:1.8,
valign:'top',
textColor:[15,23,42],
lineColor:[210,215,220],
lineWidth:.15
},
headStyles:{
fillColor:[7,89,201],
textColor:[255,255,255],
fontStyle:'bold'
},
alternateRowStyles:{
fillColor:[248,248,248]
},
columnStyles:{
0:{
cellWidth:40,
halign:'left',
valign:'top'
},
1:{
cellWidth:90,
valign:'top'
},
2:{
cellWidth:40,
valign:'top'
},
3:{
cellWidth:12,
halign:'center',
valign:'middle'
}
},
margin:{
top:20,
bottom:42,
left:4,
right:4
},
pageBreak:'auto',
rowPageBreak:'avoid',
didParseCell:function(data){
let txt=String(data.cell.raw||'')
if(txt.startsWith('ITEM ')){
data.cell.styles.fillColor=[3,105,161]
data.cell.styles.textColor=[255,255,255]
data.cell.styles.fontStyle='bold'
}
},
didDrawPage:function(data){
let pageHeight=doc.internal.pageSize.height
let pageWidth=doc.internal.pageSize.width
doc.setFillColor(255,255,255)
doc.rect(0,pageHeight-34,pageWidth,34,'F')
}
})
rodapeSepat(doc)
doc.save('pdf_resumo_tag_sepat.pdf')
}
/*=========================================================
026 SEPAT PDF MONITORAMENTO
=========================================================*/
function gerarPDFMonitoramentoSepat(){
let doc=criarDocSepat('l')
let lista=[...(sepatData||[])].sort(compareSepat)
let meses=[
{campo:'jan',label:'JAN'},
{campo:'fev',label:'FEV'},
{campo:'mar',label:'MAR'},
{campo:'abr',label:'ABR'},
{campo:'mai',label:'MAI'},
{campo:'jun',label:'JUN'},
{campo:'jul',label:'JUL'},
{campo:'ago',label:'AGO'},
{campo:'set',label:'SET'},
{campo:'out',label:'OUT'},
{campo:'nov',label:'NOV'},
{campo:'dez',label:'DEZ'}
]
let mesAtual=new Date().getMonth()
let mesesAtivos=meses.slice(0,mesAtual+1)
let rows=lista.map(i=>{
let linha=[
modoTabelaSepat==='item'
?String(i.item||'-')
:String(i.siglaitem||'-'),
modoTabelaSepat==='item'
?String(i.descricaoitem||'-')
:String(i.subitem||'-'),
String(i.produto||'-'),
String(i.cargo||'-')
]
mesesAtivos.forEach(m=>{
linha.push(Number(i[m.campo]||0)+'%')
})
linha.push(getTotalSepat(i)+'%')
return linha
})
doc.setFontSize(15)
doc.setTextColor(15,23,42)
doc.text('MONITORAMENTO COMPLETO - TAG SEPAT 2026',14,14)
doc.setFontSize(8)
doc.setTextColor(100)
doc.text('Painel consolidado de monitoramento técnico da SEPAT.',14,19)
doc.autoTable({
startY:24,
head:[[
modoTabelaSepat==='item'
?'ITEM'
:'SUBITEM',
modoTabelaSepat==='item'
?'DESCRIÇÃO ITEM'
:'DESCRIÇÃO',
'PRODUTO',
'RESPONSÁVEL',
...mesesAtivos.map(m=>m.label),
'TOTAL'
]],
body:rows,
theme:'striped',
styles:{
fontSize:6.6,
overflow:'linebreak',
cellPadding:1.8,
valign:'top',
textColor:[15,23,42],
lineColor:[210,215,220],
lineWidth:.15
},
headStyles:{
fillColor:[15,23,42],
textColor:[255,255,255],
fontStyle:'bold',
fontSize:8.5,
halign:'center',
valign:'middle'
},
alternateRowStyles:{
fillColor:[245,247,250]
},
columnStyles:(()=>{

let estilos={

0:{
cellWidth:38,
halign:'left',
valign:'top'
},

1:{
cellWidth:120,
valign:'top'
},

2:{
cellWidth:42,
valign:'top'
},

3:{
cellWidth:28,
valign:'top'
}

}

let indice=4

mesesAtivos.forEach(()=>{

estilos[indice]={
cellWidth:9,
halign:'center',
valign:'middle'
}

indice++

})

estilos[indice]={
cellWidth:12,
halign:'center',
valign:'middle'
}

return estilos

})(),
margin:{
top:20,
bottom:42,
left:5,
right:5
},
pageBreak:'auto',
rowPageBreak:'avoid',
didParseCell:function(data){
if(data.section==='body'&&data.column.index===16){
data.cell.styles.fontStyle='bold'
data.cell.styles.textColor=[4,120,87]
}
},
didDrawPage:function(data){
let pageHeight=doc.internal.pageSize.height
let pageWidth=doc.internal.pageSize.width
doc.setFillColor(255,255,255)
doc.rect(0,pageHeight-36,pageWidth,36,'F')
}
})
let finalY=doc.lastAutoTable.finalY||240
if(finalY<160){
doc.setFontSize(7)
doc.setTextColor(110)
doc.text('As informações constantes neste painel possuem caráter preliminar e dependem de validação técnica documental.',14,finalY+8,{maxWidth:250})
}
rodapeSepat(doc)
doc.save(
modoTabelaSepat==='item'
?'Itens_Monitoramento_TAG_SEPAT_2026.pdf'
:'Subitens_Monitoramento_TAG_SEPAT_2026.pdf'
)
}
/*=========================================================
027 SEPAT PDF GRAFICOS
=========================================================*/
async function gerarPDFGraficosSepat(){

let doc=criarDocSepat('p')

let canvas=document.getElementById('graficoMasterSepat')

if(!canvas){
alert('Gráfico não encontrado')
return
}

let img=await gerarImagemHDChartSepat('graficoMasterSepat')

doc.setFontSize(14)
doc.setTextColor(0,0,0)

doc.text('ANÁLISE GRÁFICA - TAG SEPAT 2026',10,12)

doc.addImage(img,'PNG',10,26,190,92)

let desc=document.getElementById('descGraficoSepat')?.innerText||'Análise gráfica do TAG SEPAT 2026.'

let itemSelecionado=String(document.getElementById('filtroItemSepat')?.value||'todos')

let subSelecionado=String(document.getElementById('filtroSubitemSepat')?.value||'TOTAL')

let registro=(sepatData||[]).find(i=>
String(i.id||i.subitem||'')===String(subSelecionado)
)

let texto=''

if(registro){

texto=
'ITEM: '+(registro.siglaitem||'-')+
'\n\nDESCRIÇÃO DO ITEM:\n'+
(registro.item||'-')+
'\n\nSUBITEM: '+(registro.subitem||'-')+
'\n\nDESCRIÇÃO DO SUBITEM:\n'+
(registro.descricaoitem||'-')+
'\n\nPRODUTO ESTRATÉGICO:\n'+
(registro.produto||'-')+
'\n\nEVOLUÇÃO:\n'+
desc

}else{

texto=
'ANÁLISE CONSOLIDADA GERAL DO TAG SEPAT 2026.\n\n'+desc

}

doc.setFontSize(9)

doc.setTextColor(15,23,42)

doc.text(
texto,
10,
126,
{
maxWidth:190,
align:'justify'
}
)

doc.setDrawColor(220,220,220)

doc.line(10,120,200,120)

rodapeSepat(doc)

doc.save('pdf_graficos_tag_sepat.pdf')

}
/*=========================================================
028 SEPAT PDF CONCLUIDOS
=========================================================*/
function gerarPDFConcluidosSepat(){

let doc=criarDocSepat('l')

let lista=[...(sepatData||[])]
.filter(i=>getTotalSepat(i)>=100)
.sort(compareSepat)

let rows=lista.map(i=>[

modoConclusaoSepat==='item'
?String(i.siglaitem||i.subitem||'-')
:String(i.item||'-'),

modoConclusaoSepat==='item'
?String(i.item||'-')
:String(i.siglaitem||i.subitem||'-'),

modoConclusaoSepat==='item'
?String(i.tematica||'-')
:String(i.subitem||'-'),

modoConclusaoSepat==='item'
?String(i.descricaoitem||'-')
:String(i.produto||'-'),

'100%'

])

doc.setFontSize(14)

doc.text(
modoConclusaoSepat==='item'
?'ITENS 100% CUMPRIDOS - TAG SEPAT 2026'
:'SUBITENS 100% CUMPRIDOS - TAG SEPAT 2026',
10,
12
)

doc.setFontSize(10)

doc.text(
'TOTAL: '+lista.length,
10,
18
)

doc.autoTable({

startY:24,

head:[[

modoConclusaoSepat==='item'
?'SUBITEM'
:'ITEM',

modoConclusaoSepat==='item'
?'ITEM'
:'SUBITEM',

modoConclusaoSepat==='item'
?'TEMÁTICA'
:'DESCRIÇÃO',

modoConclusaoSepat==='item'
?'DESCRIÇÃO ITEM'
:'PRODUTO',

'%'

]],

body:rows,

theme:'striped',

styles:{
fontSize:6.6,
overflow:'linebreak',
cellPadding:1.8,
valign:'top',
textColor:[15,23,42],
lineColor:[210,215,220],
lineWidth:.15
},

headStyles:{
fillColor:[15,23,42],
textColor:[255,255,255],
fontStyle:'bold',
fontSize:8.2,
halign:'center',
valign:'middle'
},

alternateRowStyles:{
fillColor:[245,247,250]
},

columnStyles:{

0:{
cellWidth:24,
halign:'center',
valign:'top'
},

1:{
cellWidth:28,
halign:'center',
valign:'top'
},

2:{
cellWidth:44,
valign:'top'
},

3:{
cellWidth:136,
valign:'top'
},

4:{
cellWidth:14,
halign:'center',
valign:'middle'
}

},

margin:{
top:18,
bottom:42,
left:5,
right:5
}

})

rodapeSepat(doc)

doc.save(
modoConclusaoSepat==='item'
?'Itens_100%_Cumpridos_TAG_SEPAT_2026.pdf'
:'Subitens_100%_Cumpridos_TAG_SEPAT_2026.pdf'
)

}

let editandoPerfisSepat=false

function habilitarEdicaoPerfisSepat(){
editandoPerfisSepat=!editandoPerfisSepat
carregarPerfisSepat()
}

function novoPerfilSepat(){
if(!Array.isArray(sepatPerfis))sepatPerfis=[]
sepatPerfis.unshift({
id:'novo_'+Date.now(),
nome_completo:'',
username:'',
cargo:'',
nivel_acesso:4
})
editandoPerfisSepat=true
carregarPerfisSepat()
}


async function salvarPerfisSepat(){

let linhas=document.querySelectorAll('.inputPerfilSepat')

for(let l of linhas){

let id=l.dataset.id
let campo=l.dataset.campo
let valor=l.value

let perfil=sepatPerfis.find(p=>String(p.id)===String(id))

if(perfil){
perfil[campo]=valor
}

}

for(let p of sepatPerfis){

if(String(p.id).startsWith('novo_')){

await sepatClient
.from('sepat_perfis')
.insert([{
nome_completo:p.nome_completo,
username:p.username,
cargo:p.cargo,
nivel_acesso:Number(p.nivel_acesso||4)
}])

}else{

await sepatClient
.from('sepat_perfis')
.update({
nome_completo:p.nome_completo,
username:p.username,
cargo:p.cargo,
nivel_acesso:Number(p.nivel_acesso||4)
})
.eq('id',p.id)

}

}

alert('Perfis salvos')

editandoPerfisSepat=false

carregarPerfisSepat()

}

let sepatPerfisTCERO=[]
let editandoPerfisTCEROSepat=false

async function carregarPerfisTCEROSepat(){
let {data,error}=await sepatClient
.from('perfistce')
.select('*')
.order('nome_completo',{ascending:true})

if(error){
console.log(error)
return
}

sepatPerfisTCERO=data||[]

let box=document.getElementById('listaPerfisTCEROSepat')

if(!box)return

box.innerHTML=`

<div class="perfil-row-sepat" style="background:#e2e8f0;font-weight:1000">
<div>NOME</div>
<div>USUÁRIO</div>
<div>CARGO</div>
<div>NÍVEL</div>
</div>

${sepatPerfisTCERO.map(p=>`

<div class="perfil-row-sepat">

<div>
${editandoPerfisTCEROSepat?
`<input class="inputPerfilTCEROSepat" data-id="${p.id}" data-campo="nome_completo" value="${p.nome_completo||''}">`
:(p.nome_completo||'-')}
</div>

<div>
${editandoPerfisTCEROSepat?
`<input class="inputPerfilTCEROSepat" data-id="${p.id}" data-campo="username" value="${p.username||''}">`
:(p.username||'-')}
</div>

<div>
${editandoPerfisTCEROSepat?
`<input class="inputPerfilTCEROSepat" data-id="${p.id}" data-campo="cargo" value="${p.cargo||''}">`
:(p.cargo||'-')}
</div>

<div>
${editandoPerfisTCEROSepat?
`<input class="inputPerfilTCEROSepat" data-id="${p.id}" data-campo="nivel_acesso" value="${p.nivel_acesso||4}">`
:(p.nivel_acesso||'-')}
</div>

</div>

`).join('')}
`
}

function habilitarEdicaoPerfisTCEROSepat(){
editandoPerfisTCEROSepat=!editandoPerfisTCEROSepat
carregarPerfisTCEROSepat()
}

function novoPerfilTCEROSepat(){
sepatPerfisTCERO.unshift({
id:'novo_'+Date.now(),
nome_completo:'',
username:'',
cargo:'',
nivel_acesso:4
})
editandoPerfisTCEROSepat=true
carregarPerfisTCEROSepat()
}

async function salvarPerfisTCEROSepat(){

let inputs=document.querySelectorAll('.inputPerfilTCEROSepat')

inputs.forEach(i=>{

let perfil=sepatPerfisTCERO.find(p=>String(p.id)===String(i.dataset.id))

if(perfil){
perfil[i.dataset.campo]=i.value
}

})

for(let p of sepatPerfisTCERO){

if(String(p.id).startsWith('novo_')){

await sepatClient
.from('perfistce')
.insert([{
nome_completo:p.nome_completo,
username:p.username,
cargo:p.cargo,
nivel_acesso:Number(p.nivel_acesso||4)
}])

}else{

await sepatClient
.from('perfistce')
.update({
nome_completo:p.nome_completo,
username:p.username,
cargo:p.cargo,
nivel_acesso:Number(p.nivel_acesso||4)
})
.eq('id',p.id)

}

}

alert('Perfis TCE-RO salvos')

editandoPerfisTCEROSepat=false

carregarPerfisTCEROSepat()

}

async function excluirPerfilSepat(id){

if(!confirm('Excluir perfil?'))return

let {error}=await sepatClient
.from('sepat_perfis')
.delete()
.eq('id',id)

if(error){
console.log(error)
alert('Erro ao excluir')
return
}

carregarPerfisSepat()

}

function voltarPainelGeral(){
localStorage.removeItem('sepatUser')
localStorage.removeItem('sepat_tab')
window.location.href='index.html'
}

async function backupSepat(){

let {data,error}=await sepatClient
.from('sepat_deliberacoes')
.select('*')

if(error){
console.log(error)
alert('Erro backup')
return
}

let blob=new Blob(
[JSON.stringify(data,null,2)],
{type:'application/json'}
)

let a=document.createElement('a')

a.href=URL.createObjectURL(blob)

a.download='backup_sepat_'+new Date().toISOString().slice(0,10)+'.json'

a.click()

}
/*=========================================================
029 SEPAT CORE ACESSO MONITORAMENTO
=========================================================*/
function aplicarAcessoMonitoramentoSepat(){

let btn=document.getElementById('btn-monitoramento')

if(!btn)return

let username=String(sepatUser?.username||'')
.toLowerCase()
.trim()

let nome=String(sepatUser?.nome_completo||'')
.toLowerCase()
.trim()

const usuariosPermitidos=[
'manoel',
'jane'
]

const liberado=
usuariosPermitidos.includes(username)||
nome.includes('manoel')||
nome.includes('jane')

if(liberado){

btn.style.display='flex'
btn.style.alignItems='center'

}else{

btn.style.display='none'

}

}

/*=========================================================
050 EXPORTAR WORD BASE
=========================================================*/
function baixarWordSepat(nome,conteudo){

let html=`
<html xmlns:o='urn:schemas-microsoft-com:office:office'
xmlns:w='urn:schemas-microsoft-com:office:word'
xmlns='http://www.w3.org/TR/REC-html40'>

<head>

<meta charset='utf-8'>

<title>${nome}</title>

<style>

@page{
size:A4;
margin-top:3cm;
margin-right:2cm;
margin-bottom:2cm;
margin-left:3cm;
}

body{
font-family:Calibri,Arial,sans-serif;
font-size:12pt;
line-height:1.15;
text-align:justify;
color:#111827;
}

h1{
font-family:Calibri,Arial,sans-serif;
font-size:16pt;
font-weight:700;
margin-bottom:14px;
color:#0f172a;
}

h2{
font-family:Calibri,Arial,sans-serif;
font-size:13pt;
font-weight:700;
margin-top:18px;
margin-bottom:10px;
color:#0f172a;
}

p{
font-family:Calibri,Arial,sans-serif;
font-size:12pt;
line-height:1.15;
text-align:justify;
margin-top:0;
margin-bottom:10px;
}

table{
width:100%;
border-collapse:collapse;
margin-top:12px;
margin-bottom:18px;
font-family:Calibri,Arial,sans-serif;
font-size:8pt;
}

th{
background:#e5e7eb;
font-weight:700;
text-align:center;
padding:6px;
border:1px solid #9ca3af;
}

td{
padding:5px;
border:1px solid #cbd5e1;
vertical-align:top;
text-align:justify;
}

.small{
font-size:8pt;
line-height:1.15;
color:#555;
}

</style>

</head>

<body>

${conteudo}

</body>

</html>
`

let blob=new Blob(
['\ufeff',html],
{
type:'application/msword'
}
)

let url=URL.createObjectURL(blob)

let a=document.createElement('a')

a.href=url

a.download=nome+'.doc'

document.body.appendChild(a)

a.click()

document.body.removeChild(a)

URL.revokeObjectURL(url)

}

/*=========================================================
051 WORD DASHBOARD
=========================================================*/
function gerarWordDashboardSepat(){

let itens=document.getElementById('kpiItensSepat')?.innerText||'0'
let subitens=document.getElementById('kpiSubitensSepat')?.innerText||'0'
let produtos=document.getElementById('kpiProdutosSepat')?.innerText||'0'
let media=document.getElementById('kpiMediaSepat')?.innerText||'0%'

let html=`

<h1>DASHBOARD EXECUTIVO - TAG SEPAT 2026</h1>

<p>
Painel consolidado de monitoramento técnico da TAG SEPAT 2026.
</p>

<table>

<tr>
<th>Itens Estratégicos</th>
<th>Subitens</th>
<th>Produtos</th>
<th>Média Geral</th>
</tr>

<tr>
<td align="center">${itens}</td>
<td align="center">${subitens}</td>
<td align="center">${produtos}</td>
<td align="center">${media}</td>
</tr>

</table>

<p class="small">
Documento gerado automaticamente pelo sistema de monitoramento TAG SEPAT 2026.
</p>

`

baixarWordSepat(
'dashboard_tag_sepat',
html
)

}

/*=========================================================
052 WORD RESUMO
=========================================================*/
function gerarWordResumoSepat(){

let lista=[...(sepatData||[])].sort(compareSepat)

let linhas=''

lista.forEach(i=>{

linhas+=`

<tr>

<td>
${modoResumoSepat==='item'
?(i.item||'-')
:(i.siglaitem||'-')}
</td>

<td>
${modoResumoSepat==='item'
?(i.descricaoitem||'-')
:(i.subitem||'-')}
</td>

<td>
${i.produto||'-'}
</td>

<td align="center">
${getTotalSepat(i)}%
</td>

</tr>

`

})

let html=`

<h1>
${modoResumoSepat==='item'
?'ITENS - RESUMO EXECUTIVO TAG SEPAT 2026'
:'SUBITENS - RESUMO EXECUTIVO TAG SEPAT 2026'}
</h1>

<table>

<tr>

<th>
${modoResumoSepat==='item'
?'ITEM'
:'SUBITEM'}
</th>

<th>
${modoResumoSepat==='item'
?'DESCRIÇÃO ITEM'
:'DESCRIÇÃO'}
</th>

<th>
PRODUTO
</th>

<th>
%
</th>

</tr>

${linhas}

</table>

<p class="small">
As informações constantes neste relatório possuem caráter preliminar e dependem de validação técnica documental.
</p>

`

baixarWordSepat(
modoResumoSepat==='item'
?'Itens_Resumo_TAG_SEPAT_2026'
:'Subitens_Resumo_TAG_SEPAT_2026',
html
)

}

/*=========================================================
053 WORD MONITORAMENTO
=========================================================*/
function gerarWordMonitoramentoSepat(){

let lista=[...(sepatData||[])].sort(compareSepat)

let linhas=''

lista.forEach(i=>{

linhas+=`

<tr>

<td>
${modoTabelaSepat==='item'
?(i.item||'-')
:(i.siglaitem||'-')}
</td>

<td>
${modoTabelaSepat==='item'
?(i.descricaoitem||'-')
:(i.subitem||'-')}
</td>

<td>
${i.produto||'-'}
</td>

<td>
${i.cargo||'-'}
</td>

<td align="center">
${getTotalSepat(i)}%
</td>

</tr>

`

})

let html=`

<h1>
MONITORAMENTO COMPLETO - TAG SEPAT 2026
</h1>

<table>

<tr>

<th>
${modoTabelaSepat==='item'
?'ITEM'
:'SUBITEM'}
</th>

<th>
${modoTabelaSepat==='item'
?'DESCRIÇÃO ITEM'
:'DESCRIÇÃO'}
</th>

<th>
PRODUTO
</th>

<th>
RESPONSÁVEL
</th>

<th>
TOTAL
</th>

</tr>

${linhas}

</table>

<p class="small">
Relatório consolidado de acompanhamento técnico da TAG SEPAT 2026.
</p>

`

baixarWordSepat(
modoTabelaSepat==='item'
?'Itens_Monitoramento_TAG_SEPAT_2026'
:'Subitens_Monitoramento_TAG_SEPAT_2026',
html
)

}

/*=========================================================
055 WORD CONCLUIDOS
=========================================================*/
function gerarWordConcluidosSepat(){

let lista=[...(sepatData||[])]
.filter(i=>getTotalSepat(i)>=100)
.sort(compareSepat)

let linhas=''

lista.forEach(i=>{

linhas+=`

<tr>

<td>
${i.siglaitem||'-'}
</td>

<td>
${i.subitem||'-'}
</td>

<td>
${i.descricaoitem||'-'}
</td>

<td>
${i.produto||'-'}
</td>

<td align="center">
100%
</td>

</tr>

`

})

let html=`

<h1>
SUBITENS 100% CUMPRIDOS - TAG SEPAT 2026
</h1>

<table>

<tr>

<th>ITEM</th>
<th>SUBITEM</th>
<th>DESCRIÇÃO</th>
<th>PRODUTO</th>
<th>%</th>

</tr>

${linhas}

</table>

<p class="small">
Relatório consolidado dos subitens integralmente cumpridos da TAG SEPAT 2026.
</p>

`

baixarWordSepat(
'Subitens_100_Cumpridos_TAG_SEPAT_2026',
html
)

}
/*=========================================================
056 WORD GRAFICOS
=========================================================*/
function gerarWordGraficosSepat(){

let desc=document.getElementById('descGraficoSepat')?.innerText||'-'

let itemSelecionado=document.getElementById('filtroItemSepat')?.value||'todos'

let subSelecionado=document.getElementById('filtroSubitemSepat')?.value||'TOTAL'

let html=`

<h1>
ANÁLISE GRÁFICA - TAG SEPAT 2026
</h1>

<p>
Relatório consolidado de análise gráfica e evolução estratégica da TAG SEPAT 2026.
</p>

<table>

<tr>
<th>Filtro</th>
<th>Informação</th>
</tr>

<tr>
<td>Item Selecionado</td>
<td>${itemSelecionado}</td>
</tr>

<tr>
<td>Subitem Selecionado</td>
<td>${subSelecionado}</td>
</tr>

<tr>
<td>Descrição Consolidada</td>
<td>${desc}</td>
</tr>

</table>

<p class="small">
Os dados apresentados possuem caráter preliminar e dependem de validação técnica documental.
</p>

`

baixarWordSepat(
'Graficos_TAG_SEPAT_2026',
html
)

}
/*=========================================================
057 EXPORTAR TODOS PDF
=========================================================*/
async function exportarTodosPDFSepat(){

await gerarPDFDashboardSepat()

await gerarPDFResumoSepat()

await gerarPDFMonitoramentoSepat()

await gerarPDFGraficosSepat()

await gerarPDFConcluidosSepat()

}
/*=========================================================
058 EXPORTAR TODOS WORD
=========================================================*/
async function exportarTodosWordSepat(){

gerarWordDashboardSepat()

gerarWordResumoSepat()

gerarWordMonitoramentoSepat()

gerarWordGraficosSepat()

gerarWordConcluidosSepat()

}
/*=========================================================
059 FORMATAR PERCENTUAL
=========================================================*/
function formatarPercentualSepat(v){

v=Number(v||0)

if(isNaN(v))v=0

return parseInt(v)+'%'

}
/*=========================================================
060 FORMATAR TEXTO
=========================================================*/
function formatarTextoSepat(v){

return String(v||'-')
.trim()

}
/*=========================================================
061 FORMATAR SETOR
=========================================================*/
function formatarSetorSepat(i){

return String(
i.cargo||
i.setor||
i.coordenadoria||
'-'
)

}
/*=========================================================
062 FORMATAR PRODUTO
=========================================================*/
function formatarProdutoSepat(i){

return String(
i.produto||
'-'
)

}
/*=========================================================
063 FORMATAR ITEM
=========================================================*/
function formatarItemSepat(i){

return String(
i.item||
i.siglaitem||
'-'
)

}
/*=========================================================
064 FORMATAR SUBITEM
=========================================================*/
function formatarSubitemSepat(i){

return String(
i.subitem||
'-'
)

}
/*=========================================================
065 FORMATAR DESCRICAO
=========================================================*/
function formatarDescricaoSepat(i){

return String(
i.descricaoitem||
i.subitem||
'-'
)

}
/*=========================================================
066 LIMPAR CACHE LOCAL
=========================================================*/
function limparCacheSepat(){

localStorage.removeItem('sepatUser')

localStorage.removeItem('sepat_tab')

alert('Cache local removido com sucesso.')

location.reload()

}
/*=========================================================
067 RECARREGAR DADOS
=========================================================*/
async function recarregarDadosSepat(){

await carregarSepatDados()

renderDashboardSepat()

renderResumoSepat()

renderTabelaSepat()

renderConcluidosSepat()

popularItensSepat()

popularSubitensSepat()

renderGraficoMasterSepat()

}
/*=========================================================
068 FECHAR MODAL AO CLICAR FORA
=========================================================*/
window.addEventListener('click',e=>{

let modal=document.getElementById('modalSepat')

if(
modal&&
e.target===modal
){
fecharModalSepat()
}

})
/*=========================================================
069 ENTER LOGIN
=========================================================*/
window.addEventListener('keydown',e=>{

if(e.key==='Enter'){

let login=document.getElementById('login-sepat')

if(
login&&
!login.classList.contains('hidden')
){
loginSepat()
}

}

})
/*=========================================================
070 AUTO INIT
=========================================================*/
async function initSepat(){

try{

await carregarSepatDados()

renderDashboardSepat()

renderResumoSepat()

renderTabelaSepat()

renderConcluidosSepat()

popularItensSepat()

popularSubitensSepat()

renderGraficoMasterSepat()

}catch(e){

console.log(e)

}

}
/*=========================================================
071 FILTROS AUTOMATICOS
=========================================================*/
function aplicarFiltrosSepat(){

renderResumoSepat()

renderTabelaSepat()

renderConcluidosSepat()

renderDashboardSepat()

}
/*=========================================================
072 RESET FILTROS
=========================================================*/
function resetarFiltrosSepat(){

let busca=document.getElementById('buscaMonitoramentoSepat')

if(busca){
busca.value=''
}

let ocultar1=document.getElementById('ocultar100Sepat')

if(ocultar1){
ocultar1.checked=false
}

let ocultar2=document.getElementById('ocultar100ResumoSepat')

if(ocultar2){
ocultar2.checked=false
}

renderResumoSepat()

renderTabelaSepat()

renderConcluidosSepat()

}
/*=========================================================
073 TOTALIZADORES
=========================================================*/
function obterTotaisSepat(){

let lista=[...(sepatData||[])]

return{

itens:[...new Set(
lista.map(i=>String(i.siglaitem||'').trim())
.filter(Boolean)
)].length,

subitens:lista.length,

produtos:[...new Set(
lista.map(i=>String(i.produto||'').trim())
.filter(Boolean)
)].length,

concluidos:lista.filter(i=>getTotalSepat(i)>=100).length,

media:calcularMediaSepat(lista)

}

}
/*=========================================================
074 KPI MINI UPDATE
=========================================================*/
function atualizarKPIsDashboardSepat(){

let t=obterTotaisSepat()

let itens=document.getElementById('kpiItensSepat')
let subitens=document.getElementById('kpiSubitensSepat')
let produtos=document.getElementById('kpiProdutosSepat')
let media=document.getElementById('kpiMediaSepat')

if(itens)itens.innerText=t.itens
if(subitens)subitens.innerText=t.subitens
if(produtos)produtos.innerText=t.produtos
if(media){
media.innerText=calcularMediaSepat(sepatData)+'%'
}
}
/*=========================================================
075 VALIDAR NUMERO
=========================================================*/
function validarNumeroSepat(v){

v=Number(v||0)

if(isNaN(v))v=0

if(v<0)v=0

if(v>100)v=100

return v
}
/*=========================================================
076 ATUALIZAR TODOS OS PAINEIS
=========================================================*/
function atualizarTodosPaineisSepat(){
renderDashboardSepat()
renderResumoSepat()
renderTabelaSepat()
renderConcluidosSepat()
popularItensSepat()
popularSubitensSepat()
renderGraficoMasterSepat()
atualizarMiniKPIsSepat()
atualizarKPIsDashboardSepat()
controlarMesesSepat()
}
/*=========================================================
077 ORDENAR LISTA
=========================================================*/
function ordenarListaSepat(lista){
return[...(lista||[])].sort(compareSepat)
}
/*=========================================================
078 FILTRAR 100
=========================================================*/
function filtrar100Sepat(lista){
return[...(lista||[])].filter(i=>getTotalSepat(i)>=100)
}
/*=========================================================
079 FILTRAR PENDENTES
=========================================================*/
function filtrarPendentesSepat(lista){
return[...(lista||[])].filter(i=>getTotalSepat(i)<=0)
}
/*=========================================================
080 FILTRAR ANDAMENTO
=========================================================*/
function filtrarAndamentoSepat(lista){
return[...(lista||[])].filter(i=>getTotalSepat(i)>0&&getTotalSepat(i)<100)
}
/*=========================================================
081 TOTAL MEDIO
=========================================================*/
function calcularMediaSepat(lista){
lista=[...(lista||[])]
if(!lista.length)return 0
let soma=0
lista.forEach(i=>{
soma+=getTotalSepat(i)
})
return Math.round(soma/lista.length)
}
/*=========================================================
082 EXPORTAR JSON
=========================================================*/
function exportarJSONSepat(){
let lista=[...(sepatData||[])]
let blob=new Blob([JSON.stringify(lista,null,2)],{type:'application/json'})
let a=document.createElement('a')
a.href=URL.createObjectURL(blob)
a.download='tag_sepat_2026.json'
a.click()
}
/*=========================================================
083 EXPORTAR CSV
=========================================================*/
function exportarCSVSepat(){
let lista=[...(sepatData||[])]
let cab=['ITEM','SUBITEM','DESCRICAO','PRODUTO','TOTAL']
let linhas=lista.map(i=>[
`"${i.siglaitem||''}"`,
`"${i.subitem||''}"`,
`"${String(i.descricaoitem||'').replace(/"/g,'')}"`,
`"${String(i.produto||'').replace(/"/g,'')}"`,
`"${getTotalSepat(i)}%"`
].join(';'))
let csv=[cab.join(';'),...linhas].join('\n')
let blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'})
let a=document.createElement('a')
a.href=URL.createObjectURL(blob)
a.download='tag_sepat_2026.csv'
a.click()
}
/*=========================================================
084 GERAR BACKUP COMPLETO
=========================================================*/
async function gerarBackupCompletoSepat(){
await backupSepat()
exportarCSVSepat()
exportarJSONSepat()
}
/*=========================================================
085 STATUS CLASSE
=========================================================*/
function obterStatusClasseSepat(v){
v=Number(v||0)
if(v>=100)return'status-verde'
if(v>0&&v<100)return'status-amarelo'
return'status-vermelho'
}
/*=========================================================
086 STATUS TEXTO
=========================================================*/
function obterStatusTextoSepat(v){
v=Number(v||0)
if(v>=100)return'100% CUMPRIDO'
if(v>0&&v<100)return'EM EXECUÇÃO'
return'PENDENTE'
}
/*=========================================================
087 GERAR RESUMO EXECUTIVO
=========================================================*/
function gerarResumoExecutivoSepat(){
let lista=[...(sepatData||[])]
let totais=obterTotaisSepat()
return`Painel consolidado TAG SEPAT 2026.
Itens Estratégicos:
${totais.itens}
Subitens Monitorados:
${totais.subitens}
Produtos Estratégicos:
${totais.produtos}
Subitens 100% Cumpridos:
${totais.concluidos}
Média Geral Consolidada:
${totais.media}%`
}
/*=========================================================
088 COPIAR RESUMO
=========================================================*/
async function copiarResumoSepat(){
let texto=gerarResumoExecutivoSepat()
try{
await navigator.clipboard.writeText(texto)
alert('Resumo copiado com sucesso.')
}catch(e){
console.log(e)
alert('Erro ao copiar resumo.')
}
}
/*=========================================================
089 GERAR HTML RELATORIO
=========================================================*/
function gerarHTMLRelatorioSepat(){
let resumo=gerarResumoExecutivoSepat()
return`
<div style="font-family:Calibri,Arial,sans-serif;font-size:12pt;line-height:1.5;color:#111827;">
<h1 style="font-size:18pt;font-weight:700;color:#0f172a;">
RELATÓRIO EXECUTIVO - TAG SEPAT 2026
</h1>
<p style="white-space:pre-line;">
${resumo}
</p>
</div>
`
}
/*=========================================================
090 IMPRIMIR RELATORIO
=========================================================*/
function imprimirRelatorioSepat(){
let html=gerarHTMLRelatorioSepat()
let w=window.open('','_blank')
w.document.write(html)
w.document.close()
w.focus()
w.print()
}
/*=========================================================
091 VALIDAR LOGIN
=========================================================*/
function validarLoginSepat(){
if(!sepatUser){
alert('Sessão inválida.')
logoutSepat()
return false
}
return true
}
/*=========================================================
092 VALIDAR ADMIN
=========================================================*/
function validarAdminSepat(){
if(!sepatUser||Number(sepatUser.nivel_acesso||99)!==1){
alert('Acesso restrito.')
return false
}
return true
}
/*=========================================================
093 CONTAR CONCLUIDOS
=========================================================*/
function contarConcluidosSepat(){
return(sepatData||[]).filter(i=>getTotalSepat(i)>=100).length
}
/*=========================================================
094 CONTAR PENDENTES
=========================================================*/
function contarPendentesSepat(){
return(sepatData||[]).filter(i=>getTotalSepat(i)<=0).length
}
/*=========================================================
095 CONTAR ANDAMENTO
=========================================================*/
function contarAndamentoSepat(){
return(sepatData||[]).filter(i=>getTotalSepat(i)>0&&getTotalSepat(i)<100).length
}
/*=========================================================
096 OBTER DATA ATUAL
=========================================================*/
function obterDataAtualSepat(){
let d=new Date()
let dia=String(d.getDate()).padStart(2,'0')
let mes=String(d.getMonth()+1).padStart(2,'0')
let ano=d.getFullYear()
return`${dia}/${mes}/${ano}`
}
/*=========================================================
097 GERAR TITULO PDF
=========================================================*/
function gerarTituloPDFSepat(titulo){
return titulo+' • TAG SEPAT 2026'
}
/*=========================================================
098 GERAR TITULO WORD
=========================================================*/
function gerarTituloWordSepat(titulo){
return titulo+' - TAG SEPAT 2026'
}
/*=========================================================
099 PREPARAR EXPORTACAO
=========================================================*/
function prepararExportacaoSepat(){
let data=obterDataAtualSepat()
return{
data:data,
usuario:sepatUser?.nome_completo||'-',
origem:sepatUser?.origem||'SEPAT'
}
}
/*=========================================================
100 FINALIZAR SISTEMA
=========================================================*/
console.log('TAG SEPAT 2026 • Sistema carregado com sucesso.')
/*=========================================================
101 OCULTAR COLUNA INDIVIDUAL
=========================================================*/
function ocultarColunaMesSepat(mes){
let ocultas=JSON.parse(
localStorage.getItem('sepatColunasOcultas')||'[]'
)
if(!ocultas.includes(mes)){
ocultas.push(mes)
}
localStorage.setItem(
'sepatColunasOcultas',
JSON.stringify(ocultas)
)
document.querySelectorAll('.mes-'+mes).forEach(el=>{
el.style.display='none'
})
}
/*=========================================================
102 RESTAURAR COLUNAS
=========================================================*/
function restaurarColunasMesesSepat(){
localStorage.removeItem('sepatColunasOcultas')
document.querySelectorAll(
'.mes-jan,.mes-fev,.mes-mar,.mes-abr,.mes-mai,.mes-jun,.mes-jul,.mes-ago,.mes-set,.mes-out,.mes-nov,.mes-dez'
).forEach(el=>{
el.style.display=''
})
controlarMesesSepat()
}
