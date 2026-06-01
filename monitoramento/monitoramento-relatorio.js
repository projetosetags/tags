async function gerarRelatorioCompleto(){

let{data:monitoramentos,error}=await client
.from('monitoramentos')
.select('*')
.order('titulo',{ascending:true})
if(error){
console.log(error)
return
}

let html=''

html+=`
<div class="relatorio-oficial">

<div class="relatorio-capa">

<div class="capa-topo">
TRIBUNAL DE CONTAS
</div>

<div class="capa-titulo">
RELATÓRIO TÉCNICO DE MONITORAMENTO
</div>

<div class="capa-subtitulo">
Painel Integrado de Auditoria e Controle
</div>

<div class="capa-data">
${new Date().toLocaleDateString('pt-BR')}
</div>

</div>
`

for(let m of(monitoramentos||[])){

html+=`
<div class="relatorio-secao">

<div class="relatorio-secao-titulo">
${m.titulo||'-'}
</div>

<div class="relatorio-grid">

<div>
<b>Órgão:</b>
${m.orgao||'-'}
</div>

<div>
<b>Processo:</b>
${m.processo||'-'}
</div>

<div>
<b>Acórdão:</b>
${m.acordao||'-'}
</div>

<div>
<b>Relator:</b>
${m.relator||'-'}
</div>

<div>
<b>Auditor:</b>
${m.auditor_responsavel||'-'}
</div>

<div>
<b>Status:</b>
${m.status||'-'}
</div>

</div>
`

let{data:itens}=await client
.from('monitoramento_itens')
.select('*')
.eq('monitoramento_id',m.id)
itens=ordenarDataGlobal(itens)

for(let item of(itens||[])){

html+=`
<div class="bloco-relatorio">

<div class="bloco-titulo">
ITEM ${item.item||'-'} • ${item.subitem||'-'}
</div>

<div class="bloco-conteudo">

<div class="bloco-campo">
<div class="bloco-label">ACHADO</div>
<div class="bloco-texto">
${item.achado||'-'}
</div>
</div>

<div class="bloco-campo">
<div class="bloco-label">CAUSA</div>
<div class="bloco-texto">
${item.causa||'-'}
</div>
</div>

<div class="bloco-campo">
<div class="bloco-label">EFEITO</div>
<div class="bloco-texto">
${item.efeito||'-'}
</div>
</div>

<div class="bloco-campo">
<div class="bloco-label">DELIBERAÇÃO</div>
<div class="bloco-texto">
${item.deliberacao||'-'}
</div>
</div>

<div class="bloco-campo">
<div class="bloco-label">AÇÃO DO GESTOR</div>
<div class="bloco-texto">
${item.acao_gestor||'-'}
</div>
</div>

<div class="bloco-campo">
<div class="bloco-label">PRODUTO ESPERADO</div>
<div class="bloco-texto">
${item.produto_esperado||'-'}
</div>
</div>

<div class="bloco-campo">
<div class="bloco-label">BENEFÍCIO ESPERADO</div>
<div class="bloco-texto">
${item.beneficio_esperado||'-'}
</div>
</div>

<div class="bloco-campo">
<div class="bloco-label">STATUS</div>
<div class="bloco-texto">
<span class="badge-status ${getClasseStatus(item.status)}">
${item.status||'-'}
</span>
</div>
</div>

<div class="bloco-campo">
<div class="bloco-label">PERCENTUAL</div>
<div class="bloco-texto">
${Number(item.percentual||0)}%
</div>
</div>

</div>
</div>
`

let{data:analises}=await client
.from('monitoramento_analises')
.select('*')
.eq('item_id',item.id)
.order('id',{ascending:false})

if(analises&&analises.length>0){

analises.forEach(a=>{

html+=`
<div class="bloco-relatorio">

<div class="bloco-titulo">
ANÁLISE TÉCNICA
</div>

<div class="texto-relatorio-pre">
${a.analise_tecnica||'-'}
</div>

</div>
`

})

}

let{data:resultados}=await client
.from('monitoramento_resultados')
.select('*')
.eq('item_id',item.id)

if(resultados&&resultados.length>0){

resultados.forEach(r=>{

html+=`
<div class="bloco-relatorio">

<div class="bloco-titulo">
RESULTADO DO MONITORAMENTO
</div>

<div class="bloco-conteudo">

<div class="bloco-campo">
<div class="bloco-label">
Situação Encontrada
</div>

<div class="bloco-texto">
${r.situacao_encontrada||'-'}
</div>
</div>

<div class="bloco-campo">
<div class="bloco-label">
Efeitos
</div>

<div class="bloco-texto">
${r.efeitos||'-'}
</div>
</div>

<div class="bloco-campo">
<div class="bloco-label">
Causas
</div>

<div class="bloco-texto">
${r.causas||'-'}
</div>
</div>

<div class="bloco-campo">
<div class="bloco-label">
Boas Práticas
</div>

<div class="bloco-texto">
${r.boas_praticas||'-'}
</div>
</div>

<div class="bloco-campo">
<div class="bloco-label">
Encaminhamento
</div>

<div class="bloco-texto">
${r.encaminhamento||'-'}
</div>
</div>

<div class="bloco-campo">
<div class="bloco-label">
Benefícios
</div>

<div class="bloco-texto">
${r.beneficios||'-'}
</div>
</div>

</div>

</div>
`

})

}

let{data:evidencias}=await client
.from('monitoramento_evidencias')
.select('*')
.eq('item_id',item.id)

if(evidencias&&evidencias.length>0){

html+=`
<div class="bloco-relatorio">

<div class="bloco-titulo">
EVIDÊNCIAS RELACIONADAS
</div>

<table class="tabela-evidencias-relatorio">

<thead>
<tr>
<th>Tipo</th>
<th>Documento</th>
<th>Status</th>
<th>Confiabilidade</th>
</tr>
</thead>

<tbody>
`

evidencias.forEach(e=>{

html+=`
<tr>
<td>${e.tipo_evidencia||'-'}</td>
<td>${e.numero_documento||'-'}</td>
<td>${e.status_validacao||'-'}</td>
<td>${e.confiabilidade||'-'}</td>
</tr>
`

})

html+=`
</tbody>
</table>
</div>
`

}

}

html+=`</div>`

}

html+=`</div>`

document.getElementById('previewRelatorio').innerHTML=html

abrirTela('relatorios')

}

