/*=========================================================
132 QUEIMADAS FUNCTION RENDERTOPCRITICOS
=========================================================*/
async function renderTopCriticos(){
let box=document.getElementById('painelTopCriticos')
if(!box)return
let {data}=await client
.from('queimadas_heatmap')
.select('*')
.eq('classificacao','CRÍTICO')
.order('focos',{ascending:false})

let html=`
<div class="cardExecutivo">
<h2>🚨 MUNICÍPIOS CRÍTICOS</h2>
`

if(!data?.length){
html+=`<div>Nenhum município crítico identificado.</div>`
}else{
data.forEach((m,i)=>{
html+=`
<div style="padding:10px;border-bottom:1px solid #e5e7eb">
<b>${i+1}º ${m.municipio}</b><br>
🔥 Focos: ${m.focos||0}<br>
📈 Risco: ${m.risco||0}<br>
🔴 Classificação: ${m.classificacao}
</div>
`
})
}

html+=`
<div class="fonte-card">
Fonte: Heatmap Estadual • INPE • Acumulado 2026
</div>
</div>
`

box.innerHTML=html
}
/*=========================================================
066 QUEIMADAS FUNCTION RENDERTOPRISCOS
=========================================================*/
async function renderTopRiscos(){

let box=document.getElementById('painelTopRiscos')
if(!box)return

let {data}=await client
.from('queimadas_riscos')
.select('*')
.order('nivel_risco',{ascending:false})
.limit(10)

box.innerHTML=data.map(i=>`
<div>
${i.risco}
-
Nível ${i.nivel_risco}
</div>
`).join('')

}
/*=========================================================
067 QUEIMADAS FUNCTION RENDERTOPIACHAP
=========================================================*/
async function renderTopIAChap(){

let box=document.getElementById('painelTopIAChap')
if(!box)return

let {data}=await client
.from('queimadas_ia_chap')
.select('*')
.limit(10)

box.innerHTML=(data||[])
.map(i=>`
<div class="linha-queimadas">
🤖 ID CHAP ${i.chap_id||'-'}
 | ${i.risco_previsto||'-'}
 | ${i.prioridade||'-'}
</div>
`)
.join('')

}
/*=========================================================
068 QUEIMADAS FUNCTION RENDERALERTAS
=========================================================*/
async function renderAlertas(){
let box=document.getElementById('painelAlertas')
if(!box)return
let {data,error}=await client
.from('queimadas_heatmap')
.select('*')
if(error){
console.log(error)
return
}
let lista=[...(data||[])]
.sort((a,b)=>{
let c1=Number(b.criticidade||0)-Number(a.criticidade||0)
if(c1!==0)return c1
let c2=Number(b.focos||0)-Number(a.focos||0)
if(c2!==0)return c2
return Number(b.risco||0)-Number(a.risco||0)
})
.slice(0,5)
box.innerHTML=lista.map((i,idx)=>`
<div class="alerta-ranking">
<div class="alerta-numero">${idx+1}</div>
<div class="alerta-texto">
<b>${i.municipio}</b><br>
Classificação: ${i.classificacao} |
Criticidade: ${i.criticidade} |
Focos: ${i.focos} |
IRIQ: ${i.risco}
</div>
</div>
`).join('')+`
<div class="fonte-card">
Fonte: Heatmap Estadual • IRIQ • Focos de Calor
</div>`
}

