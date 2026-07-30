let graficoTempoReal=null;
async function renderTempoReal(){let box=document.getElementById('painelTempoRealKPIs');if(!box)return;let{data,error}=await client.from('vw_queimadas_executivo').select('*').single();if(error||!data)return;box.innerHTML=`<div class="tempoGrid"><div class="kpiTempo"><div class="kpiTempoNumero">${Number(data.focos_estado||0).toLocaleString('pt-BR')}</div><div class="kpiTempoTitulo">FOCOS</div></div><div class="kpiTempo"><div class="kpiTempoNumero">${Number(data.municipios_criticos||0)}</div><div class="kpiTempoTitulo">CRÍTICOS</div></div><div class="kpiTempo"><div class="kpiTempoNumero">${Number(data.iriq_estadual||0).toFixed(2)}</div><div class="kpiTempoTitulo">IRIQ</div></div><div class="kpiTempo"><div class="kpiTempoNumero">${new Date().toLocaleTimeString('pt-BR')}</div><div class="kpiTempoTitulo">ATUALIZAÇÃO</div></div></div>`;await renderRankingTempoReal();renderResumoTempoReal(data);renderAtualizacaoTempoReal();renderGraficoTempoReal();}
async function renderRankingTempoReal(){let box=document.getElementById('painelTempoRealRanking');if(!box)return;let{data=[],error}=await client.from('vw_queimadas_ranking_estadual').select('*').limit(10);if(error){box.innerHTML='<div class="cardTempoReal">Erro ao carregar ranking.</div>';return;}box.innerHTML=data.map(i=>`<div class="cardRankingTR"><div class="cardRankingMunicipio">${i.semaforo} ${i.municipio}</div><div class="cardRankingValor">${Number(i.focos||0).toLocaleString('pt-BR')}</div></div>`).join('');}
function renderAtualizacaoTempoReal(){let box=document.getElementById('painelTempoRealAtualizacao');if(!box)return;let agora=new Date();box.innerHTML=`<div class="atualizacaoTR">${agora.toLocaleDateString('pt-BR')}<br>${agora.toLocaleTimeString('pt-BR')}</div>`;}
document.addEventListener('DOMContentLoaded',()=>{renderTempoReal();setInterval(renderTempoReal,300000);});
function renderResumoTempoReal(d){
let box=document.getElementById('painelTempoRealFocos')
if(!box)return

box.innerHTML=`
<div class="resumoTR">
<div class="resumoLinha">
<div class="resumoEsquerda">
<div class="resumoIcone">🔥</div>
<span>Focos de Calor</span>
</div>
<div class="resumoValor">${Number(d.focos_estado||0).toLocaleString('pt-BR')}</div>
</div>
<div class="resumoLinha">
<div class="resumoEsquerda">
<div class="resumoIcone">🏛</div>
<span>Municípios Críticos</span>
</div>
<div class="resumoValor">${Number(d.municipios_criticos||0)}</div>
</div>
<div class="resumoLinha">
<div class="resumoEsquerda">
<div class="resumoIcone">🌳</div>
<span>Área Queimada</span>
</div>
<div class="resumoValor">${Number(d.area_queimada_estado_ha||0).toLocaleString('pt-BR')} ha</div>
</div>
<div class="resumoLinha">
<div class="resumoEsquerda">
<div class="resumoIcone">🌲</div>
<span>Desmatamento</span>
</div>
<div class="resumoValor">${Number(d.desmatamento_estado_ha||0).toLocaleString('pt-BR')} ha</div>
</div>
</div>
`

let sat=document.getElementById('painelTempoRealSatelites')
if(!sat)return

sat.innerHTML=`
<div class="resumoTR">
<div class="resumoLinha">
<div class="resumoEsquerda">
<div class="resumoIcone">🛰</div>
<span>Fonte dos Dados</span>
</div>
<div class="resumoValor">INPE</div>
</div>
<div class="resumoLinha">
<div class="resumoEsquerda">
<div class="resumoIcone">📡</div>
<span>Status</span>
</div>
<div class="resumoValor" style="color:#ea580c">Em implantação</div>
</div>
<div class="resumoLinha">
<div class="resumoEsquerda">
<div class="resumoIcone">🔄</div>
<span>Atualização</span>
</div>
<div class="resumoValor">Automática</div>
</div>
</div>
`
}
async function renderGraficoTempoReal(){
let canvas=document.getElementById('graficoTempoReal')
if(!canvas)return

let {data=[]}=await client
.from('vw_queimadas_ranking_estadual')
.select('municipio,focos,classificacao')
.limit(8)

if(graficoTempoReal){
graficoTempoReal.destroy()
}

let cores=data.map(i=>{
if(i.classificacao==='CRÍTICO'||i.classificacao==='CRITICO')return'#dc2626'
if(i.classificacao==='ALTO')return'#ea580c'
if(i.classificacao==='MODERADO')return'#eab308'
return'#16a34a'
})

graficoTempoReal=new Chart(canvas,{
type:'bar',
data:{
labels:data.map(i=>i.municipio),
datasets:[{
label:'Focos de Calor',
data:data.map(i=>i.focos),
backgroundColor:cores,
borderRadius:8,
borderSkipped:false,
maxBarThickness:32
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
display:false
},
title:{
display:true,
text:'Municípios com Maior Número de Focos'
},
tooltip:{
callbacks:{
label:c=>`${Number(c.raw).toLocaleString('pt-BR')} focos`
}
}
},
scales:{
x:{
grid:{
display:false
},
ticks:{
font:{
weight:'bold',
size:11
}
}
},
y:{
beginAtZero:true,
grid:{
color:'#e5e7eb'
},
ticks:{
callback:v=>Number(v).toLocaleString('pt-BR')
}
}
}
}
})
}

