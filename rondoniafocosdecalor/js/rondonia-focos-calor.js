const API =
'https://zvtzbiqfwhggysiuiuxh.supabase.co/functions/v1/rondonia-focos-calor'

let mapas = {}
let charts = {}
let rankingMunicipios = []

function fmt(v){
return Number(v || 0)
.toLocaleString('pt-BR')
}

function dataBR(v){

if(!v){
return '—'
}

try{

return new Date(v)
.toLocaleString(
'pt-BR',
{
dateStyle:'short',
timeStyle:'short'
}
)

}catch(e){

return v

}

}

function numeroBR(v,casas=1){

if(
v === null ||
v === undefined ||
v === ''
){
return '—'
}

let n = Number(v)

if(!Number.isFinite(n)){
return '—'
}

return n.toLocaleString(
'pt-BR',
{
minimumFractionDigits:casas,
maximumFractionDigits:casas
}
)

}

async function api(
action,
params={}
){

let query =
new URLSearchParams({
action,
...params
})

let resposta =
await fetch(
`${API}?${query}`
)

let json =
await resposta.json()

if(
!resposta.ok ||
json.ok === false
){

throw new Error(
json.error ||
'Erro ao consultar a API'
)

}

return json

}

function criarKPI(
rotulo,
valor,
nota=''
){

return `
<div class="kpi">

<div class="rotulo">
${rotulo}
</div>

<div class="valor">
${valor}
</div>

<div class="nota">
${nota}
</div>

</div>
`

}

function trocarAba(nome){

document
.querySelectorAll('.aba')
.forEach(x =>
x.classList.remove('ativa')
)

document
.querySelectorAll('.abaBtn')
.forEach(x =>
x.classList.remove('ativa')
)

let aba =
document.getElementById(
`aba-${nome}`
)

if(aba){
aba.classList.add('ativa')
}

let botao =
document.querySelector(
`[data-aba="${nome}"]`
)

if(botao){
botao.classList.add('ativa')
}

setTimeout(
() => {

Object
.values(mapas)
.forEach(
mapa => mapa.invalidateSize()
)

},
120
)

}

document
.querySelectorAll('.abaBtn')
.forEach(
botao => {

botao.onclick = () => {
trocarAba(
botao.dataset.aba
)
}

}
)

function iniciarMapa(
id,
centro,
zoom
){

if(mapas[id]){
return mapas[id]
}

let mapa =
L.map(
id,
{
zoomControl:true
}
)
.setView(
centro,
zoom
)

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
maxZoom:19,
attribution:
'© OpenStreetMap'
}
)
.addTo(mapa)
if(
id === 'mapaExecutivo' ||
id === 'mapaRO'
){

mapa.fitBounds(
[
[-13.70,-66.90],
[-7.90,-59.70]
],
{
padding:[15,15]
}
)

}
mapas[id] = mapa

return mapa

}

function limparCamadas(mapa){

mapa.eachLayer(
camada => {

if(
!(camada instanceof L.TileLayer)
){

mapa.removeLayer(camada)

}

}
)

}

function tamanhoFoco(frp){

let n =
Number(frp || 0)

if(!Number.isFinite(n)){
return 4
}

return Math.max(
3,
Math.min(
11,
3 + Math.sqrt(n) / 4
)
)

}

function corFoco(frp){

let n =
Number(frp || 0)

if(n >= 300){
return '#7f1d1d'
}

if(n >= 150){
return '#dc2626'
}

if(n >= 50){
return '#f97316'
}

if(n >= 10){
return '#f59e0b'
}

return '#facc15'

}