/*=========================================================
069 QUEIMADAS FUNCTION RENDERTOPMUNICIPIOS
=========================================================*/
async function renderTopMunicipios(){
let box=document.getElementById(
'painelTopMunicipios'
)
if(!box)return
let {data}=await client
.from('queimadas_indice_municipal')
.select('*')
.order('indice_final',{ascending:false})
.limit(10)

box.innerHTML=(data||[])
.map(i=>`
<div class="linha-ranking">
<b>${i.municipio}</b>
-
IMC ${Number(i.indice_final||0).toFixed(1)}
-
${i.classificacao}
</div>
`)
.join('')
}
/*=========================================================
070 QUEIMADAS FUNCTION CALCULARIMC
=========================================================*/
async function calcularIMC(){
let {data:municipios}=await client
.from('queimadas_municipios')
.select('*')
let {data:riscos}=await client
.from('queimadas_riscos')
.select('*')
let {data:chap}=await client
.from('queimadas_chap')
.select('*')
let {data:impactos}=await client
.from('queimadas_impacto')
.select('*')
for(let m of (municipios||[])){
let focos=Number(m.focos_calor||0)
let riscoMunicipio=(riscos||[])
.filter(r=>r.municipio===m.municipio)
let riscoScore=Math.max(
...(riscoMunicipio.map(r=>
Number(r.nivel_risco||0)
)),
0
)
let chapMunicipio=(chap||[])
.find(c=>c.municipio===m.municipio)
let chapScore=
Number(chapMunicipio?.resultado||0)
let impactoMunicipio=(impactos||[])
.find(i=>i.municipio===m.municipio)
let impactoScore=
Number(impactoMunicipio?.indice_impacto||0)
let indice=
(focos*0.40)+
(riscoScore*0.20)+
(chapScore*0.25)+
(impactoScore*0.15)
let classe='BAIXO'
let semaforo='🟢'
if(indice>=80){
classe='CRÍTICO'
semaforo='🔴'
}else
if(indice>=60){
classe='ALTO'
semaforo='🟡'
}else
if(indice>=40){
classe='MODERADO'
semaforo='🟡'
}
await client
.from('queimadas_indice_municipal')
.upsert({
municipio:m.municipio,
focos_score:focos,
risco_score:riscoScore,
chap_score:chapScore,
impacto_score:impactoScore,
indice_final:Number(indice.toFixed(2)),
classificacao:classe,
semaforo:semaforo
},{
onConflict:'municipio'
})
}
}
/*=========================================================
071 QUEIMADAS FUNCTION RENDERMUNICIPIOSSEMEVIDENCIAS
=========================================================*/
async function renderMunicipiosSemEvidencias(){
let box=document.getElementById('painelSemEvidencias')
if(!box)return
let {data:municipios}=await client
.from('queimadas_municipios')
.select('municipio')
let {data:evidencias}=await client
.from('queimadas_evidencias')
.select('municipio')
let lista=(municipios||[])
.filter(m=>
!(evidencias||[])
.some(e=>e.municipio===m.municipio)
)
.slice(0,10)
box.innerHTML=lista.map(i=>`
<div class="alerta-vermelho">
⚠ ${i.municipio}
</div>
`).join('')
}
/*=========================================================
072 QUEIMADAS FUNCTION RENDERPRESIDENTE
=========================================================*/
async function renderPresidente(){
let box=document.getElementById('painelPresidente')
if(!box)return
let iriq=await calcularIRIQ()
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${iriq}</div>
<div class="chap-label">
IRIQ ESTADUAL
</div>
</div>
</div>
`
}
/*=========================================================
073 QUEIMADAS FUNCTION RENDERRANKINGIMC
=========================================================*/
async function renderRankingIMC(){
let box=document.getElementById('painelTopMunicipios')
if(!box)return
let {data,error}=await client
.from('queimadas_indice_municipal')
.select('*')
.order('indice_final',{ascending:false})
.limit(10)
if(error){
console.log(error)
return
}
box.innerHTML=(data||[])
.map(i=>`
<div class="linha-ranking">
${i.semaforo||'🟢'}
<b>${i.municipio}</b>
-
IMC ${Number(i.indice_final||0).toFixed(1)}
-
${i.classificacao||'BAIXO'}
</div>
`)
.join('')
}
/*=========================================================
074 CALCULAR POPULAÇÃO EXPOSTA
=========================================================*/
async function calcularPopulacaoExposta(){
let {data,error}=await client
.from('queimadas_municipios')
.select('*')
if(error)return 0
let total=0
data.forEach(m=>{
let risco=String(m.risco||'').toUpperCase()
let peso=0
if(risco==='CRÍTICO')peso=1
else if(risco==='ALTO')peso=0.75
else if(risco==='MODERADO')peso=0.50
else peso=0.25
total+=Number(m.populacao||0)*peso
})
return Math.round(total)
}
/*=========================================================
075 CALCULAR ÁREA SOB RISCO
=========================================================*/
async function calcularAreaRisco(){
let {data,error}=await client
.from('queimadas_municipios')
.select('*')
if(error)return 0
let total=0
data.forEach(m=>{
let risco=String(m.risco||'').toUpperCase()
let peso=0
if(risco==='CRÍTICO')peso=1
else if(risco==='ALTO')peso=0.75
else if(risco==='MODERADO')peso=0.50
else peso=0.25
total+=Number(m.area_km2||0)*peso
})
return total.toFixed(0)
}
/*=========================================================
076 CALCULAR IRIQ
=========================================================*/
async function calcularIRIQ(){
let {data:riscos}=await client
.from('queimadas_riscos')
.select('*')
let {data:chap}=await client
.from('queimadas_chap')
.select('*')
let totalRisco=0
let totalChap=0
;(riscos||[]).forEach(r=>{
totalRisco+=Number(r.nivel_risco||0)
})
;(chap||[]).forEach(c=>{
totalChap+=Number(c.resultado||0)
})
let mediaRisco=
(riscos||[]).length
?totalRisco/(riscos||[]).length
:0
let mediaChap=
(chap||[]).length
?totalChap/(chap||[]).length
:0
let iriq=
(mediaRisco*0.60)+
(mediaChap*0.40)
if(iriq>100)iriq=100
if(iriq<0)iriq=0
return iriq.toFixed(1)
}
/*=========================================================
077 QUEIMADAS FUNCTION RENDERPLANOSMUNICIPAIS
=========================================================*/
async function renderPlanosMunicipais(){
let box=document.getElementById('painelPlanosMunicipais')
if(!box)return
let {data,error}=await client.from('queimadas_municipios_oficio').select('*').order('municipio')
if(error){
box.innerHTML='Erro ao carregar.'
return
}
let {data:heat=[]}=await client
.from('queimadas_heatmap')
.select('*')
.order('criticidade',{ascending:false})
.order('focos',{ascending:false})
.limit(6)
let comPlano=(data||[]).filter(i=>i.classificacao_cor==='VERDE')
let dilacao=(data||[]).filter(i=>i.classificacao_cor==='AMARELO')
let semPlano=(data||[]).filter(i=>i.classificacao_cor==='VERMELHO')
let rankingHTML=''

heat.forEach((m,i)=>{
rankingHTML+=`
<div style="margin:4px 0">
<b>${i+1}º ${m.municipio}</b>
&nbsp;|&nbsp;
Criticidade: <b>${m.criticidade||0}</b>
&nbsp;|&nbsp;
Focos: <b>${m.focos||0}</b>
&nbsp;|&nbsp;
Classificação: <b>${m.classificacao||'-'}</b>
</div>
`
})
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num" style="color:#16a34a">${comPlano.length}</div>
<div class="chap-label">COM PLANO</div>
</div>
<div class="chap-card">
<div class="chap-num" style="color:#facc15">${dilacao.length}</div>
<div class="chap-label">DILAÇÃO DE PRAZO</div>
</div>
<div class="chap-card">
<div class="chap-num" style="color:#dc2626">${semPlano.length}</div>
<div class="chap-label">SEM EVIDÊNCIA</div>
</div>
</div>
<div style="margin-top:15px;padding:12px;border-radius:10px;background:#fef2f2;border:2px solid #dc2626">
<div style="font-size:16px;font-weight:900;margin-bottom:8px;color:#991b1b">
🔥 TOP Maiores Focos e Relevância (IRIQ)
</div>
${rankingHTML}
</div>
<div style="margin-top:15px">
<h3 style="color:#15803d">✅ MUNICÍPIOS COM PLANO</h3>
${comPlano.map(i=>i.municipio).join(' • ')}
<hr style="margin:15px 0">
<h3 style="color:#ca8a04">🟡 MUNICÍPIOS COM DILAÇÃO DE PRAZO</h3>
${dilacao.map(i=>i.municipio).join(' • ')}
<hr style="margin:15px 0">
<h3 style="color:#dc2626">🚨 MUNICÍPIOS SEM EVIDÊNCIA DE PLANO</h3>
${semPlano.map(i=>i.municipio).join(' • ')}
</div>
`
}
/*=========================================================
078 QUEIMADAS FUNCTION RENDERGEOJSONRO
=========================================================*/
async function renderGeoJSONRO(){
if(!window.mapaQueimadasRO)return
let resp=await fetch('/tags/queimadas/assets/geojson/municipios-ro.geojson')
if(!resp.ok){
console.log('Erro ao carregar UCs')
return
}
let geojson=await resp.json()
console.log(
'UCs carregadas:',
geojson.features?.length||0
)
let {data:heat}=await client
.from('queimadas_heatmap')
.select('*')
function normalizar(txt){
return String(txt||'')
.normalize('NFD')
.replace(/[\u0300-\u036f]/g,'')
.replace(/'/g,'')
.toUpperCase()
.trim()
}
function obterMunicipio(nome){
return (heat||[])
.find(m=>
normalizar(m.municipio)===
normalizar(nome)
)
}
function obterCor(nome){
let m=obterMunicipio(nome)
if(!m)return '#94a3b8'
if(m.classificacao==='CRÍTICO')return '#dc2626'
if(m.classificacao==='ALTO')return '#f97316'
if(m.classificacao==='MODERADO')return '#facc15'
return '#16a34a'
}
window.layerMunicipios=L.geoJSON(geojson,{
style:function(feature){
let nome=
feature.properties.NM_MUN||
feature.properties.nome||
feature.properties.name||
''
return{
fillColor:obterCor(nome),
weight:1,
opacity:1,
color:'#ffffff',
fillOpacity:0.75
}
},
onEachFeature:function(feature,layer){
let nome=
feature.properties.NM_MUN||
feature.properties.nome||
feature.properties.name||
''
let m=obterMunicipio(nome)
layer.bindPopup(`
<b>${nome}</b><br>
Criticidade: ${m?.criticidade||0}<br>
Focos: ${m?.focos||0}<br>
Risco: ${m?.risco||0}<br>
Classificação: ${m?.classificacao||'BAIXO'}
`)
}
})
window.layerMunicipios.addTo(
window.mapaQueimadasRO
)
window.camadasControle.addOverlay(
window.layerMunicipios,
'Municípios'
)
}
/*=========================================================
079 QUEIMADAS FUNCTION RENDERUCS
=========================================================*/
async function renderUCs(){
if(!window.mapaQueimadasRO)return
try{
let resp=await fetch(
'assets/geojson/ucs-ro.geojson'
)
if(!resp.ok){
console.log(
'GeoJSON UCs não encontrado'
)
return
}
let geojson=await resp.json()
window.layerUC=L.geoJSON(
geojson,
{
style:function(){
return{
color:'#006400',
weight:2,
fillColor:'#22c55e',
fillOpacity:0.25
}
},
onEachFeature:function(feature,layer){
let nome=
feature.properties.nome||
feature.properties.NOME||
feature.properties.name||
'UC'
layer.bindPopup(`
<b>UNIDADE DE CONSERVAÇÃO</b><br>
${nome}
`)
}
}
)
window.layerUC.addTo(
window.mapaQueimadasRO
)
window.camadasControle.addOverlay(
window.layerUC,
'Unidades de Conservação'
)
}catch(e){
console.log(
'UCs não carregadas',
e
)
}
}
/*=========================================================
080 QUEIMADAS FUNCTION RENDERPAINELUCS
=========================================================*/
async function renderPainelUCs(){
let box=document.getElementById('painelUCs')
if(!box)return
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">
49
</div>
<div class="chap-label">
UNIDADES DE CONSERVAÇÃO
</div>
</div>
<div class="chap-card">
<div class="chap-num">
100%
</div>
<div class="chap-label">
MONITORADAS
</div>
</div>
<div class="chap-card">
<div class="chap-num">
SEDAM
</div>
<div class="chap-label">
ÓRGÃO GESTOR
</div>
</div>
<div class="chap-card">
<div class="chap-num">
TCE-RO
</div>
<div class="chap-label">
MONITORAMENTO
</div>
</div>
</div>
<div class="fonte-card">
Fonte: Cadastro Estadual de Unidades de Conservação • Sedam
</div>
`
}
/*=========================================================
081 QUEIMADAS FUNCTION RENDERPAINELFOCOSINPE
=========================================================*/
async function renderPainelFocosINPE(){
let periodo=
document.getElementById(
'filtroPeriodoFocos'
)?.value
||
'7'
let box=
document.getElementById(
'painelFocosCalor'
)
||
document.getElementById(
'painelFocosINPE'
)
if(!box)return
let consulta=
client
.from('queimadas_focos')
.select('*')
if(periodo==='ano'){
consulta=
consulta.gte(
'data_referencia',
`${new Date().getFullYear()}-01-01`
)
}else if(periodo==='custom'){
let dataInicial=
document.getElementById(
'dataInicialFocos'
)?.value
let dataFinal=
document.getElementById(
'dataFinalFocos'
)?.value
if(dataInicial){
consulta=
consulta.gte(
'data_referencia',
dataInicial
)
}
if(dataFinal){
consulta=
consulta.lte(
'data_referencia',
dataFinal
)
}
}else{
let d=new Date()
d.setDate(
d.getDate()-Number(periodo)
)
consulta=
consulta.gte(
'data_referencia',
d.toISOString().split('T')[0]
)
}
let {data}=await consulta
let total=(data||[])
.reduce((s,i)=>s+Number(i.focos||0),0)
let mapa={}
;(data||[]).forEach(i=>{
let mun=i.municipio||'SEM MUNICÍPIO'
if(!mapa[mun])mapa[mun]=0
mapa[mun]+=Number(i.focos||0)
})
let top10=Object.entries(mapa)
.map(([municipio,focos])=>({municipio,focos}))
.sort((a,b)=>b.focos-a.focos)
.slice(0,10)
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">
${formatarNumero(total)}
</div>
<div class="chap-label">
FOCOS DE CALOR
</div>
</div>
<div class="chap-card">
<div class="chap-num">
${(data||[]).length}
</div>
<div class="chap-label">
REGISTROS INPE
</div>
</div>
</div>
<div class="card-executivo">
<h2>
TOP FOCOS DE CALOR ${
periodo==='ano'
?'(ANO ATUAL)'
:periodo==='custom'
?'(PERSONALIZADO)'
:`(${periodo} DIAS)`
}
</h2>
${top10.map(i=>`
<div style="
display:flex;
justify-content:space-between;
align-items:center;
padding:8px;
border-bottom:1px solid #ddd;
">
<span>${i.municipio}</span>
<b>${formatarNumero(i.focos)}</b>
</div>
`).join('')}

<div style="
margin-top:12px;
font-size:11px;
font-style:italic;
color:#6b7280;
text-align:left;
">
Fonte: INPE • Programa Queimadas • Tabela queimadas_focos • Atualização automática
</div>

</div>
`
}
/*=========================================================
082 QUEIMADAS FUNCTION CARREGARFOCOSPERIODO
=========================================================*/
function carregarFocosPeriodo(){
let periodo=
document.getElementById(
'filtroPeriodoFocos'
)?.value
let box=
document.getElementById(
'boxPeriodoPersonalizado'
)
if(periodo==='custom'){
box.style.display='flex'
}else{
box.style.display='none'
}
renderPainelFocosINPE()
}
/*=========================================================
082 083 QUEIMADAS FUNCTION RENDERGRAFICOTOPFOCOS
=========================================================*/
async function renderGraficoTopFocos(){

let canvas=
document.getElementById('graficoTopFocosExecutivo')
||
document.getElementById('graficoTopFocosRelatorio')

if(!canvas)return

let {data=[]}=await client
.from('queimadas_focos')
.select('*')

let mapa={}

data.forEach(i=>{
let mun=i.municipio||'SEM MUNICÍPIO'
if(!mapa[mun])mapa[mun]=0
mapa[mun]+=Number(i.focos||0)
})

let top10=Object.entries(mapa)
.map(([municipio,focos])=>({municipio,focos}))
.sort((a,b)=>b.focos-a.focos)
.slice(0,10)

if(window.chartTopFocos){
window.chartTopFocos.destroy()
}

window.chartTopFocos=new Chart(canvas,{
type:'bar',
data:{
labels:top10.map(i=>i.municipio),
datasets:[{
label:'Focos de Calor',
data:top10.map(i=>i.focos)
}]
},
options:{
indexAxis:'y',
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{display:false}
}
}
})

}