function abrirModoImpressao(){

let html=document
.getElementById('previewRelatorio')
.innerHTML

document
.getElementById('conteudoImpressao')
.innerHTML=html

document
.getElementById('modalImpressao')
.classList.remove('hidden')

}

function fecharModalImpressao(){

document
.getElementById('modalImpressao')
.classList.add('hidden')

}
async function exportarWordMonitoramento(){

let conteudo=
document.getElementById('previewRelatorio')
.innerHTML

if(!conteudo){
alert('Gere o relatório primeiro')
return
}

let html=`
<html xmlns:o='urn:schemas-microsoft-com:office:office'
xmlns:w='urn:schemas-microsoft-com:office:word'
xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>Relatório</title>
</head>
<body>
${conteudo}
</body>
</html>
`

let blob=new Blob(
['\ufeff',html],
{type:'application/msword'}
)

let url=URL.createObjectURL(blob)

let a=document.createElement('a')

a.href=url

a.download=
'RELATORIO_MONITORAMENTO.doc'

document.body.appendChild(a)

a.click()

document.body.removeChild(a)

URL.revokeObjectURL(url)

}

/*=========================================================
024 MONITORAMENTO-RELATORIO.JS RESUMO EXECUTIVO
=========================================================*/
async function gerarResumoExecutivo(){

let box=document.getElementById('previewRelatorio')

if(!box){
return
}

let total=document.getElementById('kpiTotal')?.innerText||0
let exec=document.getElementById('kpiExecutadas')?.innerText||0
let parcial=document.getElementById('kpiParciais')?.innerText||0
let nao=document.getElementById('kpiNaoExecutadas')?.innerText||0
let andamento=document.getElementById('kpiAndamento')?.innerText||0

box.innerHTML=`
<div style="
background:#fff;
padding:40px;
border-radius:18px;
color:#111827;
font-family:Arial,sans-serif;
line-height:1.8;
">

<div style="
font-size:34px;
font-weight:900;
margin-bottom:30px;
">
RESUMO EXECUTIVO
</div>

<div style="
font-size:18px;
margin-bottom:20px;
">
O presente monitoramento técnico avaliou o cumprimento das ações, deliberações e medidas constantes dos planos estratégicos monitorados.
</div>

<div style="
display:grid;
grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
gap:18px;
margin-top:30px;
">

<div style="background:#ecfdf5;padding:20px;border-radius:14px;">
<div style="font-size:14px;font-weight:700;">
EXECUTADAS
</div>
<div style="font-size:42px;font-weight:900;color:#166534;">
${exec}
</div>
</div>

<div style="background:#fef3c7;padding:20px;border-radius:14px;">
<div style="font-size:14px;font-weight:700;">
PARCIAIS
</div>
<div style="font-size:42px;font-weight:900;color:#92400e;">
${parcial}
</div>
</div>

<div style="background:#fee2e2;padding:20px;border-radius:14px;">
<div style="font-size:14px;font-weight:700;">
NÃO EXECUTADAS
</div>
<div style="font-size:42px;font-weight:900;color:#991b1b;">
${nao}
</div>
</div>

<div style="background:#dbeafe;padding:20px;border-radius:14px;">
<div style="font-size:14px;font-weight:700;">
EM ANDAMENTO
</div>
<div style="font-size:42px;font-weight:900;color:#1d4ed8;">
${andamento}
</div>
</div>

</div>

<div style="
margin-top:40px;
font-size:17px;
">
Foram analisados <b>${total}</b> itens monitorados, considerando critérios de efetividade, criticidade, evidências, resultados institucionais e conformidade com os planos de ação apresentados pelos jurisdicionados.
</div>

</div>
`

}

