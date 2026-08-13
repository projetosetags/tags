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
102 QUEIMADAS FUNCTION RENDERTOPIPT
=========================================================*/
async function renderTopIPT(){
let box=document.getElementById('painelTopIPT')
if(!box)return

let{data=[],error}=await client
.from('queimadas_ipt')
.select('municipio,indice_ipt')
.order('indice_ipt',{ascending:false})
.limit(10)

if(error){
console.error('Erro ao carregar ranking IPT:',error)
box.innerHTML='<div class="alerta-vermelho">Erro ao carregar o ranking IPT.</div>'
return
}

box.innerHTML=`
<div class="cardExecutivo">
<h2>📊 TOP 10 — IPT</h2>
${data.length?data.map((i,idx)=>`
<div class="linha-queimadas">
<b>${idx+1}º — ${i.municipio||'-'}</b>
<span> • IPT ${Number(i.indice_ipt||0).toFixed(2).replace('.',',')}</span>
</div>
`).join(''):'<div class="situacaoSemDados">Nenhum dado de IPT disponível.</div>'}
<div class="fonte-card">
Fonte: Índice de Priorização Territorial — IPT • TCE-RO
</div>
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
let lista=[...(data||[])]
.sort((a,b)=>Number(b.indice_final||b.iriq||0)-Number(a.indice_final||a.iriq||0))
.slice(0,5)
let hoje=new Date().toLocaleDateString('pt-BR')
box.innerHTML=`
<div class="fonte-card">
Período de Referência: 2021-2025 • MAPBIOMAS (Áreas Queimadas) • PRODES (Desmatamento) • IRIQ
</div>
${lista.map((i,idx)=>{
let score=Number(i.indice_final||i.iriq||0)
let classificacao='BAIXO'
let cor='#16a34a'

if(score>=75){
classificacao='CRÍTICO'
cor='#dc2626'
}else if(score>=50){
classificacao='ALTO'
cor='#f97316'
}else if(score>=25){
classificacao='MODERADO'
cor='#facc15'
}
return`
<div class="alerta-ranking">
<div class="alerta-numero">${idx+1}</div>
<div class="alerta-texto">
<b>${i.municipio}</b><br>
<span style="color:${cor};font-weight:900">${classificacao}</span><br>
🔥 Área Queimada: ${Number(i.area_queimada_hectares||i.area_queimada_ha||i.area_queimada||0).toLocaleString('pt-BR')} ha<br>
🌳 Desmatamento: ${Number(i.desmatamento_hectares||i.desmatamento_ha||i.area_desmatada||0).toLocaleString('pt-BR')} ha<br>
🤖 IRIQ: ${score.toFixed(2)}
</div>
</div>`
}).join('')}
<div class="fonte-card">
Fonte: MAPBIOMAS (2021-2025) • PRODES (2021-2025) • Atualizado em ${hoje}
</div>`
}
/*=========================================================
104 QUEIMADAS FUNCTION CALCULARIRIQMUNICIPAL
=========================================================*/
async function calcularIRIQMunicipal(){
let{data:ranking=[],error}=await client
.from('vw_queimadas_ranking_estadual')
.select('*')

if(error){
console.error('Erro ao carregar ranking estadual para consolidação do IRIQ:',error)
return
}

for(let m of ranking){
let areaQueimada=Number(
m.area_queimada_hectares||
m.area_queimada_ha||
m.area_queimada||
0
)

let desmatamento=Number(
m.desmatamento_hectares||
m.desmatamento_ha||
m.area_desmatada||
0
)

let indice=Number(m.indice_final||m.iriq||0)

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
area_queimada_hectares:areaQueimada,
desmatamento_hectares:desmatamento,
area_queimada_ha:areaQueimada,
desmatamento_ha:desmatamento,
indice_final:Number(indice.toFixed(2)),
classificacao,
semaforo
}],{
onConflict:'municipio'
})
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
Ranking Estadual IRIQ • TCE-RO • MAPBIOMAS • PRODES • CHAPT
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
Fonte: IRIQ Ambiental • MAPBIOMAS • PRODES • CHAPT
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
110.1 CLASSIFICAÇÃO MUNICIPAL ATUAL
=========================================================*/
function classificarMunicipioAtual(i){
let plano=i.plano_acao===true||i.plano_acao==='true'||i.plano_acao===1||i.plano_acao==='1'
let dilacao=i.dilacao_prazo===true||i.dilacao_prazo==='true'||i.dilacao_prazo===1||i.dilacao_prazo==='1'
let semResposta=i.sem_resposta===true||i.sem_resposta==='true'||i.sem_resposta===1||i.sem_resposta==='1'
let classificacaoAtual='VERMELHO'
if(plano){
classificacaoAtual='VERDE'
}else if(dilacao){
classificacaoAtual='AMARELO'
}else if(semResposta){
classificacaoAtual='VERMELHO'
}
let documentoAtual=i.llnumerodocenviado||i.lnumerodocenviado||'-'
let recebimentoAtual=i.lldatarecebimentodoc||i.ldatarecebimentodoc||''
return{...i,classificacaoAtual,classificacao_cor:classificacaoAtual,classificacao_ia:classificacaoAtual,documentoAtual,recebimentoAtual}
}
/*=========================================================
111 QUEIMADAS FUNCTION RENDERPLANOSMUNICIPAIS
=========================================================*/
async function renderPlanosMunicipais(){
let box=document.getElementById('painelPlanosMunicipais')
if(!box)return
let[{data=[],error},{data:ranking=[],error:erroRanking}]=await Promise.all([
client.from('vw_queimadas_municipios_resposta').select('*').order('municipio'),
client.from('vw_queimadas_ranking_estadual').select('*').order('indice_final',{ascending:false})
])
if(error){console.error('Erro planos municipais:',error);return}
if(erroRanking)console.error('Erro ranking municipal:',erroRanking)
let lista=(data||[]).map(classificarMunicipioAtual)
let comPlano=lista.filter(i=>i.classificacaoAtual==='VERDE')
let dilacao=lista.filter(i=>i.classificacaoAtual==='AMARELO')
let semPlano=lista.filter(i=>i.classificacaoAtual==='VERMELHO')
let rankingHTML=(ranking||[]).slice(0,6).map((m,i)=>`<div style="margin:4px 0"><b>${i+1}º ${m.municipio}</b>&nbsp;|&nbsp;IRIQ: <b>${Number(m.indice_final||m.iriq||0).toFixed(2)}</b>&nbsp;|&nbsp;Área Queimada: <b>${Number(m.area_queimada_ha||0).toLocaleString('pt-BR')}</b>&nbsp;|&nbsp;Desmatamento: <b>${Number(m.desmatamento_ha||0).toLocaleString('pt-BR')}</b></div>`).join('')
box.innerHTML=`<div class="chap-grid"><div class="chap-card"><div class="chap-num" style="color:#16a34a">${comPlano.length}</div><div class="chap-label">COM PLANO</div></div><div class="chap-card"><div class="chap-num" style="color:#facc15">${dilacao.length}</div><div class="chap-label">DILAÇÃO DE PRAZO</div></div><div class="chap-card"><div class="chap-num" style="color:#dc2626">${semPlano.length}</div><div class="chap-label">SEM RESPOSTA</div></div></div><div style="margin-top:15px;padding:12px;border-radius:10px;background:#fef2f2;border:2px solid #dc2626"><div style="font-size:16px;font-weight:900;margin-bottom:8px;color:#991b1b">🔥 TOP MUNICÍPIOS PRIORITÁRIOS</div>${rankingHTML}</div><div style="margin-top:15px"><h3 style="color:#15803d">✅ MUNICÍPIOS COM PLANO</h3>${comPlano.length?comPlano.map(i=>i.municipio).join(' • '):'Nenhum município'}<hr style="margin:15px 0"><h3 style="color:#ca8a04">🟡 MUNICÍPIOS COM DILAÇÃO DE PRAZO</h3>${dilacao.length?dilacao.map(i=>i.municipio).join(' • '):'Nenhum município'}<hr style="margin:15px 0"><h3 style="color:#dc2626">🚨 MUNICÍPIOS SEM RESPOSTA</h3>${semPlano.length?semPlano.map(i=>i.municipio).join(' • '):'Nenhum município'}</div>`
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
try{
let resp=await fetch('./assets/geojson/ucs-ro.geojson')
if(!resp.ok)return
let geo=await resp.json()

let estaduais=(geo.features||[]).filter(f=>
String(f.properties?.esfera||'')
.toUpperCase()
.trim()==='ESTADUAL'
).length

let federais=(geo.features||[]).filter(f=>
String(f.properties?.esfera||'')
.toUpperCase()
.trim()==='FEDERAL'
).length

let municipais=(geo.features||[]).filter(f=>
String(f.properties?.esfera||'')
.toUpperCase()
.trim()==='MUNICIPAL'
).length

let total=(geo.features||[]).length

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
<div class="chap-num">${total}</div>
<div class="chap-label">TOTAL UCs</div>
</div>
</div>
<div class="fonte-card">
Fonte: TCGeo • CNUC • SEDAM
</div>`
}catch(e){
console.error('Erro painel UCs',e)
box.innerHTML=`
<div class="alerta-vermelho">
Erro ao carregar Unidades de Conservação
</div>`
}
}
/*=========================================================
115 QUEIMADAS FUNCTION RENDERPAINELFOCOSINPE
=========================================================*/
async function renderPainelFocosINPE(){
let box=document.getElementById('painelFocosCalor')
if(!box)return
let periodo=document.getElementById('filtroPeriodoFocos')?.value||'ano'
let hoje=new Date()
let dataFinal=new Date(hoje.getFullYear(),hoje.getMonth(),hoje.getDate())
let dataInicial=new Date(dataFinal)
if(periodo==='1'){
dataInicial=new Date(dataFinal)
}else if(periodo==='7'){
dataInicial.setDate(dataFinal.getDate()-6)
}else if(periodo==='30'){
dataInicial.setDate(dataFinal.getDate()-29)
}else if(periodo==='365'){
dataInicial.setFullYear(dataFinal.getFullYear()-1)
dataInicial.setDate(dataInicial.getDate()+1)
}else if(periodo==='ano'){
dataInicial=new Date(dataFinal.getFullYear(),0,1)
}else if(periodo==='custom'){
let inicial=document.getElementById('dataInicialFocos')?.value
let final=document.getElementById('dataFinalFocos')?.value
if(!inicial||!final){
box.innerHTML='<div class="alerta-vermelho">Selecione a data inicial e a data final.</div>'
return
}
dataInicial=new Date(inicial+'T00:00:00')
dataFinal=new Date(final+'T00:00:00')
if(dataInicial>dataFinal){
box.innerHTML='<div class="alerta-vermelho">A data inicial não pode ser maior que a data final.</div>'
return
}
}
let inicioISO=formatarDataISOFocos(dataInicial)
let finalISO=formatarDataISOFocos(dataFinal)
box.innerHTML='<div style="padding:30px;text-align:center;font-weight:900">🔥 Carregando focos oficiais do INPE...</div>'
let resultado=await buscarTodosFocosINPE(inicioISO,finalISO)
if(resultado.error){
console.error('Erro ao consultar focos do INPE:',resultado.error)
box.innerHTML=`<div class="alerta-vermelho">Erro ao consultar os focos do INPE.<br>${resultado.error.message||''}</div>`
return
}
let registros=resultado.data||[]
let agrupado={}
registros.forEach(item=>{
let municipio=String(item.municipio||'NÃO INFORMADO').trim()
agrupado[municipio]=(agrupado[municipio]||0)+1
})
let ranking=Object.entries(agrupado).map(([municipio,focos])=>({municipio,focos:Number(focos||0)})).sort((a,b)=>b.focos-a.focos)
let total=registros.length
let municipiosComFocos=ranking.length
let maiorMunicipio=ranking[0]||null
let tituloPeriodo=obterTituloPeriodoFocos(periodo)
let top10=ranking.slice(0,10)
let mediaMunicipio=municipiosComFocos?total/municipiosComFocos:0
let maiorQuantidade=Number(maiorMunicipio?.focos||0)
let ultimaDataFoco=registros.reduce((maior,item)=>{
let data=String(item.data_foco||'')
return data>maior?data:maior
},'')
let ultimaImportacao=registros.reduce((maior,item)=>{
let data=String(item.created_at||'')
return data>maior?data:maior
},'')
let atualizacaoFormatada=ultimaImportacao?new Date(ultimaImportacao).toLocaleString('pt-BR'):'Sem informação'
box.innerHTML=`
<div class="focosResumoGrid">
<div class="focoResumoCard">
<div class="focoIcon">🔥</div>
<div class="focoValor">${total.toLocaleString('pt-BR')}</div>
<div class="focoTitulo">FOCOS DE CALOR</div>
<div style="font-size:11px;color:#64748b;font-weight:800;margin-top:5px">${tituloPeriodo}</div>
</div>
<div class="focoResumoCard">
<div class="focoIcon">🏛️</div>
<div class="focoValor">${municipiosComFocos}</div>
<div class="focoTitulo">MUNICÍPIOS COM FOCOS</div>
<div style="font-size:11px;color:#64748b;font-weight:800;margin-top:5px">MÉDIA ${mediaMunicipio.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})} POR MUNICÍPIO</div>
</div>
<div class="focoResumoCard">
<div class="focoIcon">🏆</div>
<div class="focoValor">${maiorQuantidade.toLocaleString('pt-BR')}</div>
<div class="focoTitulo">${maiorMunicipio?.municipio||'SEM REGISTROS'}</div>
<div style="font-size:11px;color:#64748b;font-weight:800;margin-top:5px">MUNICÍPIO LÍDER</div>
</div>
<div class="focoResumoCard">
<div class="focoIcon">📅</div>
<div class="focoValor" style="font-size:16px">${formatarDataBR(inicioISO)}</div>
<div class="focoTitulo">ATÉ ${formatarDataBR(finalISO)}</div>
<div style="font-size:11px;color:#64748b;font-weight:800;margin-top:5px">PERÍODO CONSULTADO</div>
</div>
</div>
<div class="rankingCompacto">
<h3>🏆 MUNICÍPIOS DE RONDÔNIA COM MAIS FOCOS</h3>
${top10.length?top10.map((item,indice)=>{
let percentual=total?item.focos*100/total:0
let largura=maiorQuantidade?item.focos*100/maiorQuantidade:0
return`
<div class="rankingLinha" style="display:block;padding:12px 6px">
<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
<span style="font-weight:800">${obterMedalhaFocos(indice)} ${indice+1}º ${item.municipio}</span>
<span style="white-space:nowrap"><b>${item.focos.toLocaleString('pt-BR')}</b> <small style="color:#64748b;font-weight:800">(${percentual.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})}%)</small></span>
</div>
<div style="height:8px;background:#e5e7eb;border-radius:999px;overflow:hidden;margin-top:8px">
<div style="height:100%;width:${largura.toFixed(2)}%;background:linear-gradient(90deg,#f97316,#dc2626);border-radius:999px"></div>
</div>
</div>`
}).join(''):'<div style="padding:25px;text-align:center">Nenhum foco registrado em Rondônia no período.</div>'}
</div>
<div class="ultimaAtualizacao">
<div><b>Última atualização do banco INPE:</b> ${atualizacaoFormatada}</div>
<div><b>Última data de foco disponível:</b> ${ultimaDataFoco?formatarDataBR(ultimaDataFoco):'Sem registros'}</div>
<div><b>Consulta realizada em:</b> ${new Date().toLocaleString('pt-BR')}</div>
</div>
<div class="fonte-card">Fonte: Programa Queimadas • INPE • Dados oficiais filtrados para os municípios de Rondônia • Atualização automática</div>`
}
/*=========================================================
115-A QUEIMADAS FUNCTION BUSCARTODOSFOCOSINPE
=========================================================*/
async function buscarTodosFocosINPE(inicioISO,finalISO){
let todos=[]
let inicio=0
let tamanhoPagina=1000
while(true){
let{data,error}=await client.from('queimadas_focos_inpe').select('municipio,data_foco,created_at').gte('data_foco',inicioISO).lte('data_foco',finalISO).order('id',{ascending:true}).range(inicio,inicio+tamanhoPagina-1)
if(error)return{data:[],error}
let pagina=data||[]
todos.push(...pagina)
if(pagina.length<tamanhoPagina)break
inicio+=tamanhoPagina
}
return{data:todos,error:null}
}
/*=========================================================
115-B QUEIMADAS FUNCTION FORMATARDATAISOFOCOS
=========================================================*/
function formatarDataISOFocos(data){
let ano=data.getFullYear()
let mes=String(data.getMonth()+1).padStart(2,'0')
let dia=String(data.getDate()).padStart(2,'0')
return`${ano}-${mes}-${dia}`
}
/*=========================================================
115-C QUEIMADAS FUNCTION OBTERTITULOPERIODOFOCOS
=========================================================*/
function obterTituloPeriodoFocos(periodo){
if(periodo==='1')return'HOJE'
if(periodo==='7')return'ÚLTIMOS 7 DIAS'
if(periodo==='30')return'ÚLTIMOS 30 DIAS'
if(periodo==='365')return'ÚLTIMOS 12 MESES'
if(periodo==='ano')return'ANO ATUAL'
if(periodo==='custom')return'PERÍODO PERSONALIZADO'
return'PERÍODO SELECIONADO'
}
/*=========================================================
115-D QUEIMADAS FUNCTION OBTERMEDALHAFOCOS
=========================================================*/
function obterMedalhaFocos(indice){
if(indice===0)return'🥇'
if(indice===1)return'🥈'
if(indice===2)return'🥉'
return'🔥'
}
/*=========================================================
116 QUEIMADAS FUNCTION CARREGARFOCOSPERIODO
=========================================================*/
async function carregarFocosPeriodo(){
let periodo=document.getElementById('filtroPeriodoFocos')?.value||'ano'
let box=document.getElementById('boxPeriodoPersonalizado')
if(box)box.style.display=periodo==='custom'?'flex':'none'
if(periodo==='custom'){
let inicial=document.getElementById('dataInicialFocos')?.value
let final=document.getElementById('dataFinalFocos')?.value
if(!inicial||!final)return
}
await renderPainelFocosINPE()
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
let agora=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
let planos=Number(data.planos_apresentados||0)
let total=Number(data.total_municipios||0)
let resposta=total?((planos/total)*100).toFixed(1):0
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">📡</div>
<div class="chap-label">ÚLTIMA ATUALIZAÇÃO</div>
<div style="font-size:15px;font-weight:900">${hoje}</div>
<div style="font-size:12px;color:#64748b">${agora}</div>
</div>
<div class="chap-card">
<div class="chap-num" style="color:${cor}">${iriq.toFixed(2)}</div>
<div class="chap-label">IRIQ ESTADUAL</div>
<div style="font-size:12px;font-weight:900;color:${cor}">${faixa}</div>
</div>
<div class="chap-card">
<div class="chap-num">${Number(data.municipios_criticos||0)}</div>
<div class="chap-label">MUNICÍPIOS CRÍTICOS</div>
</div>
<div class="chap-card">
<div class="chap-num">${Number(data.municipios_prioritarios||0)}</div>
<div class="chap-label">MUNICÍPIOS PRIORITÁRIOS</div>
</div>
<div class="chap-card">
<div class="chap-num">${planos}/${total}</div>
<div class="chap-label">RESPOSTA INSTITUCIONAL</div>
<div style="font-size:12px;font-weight:900;color:#16a34a">${resposta}%</div>
</div>
<div class="chap-card">
<div class="chap-num">🛰️</div>
<div class="chap-label">MONITORAMENTO</div>
<div style="font-size:12px;font-weight:900;color:#2563eb">ATIVO</div>
</div>
</div>
<div class="fonte-card">
Fonte: INPE • PRODES • MAPBIOMAS • SEDAM • CBMRO • vw_queimadas_executivo
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
let hoje=new Date()
let ano=hoje.getFullYear()
let dataInicial=`${ano}-01-01`
let dataFinal=`${ano}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`
let[
{data:executivo,error:erroExecutivo},
{count:totalFocos,error:erroFocos},
{data:ranking=[],error:erroRanking}
]=await Promise.all([
client.from('vw_queimadas_executivo').select('*').maybeSingle(),
client.from('queimadas_focos_inpe').select('id',{count:'exact',head:true}).gte('data_foco',dataInicial).lte('data_foco',dataFinal),
client.from('vw_queimadas_ranking_focos_atual').select('municipio,focos').order('focos',{ascending:false}).limit(10)
])
if(erroExecutivo)console.error('Erro ao carregar situação estadual:',erroExecutivo)
if(erroFocos)console.error('Erro ao carregar focos INPE:',erroFocos)
if(erroRanking)console.error('Erro ao carregar ranking de focos:',erroRanking)
executivo=executivo||{}
let focosTotal=Number(totalFocos||0)
let criticos=Number(executivo.municipios_criticos||0)
let prioritarios=Number(executivo.municipios_prioritarios||0)
let iriq=Number(executivo.iriq_estadual||0)
let areaQueimada=Number(executivo.area_queimada_estado_ha||0)
let desmatamento=Number(executivo.desmatamento_estado_ha||0)
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
cor='#ca8a04'
}
box.innerHTML=`<div class="situacaoKPIGrid"><div class="situacaoKPI"><strong>${focosTotal.toLocaleString('pt-BR')}</strong><span>🔥 FOCOS EM ${ano}</span></div><div class="situacaoKPI"><strong>${desmatamento.toLocaleString('pt-BR',{maximumFractionDigits:0})}</strong><span>🌳 DESMATAMENTO</span></div><div class="situacaoKPI"><strong>${areaQueimada.toLocaleString('pt-BR',{maximumFractionDigits:0})}</strong><span>🔥 ÁREA QUEIMADA</span></div><div class="situacaoKPI"><strong>${criticos}</strong><span>🚨 CRÍTICOS</span></div><div class="situacaoKPI"><strong>${prioritarios}</strong><span>⚠️ PRIORITÁRIOS</span></div><div class="situacaoKPI"><strong style="color:${cor}">${iriq.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong><span>IRIQ • ${faixa}</span></div></div><div class="situacaoPeriodo">Dados de focos: 01/01/${ano} até ${hoje.toLocaleDateString('pt-BR')}</div><div class="situacaoRanking"><h3>🔥 TOP 10 MUNICÍPIOS POR FOCOS DE CALOR</h3>${ranking.length?ranking.map((item,indice)=>`<div class="situacaoRankingLinha">
<span>
<b>${indice+1}º</b>
<div>${item.municipio}</div>
</span>
<strong>${Number(item.focos||0).toLocaleString('pt-BR')}</strong>
</div>`).join(''):'<div class="situacaoSemDados">Nenhum foco registrado.</div>'}</div>`
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
let{data=[],error}=await client.from('vw_queimadas_municipios_resposta').select('*')
if(error){console.error('Erro municípios ofício:',error);return}
let lista=(data||[]).map(classificarMunicipioAtual)
let total=lista.length
let planos=lista.filter(i=>i.classificacaoAtual==='VERDE').length
let dilacoes=lista.filter(i=>i.classificacaoAtual==='AMARELO').length
let semResposta=lista.filter(i=>i.classificacaoAtual==='VERMELHO').length
box.innerHTML=`<div class="chap-grid"><div class="chap-card"><div class="chap-num">${total}</div><div class="chap-label">MUNICÍPIOS OFICIADOS</div><div class="fonte-card">Fonte: Ofício Circular n.16/2026/GABPRES/TCERO</div></div><div class="chap-card"><div class="chap-num" style="color:#16a34a">${planos}</div><div class="chap-label">PLANO APRESENTADO</div><div class="fonte-card">Classificação Verde</div></div><div class="chap-card"><div class="chap-num" style="color:#facc15">${dilacoes}</div><div class="chap-label">DILAÇÃO DE PRAZO</div><div class="fonte-card">Classificação Amarela</div></div><div class="chap-card"><div class="chap-num" style="color:#dc2626">${semResposta}</div><div class="chap-label">SEM RESPOSTA</div><div class="fonte-card">Classificação Vermelha</div></div></div>`
}

