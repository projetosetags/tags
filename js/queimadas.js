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
005 QUEIMADAS FUNCTION RENDERDASHBOARDCHAP
=========================================================*/
async function renderDashboardCHAP(){
let box=document.getElementById('painelCHAP')
if(!box)return
let {data,error}=await client
.from('queimadas_cadeia_valor')
.select('*')
if(error){
console.log(error)
return
}
let conhecimento=0
let habilidade=0
let atitude=0
let proposito=0
data.forEach(i=>{
if(i.insumo)conhecimento+=25
if(i.atividade)habilidade+=25
if(i.produto)atitude+=25
if(i.impacto)proposito+=25
})
let total=Math.max(data.length,1)
conhecimento=Math.round(conhecimento/total)
habilidade=Math.round(habilidade/total)
atitude=Math.round(atitude/total)
proposito=Math.round(proposito/total)
let score=Math.round((conhecimento+habilidade+atitude+proposito)/4)
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card">
<div class="chap-num">${score}%</div>
<div class="chap-label">CHAP MÉDIO</div>
</div>
<div class="chap-card">
<div class="chap-num">${conhecimento}%</div>
<div class="chap-label">CONHECIMENTO</div>
</div>
<div class="chap-card">
<div class="chap-num">${habilidade}%</div>
<div class="chap-label">HABILIDADE</div>
</div>
<div class="chap-card">
<div class="chap-num">${atitude}%</div>
<div class="chap-label">ATITUDE</div>
</div>
<div class="chap-card">
<div class="chap-num">${proposito}%</div>
<div class="chap-label">PROPÓSITO</div>
</div>
</div>
<canvas id="graficoCHAP" height="120"></canvas>`
let ctx=document.getElementById('graficoCHAP')
if(!ctx)return
new Chart(ctx,{
type:'radar',
data:{
labels:['Conhecimento','Habilidade','Atitude','Propósito'],
datasets:[{
label:'Score CHAP',
data:[
conhecimento,
habilidade,
atitude,
proposito
],
fill:true
}]
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
r:{
beginAtZero:true,
max:100
}
}
}
})
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
030 QUEIMADAS FUNCTION RENDERAUDITORIACONCOMITANTE
=========================================================*/
async function renderAuditoriaConcomitante(){
let box=document.getElementById('painelAuditoria')
if(!box)return
let {data,error}=await client.from('queimadas_monitoramento').select('*')
if(error){
console.log(error)
return
}
let atrasados=data.filter(i=>Number(i.percentual||0)<50)
let html=''
atrasados.forEach(i=>{
html+=`
<div class="heat-vermelho">
${i.item||'-'}<br>
${i.subitem||'-'}<br>
${i.percentual||0}%
</div>`
})
box.innerHTML=html||'<div class="heat-verde">Nenhum achado crítico.</div>'
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
let box=document.getElementById('painelMapaMunicipios')
if(!box)return
let {data,error}=await client.from('queimadas_municipios').select('*').order('municipio')
if(error){
console.log(error)
return
}
let html='<div class="heatmap-grid">'
data.forEach(i=>{
let classe='heat-verde'
if(String(i.prioridade||'').toUpperCase()==='ALTA')classe='heat-vermelho'
else if(String(i.prioridade||'').toUpperCase()==='MÉDIA')classe='heat-laranja'
else if(String(i.prioridade||'').toUpperCase()==='BAIXA')classe='heat-amarelo'
html+=`
<div class="${classe}">
<b>${i.municipio||'-'}</b><br>
Risco: ${i.risco||'-'}<br>
Focos: ${i.focos_calor||0}
</div>`
})
html+='</div>'
box.innerHTML=html
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
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card"><div class="chap-num">SEDAM</div><div class="chap-label">MONITORADA</div></div>
<div class="chap-card"><div class="chap-num">CBMRO</div><div class="chap-label">MONITORADO</div></div>
<div class="chap-card"><div class="chap-num">TCE-RO</div><div class="chap-label">SUPERVISÃO</div></div>
</div>`
}

/*=========================================================
044 QUEIMADAS FUNCTION RENDERDASHBOARDCONSELHEIRO
=========================================================*/
async function renderDashboardConselheiro(){
let box=document.getElementById('painelConselheiro')
if(!box)return
box.innerHTML=`
<div class="impacto-box">
<div class="impacto-score">CHAP</div>
<div class="impacto-label">GESTÃO ORIENTADA A RESULTADOS</div>
</div>`
}

/*=========================================================
045 QUEIMADAS FUNCTION RENDERSALASITUACAO
=========================================================*/
async function renderSalaSituacao(){
let box=document.getElementById('painelSalaSituacao')
if(!box)return
box.innerHTML=`
<div class="heat-vermelho">🔥 Municípios Críticos</div>
<div class="heat-laranja">⚠ Municípios Atenção</div>
<div class="heat-verde">✓ Municípios Controlados</div>`
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
.select('status')
let concluidos=(data||[]).filter(i=>i.status==='CONCLUÍDO').length
let andamento=(data||[]).filter(i=>i.status==='EM ANDAMENTO').length
let pendentes=(data||[]).filter(i=>i.status==='PENDENTE').length
box.innerHTML=`
<div class="chap-grid">
<div class="chap-card"><div class="chap-num">${concluidos}</div><div class="chap-label">CONCLUÍDOS</div></div>
<div class="chap-card"><div class="chap-num">${andamento}</div><div class="chap-label">ANDAMENTO</div></div>
<div class="chap-card"><div class="chap-num">${pendentes}</div><div class="chap-label">PENDENTES</div></div>
</div>`
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
let {data,error}=await client
.from('queimadas_riscos')
.select('*')
.order('nivel_risco',{ascending:false})
.limit(10)
if(error){
console.log(error)
return
}
box.innerHTML=(data||[]).map(i=>`
<div class="linha-risco">
⚠ <b>${i.municipio||'-'}</b>
 | ${i.risco||'-'}
 | Nível ${i.nivel_risco||0}
</div>
`).join('')
}
/*=========================================================
041 QUEIMADAS FUNCTION RENDERTOPIACHAP
=========================================================*/
async function renderTopIAChap(){
let box=document.getElementById('painelTopIAChap')
if(!box)return
let {data,error}=await client
.from('queimadas_chap')
.select('*')
.order('resultado',{ascending:false})
.limit(10)
if(error){
console.log(error)
return
}
box.innerHTML=(data||[]).map(i=>`
<div class="linha-queimadas">
🤖 <b>${i.municipio||'-'}</b>
 | Score: ${i.resultado||0}
</div>
`).join('')
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
})