/*=========================================================
025 MONITORAMENTO-RELATORIO.JS PLANO MONITORAMENTO
=========================================================*/
async function gerarPlanoMonitoramento(){

let box=document.getElementById('previewRelatorio')

box.innerHTML=`
<div style="
background:#fff;
padding:40px;
border-radius:18px;
color:#111827;
font-family:Arial;
">

<div style="
font-size:32px;
font-weight:900;
margin-bottom:30px;
">
PLANO DE MONITORAMENTO
</div>

<div style="
line-height:2;
font-size:16px;
">
• Objetivo Geral do Monitoramento<br>
• Metodologia Aplicada<br>
• Critérios Utilizados<br>
• Órgãos Monitorados<br>
• Itens Prioritários<br>
• Critérios de Risco e Criticidade<br>
• Cronograma de Acompanhamento<br>
• Equipe Técnica Responsável<br>
• Evidências Necessárias<br>
• Resultados Esperados
</div>

</div>
`

}

/*=========================================================
026 MONITORAMENTO-RELATORIO.JS MATRIZ PLANEJAMENTO
=========================================================*/
async function gerarMatrizPlanejamento(){

let box=document.getElementById('previewRelatorio')

box.innerHTML=`
<div style="
background:#fff;
padding:40px;
border-radius:18px;
color:#111827;
font-family:Arial;
">

<div style="
font-size:32px;
font-weight:900;
margin-bottom:30px;
">
MATRIZ DE PLANEJAMENTO
</div>

<table style="
width:100%;
border-collapse:collapse;
font-size:14px;
">

<tr style="background:#1e3a8a;color:#fff;">

<th style="padding:12px;border:1px solid #d1d5db;">
Questão
</th>

<th style="padding:12px;border:1px solid #d1d5db;">
Critério
</th>

<th style="padding:12px;border:1px solid #d1d5db;">
Procedimento
</th>

<th style="padding:12px;border:1px solid #d1d5db;">
Fonte
</th>

</tr>

<tr>
<td style="padding:12px;border:1px solid #d1d5db;">Cumprimento das deliberações</td>
<td style="padding:12px;border:1px solid #d1d5db;">Plano de ação</td>
<td style="padding:12px;border:1px solid #d1d5db;">Análise documental</td>
<td style="padding:12px;border:1px solid #d1d5db;">Sistema TAG</td>
</tr>

</table>

</div>
`

}
/*=========================================================
021 MONITORAMENTO-RELATORIO.JS ANALISE SEPARADA
=========================================================*/
async function gerarAnaliseSeparada(){

let box=document.getElementById('previewRelatorio')

if(!box){
return
}

let html=''

html+=`
<div style="padding:28px;color:#fff;">
<h2 style="font-size:24px;font-weight:800;margin-bottom:20px;">
ANÁLISE TÉCNICA SEPARADA
</h2>
`

let cards=document.querySelectorAll('#cardsDashboard .card-alerta-mini')

cards.forEach(card=>{

let titulo=card.querySelector('.card-alerta-titulo')?.innerText||'-'

let info=card.querySelector('.card-alerta-info')?.innerText||'-'

html+=`
<div style="background:#0f172a;border:1px solid #3b82f6;border-radius:14px;padding:18px;margin-bottom:18px;">
<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:10px;">
${titulo}
</div>
<div style="font-size:14px;color:#e2e8f0;line-height:1.8;">
${info}
</div>
</div>
`

})

html+=`</div>`

box.innerHTML=html

}

/*=========================================================
022 MONITORAMENTO-RELATORIO.JS MATRIZ RESULTADOS
=========================================================*/
async function gerarMatrizResultados(){

let box=document.getElementById('previewRelatorio')

if(!box){
return
}

box.innerHTML=`
<div style="padding:28px;color:#fff;">

<h2 style="font-size:24px;font-weight:800;margin-bottom:20px;">
MATRIZ DE RESULTADOS
</h2>

<table style="width:100%;border-collapse:collapse;">

<tr style="background:#1d4ed8;">
<th style="padding:10px;border:1px solid #334155;">Indicador</th>
<th style="padding:10px;border:1px solid #334155;">Resultado</th>
<th style="padding:10px;border:1px solid #334155;">Situação</th>
</tr>

<tr>
<td style="padding:10px;border:1px solid #334155;">Itens Executados</td>
<td style="padding:10px;border:1px solid #334155;">${document.getElementById('kpiExecutadas')?.innerText||0}</td>
<td style="padding:10px;border:1px solid #334155;">Adequado</td>
</tr>

<tr>
<td style="padding:10px;border:1px solid #334155;">Itens Parciais</td>
<td style="padding:10px;border:1px solid #334155;">${document.getElementById('kpiParciais')?.innerText||0}</td>
<td style="padding:10px;border:1px solid #334155;">Atenção</td>
</tr>

<tr>
<td style="padding:10px;border:1px solid #334155;">Itens Não Executados</td>
<td style="padding:10px;border:1px solid #334155;">${document.getElementById('kpiNaoExecutadas')?.innerText||0}</td>
<td style="padding:10px;border:1px solid #334155;">Crítico</td>
</tr>

</table>

</div>
`

}

