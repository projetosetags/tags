/*=========================================================
001 QUEIMADAS FUNCTION RENDERCADEIAVALOR
=========================================================*/
async function renderCadeiaValor(){
let box=document.getElementById('painelCadeiaValor')
if(!box)return
let {data,error}=await client
.from('queimadas_cadeia_valor')
.select('*')
.order('item',{ascending:true})
if(error){
console.log(error)
box.innerHTML='Erro ao carregar.'
return
}
let html=''
data.forEach(i=>{
html+=`
<div class="cadeia-card">
<div class="cadeia-item">${i.item||'-'}</div>
<div class="cadeia-flow">
<div class="cadeia-box cadeia-insumo">📥<br>${i.insumo||'-'}</div>
<div class="cadeia-seta">➜</div>
<div class="cadeia-box cadeia-atividade">⚙️<br>${i.atividade||'-'}</div>
<div class="cadeia-seta">➜</div>
<div class="cadeia-box cadeia-produto">📦<br>${i.produto||'-'}</div>
<div class="cadeia-seta">➜</div>
<div class="cadeia-box cadeia-resultado">📈<br>${i.resultado||'-'}</div>
<div class="cadeia-seta">➜</div>
<div class="cadeia-box cadeia-impacto">🎯<br>${i.impacto||'-'}</div>
<div class="cadeia-seta">➜</div>
<div class="cadeia-box cadeia-beneficio">👨‍👩‍👧‍👦<br>${i.beneficio||'-'}</div>
</div>
</div>`
})
box.innerHTML=html
}
/*=========================================================
002 QUEIMADAS FUNCTION RENDERGANTT
=========================================================*/
async function renderGantt(){
let box=document.getElementById('painelGantt')
if(!box)return
let {data,error}=await client
.from('queimadas_marcos')
.select('*')
.order('data_inicio',{ascending:true})
if(error){
console.log(error)
return
}
let inicio=new Date()
inicio.setMonth(0)
inicio.setDate(1)
let html=''
data.forEach(m=>{
let d1=new Date(m.data_inicio)
let d2=new Date(m.data_fim)
let diasInicio=Math.floor((d1-inicio)/86400000)
let diasFim=Math.floor((d2-d1)/86400000)
html+=`
<div class="gantt-row">
<div class="gantt-titulo">${m.titulo}</div>
<div class="gantt-area">
<div class="gantt-bar" style="left:${diasInicio}px;width:${diasFim}px;background:${m.cor||'#2563eb'};">
${m.status||''}
</div>
</div>
</div>`
})
box.innerHTML=html
}
/*=========================================================
003 QUEIMADAS FUNCTION RENDERMATRIZRISCO5X5
=========================================================*/
async function renderMatrizRisco5x5(){
let box=document.getElementById('painelRiscos')
if(!box)return
let {data,error}=await client
.from('queimadas_riscos')
.select('*')
if(error){
console.log(error)
return
}
let matriz={}
for(let i=1;i<=5;i++){
for(let j=1;j<=5;j++){
matriz[`${i}_${j}`]=[]
}
}
data.forEach(r=>{
let p=Number(r.probabilidade||1)
let imp=Number(r.impacto||1)
matriz[`${p}_${imp}`].push(r)
})
let html=''
html+='<div class="matriz5x5">'
for(let y=5;y>=1;y--){
for(let x=1;x<=5;x++){
let score=x*y
let classe='risco-baixo'
if(score>=20){
classe='risco-critico'
}else if(score>=12){
classe='risco-alto'
}else if(score>=6){
classe='risco-medio'
}
html+=`
<div class="${classe}">
${matriz[`${x}_${y}`].map(r=>`
<div class="risco-tag">
🔥 ${r.fonte_calor||''}
<br>
${r.risco||''}
</div>`).join('')}
</div>`
}
}
html+='</div>'
box.innerHTML=html
}
/*=========================================================
004 QUEIMADAS FUNCTION RENDERTEORIAMUDANCA
=========================================================*/
async function renderTeoriaMudanca(){
let box=document.getElementById('painelTeoriaMudanca')
if(!box)return
let {data,error}=await client
.from('queimadas_cadeia_valor')
.select('*')
.order('item',{ascending:true})
if(error){
console.log(error)
box.innerHTML='Erro ao carregar.'
return
}
let html=''
data.forEach(i=>{
html+=`
<div class="tdm-card">
<div class="tdm-titulo">${i.item||'-'} - ${i.subitem||''}</div>
<div class="tdm-flow">
<div class="tdm-box tdm-problema">🚨<br>${i.insumo||'Problema não informado'}</div>
<div class="tdm-seta">↓</div>
<div class="tdm-box tdm-causa">🔍<br>${i.atividade||'Causa não informada'}</div>
<div class="tdm-seta">↓</div>
<div class="tdm-box tdm-acao">⚙️<br>${i.produto||'Ação não informada'}</div>
<div class="tdm-seta">↓</div>
<div class="tdm-box tdm-resultado">📈<br>${i.resultado||'Resultado não informado'}</div>
<div class="tdm-seta">↓</div>
<div class="tdm-box tdm-impacto">🎯<br>${i.impacto||'Impacto não informado'}</div>
<div class="tdm-seta">↓</div>
<div class="tdm-box tdm-beneficio">👨‍👩‍👧‍👦<br>${i.beneficio||'Benefício não informado'}</div>
</div>
</div>`
})
box.innerHTML=html
}

