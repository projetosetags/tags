/*=========================================================
100 QUEIMADAS FUNCTION RENDERTOPCRITICOS
=========================================================*/
async function renderTopCriticos(){
let box=document.getElementById('painelTopCriticos')
if(!box)return
let{data=[]}=await client
.from('vw_queimadas_ranking_estadual')
.select('*')
.order('indice_final',{ascending:false})
let lista=data.filter(i=>Number(i.indice_final||i.iriq||0)>=75).slice(0,10)
let html=`<div class="cardExecutivo"><h2>🚨 MUNICÍPIOS CRÍTICOS</h2>`
if(!lista.length){
html+='<div>Nenhum município crítico identificado.</div>'
}else{
lista.forEach((m,i)=>{
html+=`
<div style="padding:10px;border-bottom:1px solid #e5e7eb">
<b>${i+1}º ${m.municipio}</b><br>
🔥 Área Queimada: ${Number(m.area_queimada_ha||0).toLocaleString('pt-BR')} ha<br>
🌳 Desmatamento: ${Number(m.desmatamento_ha||0).toLocaleString('pt-BR')} ha<br>
🤖 IRIQ: ${Number(m.indice_final||m.iriq||0).toFixed(2)}<br>
🔴 Classificação: ${m.classificacao||'CRÍTICO'}
</div>`
})
}
html+=`<div class="fonte-card">Fonte: MAPBIOMAS • PRODES • IRIQ Estadual 2026</div></div>`
box.innerHTML=html
}
/*=========================================================
101 QUEIMADAS FUNCTION RENDERTOPRISCOS
=========================================================*/
async function renderTopRiscos(){
let box=document.getElementById('painelTopRiscos')
if(!box)return
let{data=[]}=await client
.from('queimadas_riscos')
.select('*')
.order('nivel_risco',{ascending:false})
.limit(10)
box.innerHTML=`
<div class="cardExecutivo">
<h2>⚠️ TOP 10 RISCOS</h2>
${data.map(i=>`
<div style="padding:8px;border-bottom:1px solid #e5e7eb">
${i.risco||'-'} - Nível ${i.nivel_risco||0}
</div>
`).join('')}
</div>`
}
/*=========================================================
102 QUEIMADAS FUNCTION RENDERTOPIACHAP
=========================================================*/
async function renderTopIAChap(){
let box=document.getElementById('painelTopIAChap')
if(!box)return
let{data=[]}=await client
.from('queimadas_chap')
.select('*')
.order('resultado',{ascending:false})
.limit(10)
box.innerHTML=`
<div class="cardExecutivo">
<h2>🤖 TOP IA-CHAP</h2>
${data.map(i=>`
<div class="linha-queimadas">
${i.municipio||'-'} • Score ${Number(i.resultado||0).toFixed(2)}
</div>
`).join('')}
</div>`
}
/*=========================================================
103 QUEIMADAS FUNCTION RENDERALERTAS
=========================================================*/
async function renderAlertas(){
let box=document.getElementById('painelAlertas')
if(!box)return
let{data=[]}=await client
.from('vw_queimadas_ranking_estadual')
.select('*')
.order('indice_final',{ascending:false})
let lista=data.slice(0,5)
let hoje=new Date().toLocaleDateString('pt-BR')
box.innerHTML=`
<div class="fonte-card">
Período: Exercício 2026 • Fontes: MAPBIOMAS • PRODES • IRIQ
</div>
${lista.map((i,idx)=>{
let cor='#16a34a'
let score=Number(i.indice_final||i.iriq||0)
if(score>=75)cor='#dc2626'
else if(score>=50)cor='#f97316'
else if(score>=25)cor='#facc15'
return`
<div class="alerta-ranking">
<div class="alerta-numero">${idx+1}</div>
<div class="alerta-texto">
<b>${i.municipio}</b><br>
<span style="color:${cor};font-weight:900">${i.classificacao||'-'}</span><br>
🔥 Área Queimada: ${Number(i.area_queimada_ha||0).toLocaleString('pt-BR')} ha<br>
🌳 Desmatamento: ${Number(i.desmatamento_ha||0).toLocaleString('pt-BR')} ha<br>
🤖 IRIQ: ${score.toFixed(2)}
</div>
</div>`
}).join('')}
<div class="fonte-card">
Fonte: MAPBIOMAS • PRODES • Atualizado em ${hoje}
</div>`
}
/*=========================================================
104 QUEIMADAS FUNCTION CALCULARIRIQMUNICIPAL
=========================================================*/
async function calcularIRIQMunicipal(){
let{data:ranking=[]}=await client
.from('vw_queimadas_ranking_estadual')
.select('*')
for(let m of ranking){
let areaQueimada=Number(m.area_queimada_ha||0)
let desmatamento=Number(m.desmatamento_ha||0)
let chap=Number(m.chap_score||50)
let risco=Number(m.risco_score||50)
let indice=(risco*0.30)+(chap*0.10)+(Math.min(areaQueimada/1000,100)*0.35)+(Math.min(desmatamento/1000,100)*0.25)
let classificacao='BAIXO'
let semaforo='🟢'
if(indice>=75){
classificacao='CRÍTICO'
semaforo='🔴'
}else if(indice>=50){
classificacao='ALTO'
semaforo='🟠'
}else if(indice>=25){
classificacao='MODERADO'
semaforo='🟡'
}
await client
.from('queimadas_heatmap')
.upsert([{
municipio:m.municipio,
area_queimada_ha:areaQueimada,
desmatamento_ha:desmatamento,
indice_final:Number(indice.toFixed(2)),
classificacao,
semaforo
}],{onConflict:'municipio'})
}
}
/*=========================================================
105 QUEIMADAS FUNCTION RENDERMUNICIPIOSSEMEVIDENCIAS
=========================================================*/
async function renderMunicipiosSemEvidencias(){
let box=document.getElementById('painelSemEvidencias')
if(!box)return
let{data:municipios=[]}=await client.from('vw_queimadas_ranking_estadual').select('municipio')
let{data:evidencias=[]}=await client.from('queimadas_evidencias').select('municipio')
let lista=municipios.filter(m=>!evidencias.some(e=>normalizarMunicipio(e.municipio)===normalizarMunicipio(m.municipio))).slice(0,10)
box.innerHTML=lista.map(i=>`
<div class="alerta-vermelho">
⚠ ${i.municipio}
</div>
`).join('')
}
/*=========================================================
106 QUEIMADAS FUNCTION RENDERPRESIDENTE
=========================================================*/
async function renderPresidente(){
let box=document.getElementById('painelPresidente')
if(!box)return
let{data}=await client
.from('vw_queimadas_painel_presidente')
.select('*')
.single()
if(!data)return
box.innerHTML=`
<div class="kpiGrid">
<div class="kpiCard">
<div class="kpiNumero">${data.total_municipios||52}</div>
<div class="kpiTitulo">MUNICÍPIOS</div>
</div>
<div class="kpiCard">
<div class="kpiNumero">${data.municipios_criticos||0}</div>
<div class="kpiTitulo">🔴 CRÍTICOS</div>
</div>
<div class="kpiCard">
<div class="kpiNumero">${data.municipios_moderados||0}</div>
<div class="kpiTitulo">🟡 MODERADOS</div>
</div>
<div class="kpiCard">
<div class="kpiNumero">${Number(data.desmatamento_total_ha||0).toLocaleString('pt-BR')}</div>
<div class="kpiTitulo">🌳 DESMATAMENTO (ha)</div>
</div>
<div class="kpiCard">
<div class="kpiNumero">${Number(data.area_queimada_total_ha||0).toLocaleString('pt-BR')}</div>
<div class="kpiTitulo">🔥 ÁREA QUEIMADA (ha)</div>
</div>
<div class="kpiCard">
<div class="kpiNumero">${Number(data.iriq_estadual||0).toFixed(2)}</div>
<div class="kpiTitulo">🤖 IRIQ ESTADUAL</div>
</div>
</div>`
}
/*=========================================================
107 QUEIMADAS FUNCTION RENDERRANKINGIRIQ
=========================================================*/
async function renderRankingIRIQ(){
let box=document.getElementById('painelTopMunicipios')
if(!box)return
let{data=[]}=await client
.from('vw_queimadas_ranking_estadual')
.select('*')
.order('indice_final',{ascending:false})
box.innerHTML=`
<div class="fonte-card">
Ranking Estadual IRIQ • TCERO • MAPBIOMAS • PRODES • CHAP
</div>
${data.map((m,i)=>`
<div class="linha-ranking">
<span style="font-weight:900;width:40px;display:inline-block">${i+1}º</span>
<span style="font-size:18px">${m.semaforo||'⚪'}</span>
<b>${m.municipio}</b>
<span style="float:right">
IRIQ ${Number(m.indice_final||m.iriq||0).toFixed(2)}
</span>
<br>
${m.classificacao||'BAIXO'}
</div>
`).join('')}
<div class="fonte-card">
Fonte: IRIQ Ambiental • MAPBIOMAS • PRODES • CHAP
</div>`
}
/*=========================================================
108 QUEIMADAS FUNCTION CALCULARPOPULACAOEXPOSTA
=========================================================*/
async function calcularPopulacaoExposta(){
let{data=[]}=await client
.from('vw_queimadas_ranking_estadual')
.select('*')
let total=0
data.forEach(m=>{
let score=Number(m.indice_final||m.iriq||0)
let peso=0.25
if(score>=75)peso=1
else if(score>=50)peso=0.75
else if(score>=25)peso=0.50
total+=Number(m.populacao||0)*peso
})
return Math.round(total)
}
/*=========================================================
109 QUEIMADAS FUNCTION CALCULARAREARISCO
=========================================================*/
async function calcularAreaRisco(){
let{data=[]}=await client
.from('vw_queimadas_ranking_estadual')
.select('*')
let total=0
data.forEach(m=>{
let score=Number(m.indice_final||m.iriq||0)
let peso=0.25
if(score>=75)peso=1
else if(score>=50)peso=0.75
else if(score>=25)peso=0.50
total+=Number(m.area_territorial_km2||m.area_km2||0)*peso
})
return total.toFixed(0)
}
/*=========================================================
110 QUEIMADAS FUNCTION CALCULARIRIQ
=========================================================*/
async function calcularIRIQ(){
let{data:heat=[]}=await client
.from('vw_queimadas_ranking_estadual')
.select('*')
if(!heat.length)return'0.0'
let soma=0
heat.forEach(i=>{
soma+=Number(i.indice_final||i.iriq||0)
})
let iriq=soma/heat.length
if(iriq>100)iriq=100
if(iriq<0)iriq=0
return iriq.toFixed(2)
}
/*=========================================================
111 QUEIMADAS FUNCTION RENDERPLANOSMUNICIPAIS
=========================================================*/
async function renderPlanosMunicipais(){
let box=document.getElementById('painelPlanosMunicipais')
if(!box)return
let{data=[]}=await client.from('queimadas_municipios_oficio').select('*').order('municipio')
let{data:ranking=[]}=await client.from('vw_queimadas_ranking_estadual').select('*').order('indice_final',{ascending:false})
let comPlano=data.filter(i=>String(i.classificacao_cor||'').toUpperCase()==='VERDE')
let dilacao=data.filter(i=>String(i.classificacao_cor||'').toUpperCase()==='AMARELO')
let semPlano=data.filter(i=>String(i.classificacao_cor||'').toUpperCase()==='VERMELHO')
let rankingHTML=''
ranking.slice(0,6).forEach((m,i)=>{
rankingHTML+=`
<div style="margin:4px 0">
<b>${i+1}º ${m.municipio}</b>
&nbsp;|&nbsp;
IRIQ: <b>${Number(m.indice_final||m.iriq||0).toFixed(2)}</b>
&nbsp;|&nbsp;
Área Queimada: <b>${Number(m.area_queimada_ha||0).toLocaleString('pt-BR')}</b>
&nbsp;|&nbsp;
Desmatamento: <b>${Number(m.desmatamento_ha||0).toLocaleString('pt-BR')}</b>
</div>`
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
<div class="chap-label">SEM PLANO</div>
</div>
</div>
<div style="margin-top:15px;padding:12px;border-radius:10px;background:#fef2f2;border:2px solid #dc2626">
<div style="font-size:16px;font-weight:900;margin-bottom:8px;color:#991b1b">
🔥 TOP MUNICÍPIOS PRIORITÁRIOS
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
<h3 style="color:#dc2626">🚨 MUNICÍPIOS SEM PLANO</h3>
${semPlano.map(i=>i.municipio).join(' • ')}
</div>`
}
/*=========================================================
112 QUEIMADAS FUNCTION RENDERGEOJSONRO
=========================================================*/
async function renderGeoJSONRO(){
if(!window.mapaQueimadasRO)return
let resp=await fetch('./assets/geojson/municipios-ro.geojson')
if(!resp.ok)return
let geojson=await resp.json()
let{data:ranking=[]}=await client.from('vw_queimadas_ranking_estadual').select('*')
function obterMunicipio(nome){
return ranking.find(m=>normalizarMunicipio(m.municipio)===normalizarMunicipio(nome))
}
function obterCor(nome){
let m=obterMunicipio(nome)
let score=Number(m?.indice_final||m?.iriq||0)
if(score>=75)return'#dc2626'
if(score>=50)return'#f97316'
if(score>=25)return'#facc15'
return'#16a34a'
}
window.layerMunicipios=L.geoJSON(geojson,{
style:f=>{
let nome=f.properties.NM_MUN||f.properties.nome||f.properties.name||''
return{
fillColor:obterCor(nome),
weight:1,
opacity:1,
color:'#ffffff',
fillOpacity:.75
}
},
onEachFeature:(feature,layer)=>{
let nome=feature.properties.NM_MUN||feature.properties.nome||feature.properties.name||''
let m=obterMunicipio(nome)
layer.bindPopup(`
<b>${nome}</b><br>
🔥 Área Queimada: ${Number(m?.area_queimada_ha||0).toLocaleString('pt-BR')} ha<br>
🌳 Desmatamento: ${Number(m?.desmatamento_ha||0).toLocaleString('pt-BR')} ha<br>
🤖 IRIQ: ${Number(m?.indice_final||m?.iriq||0).toFixed(2)}<br>
🏷 ${m?.classificacao||'BAIXO'}
`)
}
})
window.layerMunicipios.addTo(window.mapaQueimadasRO)
window.camadasControle?.addOverlay(window.layerMunicipios,'Municípios')
}
/*=========================================================
113 QUEIMADAS FUNCTION RENDERUCS
=========================================================*/
async function renderUCs(){
if(!window.mapaQueimadasRO)return
try{
let resp=await fetch('assets/geojson/ucs-ro.geojson')
if(!resp.ok)return
let geojson=await resp.json()
window.layerUC=L.geoJSON(geojson,{
style:()=>{
return{
color:'#0064ff',
weight:2,
fillColor:'#22c55e',
fillOpacity:.25
}
},
onEachFeature:(feature,layer)=>{
let nome=feature.properties.nome||feature.properties.NOME||feature.properties.name||'UC'
let esfera=feature.properties.esfera||'-'
layer.bindPopup(`
<b>UNIDADE DE CONSERVAÇÃO</b><br>
${nome}<br>
Esfera: ${esfera}
`)
}
})
window.layerUC.addTo(window.mapaQueimadasRO)
window.camadasControle?.addOverlay(window.layerUC,'🌳 UCs')
}catch(e){}
}
/*=========================================================
114 QUEIMADAS FUNCTION RENDERPAINELUCS
=========================================================*/
async function renderPainelUCs(){
let box=document.getElementById('painelUCs')
if(!box)return
let{data=[]}=await client.from('queimadas_ucs').select('*')
let estaduais=data.filter(i=>String(i.esfera||'').toUpperCase()==='ESTADUAL').length||49
let federais=data.filter(i=>String(i.esfera||'').toUpperCase()==='FEDERAL').length
let municipais=data.filter(i=>String(i.esfera||'').toUpperCase()==='MUNICIPAL').length
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${estaduais}</div>
<div class="chap-label">UCs ESTADUAIS</div>
</div>
<div class="chap-card">
<div class="chap-num">${federais}</div>
<div class="chap-label">UCs FEDERAIS</div>
</div>
<div class="chap-card">
<div class="chap-num">${municipais}</div>
<div class="chap-label">UCs MUNICIPAIS</div>
</div>
<div class="chap-card">
<div class="chap-num">${data.length}</div>
<div class="chap-label">TOTAL UCs</div>
</div>
</div>
<div class="fonte-card">
Fonte: CNUC • SEDAM • TCGeo
</div>`
}
/*=========================================================
115 QUEIMADAS FUNCTION RENDERPAINELFOCOSINPE
=========================================================*/
async function renderPainelFocosINPE(){
let box=document.getElementById('painelFocosCalor')||document.getElementById('painelFocosINPE')
if(!box)return
let{data:executivo}=await client.from('vw_queimadas_executivo').select('*').single()
let{data:ranking=[]}=await client.from('vw_queimadas_ranking_estadual').select('*')
if(!executivo)return
let periodo=document.getElementById('filtroPeriodoFocos')?.value||'ano'
let top10=[...ranking].sort((a,b)=>Number(b.focos||0)-Number(a.focos||0)).slice(0,10)
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${Number(executivo.focos_estado||0).toLocaleString('pt-BR')}</div>
<div class="chap-label">FOCOS DE CALOR</div>
</div>
<div class="chap-card">
<div class="chap-num">${ranking.length}</div>
<div class="chap-label">MUNICÍPIOS</div>
</div>
</div>
<div class="card-executivo">
<h2>TOP FOCOS DE CALOR ${periodo==='ano'?'(ANO ATUAL)':periodo==='custom'?'(PERSONALIZADO)':`(${periodo} DIAS)`}</h2>
${top10.map(i=>`
<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #ddd">
<span>${i.municipio}</span>
<b>${Number(i.focos||0).toLocaleString('pt-BR')}</b>
</div>
`).join('')}
<div style="margin-top:12px;font-size:11px;color:#6b7280">
Fonte: INPE • Monitoramento de Focos de Calor
</div>
</div>`
}
/*=========================================================
116 QUEIMADAS FUNCTION CARREGARFOCOSPERIODO
=========================================================*/
function carregarFocosPeriodo(){
let periodo=document.getElementById('filtroPeriodoFocos')?.value||'ano'
let box=document.getElementById('boxPeriodoPersonalizado')
if(box)box.style.display=periodo==='custom'?'flex':'none'
renderPainelFocosINPE()
}
/*=========================================================
117 QUEIMADAS FUNCTION RENDERGRAFICOTOPFOCOS
=========================================================*/
async function renderGraficoTopFocos(){
let canvas=document.getElementById('graficoTopFocosExecutivo')||document.getElementById('graficoTopFocosRelatorio')
if(!canvas)return
let {data:ranking=[]}=await client
.from('vw_queimadas_ranking_estadual')
.select('*')
let top10=[...(ranking||[])]
.sort((a,b)=>Number(b.focos||0)-Number(a.focos||0))
.slice(0,10)
if(window.chartTopFocos){
window.chartTopFocos.destroy()
}
window.chartTopFocos=new Chart(canvas,{
type:'bar',
data:{
labels:top10.map(i=>i.municipio||'-'),
datasets:[{
label:'Focos de Calor',
data:top10.map(i=>Number(i.focos||0))
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
118 QUEIMADAS FUNCTION RENDERGRAFICOFOCOSHISTORICO
=========================================================*/
async function renderGraficoFocosHistorico(){
let canvas=document.getElementById('graficoFocosHistorico')||document.getElementById('graficoEvolucaoMensalRelatorio')
if(!canvas)return
let {data=[]}=await client
.from('queimadas_focos_historico')
.select('*')
.order('ano')
.order('mes')
if(window.chartFocosHistorico){
window.chartFocosHistorico.destroy()
}
let agrupado={}
;(data||[]).forEach(i=>{
let chave=`${String(i.mes||1).padStart(2,'0')}/${i.ano||''}`
agrupado[chave]=(agrupado[chave]||0)+Number(i.focos||0)
})
let labels=Object.keys(agrupado)
let valores=Object.values(agrupado)
window.chartFocosHistorico=new Chart(canvas,{
type:'line',
data:{
labels:labels,
datasets:[{
label:'Focos de Calor',
data:valores,
fill:false
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{display:false}
}
}
})
}

/*=========================================================
119 QUEIMADAS FUNCTION RENDERINDICADORESESTRATEGICOS
=========================================================*/
async function renderIndicadoresEstrategicos(){
let box=document.getElementById('painelIndicadoresEstrategicos')
if(!box)return
let {data,error}=await client
.from('vw_queimadas_executivo')
.select('*')
.single()
if(error||!data)return
let iriq=Number(data.iriq_estadual||0)
let faixa='BAIXO'
let cor='#16a34a'
if(iriq>=75){
faixa='CRÍTICO'
cor='#dc2626'
}else if(iriq>=50){
faixa='ALTO'
cor='#f97316'
}else if(iriq>=25){
faixa='MODERADO'
cor='#facc15'
}
let hoje=new Date().toLocaleDateString('pt-BR')
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${Number(data.focos_estado||0).toLocaleString('pt-BR')}</div>
<div class="chap-label">FOCOS DE CALOR</div>
<div style="font-size:11px;color:#64748b">${hoje}</div>
</div>
<div class="chap-card">
<div class="chap-num">${Number(data.desmatamento_estado_ha||0).toLocaleString('pt-BR',{maximumFractionDigits:0})}</div>
<div class="chap-label">DESMATAMENTO (ha)</div>
</div>
<div class="chap-card">
<div class="chap-num">${Number(data.area_queimada_estado_ha||0).toLocaleString('pt-BR',{maximumFractionDigits:0})}</div>
<div class="chap-label">ÁREA QUEIMADA (ha)</div>
</div>
<div class="chap-card">
<div class="chap-num" style="color:${cor}">
${iriq.toFixed(2)}
</div>
<div class="chap-label">IRIQ ESTADUAL</div>
<div style="font-size:12px;font-weight:900;color:${cor}">
${faixa}
</div>
</div>
<div class="chap-card">
<div class="chap-num">${Number(data.municipios_criticos||0)}</div>
<div class="chap-label">CRÍTICOS</div>
</div>
<div class="chap-card">
<div class="chap-num">${Number(data.municipios_prioritarios||0)}</div>
<div class="chap-label">PRIORITÁRIOS</div>
</div>
</div>
<div class="fonte-card">
Fonte: INPE • PRODES • MAPBIOMAS • vw_queimadas_executivo
</div>
`
}

/*=========================================================
120 QUEIMADAS FUNCTION RENDERINDICADORESPRESIDENTE
=========================================================*/
async function renderIndicadoresPresidente(){
let box=document.getElementById('painelIndicadoresPresidente')
if(!box)return
let {data,error}=await client
.from('vw_queimadas_executivo')
.select('*')
.single()
if(error||!data)return
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${Number(data.focos_estado||0).toLocaleString('pt-BR')}</div>
<div class="chap-label">FOCOS DE CALOR</div>
</div>
<div class="chap-card">
<div class="chap-num">${Number(data.desmatamento_estado_ha||0).toLocaleString('pt-BR',{maximumFractionDigits:0})}</div>
<div class="chap-label">DESMATAMENTO (ha)</div>
</div>
<div class="chap-card">
<div class="chap-num">${Number(data.area_queimada_estado_ha||0).toLocaleString('pt-BR',{maximumFractionDigits:0})}</div>
<div class="chap-label">ÁREA QUEIMADA (ha)</div>
</div>
<div class="chap-card">
<div class="chap-num">${Number(data.iriq_estadual||0).toFixed(2)}</div>
<div class="chap-label">IRIQ ESTADUAL</div>
</div>
</div>
`
}

/*=========================================================
121 QUEIMADAS FUNCTION RENDERSALASITUACAOESTADUAL
=========================================================*/
async function renderSalaSituacaoEstadual(){
let box=document.getElementById('painelSalaSituacaoEstadual')
if(!box)return
let {data:executivo,error}=await client
.from('vw_queimadas_executivo')
.select('*')
.single()
if(error||!executivo)return
let {data:ranking=[]}=await client
.from('vw_queimadas_ranking_estadual')
.select('*')
let focosTotal=Number(executivo.focos_estado||0)
let criticos=Number(executivo.municipios_criticos||0)
let prioritarios=Number(executivo.municipios_prioritarios||0)
let iriq=Number(executivo.iriq_estadual||0)
let faixa='BAIXO'
let cor='#16a34a'
if(iriq>=75){
faixa='CRÍTICO'
cor='#dc2626'
}else if(iriq>=50){
faixa='ALTO'
cor='#f97316'
}else if(iriq>=25){
faixa='MODERADO'
cor='#facc15'
}
let top10=[...(ranking||[])]
.sort((a,b)=>Number(b.focos||0)-Number(a.focos||0))
.slice(0,10)
box.innerHTML=`
<div class="fonte-card">
Data Base: ${new Date().toLocaleDateString('pt-BR')} • INPE • PRODES • MAPBIOMAS
</div>
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${focosTotal.toLocaleString('pt-BR')}</div>
<div class="chap-label">FOCOS</div>
</div>
<div class="chap-card">
<div class="chap-num">${Number(executivo.desmatamento_estado_ha||0).toLocaleString('pt-BR',{maximumFractionDigits:0})}</div>
<div class="chap-label">DESMATAMENTO</div>
</div>
<div class="chap-card">
<div class="chap-num">${Number(executivo.area_queimada_estado_ha||0).toLocaleString('pt-BR',{maximumFractionDigits:0})}</div>
<div class="chap-label">ÁREA QUEIMADA</div>
</div>
<div class="chap-card">
<div class="chap-num">${criticos}</div>
<div class="chap-label">CRÍTICOS</div>
</div>
<div class="chap-card">
<div class="chap-num">${prioritarios}</div>
<div class="chap-label">PRIORITÁRIOS</div>
</div>
<div class="chap-card">
<div class="chap-num" style="color:${cor}">${iriq.toFixed(2)}</div>
<div class="chap-label">${faixa}</div>
</div>
</div>
<div class="cardExecutivo">
<h2>🔥 TOP 10 MUNICÍPIOS</h2>
${top10.map((i,idx)=>`
<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #ddd">
<span>${idx+1}º ${i.municipio||'-'}</span>
<b>${Number(i.focos||0).toLocaleString('pt-BR')}</b>
</div>
`).join('')}
</div>
<div class="fonte-card">
Fonte: vw_queimadas_executivo • vw_queimadas_ranking_estadual • INPE • PRODES • MAPBIOMAS
</div>
`
}
/*=========================================================
122 QUEIMADAS FUNCTION ABRIRCARDQUEIMADAS
=========================================================*/
function abrirCardQueimadas(aba){
mostrarAbaQueimadas(aba)
window.scrollTo({
top:0,
behavior:'smooth'
})
}

/*=========================================================
123 QUEIMADAS FUNCTION RECALCULARIRIQMUNICIPAL
=========================================================*/
async function recalcularIRIQMunicipal(){
await calcularIRIQ()
await renderRankingIMC()
}

/*=========================================================
124 QUEIMADAS FUNCTION FORMATARAREA
=========================================================*/
function formatarArea(v){
return Number(v||0)
.toLocaleString('pt-BR',{
minimumFractionDigits:2,
maximumFractionDigits:2
})+' km²'
}

/*=========================================================
125 QUEIMADAS FUNCTION RENDERMUNICIPIOSOFICIO
=========================================================*/
async function renderMunicipiosOficio(){
let box=document.getElementById('painelMunicipiosOficio')
if(!box)return

let {data:kpi=[]}=await client
.from('vw_queimadas_kpis_resposta')
.select('*')
.limit(1)

let k=kpi?.[0]||{}

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
126 QUEIMADAS FUNCTION RENDERMUNICIPIOSSEMRESPOSTA
=========================================================*/
async function renderMunicipiosSemResposta(){
let box=document.getElementById('painelMunicipiosSemResposta')
if(!box)return

let {data,error}=await client
.from('queimadas_municipios_oficio')
.select('*')
.eq('classificacao_cor','VERMELHO')
.order('municipio')

if(error)return

let html='<div class="heatmap-grid">'

;(data||[]).forEach(i=>{
html+=`
<div class="heat-vermelho">
<div class="heat-municipio">${i.municipio||'-'}</div>
<div class="heat-info">
Situação: SEM RESPOSTA<br>
Ofício: ${i.nroficioenviadotcero||'-'}<br>
Envio: ${formatarDataBR(i.dataenviodoc)}
</div>
<div class="fonte-card">
Fonte: Ofício Circular n.16/2026/GABPRES/TCERO
</div>
</div>
`
})

html+='</div>'

box.innerHTML=html
}

/*=========================================================
127 QUEIMADAS FUNCTION RENDERKPISMUNICIPAIS
=========================================================*/
async function renderKPIsMunicipais(){
let box=document.getElementById('painelKPIsMunicipais')
if(!box)return

let {data,error}=await client
.from('vw_queimadas_kpis_resposta')
.select('*')
.limit(1)

if(error)return

let k=data?.[0]||{}

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
128 QUEIMADAS FUNCTION RENDERPLANOSAPRESENTADOS
=========================================================*/
async function renderPlanosApresentados(){
let box=document.getElementById('painelPlanosApresentados')
if(!box)return
let {data,error}=await client
.from('queimadas_municipios_oficio')
.select('*')
.eq('classificacao_cor','VERDE')
.order('municipio')
if(error)return
let html='<table class="tabelaMiniMunicipios"><tr><th>Município</th><th>Recebimento</th></tr>'
;(data||[]).forEach(i=>{
html+=`<tr><td>${i.municipio||'-'}</td><td>${formatarDataBR(i.ldatarecebimentodoc)}</td></tr>`
})
html+='</table>'
box.innerHTML=html
}

/*=========================================================
129 QUEIMADAS FUNCTION RENDERDILACOESPRAZO
=========================================================*/
async function renderDilacoesPrazo(){
let box=document.getElementById('painelDilacoesPrazo')
if(!box)return
let {data,error}=await client
.from('queimadas_municipios_oficio')
.select('*')
.eq('classificacao_cor','AMARELO')
.order('municipio')
if(error)return
let html='<table class="tabelaMiniMunicipios"><tr><th>Município</th><th>Recebimento</th></tr>'
;(data||[]).forEach(i=>{
html+=`<tr><td>${i.municipio||'-'}</td><td>${formatarDataBR(i.ldatarecebimentodoc)}</td></tr>`
})
html+='</table>'
box.innerHTML=html
}

/*=========================================================
130 QUEIMADAS FUNCTION RENDERGRAFICOMUNICIPIOS
=========================================================*/
async function renderGraficoMunicipios(){
let canvas=document.getElementById('graficoMunicipiosResposta')
if(!canvas)return
let {data,error}=await client
.from('vw_queimadas_kpis_resposta')
.select('*')
.limit(1)
if(error)return
let k=data?.[0]||{}
if(window.chartMunicipiosResposta){
window.chartMunicipiosResposta.destroy()
}
window.chartMunicipiosResposta=new Chart(canvas,{
type:'doughnut',
data:{
labels:[
'Plano Apresentado',
'Dilação de Prazo',
'Sem Resposta'
],
datasets:[{
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
}]
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
formatter:v=>v
}
}
}
})
}

/*=========================================================
131 QUEIMADAS FUNCTION RENDERTABELAMUNICIPIOS
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

if(error)return

let lista=data||[]

if(busca){
lista=lista.filter(i=>
String(i.municipio||'')
.toUpperCase()
.includes(busca)
)
}

let html=`
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
132 QUEIMADAS FUNCTION RENDERMAPAMUNICIPAL
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
let geojson=await geo.json()
window.layerMunicipios=L.geoJSON(geojson,{
style:f=>{
let nome=String(
f.properties.nome||
f.properties.NOME||
f.properties.municipio||
''
).trim().toUpperCase()
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
let nome=String(
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
133 QUEIMADAS FUNCTION FILTRARMAPAMUNICIPAL
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
134 QUEIMADAS FUNCTION RENDERESTATISTICASMUNICIPAIS
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
<div class="fonte-card">${planos} de ${total} municípios</div>
</div>
<div class="chap-card">
<div class="chap-num" style="color:#ca8a04">${pDilacoes}%</div>
<div class="chap-label">DILAÇÃO DE PRAZO</div>
<div class="fonte-card">${dilacoes} de ${total} municípios</div>
</div>
<div class="chap-card">
<div class="chap-num" style="color:#dc2626">${pSemResposta}%</div>
<div class="chap-label">SEM RESPOSTA</div>
<div class="fonte-card">${semResposta} de ${total} municípios</div>
</div>
</div>
<div class="fonte-card">
Fonte: Ofício Circular n.16/2026/GABPRES/TCERO • Respostas dos Municípios
</div>
`
}

/*=========================================================
135 QUEIMADAS FUNCTION RENDERMUNICIPIOSOFICIO
=========================================================*/
async function renderMunicipiosOficio(tipo='CADASTRO'){
let destino=tipo==='RESUMO'
?'painelSituacaoGeralMunicipios'
:'painelCadastroMunicipiosResumo'
let box=document.getElementById(destino)
if(!box)return
let {data,error}=await client
.from('queimadas_municipios_oficio')
.select('*')
.order('municipio')
if(error){
console.log(error)
box.innerHTML='Erro ao carregar.'
return
}
let html='<div style="overflow-x:auto;width:100%">'
html+='<table class="tabelaMunicipios">'
html+='<thead>'
if(tipo==='RESUMO'){
html+=`
<tr>
<th>Nº</th>
<th>Município</th>
<th>Situação</th>
<th>Data</th>
<th>Documento</th>
<th>Observação</th>
</tr>
`
}else{
html+=`
<tr>
<th style="min-width:220px">Município</th>
<th style="min-width:130px">Ofício TCE</th>
<th style="min-width:100px">Data Envio</th>
<th style="min-width:90px">Pág.</th>
<th style="min-width:100px">Data Rec.1</th>
<th style="min-width:100px">Data Rec.2</th>
<th style="min-width:130px">Doc.1</th>
<th style="min-width:130px">Doc.2</th>
<th style="min-width:700px">Observação</th>
<th style="min-width:120px">Ação</th>
</tr>
`
}
html+='</thead><tbody>'
;(data||[]).forEach((i,idx)=>{
if(tipo==='RESUMO'){
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
</tr>
`
}else{
html+=`
<tr>
<td>${i.municipio||'-'}</td>
<td>${i.nroficioenviadotcero||'-'}</td>
<td>${formatarDataBR(i.dataenviodoc)}</td>
<td>${i.paginaenviodoc||'-'}</td>
<td>${formatarDataBR(i.ldatarecebimentodoc)}</td>
<td>${formatarDataBR(i.lldatarecebimentodoc)}</td>
<td>${i.lnumerodocenviado||'-'}</td>
<td>${i.llnumerodocenviado||'-'}</td>
<td>${i.observacao||'-'}</td>
<td><button class="btnEditarMunicipio" onclick="editarMunicipio(${i.id})">✏</button></td>
</tr>
`
}
})
html+='</tbody></table></div>'
box.innerHTML=html
}

/*=========================================================
136 QUEIMADAS FUNCTION EDITARMUNICIPIO
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
await renderMunicipiosOficio('CADASTRO')
await renderMunicipiosOficio('RESUMO')
await renderKPIsMunicipais()
await renderTabelaMunicipios()
await renderEstatisticasMunicipais()
}

/*=========================================================
137 QUEIMADAS INIT
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
138 TOGGLE MAPA RO
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
139 QUEIMADAS FUNCTION RENDERESTADOOFICIO
=========================================================*/
async function renderEstadoOficio(){
let box=document.getElementById('painelCadastroEstado')
if(!box)return
let {data,error}=await client
.from('queimadas_estado_oficio')
.select('*')
.order('estado')
if(error){
console.log(error)
box.innerHTML='Erro ao carregar.'
return
}
let html='<div style="overflow:auto">'
html+='<table class="tabelaMunicipios">'
html+=`
<thead>
<tr>
<th>ÓRGÃO</th>
<th>OFÍCIO TCE</th>
<th>DATA ENVIO</th>
<th>PÁG.</th>
<th>DATA REC.1</th>
<th>DATA REC.2</th>
<th>DOC.1</th>
<th>DOC.2</th>
<th>OBSERVAÇÃO</th>
<th>AÇÃO</th>
</tr>
</thead>
<tbody>
`
;(data||[]).forEach(i=>{
html+=`
<tr>
<td>${i.estado||i.orgao||'-'}</td>
<td>${i.nroficioenviadotcero||'-'}</td>
<td>${formatarDataBR(i.dataenviodoc)}</td>
<td>${i.paginaenviodoc||'-'}</td>
<td>${formatarDataBR(i.idatarecebimentodoc)}</td>
<td>${formatarDataBR(i.iidatarecebimentodoc)}</td>
<td>${i.inumerodocenviado||'-'}</td>
<td>${i.iinumerodocenviado||'-'}</td>
<td>${i.observacao||'-'}</td>
<td>
<button class="btnEditarEstado" onclick="editarEstado(${i.id})">
✏ EDITAR
</button>
</td>
</tr>
`
})
html+='</tbody></table></div>'
box.innerHTML=html
}

/*=========================================================
140 QUEIMADAS FUNCTION EDITARMUNICIPIO
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

<h2>🏛️ CADASTRO MUNICIPAL</h2>

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
<input id="mDataRec2" type="date" value="${data.lldatarecebimentodoc||''}">

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
141 QUEIMADAS FUNCTION FECHARMODALMUNICIPIO
=========================================================*/
function fecharModalMunicipio(){
let modal=document.getElementById('modalMunicipio')
if(modal)modal.remove()
}

/*=========================================================
142 QUEIMADAS FUNCTION SALVARMUNICIPIO
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

if(typeof renderTabelaMunicipios==='function'){
await renderTabelaMunicipios()
}

if(typeof renderMunicipiosOficio==='function'){
await renderMunicipiosOficio('RESUMO')
await renderMunicipiosOficio('CADASTRO')
}

if(typeof renderKPIsMunicipais==='function'){
await renderKPIsMunicipais()
}

if(typeof renderEstatisticasMunicipais==='function'){
await renderEstatisticasMunicipais()
}

alert('Registro atualizado com sucesso.')
}