/*=========================================================
023 MONITORAMENTO-RELATORIO.JS PRIMEIRO MONITORAMENTO
VERSÃO PROFISSIONAL FORMATADA
=========================================================*/
async function gerarPrimeiroMonitoramento(){

let box=document.getElementById('previewRelatorio')

if(!box){
return
}

box.innerHTML=`
<div style="
padding:40px;
color:#fff;
font-size:24px;
font-weight:900;
">
GERANDO MATRIZ DE MONITORAMENTO...
</div>
`

let origem='TODAS'
let filtro=document.getElementById('filtroOrigem')

if(filtro){
origem=filtro.value||'TODAS'
}

let query=client
.from('monitoramento_itens')
.select('*')
.order('item',{ascending:true})

if(origem!=='TODAS'){
query=query.eq('origem',origem)
}

let{data,error}=await query

if(error){
console.log(error)

box.innerHTML=`
<div style="
padding:40px;
color:#fff;
font-size:22px;
font-weight:700;
">
ERRO AO GERAR MATRIZ
</div>
`
return
}

data=data||[]

let html=''

let evidenciasMap={}
let{data:evidenciasTodas}=await client
.from('monitoramento_evidencias_lancadas')
.select('*')

;(evidenciasTodas||[]).forEach(e=>{

if(!evidenciasMap[e.item_id]){
evidenciasMap[e.item_id]=[]
}

evidenciasMap[e.item_id].push(e)

})

html+=`
<div style="
background:#f4f4f4;
padding:40px;
font-family:Arial,sans-serif;
color:#000;
line-height:1.5;
">

<div style="
text-align:center;
font-size:34px;
font-weight:900;
margin-bottom:34px;
color:#111827;
">
MATRIZ - PRIMEIRO MONITORAMENTO
</div>

<div style="
background:#fff;
border:1px solid #d1d5db;
padding:24px;
border-radius:14px;
margin-bottom:34px;
box-shadow:0 4px 10px rgba(0,0,0,.06);
">

<div style="margin-bottom:10px;">
<b>TC:</b> TCE-RO
</div>

<div style="
display:grid;
grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
gap:18px;
margin-bottom:18px;
">

<div>

<div style="
font-weight:800;
margin-bottom:6px;
">
Órgão / Entidade
</div>

<input
value="${origem}"
style="
width:100%;
padding:10px 14px;
border-radius:10px;
border:1px solid #cbd5e1;
background:#fff;
font-size:14px;
font-weight:700;
"
readonly>

</div>

<div>

<div style="
font-weight:800;
margin-bottom:6px;
">
Acórdão em Monitoramento
</div>

<input
value="${
origem==='SEDAM'
?'APL-TC 00170/25'
:origem==='SEPAT'
?'APL-TC 00215/25'
:'APL-TC 00089/26'
}"
style="
width:100%;
padding:10px 14px;
border-radius:10px;
border:1px solid #cbd5e1;
background:#fff;
font-size:14px;
font-weight:700;
"
readonly>

</div>

<div>

<div style="
font-weight:800;
margin-bottom:6px;
">
Processo(s)
</div>

<input
value="${
origem==='SEDAM'
?'PCe 01702/22 e 04340/25'
:origem==='SEPAT'
?'PCe 01111/24'
:'PCe 02020/26'
}"
style="
width:100%;
padding:10px 14px;
border-radius:10px;
border:1px solid #cbd5e1;
background:#fff;
font-size:14px;
font-weight:700;
"
readonly>

</div>

</div>

<div style="
margin-top:18px;
font-weight:700;
font-size:14px;
">
Relator: Conselheiro-Substituto FRANCISCO JÚNIOR FERREIRA DA SILVA
</div>

</div>

<div style="
display:flex;
justify-content:space-between;
align-items:center;
flex-wrap:wrap;
gap:14px;
margin-bottom:24px;
">

<div style="
font-size:22px;
font-weight:900;
color:#111827;
">
TAG – ${origem}
</div>

<div style="
background:#fff;
padding:12px 18px;
border-radius:12px;
border:1px solid #d1d5db;
font-size:15px;
font-weight:800;
">
Subitens analisados: ${data.length}
</div>

</div>
`

for(let[index,i]of data.entries()){

let numero=String(index+1).padStart(3,'0')
let evidencias=evidenciasMap[i.id]||[]
let evidenciaSalva=evidencias[0]||null
let corStatus='#facc15'

if((i.status||'').includes('EXECUTADA')){
corStatus='#86efac'
}

if((i.status||'').includes('NÃO')){
corStatus='#fca5a5'
}

if((i.status||'').includes('ANDAMENTO')){
corStatus='#93c5fd'
}

html+=`
<div style="
background:#fff;
border-radius:14px;
overflow:hidden;
margin-bottom:30px;
box-shadow:0 8px 24px rgba(0,0,0,.08);
border:1px solid #d1d5db;
">

<div style="
background:#166534;
color:#fff;
padding:12px 18px;
font-size:18px;
font-weight:900;
display:flex;
justify-content:space-between;
align-items:center;
">

<div>
${numero} • ITEM ${i.item||'-'} • SUBITEM ${i.subitem||'-'}
</div>

<div style="
background:#fff;
color:#166534;
padding:6px 12px;
border-radius:999px;
font-size:12px;
font-weight:900;
">
${Number(i.percentual||0)}%
</div>

</div>

<table style="
width:100%;
border-collapse:collapse;
font-size:13px;
">

<tr>
<td style="
background:#dcfce7;
border:1px solid #d1d5db;
padding:10px;
font-weight:800;
width:180px;
">
Descrição da Ação
</td>

<td style="
border:1px solid #d1d5db;
padding:12px;
font-weight:700;
">
${i.descricao||i.deliberacao||'-'}
</td>
</tr>

<tr>
<td style="
background:#dcfce7;
border:1px solid #d1d5db;
padding:10px;
font-weight:800;
">
Deliberação
</td>

<td style="
border:1px solid #d1d5db;
padding:12px;
">
${i.deliberacao||'-'}
</td>
</tr>

<tr>
<td style="
background:#dcfce7;
border:1px solid #d1d5db;
padding:10px;
font-weight:800;
">
Plano de Ação / Ação Proposta
</td>

<td style="
border:1px solid #d1d5db;
padding:12px;
">
${i.acao_gestor||'-'}
</td>
</tr>

<tr>
<td style="
background:#dcfce7;
border:1px solid #d1d5db;
padding:10px;
font-weight:800;
">
Produto Entregue
</td>

<td style="
border:1px solid #d1d5db;
padding:12px;
">
${i.produto||i.produto_esperado||'-'}
</td>
</tr>

<tr>
<td style="
background:#dcfce7;
border:1px solid #d1d5db;
padding:10px;
font-weight:800;
">
Status da Ação
</td>

<td style="
border:1px solid #d1d5db;
padding:12px;
background:${corStatus};
font-weight:900;
">
${i.status||'-'}
</td>
</tr>

<tr>
<td style="
background:#dcfce7;
border:1px solid #d1d5db;
padding:10px;
font-weight:800;
">
Causa
</td>

<td style="
border:1px solid #d1d5db;
padding:12px;
white-space:pre-wrap;
">
${i.causa||'-'}
</td>
</tr>

<tr>
<td style="
background:#dcfce7;
border:1px solid #d1d5db;
padding:10px;
font-weight:800;
">
Efeito
</td>

<td style="
border:1px solid #d1d5db;
padding:12px;
white-space:pre-wrap;
">
${i.efeito||'-'}
</td>
</tr>

<tr>
<td style="
background:#dcfce7;
border:1px solid #d1d5db;
padding:10px;
font-weight:800;
">
Benefício Esperado
</td>

<td style="
border:1px solid #d1d5db;
padding:12px;
">
${i.beneficio_esperado||'-'}
</td>
</tr>

<tr>
<td style="
background:#dcfce7;
border:1px solid #d1d5db;
padding:10px;
font-weight:800;
">
Prazo
</td>

<td style="
border:1px solid #d1d5db;
padding:12px;
font-weight:700;
">
${
i.prazo
?new Date(i.prazo).toLocaleDateString('pt-BR').replace(/\//g,'-')
:'-'
}
</td>
</tr>

<tr>
<td style="
background:#dcfce7;
border:1px solid #d1d5db;
padding:10px;
font-weight:800;
">
Criticidade
</td>

<td style="
border:1px solid #d1d5db;
padding:12px;
font-weight:900;
">
${
Number(i.percentual||0)<30
?'ALTA'
:Number(i.percentual||0)<70
?'MÉDIA'
:'BAIXA'
}
</td>
</tr>

<tr>
<td style="
background:#dcfce7;
border:1px solid #d1d5db;
padding:10px;
font-weight:800;
vertical-align:top;
">
Evidências
</td>

<td style="
border:1px solid #d1d5db;
padding:18px;
background:#f9fafb;
">

${
evidenciaSalva
?
`
<div style="
background:#fff;
border:1px solid #d1d5db;
border-radius:12px;
padding:18px;
">

<div style="
font-size:15px;
font-weight:900;
margin-bottom:16px;
color:#111827;
">
EVIDÊNCIAS LANÇADAS
</div>

<div style="
background:#f8fafc;
border:1px solid #d1d5db;
border-radius:10px;
padding:14px;
margin-bottom:14px;
line-height:1.8;
font-size:13px;
">

<b>Tipos Selecionados:</b><br>
${evidenciaSalva.evidencias||'-'}

</div>

<div style="
background:#fff;
border:1px solid #d1d5db;
border-radius:10px;
padding:14px;
line-height:1.8;
font-size:13px;
white-space:pre-wrap;
">

<b>Descrição / Observações:</b><br><br>

${evidenciaSalva.descricao||'-'}

</div>

</div>
`
:
`
<div style="
padding:22px;
border:2px dashed #cbd5e1;
border-radius:12px;
background:#fff;
color:#64748b;
font-weight:700;
text-align:center;
">
NENHUMA EVIDÊNCIA LANÇADA NO PAINEL EVIDÊNCIAS
</div>
`
}

</td>
</tr>

</table>

</div>
`

}

html+=`
<div style="
background:#fff;
border-radius:14px;
padding:28px;
margin-top:30px;
border:1px solid #d1d5db;
box-shadow:0 4px 12px rgba(0,0,0,.05);
">

<div style="
font-size:22px;
font-weight:900;
margin-bottom:20px;
">
GLOSSÁRIO
</div>

<div style="
font-size:13px;
line-height:2;
">

<b>Deliberação:</b>Descrição das atividades / ações a serem desenvolvidas ao longo dos prazos descritos.<br>
<b>N. Subitem:</b>Numeração dos subitens descritos no Plano de Ação.<br>
<b>Plano de Ação/Ação Proposta:</b>Descrição da ação que o gestor irá implementar para resolver o problema.<br>
<b>Produto a ser entregue:</b>Produto gerado a partir da ação do gestor para cumprimento da deliberação.<br>
<b>Status da Ação:</b>Descrever se está EM ANDAMENTO, EXECUTADO ou PARCIALMENTE EXECUTADO.<br>
<b>%:</b>Percentual de execução da atividade proposta.<br>
<b>Causas:</b>Evolução das causas identificadas na auditoria monitorada.<br>
<b>Efeitos:</b>Consequências identificadas na auditoria monitorada.<br>
<b>Benefício esperado:</b>Mensuração qualitativa e quantitativa dos benefícios obtidos.<br>
<b>Prazo:</b>Descrever no formato dd-mm-aaaa.<br>
<b>Criticidade:</b>Descrever se Alta, Média ou Baixa.<br>
<b>Evidências:</b>Documentos, fotos, extratos, inspeções ou qualquer outro elemento comprobatório.<br>

</div>

</div>

<div style="
margin-top:30px;
padding:22px;
background:#fff8dc;
border-left:8px solid #ca8a04;
border-radius:12px;
font-size:13px;
line-height:1.8;
">

<b>Observação:</b>

O presente relatório é gerado a partir dos dados inseridos no sistema TAG-2026, integrando informações do Supabase e do repositório GitHub (projetosetags/tags). Dados preliminares sujeitos a validação posterior pela auditoria técnica.

</div>

</div>
`

box.innerHTML=html

}