/*=========================================================
006 QUEIMADAS FUNCTION ANALISARCHAPIA
=========================================================*/
function analisarCHAPIA(registro){
let diagnostico=[]
let ods=[]
let riscos=[]
if(!registro.insumo){
diagnostico.push('Conhecimento insuficiente.')
}
if(!registro.atividade){
diagnostico.push('Habilidade operacional não demonstrada.')
}
if(!registro.produto){
diagnostico.push('Produto estratégico não identificado.')
}
if(!registro.resultado){
diagnostico.push('Resultado esperado não definido.')
}
if(!registro.impacto){
diagnostico.push('Impacto social não definido.')
}
let texto=JSON.stringify(registro).toLowerCase()
if(texto.includes('queimada')){
ods.push('ODS 13')
ods.push('ODS 15')
riscos.push('Eventos climáticos extremos')
}
if(texto.includes('fiscalização')){
ods.push('ODS 16')
riscos.push('Baixa capacidade operacional')
}
if(texto.includes('brigada')){
ods.push('ODS 15')
riscos.push('Déficit de pessoal especializado')
}
return{
score:Math.max(0,100-(diagnostico.length*15)),
diagnostico:diagnostico,
ods:[...new Set(ods)],
riscos:[...new Set(riscos)]
}
}
/*=========================================================
014 QUEIMADAS FUNCTION CARREGARKPISEXECUTIVOS
=========================================================*/
async function carregarKPIsExecutivos(){
let {data,error}=await client
.from('queimadas_monitoramento')
.select('*')
if(error){
console.log(error)
return
}
let municipios=new Set()
let focos=0
let riscos=0
let soma=0
data.forEach(i=>{
if(i.municipio)municipios.add(i.municipio)
soma+=Number(i.percentual||0)
if(Number(i.percentual||0)<50)riscos++
if(Number(i.percentual||0)>0)focos++
})
let media=data.length?Math.round(soma/data.length):0
let el1=document.getElementById('kpiMunicipios')
let el2=document.getElementById('kpiFocos')
let el3=document.getElementById('kpiRiscos')
let el4=document.getElementById('kpiExecucao')
if(el1)el1.innerText=municipios.size
if(el2)el2.innerText=focos
if(el3)el3.innerText=riscos
if(el4)el4.innerText=media+'%'
let pop=await calcularPopulacaoExposta()
let area=await calcularAreaRisco()
let iriq=await calcularIRIQ()

let k1=document.getElementById('kpiPopulacaoExposta')
if(k1)k1.innerText=
pop.toLocaleString('pt-BR')

let k2=document.getElementById('kpiAreaRisco')
if(k2)k2.innerText=
area+' km²'

let k3=document.getElementById('kpiIRIQ')
if(k3)k3.innerText=iriq
}
/*=========================================================
015 QUEIMADAS FUNCTION RENDERPLANOUNIFICADO
=========================================================*/
function renderPlanoUnificado(){
let box=document.getElementById('painelPlanoUnificado')
if(!box)return
box.innerHTML=`
<ul>
<li>Fiscalização Ambiental</li>
<li>Prevenção às Queimadas</li>
<li>Resposta Operacional</li>
<li>Monitoramento de Focos de Calor</li>
<li>Capacitação de Brigadistas</li>
<li>Monitoramento de Municípios Prioritários</li>
<li>Acompanhamento Orçamentário</li>
<li>Monitoramento CEPCIF</li>
<li>OVR 2026</li>
<li>POTIF 2026</li>
</ul>`
}
/*=========================================================
016 QUEIMADAS FUNCTION RENDERMUNICIPIOSPRIORITARIOS
=========================================================*/
async function renderMunicipiosPrioritarios(){
let box=document.getElementById('painelMunicipiosPrioritarios')
if(!box)return
let {data,error}=await client
.from('queimadas_municipios')
.select('*')
.order('prioridade',{ascending:true})
if(error){
console.log(error)
return
}
let html='<div class="heatmap-grid">'
data.forEach(m=>{
let classe='heat-verde'
if(m.prioridade==='ALTA')classe='heat-vermelho'
else if(m.prioridade==='MÉDIA')classe='heat-laranja'
else if(m.prioridade==='BAIXA')classe='heat-amarelo'
html+=`
<div class="${classe}">
<b>${m.municipio||'-'}</b><br>
Risco: ${m.risco||'-'}<br>
Focos: ${m.focos_calor||0}
</div>`
})
html+='</div>'
box.innerHTML=html
}
/*=========================================================
017 QUEIMADAS FUNCTION RENDERHEATMAPEXECUTIVO
=========================================================*/
async function renderHeatMapExecutivo(){
let box=document.getElementById('painelHeatMapExecutivo')
if(!box)return
let {data,error}=await client
.from('queimadas_monitoramento')
.select('*')
if(error){
console.log(error)
return
}
let html='<div class="heatmap-grid">'
data.forEach(i=>{
let p=Number(i.percentual||0)
let classe='heat-vermelho'
if(p>=80)classe='heat-verde'
else if(p>=60)classe='heat-amarelo'
else if(p>=40)classe='heat-laranja'
html+=`
<div class="${classe}">
${i.item||'-'}<br>
${p}%
</div>`
})
html+='</div>'
box.innerHTML=html
}
/*=========================================================
018 QUEIMADAS FUNCTION RENDERMONITORAMENTO4D
=========================================================*/
async function renderMonitoramento4D(){
let box=document.getElementById('painelMonitoramento4D')
if(!box)return
let {data,error}=await client
.from('queimadas_monitoramento_4d')
.select('*')
if(error){
console.log(error)
return
}
let html=''
data.forEach(i=>{
html+=`
<div class="monitor4d-card">
<div><b>${i.municipio||'-'}</b></div>
<div class="monitor4d-grid">
<div class="monitor4d-kpi execucao">Execução<br>${i.execucao||0}%</div>
<div class="monitor4d-kpi resultado">Resultado<br>${i.resultado||0}%</div>
<div class="monitor4d-kpi impacto">Impacto<br>${i.impacto||0}%</div>
<div class="monitor4d-kpi risco">Risco<br>${i.risco||0}%</div>
</div>
</div>`
})
box.innerHTML=html
}
/*=========================================================
019 QUEIMADAS FUNCTION RENDERODS
=========================================================*/
async function renderODS(){
let box=document.getElementById('painelODS')
if(!box)return
let html=''
html+='<div class="ods-grid">'
html+='<div class="ods-card ods13">ODS 13<br>AÇÃO CONTRA A MUDANÇA GLOBAL DO CLIMA</div>'
html+='<div class="ods-card ods15">ODS 15<br>VIDA TERRESTRE</div>'
html+='<div class="ods-card ods16">ODS 16<br>INSTITUIÇÕES EFICAZES</div>'
html+='</div>'
box.innerHTML=html
}
/*=========================================================
020 QUEIMADAS FUNCTION CALCULARIMPACTO
=========================================================*/
async function calcularImpacto(){
let box=document.getElementById('painelImpacto')
if(!box)return
let {data,error}=await client
.from('queimadas_monitoramento')
.select('*')
if(error){
console.log(error)
return
}
let soma=0
data.forEach(i=>{
soma+=Number(i.percentual||0)
})
let impacto=data.length?Math.round(soma/data.length):0
box.innerHTML=`
<div class="impacto-box">
<div class="impacto-score">${impacto}</div>
<div class="impacto-label">ÍNDICE DE IMPACTO AO CIDADÃO</div>
</div>`
}
/*=========================================================
021 QUEIMADAS FUNCTION GRAFICOGANTTEXECUTIVO
=========================================================*/
async function graficoGanttExecutivo(){
let box=document.getElementById('painelGanttExecutivo')
if(!box)return
let {data,error}=await client
.from('queimadas_marcos_gantt')
.select('*')
.order('data_inicio',{ascending:true})
if(error){
console.log(error)
return
}
let html=''
data.forEach(i=>{
html+=`
<div class="gantt-row">
<div class="gantt-titulo">${i.titulo||'-'}</div>
<div class="gantt-area">
<div class="gantt-bar andamento">${i.percentual||0}%</div>
</div>
</div>`
})
box.innerHTML=html
}
/*=========================================================
022 QUEIMADAS FUNCTION MATRIZRISCO5X5AVANCADA
=========================================================*/
async function matrizRisco5x5Avancada(){
let box=document.getElementById('painelRiscoAvancado')
if(!box)return
let {data,error}=await client
.from('queimadas_riscos')
.select('*')
if(error){
console.log(error)
return
}
let criticos=data.filter(i=>(Number(i.nivel_risco||0)>=20))
let html='<div class="heatmap-grid">'
criticos.forEach(i=>{
html+=`
<div class="heat-vermelho">
🔥 ${i.fonte_calor||'-'}<br>
${i.risco||'-'}<br>
Nível ${i.nivel_risco||0}
</div>`
})
html+='</div>'
box.innerHTML=html
}
/*=========================================================
023 QUEIMADAS FUNCTION IACHAPANALISAR
=========================================================*/
async function iaChapAnalisar(){
let box=document.getElementById('painelIAChap')
if(!box)return
let {data,error}=await client
.from('queimadas_chap')
.select('*')
if(error){
console.log(error)
return
}
let html=''
data.forEach(i=>{
let score=Math.round(
(
Number(i.conhecimento||0)+
Number(i.habilidade||0)+
Number(i.atitude||0)+
Number(i.proposito||0)
)/4
)
html+=`
<div class="chap-card">
<div class="chap-num">${score}%</div>
<div class="chap-label">${i.municipio||'-'}</div>
</div>`
})
box.innerHTML=html
}
/*=========================================================
024 QUEIMADAS FUNCTION RENDERGOVERNANCA
=========================================================*/
async function renderGovernanca(){
let box=document.getElementById('painelGovernanca')
if(!box)return
let {data,error}=await client.from('queimadas_monitoramento').select('*')
if(error){
console.log(error)
return
}
let total=data.length||0
let concluidos=data.filter(i=>Number(i.percentual||0)>=100).length
let andamento=data.filter(i=>Number(i.percentual||0)>0&&Number(i.percentual||0)<100).length
let pendentes=data.filter(i=>Number(i.percentual||0)<=0).length
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card"><div class="chap-num">${total}</div><div class="chap-label">AÇÕES</div></div>
<div class="chap-card"><div class="chap-num">${concluidos}</div><div class="chap-label">CONCLUÍDAS</div></div>
<div class="chap-card"><div class="chap-num">${andamento}</div><div class="chap-label">EM ANDAMENTO</div></div>
<div class="chap-card"><div class="chap-num">${pendentes}</div><div class="chap-label">PENDENTES</div></div>
</div>`
}

/*=========================================================
025 QUEIMADAS FUNCTION RENDEREXECUCAOORCAMENTARIA
=========================================================*/
async function renderExecucaoOrcamentaria(){
let box=document.getElementById('painelOrcamento')
if(!box)return
box.innerHTML=`
<div class="impacto-box">
<div class="impacto-score">EM IMPLANTAÇÃO</div>
<div class="impacto-label">EXECUÇÃO ORÇAMENTÁRIA</div>
</div>`
}

/*=========================================================
026 QUEIMADAS FUNCTION RENDERFOCOSCALOR
=========================================================*/
async function renderFocosCalor(){
let box=document.getElementById('painelFocosCalor')
if(!box)return
let {data,error}=await client.from('queimadas_fontes_calor').select('*')
if(error){
console.log(error)
return
}
let html='<div class="heatmap-grid">'
data.forEach(i=>{
html+=`
<div class="heat-vermelho">
🔥 ${i.municipio||'-'}<br>
${i.fonte_calor||'-'}
</div>`
})
html+='</div>'
box.innerHTML=html
}

/*=========================================================
027 QUEIMADAS FUNCTION RENDERCEPCIF
=========================================================*/
function renderCEPCIF(){
let box=document.getElementById('painelCEPCIF')
if(!box)return
box.innerHTML=`
<div class="card-executivo">
<b>CEPCIF</b><br>
Comitê Estadual de Prevenção e Combate aos Incêndios Florestais.<br>
Monitoramento integrado das ações de prevenção, fiscalização, mitigação e resposta.
</div>`
}

/*=========================================================
028 QUEIMADAS FUNCTION RENDEROVRPOTIF
=========================================================*/
function renderOVRPOTIF(){
let box=document.getElementById('painelOVRPOTIF')
if(!box)return
box.innerHTML=`
<div class="card-executivo">
<b>OVR 2026</b><br>
Operação Verde Rondônia.<br><br>
<b>POTIF 2026</b><br>
Plano Operacional de Temporada de Incêndios Florestais.
</div>`
}

/*=========================================================
029 QUEIMADAS FUNCTION RENDEREVIDENCIAS
=========================================================*/
async function renderEvidencias(){
let box=document.getElementById('painelEvidencias')
if(!box)return
let {data,error}=await client.from('queimadas_evidencias').select('*').order('created_at',{ascending:false})
if(error){
console.log(error)
return
}
let html=''
data.forEach(i=>{
html+=`
<div class="monitor4d-card">
<b>${i.municipio||'-'}</b><br>
${i.descricao||'-'}<br>
Status: ${i.status||'-'}
</div>`
})
box.innerHTML=html
}

/*=========================================================
045 QUEIMADAS FUNCTION RENDERAUDITORIA
=========================================================*/
async function renderAuditoriaConcomitante(){

let box=document.getElementById('painelAuditoria')
if(!box)return

let {data:evidencias}=await client
.from('queimadas_evidencias')
.select('*')

let {data:riscos}=await client
.from('queimadas_riscos')
.select('*')

let {data:heat}=await client
.from('queimadas_heatmap')
.select('*')

let semEvidencia=(evidencias||[])
.filter(i=>
!i.evidencia||
String(i.evidencia).trim()===''
).length

let riscosSemTratamento=(riscos||[])
.filter(i=>
!i.tratamento||
String(i.tratamento).trim()===''
).length

let municipiosCriticos=(heat||[])
.filter(i=>
i.classificacao==='CRÍTICO'
).length

let municipiosAlto=(heat||[])
.filter(i=>
i.classificacao==='ALTO'
).length

let topRiscos=(riscos||[])
.sort((a,b)=>
Number(b.nivel_risco||0)-
Number(a.nivel_risco||0)
)
.slice(0,10)

box.innerHTML=`

<div class="chap-grid">

<div class="chap-card">
<div class="chap-num">
${semEvidencia}
</div>
<div class="chap-label">
SEM EVIDÊNCIAS
</div>
</div>

<div class="chap-card">
<div class="chap-num">
${riscosSemTratamento}
</div>
<div class="chap-label">
SEM TRATAMENTO
</div>
</div>

<div class="chap-card">
<div class="chap-num">
${municipiosCriticos}
</div>
<div class="chap-label">
CRÍTICOS
</div>
</div>

<div class="chap-card">
<div class="chap-num">
${municipiosAlto}
</div>
<div class="chap-label">
ALTO RISCO
</div>
</div>

</div>

<div class="card-executivo">

<h2>
TOP 10 RISCOS
</h2>

${topRiscos.map(i=>`

<div style="
display:flex;
justify-content:space-between;
padding:8px;
border-bottom:1px solid #ddd;
">

<span>
${i.risco}
</span>

<b>
${i.nivel_risco}
</b>

</div>

`).join('')}

</div>

<div class="card-executivo">

<h2>
ACHADOS AUTOMÁTICOS
</h2>

<div style="padding:10px">

${semEvidencia>0
?'🚨 Existem evidências pendentes.<br>'
:'✅ Evidências apresentadas.<br>'}

${riscosSemTratamento>0
?'🚨 Existem riscos sem tratamento definido.<br>'
:'✅ Riscos tratados.<br>'}

${municipiosCriticos>0
?'🚨 Existem municípios críticos sob monitoramento.<br>'
:'✅ Nenhum município crítico.<br>'}

</div>

</div>

`

}
/*=========================================================
031 QUEIMADAS FUNCTION GERARPDFEXECUTIVOTCERO
=========================================================*/
async function gerarPDFExecutivoTCERO(){
const {jsPDF}=window.jspdf
let doc=new jsPDF('l','mm','a4')
let largura=doc.internal.pageSize.getWidth()
let pagina=1
doc.setFont('helvetica','bold')
doc.setFontSize(18)
doc.text('MONITORAMENTO INTELIGENTE DE QUEIMADAS 2026',largura/2,15,{align:'center'})
doc.setFontSize(11)
doc.text('Tribunal de Contas do Estado de Rondônia',largura/2,22,{align:'center'})
doc.setDrawColor(0)
doc.line(10,26,287,26)
let y=35
doc.setFontSize(14)
doc.text('DASHBOARD EXECUTIVO',10,y)
y+=8
doc.setFont('helvetica','normal')
doc.setFontSize(10)
doc.text('Plano Unificado TCE-RO + SEDAM + Corpo de Bombeiros',10,y)
y+=10
doc.setFont('helvetica','bold')
doc.text('Objetivos Estratégicos',10,y)
y+=6
doc.setFont('helvetica','normal')
doc.text('- Prevenção',15,y)
y+=5
doc.text('- Fiscalização',15,y)
y+=5
doc.text('- Mitigação',15,y)
y+=5
doc.text('- Resposta Operacional',15,y)
y+=5
doc.text('- Recuperação Ambiental',15,y)
y+=15
doc.setFont('helvetica','bold')
doc.text('Metodologias Aplicadas',10,y)
y+=6
doc.setFont('helvetica','normal')
doc.text('CHAP | Cadeia de Valor | Teoria da Mudança | ODS | HeatMap | Matriz 5x5',15,y)
y+=15
doc.setFontSize(8)
doc.text('Página '+pagina,280,200,{align:'right'})
doc.save('relatorio-executivo-queimadas.pdf')
}
/*=========================================================
032 QUEIMADAS FUNCTION GERARWORDEXECUTIVOTCERO
=========================================================*/
function gerarWordExecutivoTCERO(){
let html=`
<h1>MONITORAMENTO INTELIGENTE DE QUEIMADAS 2026</h1>
<h2>Tribunal de Contas do Estado de Rondônia</h2>
<h3>Plano Unificado TCE-RO</h3>
<p>Este relatório consolida as ações do Plano Unificado de Enfrentamento às Queimadas e Incêndios Florestais.</p>
<h3>Eixos Estratégicos</h3>
<ul>
<li>Prevenção</li>
<li>Fiscalização</li>
<li>Mitigação</li>
<li>Resposta Operacional</li>
<li>Recuperação Ambiental</li>
</ul>
<h3>Metodologias</h3>
<ul>
<li>CHAP</li>
<li>Cadeia de Valor</li>
<li>Teoria da Mudança</li>
<li>Matriz de Risco 5x5</li>
<li>ODS</li>
<li>HeatMap</li>
<li>Monitoramento 4D</li>
</ul>
`
baixarWordQueimadas('relatorio_executivo_tcero',html)
}
/*=========================================================
036 QUEIMADAS FUNCTION RENDERMAPAMUNICIPIOS
=========================================================*/
async function renderMapaMunicipios(){

let div=document.getElementById('mapaRO')
if(!div)return

if(window.mapaQueimadasRO){
window.mapaQueimadasRO.remove()
}

let mapa=L.map('mapaRO').setView([-10.9,-63.3],7)
window.mapaQueimadasRO=mapa
window.camadasControle=
L.control.layers(
{},
{},
{
collapsed:false
}
).addTo(mapa)
L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
attribution:'OpenStreetMap'
}
).addTo(mapa)

let {data,error}=await client
.from('queimadas_heatmap')
.select('*')

if(error){
console.log(error)
return
}
const coordenadas=MUNICIPIOS_RO
;(data||[]).forEach(m=>{

let coord=coordenadas[m.municipio]

if(!coord)return

let cor='green'

if(m.classificacao==='MODERADO'){
cor='yellow'
}

if(m.classificacao==='ALTO'){
cor='orange'
}

if(m.classificacao==='CRÍTICO'){
cor='red'
}

L.circleMarker(coord,{
radius:12,
fillColor:cor,
color:'#000',
weight:1,
opacity:1,
fillOpacity:0.8
})
.addTo(mapa)
.bindPopup(`
<b>${m.municipio}</b><br>
Criticidade: ${m.criticidade}<br>
Focos: ${m.focos}<br>
Classificação: ${m.classificacao}
`)

})

}
/*=========================================================
037 QUEIMADAS FUNCTION RENDERACOESSEDAM
=========================================================*/
async function renderAcoesSedam(){
let box=document.getElementById('painelAcoesSedam')
if(!box)return
let {data,error}=await client.from('queimadas_monitoramento').select('*').eq('origem','SEDAM')
if(error){
console.log(error)
return
}
box.innerHTML=`<div class="impacto-box"><div class="impacto-score">${data.length}</div><div class="impacto-label">AÇÕES MONITORADAS</div></div>`
}
/*=========================================================
038 QUEIMADAS FUNCTION RENDERACOESCBM
=========================================================*/
async function renderAcoesCBM(){
let box=document.getElementById('painelAcoesCBM')
if(!box)return
let {data,error}=await client.from('queimadas_monitoramento').select('*').eq('origem','CBMRO')
if(error){
console.log(error)
return
}
box.innerHTML=`<div class="impacto-box"><div class="impacto-score">${data.length}</div><div class="impacto-label">AÇÕES MONITORADAS</div></div>`
}
/*=========================================================
039 QUEIMADAS FUNCTION RENDERACOESTCERO
=========================================================*/
async function renderAcoesTCERO(){
let box=document.getElementById('painelAcoesTCERO')
if(!box)return
let {data,error}=await client.from('queimadas_monitoramento').select('*').eq('origem','TCERO')
if(error){
console.log(error)
return
}
box.innerHTML=`<div class="impacto-box"><div class="impacto-score">${data.length}</div><div class="impacto-label">AÇÕES MONITORADAS</div></div>`
}
/*=========================================================
040 QUEIMADAS FUNCTION RENDERSTATUSGERAL
=========================================================*/
async function renderStatusGeral(){
let box=document.getElementById('painelStatusGeral')
if(!box)return
let {data,error}=await client.from('queimadas_monitoramento').select('*')
if(error){
console.log(error)
return
}
let verde=0
let amarelo=0
let vermelho=0
data.forEach(i=>{
let p=Number(i.percentual||0)
if(p>=80)verde++
else if(p>=50)amarelo++
else vermelho++
})
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${verde}</div>
<div class="chap-label">🟢 EXECUTADO</div>
</div>
<div class="chap-card">
<div class="chap-num">${amarelo}</div>
<div class="chap-label">🟡 ANDAMENTO</div>
</div>
<div class="chap-card">
<div class="chap-num">${vermelho}</div>
<div class="chap-label">🔴 CRÍTICO</div>
</div>
</div>`
}
/*=========================================================
041 QUEIMADAS FUNCTION RENDERGRAFICOFOCOSCALOR
=========================================================*/
async function renderGraficoFocosCalor(){
let canvas=document.getElementById('graficoFocosCalor')
if(!canvas)return
let {data,error}=await client.from('queimadas_municipios').select('*')
if(error){
console.log(error)
return
}
let labels=[]
let valores=[]
data.forEach(i=>{
labels.push(i.municipio||'-')
valores.push(Number(i.focos_calor||0))
})
new Chart(canvas,{
type:'bar',
data:{
labels:labels,
datasets:[{
label:'Focos de Calor',
data:valores
}]
},
options:{
responsive:true,
maintainAspectRatio:false
}
})
}

