/*=========================================================
001 QUEIMADAS BOTOES PDF WORD
=========================================================*/
function montarBotoesPDFQueimadas(tipo){
const botoes={
dashboard:[
'gerarPDFDashboardQueimadas',
'gerarWordDashboardQueimadas',
'PDF DASHBOARD',
'WORD DASHBOARD'
],
resumo:[
'gerarPDFResumoQueimadas',
'gerarWordResumoQueimadas',
'PDF RESUMO',
'WORD RESUMO'
],
monitoramento:[
'gerarPDFMonitoramentoQueimadas',
'gerarWordMonitoramentoQueimadas',
'PDF MONITORAMENTO',
'WORD MONITORAMENTO'
]
}
if(!botoes[tipo])return''
return`
<button onclick="${botoes[tipo][0]}()" class="btn-pdf">${botoes[tipo][2]}</button>
<button onclick="${botoes[tipo][1]}()" class="btn-pdf btn-word">${botoes[tipo][3]}</button>
`
}