/*=========================================================
083 QUEIMADAS FUNCTION RENDERGRAFICOFOCOSHISTORICO
=========================================================*/
async function renderGraficoFocosHistorico(){

let canvas=
document.getElementById('graficoFocosHistorico')
||
document.getElementById('graficoEvolucaoMensalRelatorio')
if(!canvas)return

let {data,error}=await client
.from('queimadas_focos')
.select('*')
.order('data_referencia',{ascending:true})

if(error){
console.log(error)
return
}

let mapa={}

;(data||[]).forEach(i=>{

let dataRef=new Date(i.data_referencia)

let chave=
String(dataRef.getMonth()+1)
.padStart(2,'0')
+'/'+
dataRef.getFullYear()

if(!mapa[chave]){
mapa[chave]=0
}

mapa[chave]+=Number(i.focos||0)

})

let labels=Object.keys(mapa)

let valores=Object.values(mapa)

if(window.chartFocosHistorico){
window.chartFocosHistorico.destroy()
}

window.chartFocosHistorico=
new Chart(canvas,{

type:'line',

data:{
labels:labels,
datasets:[
{
label:'Focos de Calor',
data:valores,
borderWidth:3,
tension:0.3,
fill:false
}
]
},

options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
display:true
}
},
scales:{
y:{
beginAtZero:true
}
}
}

})

}
/*=========================================================
084 QUEIMADAS FUNCTION RENDERINDICADORESESTRATEGICOS
=========================================================*/
async function renderIndicadoresEstrategicos(){
let box=document.getElementById('painelIndicadoresEstrategicos')
if(!box)return
let {data:focos}=await client
.from('queimadas_focos')
.select('*')
let {data:heat}=await client
.from('queimadas_heatmap')
.select('*')
let totalFocos=(focos||[])
.reduce((s,i)=>s+Number(i.focos||0),0)
let iriqMedio=await calcularIRIQ()
let faixaIRIQ='BAIXO'
let corIRIQ='#16a34a'

if(Number(iriqMedio)>=75){
faixaIRIQ='CRÍTICO'
corIRIQ='#dc2626'
}else if(Number(iriqMedio)>=50){
faixaIRIQ='ALTO'
corIRIQ='#f97316'
}else if(Number(iriqMedio)>=25){
faixaIRIQ='MODERADO'
corIRIQ='#facc15'
}
let municipiosCriticos=(heat||[])
.filter(i=>i.classificacao==='CRÍTICO')
.length
let municipiosAlto=(heat||[])
.filter(i=>i.classificacao==='ALTO')
.length
let hoje=new Date().toLocaleDateString('pt-BR')
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${Number(totalFocos||0).toLocaleString('pt-BR')}</div>
<div class="chap-label">FOCOS ACUMULADOS</div>
<div style="font-size:11px;margin-top:6px;color:#64748b">
Período analisado
</div>
<div style="font-size:11px;font-weight:700">
01/01/2026 até ${hoje}
</div>
</div>
<div class="chap-card">
<div class="chap-num" style="color:${corIRIQ}">
${iriqMedio}
</div>
<div class="chap-label">
IRIQ MÉDIO ESTADUAL
</div>
<div style="
font-size:13px;
font-weight:900;
color:${corIRIQ};
margin-top:6px;
">
${faixaIRIQ}
</div>
<div style="
font-size:11px;
margin-top:6px;
color:#64748b;
">
60% Risco + 40% CHAP
</div>
</div>
<div class="chap-card">
<div class="chap-num">${municipiosCriticos}</div>
<div class="chap-label">CRÍTICOS</div>
</div>
<div class="chap-card">
<div class="chap-num">${municipiosAlto}</div>
<div class="chap-label">ALTO RISCO</div>
</div>
</div>
<div class="fonte-card">
Fonte: TCE-RO • Sedam • CBMRO • INPE
</div>`
}
/*=========================================================
085 QUEIMADAS FUNCTION RENDERINDICADORESPRESIDENTE
=========================================================*/
async function renderIndicadoresPresidente(){
let box=document.getElementById('painelIndicadoresPresidente')
if(!box)return
let {data:heat=[]}=await client.from('queimadas_heatmap').select('*')
let {data:focos=[]}=await client.from('queimadas_focos').select('*')
let totalFocos=focos.reduce((s,i)=>s+Number(i.focos||0),0)
let criticos=heat.filter(i=>i.classificacao==='CRÍTICO').length
let alto=heat.filter(i=>i.classificacao==='ALTO').length
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${formatarNumero(totalFocos)}</div>
<div class="chap-label">FOCOS ACUMULADOS</div>
</div>
<div class="chap-card">
<div class="chap-num">${criticos}</div>
<div class="chap-label">CRÍTICOS</div>
</div>
<div class="chap-card">
<div class="chap-num">${alto}</div>
<div class="chap-label">ALTO RISCO</div>
</div>
</div>`
}