async function carregarStatus(){

try{

let resultado =
await api('status')

let r =
resultado.resumo || {}

let total =
Number(r.focos_total || 0)

document
.getElementById('kpis')
.innerHTML =
[
criarKPI(
'Focos no banco',
fmt(r.focos_total),
'Rondônia'
),

criarKPI(
'Focos hoje',
fmt(r.focos_hoje),
'Dia calendário'
),

criarKPI(
'Últimas 24h',
fmt(r.focos_24h),
'Janela móvel'
),

criarKPI(
'Municípios atingidos',
fmt(r.municipios_atingidos),
'Com detecção'
),

criarKPI(
'Última detecção',
r.ultima_deteccao
?
new Date(
r.ultima_deteccao
)
.toLocaleDateString(
'pt-BR'
)
:
'—',
r.ultima_deteccao
?
new Date(
r.ultima_deteccao
)
.toLocaleTimeString(
'pt-BR'
)
:
'Sem carga'
)
]
.join('')

document
.getElementById(
'tempoRealCards'
)
.innerHTML =
[
criarKPI(
'Hoje',
fmt(r.focos_hoje)
),

criarKPI(
'24 horas',
fmt(r.focos_24h)
),

criarKPI(
'Municípios',
fmt(r.municipios_atingidos)
),

criarKPI(
'Última detecção',
dataBR(
r.ultima_deteccao
)
)
]
.join('')

let status =
document.getElementById(
'statusFonte'
)

if(total > 0){

status.textContent =
'DADOS DISPONÍVEIS'

status.className =
'status statusOk'

}else{

status.textContent =
'AGUARDANDO PROTEGE'

status.className =
'status statusAguardando'

}

document
.getElementById(
'ultimaAtualizacao'
)
.textContent =
r.ultima_atualizacao
?
`Atualizado ${dataBR(
r.ultima_atualizacao
)}`
:
'Banco preparado • sem ingestão'

renderFonte(
resultado
)

}catch(erro){

console.error(
'Erro status:',
erro
)

let status =
document.getElementById(
'statusFonte'
)

status.textContent =
'ERRO DE CONEXÃO'

status.className =
'status statusErro'

}

}

function criarGrafico(
id,
tipo,
labels,
dados,
rotulo
){

let canvas =
document.getElementById(id)

if(!canvas){
return
}

if(charts[id]){
charts[id].destroy()
}

const cores = [
'#ef4444',
'#2563eb',
'#22c55e',
'#f97316',
'#7c3aed',
'#b45309',
'#ec4899',
'#64748b',
'#eab308',
'#38bdf8'
]

let dataset = {
label:rotulo,
data:dados
}

if(tipo === 'bar'){

dataset.backgroundColor =
dados.map(
(_,i) => cores[i % cores.length]
)

dataset.borderColor =
dados.map(
(_,i) => cores[i % cores.length]
)

dataset.borderWidth = 1

}

if(tipo === 'line'){

dataset.borderColor =
'#ef3b2d'

dataset.backgroundColor =
'rgba(239,59,45,.14)'

dataset.pointBackgroundColor =
'#ef3b2d'

dataset.pointBorderColor =
'#ffffff'

dataset.pointRadius = 3

dataset.pointHoverRadius = 5

dataset.borderWidth = 2

dataset.tension = .28

dataset.fill = true

}

if(tipo === 'doughnut'){

dataset.backgroundColor =
dados.map(
(_,i) => cores[i % cores.length]
)

dataset.borderWidth = 2

}

charts[id] =
new Chart(
canvas,
{
type:tipo,

data:{
labels,
datasets:[dataset]
},

options:{
responsive:true,
maintainAspectRatio:false,

plugins:{
legend:{
display:
tipo === 'doughnut'
},

tooltip:{
enabled:true
}
},

scales:
tipo === 'doughnut'
?
{}
:
{
y:{
beginAtZero:true,
grid:{
color:'#e5e7eb'
}
},

x:{
grid:{
display:false
}
}
}

}
}
)

}
async function carregarRanking(){

try{

let resultado =
await api('ranking')

rankingMunicipios =
resultado.data || []

renderTabelaMunicipios(
rankingMunicipios
)

let top =
rankingMunicipios
.slice(0,10)

criarGrafico(
'graficoRanking',
'bar',
top.map(
x => x.municipality
),
top.map(
x => x.focos
),
'Focos'
)

}catch(erro){

console.error(
'Erro ranking:',
erro
)

document
.getElementById(
'tabelaMunicipios'
)
.innerHTML =
`
<div class="vazio">
Não foi possível carregar
o ranking municipal.
</div>
`

}

}

