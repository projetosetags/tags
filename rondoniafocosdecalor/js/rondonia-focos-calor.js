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

charts[id] =
new Chart(
canvas,
{
type:tipo,

data:{
labels,

datasets:[
{
label:rotulo,
data:dados
}
]
},

options:{
responsive:true,
maintainAspectRatio:false,

plugins:{
legend:{
display:false
}
},

scales:
tipo === 'doughnut'
?
{}
:
{
y:{
beginAtZero:true
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

async function carregarMapaRO(
days=7
){

try{

let resultado =
await api(
'focos',
{
scope:'RO',
days,
limit:10000
}
)

let dados =
resultado.data || []

for(
let id
of
[
'mapaRO',
'mapaExecutivo'
]
){

let mapa =
iniciarMapa(
id,
[-10.8,-63.3],
6
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

fillOpacity:.72
}
)

let municipio =
foco.municipality ||
'Município não informado'

let popup =
`
<strong>
${municipio}
</strong>

<br>

${dataBR(
foco.detected_at
)}

<br>

Satélite:
${foco.satellite || '—'}

<br>

FRP:
${numeroBR(
foco.frp,
1
)}

<br>

Latitude:
${latitude.toFixed(4)}

<br>

Longitude:
${longitude.toFixed(4)}
`

marcador
.bindPopup(popup)
.addTo(mapa)

}
)

setTimeout(
() => mapa.invalidateSize(),
100
)

}

renderTempoReal(
dados.slice(0,100)
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

A fonte ainda não forneceu
eventos identificados
para este banco.

</div>
`

return

}

box.innerHTML =
`
<div style="overflow:auto">

<table class="tabela">

<thead>

<tr>

<th>
Evento
</th>

<th>
Detecções
</th>

<th>
Início
</th>

<th>
Última
</th>

<th>
Municípios
</th>

<th>
FRP máximo
</th>

</tr>

</thead>

<tbody>

${

dados.map(
x => `
<tr>

<td>
${x.event_id}
</td>

<td>
${fmt(
x.deteccoes
)}
</td>

<td>
${dataBR(
x.primeira_deteccao
)}
</td>

<td>
${dataBR(
x.ultima_deteccao
)}
</td>

<td>
${x.municipios || '—'}
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

}catch(erro){

console.error(
'Erro eventos:',
erro
)

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
