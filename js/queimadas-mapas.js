let mapaPlanosMunicipais=null
let camadaPlanosMunicipais=null

function corPlanoMunicipio(status){
switch(status){
case 'VERDE':
return '#16a34a'
case 'AMARELO':
return '#facc15'
case 'VERMELHO':
return '#dc2626'
default:
return '#d1d5db'
}
}

/*=========================================================
200 QUEIMADAS FUNCTION CARREGARUCSRO
=========================================================*/
async function carregarUCsRO(mapa,tipo='executivo'){
try{
let resp=await fetch('./assets/geojson/ucs-ro.geojson')
if(!resp.ok){
throw new Error('Erro ao localizar assets/geojson/ucs-ro.geojson')
}
let geo=await resp.json()

let estaduais={
type:'FeatureCollection',
features:(geo.features||[]).filter(f=>
String(f.properties?.esfera||'')
.toUpperCase()
.trim()==='ESTADUAL'
)
}

let federais={
type:'FeatureCollection',
features:(geo.features||[]).filter(f=>
String(f.properties?.esfera||'')
.toUpperCase()
.trim()==='FEDERAL'
)
}

let municipais={
type:'FeatureCollection',
features:(geo.features||[]).filter(f=>
String(f.properties?.esfera||'')
.toUpperCase()
.trim()==='MUNICIPAL'
)
}

let totalEstadual=estaduais.features.length
let totalFederal=federais.features.length
let totalMunicipal=municipais.features.length

function popupUC(f,l){
let p=f.properties||{}
let nome=p.nome_uc||'-'
let categoria=p.categoria||'-'
let grupo=p.grupo||'-'
let esfera=p.esfera||'-'
let municipio=p.municipio||'-'
let gestor=p.org_gestor||'-'
let status=p.status||p.situacao||'-'
let area=Number(p.ha_total||0)

l.bindPopup(`
<b>${nome}</b><br>
<b>Esfera:</b> ${esfera}<br>
<b>Categoria:</b> ${categoria}<br>
<b>Grupo:</b> ${grupo}<br>
<b>Município(s):</b> ${municipio}<br>
<b>Gestor:</b> ${gestor}<br>
<b>Situação:</b> ${status}<br>
<b>Área:</b> ${area.toLocaleString('pt-BR')} ha
`)
}

let layerUCEstadual=L.geoJSON(estaduais,{
style:{
color:'#dc2626',
weight:1.5,
fillColor:'#dc2626',
fillOpacity:.45
},
onEachFeature:popupUC
})

let layerUCFederal=L.geoJSON(federais,{
style:{
color:'#2563eb',
weight:1.5,
fillColor:'#2563eb',
fillOpacity:.45
},
onEachFeature:popupUC
})

let layerUCMunicipal=L.geoJSON(municipais,{
style:{
color:'#f59e0b',
weight:1.5,
fillColor:'#f59e0b',
fillOpacity:.45
},
onEachFeature:popupUC
})

if(tipo==='executivo'){
window.layerUCEstadualExecutivo=layerUCEstadual
window.layerUCFederalExecutivo=layerUCFederal
window.layerUCMunicipalExecutivo=layerUCMunicipal

layerUCEstadual.addTo(mapa)

if(window.camadasControleExecutivo){
window.camadasControleExecutivo.addOverlay(layerUCEstadual,`🔴 UCs Estaduais (${totalEstadual})`)
window.camadasControleExecutivo.addOverlay(layerUCFederal,`🔵 UCs Federais (${totalFederal})`)
window.camadasControleExecutivo.addOverlay(layerUCMunicipal,`🟠 UCs Municipais (${totalMunicipal})`)
}
}

if(tipo==='estadual'){
window.layerUCEstadual=layerUCEstadual
window.layerUCFederal=layerUCFederal
window.layerUCMunicipal=layerUCMunicipal

layerUCEstadual.addTo(mapa)

if(window.camadasControleEstadual){
window.camadasControleEstadual.addOverlay(layerUCEstadual,`🔴 UCs Estaduais (${totalEstadual})`)
window.camadasControleEstadual.addOverlay(layerUCFederal,`🔵 UCs Federais (${totalFederal})`)
window.camadasControleEstadual.addOverlay(layerUCMunicipal,`🟠 UCs Municipais (${totalMunicipal})`)
}
}

let painel=document.getElementById('painelUCsMapa')

if(painel){
painel.innerHTML=`
<b>UNIDADES DE CONSERVAÇÃO</b><br><br>
🔴 Estaduais: <b>${totalEstadual}</b><br>
🔵 Federais: <b>${totalFederal}</b><br>
🟠 Municipais: <b>${totalMunicipal}</b><br><br>
<b>Total:</b> ${geo.features.length}<br><br>
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
202 QUEIMADAS FUNCTION RENDERMAPAESTADUAL
=========================================================*/
async function renderMapaEstadual(){
let div=document.getElementById('mapaROEstadual')
if(!div)return
if(window.mapaEstadualRO){
try{window.mapaEstadualRO.remove()}catch(e){}
}
window.mapaEstadualRO=null
window.layerUCEstadual=null
window.layerUCFederal=null
window.layerUCMunicipal=null
window.layerTIsEstadual=null
window.camadasControleEstadual=null
if(div._leaflet_id){
delete div._leaflet_id
}
let mapa=L.map(div,{preferCanvas:true,zoomControl:true}).setView([-10.9,-63.3],7)
window.mapaEstadualRO=mapa
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'OpenStreetMap'}).addTo(mapa)
window.camadasControleEstadual=L.control.layers({},{},{collapsed:false}).addTo(mapa)
if(typeof carregarUCsRO==='function'){
await carregarUCsRO(mapa,'estadual')
}
if(typeof carregarTIsRO==='function'){
await carregarTIsRO(mapa,'estadual')
}
mapa.whenReady(()=>{
setTimeout(()=>{
try{
mapa.invalidateSize(true)
let layers=[]
if(window.layerUCEstadual)layers.push(window.layerUCEstadual)
if(window.layerUCFederal)layers.push(window.layerUCFederal)
if(window.layerUCMunicipal)layers.push(window.layerUCMunicipal)
if(window.layerTIsEstadual)layers.push(window.layerTIsEstadual)
if(layers.length){
let grupo=L.featureGroup(layers)
if(grupo.getBounds().isValid()){
mapa.fitBounds(grupo.getBounds(),{padding:[30,30],maxZoom:8})
}
}
}catch(e){
console.log(e)
}
},1000)
})
setTimeout(()=>mapa.invalidateSize(true),500)
setTimeout(()=>mapa.invalidateSize(true),1500)
setTimeout(()=>mapa.invalidateSize(true),3000)
}
/*=========================================================
203 QUEIMADAS FUNCTION CARREGARTISRO
=========================================================*/
async function carregarTIsRO(mapa,tipo='estadual'){
try{
let resp=await fetch('./assets/geojson/terras-indigenas-ro.geojson')
if(!resp.ok){
throw new Error('Erro ao localizar assets/geojson/terras-indigenas-ro.geojson')
}
let geo=await resp.json()
let layerTI=L.geoJSON(geo,{
style:{
color:'#7c3aed',
weight:2,
fillColor:'#a855f7',
fillOpacity:.35
},
onEachFeature:(f,l)=>{
let p=f.properties||{}
let nome=p.terrai_nome||p.terrai_nom||p.terra_indigena||p.nome||p.NOME||'Terra Indígena'
let etnia=p.etnia_nome||p.etnia_nom||p.etnia||'-'
let fase=p.fase_ti||p.fase||'-'
let municipio=p.municipio_nome||p.municipio||'-'
let modalidade=p.modalidade_ti||'-'
let area=Number(p.superficie_perimetro_ha||p.superficie||p.area_ha||0)
let areaTexto=area>0?area.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ha':'-'
l.bindPopup(`
<b>${nome}</b><br>
<b>Etnia:</b> ${etnia}<br>
<b>Municípios:</b> ${municipio}<br>
<b>Modalidade:</b> ${modalidade}<br>
<b>Fase:</b> ${fase}<br>
<b>Área:</b> ${areaTexto}
`)
}
})
if(tipo==='executivo'){
window.layerTIsExecutivo=layerTI
layerTI.addTo(mapa)
if(window.camadasControleExecutivo){
window.camadasControleExecutivo.addOverlay(layerTI,'🛖 Terras Indígenas')
}
}
if(tipo==='estadual'){
window.layerTIsEstadual=layerTI
layerTI.addTo(mapa)
if(window.camadasControleEstadual){
window.camadasControleEstadual.addOverlay(layerTI,'🛖 Terras Indígenas')
}
}
let painel=document.getElementById('painelTIMapa')
if(painel){
let totalTI=(geo.features||[]).length
painel.innerHTML=`
<b>${totalTI} Terras Indígenas de Rondônia</b><br>
Áreas oficialmente reconhecidas pela FUNAI.<br>
Fonte:
<a href="https://www.gov.br/funai" target="_blank">FUNAI</a>
`
}
}catch(e){
console.error(e)
}
}
/*=========================================================
204 QUEIMADAS FUNCTION RENDERPAINELRELATORIOSAUDITORIA
=========================================================*/
async function renderPainelRelatoriosAuditoria(){
let painel=document.getElementById('painelAuditoria')
if(!painel)return
painel.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">🔥</div>
<div class="chap-label">
RELATÓRIO TÉCNICO COMPLETO
</div>
<button onclick="gerarPDFTecnico0501()">
📄 PDF TÉCNICO
</button>
<button onclick="pdfCompletoQueimadas()">
📚 PDF COMPLETO
</button>
<button onclick="gerarWordTecnico0501()">
📝 WORD TÉCNICO
</button>
<div class="fonte-card">
IRIQ • Heatmap • CHAP • IA-CHAP • Matriz 5x5 • Evidências • Mapas
</div>
</div>
<div class="chap-card">
<div class="chap-num">🏛️</div>
<div class="chap-label">
RELATÓRIO MUNICIPAL COMPLETO
</div>
<button onclick="gerarPDFMunicipios0501()">
📄 PDF MUNICÍPIOS
</button>
<button onclick="gerarWordMunicipios0501()">
📝 WORD MUNICÍPIOS
</button>
<div class="fonte-card">
52 Municípios • Planos • Dilação • Sem Resposta • Estatísticas • Mapas
</div>
</div>
<div class="chap-card">
<div class="chap-num">📊</div>
<div class="chap-label">
EXPORTAÇÕES
</div>
<button onclick="window.print()">
🖨 IMPRIMIR PAINEL
</button>
<button onclick="imprimirAbaAtualQueimadas()">
📄 IMPRIMIR ABA
</button>
<div class="fonte-card">
Executivo • Municípios • Estado • Monitoramento • Sala de Situação
</div>
</div>
</div>
`
}

function normalizarMunicipio(nome){
let n=String(nome||'')
.normalize('NFD')
.replace(/[\u0300-\u036f]/g,'')
.replace(/['’`´]/g,"'")
.toUpperCase()
.trim()

const alias={
"MACHADINHO":"MACHADINHO D'OESTE",
"ESPIGAO":"ESPIGAO D'OESTE",
"SANTA LUZIA":"SANTA LUZIA D'OESTE",
"SAO FELIPE":"SAO FELIPE D'OESTE",
"MACHADINHO DO OESTE":"MACHADINHO D'OESTE",
"ESPIGAO DO OESTE":"ESPIGAO D'OESTE",
"SANTA LUZIA DO OESTE":"SANTA LUZIA D'OESTE",
"SAO FELIPE DO OESTE":"SAO FELIPE D'OESTE"
}

return alias[n]||n
}

           
async function renderMapaPlanosMunicipais(filtro='TODOS'){
const box=document.getElementById('mapaMunicipalPlanos')
if(!box)return
if(!mapaPlanosMunicipais){
mapaPlanosMunicipais=L.map('mapaMunicipalPlanos',{
zoomControl:true
}).setView([-10.9,-63.3],7)
L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
maxZoom:18,
attribution:'OpenStreetMap'
}
).addTo(mapaPlanosMunicipais)
}
if(camadaPlanosMunicipais){
mapaPlanosMunicipais.removeLayer(camadaPlanosMunicipais)
}
const {data,error}=await client
.from('vw_queimadas_municipios_resposta')
.select('*')
if(error){
console.log(error)
return
}
const indice={}
data.forEach(i=>{
indice[normalizarMunicipio(i.municipio)]=i
})
const geo=await fetch('./assets/geojson/municipios-ro.geojson')
const municipiosRO=await geo.json()
camadaPlanosMunicipais=L.geoJSON(municipiosRO,{
style:function(feature){
const nome=normalizarMunicipio(feature.properties.nome||feature.properties.NM_MUN)
if(nome.includes('ESPIGAO')||nome.includes('MACHADINHO')||nome.includes('SANTA')||nome.includes('FELIPE')){
console.log(nome)
}
const reg=indice[nome]
if(!reg){
console.log('SEM CORRESPONDÊNCIA:',nome)
return{
fillColor:'#d1d5db',
weight:1,
color:'#666',
fillOpacity:.35
}
}

if(filtro!=='TODOS' && reg.classificacao_cor!==filtro){

return{

fillColor:'#d1d5db',
weight:1,
color:'#999',
fillOpacity:.20

}

}

return{

fillColor:corPlanoMunicipio(reg.classificacao_cor),
weight:1,
color:'#555',
fillOpacity:.85

}

},

onEachFeature:function(feature,layer){

const nome=(feature.properties.nome||feature.properties.NM_MUN||'').toUpperCase()

const reg=indice[nome]


if(!reg){
console.log('SEM CORRESPONDÊNCIA:',nome)
}


  
if(!reg)return

let situacao='Sem informação'

if(reg.classificacao_cor==='VERDE')
situacao='🟢 Plano apresentado'

if(reg.classificacao_cor==='AMARELO')
situacao='🟡 Dilação de prazo'

if(reg.classificacao_cor==='VERMELHO')
situacao='🔴 Sem resposta'

layer.bindPopup(`

<b>${reg.municipio}</b>

<hr>

<b>Situação:</b><br>

${situacao}

<br><br>

<b>Documento:</b><br>

${reg.lnumerodocenviado||'-'}

<br><br>

<b>Recebimento:</b><br>

${formatarDataBR(reg.ldatarecebimentodoc)}

<br><br>

${reg.observacao||''}

`)

layer.on({

mouseover:e=>{

e.target.setStyle({

weight:3,

color:'#2563eb'

})

},

mouseout:e=>{

camadaPlanosMunicipais.resetStyle(e.target)

}

})

}

}).addTo(mapaPlanosMunicipais)

mapaPlanosMunicipais.fitBounds(camadaPlanosMunicipais.getBounds())

}

