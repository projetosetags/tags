
  
let graficoBeneficiosInstitucionais=null
let graficoEfetividadeInstitucional=null

async function carregarPainelBeneficios(){

let{data,error}=await client
.from('monitoramento_resultados')
.select('*')
data=ordenarDataGlobal(data)

if(error){
console.log(error)
return
}

let financeiro=0
let operacional=0
let social=0
let ambiental=0
let governanca=0
let efetividade=0

;(data||[]).forEach(r=>{

financeiro+=Number(r.beneficio_financeiro||0)

operacional+=Number(r.beneficio_operacional||0)

social+=Number(r.beneficio_social||0)

ambiental+=Number(r.beneficio_ambiental||0)

governanca+=Number(r.beneficio_governanca||0)

efetividade+=Number(r.indice_efetividade||0)

})

let mediaEfetividade=0

if(data&&data.length>0){

mediaEfetividade=
(
efetividade/
data.length
).toFixed(1)

}

document.getElementById('kpiBeneficioFinanceiro').innerHTML=
financeiro.toLocaleString('pt-BR')

document.getElementById('kpiBeneficioOperacional').innerHTML=
operacional.toLocaleString('pt-BR')

document.getElementById('kpiBeneficioSocial').innerHTML=
social.toLocaleString('pt-BR')

document.getElementById('kpiBeneficioAmbiental').innerHTML=
ambiental.toLocaleString('pt-BR')

document.getElementById('kpiBeneficioGovernanca').innerHTML=
governanca.toLocaleString('pt-BR')

document.getElementById('kpiIndiceEfetividade').innerHTML=
`${mediaEfetividade}%`

await carregarGraficoBeneficiosInstitucionais(
financeiro,
operacional,
social,
ambiental,
governanca
)

await carregarGraficoEfetividadeInstitucional(
mediaEfetividade
)

await carregarListaBeneficios(data||[])

}

async function carregarGraficoBeneficiosInstitucionais(
financeiro,
operacional,
social,
ambiental,
governanca
){

let ctx=document.getElementById(
'graficoBeneficiosInstitucionais'
)

if(graficoBeneficiosInstitucionais){
graficoBeneficiosInstitucionais.destroy()
}

graficoBeneficiosInstitucionais=new Chart(ctx,{
type:'polarArea',
data:{
labels:[
'Financeiro',
'Operacional',
'Social',
'Ambiental',
'Governança'
],
datasets:[{
data:[
financeiro,
operacional,
social,
ambiental,
governanca
],
backgroundColor:[
'#10b981',
'#3b82f6',
'#f59e0b',
'#22c55e',
'#8b5cf6'
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

async function carregarGraficoEfetividadeInstitucional(
media
){

let ctx=document.getElementById(
'graficoEfetividadeInstitucional'
)

if(graficoEfetividadeInstitucional){
graficoEfetividadeInstitucional.destroy()
}

graficoEfetividadeInstitucional=new Chart(ctx,{
type:'doughnut',
data:{
labels:[
'Efetividade',
'Restante'
],
datasets:[{
data:[
media,
100-media
],
backgroundColor:[
'#10b981',
'#1e293b'
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

async function carregarListaBeneficios(data){
data=ordenarDataGlobal(data)

let html=''

;(data||[]).forEach(r=>{

html+=`
<div class="card-monitoramento">

<div class="card-monitoramento-topo">

<div>

<div class="monitoramento-titulo">
Benefício Institucional
</div>

<div class="monitoramento-subtitulo">
Efetividade:
${Number(r.indice_efetividade||0)}%
</div>

</div>

<div class="badge-status verde">
${Number(r.indice_efetividade||0)}%
</div>

</div>

<div class="monitoramento-info-grid">

<div>
<b>Financeiro:</b>
${Number(r.beneficio_financeiro||0).toLocaleString('pt-BR')}
</div>

<div>
<b>Operacional:</b>
${Number(r.beneficio_operacional||0).toLocaleString('pt-BR')}
</div>

<div>
<b>Social:</b>
${Number(r.beneficio_social||0).toLocaleString('pt-BR')}
</div>

<div>
<b>Ambiental:</b>
${Number(r.beneficio_ambiental||0).toLocaleString('pt-BR')}
</div>

<div>
<b>Governança:</b>
${Number(r.beneficio_governanca||0).toLocaleString('pt-BR')}
</div>

</div>

</div>
`

})

document.getElementById(
'listaBeneficios'
).innerHTML=html

}
