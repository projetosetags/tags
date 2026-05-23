/*=========================================================
001 QUEIMADAS BOTOES PDF WORD
=========================================================*/
function montarBotoesPDFQueimadas(tipo){

if(tipo==='dashboard'){
return `
<button onclick="gerarPDFDashboardQueimadas()" class="btn-pdf">
PDF DASHBOARD
</button>
<button onclick="gerarWordDashboardQueimadas()" class="btn-pdf btn-word">
WORD DASHBOARD
</button>
`
}

if(tipo==='resumo'){
return `
<button onclick="gerarPDFResumoQueimadas()" class="btn-pdf">
PDF RESUMO
</button>
<button onclick="gerarWordResumoQueimadas()" class="btn-pdf btn-word">
WORD RESUMO
</button>
`
}

if(tipo==='monitoramento'){
return `
<button onclick="gerarPDFMonitoramentoQueimadas()" class="btn-pdf">
PDF MONITORAMENTO
</button>
<button onclick="gerarWordMonitoramentoQueimadas()" class="btn-pdf btn-word">
WORD MONITORAMENTO
</button>
`
}

if(tipo==='graficos'){
return `
<button onclick="gerarPDFGraficosQueimadas()" class="btn-pdf">
PDF GRÁFICOS
</button>
<button onclick="gerarWordGraficosQueimadas()" class="btn-pdf btn-word">
WORD GRÁFICOS
</button>
`
}

if(tipo==='cumpridos'){
return `
<button onclick="gerarPDFCumpridosQueimadas()" class="btn-pdf">
PDF 100%
</button>
<button onclick="gerarWordCumpridosQueimadas()" class="btn-pdf btn-word">
WORD 100%
</button>
`
}

return ''

}
