let graficoTempoReal=null
let intervaloTempoReal=null
/*=========================================================
001 TEMPO REAL FUNCTION RENDERTEMPOREAL
=========================================================*/
async function renderTempoReal(){
let box=document.getElementById('painelTempoRealKPIs')
if(!box)return
let hoje=new Date()
let ano=hoje.getFullYear()
let dataInicial=`${ano}-01-01`
let dataFinal=formatarDataTempoReal(hoje)
box.innerHTML='<div class="tempoGrid"><div class="kpiTempo"><div class="kpiTempoNumero">...</div><div class="kpiTempoTitulo">CARREGANDO</div></div></div>'
let resultadoFocos=await buscarFocosTempoReal(dataInicial,dataFinal)
if(resultadoFocos.error){
console.error('Erro ao carregar focos:',resultadoFocos.error)
box.innerHTML='<div class="alerta-vermelho">Erro ao carregar os dados de focos do INPE.</div>'
return
}
let focos=resultadoFocos.data||[]
let resultadoExecutivo=await client.from('vw_queimadas_executivo').select('*').maybeSingle()
let executivo=resultadoExecutivo.data||{}
let resumo=calcularResumoTempoReal(focos,dataFinal)
box.innerHTML=`<div class="tempoGrid"><div class="kpiTempo"><div class="kpiTempoNumero">${resumo.total.toLocaleString('pt-BR')}</div><div class="kpiTempoTitulo">FOCOS EM ${ano}</div></div><div class="kpiTempo"><div class="kpiTempoNumero">${resumo.focosHoje.toLocaleString('pt-BR')}</div><div class="kpiTempoTitulo">FOCOS HOJE</div></div><div class="kpiTempo"><div class="kpiTempoNumero">${resumo.municipios}</div><div class="kpiTempoTitulo">MUNICÍPIOS ATINGIDOS</div></div><div class="kpiTempo"><div class="kpiTempoNumero">${resumo.ultimaData?formatarDataTempoRealBR(resumo.ultimaData):'--'}</div><div class="kpiTempoTitulo">ÚLTIMA DATA INPE</div></div></div>`
renderRankingTempoReal(resumo.ranking,resumo.total)
renderResumoTempoReal(resumo,executivo)
renderAtualizacaoTempoReal(resumo)
await Promise.all([
renderGraficoTempoReal(),
renderRankingIRIQTempoReal()
])
}
/*=========================================================
002 TEMPO REAL — BUSCAR FOCOS DE CALOR
=========================================================*/
async function buscarFocosTempoReal(dataInicial,dataFinal){
let todos=[]
let inicio=0
let limite=1000
while(true){
let{data,error}=await client.schema('queimadas').from('queimadas_focos_inpe').select('*').eq('uf','RO').gte('data_foco',dataInicial).lte('data_foco',dataFinal).order('id',{ascending:true}).range(inicio,inicio+limite-1)
if(error){
console.error('002 Erro ao buscar focos:',error)
return{data:[],error}
}
let pagina=data||[]
todos.push(...pagina)
if(pagina.length<limite)break
inicio+=limite
}
console.log('002 TOTAL FOCOS RO:',todos.length)
return{data:todos,error:null}
}
/*=========================================================
003 TEMPO REAL FUNCTION CALCULARRESUMOTEMPOREAL
=========================================================*/
function calcularResumoTempoReal(focos,dataHoje){
let agrupado={}
let meses=Array(12).fill(0)
let satelites=new Set()
let ultimaData=''
let ultimaImportacao=''
let focosHoje=0
focos.forEach(item=>{
let municipio=String(item.municipio||'NÃO INFORMADO').trim()
agrupado[municipio]=(agrupado[municipio]||0)+1
let dataFoco=String(item.data_foco||'')
if(dataFoco===dataHoje)focosHoje++
if(dataFoco>ultimaData)ultimaData=dataFoco
let dataImportacao=String(item.created_at||'')
if(dataImportacao>ultimaImportacao)ultimaImportacao=dataImportacao
let mes=Number(dataFoco.slice(5,7))
if(mes>=1&&mes<=12)meses[mes-1]++
let satelite=String(item.satelite||'').trim()
if(satelite)satelites.add(satelite)
})
let ranking=Object.entries(agrupado).map(([municipio,focos])=>({municipio,focos:Number(focos||0)})).sort((a,b)=>b.focos-a.focos)
return{
total:focos.length,
focosHoje,
municipios:ranking.length,
ranking,
porMes:meses,
satelites:Array.from(satelites).sort(),
ultimaData,
ultimaImportacao
}
}
/*=========================================================
004 TEMPO REAL FUNCTION RENDERRANKINGTEMPOREAL
=========================================================*/
function renderRankingTempoReal(ranking,total){
let box=document.getElementById('painelTempoRealRanking')
if(!box)return
let top10=ranking.slice(0,10)
if(!top10.length){
box.innerHTML='<div class="cardTempoReal">Nenhum foco encontrado no período.</div>'
return
}
box.innerHTML=top10.map((item,indice)=>{
let percentual=total?item.focos*100/total:0
let icone=indice===0?'🥇':indice===1?'🥈':indice===2?'🥉':'🔥'
return`<div class="cardRankingTR"><div class="cardRankingMunicipio">${icone} ${item.municipio}<small style="display:block;color:#64748b;margin-top:3px">${percentual.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})}% do total</small></div><div class="cardRankingValor">${item.focos.toLocaleString('pt-BR')}</div></div>`
}).join('')
}
/*=========================================================
005 TEMPO REAL FUNCTION RENDERRESUMOTEMPOREAL
=========================================================*/
function renderResumoTempoReal(resumo,executivo){
let municipiosSemFocos=Math.max(0,52-Number(resumo.municipios||0))
let box=document.getElementById('painelTempoRealFocos')
if(box){
box.innerHTML=`<div class="resumoTR"><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🔥</div><span>Focos de Calor em 2026</span></div><div class="resumoValor">${resumo.total.toLocaleString('pt-BR')}</div></div><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">📅</div><span>Focos Hoje</span></div><div class="resumoValor">${resumo.focosHoje.toLocaleString('pt-BR')}</div></div><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🏛</div><span>Municípios com Focos</span></div><div class="resumoValor">${resumo.municipios}</div></div><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🟢</div><span>Municípios sem Focos</span></div><div class="resumoValor">${municipiosSemFocos}</div></div><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🌳</div><span>Área Queimada</span></div><div class="resumoValor">${Number(executivo.area_queimada_estado_ha||0).toLocaleString('pt-BR',{maximumFractionDigits:2})} ha</div></div><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🌲</div><span>Desmatamento</span></div><div class="resumoValor">${Number(executivo.desmatamento_estado_ha||0).toLocaleString('pt-BR',{maximumFractionDigits:2})} ha</div></div></div>`
}
let sat=document.getElementById('painelTempoRealSatelites')
if(!sat)return
sat.innerHTML=`<div class="resumoTR"><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🛰</div><span>Fonte Oficial</span></div><div class="resumoValor">INPE</div></div><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">📡</div><span>Satélites Identificados</span></div><div class="resumoValor">${resumo.satelites.length}</div></div><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🛰️</div><span>Satélites</span></div><div class="resumoValor" style="font-size:12px;max-width:55%;text-align:right">${resumo.satelites.length?resumo.satelites.join(' • '):'NÃO INFORMADO'}</div></div><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🟢</div><span>Status do Sistema</span></div><div class="statusTR statusOnline">ONLINE</div></div><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🔄</div><span>Atualização Automática</span></div><div class="resumoValor">5 MINUTOS</div></div></div>`
}
/*=========================================================
006 TEMPO REAL FUNCTION RENDERATUALIZACAOTEMPOREAL
=========================================================*/
function renderAtualizacaoTempoReal(resumo){
let box=document.getElementById('painelTempoRealAtualizacao')
if(!box)return
let agora=new Date()
let importacao=resumo.ultimaImportacao?new Date(resumo.ultimaImportacao):null
box.innerHTML=`<div class="resumoTR"><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">📅</div><span>Última Data de Foco</span></div><div class="resumoValor">${resumo.ultimaData?formatarDataTempoRealBR(resumo.ultimaData):'SEM REGISTROS'}</div></div><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">💾</div><span>Última Gravação no Banco</span></div><div class="resumoValor">${importacao&&!Number.isNaN(importacao.getTime())?importacao.toLocaleString('pt-BR'):'SEM INFORMAÇÃO'}</div></div><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🔎</div><span>Consulta do Painel</span></div><div class="resumoValor">${agora.toLocaleString('pt-BR')}</div></div><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🌐</div><span>Cobertura</span></div><div class="resumoValor">RONDÔNIA</div></div></div>`
}
/*=========================================================
007 TEMPO REAL FUNCTION RENDERGRAFICOTEMPOREAL
=========================================================*/
async function renderGraficoTempoReal(){
let canvas=document.getElementById('graficoTempoReal')
if(!canvas||typeof Chart==='undefined')return
let box=canvas.parentElement
if(box){
box.style.opacity='.45'
box.style.transition='opacity .25s ease'
}
let ano=new Date().getFullYear()
let{data=[],error}=await client
.from('vw_queimadas_focos_mensal')
.select('mes,focos')
.eq('ano',ano)
.order('mes',{ascending:true})
if(error){
console.error('Erro ao carregar evolução mensal:',error)
if(box){
box.innerHTML=`<div class="alerta-vermelho">Erro ao carregar a evolução mensal.<br>${error.message||''}</div>`
}
return
}
let valores=Array(12).fill(0)
data.forEach(item=>{
let mes=Number(item.mes)
if(mes>=1&&mes<=12){
valores[mes-1]=Number(item.focos||0)
}
})
if(graficoTempoReal){
graficoTempoReal.destroy()
graficoTempoReal=null
}
let meses=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
let mesAtual=new Date().getMonth()
let valorMaximo=Math.max(...valores,1)
graficoTempoReal=new Chart(canvas,{
type:'bar',
data:{
labels:meses,
datasets:[{
label:'Focos de Calor',
data:valores,
backgroundColor:valores.map((valor,indice)=>{
if(!valor)return'rgba(148,163,184,.25)'
return indice===mesAtual?'#dc2626':'#f97316'
}),
borderColor:valores.map((valor,indice)=>{
if(!valor)return'#cbd5e1'
return indice===mesAtual?'#991b1b':'#ea580c'
}),
borderWidth:1,
borderRadius:10,
borderSkipped:false,
maxBarThickness:58,
minBarLength:3,
barPercentage:.72,
categoryPercentage:.82
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
animation:{
duration:450,
easing:'easeOutQuart'
},
layout:{
padding:{
top:30,
right:18,
bottom:8,
left:8
}
},
interaction:{
mode:'index',
intersect:false
},
plugins:{
legend:{
display:false
},
tooltip:{
enabled:true,
backgroundColor:'#0f172a',
titleColor:'#ffffff',
bodyColor:'#ffffff',
borderColor:'#334155',
borderWidth:1,
padding:12,
displayColors:false,
callbacks:{
title:itens=>`${itens[0].label}/${ano}`,
label:context=>`${Number(context.raw||0).toLocaleString('pt-BR')} focos de calor`
}
},
datalabels:{
display:context=>Number(context.dataset.data[context.dataIndex]||0)>0,
anchor:'end',
align:'top',
offset:4,
clip:false,
color:'#0f172a',
font:{
weight:'900',
size:12
},
formatter:valor=>Number(valor).toLocaleString('pt-BR')
}
},
scales:{
x:{
grid:{
display:false,
drawBorder:false
},
border:{
display:false
},
ticks:{
color:'#334155',
padding:8,
font:{
size:12,
weight:'800'
}
}
},
y:{
beginAtZero:true,
suggestedMax:valorMaximo*1.15,
grid:{
color:'rgba(148,163,184,.22)',
drawBorder:false
},
border:{
display:false
},
ticks:{
color:'#475569',
padding:8,
precision:0,
font:{
size:11,
weight:'700'
},
callback:valor=>Number(valor).toLocaleString('pt-BR')
},
title:{
display:true,
text:'QUANTIDADE DE FOCOS',
color:'#475569',
font:{
size:11,
weight:'800'
}
}
}
}
}
})
if(box){
box.style.opacity='1'
box.style.height='390px'
box.style.position='relative'
}
}
/*=========================================================
PADRÃO GLOBAL DE DATA DO SISTEMA
=========================================================*/
function dataPadraoSistema(valor){
if(!valor)return'—'
let texto=String(valor).trim()
let dataISO=texto.slice(0,10)
if(/^\d{4}-\d{2}-\d{2}$/.test(dataISO)){
let[a,m,d]=dataISO.split('-')
return`${d}/${m}/${a}`
}
let data=new Date(valor)
if(Number.isNaN(data.getTime()))return'—'
return data.toLocaleDateString('pt-BR',{
day:'2-digit',
month:'2-digit',
year:'numeric'
})
}

function dataHoraPadraoSistema(valor){
if(!valor)return'—'
let data=new Date(valor)
if(Number.isNaN(data.getTime()))return'—'
return data.toLocaleString('pt-BR',{
day:'2-digit',
month:'2-digit',
year:'numeric',
hour:'2-digit',
minute:'2-digit'
}).replace(',','')
}

function hojePadraoSistema(){
return dataPadraoSistema(new Date())
}
/*=========================================================
008 TEMPO REAL FUNCTION FORMATARDATATEMPOREAL
=========================================================*/
function formatarDataTempoReal(data){
let ano=data.getFullYear()
let mes=String(data.getMonth()+1).padStart(2,'0')
let dia=String(data.getDate()).padStart(2,'0')
return`${ano}-${mes}-${dia}`
}

/*=========================================================
009 TEMPO REAL FUNCTION FORMATARDATATEMPOREALBR
=========================================================*/
function formatarDataTempoRealBR(data){
return dataPadraoSistema(data)
}
/*=========================================================
010 TEMPO REAL FUNCTION RENDERRANKINGIRIQTEMPOREAL
=========================================================*/
async function renderRankingIRIQTempoReal(){
let box=document.getElementById('painelTempoRealRankingIRIQ')
if(!box)return
box.innerHTML='<div style="padding:30px;text-align:center;font-weight:900">🤖 Carregando ranking IRIQ...</div>'
let{data=[],error}=await client.from('vw_queimadas_irig_ambiental').select('*')
if(error){
console.error('Erro ao carregar ranking IRIQ:',error)
box.innerHTML=`<div class="alerta-vermelho">Erro ao carregar o ranking IRIQ.<br>${error.message||''}</div>`
return
}
let ranking=(data||[]).map(item=>{
let iriq=Number(item.indice_final??item.iriq??item.indice_iriq??item.pontuacao??0)
return{municipio:String(item.municipio||'NÃO INFORMADO').trim(),iriq,classificacao:classificarIRIQTempoReal(iriq)}
}).sort((a,b)=>b.iriq-a.iriq)
if(!ranking.length){
box.innerHTML='<div style="padding:25px;text-align:center">Nenhum município encontrado no ranking IRIQ.</div>'
return
}
box.innerHTML=`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr><th style="padding:12px;text-align:center;border-bottom:2px solid #cbd5e1">POSIÇÃO</th><th style="padding:12px;text-align:left;border-bottom:2px solid #cbd5e1">MUNICÍPIO</th><th style="padding:12px;text-align:center;border-bottom:2px solid #cbd5e1">IRIQ</th><th style="padding:12px;text-align:center;border-bottom:2px solid #cbd5e1">CLASSIFICAÇÃO</th><th style="padding:12px;text-align:left;border-bottom:2px solid #cbd5e1">NÍVEL</th></tr></thead><tbody>${ranking.map((item,indice)=>`<tr><td style="padding:11px;text-align:center;border-bottom:1px solid #e2e8f0;font-weight:900">${indice+1}º</td><td style="padding:11px;border-bottom:1px solid #e2e8f0;font-weight:800">${obterMedalhaIRIQTempoReal(indice)} ${item.municipio}</td><td style="padding:11px;text-align:center;border-bottom:1px solid #e2e8f0;font-weight:900;color:${item.classificacao.cor}">${item.iriq.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td style="padding:11px;text-align:center;border-bottom:1px solid #e2e8f0"><span style="display:inline-block;min-width:105px;padding:6px 10px;border-radius:999px;background:${item.classificacao.fundo};color:${item.classificacao.cor};font-weight:900">${item.classificacao.icone} ${item.classificacao.nome}</span></td><td style="padding:11px;border-bottom:1px solid #e2e8f0"><div style="height:10px;background:#e5e7eb;border-radius:999px;overflow:hidden"><div style="height:100%;width:${Math.min(100,Math.max(0,item.iriq))}%;background:${item.classificacao.cor};border-radius:999px"></div></div></td></tr>`).join('')}</tbody></table></div><div style="margin-top:12px;font-size:12px;color:#64748b;font-weight:700">Municípios apresentados: ${ranking.length} • Atualizado em ${new Date().toLocaleString('pt-BR')}</div>`
}
/*=========================================================
011 TEMPO REAL FUNCTION CLASSIFICARIRIQTEMPOREAL
=========================================================*/
function classificarIRIQTempoReal(valor){
let iriq=Number(valor||0)
if(iriq>=75)return{nome:'CRÍTICO',icone:'🔴',cor:'#b91c1c',fundo:'#fee2e2'}
if(iriq>=50)return{nome:'ALTO',icone:'🟠',cor:'#c2410c',fundo:'#ffedd5'}
if(iriq>=25)return{nome:'MODERADO',icone:'🟡',cor:'#a16207',fundo:'#fef9c3'}
return{nome:'BAIXO',icone:'🟢',cor:'#15803d',fundo:'#dcfce7'}
}
/*=========================================================
012 TEMPO REAL FUNCTION OBTERMEDALHAIRIQTEMPOREAL
=========================================================*/
function obterMedalhaIRIQTempoReal(indice){
if(indice===0)return'🥇'
if(indice===1)return'🥈'
if(indice===2)return'🥉'
return'🏛️'
}
/*=========================================================
013 TEMPO REAL DOMCONTENTLOADED
=========================================================*/
document.addEventListener('DOMContentLoaded',()=>{
renderTempoReal()
if(intervaloTempoReal)clearInterval(intervaloTempoReal)
intervaloTempoReal=setInterval(renderTempoReal,300000)
})

/*=========================================================
014 carregarMunicipiosTempoReal
=========================================================*/
async function carregarMunicipiosTempoReal(){

let select=document.getElementById('selectMunicipioTempoReal')

if(!select)return

const{data,error}=await client
.from('vw_queimadas_municipios_resposta')
.select('municipio')

if(error){
console.error('Erro municípios tempo real:',error)
return
}

let municipios=[...new Set(
(data||[])
.map(i=>String(i.municipio||'').trim())
.filter(Boolean)
)]

municipios.sort((a,b)=>
a.localeCompare(b,'pt-BR')
)

console.log('TOTAL MUNICÍPIOS NO SELETOR:',municipios.length)

select.innerHTML=`
<option value="">Selecione um município...</option>
${municipios.map(m=>`
<option value="${m}">${m}</option>
`).join('')}
`

select.onchange=()=>{
if(select.value){
renderTempoRealMunicipio(select.value)
}else{
limparTempoRealMunicipio()
}
}

}

/*=========================================================
015 TEMPO REAL FUNCTION RENDERTEMPOREALMUNICIPIO
=========================================================*/
async function renderTempoRealMunicipio(municipio){
if(!municipio)return
const ano=new Date().getFullYear()
let inicioAno=`${ano}-01-01`
let fimAno=formatarDataTempoReal(new Date())
let registros=[]
let inicio=0
let limite=1000
while(true){
let{data,error}=await client.schema('queimadas').from('queimadas_focos_inpe').select('*').eq('uf','RO').ilike('municipio',municipio).gte('data_foco',inicioAno).lte('data_foco',fimAno).order('data_hora',{ascending:false}).range(inicio,inicio+limite-1)
if(error){
console.error('Erro tempo real municipal:',error)
return
}
let pagina=data||[]
registros.push(...pagina)
if(pagina.length<limite)break
inicio+=limite
}
console.log('TOTAL FOCOS MUNICÍPIO:',municipio,registros.length)
let hoje=new Date()
let hojeISO=[hoje.getFullYear(),String(hoje.getMonth()+1).padStart(2,'0'),String(hoje.getDate()).padStart(2,'0')].join('-')
let focosAno=registros.length
let focosHoje=registros.filter(i=>String(i.data_foco||'').slice(0,10)===hojeISO).length
let ultimaData=registros.reduce((maior,i)=>{
let data=String(i.data_foco||'').slice(0,10)
return data>maior?data:maior
},'')
let elFocosAno=document.getElementById('trmFocosAno')
let elFocosHoje=document.getElementById('trmFocosHoje')
let elUltimaData=document.getElementById('trmUltimaData')
let elTotal=document.getElementById('trmTotalRegistros')
if(elFocosAno)elFocosAno.textContent=focosAno.toLocaleString('pt-BR')
if(elFocosHoje)elFocosHoje.textContent=focosHoje.toLocaleString('pt-BR')
if(elUltimaData)elUltimaData.textContent=ultimaData?formatarDataBR(ultimaData):'—'
if(elTotal)elTotal.textContent=registros.length.toLocaleString('pt-BR')
await renderResumoTempoRealMunicipio(municipio,registros,focosHoje,ultimaData)
renderGraficoTempoRealMunicipio(registros)
renderFocosRecentesMunicipio(registros)
renderMaioresFocosMunicipio(registros)
}

/*=========================================================
RESUMO TEMPO REAL DO MUNICÍPIO
=========================================================*/
async function renderResumoTempoRealMunicipio(municipio,registros,focosHoje,ultimaData){
let lista=Array.isArray(registros)?registros:[]
let totalMunicipio=lista.length
let ultimo=lista.length?lista[0]:null
let totalRO=0
let iriq=null
let classificacao='SEM DADOS'
let risco=null
let posicao='-'
let focosHeatmap=0
try{
let{count,error}=await client.schema('queimadas').from('queimadas_focos_inpe').select('*',{count:'exact',head:true}).eq('uf','RO').gte('data_foco','2026-01-01').lte('data_foco','2026-12-31')
if(!error)totalRO=Number(count||0)
}catch(e){
console.error('Erro total RO:',e)
}
try{
let{data,error}=await client.schema('queimadas').from('queimadas_heatmap').select('municipio,iriq,risco,classificacao,focos')
if(!error&&Array.isArray(data)){
let ranking=[...data].sort((a,b)=>Number(b.iriq||0)-Number(a.iriq||0))
let nome=normalizarMunicipio(municipio)
let indice=ranking.findIndex(i=>normalizarMunicipio(i.municipio)===nome)
if(indice>=0){
let registro=ranking[indice]
iriq=Number(registro.iriq||0)
risco=Number(registro.risco||0)
classificacao=String(registro.classificacao||classificarFaixaIRIQMunicipio(iriq)).toUpperCase()
focosHeatmap=Number(registro.focos||0)
posicao=`${indice+1}º de ${ranking.length}`
}
}
}catch(e){
console.error('Erro ao consultar IRIQ municipal:',e)
}
let participacao=totalRO>0?(totalMunicipio/totalRO)*100:0
let corIRIQ='#64748b'
if(iriq!==null){
if(iriq>=75)corIRIQ='#dc2626'
else if(iriq>=50)corIRIQ='#f97316'
else if(iriq>=25)corIRIQ='#eab308'
else corIRIQ='#16a34a'
}
let resumo=document.getElementById('trmResumoMunicipio')
if(resumo){
resumo.innerHTML=`
<div class="trm-resumo-grid">
<div class="trm-resumo-item trm-iriq">
<div class="trm-resumo-label">🤖 IRIQ MUNICIPAL</div>
<div class="trm-resumo-valor" style="color:${corIRIQ}">${iriq!==null?iriq.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}):'-'}</div>
<div class="trm-classificacao" style="color:${corIRIQ}">${classificacao}</div>
</div>
<div class="trm-resumo-item">
<div class="trm-resumo-label">🏆 POSIÇÃO NO IRIQ</div>
<div class="trm-resumo-valor">${posicao}</div>
</div>
<div class="trm-resumo-item">
<div class="trm-resumo-label">🔥 FOCOS EM 2026</div>
<div class="trm-resumo-valor">${totalMunicipio.toLocaleString('pt-BR')}</div>
</div>
<div class="trm-resumo-item">
<div class="trm-resumo-label">📊 PARTICIPAÇÃO NOS FOCOS DE RO</div>
<div class="trm-resumo-valor">${participacao.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})}%</div>
</div>
<div class="trm-resumo-item">
<div class="trm-resumo-label">📅 ÚLTIMO FOCO REGISTRADO</div>
<div class="trm-resumo-valor">${ultimaData?formatarDataBR(ultimaData):'-'}</div>
</div>
<div class="trm-resumo-item">
<div class="trm-resumo-label">🛰 ÚLTIMO SATÉLITE</div>
<div class="trm-resumo-valor">${ultimo?.satelite||'-'}</div>
</div>
<div class="trm-resumo-item">
<div class="trm-resumo-label">🔥 FOCOS HOJE</div>
<div class="trm-resumo-valor">${Number(focosHoje||0).toLocaleString('pt-BR')}</div>
</div>
<div class="trm-resumo-item">
<div class="trm-resumo-label">⚠️ ÍNDICE DE RISCO</div>
<div class="trm-resumo-valor">${risco!==null?risco.toLocaleString('pt-BR',{maximumFractionDigits:2}):'-'}</div>
</div>
<div class="trm-resumo-item">
<div class="trm-resumo-label">📍 FOCOS BASE HEATMAP</div>
<div class="trm-resumo-valor">${focosHeatmap.toLocaleString('pt-BR')}</div>
</div>
</div>
`
}
let box=document.getElementById('trmResumoFocos')
if(box){
box.innerHTML=`
<div class="resumoTR">
<div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🏛️</div><span>Município</span></div><div class="resumoValor">${municipio}</div></div>
<div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🔥</div><span>Focos de Calor em 2026</span></div><div class="resumoValor">${totalMunicipio.toLocaleString('pt-BR')}</div></div>
<div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">📅</div><span>Focos Hoje</span></div><div class="resumoValor">${Number(focosHoje||0).toLocaleString('pt-BR')}</div></div>
<div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🤖</div><span>IRIQ Municipal</span></div><div class="resumoValor" style="color:${corIRIQ}">${iriq!==null?iriq.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}):'-'} • ${classificacao}</div></div>
</div>
`
}
let monitoramento=document.getElementById('trmMonitoramento')
if(monitoramento){
monitoramento.innerHTML=`
<div class="resumoTR">
<div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🛰</div><span>Fonte Oficial</span></div><div class="resumoValor">INPE</div></div>
<div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">📍</div><span>Município Monitorado</span></div><div class="resumoValor">${municipio}</div></div>
<div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">📅</div><span>Última Data de Foco</span></div><div class="resumoValor">${ultimaData?formatarDataBR(ultimaData):'-'}</div></div>
<div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🏆</div><span>Ranking IRIQ</span></div><div class="resumoValor">${posicao}</div></div>
</div>
`
}
let sync=document.getElementById('trmSincronizacao')
if(sync){
let agora=new Date()
sync.innerHTML=`
<div class="resumoTR">
<div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">📅</div><span>Última Data INPE</span></div><div class="resumoValor">${ultimaData?formatarDataBR(ultimaData):'-'}</div></div>
<div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🔄</div><span>Consulta do Painel</span></div><div class="resumoValor">${agora.toLocaleString('pt-BR')}</div></div>
<div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🟢</div><span>Status</span></div><div class="statusTR statusOnline">ONLINE</div></div>
</div>
`
}
}
function classificarFaixaIRIQMunicipio(valor){
valor=Number(valor||0)
if(valor>=75)return'CRÍTICO'
if(valor>=50)return'ALTO'
if(valor>=25)return'MODERADO'
return'BAIXO'
}

/*=========================================================*
*GRÁFICO MENSAL MUNICIPAL*
*=========================================================*/
function renderGraficoTempoRealMunicipio(registros){
let canvas=document.getElementById('graficoTempoRealMunicipio')
if(!canvas)return
let meses=Array(12).fill(0)
registros.forEach(i=>{
let mes=Number(String(i.data_foco||'').slice(5,7))-1
if(mes>=0&&mes<12)meses[mes]++
})
if(graficoTempoRealMunicipio&&typeof graficoTempoRealMunicipio.destroy==='function')graficoTempoRealMunicipio.destroy()
graficoTempoRealMunicipio=null
if(typeof Chart!=='undefined'&&typeof Chart.getChart==='function'){
let existente=Chart.getChart(canvas)
if(existente&&typeof existente.destroy==='function')existente.destroy()
}
graficoTempoRealMunicipio=new Chart(canvas.getContext('2d'),{
type:'bar',
data:{
labels:['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'],
datasets:[{label:'Focos de Calor',data:meses,backgroundColor:'#dc2626',borderRadius:5}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{display:false},
datalabels:{anchor:'end',align:'top',font:{weight:'bold',size:11},color:'#111827',formatter:v=>v||''}
},
scales:{
y:{beginAtZero:true,ticks:{precision:0}},
x:{grid:{display:false}}
}
},
plugins:[typeof ChartDataLabels!=='undefined'?ChartDataLabels:null].filter(Boolean)
})
}

/*=========================================================
FOCOS RECENTES DO MUNICÍPIO
=========================================================*/
function renderFocosRecentesMunicipio(registros){
let box=document.getElementById('trmFocosRecentes')
if(!box)return
let recentes=[...(registros||[])]
.sort((a,b)=>new Date(b.data_hora||b.data_foco)-new Date(a.data_hora||a.data_foco))
.slice(0,20)
if(!recentes.length){
box.innerHTML=`
<div class="fonte-card">
Nenhum foco registrado para o município no período.
</div>
`
return
}
box.innerHTML=`
<div class="trm-tabela-wrapper">
<table class="tabela-painel trm-tabela-focos">
<thead>
<tr>
<th>DATA</th>
<th>HORA</th>
<th>SATÉLITE</th>
<th>LATITUDE</th>
<th>LONGITUDE</th>
<th>RISCO FOGO</th>
<th>FRP</th>
<th>LOCALIZAÇÃO</th>
</tr>
</thead>
<tbody>
${recentes.map(i=>{
let lat=Number(i.latitude)
let lon=Number(i.longitude)
let coordenadasValidas=Number.isFinite(lat)&&Number.isFinite(lon)
let urlEarth=coordenadasValidas
?`https://earth.google.com/web/search/${encodeURIComponent(lat+','+lon)}`
:''
return `
<tr>
<td><b>${formatarDataBR(i.data_foco)}</b></td>
<td>${i.hora||'-'}</td>
<td>${i.satelite||'-'}</td>
<td class="trm-coordenada">${coordenadasValidas?lat.toFixed(5):'-'}</td>
<td class="trm-coordenada">${coordenadasValidas?lon.toFixed(5):'-'}</td>
<td>${i.risco_fogo??'-'}</td>
<td>${i.frp??'-'}</td>
<td>
${coordenadasValidas?`
<a
class="btn-google-earth"
href="${urlEarth}"
target="_blank"
rel="noopener noreferrer"
title="Abrir localização do foco no Google Earth"
>
🌎 VER LOCAL
</a>
`:'-'}
</td>
</tr>
`
}).join('')}
</tbody>
</table>
</div>
`
}

/*=========================================================
LIMPAR TEMPO REAL MUNICIPAL
=========================================================*/

function limparTempoRealMunicipio(){

;[
'trmFocosAno',
'trmFocosHoje',
'trmUltimaData',
'trmTotalRegistros'
].forEach(id=>{

let el=document.getElementById(id)

if(el)el.textContent='—'

})

;[
'trmResumoFocos',
'trmMonitoramento',
'trmSincronizacao',
'trmFocosRecentes'
].forEach(id=>{

let el=document.getElementById(id)

if(el)el.innerHTML=''

})

if(graficoTempoRealMunicipio){
graficoTempoRealMunicipio.destroy()
graficoTempoRealMunicipio=null
}

}

/*=========================================================
MAIORES FOCOS DO MUNICÍPIO EM 2026
=========================================================*/
function renderMaioresFocosMunicipio(registros){
let box=document.getElementById('trmMaioresFocos')
if(!box)return
let maiores=[...(registros||[])]
.filter(i=>i.frp!==null&&i.frp!==undefined&&Number.isFinite(Number(i.frp)))
.sort((a,b)=>Number(b.frp||0)-Number(a.frp||0))
.slice(0,10)
if(!maiores.length){
box.innerHTML=`
<div class="fonte-card">
Nenhum registro com valor de FRP disponível para este município em 2026.
</div>
`
return
}
box.innerHTML=`
<div class="trm-tabela-wrapper">
<table class="tabela-painel trm-tabela-focos">
<thead>
<tr>
<th>POS.</th>
<th>DATA</th>
<th>HORA</th>
<th>SATÉLITE</th>
<th>LATITUDE</th>
<th>LONGITUDE</th>
<th>RISCO FOGO</th>
<th>FRP</th>
<th>LOCALIZAÇÃO</th>
</tr>
</thead>
<tbody>
${maiores.map((i,index)=>{
let lat=Number(i.latitude)
let lon=Number(i.longitude)
let coordenadasValidas=Number.isFinite(lat)&&Number.isFinite(lon)
let urlEarth=coordenadasValidas
?`https://earth.google.com/web/search/${encodeURIComponent(lat+','+lon)}`
:''
let frp=Number(i.frp||0)
return`
<tr>
<td><b>${index+1}º</b></td>
<td><b>${formatarDataBR(i.data_foco)}</b></td>
<td>${i.hora||'-'}</td>
<td>${i.satelite||'-'}</td>
<td class="trm-coordenada">${coordenadasValidas?lat.toFixed(5):'-'}</td>
<td class="trm-coordenada">${coordenadasValidas?lon.toFixed(5):'-'}</td>
<td>${i.risco_fogo??'-'}</td>
<td><b>${frp.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})}</b></td>
<td>
${coordenadasValidas?`
<a class="btn-google-earth" href="${urlEarth}" target="_blank" rel="noopener noreferrer" title="Abrir localização do foco no Google Earth">
🌎 VER LOCAL
</a>
`:'-'}
</td>
</tr>
`
}).join('')}
</tbody>
</table>
</div>
`
}