/*=========================================================
086 QUEIMADAS FUNCTION RENDERSALASITUACAOESTADUAL
=========================================================*/
async function renderSalaSituacaoEstadual(){

let box=document.getElementById('painelSalaSituacaoEstadual')
if(!box)return

let {data:heat}=await client
.from('queimadas_heatmap')
.select('*')

let {data:focos}=await client
.from('queimadas_focos')
.select('*')

let criticos=(heat||[])
.filter(i=>i.classificacao==='CRÍTICO')
.length

let altos=(heat||[])
.filter(i=>i.classificacao==='ALTO')
.length

let focosTotal=(heat||[])
.reduce(
(s,i)=>s+Number(i.focos||0),
0
)

let top10=[...(heat||[])]
.filter(i=>Number(i.focos||0)>0)
.sort((a,b)=>b.focos-a.focos)
.slice(0,10)
<div class="fonte-card">
<b>Data Base:</b> ${new Date().toLocaleDateString('pt-BR')}<br>
<b>Fonte:</b> INPE • Heatmap Estadual • IRIQ • CHAP • IA-CHAP<br>
<b>Municípios Monitorados:</b> ${top10.length}<br>
<b>Municípios Sem Dados:</b> ${(heat||[]).filter(i=>i.classificacao==='SEM DADOS').length}
</div>
box.innerHTML=`

<div class="chap-grid">

<div class="chap-card">
<div class="chap-num">${focosTotal}</div>
<div class="chap-label">
FOCOS ACUMULADOS
</div>
</div>

<div class="chap-card">
<div class="chap-num">${criticos}</div>
<div class="chap-label">
CRÍTICOS
</div>
</div>

<div class="chap-card">
<div class="chap-num">${altos}</div>
<div class="chap-label">
ALTO RISCO
</div>
</div>
<div class="chap-card">
<div class="chap-num">
${(heat||[]).filter(i=>i.classificacao==='SEM DADOS').length}
</div>
<div class="chap-label">
SEM DADOS
</div>
</div>
</div>

<div class="card-executivo">

<h2>
🔥 TOP 10 FOCOS DE CALOR
</h2>

<div class="fonte-card">
Período: Acumulado 2026 • Fonte: INPE
</div>

${top10.map(i=>`

<div style="
display:flex;
justify-content:space-between;
padding:6px;
border-bottom:1px solid #ddd;
">

<div>
<b>${i.municipio}</b><br>
<span style="font-size:11px">
🔥 ${i.focos||0} focos •
📈 ${i.risco||0} risco •
${i.classificacao||'-'}
</span>
</div>

<b>
${i.focos||0}
</b>

</div>

`).join('')}

</div>

<div class="card-executivo">

<h2>
🚨 ALERTAS AUTOMÁTICOS
</h2>
<div class="fonte-card">
Fonte: Heatmap Estadual • INPE • Atualização Automática
</div>

<div style="
padding:10px;
font-size:13px;
line-height:1.6;
">

${criticos>0
?`🚨 ${criticos} municípios classificados como CRÍTICOS.<br>`
:'✅ Nenhum município crítico.<br>'}

${focosTotal>500
?'🔥 Quantidade elevada de focos detectados.<br>'
:'✅ Focos sob controle.<br>'}

${altos>0
?`⚠ ${altos} municípios classificados como ALTO RISCO.<br>`
:'✅ Sem municípios em alto risco.<br>'}
</div>

</div>

`
}
/*=========================================================
087 QUEIMADAS FUNCTION ABRIR ABA CARD
=========================================================*/
function abrirCardQueimadas(aba){
mostrarAbaQueimadas(aba)
window.scrollTo({
top:0,
behavior:'smooth'
})
}
async function recalcularIMC(){
await calcularIMC()
await renderRankingIMC()
}