async function carregarEvolucao(){

try{

let resultado =
await api(
'evolucao',
{
days:30
}
)

let dados =
resultado.data || []

let labels =
dados.map(
x => {

let d =
new Date(
`${x.dia}T12:00:00`
)

return d
.toLocaleDateString(
'pt-BR',
{
day:'2-digit',
month:'2-digit'
}
)

}
)

let valores =
dados.map(
x => x.focos
)

criarGrafico(
'graficoEvolucao',
'line',
labels,
valores,
'Focos'
)

}catch(erro){

console.error(
'Erro evolução:',
erro
)

}

}
/* =====================================================
MAPA EXECUTIVO • FUNÇÕES AUXILIARES
===================================================== */

function corQuantidadeFocos(q){

if(q > 50){
return '#dc2626'
}

if(q >= 31){
return '#ef4444'
}

if(q >= 16){
return '#f97316'
}

if(q >= 6){
return '#f59e0b'
}

return '#facc15'

}

function classeQuantidadeFocos(q){

if(q > 50){
return 'clusterFoco clusterCritico'
}

if(q >= 31){
return 'clusterFoco clusterMuitoAlto'
}

if(q >= 16){
return 'clusterFoco clusterAlto'
}

if(q >= 6){
return 'clusterFoco clusterMedio'
}

return 'clusterFoco clusterBaixo'

}

function tamanhoCluster(q){

if(q > 50){
return 52
}

if(q >= 31){
return 46
}

if(q >= 16){
return 40
}

if(q >= 6){
return 34
}

return 28

}

function adicionarLegendaExecutivo(mapa){

if(mapa._legendaRFC){
return
}

let legenda =
L.control({
position:'bottomleft'
})

legenda.onAdd = function(){

let div =
L.DomUtil.create(
'div',
'legendaFocos'
)

div.innerHTML = `

<div class="legendaTitulo">
Focos • Últimas 24h
</div>

<div>
<span
class="legendaBolinha"
style="background:#facc15">
</span>
1 – 5
</div>

<div>
<span
class="legendaBolinha"
style="background:#f59e0b">
</span>
6 – 15
</div>

<div>
<span
class="legendaBolinha"
style="background:#f97316">
</span>
16 – 30
</div>

<div>
<span
class="legendaBolinha"
style="background:#ef4444">
</span>
31 – 50
</div>

<div>
<span
class="legendaBolinha"
style="background:#dc2626">
</span>
+50
</div>

`

return div

}

legenda.addTo(mapa)

mapa._legendaRFC = legenda

}

function agruparFocosMunicipio(dados){

let grupos = {}

dados.forEach(
foco => {

let municipio =
foco.municipality ||
'Não identificado'

let lat =
Number(foco.latitude)

let lng =
Number(foco.longitude)

if(
!Number.isFinite(lat) ||
!Number.isFinite(lng)
){
return
}

if(!grupos[municipio]){

grupos[municipio] = {

municipio,
quantidade:0,
latTotal:0,
lngTotal:0,
frpMaximo:0,
ultima:null

}

}

let g =
grupos[municipio]

g.quantidade++

g.latTotal += lat
g.lngTotal += lng

let frp =
Number(foco.frp || 0)

if(
Number.isFinite(frp) &&
frp > g.frpMaximo
){

g.frpMaximo = frp

}

if(
!g.ultima ||
new Date(foco.detected_at) >
new Date(g.ultima)
){

g.ultima =
foco.detected_at

}

}
)

return Object
.values(grupos)
.map(
g => ({

...g,

latitude:
g.latTotal /
g.quantidade,

longitude:
g.lngTotal /
g.quantidade

})
)

}