/*=========================================================
042 QUEIMADAS FUNCTION RENDERGRAFICOEVOLUCAOMENSAL
=========================================================*/
async function renderGraficoEvolucaoMensal(){
let canvas=document.getElementById('graficoEvolucaoMensal')
if(!canvas)return
let {data,error}=await client.from('queimadas_monitoramento').select('*')
if(error){
console.log(error)
return
}
let meses=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
let valores=new Array(12).fill(0)
data.forEach(i=>{
valores[0]+=Number(i.jan||0)
valores[1]+=Number(i.fev||0)
valores[2]+=Number(i.mar||0)
valores[3]+=Number(i.abr||0)
valores[4]+=Number(i.mai||0)
valores[5]+=Number(i.jun||0)
valores[6]+=Number(i.jul||0)
valores[7]+=Number(i.ago||0)
valores[8]+=Number(i.set||0)
valores[9]+=Number(i.out||0)
valores[10]+=Number(i.nov||0)
valores[11]+=Number(i.dez||0)
})
new Chart(canvas,{
type:'line',
data:{
labels:meses,
datasets:[{
label:'Execução',
data:valores
}]
},
options:{
responsive:true,
maintainAspectRatio:false
}
})
}

/*=========================================================
043 QUEIMADAS FUNCTION RENDERDASHBOARDPRESIDENTE
=========================================================*/
async function renderDashboardPresidente(){

let box=document.getElementById('painelPresidente')
if(!box)return

let {data:heat}=await client
.from('queimadas_heatmap')
.select('*')

let {data:municipios}=await client
.from('queimadas_municipios')
.select('*')

let {data:impacto}=await client
.from('queimadas_impacto')
.select('*')

let criticos=(heat||[])
.filter(i=>i.classificacao==='CRÍTICO')
.length

let altos=(heat||[])
.filter(i=>i.classificacao==='ALTO')
.length

let focos=(heat||[])
.reduce((s,i)=>s+Number(i.focos||0),0)

let populacaoExposta=0
let areaRisco=0

;(heat||[]).forEach(h=>{

let m=(municipios||[])
.find(x=>x.municipio===h.municipio)

if(!m)return

if(
h.classificacao==='CRÍTICO'||
h.classificacao==='ALTO'
){

populacaoExposta+=Number(m.populacao||0)
areaRisco+=Number(m.area_km2||0)

}

})

let municipiosComPlano=22
let municipiosSemPlano=17

let top10=(heat||[])
.sort((a,b)=>b.criticidade-a.criticidade)
.slice(0,10)

let iriq=0

if((heat||[]).length){

iriq=
Math.round(

(heat||[])
.reduce(
(s,i)=>s+Number(i.criticidade||0),
0
)
/(heat||[]).length

)

}

let semaforo='🟢 BAIXO'

if(iriq>=80){
semaforo='🔴 CRÍTICO'
}else
if(iriq>=50){
semaforo='🟡 ATENÇÃO'
}

box.innerHTML=`

<div class="chap-grid">

<div class="chap-card">
<div class="chap-num">${iriq}</div>
<div class="chap-label">
IRIQ ESTADUAL
</div>
</div>

<div class="chap-card">
<div class="chap-num">
${criticos}
</div>
<div class="chap-label">
CRÍTICOS
</div>
</div>

<div class="chap-card">
<div class="chap-num">
${altos}
</div>
<div class="chap-label">
ALTO RISCO
</div>
</div>

<div class="chap-card">
<div class="chap-num">
${focos}
</div>
<div class="chap-label">
FOCOS DE CALOR
</div>
</div>

<div class="chap-card">
<div class="chap-num">
${Math.round(populacaoExposta).toLocaleString('pt-BR')}
</div>
<div class="chap-label">
POPULAÇÃO EXPOSTA
</div>
</div>

<div class="chap-card">
<div class="chap-num">
${Math.round(areaRisco).toLocaleString('pt-BR')}
</div>
<div class="chap-label">
KM² SOB RISCO
</div>
</div>

<div class="chap-card">
<div class="chap-num">
${municipiosComPlano}
</div>
<div class="chap-label">
COM PLANO
</div>
</div>

<div class="chap-card">
<div class="chap-num">
${municipiosSemPlano}
</div>
<div class="chap-label">
SEM PLANO
</div>
</div>

</div>

<div class="card-executivo">

<h2>
SEMAFORIZAÇÃO ESTADUAL
</h2>

<div style="
font-size:28px;
font-weight:700;
text-align:center;
padding:20px;
">
${semaforo}
</div>

</div>

<div class="card-executivo">

<h2>
TOP 10 MUNICÍPIOS CRÍTICOS
</h2>

${top10.map(i=>`

<div style="
display:flex;
justify-content:space-between;
padding:8px;
border-bottom:1px solid #ddd;
">

<span>
${i.municipio}
</span>

<b>
${i.criticidade}
</b>

</div>

`).join('')}

</div>

`

}

