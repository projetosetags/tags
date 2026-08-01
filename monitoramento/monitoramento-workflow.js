/*=========================================================
000 MONITORAMENTO CLIENT
=========================================================*/
const client = window.clientPublic
  
async function carregarWorkflow(){

let{data,error}=await client
.from('monitoramento_analises')
.select('*')
.order('id',{ascending:false})

if(error){
console.log(error)
return
}

let rascunho=0
let emAnalise=0
let validado=0
let rejeitado=0

;(data||[]).forEach(a=>{

let s=a.workflow_status||'RASCUNHO'

if(s==='RASCUNHO')rascunho++
if(s==='EM ANÁLISE')emAnalise++
if(s==='VALIDADO')validado++
if(s==='REJEITADO')rejeitado++

})

document.getElementById('kpiRascunho').innerHTML=rascunho
document.getElementById('kpiEmAnalise').innerHTML=emAnalise
document.getElementById('kpiValidado').innerHTML=validado
document.getElementById('kpiRejeitado').innerHTML=rejeitado

let html=''

;(data||[]).forEach(a=>{

let classe='azul'

if(a.workflow_status==='VALIDADO'){
classe='verde'
}

if(a.workflow_status==='REJEITADO'){
classe='vermelho'
}

if(a.workflow_status==='RASCUNHO'){
classe=''
}

html+=`
<div class="card-analise">

<div class="card-analise-topo">

<div>

<div class="analise-titulo">
${a.workflow_status||'RASCUNHO'}
</div>

<div class="analise-subtitulo">
Validador: ${a.validado_por||'-'}
</div>

</div>

<div class="badge-status ${classe}">
${a.workflow_status||'-'}
</div>

</div>

<pre class="texto-analise-pre">
${a.analise_tecnica||'-'}
</pre>

<div class="analise-actions">

<button class="btn-padrao azul" onclick="alterarWorkflow(${a.id},'EM ANÁLISE')">
Em Análise
</button>

<button class="btn-padrao verde" onclick="alterarWorkflow(${a.id},'VALIDADO')">
Validar
</button>

<button class="btn-padrao vermelho" onclick="alterarWorkflow(${a.id},'REJEITADO')">
Rejeitar
</button>

</div>

</div>
`

})

document.getElementById('listaWorkflow').innerHTML=html

}

async function alterarWorkflow(id,status){
if(!USER_MONITORAMENTO){
return
}
let observacao=''
if(status==='REJEITADO'){
observacao=prompt('Informe a observação')||''
}
let payload={
workflow_status:status,
validado_por:USER_MONITORAMENTO.nome,
data_validacao:new Date().toISOString(),
observacao_validacao:observacao
}
let{error}=await client.from('monitoramento_analises').update(payload).eq('id',id)
if(error){
console.log(error)
return
}
await registrarLog('WORKFLOW '+status,'monitoramento_analises',id)
await carregarWorkflow()
}