function renderMapaExecutivo(dados){

let mapa =
iniciarMapa(
'mapaExecutivo',
[-10.9,-63.3],
6
)

limparCamadas(mapa)

/*
ENQUADRAMENTO FIXO
DO ESTADO DE RONDÔNIA
*/

mapa.fitBounds(
[
[-13.75,-66.95],
[-7.85,-59.65]
],
{
padding:[12,12]
}
)

let grupos =
agruparFocosMunicipio(
dados
)

grupos.forEach(
grupo => {

let tamanho =
tamanhoCluster(
grupo.quantidade
)

let icone =
L.divIcon({

className:'clusterFocoWrapper',

html:`
<div
class="${classeQuantidadeFocos(
grupo.quantidade
)}"
style="
width:${tamanho}px;
height:${tamanho}px
">

${grupo.quantidade}

</div>
`,

iconSize:[
tamanho,
tamanho
],

iconAnchor:[
tamanho/2,
tamanho/2
]

})

L.marker(
[
grupo.latitude,
grupo.longitude
],
{
icon:icone
}
)
.bindPopup(
`
<div class="popupExecutivo">

<strong>
${grupo.municipio}
</strong>

<br>

Focos nas últimas 24h:
<strong>
${fmt(
grupo.quantidade
)}
</strong>

<br>

FRP máximo:
<strong>
${numeroBR(
grupo.frpMaximo,
1
)}
</strong>

<br>

Última detecção:
${dataBR(
grupo.ultima
)}

</div>
`
)
.addTo(mapa)

}
)

adicionarLegendaExecutivo(
mapa
)

setTimeout(
() => mapa.invalidateSize(),
150
)

}
async function carregarMapaRO(
days=7
){

try{

/*
MAPA DETALHADO
+ MAPA EXECUTIVO 24H
*/

let [
resultadoPeriodo,
resultado24h
] =
await Promise.all([

api(
'focos',
{
scope:'RO',
days,
limit:10000
}
),

api(
'focos',
{
scope:'RO',
days:1,
limit:10000
}
)

])

let dados =
resultadoPeriodo.data || []

let dados24h =
resultado24h.data || []

/* =====================================================
MAPA EXECUTIVO
===================================================== */

renderMapaExecutivo(
dados24h
)

/* =====================================================
MAPA RONDÔNIA • FOCOS INDIVIDUAIS
===================================================== */

let mapa =
iniciarMapa(
'mapaRO',
[-10.9,-63.3],
6
)

limparCamadas(
mapa
)

mapa.fitBounds(
[
[-13.75,-66.95],
[-7.85,-59.65]
],
{
padding:[12,12]
}
)

dados.forEach(
foco => {

let latitude =
Number(
foco.latitude
)

let longitude =
Number(
foco.longitude
)

if(
!Number.isFinite(latitude) ||
!Number.isFinite(longitude)
){
return
}

let frp =
Number(
foco.frp || 0
)

let marcador =
L.circleMarker(
[
latitude,
longitude
],
{

radius:
tamanhoFoco(frp),

color:
corFoco(frp),

weight:1,

fillColor:
corFoco(frp),

fillOpacity:.75

}
)

marcador.bindPopup(
`

<div class="popupExecutivo">

<strong>
${foco.municipality ||
'Município não informado'}
</strong>

<br>

${dataBR(
foco.detected_at
)}

<br>

Satélite:
<strong>
${foco.satellite || '—'}
</strong>

<br>

FRP:
<strong>
${numeroBR(
foco.frp,
1
)}
</strong>

<br>

Confiança:
${foco.confidence || '—'}

<br>

Coordenadas:
${latitude.toFixed(4)},
${longitude.toFixed(4)}

</div>

`
)

marcador.addTo(
mapa
)

}
)

/* =====================================================
TEMPO REAL
===================================================== */

renderTempoReal(
dados24h.slice(
0,
100
)
)

setTimeout(
() => mapa.invalidateSize(),
150
)

}catch(erro){

console.error(
'Erro mapa RO:',
erro
)

renderTempoReal([])

}

}

async function carregarAmerica(){

try{

let resultado =
await api(
'focos',
{
scope:'SOUTH_AMERICA',
days:7,
limit:10000
}
)

let dados =
resultado.data || []

let mapa =
iniciarMapa(
'mapaAmerica',
[-15,-60],
4
)

limparCamadas(
mapa
)

dados.forEach(
foco => {

let latitude =
Number(
foco.latitude
)

let longitude =
Number(
foco.longitude
)

if(
!Number.isFinite(latitude) ||
!Number.isFinite(longitude)
){
return
}

L.circleMarker(
[
latitude,
longitude
],
{
radius:3,
color:'#f97316',
weight:0,
fillColor:'#f97316',
fillOpacity:.65
}
)
.bindPopup(
`
<strong>
${foco.country || '—'}
</strong>

<br>

${foco.state || ''}

<br>

${dataBR(
foco.detected_at
)}
`
)
.addTo(mapa)

}
)

setTimeout(
() => mapa.invalidateSize(),
100
)

}catch(erro){

console.error(
'Erro América do Sul:',
erro
)

}

}