function formatarArea(v){
return Number(v||0)
.toLocaleString('pt-BR',{
minimumFractionDigits:2,
maximumFractionDigits:2
})
+' km²'
}
/*=========================================================
088 QUEIMADAS FUNCTION RENDERMUNICIPIOSOFICIO
=========================================================*/
async function renderMunicipiosOficio(){
let box=document.getElementById('painelMunicipiosOficio')
if(!box)return
let {data:kpi}=await client
.from('vw_queimadas_kpis_resposta')
.select('*')
.limit(1)
let k=kpi&&kpi.length?kpi[0]:{}
box.innerHTML=`
<div class="chap-grid">

<div class="chap-card">
<div class="chap-num">${k.total_municipios||52}</div>
<div class="chap-label">MUNICÍPIOS OFICIADOS</div>
<div class="fonte-card">Fonte: Ofício Circular n.16/2026/GABPRES/TCERO</div>
</div>

<div class="chap-card">
<div class="chap-num" style="color:#16a34a">${k.planos_apresentados||0}</div>
<div class="chap-label">PLANO APRESENTADO</div>
<div class="fonte-card">Classificação Verde</div>
</div>

<div class="chap-card">
<div class="chap-num" style="color:#facc15">${k.dilacao_prazo||0}</div>
<div class="chap-label">DILAÇÃO DE PRAZO</div>
<div class="fonte-card">Classificação Amarela</div>
</div>

<div class="chap-card">
<div class="chap-num" style="color:#dc2626">${k.sem_resposta||0}</div>
<div class="chap-label">SEM RESPOSTA</div>
<div class="fonte-card">Classificação Vermelha</div>
</div>

</div>
`
}
/*=========================================================
089 QUEIMADAS FUNCTION RENDERMUNICIPIOSSEMRESPOSTA
=========================================================*/
async function renderMunicipiosSemResposta(){
let box=document.getElementById('painelMunicipiosSemResposta')
if(!box)return
let {data,error}=await client
.from('queimadas_municipios_oficio')
.select('*')
.eq('classificacao_cor','VERMELHO')
.order('municipio')
if(error){
console.log(error)
return
}
let html='<div class="heatmap-grid">'
;(data||[]).forEach(i=>{
html+=`
<div class="heat-vermelho">
<div class="heat-municipio">${i.municipio||'-'}</div>
<div class="heat-info">
Situação: SEM RESPOSTA<br>
Ofício: ${i.nroficioenviadotcero||'-'}<br>
Envio: ${i.dataenviodoc||'-'}
</div>
<div class="fonte-card">
Fonte: Ofício Circular n.16/2026/GABPRES/TCERO
</div>
</div>`
})
html+='</div>'
box.innerHTML=html
}
/*=========================================================
090 QUEIMADAS FUNCTION RENDERKPISMUNICIPAIS
=========================================================*/
async function renderKPIsMunicipais(){
let box=document.getElementById('painelKPIsMunicipais')
if(!box)return
let {data,error}=await client
.from('vw_queimadas_kpis_resposta')
.select('*')
.limit(1)
if(error){
console.log(error)
return
}
let k=(data&&data.length)?data[0]:{}
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">
${k.total_municipios||52}
</div>
<div class="chap-label">
MUNICÍPIOS OFICIADOS
</div>
<div class="fonte-card">
Fonte: Ofício Circular n.16/2026/GABPRES/TCERO
</div>
</div>
<div class="chap-card">
<div class="chap-num" style="color:#16a34a">
${k.planos_apresentados||0}
</div>
<div class="chap-label">
PLANO APRESENTADO
</div>
<div class="fonte-card">
Classificação Verde
</div>
</div>

<div class="chap-card">
<div class="chap-num" style="color:#facc15">
${k.dilacao_prazo||0}
</div>
<div class="chap-label">
DILAÇÃO DE PRAZO
</div>
<div class="fonte-card">
Classificação Amarela
</div>
</div>

<div class="chap-card">
<div class="chap-num" style="color:#dc2626">
${k.sem_resposta||0}
</div>
<div class="chap-label">
SEM RESPOSTA
</div>
<div class="fonte-card">
Classificação Vermelha
</div>
</div>

</div>
`
}
/*=========================================================
091 QUEIMADAS FUNCTION RENDERPLANOSAPRESENTADOS
=========================================================*/
async function renderPlanosApresentados(){
let box=document.getElementById('painelPlanosApresentados')
if(!box)return
let {data,error}=await client.from('queimadas_municipios_oficio').select('*').eq('classificacao_cor','VERDE').order('municipio')
if(error){
console.log(error)
return
}
let html='<table class="tabelaMiniMunicipios"><tr><th>Município</th><th>Recebimento</th></tr>'
;(data||[]).forEach(i=>{
html+=`<tr><td>${i.municipio||'-'}</td><td>${formatarDataBR(i.ldatarecebimentodoc)}</td></tr>`
})
html+='</table>'
box.innerHTML=html
}
/*=========================================================
092 QUEIMADAS FUNCTION RENDERDILACOESPRAZO
=========================================================*/
async function renderDilacoesPrazo(){
let box=document.getElementById('painelDilacoesPrazo')
if(!box)return
let {data,error}=await client.from('queimadas_municipios_oficio').select('*').eq('classificacao_cor','AMARELO').order('municipio')
if(error){
console.log(error)
return
}
let html='<table class="tabelaMiniMunicipios"><tr><th>Município</th><th>Recebimento</th></tr>'
;(data||[]).forEach(i=>{
html+=`<tr><td>${i.municipio||'-'}</td><td>${formatarDataBR(i.ldatarecebimentodoc)}</td></tr>`
})
html+='</table>'
box.innerHTML=html
}
/*=========================================================
093 QUEIMADAS FUNCTION RENDERSEMRESPOSTA
=========================================================*/
async function renderSemResposta(){
let box=document.getElementById('painelSemResposta')
if(!box)return
let {data,error}=await client.from('queimadas_municipios_oficio').select('*').eq('classificacao_cor','VERMELHO').order('municipio')
if(error){
console.log(error)
return
}
let html='<table class="tabelaMiniMunicipios"><tr><th>Município</th><th>Recebimento</th></tr>'
;(data||[]).forEach(i=>{
html+=`<tr><td>${i.municipio||'-'}</td><td>${formatarDataBR(i.ldatarecebimentodoc)}</td></tr>`
})
html+='</table>'
box.innerHTML=html
}
/*=========================================================
094 QUEIMADAS FUNCTION RENDERGRAFICOMUNICIPIOS
=========================================================*/
async function renderGraficoMunicipios(){

let canvas=document.getElementById('graficoMunicipiosResposta')

if(!canvas)return

let {data,error}=await client
.from('vw_queimadas_kpis_resposta')
.select('*')
.limit(1)

if(error){
console.log(error)
return
}

let k=(data&&data.length)?data[0]:{}

if(window.chartMunicipiosResposta){
window.chartMunicipiosResposta.destroy()
}

window.chartMunicipiosResposta=new Chart(
canvas,
{
type:'doughnut',
data:{
labels:[
'Plano Apresentado',
'Dilação de Prazo',
'Sem Resposta'
],
datasets:[
{
data:[
Number(k.planos_apresentados||0),
Number(k.dilacao_prazo||0),
Number(k.sem_resposta||0)
],
backgroundColor:[
'#16a34a',
'#facc15',
'#dc2626'
],
borderWidth:2
}
]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
position:'bottom'
},
title:{
display:true,
text:'Situação dos Municípios Oficiados'
},
datalabels:{
color:'#000',
font:{
weight:'bold'
},
formatter:(v)=>v
}
}
}
}
)

}
/*=========================================================
095 QUEIMADAS FUNCTION RENDERTABELAMUNICIPIOS
=========================================================*/
async function renderTabelaMunicipios(){
let box=document.getElementById('painelTabelaMunicipios')
if(!box)return
let filtro=document.getElementById('filtroMunicipioSituacao')?.value||''
let busca=(document.getElementById('buscaMunicipio')?.value||'').toUpperCase()
let query=client
.from('queimadas_municipios_oficio')
.select('*')
.order('municipio')
if(filtro){
query=query.eq('classificacao_cor',filtro)
}
let {data,error}=await query
if(error){
console.log(error)
return
}
let lista=(data||[])
if(busca){
lista=lista.filter(i=>
String(i.municipio||'')
.toUpperCase()
.includes(busca)
)
}
let html=''
html+=`
<table class="tabelaMunicipios">
<thead>
<tr>
<th>MUNICÍPIO</th>
<th>SITUAÇÃO</th>
<th>DOCUMENTO</th>
<th>RECEBIMENTO</th>
<th>OBSERVAÇÃO</th>
</tr>
</thead>
<tbody>
`
lista.forEach(i=>{
let cor='#64748b'
if(i.classificacao_cor==='VERDE')cor='#16a34a'
if(i.classificacao_cor==='AMARELO')cor='#facc15'
if(i.classificacao_cor==='VERMELHO')cor='#dc2626'
html+=`
<tr>
<td><b>${i.municipio||'-'}</b></td>
<td style="color:${cor};font-weight:900">
${i.classificacao_ia||'-'}
</td>
<td>
${i.lnumerodocenviado||i.llnumerodocenviado||'-'}
</td>
<td>
${formatarDataBR(i.ldatarecebimentodoc)}
</td>
<td>
${i.observacao||'-'}
</td>
</tr>
`
})
html+=`
</tbody>
</table>
<div class="fonte-card">
Fonte: Ofício Circular n.16/2026/GABPRES/TCERO
</div>
`
box.innerHTML=html
}
/*=========================================================
096 QUEIMADAS FUNCTION RENDERMAPAMUNICIPAL
=========================================================*/
async function renderMapaMunicipal(){
let box=document.getElementById('mapaMunicipalRO')
if(!box)return
if(!document.body.contains(box))return
if(box.offsetWidth===0)return
if(box.offsetHeight===0)return
if(window.mapaMunicipalRO){
window.mapaMunicipalRO.remove()
window.mapaMunicipalRO=null
}
window.mapaMunicipalRO=L.map(box).setView([-10.9,-63.3],7)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
attribution:'OpenStreetMap'
}).addTo(window.mapaMunicipalRO)

let {data,error}=await client
.from('queimadas_municipios_oficio')
.select('*')

if(error){
console.log(error)
return
}

let situacao={}
;(data||[]).forEach(i=>{
situacao[(i.municipio||'').trim().toUpperCase()]=i
})

let geo=await fetch('./assets/geojson/municipios-ro.geojson')
console.log('GeoJSON status:',geo.status)
let geojson=await geo.json()
console.log('Features:',geojson.features?.length)
console.log('Criando layer municipal')
window.layerMunicipios=L.geoJSON(geojson,{
style:f=>{
let nome=
String(
f.properties.nome||
f.properties.NOME||
f.properties.municipio||
''
)
.trim()
.toUpperCase()

let m=situacao[nome]

let cor='#94a3b8'

if(m){
if(m.classificacao_cor==='VERDE')cor='#16a34a'
if(m.classificacao_cor==='AMARELO')cor='#facc15'
if(m.classificacao_cor==='VERMELHO')cor='#dc2626'
}

return{
color:'#ffffff',
weight:1,
fillColor:cor,
fillOpacity:.85
}
},
onEachFeature:(f,l)=>{

let nome=
String(
f.properties.nome||
f.properties.NOME||
f.properties.municipio||
''
)

let m=situacao[nome.trim().toUpperCase()]
l.dadosMunicipio=m
if(!m){
l.bindPopup(`
<b>${nome}</b><br>
Sem classificação
`)
return
}

l.bindPopup(`
<b>${m.municipio||nome}</b><br>
Situação: ${m.classificacao_ia||'-'}<br>
Documento: ${m.lnumerodocenviado||m.llnumerodocenviado||'-'}<br>
Recebimento: ${m.ldatarecebimentodoc||'-'}<br>
${m.observacao||'-'}
`)
}
}).addTo(window.mapaMunicipalRO)

window.mapaMunicipalRO.fitBounds(
window.layerMunicipios.getBounds()
)
}
/*=========================================================
097 QUEIMADAS FUNCTION FILTRARMAPAMUNICIPAL
=========================================================*/
function filtrarMapaMunicipal(tipo){
let layer=window.layerMunicipiosPlanos||window.layerMunicipios
if(!layer)return
layer.eachLayer(l=>{
let m=l.dadosMunicipio
if(!m){
l.setStyle({fillOpacity:.15,weight:1})
return
}
if(tipo==='TODOS'){
l.setStyle({fillOpacity:.85,weight:1})
return
}
if(m.classificacao_cor===tipo){
l.setStyle({fillOpacity:.95,weight:3})
}else{
l.setStyle({fillOpacity:.10,weight:1})
}
})
}
/*=========================================================
098 QUEIMADAS FUNCTION RENDERESTATISTICASMUNICIPAIS
=========================================================*/
async function renderEstatisticasMunicipais(){
let box=document.getElementById('painelEstatisticasMunicipais')
if(!box)return
let {data,error}=await client
.from('vw_queimadas_kpis_resposta')
.select('*')
.limit(1)
if(error){
console.log(error)
return
}
let k=(data&&data.length)?data[0]:{}
let total=Number(k.total_municipios||0)
let planos=Number(k.planos_apresentados||0)
let dilacoes=Number(k.dilacao_prazo||0)
let semResposta=Number(k.sem_resposta||0)
let pPlanos=total?((planos/total)*100).toFixed(1):0
let pDilacoes=total?((dilacoes/total)*100).toFixed(1):0
let pSemResposta=total?((semResposta/total)*100).toFixed(1):0
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num" style="color:#16a34a">${pPlanos}%</div>
<div class="chap-label">PLANO APRESENTADO</div>
<div class="fonte-card">26 de 52 municípios</div>
</div>
<div class="chap-card">
<div class="chap-num" style="color:#ca8a04">${pDilacoes}%</div>
<div class="chap-label">DILAÇÃO DE PRAZO</div>
<div class="fonte-card">6 de 52 municípios</div>
</div>
<div class="chap-card">
<div class="chap-num" style="color:#dc2626">${pSemResposta}%</div>
<div class="chap-label">SEM RESPOSTA</div>
<div class="fonte-card">20 de 52 municípios</div>
</div>
</div>
<div class="fonte-card">
Fonte: Ofício Circular n.16/2026/GABPRES/TCERO • Respostas dos Municípios
</div>
`
}
/*=========================================================
099 QUEIMADAS FUNCTION RENDERCADASTROMUNICIPIOS
=========================================================*/
async function renderCadastroMunicipios(){
let box=document.getElementById('painelCadastroMunicipios')
if(!box)return
let busca=(document.getElementById('pesquisaCadastroMunicipio')?.value||'').toUpperCase()
let {data,error}=await client
.from('queimadas_municipios_oficio')
.select('*')
.order('municipio')
if(error){
console.log(error)
return
}
let lista=(data||[])
if(busca){
lista=lista.filter(i=>
String(i.municipio||'')
.toUpperCase()
.includes(busca)
)
}
let html=''
html+=`
<table class="tabelaMunicipios">
<thead>
<tr>
<th>MUNICÍPIO</th>
<th>OFÍCIO TCE</th>
<th>DATA ENVIO</th>
<th>PÁG ENVIO</th>
<th>DATA REC 1</th>
<th>DATA REC 2</th>
<th>DOC 1</th>
<th>DOC 2</th>
<th>OBSERVAÇÃO</th>
<th>AÇÃO</th>
</tr>
</thead>
<tbody>
`
lista.forEach(i=>{
html+=`
<tr>
<td>${i.municipio||'-'}</td>
<td>${i.nroficioenviadotcero||'-'}</td>
<td>${formatarDataBR(i.dataenviodoc)}</td>
<td>${i.paginaenviodoc||'-'}</td>
<td>${formatarDataBR(i.ldatarecebimentodoc)}</td>
<td>${i.lldatarecebimentodoc||'-'}</td>
<td>${i.lnumerodocenviado||'-'}</td>
<td>${i.llnumerodocenviado||'-'}</td>
<td>${i.observacao||'-'}</td>
<td><button class="btnEditarMunicipio" onclick="editarMunicipio(${i.id})">✏ EDITAR</button></td>
</tr>
`
})
html+=`
</tbody>
</table>
`
box.innerHTML=html
}
/*=========================================================
100 QUEIMADAS FUNCTION EDITARMUNICIPIO
=========================================================*/
async function editarMunicipio(id){
let {data,error}=await client
.from('queimadas_municipios_oficio')
.select('*')
.eq('id',id)
.single()
if(error||!data)return

let situacao=prompt(
'Situação:\nVERDE\nAMARELO\nVERMELHO',
data.classificacao_cor||''
)

if(!situacao)return

let documento=prompt(
'Documento recebido:',
data.lnumerodocenviado||''
)

let observacao=prompt(
'Observação:',
data.observacao||''
)

await client
.from('queimadas_municipios_oficio')
.update({
classificacao_cor:situacao.toUpperCase(),
observacao:observacao,
lnumerodocenviado:documento,
plano_acao:situacao.toUpperCase()==='VERDE',
dilacao_prazo:situacao.toUpperCase()==='AMARELO',
sem_resposta:situacao.toUpperCase()==='VERMELHO'
})
.eq('id',id)

await renderCadastroMunicipios()
}

