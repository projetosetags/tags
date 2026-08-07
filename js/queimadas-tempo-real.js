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
renderGraficoTempoReal(resumo.porMes)
}
/*=========================================================
002 TEMPO REAL FUNCTION BUSCARFOCOSTEMPOREAL
=========================================================*/
async function buscarFocosTempoReal(dataInicial,dataFinal){
let todos=[]
let inicio=0
let limite=1000
while(true){
let{data,error}=await client.from('queimadas_focos_inpe').select('id,municipio,data_foco,data_hora,satelite,created_at').gte('data_foco',dataInicial).lte('data_foco',dataFinal).order('id',{ascending:true}).range(inicio,inicio+limite-1)
if(error)return{data:[],error}
let pagina=data||[]
todos.push(...pagina)
if(pagina.length<limite)break
inicio+=limite
}
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
let box=document.getElementById('painelTempoRealFocos')
if(box){
box.innerHTML=`<div class="resumoTR"><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🔥</div><span>Focos de Calor em 2026</span></div><div class="resumoValor">${resumo.total.toLocaleString('pt-BR')}</div></div><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">📅</div><span>Focos Hoje</span></div><div class="resumoValor">${resumo.focosHoje.toLocaleString('pt-BR')}</div></div><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🏛</div><span>Municípios com Focos</span></div><div class="resumoValor">${resumo.municipios}</div></div><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🌳</div><span>Área Queimada</span></div><div class="resumoValor">${Number(executivo.area_queimada_estado_ha||0).toLocaleString('pt-BR',{maximumFractionDigits:2})} ha</div></div><div class="resumoLinha"><div class="resumoEsquerda"><div class="resumoIcone">🌲</div><span>Desmatamento</span></div><div class="resumoValor">${Number(executivo.desmatamento_estado_ha||0).toLocaleString('pt-BR',{maximumFractionDigits:2})} ha</div></div></div>`
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
function renderGraficoTempoReal(valores){
let canvas=document.getElementById('graficoTempoReal')
if(!canvas||typeof Chart==='undefined')return
if(graficoTempoReal){
graficoTempoReal.destroy()
graficoTempoReal=null
}
let meses=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
graficoTempoReal=new Chart(canvas,{
type:'bar',
data:{
labels:meses,
datasets:[{
label:'Focos',
data:valores,
backgroundColor:valores.map((valor,indice)=>indice===new Date().getMonth()?'#dc2626':'#f97316'),
borderColor:valores.map((valor,indice)=>indice===new Date().getMonth()?'#991b1b':'#ea580c'),
borderWidth:1,
borderRadius:8,
borderSkipped:false,
maxBarThickness:65
}]
},
options:{
responsive:true,
maintainAspectRatio:true,
aspectRatio:2.4,
plugins:{
legend:{display:false},
tooltip:{
backgroundColor:'#111827',
titleColor:'#fff',
bodyColor:'#fff',
padding:10,
callbacks:{
label:context=>`${Number(context.raw||0).toLocaleString('pt-BR')} focos`
}
},
datalabels:{
display:true,
anchor:'end',
align:'top',
color:'#111827',
font:{weight:'900',size:12},
formatter:valor=>valor?Number(valor).toLocaleString('pt-BR'):''
}
},
scales:{
x:{
grid:{display:false},
ticks:{font:{size:11,weight:'800'}}
},
y:{
beginAtZero:true,
grid:{color:'#e5e7eb'},
ticks:{
font:{size:11,weight:'700'},
callback:valor=>Number(valor).toLocaleString('pt-BR')
}
}
}
}
})
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
if(!data)return'--'
let partes=String(data).slice(0,10).split('-')
if(partes.length!==3)return String(data)
return`${partes[2]}/${partes[1]}/${partes[0]}`
}
/*=========================================================
010 TEMPO REAL DOMCONTENTLOADED
=========================================================*/
document.addEventListener('DOMContentLoaded',()=>{
renderTempoReal()
if(intervaloTempoReal)clearInterval(intervaloTempoReal)
intervaloTempoReal=setInterval(renderTempoReal,300000)
})
