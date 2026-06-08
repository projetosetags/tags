/*=========================================================
050 WORD BASE QUEIMADAS
=========================================================*/
function baixarWordQueimadas(nome,conteudo){

let html=`
<html xmlns:o='urn:schemas-microsoft-com:office:office'
xmlns:w='urn:schemas-microsoft-com:office:word'
xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${nome}</title>
</head>
<body>
${conteudo}
</body>
</html>
`

let blob=new Blob(
['\ufeff',html],
{
type:'application/msword'
}
)

let url=URL.createObjectURL(blob)

let a=document.createElement('a')

a.href=url

a.download=nome+'.docx'

document.body.appendChild(a)

a.click()

document.body.removeChild(a)

URL.revokeObjectURL(url)

}
/*=========================================================
051 WORD DASHBOARD QUEIMADAS
=========================================================*/
function gerarWordDashboardQueimadas(){
let itens=document.getElementById('dashboardTotalItens')?.innerText||'0'
let subitens=document.getElementById('dashboardTotalSubitens')?.innerText||'0'
let media=document.getElementById('dashboardMediaGeral')?.innerText||'0%'
let html=`
<h1>DASHBOARD EXECUTIVO - QUEIMADAS 2026</h1>
<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%">
<tr>
<th>Itens Estratégicos</th>
<th>Subitens</th>
<th>Média Geral</th>
</tr>
<tr>
<td>${itens}</td>
<td>${subitens}</td>
<td>${media}</td>
</tr>
</table>
<br>
<p>Painel consolidado de acompanhamento técnico das ações relacionadas às queimadas 2026.</p>
`
baixarWordQueimadas('dashboard_queimadas',html)
}
/*=========================================================
052 WORD RESUMO QUEIMADAS
=========================================================*/
function gerarWordResumoQueimadas(){

let lista=[...(window.allData||[])]
lista.sort((a,b)=>
String(a.item||'')
.localeCompare(
String(b.item||'')
)
)
let linhas=lista.map(i=>`
<tr>
<td>${i.item||'-'}</td>
<td>${i.subitem||'-'}</td>
<td>${i.descricao||'-'}</td>
<td>${i.produto||'-'}</td>
<td>${getTotal(i)}%</td>
</tr>
`).join('')

let html=`
<h1>RESUMO EXECUTIVO - QUEIMADAS 2026</h1>

<table border="1" cellspacing="0" cellpadding="5">

<tr>
<th>Item</th>
<th>Subitem</th>
<th>Descrição</th>
<th>Produto</th>
<th>%</th>
</tr>

${linhas}

</table>
`

baixarWordQueimadas(
'resumo_queimadas',
html
)

}
/*=========================================================
053 WORD MONITORAMENTO QUEIMADAS
=========================================================*/
function gerarWordMonitoramentoQueimadas(){

let lista=[...(window.allData||[])]
lista.sort((a,b)=>
String(a.item||'')
.localeCompare(
String(b.item||'')
)
)
let linhas=lista.map(i=>`
<tr>
<td>${i.item||'-'}</td>
<td>${i.subitem||'-'}</td>
<td>${i.descricao||'-'}</td>
<td>${i.produto||'-'}</td>
<td>${i.responsavel||'-'}</td>
<td>${getTotal(i)}%</td>
</tr>
`).join('')

let html=`
<h1>MONITORAMENTO COMPLETO - QUEIMADAS 2026</h1>

<table border="1" cellspacing="0" cellpadding="5">

<tr>
<th>Item</th>
<th>Subitem</th>
<th>Descrição</th>
<th>Produto</th>
<th>Responsável</th>
<th>Total</th>
</tr>

${linhas}

</table>
`

baixarWordQueimadas(
'monitoramento_queimadas',
html
)

}