console.log('monitoramento-relatorio.js carregado')
/*=========================================================
119 MONITORAMENTO-RELATORIO.JS GERAR PLANO MONITORAMENTO WORD
=========================================================*/
async function gerarPlanoMonitoramentoWord(){

let origem=(document.getElementById('filtroOrigem')?.value||'SEDAM').toUpperCase()

let assunto=''

if(origem==='SEDAM'){
assunto='Monitoramento Ambiental, Governança Ambiental, Execução das Deliberações e Avaliação da Implementação das Ações Estratégicas da SEDAM – Exercício 2026.'
}

if(origem==='SEPAT'){
assunto='Regularização Fundiária, Gestão Patrimonial, Governança Institucional e Avaliação da Execução das Deliberações da SEPAT – Exercício 2026.'
}

if(origem==='QUEIMADAS'){
assunto='Avaliação das ações de prevenção e combate às queimadas e Monitoramento Ambiental, Queimadas, Governança Climática e Respostas Institucionais – Exercício 2026.'
}

let unidade=
monitoramentoInfo?.orgao||
monitoramentoInfo?.unidade||
''

if(!unidade){

if(origem==='SEDAM'){
unidade='Secretaria de Estado do Desenvolvimento Ambiental - SEDAM'
}

if(origem==='SEPAT'){
unidade='Secretaria de Estado de Patrimônio e Regularização Fundiária - SEPAT'
}

if(origem==='QUEIMADAS'){
unidade='Governo do Estado, Municípios e Órgãos Envolvidos nas Ações de Queimadas'
}

}

let relatorOptions=`
<option>Conselheiro Edilson de Sousa Silva</option>
<option>Conselheiro Francisco Carvalho da Silva</option>
<option>Conselheiro José Euler Potyguara Pereira de Mello</option>
<option>Conselheiro Wilber Carlos dos Santos Coimbra</option>
<option>Conselheiro Paulo Curi Neto</option>
<option>Conselheiro-Substituto Francisco Júnior Ferreira da Silva</option>
<option>Conselheiro-Substituto Omar Pires Dias</option>
`

let tabelaOrigem='monitoramento_itens'

if(origem==='SEDAM'){
tabelaOrigem='deliberacoes'
}

if(origem==='SEPAT'){
tabelaOrigem='sepat_deliberacoes'
}

let monitoramentoInfo=null

if(MONITORAMENTO_ATUAL){

let{data:monitoramentoData,error:monitoramentoError}=await client
.from('monitoramentos')
.select('*')
.eq('id',MONITORAMENTO_ATUAL)
.single()

if(monitoramentoError){
console.log(monitoramentoError)
}

monitoramentoInfo=monitoramentoData||null

}

let{data,error}=await client
.from(tabelaOrigem)
.select('*')

if(error){
console.log(error)
alert('Erro ao gerar plano')
return
}

data=(data||[])

let processo=
monitoramentoInfo?.processo||
document.getElementById('processoMonitoramento')?.value||
document.getElementById('processo')?.value||
'-'

let relator=
monitoramentoInfo?.relator||
document.getElementById('relatorMonitoramento')?.value||
document.getElementById('relator')?.value||
'-'

let auditor=
monitoramentoInfo?.auditor||
monitoramentoInfo?.auditor_responsavel||
document.getElementById('auditorMonitoramento')?.value||
document.getElementById('auditor')?.value||
'-'

let acordao=
monitoramentoInfo?.acordao||
document.getElementById('acordaoMonitoramento')?.value||
document.getElementById('acordao')?.value||
'-'

let criticidade=
monitoramentoInfo?.criticidade||
document.getElementById('criticidadeMonitoramento')?.value||
document.getElementById('criticidade')?.value||
'-'

let descricaoMonitoramento=
monitoramentoInfo?.descricao||
monitoramentoInfo?.descricao_origem||
document.getElementById('descricaoMonitoramento')?.value||
document.getElementById('descricao')?.value||
'-'

let assuntosMonitoramento=
monitoramentoInfo?.assuntos||
monitoramentoInfo?.assunto||
document.getElementById('assuntoMonitoramento')?.value||
document.getElementById('assunto')?.value||
assunto

function parseSubitemPlano(s){

let txt=String(s||'0')

let partes=txt.split('.')

return partes.map(n=>parseInt(n)||0)

}

data.sort((a,b)=>{

let pa=parseSubitemPlano(a.subitem)
let pb=parseSubitemPlano(b.subitem)

let tam=Math.max(pa.length,pb.length)

for(let i=0;i<tam;i++){

let na=pa[i]||0
let nb=pb[i]||0

if(na!==nb){
return na-nb
}

}

return 0

})

let linhas=''

;(data||[]).forEach(i=>{

let descricaoItem=
i.descricaoitem||
i.item_descricao||
i.descricao_item||
i.titulo_item||
'-'

let descricaoSubitem=
i.descricao||
i.deliberacao||
i.subitem_descricao||
'-'

let produto=
i.produto||
i.produto_esperado||
'-'

linhas+=`
<tr>

<td style="
border:1px solid #000;
padding:6px;
font-size:10px;
font-weight:800;
text-align:center;
vertical-align:top;
width:70px;
">
${i.item||'-'}
</td>

<td style="
border:1px solid #000;
padding:6px;
font-size:10px;
line-height:1.35;
vertical-align:top;
white-space:normal;
word-break:break-word;
width:220px;
">
${descricaoItem}
</td>

<td style="
border:1px solid #000;
padding:6px;
font-size:10px;
font-weight:800;
text-align:center;
vertical-align:top;
width:90px;
">
${i.subitem||'-'}
</td>

<td style="
border:1px solid #000;
padding:6px;
font-size:10px;
line-height:1.35;
vertical-align:top;
white-space:normal;
word-break:break-word;
width:320px;
">
${descricaoSubitem}
</td>

<td style="
border:1px solid #000;
padding:6px;
font-size:10px;
line-height:1.35;
vertical-align:top;
white-space:normal;
word-break:break-word;
width:220px;
">
${produto}
</td>

<td contenteditable="true" style="
border:1px solid #000;
padding:6px;
font-size:10px;
line-height:1.35;
vertical-align:top;
background:#fffef5;
width:220px;
min-width:220px;
">
</td>

<td style="
border:1px solid #000;
padding:6px;
font-size:10px;
font-weight:900;
text-align:center;
vertical-align:top;
width:120px;
background:${
(i.status||'').includes('EXECUTADA')
?'#dcfce7'
:
(i.status||'').includes('PARCIAL')
?'#fef3c7'
:
(i.status||'').includes('NÃO')
?'#fee2e2'
:'#dbeafe'
};
">
${i.status||'-'}
</td>

</tr>
`

})

let html=`
<div id="planoMonitoramentoWord" style="
background:#fff;
padding:18px;
color:#000;
font-family:Arial,sans-serif;
width:100%;
overflow:auto;
">

<div style="
text-align:center;
font-size:22px;
font-weight:900;
margin-bottom:24px;
">
PLANO DE MONITORAMENTO
</div>

<table style="
width:100%;
border-collapse:collapse;
margin-bottom:24px;
font-size:13px;
">

<tr>
<td style="border:1px solid #000;padding:10px;font-weight:700;width:280px;">
PROCESSO:
</td>
<td style="border:1px solid #000;padding:10px;">
${processo}
</td>
</tr>

<tr>
<td style="border:1px solid #000;padding:10px;font-weight:700;">
UNIDADE(S) JURISDICIONADA(S):
</td>
<td style="border:1px solid #000;padding:10px;">
${unidade}
</td>
</tr>

<tr>
<td style="border:1px solid #000;padding:10px;font-weight:700;">
CATEGORIA:
</td>
<td style="border:1px solid #000;padding:10px;">
Auditoria e Inspeção
</td>
</tr>

<tr>
<td style="border:1px solid #000;padding:10px;font-weight:700;">
SUBCATEGORIA:
</td>
<td style="border:1px solid #000;padding:10px;">
Monitoramento
</td>
</tr>

<tr>
<td style="border:1px solid #000;padding:10px;font-weight:700;">
ASSUNTO(S):
</td>
<td style="border:1px solid #000;padding:10px;line-height:1.6;">
${assuntosMonitoramento}
</td>
</tr>

<tr>
<td style="border:1px solid #000;padding:10px;font-weight:700;">
RESPONSÁVEL(IS) PELOS ÓRGÃOS/ENTIDADES:
</td>
<td style="border:1px solid #000;padding:10px;">
XXXXX - CPF n.***.xxx.xxx-** – Prefeito Municipal ou Secretário de Estado
</td>
</tr>

<tr>
<td style="border:1px solid #000;padding:10px;font-weight:700;">RELATOR:</td>
<td style="border:1px solid #000;padding:10px;">${relator}</td>
</tr>

<tr>
<td style="border:1px solid #000;padding:10px;font-weight:700;">AUDITOR:</td>
<td style="border:1px solid #000;padding:10px;">${auditor}</td>
</tr>

<tr>
<td style="border:1px solid #000;padding:10px;font-weight:700;">ACÓRDÃO:</td>
<td style="border:1px solid #000;padding:10px;">${acordao}</td>
</tr>

<tr>
<td style="border:1px solid #000;padding:10px;font-weight:700;">CRITICIDADE:</td>
<td style="border:1px solid #000;padding:10px;">${criticidade}</td>
</tr>

<tr>
<td style="border:1px solid #000;padding:10px;font-weight:700;">DESCRIÇÃO:</td>
<td style="border:1px solid #000;padding:10px;line-height:1.6;">${descricaoMonitoramento}</td>
</tr>

</table>

<table style="
width:100%;
border-collapse:collapse;
font-size:10px;
table-layout:fixed;
word-break:break-word;
">

<thead>

<tr>

<th style="
border:1px solid #000;
padding:10px;
background:#dbeafe;
min-width:90px;
">
Nr. Item
</th>

<th style="
border:1px solid #000;
padding:10px;
background:#dbeafe;
min-width:260px;
">
Item
</th>

<th style="
border:1px solid #000;
padding:10px;
background:#dbeafe;
min-width:110px;
">
Nr. Subitem
</th>

<th style="
border:1px solid #000;
padding:10px;
background:#dbeafe;
min-width:320px;
">
Subitem
</th>

<th style="
border:1px solid #000;
padding:10px;
background:#dbeafe;
min-width:260px;
">
Produto a Ser Entregue
</th>

<th style="
border:1px solid #000;
padding:10px;
background:#dbeafe;
min-width:260px;
">
Produto Entregue
</th>

<th style="
border:1px solid #000;
padding:10px;
background:#dbeafe;
min-width:160px;
">
Status da Ação
</th>

</tr>

</thead>

<tbody>

${linhas}

</tbody>

</table>

</div>
`

let preview=document.getElementById('previewRelatorio')

if(preview){

preview.innerHTML=html

preview.style.background='#fff'

preview.style.color='#000'

}

}