/*=========================================================
126 QUEIMADAS FUNCTION RENDERMUNICIPIOSSEMRESPOSTA
=========================================================*/
async function renderMunicipiosSemResposta(){
let box=document.getElementById('painelMunicipiosSemResposta')
if(!box)return
let{data=[],error}=await client.from('vw_queimadas_municipios_resposta').select('*').order('municipio')
if(error){console.error('Erro municípios sem resposta:',error);return}
let lista=(data||[]).map(classificarMunicipioAtual).filter(i=>i.classificacaoAtual==='VERMELHO')
box.innerHTML=lista.length?'<div class="heatmap-grid">'+lista.map(i=>`<div class="heat-vermelho"><div class="heat-municipio">${i.municipio||'-'}</div><div class="heat-info">Situação: SEM RESPOSTA<br>Ofício: ${i.nroficioenviadotcero||'-'}<br>Envio: ${formatarDataBR(i.dataenviodoc)}</div><div class="fonte-card">Fonte: Ofício Circular n.16/2026/GABPRES/TCERO</div></div>`).join('')+'</div>':'<div class="situacaoSemDados">Nenhum município sem resposta.</div>'
}
/*=========================================================
127 QUEIMADAS FUNCTION RENDERKPISMUNICIPAIS
=========================================================*/
async function renderKPIsMunicipais(){
let box=document.getElementById('painelKPIsMunicipais')
if(!box)return
let{data=[],error}=await client.from('vw_queimadas_municipios_resposta').select('*')
if(error){console.error('Erro KPIs municipais:',error);return}
let lista=(data||[]).map(classificarMunicipioAtual)
let total=lista.length
let planos=lista.filter(i=>i.classificacaoAtual==='VERDE').length
let dilacoes=lista.filter(i=>i.classificacaoAtual==='AMARELO').length
let semResposta=lista.filter(i=>i.classificacaoAtual==='VERMELHO').length
box.innerHTML=`<div class="chap-grid"><div class="chap-card"><div class="chap-num">${total}</div><div class="chap-label">MUNICÍPIOS OFICIADOS</div><div class="fonte-card">Fonte: Ofício Circular n.16/2026/GABPRES/TCERO</div></div><div class="chap-card"><div class="chap-num" style="color:#16a34a">${planos}</div><div class="chap-label">PLANO APRESENTADO</div><div class="fonte-card">Classificação Verde</div></div><div class="chap-card"><div class="chap-num" style="color:#facc15">${dilacoes}</div><div class="chap-label">DILAÇÃO DE PRAZO</div><div class="fonte-card">Classificação Amarela</div></div><div class="chap-card"><div class="chap-num" style="color:#dc2626">${semResposta}</div><div class="chap-label">SEM RESPOSTA</div><div class="fonte-card">Classificação Vermelha</div></div></div>`
}
/*=========================================================
128 QUEIMADAS FUNCTION RENDERPLANOSAPRESENTADOS
=========================================================*/
async function renderPlanosApresentados(){
let box=document.getElementById('painelPlanosApresentados')
if(!box)return
let{data=[],error}=await client.from('vw_queimadas_municipios_resposta').select('*').order('municipio')
if(error){console.error('Erro planos apresentados:',error);return}
let lista=(data||[]).map(classificarMunicipioAtual).filter(i=>i.classificacaoAtual==='VERDE')
box.innerHTML=lista.length?'<table class="tabelaMiniMunicipios"><tr><th>Município</th><th>Recebimento</th></tr>'+lista.map(i=>`<tr><td>${i.municipio||'-'}</td><td>${i.recebimentoAtual?formatarDataBR(i.recebimentoAtual):'-'}</td></tr>`).join('')+'</table>':'<div class="situacaoSemDados">Nenhum plano apresentado.</div>'
}
/*=========================================================
129 QUEIMADAS FUNCTION RENDERDILACOESPRAZO
=========================================================*/
async function renderDilacoesPrazo(){
let box=document.getElementById('painelDilacoesPrazo')
if(!box)return
let{data=[],error}=await client.from('vw_queimadas_municipios_resposta').select('*').order('municipio')
if(error){console.error('Erro dilações de prazo:',error);return}
let lista=(data||[]).map(classificarMunicipioAtual).filter(i=>i.classificacaoAtual==='AMARELO')
box.innerHTML=lista.length?'<table class="tabelaMiniMunicipios"><tr><th>Município</th><th>Recebimento</th></tr>'+lista.map(i=>`<tr><td>${i.municipio||'-'}</td><td>${i.recebimentoAtual?formatarDataBR(i.recebimentoAtual):'-'}</td></tr>`).join('')+'</table>':'<div class="situacaoSemDados">Nenhum município com dilação de prazo.</div>'
}
/*=========================================================
130 QUEIMADAS FUNCTION RENDERDASHBOARDPRESIDENTE
=========================================================*/
async function renderDashboardPresidente(){
let[{data:ranking=[],error:erroRanking},{data:municipios=[],error:erroMunicipios},{data:exec,error:erroExec}]=await Promise.all([
client.from('vw_queimadas_ranking_estadual').select('*'),
client.from('vw_queimadas_municipios_resposta').select('*'),
client.from('vw_queimadas_executivo').select('*').single()
])
if(erroRanking)console.error('Erro ranking:',erroRanking)
if(erroMunicipios)console.error('Erro municípios:',erroMunicipios)
if(erroExec)console.error('Erro executivo:',erroExec)
exec=exec||{}
let listaMunicipios=(municipios||[]).map(classificarMunicipioAtual)
let criticos=ranking.filter(i=>Number(i.indice_final||i.iriq||0)>=75).length
let altos=ranking.filter(i=>{let v=Number(i.indice_final||i.iriq||0);return v>=50&&v<75}).length
let moderados=ranking.filter(i=>{let v=Number(i.indice_final||i.iriq||0);return v>=25&&v<50}).length
let baixos=ranking.filter(i=>Number(i.indice_final||i.iriq||0)<25).length
let comPlano=listaMunicipios.filter(i=>i.classificacaoAtual==='VERDE').length
let dilacao=listaMunicipios.filter(i=>i.classificacaoAtual==='AMARELO').length
let semResposta=listaMunicipios.filter(i=>i.classificacaoAtual==='VERMELHO').length
let resumo=document.getElementById('painelResumoExecutivoGeral')
if(resumo)resumo.innerHTML=`<div class="kpiGrid"><div class="kpiCard"><div class="kpiNumero">${Number(exec.focos_estado||0).toLocaleString('pt-BR')}</div><div class="kpiTitulo">🔥 FOCOS DE CALOR</div></div><div class="kpiCard"><div class="kpiNumero">${Number(exec.iriq_estadual||0).toFixed(2)}</div><div class="kpiTitulo">🤖 IRIQ ESTADUAL</div></div><div class="kpiCard"><div class="kpiNumero">${criticos}</div><div class="kpiTitulo">🚨 CRÍTICOS</div></div><div class="kpiCard"><div class="kpiNumero">${listaMunicipios.length}</div><div class="kpiTitulo">🏛 MUNICÍPIOS</div></div></div>`
let top=document.getElementById('painelTopCriticosGeral')
if(top)top.innerHTML=[...(ranking||[])].sort((a,b)=>Number(b.indice_final||b.iriq||0)-Number(a.indice_final||a.iriq||0)).slice(0,10).map((i,idx)=>`<div class="linha-ranking"><span>${idx+1}º ${i.municipio}</span><b>${Number(i.indice_final||i.iriq||0).toFixed(2)}</b></div>`).join('')
let distribuicao=document.getElementById('painelDistribuicaoRisco')
if(distribuicao)distribuicao.innerHTML=`<div class="chap-grid"><div class="chap-card"><div class="chap-num">${criticos}</div><div class="chap-label">CRÍTICOS</div></div><div class="chap-card"><div class="chap-num">${altos}</div><div class="chap-label">ALTOS</div></div><div class="chap-card"><div class="chap-num">${moderados}</div><div class="chap-label">MODERADOS</div></div><div class="chap-card"><div class="chap-num">${baixos}</div><div class="chap-label">BAIXOS</div></div></div>`
let planos=document.getElementById('painelPlanosMunicipais')
if(planos)planos.innerHTML=`<div class="chap-grid"><div class="chap-card"><div class="chap-num" style="color:#16a34a">${comPlano}</div><div class="chap-label">COM PLANO</div></div><div class="chap-card"><div class="chap-num" style="color:#facc15">${dilacao}</div><div class="chap-label">DILAÇÃO</div></div><div class="chap-card"><div class="chap-num" style="color:#dc2626">${semResposta}</div><div class="chap-label">SEM RESPOSTA</div></div></div>`
let governanca=((comPlano*100)+(dilacao*50))/(listaMunicipios.length||1)
let painelGovernanca=document.getElementById('painelGovernancaEstadual')
if(painelGovernanca)painelGovernanca.innerHTML=`<div class="chap-card"><div class="chap-num">${governanca.toFixed(1)}%</div><div class="chap-label">ÍNDICE DE GOVERNANÇA</div></div>`
let recomendacao=document.getElementById('painelRecomendacaoExecutiva')
if(recomendacao)recomendacao.innerHTML=`<div style="padding:10px;line-height:1.6">A análise integrada dos dados do INPE, MAPBIOMAS, PRODES, CHAPT e IRIQ indica prioridade máxima para os municípios de <b>${[...(ranking||[])].sort((a,b)=>Number(b.indice_final||b.iriq||0)-Number(a.indice_final||a.iriq||0)).slice(0,3).map(i=>i.municipio).join(', ')}</b>, em razão da concentração de focos de calor, áreas queimadas, desmatamento acumulado e risco ambiental elevado.</div>`
}
/*=========================================================
130-A QUEIMADAS FUNCTION RENDERGRAFICOMUNICIPIOS
=========================================================*/
async function renderGraficoMunicipios(){
return renderDistribuicaoRespostas()
}
/*=========================================================
131 QUEIMADAS FUNCTION RENDERTABELAMUNICIPIOS
=========================================================*/
async function renderTabelaMunicipios(){
let box=document.getElementById('painelTabelaMunicipios')
if(!box)return
let filtro=document.getElementById('filtroMunicipioSituacao')?.value||''
let busca=(document.getElementById('buscaMunicipio')?.value||'').toUpperCase()
let{data=[],error}=await client.from('vw_queimadas_municipios_resposta').select('*').order('municipio')
if(error)return
let lista=data.map(classificarMunicipioAtual)
if(filtro)lista=lista.filter(i=>i.classificacaoAtual===filtro)
if(busca)lista=lista.filter(i=>String(i.municipio||'').toUpperCase().includes(busca))
let html=`<div class="tabelaMunicipiosWrap"><table class="tabelaMunicipios tabelaMunicipiosNova"><thead><tr><th class="colMun">MUNICÍPIO</th><th class="colSit">SITUAÇÃO</th><th class="colDoc">DOCUMENTO</th><th class="colData">RECEBIMENTO</th><th class="colObs">OBSERVAÇÃO</th></tr></thead><tbody>`
lista.forEach(i=>{
let cor=i.classificacaoAtual==='VERDE'?'#16a34a':i.classificacaoAtual==='AMARELO'?'#d4a900':i.classificacaoAtual==='VERMELHO'?'#dc2626':'#64748b'
html+=`<tr><td class="tdMunicipio">${i.municipio||'-'}</td><td class="tdSituacao" style="color:${cor}">${i.situacaoAtual}</td><td class="tdDocumento">${i.documentoAtual}</td><td class="tdRecebimento">${i.recebimentoAtual?formatarDataBR(i.recebimentoAtual):'-'}</td><td class="tdObservacao">${i.observacao||'-'}</td></tr>`
})
html+=`</tbody></table><div class="fonte-card fonteTabelaMunicipios">Fonte: Ofício Circular n.16/2026/GABPRES/TCERO</div></div>`
box.innerHTML=html
}
/*=========================================================
132 QUEIMADAS FUNCTION RENDERMAPAMUNICIPAL
=========================================================*/
async function renderMapaMunicipal(){
let box=document.getElementById('mapaMunicipalRO')
if(!box||!document.body.contains(box)||!box.offsetWidth||!box.offsetHeight)return
if(window.mapaMunicipalRO){
window.mapaMunicipalRO.remove()
window.mapaMunicipalRO=null
}
window.mapaMunicipalRO=L.map(box).setView([-10.9,-63.3],7)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'OpenStreetMap'}).addTo(window.mapaMunicipalRO)
let{data=[],error}=await client.from('vw_queimadas_municipios_resposta').select('*')
if(error){console.error(error);return}
let lista=data.map(classificarMunicipioAtual)
let situacao={}
lista.forEach(i=>situacao[String(i.municipio||'').trim().toUpperCase()]=i)
console.log('MAPA CLASSIFICAÇÃO:',lista.map(i=>({
municipio:i.municipio,
cor:i.classificacaoAtual,
documento:i.documentoAtual,
recebimento:i.recebimentoAtual
})))
let geo=await fetch('./assets/geojson/municipios-ro.geojson')
let geojson=await geo.json()
window.layerMunicipios=L.geoJSON(geojson,{
style:f=>{
let nome=String(f.properties.nome||f.properties.NOME||f.properties.municipio||'').trim().toUpperCase()
let m=situacao[nome]
let cor=m?.classificacaoAtual==='VERDE'?'#16a34a':m?.classificacaoAtual==='AMARELO'?'#facc15':m?.classificacaoAtual==='VERMELHO'?'#dc2626':'#94a3b8'
return{color:'#334155',weight:1,fillColor:cor,fillOpacity:.85}
},
onEachFeature:(f,l)=>{
let nome=String(f.properties.nome||f.properties.NOME||f.properties.municipio||'')
let m=situacao[nome.trim().toUpperCase()]
l.dadosMunicipio=m
if(!m){l.bindPopup(`<b>${nome}</b><br>Sem classificação`);return}
let icone=m.classificacaoAtual==='VERDE'?'🟢':m.classificacaoAtual==='AMARELO'?'🟡':'🔴'
let titulo=m.classificacaoAtual==='VERDE'?'Plano de Ação Apresentado':m.classificacaoAtual==='AMARELO'?'Dilação de Prazo':'Sem Resposta'
l.bindPopup(`
<b>${m.municipio||nome}</b><hr>
<b>Situação:</b><br>${icone} <b>${titulo}</b><br><br>
<b>Documento:</b><br>${m.documentoAtual||'-'}<br><br>
<b>Recebimento:</b><br>${m.recebimentoAtual?formatarDataBR(m.recebimentoAtual):'-'}<br><br>
${m.observacao||'-'}
`)
}
}).addTo(window.mapaMunicipalRO)
window.mapaMunicipalRO.fitBounds(window.layerMunicipios.getBounds())
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
let classificacao=m.classificacaoAtual||''
if(tipo==='TODOS'){
l.setStyle({fillOpacity:.85,weight:1})
return
}
if(classificacao===tipo){
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
let{data=[],error}=await client.from('vw_queimadas_municipios_resposta').select('*')
if(error){console.error('Erro estatísticas municipais:',error);return}
let lista=(data||[]).map(classificarMunicipioAtual)
let total=lista.length
let planos=lista.filter(i=>i.classificacaoAtual==='VERDE').length
let dilacoes=lista.filter(i=>i.classificacaoAtual==='AMARELO').length
let semResposta=lista.filter(i=>i.classificacaoAtual==='VERMELHO').length
let atendimento=total?((planos/total)*100).toFixed(1):'0.0'
console.log('ESTATÍSTICAS MUNICIPAIS:',{total,planos,dilacoes,semResposta,atendimento})
box.innerHTML=`<div class="gridKPIMunicipios"><div class="kpiCard"><div class="kpiNumero">${total}</div><div class="kpiTitulo">Municípios</div></div><div class="kpiCard"><div class="kpiNumero">${planos}</div><div class="kpiTitulo">🟢 Com Plano</div></div><div class="kpiCard"><div class="kpiNumero">${dilacoes}</div><div class="kpiTitulo">🟡 Dilação</div></div><div class="kpiCard"><div class="kpiNumero">${semResposta}</div><div class="kpiTitulo">🔴 Sem Resposta</div></div><div class="kpiCard"><div class="kpiNumero">${atendimento}%</div><div class="kpiTitulo">Atendimento</div></div></div>`
}

