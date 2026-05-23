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
018 MONITORAMENTO-RELATORIO.JS RESUMO EXECUTIVO
=========================================================*/
async function gerarResumoExecutivo(){

let box=document.getElementById('previewRelatorio')

if(!box){
return
}

box.innerHTML=`
<div style="padding:28px;color:#fff;font-size:15px;line-height:1.8;">
<h2 style="font-size:24px;font-weight:800;margin-bottom:20px;color:#fff;">
RESUMO EXECUTIVO
</h2>

<p>
O presente monitoramento teve por objetivo avaliar o cumprimento das deliberações constantes dos processos acompanhados pela equipe técnica.
</p>

<p>
Foram analisados <b>${document.getElementById('kpiTotal')?.innerText||0}</b> itens monitorados.
</p>

<p>
<b>RESULTADOS:</b>
</p>

<ul style="margin-left:24px;">
<li>EXECUTADAS: ${document.getElementById('kpiExecutadas')?.innerText||0}</li>
<li>PARCIALMENTE EXECUTADAS: ${document.getElementById('kpiParciais')?.innerText||0}</li>
<li>NÃO EXECUTADAS: ${document.getElementById('kpiNaoExecutadas')?.innerText||0}</li>
<li>EM ANDAMENTO: ${document.getElementById('kpiAndamento')?.innerText||0}</li>
</ul>

<p>
Persistem fragilidades relevantes na implementação das medidas monitoradas, exigindo continuidade das ações de controle e acompanhamento técnico.
</p>

<p>
Recomenda-se a continuidade do monitoramento dos itens pendentes, especialmente aqueles classificados como parcialmente executados ou não executados.
</p>

</div>
`

}


/*=========================================================
019 MONITORAMENTO-RELATORIO.JS PLANO MONITORAMENTO
=========================================================*/
async function gerarPlanoMonitoramento(){

let box=document.getElementById('previewRelatorio')

if(!box){
return
}

box.innerHTML=`
<div style="padding:28px;color:#fff;line-height:1.8;">

<h2 style="font-size:24px;font-weight:800;margin-bottom:18px;">
PLANO DE MONITORAMENTO
</h2>

<p>
• Objetivo Geral do Monitoramento
</p>

<p>
• Escopo da Fiscalização
</p>

<p>
• Metodologia Aplicada
</p>

<p>
• Critérios de Avaliação
</p>

<p>
• Cronograma de Execução
</p>

<p>
• Equipe Técnica Responsável
</p>

<p>
• Matriz de Riscos
</p>

<p>
• Benefícios Esperados
</p>

</div>
`

}


