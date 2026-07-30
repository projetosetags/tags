async function renderTempoReal(){

let box=document.getElementById('painelTempoRealKPIs')

let {data}=await client
.from('vw_queimadas_executivo')
.select('*')
.single()

box.innerHTML=`

<div class="tempoGrid">

<div class="kpiTempo">

<div class="kpiTempoNumero">

${Number(data.focos_estado).toLocaleString('pt-BR')}

</div>

<div class="kpiTempoTitulo">

FOCOS REGISTRADOS

</div>

</div>

<div class="kpiTempo">

<div class="kpiTempoNumero">

${Number(data.municipios_criticos)}

</div>

<div class="kpiTempoTitulo">

MUNICÍPIOS CRÍTICOS

</div>

</div>

<div class="kpiTempo">

<div class="kpiTempoNumero">

${Number(data.iriq_estadual).toFixed(2)}

</div>

<div class="kpiTempoTitulo">

IRIQ

</div>

</div>

<div class="kpiTempo">

<div class="kpiTempoNumero">

${new Date().toLocaleTimeString('pt-BR')}

</div>

<div class="kpiTempoTitulo">

ÚLTIMA LEITURA

</div>

</div>

</div>

`

renderRankingTempoReal()

}
async function renderRankingTempoReal(){

let box=document.getElementById('painelTempoRealRanking')

let {data=[]}=await client

.from('vw_queimadas_ranking_estadual')

.select('*')

.limit(10)

box.innerHTML=data.map(i=>`

<div class="cardRankingTR">

<span>${i.semaforo} ${i.municipio}</span>

<b>${Number(i.focos).toLocaleString('pt-BR')}</b>

</div>

`).join('')

}

document.addEventListener('DOMContentLoaded',()=>{

renderTempoReal()

setInterval(renderTempoReal,300000)

})