/*=========================================================
044 QUEIMADAS FUNCTION RENDERDASHBOARDCONSELHEIRO
=========================================================*/
async function renderDashboardConselheiro(){

let box=document.getElementById('painelConselheiro')
if(!box)return

let {data:heat}=await client
.from('queimadas_heatmap')
.select('*')

let {data:riscos}=await client
.from('queimadas_riscos')
.select('*')

let {data:sedam}=await client
.from('queimadas_acoes_sedam')
.select('*')

let {data:cbm}=await client
.from('queimadas_acoes_cbm')
.select('*')

let criticos=(heat||[])
.filter(i=>i.classificacao==='CRÍTICO')
.length

let altos=(heat||[])
.filter(i=>i.classificacao==='ALTO')
.length

let riscosAltos=(riscos||[])
.filter(i=>Number(i.nivel_risco||0)>=20)
.length

let sedamPendentes=(sedam||[])
.filter(i=>
String(i.status||'')
.toUpperCase()!=='CONCLUÍDO'
).length

let cbmPendentes=(cbm||[])
.filter(i=>
String(i.status||'')
.toUpperCase()!=='CONCLUÍDO'
).length

let top10=(heat||[])
.sort((a,b)=>b.criticidade-a.criticidade)
.slice(0,10)

box.innerHTML=`

<div class="chap-grid">

<div class="chap-card">
<div class="chap-num">${criticos}</div>
<div class="chap-label">
MUNICÍPIOS CRÍTICOS
</div>
</div>

<div class="chap-card">
<div class="chap-num">${altos}</div>
<div class="chap-label">
ALTO RISCO
</div>
</div>

<div class="chap-card">
<div class="chap-num">${riscosAltos}</div>
<div class="chap-label">
RISCOS ELEVADOS
</div>
</div>

<div class="chap-card">
<div class="chap-num">${sedamPendentes}</div>
<div class="chap-label">
PENDÊNCIAS SEDAM
</div>
</div>

<div class="chap-card">
<div class="chap-num">${cbmPendentes}</div>
<div class="chap-label">
PENDÊNCIAS CBMRO
</div>
</div>

</div>

<div class="card-executivo">

<h2>
TOP 10 MUNICÍPIOS CRÍTICOS
</h2>

${top10.map(i=>`

<div style="
display:flex;
justify-content:space-between;
padding:8px;
border-bottom:1px solid #ddd;
">

<span>
${i.municipio}
</span>

<b>
${i.criticidade}
</b>

</div>

`).join('')}

</div>

`

}

