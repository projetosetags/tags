/*=========================================================
000 MONITORAMENTO CLIENT
=========================================================*/
const client = window.clientPublic
  
let graficoExecutivoOrgaos=null
let graficoExecutivoStatus=null

async function carregarPainelExecutivo(){

let{data:monitoramentos,error}=await client
.from('monitoramentos')
.select('*')

if(error){
console.log(error)
return
}

let{data:itens}=await client
.from('monitoramento_itens')
.select('*')

itens=ordenarDataGlobal(itens)

let totalItens=itens?.length||0

let soma=0

let criticos=0

;(itens||[]).forEach(i=>{

let percentual=Number(i.percentual||0)

soma+=percentual

if(percentual<40){
criticos++
}

})

let efetividade=0

if(totalItens>0){

efetividade=
(
soma/
totalItens
).toFixed(1)

}

let orgaos=[
...new Set(
(monitoramentos||[])
.map(m=>m.orgao||'-')
)
]

document.getElementById('kpiEfetividade').innerHTML=
`${efetividade}%`

document.getElementById('kpiOrgaosExecutivo').innerHTML=
orgaos.length

document.getElementById('kpiMonitoramentosExecutivo').innerHTML=
monitoramentos?.length||0

document.getElementById('kpiCriticosExecutivo').innerHTML=
criticos

await carregarGraficoExecutivoOrgaos(
monitoramentos,
itens
)

await carregarGraficoExecutivoStatus(
itens
)

await carregarListaExecutiva(
monitoramentos,
itens
)

}

async function carregarGraficoExecutivoOrgaos(
monitoramentos,
itens
){

let mapa={}

;(monitoramentos||[]).forEach(m=>{

let orgao=m.orgao||'NÃO INFORMADO'

if(!mapa[orgao]){
mapa[orgao]={
total:0,
soma:0
}
}

let relacionados=
(itens||[])
.filter(i=>
i.monitoramento_id===m.id
)

relacionados.forEach(r=>{

mapa[orgao].total++

mapa[orgao].soma+=
Number(r.percentual||0)

})

})

let labels=[]
let valores=[]

Object.keys(mapa).forEach(o=>{

labels.push(o)

let media=0

if(mapa[o].total>0){

media=
(
mapa[o].soma/
mapa[o].total
).toFixed(1)

}

valores.push(media)

})

let ctx=document.getElementById(
'graficoExecutivoOrgaos'
)

if(graficoExecutivoOrgaos){
graficoExecutivoOrgaos.destroy()
}

graficoExecutivoOrgaos=new Chart(ctx,{
type:'bar',
data:{
labels:labels,
datasets:[{
label:'Efetividade',
data:valores,
backgroundColor:'#10b981',
borderRadius:10
}]
},
options:{
responsive:true,
plugins:{
legend:{
labels:{
color:'#fff'
}
},
datalabels:{
color:'#fff',
anchor:'end',
align:'top'
}
},
scales:{
x:{
ticks:{
color:'#fff'
},
grid:{
color:'rgba(255,255,255,.05)'
}
},
y:{
ticks:{
color:'#fff'
},
grid:{
color:'rgba(255,255,255,.05)'
}
}
}
},
plugins:[ChartDataLabels]
})

}

async function carregarGraficoExecutivoStatus(
itens
){

let executada=0
let parcial=0
let nao=0
let andamento=0

;(itens||[]).forEach(i=>{

if(i.status==='EXECUTADA'){
executada++
}

if(i.status==='PARCIALMENTE EXECUTADA'){
parcial++
}

if(i.status==='NÃO EXECUTADA'){
nao++
}

if(i.status==='EM ANDAMENTO'){
andamento++
}

})

let ctx=document.getElementById(
'graficoExecutivoStatus'
)

if(graficoExecutivoStatus){
graficoExecutivoStatus.destroy()
}

graficoExecutivoStatus=new Chart(ctx,{
type:'doughnut',
data:{
labels:[
'Executada',
'Parcial',
'Não Executada',
'Andamento'
],
datasets:[{
data:[
executada,
parcial,
nao,
andamento
],
backgroundColor:[
'#10b981',
'#f59e0b',
'#ef4444',
'#3b82f6'
]
}]
},
options:{
responsive:true,
plugins:{
legend:{
labels:{
color:'#fff'
}
},
datalabels:{
color:'#fff'
}
}
},
plugins:[ChartDataLabels]
})

}

async function carregarListaExecutiva(monitoramentos,itens){
itens=ordenarDataGlobal(itens)
let mapa={}

;(monitoramentos||[]).forEach(m=>{

let orgao=m.orgao||'NÃO INFORMADO'

if(!mapa[orgao]){

mapa[orgao]={

total:0,
soma:0,
alto:0,
medio:0,
baixo:0

}

}

let relacionados=(itens||[])
.filter(i=>i.monitoramento_id===m.id)

relacionados.forEach(r=>{

let percentual=Number(r.percentual||0)

mapa[orgao].total++
mapa[orgao].soma+=percentual

if(percentual<40){

mapa[orgao].alto++

}else if(percentual<80){

mapa[orgao].medio++

}else{

mapa[orgao].baixo++

}

})

})

let ranking=[]

Object.keys(mapa).forEach(orgao=>{

let media=0

if(mapa[orgao].total>0){

media=
(
mapa[orgao].soma/
mapa[orgao].total
).toFixed(1)

}

ranking.push({

orgao:orgao,
media:Number(media),
alto:mapa[orgao].alto,
medio:mapa[orgao].medio,
baixo:mapa[orgao].baixo

})

})

ranking.sort((a,b)=>b.media-a.media)

let html=''

ranking.forEach((r,index)=>{

let classe='verde'
let semaforo='🟢'

if(r.media<40){

classe='vermelho'
semaforo='🔴'

}else if(r.media<80){

classe='amarelo'
semaforo='🟡'

}

html+=`
<div class="ranking-item executivo-ranking">

<div class="ranking-posicao">
#${index+1}
</div>

<div class="ranking-left">

<div class="ranking-title">
${semaforo} ${r.orgao}
</div>

<div class="ranking-subtitle">

Alto:
${r.alto}

•

Médio:
${r.medio}

•

Baixo:
${r.baixo}

</div>

</div>

<div class="ranking-right">

<div class="badge-status ${classe}">
${r.media}%
</div>

</div>

</div>
`

})

document.getElementById(
'listaExecutiva'
).innerHTML=html

}