/*=========================================================
135 QUEIMADAS FUNCTION RENDERMUNICIPIOSOFICIO
=========================================================*/
async function renderMunicipiosOficio(tipo='CADASTRO'){
let destino=tipo==='RESUMO'?'painelSituacaoGeralMunicipios':'painelCadastroMunicipiosResumo'
let box=document.getElementById(destino)
if(!box)return
let{data,error}=await client.from('vw_queimadas_municipios_resposta').select('*').order('municipio')
if(error){
console.error('Erro ao carregar municípios:',error)
box.innerHTML='Erro ao carregar.'
return
}
let lista=(data||[]).map(classificarMunicipioAtual)
let html='<div style="overflow-x:auto;width:100%">'
html+='<table class="tabelaResumoMunicipios">'
html+='<thead>'
if(tipo==='RESUMO'){
html+='<tr>'
html+='<th style="width:40px">Nº</th>'
html+='<th style="width:150px">Município</th>'
html+='<th style="width:150px">Situação</th>'
html+='<th style="width:80px">Data</th>'
html+='<th style="width:110px">Documento</th>'
html+='<th style="width:220px">Observação</th>'
html+='</tr>'
}else{
html+='<tr>'
html+='<th style="width:170px">Município</th>'
html+='<th style="width:140px">Situação</th>'
html+='<th style="width:150px">Ofício TCE</th>'
html+='<th style="width:80px">Data Envio</th>'
html+='<th style="width:90px">Pág.</th>'
html+='<th style="width:80px">Data Rec.1</th>'
html+='<th style="width:80px">Data Rec.2</th>'
html+='<th style="width:90px">Doc.1</th>'
html+='<th style="width:90px">Doc.2</th>'
html+='<th style="width:auto">Observação</th>'
html+='<th style="width:70px">Ação</th>'
html+='</tr>'
}
html+='</thead><tbody>'
lista.forEach((i,idx)=>{
let situacao='🔴 Sem Resposta'
let corSituacao='#dc2626'
if(i.classificacaoAtual==='VERDE'){
situacao='🟢 Com Plano de Ação'
corSituacao='#16a34a'
}else if(i.classificacaoAtual==='AMARELO'){
situacao='🟡 Dilação de Prazo'
corSituacao='#ca8a04'
}
if(tipo==='RESUMO'){
html+='<tr>'
html+=`<td style="text-align:center">${idx+1}</td>`
html+=`<td style="width:150px;white-space:normal;font-weight:600">${i.municipio||'-'}</td>`
html+=`<td style="width:150px;font-weight:800;color:${corSituacao}">${situacao}</td>`
html+=`<td style="width:80px;text-align:center">${i.recebimentoAtual?formatarDataBR(i.recebimentoAtual):'-'}</td>`
html+=`<td style="width:110px;text-align:center">${i.documentoAtual||'-'}</td>`
html+=`<td style="width:220px;white-space:normal;word-break:break-word">${i.observacao||'-'}</td>`
html+='</tr>'
}else{
html+='<tr>'
html+=`<td style="width:170px;font-weight:600">${i.municipio||'-'}</td>`
html+=`<td style="width:140px;font-weight:800;color:${corSituacao}">${situacao}</td>`
html+=`<td style="width:150px;font-size:11px">${i.nroficioenviadotcero||'-'}</td>`
html+=`<td style="width:80px;text-align:center">${formatarDataBR(i.dataenviodoc)}</td>`
html+=`<td style="width:90px;text-align:center">${i.paginaenviodoc||'-'}</td>`
html+=`<td style="width:80px;text-align:center">${formatarDataBR(i.ldatarecebimentodoc)}</td>`
html+=`<td style="width:80px;text-align:center">${formatarDataBR(i.lldatarecebimentodoc)}</td>`
html+=`<td style="width:90px;text-align:center">${i.lnumerodocenviado||'-'}</td>`
html+=`<td style="width:90px;text-align:center">${i.llnumerodocenviado||'-'}</td>`
html+=`<td style="white-space:normal;word-break:break-word;line-height:1.35">${i.observacao||'-'}</td>`
html+=`<td style="text-align:center"><button class="btnEditarMunicipio" data-municipio="${String(i.municipio||'').replace(/"/g,'&quot;')}" onclick="autorizarEdicaoMunicipio(this.dataset.municipio)">✏ EDITAR</button></td>`
html+='</tr>'
}
})
html+='</tbody></table></div>'
box.innerHTML=html
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
139-A QUEIMADAS FUNCTION AUTORIZAREDICAOMUNICIPIO
=========================================================*/
function autorizarEdicaoMunicipio(municipio){
municipio=String(municipio||'').trim()
if(!municipio)return
fecharModalSenhaMunicipio()
let html=`
<div id="modalSenhaMunicipio" class="modalMunicipioOverlay">
<div class="modalSenhaMunicipioBox">
<div class="modalSenhaIcone">🔐</div>
<h2>EDIÇÃO PROTEGIDA</h2>
<p>Informe a senha para alterar o Cadastro Municipal.</p>
<input
id="senhaEdicaoMunicipio"
type="password"
placeholder="Senha de edição"
autocomplete="current-password"
>
<div id="erroSenhaMunicipio"></div>
<div class="modalSenhaBotoes">
<button
class="btnConfirmarSenhaMunicipio"
data-municipio="${municipio.replace(/"/g,'&quot;')}"
onclick="validarSenhaEdicaoMunicipio(this.dataset.municipio)"
>
🔓 AUTORIZAR
</button>
<button
class="btnCancelarSenhaMunicipio"
onclick="fecharModalSenhaMunicipio()"
>
CANCELAR
</button>
</div>
</div>
</div>
`
document.body.insertAdjacentHTML('beforeend',html)
setTimeout(()=>{
let input=document.getElementById('senhaEdicaoMunicipio')
if(input){
input.focus()
input.addEventListener('keydown',e=>{
if(e.key==='Enter'){
validarSenhaEdicaoMunicipio(municipio)
}
})
}
},50)
}
/*=========================================================
139-B QUEIMADAS FUNCTION VALIDARSENHAEDICAOMUNICIPIO
=========================================================*/
async function validarSenhaEdicaoMunicipio(municipio){
let senha=document.getElementById('senhaEdicaoMunicipio')?.value||''
let erro=document.getElementById('erroSenhaMunicipio')
let btn=document.querySelector('.btnConfirmarSenhaMunicipio')
if(!senha){
if(erro)erro.innerText='Informe a senha.'
return
}
if(btn){
btn.disabled=true
btn.innerHTML='⏳ VALIDANDO...'
}
if(erro)erro.innerText=''
try{
let resposta=await fetch(
`${window.S_URL}/functions/v1/municipios-edicao-protegida`,
{
method:'POST',
headers:{
'Content-Type':'application/json',
'apikey':window.S_KEY,
'Authorization':`Bearer ${window.S_KEY}`
},
body:JSON.stringify({
acao:'validar',
senha
})
}
)
let resultado=await resposta.json().catch(()=>({}))
if(!resposta.ok||!resultado.sucesso){
if(erro){
erro.innerText=resultado.erro||'Senha incorreta.'
}
if(btn){
btn.disabled=false
btn.innerHTML='🔓 AUTORIZAR'
}
return
}
window.senhaEdicaoMunicipio=senha
fecharModalSenhaMunicipio()
await editarMunicipio(municipio)
}catch(error){
console.error('Erro de autorização:',error)
if(erro){
erro.innerText='Não foi possível validar a autorização.'
}
if(btn){
btn.disabled=false
btn.innerHTML='🔓 AUTORIZAR'
}
}
}
/*=========================================================
139-C QUEIMADAS FUNCTION FECHARMODALSENHAMUNICIPIO
=========================================================*/
function fecharModalSenhaMunicipio(){
let modal=document.getElementById('modalSenhaMunicipio')
if(modal)modal.remove()
}
/*=========================================================
140 QUEIMADAS FUNCTION EDITARMUNICIPIO
=========================================================*/
async function editarMunicipio(municipio){
municipio=String(municipio||'').trim()
if(!municipio){alert('Município não identificado.');return}
console.log('Município selecionado:',municipio)
let{data,error}=await client.from('vw_queimadas_municipios_resposta').select('*').eq('municipio',municipio).maybeSingle()
if(error){console.error('Erro ao localizar município:',error);alert('Erro ao localizar o registro: '+error.message);return}
if(!data){alert('Registro não encontrado para: '+municipio);return}
fecharModalMunicipio()
let registro=typeof classificarMunicipioAtual==='function'?classificarMunicipioAtual(data):data
let situacaoAtual=registro.classificacaoAtual||''
if(!situacaoAtual){
if(data.plano_acao===true)situacaoAtual='VERDE'
else if(data.dilacao_prazo===true)situacaoAtual='AMARELO'
else situacaoAtual='VERMELHO'
}
let html=`
<div id="modalMunicipio" class="modalMunicipioOverlay">
<div class="modalMunicipioBox">
<h2>🏛️ CADASTRO MUNICIPAL</h2>
<label>Município</label>
<input id="mMunicipio" value="${String(data.municipio||'').replace(/"/g,'&quot;')}" readonly style="background:#f3f4f6;color:#374151;cursor:not-allowed;font-weight:600">
<label style="margin-top:12px;font-weight:900">Situação do Município</label>
<select id="mSituacao" onchange="atualizarVisualSituacaoMunicipio()" style="width:100%;padding:11px;border:2px solid #cbd5e1;border-radius:8px;font-weight:800;font-size:14px;background:#fff">
<option value="VERDE"${situacaoAtual==='VERDE'?' selected':''}>🟢 COM PLANO</option>
<option value="AMARELO"${situacaoAtual==='AMARELO'?' selected':''}>🟡 DILAÇÃO DE PRAZO</option>
<option value="VERMELHO"${situacaoAtual==='VERMELHO'?' selected':''}>🔴 SEM RESPOSTA</option>
</select>
<div id="mSituacaoVisual" style="margin-top:7px;margin-bottom:12px;padding:9px;border-radius:7px;text-align:center;font-weight:900"></div>
<label>Ofício TCE-RO</label>
<input id="mOficio" value="${String(data.nroficioenviadotcero||'').replace(/"/g,'&quot;')}">
<label>Data Envio</label>
<input id="mDataEnvio" type="date" value="${data.dataenviodoc||''}">
<label>Página Envio</label>
<input id="mPaginaEnvio" value="${String(data.paginaenviodoc||'').replace(/"/g,'&quot;')}">
<label>Data Recebimento 1</label>
<input id="mDataRec1" type="date" value="${data.ldatarecebimentodoc||''}">
<label>Data Recebimento 2</label>
<input id="mDataRec2" type="date" value="${data.lldatarecebimentodoc||''}">
<label>Página Recebimento 1</label>
<input id="mPagRec1" value="${String(data.lpaginarecebimentodoc||'').replace(/"/g,'&quot;')}">
<label>Página Recebimento 2</label>
<input id="mPagRec2" value="${String(data.llpaginarecebimentodoc||'').replace(/"/g,'&quot;')}">
<label>Documento Recebido 1</label>
<input id="mDoc1" value="${String(data.lnumerodocenviado||'').replace(/"/g,'&quot;')}">
<label>Documento Recebido 2</label>
<input id="mDoc2" value="${String(data.llnumerodocenviado||'').replace(/"/g,'&quot;')}">
<label>Observação</label>
<textarea id="mObs">${String(data.observacao||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
<div class="modalMunicipioBotoes">
<button class="btnSalvarMunicipio" data-municipio="${String(data.municipio||'').replace(/"/g,'&quot;')}" onclick="salvarMunicipio(this.dataset.municipio)">💾 SALVAR</button>
<button class="btnCancelarMunicipio" onclick="fecharModalMunicipio()">❌ CANCELAR</button>
</div>
</div>
</div>`
document.body.insertAdjacentHTML('beforeend',html)
atualizarVisualSituacaoMunicipio()
}
/*=========================================================
140-A QUEIMADAS FUNCTION ATUALIZARVISUALSITUACAOMUNICIPIO
=========================================================*/
function atualizarVisualSituacaoMunicipio(){
let select=document.getElementById('mSituacao')
let box=document.getElementById('mSituacaoVisual')
if(!select||!box)return
let situacao=select.value
if(situacao==='VERDE'){
select.style.borderColor='#16a34a'
select.style.background='#f0fdf4'
box.style.background='#dcfce7'
box.style.color='#166534'
box.style.border='1px solid #16a34a'
box.innerHTML='🟢 PLANO DE AÇÃO APRESENTADO'
return
}
if(situacao==='AMARELO'){
select.style.borderColor='#eab308'
select.style.background='#fefce8'
box.style.background='#fef9c3'
box.style.color='#854d0e'
box.style.border='1px solid #eab308'
box.innerHTML='🟡 DILAÇÃO DE PRAZO'
return
}
select.style.borderColor='#dc2626'
select.style.background='#fef2f2'
box.style.background='#fee2e2'
box.style.color='#991b1b'
box.style.border='1px solid #dc2626'
box.innerHTML='🔴 SEM RESPOSTA'
}

/*=========================================================
141 QUEIMADAS FUNCTION FECHARMODALMUNICIPIO
=========================================================*/
function fecharModalMunicipio(){
let modal=document.getElementById('modalMunicipio')
if(modal)modal.remove()
}

/*=========================================================*
*142 QUEIMADAS FUNCTION SALVARMUNICIPIO
*=========================================================*/
async function salvarMunicipio(municipioOriginal){
municipioOriginal=String(municipioOriginal||'').trim()
if(!municipioOriginal){alert('Município não identificado.');return}
let btn=document.querySelector('#modalMunicipio .btnSalvarMunicipio')
if(btn){btn.disabled=true;btn.innerHTML='⏳ SALVANDO...'}
try{
let situacao=document.getElementById('mSituacao')?.value||''
if(!['VERDE','AMARELO','VERMELHO'].includes(situacao)){alert('Selecione a situação do município.');return}
let planoAcao=situacao==='VERDE'
let dilacaoPrazo=situacao==='AMARELO'
let semResposta=situacao==='VERMELHO'
let dataRec1=document.getElementById('mDataRec1')?.value||''
let dataRec2=document.getElementById('mDataRec2')?.value||''
let doc1=document.getElementById('mDoc1')?.value.trim()||''
let doc2=document.getElementById('mDoc2')?.value.trim()||''
let observacao=document.getElementById('mObs')?.value.trim()||''
let payload={
nroficioenviadotcero:document.getElementById('mOficio')?.value||null,
dataenviodoc:document.getElementById('mDataEnvio')?.value||null,
paginaenviodoc:document.getElementById('mPaginaEnvio')?.value||null,
ldatarecebimentodoc:dataRec1||null,
lldatarecebimentodoc:dataRec2||null,
lpaginarecebimentodoc:document.getElementById('mPagRec1')?.value||null,
llpaginarecebimentodoc:document.getElementById('mPagRec2')?.value||null,
lnumerodocenviado:doc1||null,
llnumerodocenviado:doc2||null,
observacao:observacao||null,
plano_acao:planoAcao,
dilacao_prazo:dilacaoPrazo,
sem_resposta:semResposta
}
console.log('SALVANDO MUNICÍPIO:',municipioOriginal)
console.log('SITUAÇÃO SELECIONADA:',situacao)
console.log('CLASSIFICAÇÃO:',{planoAcao,dilacaoPrazo,semResposta})
console.log('PAYLOAD:',payload)
let resposta=await fetch(`${window.S_URL}/functions/v1/municipios-edicao-protegida`,{
method:'POST',
headers:{'Content-Type':'application/json','apikey':window.S_KEY,'Authorization':`Bearer ${window.S_KEY}`},
body:JSON.stringify({acao:'salvar',senha:window.senhaEdicaoMunicipio||'',municipio:municipioOriginal,payload})
})
let resultado={}
try{resultado=await resposta.json()}catch(e){resultado={erro:`Resposta inválida do servidor (${resposta.status})`}}
if(!resposta.ok||!resultado.sucesso){
console.error('Erro ao salvar município:',resposta.status,resultado)
alert('Alteração não autorizada: '+(resultado.erro||`erro HTTP ${resposta.status}`))
return
}
console.log('MUNICÍPIO ATUALIZADO:',resultado)
fecharModalMunicipio()
window.senhaEdicaoMunicipio=''
let atualizacoes=[]
if(typeof renderTabelaMunicipios==='function')atualizacoes.push(renderTabelaMunicipios())
if(typeof renderKPIsMunicipais==='function')atualizacoes.push(renderKPIsMunicipais())
if(typeof renderEstatisticasMunicipais==='function')atualizacoes.push(renderEstatisticasMunicipais())
if(typeof renderPlanosApresentados==='function')atualizacoes.push(renderPlanosApresentados())
if(typeof renderDilacoesPrazo==='function')atualizacoes.push(renderDilacoesPrazo())
if(typeof renderMunicipiosSemResposta==='function')atualizacoes.push(renderMunicipiosSemResposta())
if(typeof renderDistribuicaoRespostas==='function')atualizacoes.push(renderDistribuicaoRespostas())
if(typeof renderPlanosMunicipais==='function')atualizacoes.push(renderPlanosMunicipais())
if(typeof renderDashboardPresidente==='function')atualizacoes.push(renderDashboardPresidente())
if(typeof renderMapaMunicipal==='function')atualizacoes.push(renderMapaMunicipal())
await Promise.all(atualizacoes)
if(typeof renderMunicipiosOficio==='function')await renderMunicipiosOficio()
alert('Registro atualizado com sucesso.')
}catch(error){
console.error('Erro ao salvar município:',error)
alert('Erro ao salvar: '+(error?.message||error))
}finally{
if(btn){btn.disabled=false;btn.innerHTML='💾 SALVAR'}
}
}
/*=========================================================
143 QUEIMADAS FUNCTION RENDERDISTRIBUICAORESPOSTAS
=========================================================*/
async function renderDistribuicaoRespostas(){
const{data,error}=await client.from('vw_queimadas_municipios_resposta').select('*')
if(error){console.error('Erro distribuição respostas:',error);return}
let lista=(data||[]).map(classificarMunicipioAtual)
let verde=lista.filter(i=>i.classificacaoAtual==='VERDE').length
let amarelo=lista.filter(i=>i.classificacaoAtual==='AMARELO').length
let vermelho=lista.filter(i=>i.classificacaoAtual==='VERMELHO').length
let total=lista.length
console.log('DISTRIBUIÇÃO MUNICIPAL:',{total,verde,amarelo,vermelho,soma:verde+amarelo+vermelho})
console.table(lista.map(i=>({municipio:i.municipio,situacao:i.classificacaoAtual,plano_acao:i.plano_acao,dilacao_prazo:i.dilacao_prazo,sem_resposta:i.sem_resposta})))
const ctx=document.getElementById('graficoMunicipiosResposta')
if(!ctx)return
if(window.chartMunicipiosResposta){window.chartMunicipiosResposta.destroy();window.chartMunicipiosResposta=null}
if(window.graficoDistribuicao){window.graficoDistribuicao.destroy();window.graficoDistribuicao=null}
window.graficoDistribuicao=new Chart(ctx,{
type:'doughnut',
data:{labels:['Com Plano','Dilação','Sem Resposta'],datasets:[{data:[verde,amarelo,vermelho],backgroundColor:['#16a34a','#facc15','#dc2626'],borderColor:'#ffffff',borderWidth:3,hoverOffset:8}]},
options:{responsive:true,maintainAspectRatio:false,radius:'92%',cutout:'48%',layout:{padding:{top:5,right:10,bottom:0,left:10}},plugins:{legend:{display:true,position:'bottom',align:'center',labels:{usePointStyle:true,pointStyle:'circle',boxWidth:9,boxHeight:9,padding:18,color:'#0f172a',font:{size:12,weight:'800'},generateLabels(chart){const dataset=chart.data.datasets[0];return chart.data.labels.map((label,i)=>({text:`${label}: ${Number(dataset.data[i]||0).toLocaleString('pt-BR')}`,fillStyle:dataset.backgroundColor[i],strokeStyle:dataset.backgroundColor[i],fontColor:'#0f172a',hidden:false,index:i}))}}},tooltip:{backgroundColor:'#0f172a',titleColor:'#fff',bodyColor:'#fff',padding:10,callbacks:{label:context=>{let totalGrafico=context.dataset.data.reduce((s,v)=>s+Number(v||0),0);let valor=Number(context.raw||0);let percentual=totalGrafico?((valor/totalGrafico)*100).toFixed(1).replace('.',','):'0,0';return`${context.label}: ${valor} (${percentual}%)`}}},datalabels:{display:context=>Number(context.dataset.data[context.dataIndex]||0)>0,color:'#000',backgroundColor:'rgba(255,255,255,.88)',borderColor:'#000',borderWidth:1,borderRadius:4,padding:{top:4,bottom:4,left:7,right:7},font:{family:'Arial',size:19,weight:'bold'},formatter:v=>v,anchor:'center',align:'center',clamp:true}}},
plugins:typeof ChartDataLabels!=='undefined'?[ChartDataLabels]:[]
})
}