/*=========================================================
056 SALA DE SITUACAO
=========================================================*/
async function renderSalaSituacao(){
let box=document.getElementById('painelSalaSituacao')
if(!box)return
let {data,error}=await client
.from('queimadas_sala_situacao')
.select('*')
.order('criticidade',{ascending:false})
if(error)return
box.innerHTML=(data||[]).map(i=>`
<div class="chap-card">
<div class="chap-num">${i.criticidade}</div>
<div class="chap-label">${i.municipio}</div>
<div style="font-size:11px;font-weight:700">${i.classificacao}</div>
</div>
`).join('')
}

/*=========================================================
046 QUEIMADAS FUNCTION IAPREVERRISCOS
=========================================================*/
async function iaPreverRiscos(){
let box=document.getElementById('painelIARiscos')
if(!box)return
box.innerHTML=`
<div class="monitor4d-card">
IA identificou tendência de aumento de risco em municípios com crescimento de focos de calor e baixa execução das ações preventivas.
</div>`
}
/*=========================================================
047 QUEIMADAS FUNCTION IAPRIORIZARMUNICIPIOS
=========================================================*/
async function iaPriorizarMunicipios(){
let box=document.getElementById('painelIAPriorizacao')
if(!box)return
box.innerHTML=`
<div class="monitor4d-card">
1º Município Crítico<br>
2º Município Crítico<br>
3º Município Crítico
</div>`
}
/*=========================================================
048 QUEIMADAS FUNCTION IAGERARRELATORIO
=========================================================*/
async function iaGerarRelatorio(){
let box=document.getElementById('painelIARelatorio')
if(!box)return
box.innerHTML=`
<div class="monitor4d-card">
Relatório automático gerado com base no Plano SEDAM, Plano Operacional do Corpo de Bombeiros e Plano Unificado TCE-RO.
</div>`
}
/*=========================================================
049 QUEIMADAS FUNCTION IASUGERIRACOES
=========================================================*/
async function iaSugerirAcoes(){
let box=document.getElementById('painelIASugestoes')
if(!box)return
box.innerHTML=`
<div class="monitor4d-card">
✓ Reforçar brigadistas<br>
✓ Intensificar fiscalização<br>
✓ Priorizar municípios críticos<br>
✓ Monitorar fontes de calor
</div>`
}
/*=========================================================
050 QUEIMADAS FUNCTION PDFCOMPLETO
=========================================================*/
async function pdfCompletoQueimadas(){
await gerarPDFExecutivoTCERO()
}
/*=========================================================
021 QUEIMADAS FUNCTION CARREGARKPISEXECUTIVOS
=========================================================*/
async function carregarKPIsExecutivos(){
let {data,error}=await client
.from('queimadas_municipios')
.select('*')
if(error){
console.log(error)
return
}
let municipios=data?.length||0
let focos=(data||[]).reduce((s,i)=>s+Number(i.focos_calor||0),0)
let riscos=(data||[]).filter(i=>
String(i.risco||'').toUpperCase().includes('ALTO')
).length
let {data:mon}=await client
.from('queimadas_monitoramento')
.select('percentual')
let execucao=0
if(mon?.length){
execucao=Math.round(
mon.reduce((s,i)=>s+Number(i.percentual||0),0)/mon.length
)
}
document.getElementById('kpiMunicipios').innerText=municipios
document.getElementById('kpiFocos').innerText=focos
document.getElementById('kpiRiscos').innerText=riscos
document.getElementById('kpiExecucao').innerText=execucao+'%'
}
/*=========================================================
022 QUEIMADAS FUNCTION RENDERMUNICIPIOSPRIORITARIOS
=========================================================*/
async function renderMunicipiosPrioritarios(){
let box=document.getElementById('painelMunicipiosPrioritarios')
if(!box)return
let {data,error}=await client
.from('queimadas_municipios')
.select('*')
.order('focos_calor',{ascending:false})
.limit(10)
if(error){
console.log(error)
return
}
box.innerHTML=(data||[]).map(i=>`
<div class="linha-queimadas">
<b>${i.municipio}</b> |
Focos: ${i.focos_calor||0} |
Risco: ${i.risco||'-'} |
Prioridade: ${i.prioridade||'-'}
</div>
`).join('')
}
/*=========================================================
023 QUEIMADAS FUNCTION RENDERSTATUSGERAL
=========================================================*/
async function renderStatusGeral(){

let box=document.getElementById('painelStatusGeral')
if(!box)return

let {data}=await client
.from('queimadas_monitoramento')
.select('*')

let executado=0
let andamento=0
let critico=0

data.forEach(i=>{

if(Number(i.percentual||0)>=80){
executado++
}else
if(Number(i.percentual||0)>=20){
andamento++
}else{
critico++
}

})

box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${executado}</div>
<div class="chap-label">EXECUTADO</div>
</div>
<div class="chap-card">
<div class="chap-num">${andamento}</div>
<div class="chap-label">EM ANDAMENTO</div>
</div>
<div class="chap-card">
<div class="chap-num">${critico}</div>
<div class="chap-label">CRÍTICO</div>
</div>
</div>
`

}
/*=========================================================
024 QUEIMADAS FUNCTION RENDERDASHBOARDCHAP
=========================================================*/
async function renderDashboardCHAP(){
let box=document.getElementById('painelCHAP')
if(!box)return
let {data,error}=await client
.from('queimadas_chap')
.select('*')
if(error){
console.log(error)
return
}
box.innerHTML=(data||[]).map(i=>{
let score=Math.round(
(
Number(i.criticidade||0)+
Number(i.historico||0)+
Number(i.abrangencia||0)+
Number(i.prioridade||0)+
Number(i.resultado||0)
)/5
)
return `
<div class="chap-card">
<div class="chap-num">${score}</div>
<div class="chap-label">${i.municipio}</div>
</div>`
}).join('')
}
/*=========================================================
025 QUEIMADAS FUNCTION RENDERMATRIZRISCO5X5
=========================================================*/
async function renderMatrizRisco5x5(){
let box=document.getElementById('painelRiscoAvancado')
if(!box)return
let {data,error}=await client
.from('queimadas_riscos')
.select('*')
.order('nivel_risco',{ascending:false})
if(error){
console.log(error)
return
}
box.innerHTML=(data||[]).map(i=>`
<div class="linha-risco">
<b>${i.risco}</b>
| Município: ${i.municipio||'-'}
| Prob.: ${i.probabilidade||0}
| Impacto: ${i.impacto||0}
| Nível: ${i.nivel_risco||0}
</div>
`).join('')
}



/*=========================================================
998 QUEIMADAS FUNCTION MOSTRAR ABA
=========================================================*/
function mostrarAbaQueimadas(nome){
document.querySelectorAll('.abaQueimadas')
.forEach(x=>x.classList.add('hidden'))
if(nome==='executivo'){
document.getElementById('abaExecutivo')
?.classList.remove('hidden')
}
if(nome==='planejamento'){
document.getElementById('abaPlanejamento')
?.classList.remove('hidden')
}
if(nome==='monitoramento'){
document.getElementById('abaMonitoramento')
?.classList.remove('hidden')
}
if(nome==='analise'){
document.getElementById('abaAnalise')
?.classList.remove('hidden')
}
if(nome==='relatorios'){
document.getElementById('abaRelatorios')
?.classList.remove('hidden')
}
if(nome==='situacao'){
document.getElementById('abaSituacao')
?.classList.remove('hidden')
}
}
/*=========================================================
028 QUEIMADAS FUNCTION RENDERTOPCRITICOS
=========================================================*/
async function renderTopCriticos(){
let box=document.getElementById('painelTopCriticos')
if(!box)return
let {data,error}=await client
.from('queimadas_municipios')
.select('*')
.order('focos_calor',{ascending:false})
.limit(10)
if(error){
console.log(error)
return
}
box.innerHTML=(data||[]).map(i=>`
<div class="linha-queimadas">
🔥 <b>${i.municipio||'-'}</b>
 | Focos: ${i.focos_calor||0}
 | Risco: ${i.risco||'-'}
</div>
`).join('')
}
/*=========================================================
040 QUEIMADAS FUNCTION RENDERTOPRISCOS
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
047 QUEIMADAS FUNCTION RENDERTOPIACHAP
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
042 QUEIMADAS FUNCTION RENDERALERTAS
=========================================================*/
async function renderAlertas(){
let box=document.getElementById('painelAlertas')
if(!box)return
let {data}=await client
.from('queimadas_municipios')
.select('*')
.order('focos_calor',{ascending:false})
.limit(5)
box.innerHTML=(data||[]).map(i=>`
<div class="alerta-vermelho">
🚨 ${i.municipio} possui ${i.focos_calor||0} focos de calor.
</div>
`).join('')
}


/*=========================================================
036 QUEIMADAS FUNCTION RENDERTOPMUNICIPIOS
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
034 QUEIMADAS FUNCTION CALCULARIMC
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
044 QUEIMADAS FUNCTION RENDERMUNICIPIOSSEMEVIDENCIAS
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
046 QUEIMADAS FUNCTION RENDERPRESIDENTE
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
048 QUEIMADAS FUNCTION RENDERRANKINGIMC
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
057 CALCULAR POPULAÇÃO EXPOSTA
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
057 CALCULAR ÁREA SOB RISCO
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
057 CALCULAR IRIQ
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

return iriq.toFixed(1)

}
/*=========================================================
058 QUEIMADAS FUNCTION RENDERPLANOSMUNICIPAIS
=========================================================*/
async function renderPlanosMunicipais(){

let box=document.getElementById('painelPlanosMunicipais')
if(!box)return

let comPlano=[
'Ariquemes',
'Cacoal',
'Candeias do Jamari',
'Castanheiras',
'Colorado do Oeste',
'Corumbiara',
'Cujubim',
'Governador Jorge Teixeira',
'Guajará-Mirim',
'Ji-Paraná',
'Machadinho D\'Oeste',
'Nova Mamoré',
'Nova União',
'Novo Horizonte do Oeste',
'Ouro Preto do Oeste',
'Presidente Médici',
'Rolim de Moura',
'Seringueiras',
'Teixeirópolis',
'Theobroma',
'Vale do Anari',
'Vilhena'
]

let semPlano=[
'Alto Paraíso',
'Alvorada D\'Oeste',
'Buritis',
'Cabixi',
'Chupinguaia',
'Costa Marques',
'Itapuã do Oeste',
'Ministro Andreazza',
'Mirante da Serra',
'Monte Negro',
'Nova Brasilândia D\'Oeste',
'Parecis',
'Pimenteiras do Oeste',
'São Felipe do Oeste',
'São Francisco do Guaporé',
'São Miguel do Guaporé',
'Vale do Paraíso'
]

box.innerHTML=`

<div class="chap-grid">

<div class="chap-card">
<div class="chap-num">${comPlano.length}</div>
<div class="chap-label">COM PLANO</div>
</div>

<div class="chap-card">
<div class="chap-num">${semPlano.length}</div>
<div class="chap-label">SEM EVIDÊNCIA</div>
</div>

</div>

<div style="margin-top:15px">

<h3 style="color:#15803d">
✅ MUNICÍPIOS COM PLANO
</h3>

${comPlano.join(' • ')}

<hr style="margin:15px 0">

<h3 style="color:#dc2626">
🚨 MUNICÍPIOS SEM EVIDÊNCIA DE PLANO
</h3>

${semPlano.join(' • ')}

</div>

`

}
/*=========================================================
071 QUEIMADAS FUNCTION RENDERGEOJSONRO
=========================================================*/
async function renderGeoJSONRO(){

if(!window.mapaQueimadasRO)return

let resp=await fetch('assets/geojson/municipios-ro.geojson')

let geojson=await resp.json()

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
072 QUEIMADAS FUNCTION RENDERUCS
=========================================================*/
async function renderUCs(){

if(!window.mapaQueimadasRO)return

try{

let resp=await fetch(
'assets/geojson/ucs-ro.geojson'
)

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
072 QUEIMADAS FUNCTION RENDERPAINELUCS
=========================================================*/
async function renderPainelUCs(){

let box=document.getElementById('painelUCs')
if(!box)return

box.innerHTML=`
<div class="chap-grid">

<div class="chap-card">
<div class="chap-num">
27
</div>
<div class="chap-label">
UC ESTADUAIS
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
RESPONSÁVEL
</div>
</div>

</div>
`
}
/*=========================================================
073 QUEIMADAS FUNCTION RENDERPAINELFOCOSINPE
=========================================================*/
async function renderPainelFocosINPE(){

let box=document.getElementById('painelFocosINPE')
if(!box)return

let {data}=await client
.from('queimadas_focos')
.select('*')

let total=(data||[])
.reduce((s,i)=>s+Number(i.focos||0),0)

let top10=[...(data||[])]
.sort((a,b)=>Number(b.focos||0)-Number(a.focos||0))
.slice(0,10)

box.innerHTML=`

<div class="chap-grid">

<div class="chap-card">
<div class="chap-num">
${total}
</div>
<div class="chap-label">
FOCOS DE CALOR
</div>
</div>

<div class="chap-card">
<div class="chap-num">
${top10.length}
</div>
<div class="chap-label">
MUNICÍPIOS MONITORADOS
</div>
</div>

</div>

<div class="card-executivo">

<h2>
TOP FOCOS DE CALOR
</h2>

${top10.map(i=>`

<div style="
display:flex;
justify-content:space-between;
padding:6px;
border-bottom:1px solid #ddd;
">

<span>${i.municipio}</span>

<b>${i.focos}</b>

</div>

`).join('')}

</div>

`

}
/*=========================================================
074 QUEIMADAS FUNCTION RENDERGRAFICOFOCOSHISTORICO
=========================================================*/
async function renderGraficoFocosHistorico(){

let canvas=document.getElementById('graficoFocosHistorico')
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
labels,
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
075 QUEIMADAS FUNCTION RENDERINDICADORESESTRATEGICOS
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

let mediaCriticidade=0

if((heat||[]).length){

mediaCriticidade=
Math.round(

(heat||[])
.reduce(
(s,i)=>s+Number(i.criticidade||0),
0
)
/(heat||[]).length

)

}

let municipiosCriticos=(heat||[])
.filter(i=>i.classificacao==='CRÍTICO')
.length

let municipiosAlto=(heat||[])
.filter(i=>i.classificacao==='ALTO')
.length

box.innerHTML=`

<div class="chap-grid">

<div class="chap-card">
<div class="chap-num">${totalFocos}</div>
<div class="chap-label">FOCOS ACUMULADOS</div>
</div>

<div class="chap-card">
<div class="chap-num">${mediaCriticidade}</div>
<div class="chap-label">IRIQ MÉDIO</div>
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

`

}
/*=========================================================
076 QUEIMADAS FUNCTION RENDERSALASITUACAOESTADUAL
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

let focosTotal=(focos||[])
.reduce(
(s,i)=>s+Number(i.focos||0),
0
)

let top10=[...(heat||[])]
.sort((a,b)=>b.criticidade-a.criticidade)
.slice(0,10)

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

</div>

<div class="card-executivo">

<h2>
TOP 10 MUNICÍPIOS
</h2>

${top10.map(i=>`

<div style="
display:flex;
justify-content:space-between;
padding:6px;
border-bottom:1px solid #ddd;
">

<span>
${i.municipio}
</span>

<b>
${i.criticidade}
</b>

</div>

`).join('')}

</div>

<div class="card-executivo">

<h2>
ALERTAS AUTOMÁTICOS
</h2>

<div style="padding:10px">

${criticos>0
?'🚨 Existem municípios críticos.<br>'
:'✅ Sem municípios críticos.<br>'}

${focosTotal>500
?'🔥 Quantidade elevada de focos detectados.<br>'
:'✅ Focos sob controle.<br>'}

${altos>5
?'⚠ Diversos municípios em alto risco.<br>'
:'✅ Risco controlado.<br>'}

</div>

</div>

`

}

