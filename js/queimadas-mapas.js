/*=========================================================
110 QUEIMADAS FUNCTION RENDERMAPAESTADUAL
=========================================================*/
async function renderMapaEstadual(){
let div=document.getElementById('mapaROEstadual')
if(!div)return
if(window.mapaEstadualRO){
try{window.mapaEstadualRO.remove()}catch(e){}
}
window.mapaEstadualRO=null
window.layerUCsEstadual=null
window.layerTIsEstadual=null
window.camadasControleEstadual=null
if(div._leaflet_id){
delete div._leaflet_id
}
let mapa=L.map('mapaROEstadual').setView([-10.9,-63.3],7)
window.mapaEstadualRO=mapa
L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
attribution:'OpenStreetMap'
}
).addTo(mapa)
window.camadasControleEstadual=
L.control.layers(
{},
{},
{
collapsed:false
}
).addTo(mapa)
if(typeof carregarUCsRO==='function'){
await carregarUCsRO(mapa,'estadual')
}
if(typeof carregarTIsRO==='function'){
await carregarTIsRO(mapa,'estadual')
}
setTimeout(()=>{
try{
mapa.invalidateSize(true)
let layers=[]
if(window.layerUCsEstadual)layers.push(window.layerUCsEstadual)
if(window.layerTIsEstadual)layers.push(window.layerTIsEstadual)
if(layers.length){
let grupo=L.featureGroup(layers)
if(grupo.getBounds().isValid()){
mapa.fitBounds(
grupo.getBounds(),
{
padding:[30,30],
maxZoom:8
}
)
}
}
}catch(e){
console.log(e)
}
},1200)
}
/*=========================================================
111 QUEIMADAS FUNCTION CARREGARTISRO
=========================================================*/
async function carregarTIsRO(mapa,tipo='estadual'){
try{
let resp=await fetch('./assets/geojson/terras-indigenas-ro.geojson')
if(!resp.ok){
throw new Error('Erro ao localizar assets/geojson/terras-indigenas-ro.geojson')
}
let geo=await resp.json()
let layerTI=L.geoJSON(
geo,
{
style:{
color:'#7c3aed',
weight:2,
fillColor:'#a855f7',
fillOpacity:.35
},
onEachFeature:(f,l)=>{
let p=f.properties||{}
let nome=
p.terrai_nom||
p.nome||
p.NOME||
p.terra_indigena||
p.TERRA_INDIGENA||
'Terra Indígena'
let etnia=
p.etnia_nom||
p.etnia||
'-'
let fase=
p.fase_ti||
p.fase||
'-'
let area=
p.superficie||
p.area_ha||
p.area||
'-'
l.bindPopup(`
<b>${nome}</b><br>
Etnia: ${etnia}<br>
Fase: ${fase}<br>
Área: ${area}
`)
}
}
)
if(tipo==='executivo'){
window.layerTIsExecutivo=layerTI
layerTI.addTo(mapa)
if(window.camadasControleExecutivo){
window.camadasControleExecutivo.addOverlay(
layerTI,
'🛖 Terras Indígenas'
)
}
}
if(tipo==='estadual'){
window.layerTIsEstadual=layerTI
layerTI.addTo(mapa)
if(window.camadasControleEstadual){
window.camadasControleEstadual.addOverlay(
layerTI,
'🛖 Terras Indígenas'
)
}
}
let painel=document.getElementById('painelTIMapa')
if(painel){
let totalTI=(geo.features||[]).length
painel.innerHTML=`
<b>${totalTI} Terras Indígenas de Rondônia</b><br>
Fonte:
<a href="https://www.gov.br/funai" target="_blank">
FUNAI
</a>
`
}
}catch(e){
console.error(e)
}
}

/*=========================================================
120 AUDITORIA RELATORIOS
=========================================================*/
async function renderPainelRelatoriosAuditoria(){

let painel=document.getElementById('painelAuditoria')

if(!painel)return

painel.innerHTML=`
<div class="chap-grid">

<div class="chap-card">
<div class="chap-num">📕</div>
<div class="chap-label">
RELATÓRIO EXECUTIVO PDF
</div>
<button onclick="gerarPDFExecutivoTCERO()">
GERAR PDF
</button>
</div>

<div class="chap-card">
<div class="chap-num">📘</div>
<div class="chap-label">
RELATÓRIO EXECUTIVO WORD
</div>
<button onclick="gerarWordExecutivoTCERO()">
GERAR WORD
</button>
</div>

<div class="chap-card">
<div class="chap-num">📙</div>
<div class="chap-label">
RELATÓRIO COMPLETO PDF
</div>
<button onclick="pdfCompletoQueimadas()">
GERAR PDF
</button>
</div>

<div class="chap-card">
<div class="chap-num">📗</div>
<div class="chap-label">
RELATÓRIO COMPLETO WORD
</div>
<button onclick="gerarWordCompletoQueimadas()">
GERAR WORD
</button>
</div>

<div class="chap-card">
<div class="chap-num">🔥</div>
<div class="chap-label">
RELATÓRIO TÉCNICO PCe 0501
</div>
<button onclick="gerarPDFTecnico0501()">
PDF TÉCNICO
</button>
</div>

<div class="chap-card">
<div class="chap-num">🏛️</div>
<div class="chap-label">
RELATÓRIO MUNICIPAL
</div>
<button onclick="gerarPDFMunicipios0501()">
PDF MUNICÍPIOS
</button>
</div>

</div>
`
}
