
async function carregarAuditoriaCompleta(){

let{data,error}=await client
.from('monitoramento_logs')
.select('*')
.order('id',{ascending:false})
.limit(300)

if(error){
console.log(error)
return
}

let html=''

html+=`
<div class="timeline-box">

<div class="monitoramento-titulo">
🕓 Trilha Completa de Auditoria
</div>
`

;(data||[]).forEach(l=>{

let cor='#3b82f6'

if((l.acao||'').includes('EXCLUS')){
cor='#ef4444'
}

if((l.acao||'').includes('EDI')){
cor='#f59e0b'
}

if((l.acao||'').includes('NOVO')){
cor='#10b981'
}

html+=`
<div class="timeline-item">

<div class="timeline-dot" style="background:${cor};box-shadow:0 0 12px ${cor};"></div>

<div class="timeline-content">

<div class="timeline-title">
${l.acao||'-'}
</div>

<div class="timeline-date">
${formatarDataHora(l.created_at)}
</div>

<div class="timeline-text">

<div>
<b>Usuário:</b>
${l.usuario||'-'}
</div>

<div style="margin-top:6px;">
<b>Tabela:</b>
${l.tabela||'-'}
</div>

<div style="margin-top:6px;">
<b>Registro:</b>
${l.registro_id||'-'}
</div>

</div>

</div>

</div>
`

})

html+=`</div>`

document.getElementById('listaAuditoria').innerHTML=html

}
