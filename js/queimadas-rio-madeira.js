/*=========================================================
001 RIO MADEIRA • CONFIGURAÇÃO
TCE-RO • ESTAÇÃO 15400000 • PORTO VELHO
=========================================================*/
let RM_DADOS=[]
let RM_CICLOS=[]
let RM_CHEIAS=[]
let RM_SECAS=[]
let RM_CURVA=[]
let RM_GRAFICO_HISTORICO=null
let RM_GRAFICO_EXTREMOS=null
let RM_CARREGADO=false
/*=========================================================
002 UTILITÁRIOS
=========================================================*/
function rmCliente(){
return window.client||window.supabaseClient||null
}
function rmNumero(v){
if(v===null||v===undefined||v==='')return null
let n=Number(v)
return Number.isFinite(n)?n:null
}
function rmCmParaMetros(v){
let n=rmNumero(v)
return n===null?null:n/100
}
function rmMetros(v,d=2){
let n=rmNumero(v)
return n===null?'—':`${n.toFixed(d).replace('.',',')} m`
}
function rmCentimetros(v,d=0){
let n=rmNumero(v)
return n===null?'—':`${n.toFixed(d).replace('.',',')} cm`
}
function rmDataBR(v){
if(!v)return'—'
let p=String(v).slice(0,10).split('-')
return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:String(v)
}
function rmDataISO(v){
if(!v)return''
return String(v).slice(0,10)
}
function rmCicloMaisRecente(){
if(!RM_CICLOS.length)return''
return[...RM_CICLOS]
.sort((a,b)=>String(b.ciclo_hidrologico).localeCompare(String(a.ciclo_hidrologico)))[0]?.ciclo_hidrologico||''
}
function rmCorSituacao(nivel,media,p10,p90){
if(nivel===null)return{texto:'SEM DADOS',classe:'rmNeutro'}
if(p10!==null&&nivel<=p10)return{texto:'MUITO ABAIXO DO PADRÃO HISTÓRICO',classe:'rmSeca'}
if(p90!==null&&nivel>=p90)return{texto:'MUITO ACIMA DO PADRÃO HISTÓRICO',classe:'rmCheia'}
if(media!==null&&nivel<media)return{texto:'ABAIXO DA MÉDIA HISTÓRICA',classe:'rmAtencao'}
return{texto:'DENTRO/ACIMA DA MÉDIA HISTÓRICA',classe:'rmNormal'}
}
function rmEscaparHTML(valor){
return String(valor??'')
.replaceAll('&','&amp;')
.replaceAll('<','&lt;')
.replaceAll('>','&gt;')
.replaceAll('"','&quot;')
.replaceAll("'","&#039;")
}
/*=========================================================
003 CARREGAR DADOS DO SUPABASE
=========================================================*/
async function carregarRioMadeira(forcar=false){
let client=rmCliente()
if(!client){
console.error('Rio Madeira: cliente Supabase não encontrado.')
return
}
if(RM_CARREGADO&&!forcar){
alterarCicloRioMadeira()
return
}
try{
let[r1,r2,r3,r4,r5]=await Promise.all([
client
.from('rio_madeira_niveis')
.select('data,ciclo_hidrologico,ano_inicio_ciclo,mes,dia,dia_ciclo,nivel_cm,nivel_m')
.order('data',{ascending:true}),
client
.from('vw_rio_madeira_ciclos')
.select('*')
.order('data_inicio',{ascending:true}),
client
.from('vw_rio_madeira_ranking_cheias')
.select('*')
.order('nivel_cm',{ascending:false}),
client
.from('vw_rio_madeira_ranking_secas')
.select('*')
.order('nivel_cm',{ascending:true}),
client
.from('vw_rio_madeira_curva_historica')
.select('*')
.order('dia_ciclo',{ascending:true})
])
if(r1.error)throw r1.error
if(r2.error)throw r2.error
if(r3.error)throw r3.error
if(r4.error)throw r4.error
if(r5.error)throw r5.error
RM_DADOS=r1.data||[]
RM_CICLOS=r2.data||[]
RM_CHEIAS=r3.data||[]
RM_SECAS=r4.data||[]
RM_CURVA=r5.data||[]
RM_CARREGADO=true
preencherFiltrosRioMadeira()
renderKPIsRioMadeira()
renderRankingRioMadeira()
renderSituacaoRioMadeira()
renderExtremosRioMadeira()
renderGraficoRioMadeiraHistorico()
renderGraficoRioMadeiraExtremos()
renderTabelaRioMadeira()
}catch(e){
console.error('Erro ao carregar Rio Madeira:',e)
RM_CARREGADO=false
let box=document.getElementById('painelRioMadeiraSituacao')
if(box){
box.innerHTML=`<div class="alerta-vermelho">Erro ao carregar dados do Rio Madeira: ${rmEscaparHTML(e?.message||e)}</div>`
}
}
}
/*=========================================================
004 PREENCHER FILTROS
=========================================================*/
function preencherFiltrosRioMadeira(){
let ciclos=[
...new Set(
RM_CICLOS
.map(x=>x.ciclo_hidrologico)
.filter(Boolean)
)
].sort((a,b)=>String(b).localeCompare(String(a)))
let atual=document.getElementById('rmCicloAtual')
let comp=document.getElementById('rmCicloComparacao')
let tab=document.getElementById('rmFiltroCicloTabela')
let selecionado=atual?.value
if(!ciclos.includes(selecionado)){
selecionado=rmCicloMaisRecente()
}
if(atual){
atual.innerHTML=ciclos.map(c=>`
<option value="${rmEscaparHTML(c)}"${c===selecionado?' selected':''}>
CICLO ${rmEscaparHTML(c)}
</option>
`).join('')
}
if(comp){
let valor=comp.value
comp.innerHTML=`
<option value="">COMPARAR COM...</option>
${ciclos
.filter(c=>c!==selecionado)
.map(c=>`<option value="${rmEscaparHTML(c)}">${rmEscaparHTML(c)}</option>`)
.join('')}
`
if(ciclos.includes(valor)&&valor!==selecionado){
comp.value=valor
}
}
if(tab){
let valor=tab.value
if(!ciclos.includes(valor)){
valor=selecionado
}
tab.innerHTML=ciclos.map(c=>`
<option value="${rmEscaparHTML(c)}"${c===valor?' selected':''}>
${rmEscaparHTML(c)}
</option>
`).join('')
}
}
/*=========================================================
005 ALTERAR CICLO SEM NOVA CONSULTA AO SUPABASE
=========================================================*/
function alterarCicloRioMadeira(){
if(!RM_CARREGADO)return
let ciclo=document.getElementById('rmCicloAtual')?.value||rmCicloMaisRecente()
let comp=document.getElementById('rmCicloComparacao')
if(comp){
let valorAnterior=comp.value
let ciclos=[
...new Set(
RM_CICLOS
.map(x=>x.ciclo_hidrologico)
.filter(Boolean)
)
].sort((a,b)=>String(b).localeCompare(String(a)))
comp.innerHTML=`
<option value="">COMPARAR COM...</option>
${ciclos
.filter(c=>c!==ciclo)
.map(c=>`<option value="${rmEscaparHTML(c)}">${rmEscaparHTML(c)}</option>`)
.join('')}
`
if(valorAnterior&&valorAnterior!==ciclo&&ciclos.includes(valorAnterior)){
comp.value=valorAnterior
}
}
let tab=document.getElementById('rmFiltroCicloTabela')
if(tab&&[...tab.options].some(o=>o.value===ciclo)){
tab.value=ciclo
}
renderSituacaoRioMadeira()
renderGraficoRioMadeiraHistorico()
renderTabelaRioMadeira()
}
/*=========================================================
006 KPIS PRINCIPAIS
=========================================================*/
function renderKPIsRioMadeira(){
let dados=[...RM_DADOS]
.filter(x=>x.data)
.sort((a,b)=>String(a.data).localeCompare(String(b.data)))
let ultimo=dados[dados.length-1]||null
let nivelAtual=rmNumero(ultimo?.nivel_m)
let anterior24h=null
if(ultimo?.data){
let dataUltimo=new Date(`${rmDataISO(ultimo.data)}T12:00:00`)
let dataAnterior=new Date(dataUltimo)
dataAnterior.setDate(dataAnterior.getDate()-1)
let isoAnterior=[
dataAnterior.getFullYear(),
String(dataAnterior.getMonth()+1).padStart(2,'0'),
String(dataAnterior.getDate()).padStart(2,'0')
].join('-')
anterior24h=dados.find(x=>rmDataISO(x.data)===isoAnterior)||null
}
let nivelAnterior=rmNumero(anterior24h?.nivel_m)
let variacao=
nivelAtual!==null&&nivelAnterior!==null
?nivelAtual-nivelAnterior
:null
let cheia=RM_CHEIAS[0]||null
let seca=RM_SECAS[0]||null
let el=document.getElementById('rmNivelAtual')
if(el){
el.innerHTML=`
${rmMetros(nivelAtual)}
<small class="rmKpiData">${rmDataBR(ultimo?.data)}</small>
`
}
el=document.getElementById('rmVariacao24h')
if(el){
el.classList.remove('rmSubindo','rmDescendo')
if(variacao===null){
el.textContent='—'
}else{
let sinal=variacao>0?'+':''
el.innerHTML=`
${sinal}${variacao.toFixed(2).replace('.',',')} m
<small class="rmKpiData">últimas 24h</small>
`
if(variacao>0)el.classList.add('rmSubindo')
if(variacao<0)el.classList.add('rmDescendo')
}
}
el=document.getElementById('rmCheiaHistorica')
if(el){
el.innerHTML=`
${rmMetros(rmNumero(cheia?.nivel_m))}
<small class="rmKpiData">${rmDataBR(cheia?.data)}</small>
`
}
el=document.getElementById('rmSecaHistorica')
if(el){
el.innerHTML=`
${rmMetros(rmNumero(seca?.nivel_m),3)}
<small class="rmKpiData">${rmDataBR(seca?.data)}</small>
`
}
el=document.getElementById('rmCiclosHistoricos')
if(el){
el.textContent=RM_CICLOS.length
}
}
/*=========================================================
007 RANKING DE CHEIAS E SECAS
=========================================================*/
function renderRankingRioMadeira(){
let cheias=document.getElementById('painelRioMadeiraCheias')
let secas=document.getElementById('painelRioMadeiraSecas')
if(cheias){
let lista=RM_CHEIAS.slice(0,10)
cheias.innerHTML=`
<div class="tabelaMunicipiosWrap">
<table class="tabelaMunicipios">
<thead>
<tr>
<th>#</th>
<th>CICLO</th>
<th>DATA</th>
<th>NÍVEL</th>
</tr>
</thead>
<tbody>
${lista.map((x,i)=>`
<tr>
<td><b>${i+1}</b></td>
<td>${rmEscaparHTML(x.ciclo_hidrologico||'—')}</td>
<td>${rmDataBR(x.data)}</td>
<td><b>${rmMetros(rmNumero(x.nivel_m))}</b></td>
</tr>
`).join('')}
</tbody>
</table>
</div>
`
}
if(secas){
let lista=RM_SECAS.slice(0,10)
secas.innerHTML=`
<div class="tabelaMunicipiosWrap">
<table class="tabelaMunicipios">
<thead>
<tr>
<th>#</th>
<th>CICLO</th>
<th>DATA</th>
<th>NÍVEL</th>
</tr>
</thead>
<tbody>
${lista.map((x,i)=>`
<tr>
<td><b>${i+1}</b></td>
<td>${rmEscaparHTML(x.ciclo_hidrologico||'—')}</td>
<td>${rmDataBR(x.data)}</td>
<td><b>${rmMetros(rmNumero(x.nivel_m),3)}</b></td>
</tr>
`).join('')}
</tbody>
</table>
</div>
`
}
}
/*=========================================================
008 SITUAÇÃO DO CICLO
=========================================================*/
function renderSituacaoRioMadeira(){
let box=document.getElementById('painelRioMadeiraSituacao')
if(!box)return
let ciclo=document.getElementById('rmCicloAtual')?.value||rmCicloMaisRecente()
let dados=RM_DADOS
.filter(x=>x.ciclo_hidrologico===ciclo)
.sort((a,b)=>String(a.data).localeCompare(String(b.data)))
let ultimo=dados[dados.length-1]
if(!ultimo){
box.innerHTML=`
<div class="rioMadeiraAguardando">
Sem dados para o ciclo selecionado.
</div>
`
return
}
let hist=RM_CURVA.find(x=>
Number(x.dia_ciclo)===Number(ultimo.dia_ciclo)
)
let nivel=rmNumero(ultimo.nivel_cm)
let media=rmNumero(hist?.media_cm)
let p10=rmNumero(hist?.p10_cm)
let p90=rmNumero(hist?.p90_cm)
let situacao=rmCorSituacao(
nivel,
media,
p10,
p90
)
let diferenca=
nivel!==null&&media!==null
?(nivel-media)/100
:null
box.innerHTML=`
<div class="rmSituacao ${situacao.classe}">
<div class="rmSituacaoTitulo">
${situacao.texto}
</div>
<div class="rmSituacaoNivel">
${rmMetros(rmNumero(ultimo.nivel_m))}
</div>
<div class="rmSituacaoData">
${rmDataBR(ultimo.data)} • ciclo ${rmEscaparHTML(ciclo)}
</div>
</div>
<div class="rmResumoGrid">
<div>
<span>Média histórica do dia</span>
<b>${rmMetros(rmCmParaMetros(media))}</b>
</div>
<div>
<span>P10 histórico</span>
<b>${rmMetros(rmCmParaMetros(p10))}</b>
</div>
<div>
<span>P90 histórico</span>
<b>${rmMetros(rmCmParaMetros(p90))}</b>
</div>
<div>
<span>Diferença da média</span>
<b>
${diferenca===null
?'—'
:`${diferenca>0?'+':''}${diferenca.toFixed(2).replace('.',',')} m`}
</b>
</div>
</div>
`
}
/*=========================================================
009 EXTREMOS HISTÓRICOS
=========================================================*/
function renderExtremosRioMadeira(){
let box=document.getElementById('painelRioMadeiraExtremos')
if(!box)return
let cheia=RM_CHEIAS[0]||null
let seca=RM_SECAS[0]||null
let dadosOrdenados=[...RM_DADOS]
.filter(x=>x.data)
.sort((a,b)=>String(a.data).localeCompare(String(b.data)))
let primeiraData=dadosOrdenados[0]?.data
let ultimaData=dadosOrdenados[dadosOrdenados.length-1]?.data
box.innerHTML=`
<div class="rmExtremosGrid">
<div class="rmExtremoCard">
<span>🌊 CHEIA RECORDE</span>
<strong>${rmMetros(rmNumero(cheia?.nivel_m))}</strong>
<small>
${rmDataBR(cheia?.data)} •
${rmEscaparHTML(cheia?.ciclo_hidrologico||'—')}
</small>
</div>
<div class="rmExtremoCard">
<span>🏜️ SECA RECORDE</span>
<strong>${rmMetros(rmNumero(seca?.nivel_m),3)}</strong>
<small>
${rmDataBR(seca?.data)} •
${rmEscaparHTML(seca?.ciclo_hidrologico||'—')}
</small>
</div>
<div class="rmExtremoCard">
<span>📚 SÉRIE HISTÓRICA</span>
<strong>${RM_CICLOS.length} ciclos</strong>
<small>
${rmDataBR(primeiraData)} a ${rmDataBR(ultimaData)}
</small>
</div>
<div class="rmExtremoCard">
<span>📍 ESTAÇÃO</span>
<strong>15400000</strong>
<small>Porto Velho • Rio Madeira</small>
</div>
</div>
`
}
/*=========================================================
010 GRÁFICO CICLO × HISTÓRICO
=========================================================*/
function renderGraficoRioMadeiraHistorico(){
let canvas=document.getElementById('graficoRioMadeiraHistorico')
if(!canvas||typeof Chart==='undefined')return
let ciclo=document.getElementById('rmCicloAtual')?.value||rmCicloMaisRecente()
let comparacao=document.getElementById('rmCicloComparacao')?.value||''
let atual=RM_DADOS.filter(x=>x.ciclo_hidrologico===ciclo)
let comp=comparacao
?RM_DADOS.filter(x=>x.ciclo_hidrologico===comparacao)
:[]
let mapaAtual=new Map(
atual.map(x=>[
Number(x.dia_ciclo),
rmNumero(x.nivel_m)
])
)
let mapaComp=new Map(
comp.map(x=>[
Number(x.dia_ciclo),
rmNumero(x.nivel_m)
])
)
let labels=RM_CURVA.map(x=>Number(x.dia_ciclo))
let datasets=[
{
label:`Ciclo ${ciclo}`,
data:labels.map(d=>mapaAtual.get(d)??null),
borderWidth:3,
pointRadius:0,
tension:.18,
spanGaps:false
},
{
label:'Mediana histórica',
data:RM_CURVA.map(x=>rmCmParaMetros(x.mediana_cm)),
borderWidth:2,
pointRadius:0,
tension:.18,
spanGaps:false
},
{
label:'P10 histórico',
data:RM_CURVA.map(x=>rmCmParaMetros(x.p10_cm)),
borderWidth:1,
pointRadius:0,
borderDash:[5,5],
spanGaps:false
},
{
label:'P90 histórico',
data:RM_CURVA.map(x=>rmCmParaMetros(x.p90_cm)),
borderWidth:1,
pointRadius:0,
borderDash:[5,5],
spanGaps:false
}
]
if(comparacao){
datasets.splice(1,0,{
label:`Ciclo ${comparacao}`,
data:labels.map(d=>mapaComp.get(d)??null),
borderWidth:2,
pointRadius:0,
tension:.18,
spanGaps:false
})
}
if(RM_GRAFICO_HISTORICO){
RM_GRAFICO_HISTORICO.destroy()
}
RM_GRAFICO_HISTORICO=new Chart(canvas,{
type:'line',
data:{
labels,
datasets
},
options:{
responsive:true,
maintainAspectRatio:false,
interaction:{
mode:'index',
intersect:false
},
plugins:{
datalabels:{
display:false
},
legend:{
position:'top'
},
tooltip:{
callbacks:{
title:it=>`Dia do ciclo: ${it[0]?.label||''}`,
label:ctx=>{
let y=ctx.parsed.y
return`${ctx.dataset.label}: ${y===null?'—':y.toFixed(2).replace('.',',')+' m'}`
}
}
}
},
scales:{
x:{
title:{
display:true,
text:'Dia do ciclo hidrológico'
}
},
y:{
title:{
display:true,
text:'Nível (m)'
},
beginAtZero:true
}
}
}
})
}
/*=========================================================
011 COMPARAR CICLOS
=========================================================*/
function renderGraficoRioMadeiraComparacao(){
renderGraficoRioMadeiraHistorico()
}
/*=========================================================
012 GRÁFICO DE EXTREMOS POR CICLO
=========================================================*/
function renderGraficoRioMadeiraExtremos(){
let canvas=document.getElementById('graficoRioMadeiraExtremos')
if(!canvas||typeof Chart==='undefined')return
let lista=[...RM_CICLOS]
.filter(x=>x.ciclo_hidrologico)
.sort((a,b)=>
String(a.ciclo_hidrologico)
.localeCompare(String(b.ciclo_hidrologico))
)
if(RM_GRAFICO_EXTREMOS){
RM_GRAFICO_EXTREMOS.destroy()
}
RM_GRAFICO_EXTREMOS=new Chart(canvas,{
type:'line',
data:{
labels:lista.map(x=>x.ciclo_hidrologico),
datasets:[
{
label:'Máxima do ciclo',
data:lista.map(x=>rmCmParaMetros(x.maximo_cm)),
borderWidth:2,
pointRadius:2,
tension:.15,
spanGaps:false
},
{
label:'Mínima do ciclo',
data:lista.map(x=>rmCmParaMetros(x.minimo_cm)),
borderWidth:2,
pointRadius:2,
tension:.15,
spanGaps:false
}
]
},
options:{
responsive:true,
maintainAspectRatio:false,
interaction:{
mode:'index',
intersect:false
},
plugins:{
datalabels:{
display:false
},
legend:{
position:'top'
},
tooltip:{
callbacks:{
label:ctx=>{
let y=ctx.parsed.y
return`${ctx.dataset.label}: ${y===null?'—':y.toFixed(2).replace('.',',')} m`
}
}
}
},
scales:{
x:{
ticks:{
maxRotation:70,
minRotation:70
}
},
y:{
title:{
display:true,
text:'Nível (m)'
},
beginAtZero:true
}
}
}
})
}
/*=========================================================
013 TABELA DA SÉRIE HISTÓRICA
=========================================================*/
function renderTabelaRioMadeira(){
let box=document.getElementById('painelTabelaRioMadeira')
if(!box)return
let ciclo=
document.getElementById('rmFiltroCicloTabela')?.value||
document.getElementById('rmCicloAtual')?.value||
rmCicloMaisRecente()
let busca=(
document.getElementById('rmBuscaTabela')?.value||''
).trim().toLowerCase()
let lista=RM_DADOS.filter(x=>
x.ciclo_hidrologico===ciclo
)
if(busca){
lista=lista.filter(x=>
rmDataBR(x.data).toLowerCase().includes(busca)||
String(x.data||'').toLowerCase().includes(busca)||
String(x.dia_ciclo??'').includes(busca)
)
}
lista=[...lista].sort((a,b)=>
String(b.data).localeCompare(String(a.data))
)
if(!lista.length){
box.innerHTML=`
<div class="rioMadeiraAguardando">
Nenhum registro encontrado para o ciclo selecionado.
</div>
`
return
}
box.innerHTML=`
<div class="tabelaMunicipiosWrap">
<table class="tabelaMunicipios">
<thead>
<tr>
<th>DATA</th>
<th>CICLO</th>
<th>DIA DO CICLO</th>
<th>NÍVEL CM</th>
<th>NÍVEL M</th>
</tr>
</thead>
<tbody>
${lista.map(x=>`
<tr>
<td>${rmDataBR(x.data)}</td>
<td>${rmEscaparHTML(x.ciclo_hidrologico||'—')}</td>
<td>${x.dia_ciclo??'—'}</td>
<td>${rmCentimetros(x.nivel_cm)}</td>
<td>
<b>${rmMetros(rmNumero(x.nivel_m),3)}</b>
</td>
</tr>
`).join('')}
</tbody>
</table>
</div>
`
}