/*=========================================================
101 QUEIMADAS INIT
=========================================================*/
document.addEventListener('DOMContentLoaded',async()=>{
let abaSalva=localStorage.getItem('abaQueimadas')||'executivo'
mostrarAbaQueimadas(abaSalva)
if(typeof renderMapaMunicipios==='function'){
await renderMapaMunicipios()
await renderMapaEstadual()
}

if(typeof renderGeoJSONRO==='function'){
await renderGeoJSONRO()
}
if(typeof renderUCs==='function'){
await renderUCs()
}
})
/*=========================================================
102 TOGGLE MAPA RO
=========================================================*/
function toggleMapaRO(){
let box=document.getElementById('MapaRO')
let btn=document.querySelector('.btnOcultarMapa')
if(!box)return
if(box.style.display==='none'){
box.style.display='block'
if(btn)btn.innerHTML='👁 OCULTAR MAPA'
setTimeout(()=>{
window.mapaExecutivoRO?.invalidateSize()
},300)
}else{
box.style.display='none'
if(btn)btn.innerHTML='👁 EXIBIR MAPA'
}
}
/*=========================================================
103 EXECUTIVO MUNICIPAL TABELA GERAL
=========================================================*/
async function renderSituacaoGeralMunicipios(){
let box=document.getElementById('painelSituacaoGeralMunicipios')
if(!box)return
let {data,error}=await client.from('queimadas_municipios_oficio').select('*').order('municipio')
if(error){
console.log(error)
box.innerHTML='Erro ao carregar.'
return
}
let html=''
html+='<div style="overflow:auto">'
html+='<table class="tabelaMunicipalExecutiva">'
html+='<thead>'
html+='<tr>'
html+='<th>Nº</th>'
html+='<th>Município</th>'
html+='<th>Situação</th>'
html+='<th>Data</th>'
html+='<th>Documento</th>'
html+='<th>Observação</th>'
html+='</tr>'
html+='</thead>'
html+='<tbody>'
;(data||[]).forEach((i,idx)=>{
let situacao='🔴 Sem Plano de Ação'
if(i.classificacao_cor==='VERDE')situacao='🟢 Com Plano de Ação'
if(i.classificacao_cor==='AMARELO')situacao='🟡 Dilação de Prazo'
html+=`
<tr>
<td>${idx+1}</td>
<td>${i.municipio||'-'}</td>
<td>${situacao}</td>
<td>${formatarDataBR(i.ldatarecebimentodoc)}</td>
<td>${i.lnumerodocenviado||i.llnumerodocenviado||'-'}</td>
<td>${i.observacao||'-'}</td>
</tr>`
})
html+='</tbody>'
html+='</table>'
html+='</div>'
box.innerHTML=html
}
/*=========================================================
104 QUEIMADAS FUNCTION RESUMO CADASTRO MUNICIPAL
=========================================================*/
async function renderCadastroMunicipiosResumo(){
let box=document.getElementById('painelCadastroMunicipiosResumo')
if(!box)return
let {data,error}=await client.from('queimadas_municipios_oficio').select('*').order('municipio')
if(error){
console.log(error)
return
}
let html='<div style="overflow:auto">'
html+='<table class="tabelaMunicipios">'
html+='<thead>'
html+='<tr>'
html+='<th>Município</th>'
html+='<th>Ofício TCE-RO</th>'
html+='<th>Data Envio</th>'
html+='<th>Página Envio</th>'
html+='<th>Data Rec. 1</th>'
html+='<th>Data Rec. 2</th>'
html+='<th>Doc. 1</th>'
html+='<th>Doc. 2</th>'
html+='<th>Observação</th>'
html+='<th>Ação</th>'
html+='</tr>'
html+='</thead>'
html+='<tbody>'
;(data||[]).forEach(i=>{
html+=`
<tr>
<td>${i.municipio||'-'}</td>
<td>${i.nroficioenviadotcero||'-'}</td>
<td>${formatarDataBR(i.dataenviodoc)}</td>
<td>${i.paginaenviodoc||'-'}</td>
<td>${formatarDataBR(i.ldatarecebimentodoc)}</td>
<td>${i.lldatarecebimentodoc||'-'}</td>
<td>${i.lnumerodocenviado||'-'}</td>
<td>${i.llnumerodocenviado||'-'}</td>
<td>${i.observacao||'-'}</td>
<td><button class="btnEditarMunicipio" onclick="editarMunicipio(${i.id})">✏ EDITAR</button></td>
</tr>`
})
html+='</tbody>'
html+='</table>'
html+='</div>'
box.innerHTML=html
}
/*=========================================================
105 QUEIMADAS FUNCTION EDITARMUNICIPIO
=========================================================*/
async function editarMunicipio(id){

let {data,error}=await client
.from('queimadas_municipios_oficio')
.select('*')
.eq('id',id)
.single()

if(error){
console.log(error)
alert('Registro não encontrado.')
return
}

let html=''

html+=`
<div id="modalMunicipio" class="modalMunicipioOverlay">

<div class="modalMunicipioBox">

<h2>🏛️ Cadastro Municipal</h2>

<label>Município</label>
<input id="mMunicipio" value="${data.municipio||''}">

<label>Ofício TCE-RO</label>
<input id="mOficio" value="${data.nroficioenviadotcero||''}">

<label>Data Envio</label>
<input id="mDataEnvio" type="date" value="${data.dataenviodoc||''}">

<label>Página Envio</label>
<input id="mPaginaEnvio" value="${data.paginaenviodoc||''}">

<label>Data Recebimento 1</label>
<input id="mDataRec1" type="date" value="${data.ldatarecebimentodoc||''}">

<label>Data Recebimento 2</label>
<input id="mDataRec2" value="${data.lldatarecebimentodoc||''}">

<label>Página Recebimento 1</label>
<input id="mPagRec1" value="${data.lpaginarecebimentodoc||''}">

<label>Página Recebimento 2</label>
<input id="mPagRec2" value="${data.llpaginarecebimentodoc||''}">

<label>Documento Recebido 1</label>
<input id="mDoc1" value="${data.lnumerodocenviado||''}">

<label>Documento Recebido 2</label>
<input id="mDoc2" value="${data.llnumerodocenviado||''}">

<label>Observação</label>
<textarea id="mObs">${data.observacao||''}</textarea>

<div class="modalMunicipioBotoes">

<button class="btnSalvarMunicipio" onclick="salvarMunicipio(${id})">
💾 SALVAR
</button>

<button class="btnCancelarMunicipio" onclick="fecharModalMunicipio()">
❌ CANCELAR
</button>

</div>

</div>

</div>
`

document.body.insertAdjacentHTML('beforeend',html)

}
/*=========================================================
106 QUEIMADAS FUNCTION FECHARMODALMUNICIPIO
=========================================================*/
function fecharModalMunicipio(){
let modal=document.getElementById('modalMunicipio')
if(modal)modal.remove()
}
/*=========================================================
107 QUEIMADAS FUNCTION SALVARMUNICIPIO
=========================================================*/
async function salvarMunicipio(id){
let payload={
municipio:document.getElementById('mMunicipio').value,
nroficioenviadotcero:document.getElementById('mOficio').value,
dataenviodoc:document.getElementById('mDataEnvio').value,
paginaenviodoc:document.getElementById('mPaginaEnvio').value,
ldatarecebimentodoc:document.getElementById('mDataRec1').value,
lldatarecebimentodoc:document.getElementById('mDataRec2').value,
lpaginarecebimentodoc:document.getElementById('mPagRec1').value,
llpaginarecebimentodoc:document.getElementById('mPagRec2').value,
lnumerodocenviado:document.getElementById('mDoc1').value,
llnumerodocenviado:document.getElementById('mDoc2').value,
observacao:document.getElementById('mObs').value
}
let {error}=await client
.from('queimadas_municipios_oficio')
.update(payload)
.eq('id',id)
if(error){
console.log(error)
alert('Erro ao salvar.')
return
}
fecharModalMunicipio()
await renderCadastroMunicipios()
if(typeof renderTabelaMunicipios==='function')
await renderTabelaMunicipios()
if(typeof renderSituacaoGeralMunicipios==='function')
await renderSituacaoGeralMunicipios()
alert('Registro atualizado com sucesso.')
}

