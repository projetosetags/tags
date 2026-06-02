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
999 QUEIMADAS INIT
=========================================================*/
document.addEventListener('DOMContentLoaded',async()=>{
console.log('QUEIMADAS INICIADO')
if(typeof carregarKPIsExecutivos==='function')await carregarKPIsExecutivos()
if(typeof renderDashboardCHAP==='function')await renderDashboardCHAP()
if(typeof renderCadeiaValor==='function')await renderCadeiaValor()
if(typeof renderTeoriaMudanca==='function')await renderTeoriaMudanca()
if(typeof renderMatrizRisco5x5==='function')await renderMatrizRisco5x5()
if(typeof renderGantt==='function')await renderGantt()
if(typeof renderODS==='function')await renderODS()
if(typeof calcularImpacto==='function')await calcularImpacto()
if(typeof renderHeatMap==='function')await renderHeatMap()
if(typeof renderMonitoramento4D==='function')await renderMonitoramento4D()
})