/*=========================================================
020 MONITORAMENTO-RELATORIO.JS MATRIZ PLANEJAMENTO
=========================================================*/
async function gerarMatrizPlanejamento(){

let box=document.getElementById('previewRelatorio')

if(!box){
return
}

box.innerHTML=`
<div style="padding:28px;color:#fff;line-height:1.8;">

<h2 style="font-size:24px;font-weight:800;margin-bottom:18px;">
MATRIZ DE PLANEJAMENTO DO MONITORAMENTO
</h2>

<table style="width:100%;border-collapse:collapse;">

<tr style="background:#2563eb;">
<th style="padding:10px;border:1px solid #334155;">Questão</th>
<th style="padding:10px;border:1px solid #334155;">Critério</th>
<th style="padding:10px;border:1px solid #334155;">Fonte</th>
<th style="padding:10px;border:1px solid #334155;">Procedimento</th>
</tr>

<tr>
<td style="padding:10px;border:1px solid #334155;">Cumprimento das deliberações</td>
<td style="padding:10px;border:1px solid #334155;">Normativos</td>
<td style="padding:10px;border:1px solid #334155;">Processos</td>
<td style="padding:10px;border:1px solid #334155;">Análise documental</td>
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
=========================================================*/
async function gerarPrimeiroMonitoramento(){

let box=document.getElementById('previewRelatorio')

if(!box){
return
}

box.innerHTML=`
<div style="padding:28px;color:#fff;line-height:1.9;">

<h2 style="font-size:24px;font-weight:800;margin-bottom:20px;">
MATRIZ PRIMEIRO MONITORAMENTO
</h2>

<p>
1. Identificação do objeto monitorado
</p>

<p>
2. Deliberações selecionadas
</p>

<p>
3. Situação atual encontrada
</p>

<p>
4. Evidências apresentadas
</p>

<p>
5. Avaliação técnica preliminar
</p>

<p>
6. Benefícios esperados
</p>

<p>
7. Encaminhamentos propostos
</p>

</div>
`

}

/*=========================================================
023 MONITORAMENTO-RELATORIO.JS PRIMEIRO MONITORAMENTO
=========================================================*/
async function gerarPrimeiroMonitoramento(){

let box=document.getElementById('previewRelatorio')

if(!box){
return
}

box.innerHTML=`
<div style="padding:40px;color:#fff;font-size:22px;font-weight:800;">
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
<div style="padding:40px;color:#fff;">
ERRO AO GERAR MATRIZ
</div>
`

return
}

data=data||[]

let html=''

html+=`
<div style="
background:#fff;
color:#000;
padding:40px;
font-family:Arial,sans-serif;
">

<div style="
text-align:center;
font-size:34px;
font-weight:900;
margin-bottom:40px;
">
MATRIZ - PRIMEIRO MONITORAMENTO
</div>

<div style="margin-bottom:12px;">
<b>TC:</b> TCE-RO
</div>

<div style="margin-bottom:12px;">
<b>Órgão / Entidade:</b> ${origem}
</div>

<div style="margin-bottom:12px;">
<b>Acórdão em Monitoramento:</b>
Acórdão APL-TC n. 00170/25
</div>

<div style="margin-bottom:12px;">
<b>Processos:</b>
PCe n. 01702/22 e PCe n. 04340/25
</div>

<div style="margin-bottom:20px;">
<b>Relator:</b>

<select style="
padding:8px;
border:1px solid #ccc;
border-radius:8px;
margin-left:10px;
">

<option>
Conselheiro WILBER CARLOS DOS SANTOS COIMBRA – PRESIDENTE
</option>

<option>
Conselheiro PAULO CURI NETO
</option>

<option>
Conselheiro EDILSON DE SOUSA SILVA
</option>

<option>
Conselheiro JAILSON VIANA DE ALMEIDA
</option>

<option>
Conselheiro FRANCISCO CARVALHO DA SILVA
</option>

<option>
Conselheiro JOSÉ EULER POTYGUARA PEREIRA DE MELLO
</option>

<option>
Conselheiro-Substituto OMAR PIRES DIAS
</option>

<option>
Conselheiro-Substituto FRANCISCO JÚNIOR FERREIRA DA SILVA
</option>

</select>

</div>
`

data.forEach((i,index)=>{

let numero=String(index+1).padStart(3,'0')

html+=`

<table style="
width:100%;
border-collapse:collapse;
margin-top:30px;
font-size:12px;
">

<tr>

<td style="
border:1px solid #000;
background:#facc15;
font-weight:900;
padding:6px;
width:60px;
text-align:center;
">
${numero}
</td>

<td style="
border:1px solid #000;
background:#65a30d;
font-weight:900;
padding:6px;
width:80px;
color:#fff;
">
Item:
</td>

<td style="
border:1px solid #000;
padding:6px;
width:80px;
font-weight:700;
">
${i.item||'-'}
</td>

<td style="
border:1px solid #000;
background:#65a30d;
font-weight:900;
padding:6px;
width:180px;
color:#fff;
">
Descrição da Ação:
</td>

<td style="
border:1px solid #000;
padding:10px;
font-weight:700;
">
${i.descricao||i.deliberacao||'-'}
</td>

</tr>

<tr>

<td colspan="2" style="
border:1px solid #000;
background:#d9f99d;
padding:6px;
font-weight:700;
">
Deliberação:
</td>

<td style="
border:1px solid #000;
padding:6px;
">
${i.deliberacao||'-'}
</td>

<td style="
border:1px solid #000;
background:#d9f99d;
padding:6px;
font-weight:700;
">
N. subitem
</td>

<td style="
border:1px solid #000;
padding:6px;
">
${i.subitem||'-'}
</td>

</tr>

<tr>

<td colspan="2" style="
border:1px solid #000;
background:#d9f99d;
padding:6px;
font-weight:700;
">
Plano de Ação/Ação Proposta
</td>

<td style="
border:1px solid #000;
padding:6px;
">
${i.acao_gestor||'-'}
</td>

<td style="
border:1px solid #000;
background:#d9f99d;
padding:6px;
font-weight:700;
">
Produto Entregue
</td>

<td style="
border:1px solid #000;
padding:6px;
">
${i.produto||i.produto_esperado||'-'}
</td>

</tr>

<tr>

<td colspan="2" style="
border:1px solid #000;
background:#d9f99d;
padding:6px;
font-weight:700;
">
Status da Ação
</td>

<td style="
border:1px solid #000;
padding:6px;
">
${i.status||'-'}
</td>

<td style="
border:1px solid #000;
background:#d9f99d;
padding:6px;
font-weight:700;
">
%
</td>

<td style="
border:1px solid #000;
padding:6px;
font-weight:900;
">
${Number(i.percentual||0)}%
</td>

</tr>

<tr>

<td style="
border:1px solid #000;
background:#d9f99d;
padding:6px;
font-weight:700;
">
Ação do Gestor
</td>

<td style="
border:1px solid #000;
padding:6px;
">
${i.acao_gestor||'-'}
</td>

<td style="
border:1px solid #000;
background:#d9f99d;
padding:6px;
font-weight:700;
">
Causa
</td>

<td style="
border:1px solid #000;
padding:6px;
">
${i.causa||'-'}
</td>

<td style="
border:1px solid #000;
padding:6px;
">
</td>

</tr>

<tr>

<td style="
border:1px solid #000;
background:#d9f99d;
padding:6px;
font-weight:700;
">
Efeito
</td>

<td style="
border:1px solid #000;
padding:6px;
">
${i.efeito||'-'}
</td>

<td style="
border:1px solid #000;
background:#d9f99d;
padding:6px;
font-weight:700;
">
Benefício Esperado
</td>

<td style="
border:1px solid #000;
padding:6px;
">
${i.beneficio_esperado||'-'}
</td>

<td style="
border:1px solid #000;
padding:6px;
">
</td>

</tr>

<tr>

<td style="
border:1px solid #000;
background:#d9f99d;
padding:6px;
font-weight:700;
">
Prazo
</td>

<td style="
border:1px solid #000;
padding:6px;
">
${i.prazo||'-'}
</td>

<td style="
border:1px solid #000;
background:#d9f99d;
padding:6px;
font-weight:700;
">
Criticidade
</td>

<td style="
border:1px solid #000;
padding:6px;
font-weight:700;
">
${i.criticidade||'-'}
</td>

<td style="
border:1px solid #000;
padding:6px;
">
</td>

</tr>

<tr>

<td style="
border:1px solid #000;
background:#d9f99d;
padding:6px;
font-weight:700;
">
Observações
</td>

<td colspan="4" style="
border:1px solid #000;
padding:16px;
">
</td>

</tr>

<tr>

<td style="
border:1px solid #000;
background:#d9f99d;
padding:6px;
font-weight:700;
">
Evidências
</td>

<td colspan="4" style="
border:1px solid #000;
padding:22px;
">
</td>

</tr>

</table>
`

})

html+=`

<div style="
margin-top:40px;
font-size:13px;
line-height:1.8;
">

<b>Observação:</b>

O presente relatório é gerado a partir dos dados inseridos no sistema TAG/Sedam-2026, integrando informações do Supabase e do repositório GitHub (projetosetags/tags). Dados preliminares sujeitos a validação posterior pela auditoria técnica.

</div>

</div>
`

box.innerHTML=html

}