/*=========================================================
999 QUEIMADAS INIT
=========================================================*/
document.addEventListener('DOMContentLoaded',async()=>{
mostrarAbaQueimadas('executivo')
if(typeof carregarKPIsExecutivos==='function')await carregarKPIsExecutivos()
if(typeof renderPlanoUnificado==='function')await renderPlanoUnificado()
if(typeof renderMunicipiosPrioritarios==='function')await renderMunicipiosPrioritarios()
if(typeof renderHeatMapExecutivo==='function')await renderHeatMapExecutivo()
if(typeof renderMonitoramento4D==='function')await renderMonitoramento4D()
if(typeof renderDashboardCHAP==='function')await renderDashboardCHAP()
if(typeof renderCadeiaValor==='function')await renderCadeiaValor()
if(typeof renderTeoriaMudanca==='function')await renderTeoriaMudanca()
if(typeof renderMatrizRisco5x5==='function')await renderMatrizRisco5x5()
if(typeof renderGantt==='function')await renderGantt()
if(typeof renderODS==='function')await renderODS()
if(typeof calcularImpacto==='function')await calcularImpacto()
if(typeof iaChapAnalisar==='function')await iaChapAnalisar()
if(typeof renderTopCriticos==='function')await renderTopCriticos()
if(typeof renderTopRiscos==='function')await renderTopRiscos()
if(typeof renderTopIAChap==='function')await renderTopIAChap()
if(typeof renderAlertas==='function')await renderAlertas()
await renderStatusGeral()
await calcularIMC()
if(typeof renderRankingIMC==='function')
await renderRankingIMC()
await renderTopRiscos()
if(typeof renderSalaSituacao==='function')
await renderSalaSituacao()
if(typeof renderDashboardPresidente==='function')
await renderDashboardPresidente()
if(typeof renderPlanosMunicipais==='function')
await renderPlanosMunicipais()
await renderMapaMunicipios()
await renderFocosCalor()
await renderGraficoFocosCalor()
await renderGraficoEvolucaoMensal()
await renderGovernanca()
await renderAcoesSedam()
await renderAcoesCBM()
await renderAcoesTCERO()
await renderExecucaoOrcamentaria()
await renderCEPCIF()
await renderOVRPOTIF()
await renderEvidencias()
if(typeof renderAuditoriaConcomitante==='function')
await renderAuditoriaConcomitante()
if(typeof renderDashboardConselheiro==='function')
await renderDashboardConselheiro()
if(typeof renderGeoJSONRO==='function')
await renderGeoJSONRO()
if(typeof renderUCs==='function')
await renderUCs()
if(typeof renderPainelUCs==='function')
await renderPainelUCs()
if(typeof renderFocosINPE==='function')
await renderFocosINPE()

if(typeof renderPainelFocosINPE==='function')
await renderPainelFocosINPE()
if(typeof renderGraficoFocosHistorico==='function')
await renderGraficoFocosHistorico()
if(typeof renderIndicadoresEstrategicos==='function')
await renderIndicadoresEstrategicos()
if(typeof renderSalaSituacaoEstadual==='function')
await renderSalaSituacaoEstadual()
})
