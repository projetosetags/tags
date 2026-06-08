/*=========================================================
108 QUEIMADAS FUNCTION CARREGARUCSRO
=========================================================*/
async function carregarUCsRO(mapa,tipo='executivo'){
try{
let resp=await fetch('./assets/geojson/ucs-ro.geojson')
if(!resp.ok){
throw new Error('Erro ao localizar assets/geojson/ucs-ro.geojson')
}
let geo=await resp.json()
let totalEstadual=0
let totalFederal=0
let totalMunicipal=0
;(geo.features||[]).forEach(f=>{
let esfera=String(
f.properties?.esfera||''
).toUpperCase()
if(esfera==='ESTADUAL')totalEstadual++
if(esfera==='FEDERAL')totalFederal++
if(esfera==='MUNICIPAL')totalMunicipal++
})
let layerUC=L.geoJSON(geo,{
style:f=>{
let esfera=String(
f.properties?.esfera||''
).toUpperCase()
let cor='#94a3b8'
if(esfera==='ESTADUAL'){
cor='#dc2626'
}
if(esfera==='FEDERAL'){
cor='#2563eb'
}
if(esfera==='MUNICIPAL'){
cor='#f59e0b'
}
return{
color:cor,
weight:1.5,
fillColor:cor,
fillOpacity:.45
}
},
onEachFeature:(f,l)=>{
let p=f.properties||{}
let nome=
p.nome_uc||
p.NOME_UC||
'Unidade de Conservação'

let categoria=
p.categoria||
p.CATEGORIA||
'-'

let grupo=
p.grupo||
p.GRUPO||
'-'

let municipio=
p.municipio||
p.MUNICIPIO||
'-'

let esfera=
p.esfera||
p.ESFERA||
'-'

let gestor=
p.org_gestor||
p.ORG_GESTOR||
'-'

let status=
p.status||
p.STATUS||
p.situacao||
'-'

let area=Number(
p.ha_total||
p.HA_TOTAL||
0
)

let areaTexto=
area>0
?area.toLocaleString(
'pt-BR',
{
minimumFractionDigits:2,
maximumFractionDigits:2
}
)+' ha'
:'-'

if(
grupo
.toUpperCase()
.includes('PROTE')
){
l.setStyle({
color:'#8b0000',
fillColor:'#ff4444',
weight:1,
fillOpacity:.55
})
}else{
l.setStyle({
color:'#006400',
fillColor:'#00aa55',
weight:1,
fillOpacity:.45
})
}

l.bindPopup(`
<b>${nome}</b><br>
<b>Esfera:</b> ${esfera}<br>
<b>Categoria:</b> ${categoria}<br>
<b>Grupo:</b> ${grupo}<br>
<b>Município(s):</b> ${municipio}<br>
<b>Gestor:</b> ${gestor}<br>
<b>Situação:</b> ${status}<br>
<b>Área:</b> ${areaTexto}
`)

}
})

if(tipo==='executivo'){
window.layerUCsExecutivo=layerUC
layerUC.addTo(mapa)
if(window.camadasControleExecutivo){
window.camadasControleExecutivo.addOverlay(
layerUC,
'🌳 UCs de Rondônia'
)
}
}

if(tipo==='estadual'){
window.layerUCsEstadual=layerUC
layerUC.addTo(mapa)
if(window.camadasControleEstadual){
window.camadasControleEstadual.addOverlay(
layerUC,
'🌳 UCs de Rondônia'
)
}
}

let painel=document.getElementById('painelUCsMapa')
if(painel){
painel.innerHTML=`
<b>UNIDADES DE CONSERVAÇÃO</b><br><br>
🔴 Estaduais:
<b>${totalEstadual}</b><br>
🔵 Federais:
<b>${totalFederal}</b><br>
🟠 Municipais:
<b>${totalMunicipal}</b><br><br>
<b>Total:</b>
${geo.features.length}<br><br>
Fonte:
<a href="https://app.tcgeo.tc.br/" target="_blank">
TCGeo / CNUC
</a>
`
}
}catch(e){
console.error('Erro ao carregar UCs:',e)
}
}
/*=========================================================
109 RENDER MAPA MUNICIPAL PLANOS
=========================================================*/
async function renderMapaMunicipalPlanos(filtro='TODOS'){
let div=document.getElementById('mapaMunicipalPlanos')
if(!div)return
div.innerHTML=''
if(window.mapaMunicipalPlanos){
try{
window.mapaMunicipalPlanos.remove()
}catch(e){}
window.mapaMunicipalPlanos=null
}
if(div._leaflet_id){
delete div._leaflet_id
}
await new Promise(r=>setTimeout(r,100))
let mapa=L.map(div,{
preferCanvas:true,
zoomControl:true
})
window.mapaMunicipalPlanos=mapa
mapa.setView([-10.9,-63.3],7)
L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
attribution:'OpenStreetMap'
}
).addTo(mapa)
let geo=await fetch('./assets/geojson/municipios-ro.geojson')
if(!geo.ok){
console.log('Erro GeoJSON',geo.status)
return
}
let geojson=await geo.json()
console.log('GeoJSON carregado',geojson.features?.length)
let {data,error}=await client.from('queimadas_municipios_oficio').select('*')
if(error){
console.log(error)
return
}
let situacao={}
;(data||[]).forEach(i=>{
situacao[String(i.municipio||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/'/g,'').toUpperCase().trim()]=i
})
console.log('Layer criada')
window.layerMunicipiosPlanos=L.geoJSON(geojson,{
style:f=>{
let nome=String(f.properties.nome||
f.properties.NOME||
f.properties.municipio||
f.properties.MUNICIPIO||
f.properties.nm_mun||
f.properties.NM_MUN||
f.properties.nome_mun||
f.properties.NOME_MUN||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/'/g,'').toUpperCase().trim()
let m=situacao[nome]
let cor='#94a3b8'
if(m){
if(filtro!=='TODOS'&&m.classificacao_cor!==filtro){
cor='#e5e7eb'
}else{
if(m.classificacao_cor==='VERDE')cor='#16a34a'
if(m.classificacao_cor==='AMARELO')cor='#facc15'
if(m.classificacao_cor==='VERMELHO')cor='#dc2626'
}
}
return{
color:'#ffffff',
weight:1,
fillColor:cor,
fillOpacity:.85
}
},
onEachFeature:(f,l)=>{
let nome=String(f.properties.nome||f.properties.NOME||'')
let chave=nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/'/g,'').toUpperCase().trim()
let m=situacao[chave]
l.dadosMunicipio=m
l.bindPopup(`
<b>${nome}</b><br>
Situação: ${m?.classificacao_ia||'Sem classificação'}<br>
Documento: ${m?.lnumerodocenviado||m?.llnumerodocenviado||'-'}<br>
Recebimento: ${formatarDataBR?.(m?.ldatarecebimentodoc)||m?.ldatarecebimentodoc||'-'}
`)
}
}).addTo(mapa)
if(window.layerUCs){
try{
window.layerUCs.bringToBack()
}catch(e){}
}
try{
mapa.fitBounds(
window.layerMunicipiosPlanos.getBounds(),
{
padding:[20,20],
maxZoom:8
}
)
}catch(e){}

setTimeout(()=>{
mapa.invalidateSize(true)
},500)

setTimeout(()=>{
mapa.invalidateSize(true)
try{
mapa.fitBounds(
window.layerMunicipiosPlanos.getBounds(),
{
padding:[20,20],
maxZoom:8
}
)
}catch(e){}
},1500)

setTimeout(()=>{
mapa.invalidateSize(true)
},2500)
}
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
if(window.layerUCsEstadual){
window.layerUCsEstadual.bringToFront()
}
}
if(typeof carregarTIsRO==='function'){
await carregarTIsRO(mapa,'estadual')
if(window.layerTIsEstadual){
window.layerTIsEstadual.bringToFront()
}
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
p.terrai_nome||
p.terrai_nom||
p.terra_indigena||
p.nome||
p.NOME||
'Terra Indígena'

let etnia=
p.etnia_nome||
p.etnia_nom||
p.etnia||
'-'

let fase=
p.fase_ti||
p.fase||
'-'

let municipio=
p.municipio_nome||
p.municipio||
'-'

let modalidade=
p.modalidade_ti||
'-'

let area=Number(
p.superficie_perimetro_ha||
p.superficie||
p.area_ha||
0
)

let areaTexto=
area>0
?area.toLocaleString(
'pt-BR',
{
minimumFractionDigits:2,
maximumFractionDigits:2
}
)+' ha'
:'-'

l.bindPopup(`
<b>${nome}</b><br>
<b>Etnia:</b> ${etnia}<br>
<b>Municípios:</b> ${municipio}<br>
<b>Modalidade:</b> ${modalidade}<br>
<b>Fase:</b> ${fase}<br>
<b>Área:</b> ${areaTexto}
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
if(
window.camadasControleEstadual &&
window.mapaEstadualRO
){
try{
window.camadasControleEstadual.addOverlay(
layerTI,
'🛖 Terras Indígenas'
)
}catch(e){
console.log(e)
}
}
}
let painel=document.getElementById('painelTIMapa')
if(painel){
let totalTI=(geo.features||[]).length
painel.innerHTML=`
<b>${totalTI} Terras Indígenas de Rondônia</b><br>
Áreas oficialmente reconhecidas pela FUNAI.<br>
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
<button onclick="gerarWordTecnico0501()">
WORD TÉCNICO
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
<button onclick="gerarWordMunicipios0501()">
WORD MUNICÍPIOS
</button>
</div>

</div>
`
}