function renderTabelaMunicipios(
dados
){

let busca =
(
document
.getElementById(
'buscaMunicipio'
)
?.value || ''
)
.toLowerCase()

let lista =
(dados || [])
.filter(
x =>
(
x.municipality ||
''
)
.toLowerCase()
.includes(busca)
)

let box =
document.getElementById(
'tabelaMunicipios'
)

if(!lista.length){

box.innerHTML =
`
<div class="vazio">
Nenhum município
com dados disponíveis.
</div>
`

return

}

box.innerHTML =
`
<div
style="
overflow:auto;
max-height:600px
">

<table class="tabela">

<thead>

<tr>

<th>
#
</th>

<th>
Município
</th>

<th>
Focos
</th>

<th>
Último foco
</th>

<th>
FRP médio
</th>

<th>
FRP máximo
</th>

</tr>

</thead>

<tbody>

${

lista.map(
(x,i) => `
<tr>

<td>
${i+1}
</td>

<td>
<strong>
${x.municipality}
</strong>
</td>

<td>
${fmt(
x.focos
)}
</td>

<td>
${dataBR(
x.ultimo_foco
)}
</td>

<td>
${numeroBR(
x.frp_medio,
1
)}
</td>

<td>
${numeroBR(
x.frp_maximo,
1
)}
</td>

</tr>
`
)
.join('')

}

</tbody>

</table>

</div>
`

}

function renderTempoReal(
dados
){

let box =
document.getElementById(
'listaTempoReal'
)

if(!dados.length){

box.innerHTML =
`
<div class="vazio">

Ainda não há detecções
importadas do PROTEGE.

</div>
`

return

}

box.innerHTML =
dados.map(
foco => `
<div class="linhaTempo">

<span>
${dataBR(
foco.detected_at
)}
</span>

<strong>
${foco.municipality ||
foco.state ||
'—'}
</strong>

<span>
${foco.satellite || '—'}
</span>

<span>
FRP
${numeroBR(
foco.frp,
1
)}
</span>

<span>
${Number(
foco.latitude
).toFixed(3)},
${Number(
foco.longitude
).toFixed(3)}
</span>

</div>
`
)
.join('')

}

async function carregarSatelites(){

try{

let resultado =
await api(
'satelites'
)

let dados =
resultado.data || []

criarGrafico(
'graficoSatelites',
'doughnut',
dados.map(
x => x.satellite
),
dados.map(
x => x.focos
),
'Focos'
)

let box =
document.getElementById(
'listaSatelites'
)

if(!dados.length){

box.innerHTML =
`
<div class="vazio">
Sem dados de satélite.
</div>
`

return

}

box.innerHTML =
dados.map(
x => `
<div class="fonteLinha">

<strong>
${x.satellite}
</strong>

—

${fmt(
x.focos
)}
focos

•

última detecção

${dataBR(
x.ultima_deteccao
)}

</div>
`
)
.join('')

}catch(erro){

console.error(
'Erro satélites:',
erro
)

}

}

async function carregarEventos(){

try{

let resultado =
await api(
'eventos'
)

let dados =
resultado.data || []

let box =
document.getElementById(
'listaEventos'
)

if(!dados.length){

box.innerHTML =
`
<div class="vazio">

Nenhum evento de fogo
identificado no período.

</div>
`

return

}

/* =====================================================
RESUMO DOS STATUS
===================================================== */

let combate =
dados.filter(
x =>
x.status_operacional ===
'em_combate'
)

let monitorando =
dados.filter(
x =>
x.status_operacional ===
'monitorando'
)

let analise =
dados.filter(
x =>
x.status_operacional ===
'em_analise'
)

let resolvido =
dados.filter(
x =>
x.status_operacional ===
'resolvido'
)

let semStatus =
dados.filter(
x =>
!x.status_operacional ||
x.status_operacional ===
'sem_status'
)
let executivo =
document.getElementById(
'eventosExecutivo'
)

if(executivo){

executivo.innerHTML = `

<div class="kpi eventoCombate">

<div class="rotulo">
🔥 EM COMBATE
</div>

<div class="valor">
${combate.length}
</div>

<div class="nota">
Eventos em atuação operacional
</div>

</div>


<div class="kpi eventoMonitorando">

<div class="rotulo">
👁 MONITORANDO
</div>

<div class="valor">
${monitorando.length}
</div>

<div class="nota">
Eventos sob acompanhamento
</div>

</div>


<div class="kpi eventoAnalise">

<div class="rotulo">
🔎 EM ANÁLISE
</div>

<div class="valor">
${analise.length}
</div>

<div class="nota">
Eventos em avaliação
</div>

</div>


<div class="kpi eventoResolvido">

<div class="rotulo">
✅ RESOLVIDOS
</div>

<div class="valor">
${resolvido.length}
</div>

<div class="nota">
Eventos encerrados
</div>

</div>


<div class="kpi eventoSemStatus">

<div class="rotulo">
⚪ SEM CLASSIFICAÇÃO
</div>

<div class="valor">
${semStatus.length}
</div>

<div class="nota">
Eventos sem status operacional
</div>

</div>

`

}
/* =====================================================
PRIORIDADE
===================================================== */

const prioridade = {

em_combate:1,
monitorando:2,
em_analise:3,
sem_status:4,
resolvido:5

}

dados.sort(
(a,b) => {

let pa =
prioridade[
a.status_operacional ||
'sem_status'
] || 9

let pb =
prioridade[
b.status_operacional ||
'sem_status'
] || 9

if(pa !== pb){
return pa - pb
}

return new Date(
b.ultima_deteccao
) -
new Date(
a.ultima_deteccao
)

}
)

/* =====================================================
CARDS
===================================================== */

let cards =
`
<div class="kpis">

<div class="kpi">

<div class="rotulo">
🔥 EM COMBATE
</div>

<div class="valor">
${combate.length}
</div>

<div class="nota">
Eventos com atuação operacional
</div>

</div>


<div class="kpi">

<div class="rotulo">
👁 MONITORANDO
</div>

<div class="valor">
${monitorando.length}
</div>

<div class="nota">
Eventos sob acompanhamento
</div>

</div>


<div class="kpi">

<div class="rotulo">
🔎 EM ANÁLISE
</div>

<div class="valor">
${analise.length}
</div>

<div class="nota">
Eventos em avaliação
</div>

</div>


<div class="kpi">

<div class="rotulo">
✅ RESOLVIDOS
</div>

<div class="valor">
${resolvido.length}
</div>

<div class="nota">
Eventos classificados como resolvidos
</div>

</div>


<div class="kpi">

<div class="rotulo">
⚪ SEM STATUS
</div>

<div class="valor">
${semStatus.length}
</div>

<div class="nota">
Sem classificação operacional
</div>

</div>

</div>
`

/* =====================================================
BADGE STATUS
===================================================== */

function badgeStatus(status){

if(
status ===
'em_combate'
){

return `
<span
style="
background:#991b1b;
color:white;
padding:5px 8px;
border-radius:999px;
font-size:10px;
font-weight:900
">
🔥 EM COMBATE
</span>
`

}

if(
status ===
'monitorando'
){

return `
<span
style="
background:#1d4ed8;
color:white;
padding:5px 8px;
border-radius:999px;
font-size:10px;
font-weight:900
">
👁 MONITORANDO
</span>
`

}

if(
status ===
'em_analise'
){

return `
<span
style="
background:#d97706;
color:white;
padding:5px 8px;
border-radius:999px;
font-size:10px;
font-weight:900
">
🔎 EM ANÁLISE
</span>
`

}

if(
status ===
'resolvido'
){

return `
<span
style="
background:#15803d;
color:white;
padding:5px 8px;
border-radius:999px;
font-size:10px;
font-weight:900
">
✓ RESOLVIDO
</span>
`

}

return `
<span
style="
background:#64748b;
color:white;
padding:5px 8px;
border-radius:999px;
font-size:10px;
font-weight:900
">
SEM STATUS
</span>
`

}

/* =====================================================
TABELA
===================================================== */

let tabela =
`
<div class="cardTitulo">

EVENTOS IDENTIFICADOS PELO PROTEGE

</div>

<div
style="
overflow:auto;
max-height:650px
">

<table class="tabela">

<thead>

<tr>

<th>
PRIORIDADE
</th>

<th>
STATUS
</th>

<th>
MUNICÍPIO
</th>

<th>
DETECÇÕES
</th>

<th>
INÍCIO
</th>

<th>
ÚLTIMA DETECÇÃO
</th>

<th>
FRP MÁX.
</th>

<th>
EVENTO
</th>

</tr>

</thead>

<tbody>

${

dados.map(
x => {

let status =
x.status_operacional ||
'sem_status'

let prioridadeTexto =
'NORMAL'

if(
status ===
'em_combate'
){

prioridadeTexto =
'CRÍTICA'

}else if(
status ===
'monitorando'
){

prioridadeTexto =
'ALTA'

}else if(
status ===
'em_analise'
){

prioridadeTexto =
'ATENÇÃO'

}else if(
status ===
'resolvido'
){

prioridadeTexto =
'ENCERRADO'

}

return `
<tr>

<td>

<strong>
${prioridadeTexto}
</strong>

</td>

<td>

${badgeStatus(
status
)}

</td>

<td>

<strong>
${x.municipios || '—'}
</strong>

</td>

<td>

${fmt(
x.deteccoes
)}

</td>

<td>

${dataBR(
x.inicio
)}

</td>

<td>

${dataBR(
x.ultima_deteccao
)}

</td>

<td>

${numeroBR(
x.frp_maximo,
1
)}

</td>

<td
style="
font-size:9px;
color:#64748b
">

${x.event_id}

</td>

</tr>
`

}
)
.join('')

}

</tbody>

</table>

</div>
`

box.innerHTML =
cards +
tabela

}catch(erro){

console.error(
'Erro eventos:',
erro
)

document
.getElementById(
'listaEventos'
)
.innerHTML =
`
<div class="vazio">

Erro ao carregar
os eventos de fogo.

</div>
`

}

}

function renderFonte(
resultado
){

let config =
resultado.config || []

let configuracoes = {}

config.forEach(
x => {

configuracoes[x.key] = x

}
)

let fonte =
document.getElementById(
'fonteInfo'
)

fonte.innerHTML =
`
<div class="fonteLinha">

<strong>
Projeto:
</strong>

${

configuracoes.project_name?.value ||
'RondoniaFocosdeCalor'

}

</div>


<div class="fonteLinha">

<strong>
Fonte operacional:
</strong>

PROTEGE / SEDAM

</div>


<div class="fonteLinha">

<strong>
Portal:
</strong>

${

configuracoes.portal_url?.value ||
'https://protege.sedam.ro.gov.br/queimadas'

}

</div>


<div class="fonteLinha">

<strong>
Cobertura:
</strong>

Rondônia e América do Sul

</div>


<div class="fonteLinha">

<strong>
Política de integridade:
</strong>

sem dados simulados

</div>
`

let sincronizacoes =
resultado.sync || []

let box =
document.getElementById(
'syncInfo'
)

if(!sincronizacoes.length){

box.innerHTML =
`
<div class="vazio">
Nenhuma sincronização
executada.
</div>
`

return

}

box.innerHTML =
sincronizacoes.map(
x => `
<div class="fonteLinha">

<strong>
${x.scope}
</strong>

•

${x.status}

•

${dataBR(
x.started_at
)}

<br>

Recebidos:
${fmt(
x.records_received
)}

•

Gravados:
${fmt(
x.records_upserted
)}

</div>
`
)
.join('')

}

document
.getElementById(
'buscaMunicipio'
)
.addEventListener(
'input',
() => {

renderTabelaMunicipios(
rankingMunicipios
)

}
)

document
.getElementById(
'btnAtualizarMapa'
)
.onclick =
() => {

let periodo =
document
.getElementById(
'periodoMapa'
)
.value

carregarMapaRO(
periodo
)

}

async function iniciar(){

await carregarStatus()

await Promise.allSettled(
[
carregarRanking(),
carregarEvolucao(),
carregarMapaRO(7),
carregarSatelites(),
carregarEventos(),
carregarAmerica()
]
)

}

iniciar()
