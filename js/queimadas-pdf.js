/*=========================================================
001 QUEIMADAS PDF CONFIG
=========================================================*/
const QR={
titulo:'QUEIMADAS 2026',
subtitulo:'Monitoramento Inteligente',
processo:'PCe 0501/2026',
fonte:'TCE-RO • INPE • Sedam • CBMRO',
assinaturas:[
'Manoel Fernandes Neto',
'Luís Fernando Bueno',
'Raimundo Paulo Dias Barros Vieira'
]
}
/*=========================================================
002 CAPTURAR ELEMENTO
=========================================================*/
async function capturarElemento(id){
let el=document.getElementById(id)
if(!el)return null
let canvas=await html2canvas(el,{
scale:2,
useCORS:true,
backgroundColor:'#ffffff'
})
return canvas.toDataURL('image/png',1)
}

/*=========================================================
003 CABECALHO PDF
=========================================================*/
function adicionarCabecalho(doc,titulo){
doc.setFillColor(15,23,42)
doc.rect(0,0,210,18,'F')
doc.setTextColor(255,255,255)
doc.setFont('helvetica','bold')
doc.setFontSize(12)
doc.text('TCE-RO',10,12)
doc.text(titulo,200,12,{align:'right'})
doc.setTextColor(0,0,0)
}

/*=========================================================
004 RODAPE PDF
=========================================================*/
function adicionarRodape(doc){
let total=doc.internal.getNumberOfPages()
for(let i=1;i<=total;i++){
doc.setPage(i)
doc.setDrawColor(180)
doc.line(10,285,200,285)
doc.setFontSize(8)
doc.text(QR.fonte,10,290)
doc.text('Página '+i,200,290,{align:'right'})
}
}

/*=========================================================
005 ADICIONAR PAINEL PDF
=========================================================*/
async function adicionarPainelPDF(doc,titulo,idElemento){
let el=document.getElementById(idElemento)
if(!el)return
if(el.offsetWidth===0)return
if(el.offsetHeight===0)return
let canvas=await html2canvas(el,{
scale:3,
backgroundColor:'#ffffff',
useCORS:true
})
let img=canvas.toDataURL('image/png')
let largura=190
let altura=(canvas.height*largura)/canvas.width
let restante=altura
let deslocamento=0
const ALTURA_UTIL=235
while(restante>0){
doc.addPage()
qpCabecalho(doc,titulo)
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text(titulo,15,20)
doc.addImage(
img,
'PNG',
10,
30-deslocamento,
largura,
altura
)
restante-=ALTURA_UTIL
deslocamento+=ALTURA_UTIL
}
}
/*=========================================================
006 CAPA PDF
=========================================================*/
function adicionarCapa(doc){
doc.setFont('helvetica','bold')
doc.setFontSize(22)
doc.text(QR.titulo,105,70,{align:'center'})
doc.setFontSize(16)
doc.text(QR.subtitulo,105,85,{align:'center'})
doc.text(QR.processo,105,100,{align:'center'})
doc.setFontSize(13)
doc.text(
'Tribunal de Contas do Estado de Rondônia',
105,
120,
{align:'center'}
)
}
/*=========================================================
007 TOP 10 RISCOS PDF
=========================================================*/
async function adicionarTop10RiscosPDF(doc){

let {data,error}=await client
.from('queimadas_heatmap')
.select('*')

if(error)return

let lista=[...(data||[])]
.sort((a,b)=>
Number(b.risco||0)-
Number(a.risco||0)
)
.slice(0,10)

doc.addPage()

doc.setFont('helvetica','bold')
doc.setFontSize(16)

doc.text(
'TOP 10 MUNICÍPIOS DE MAIOR RISCO',
15,
20
)

doc.autoTable({
startY:30,
head:[[
'POS',
'MUNICÍPIO',
'RISCO',
'FOCOS',
'CLASSIFICAÇÃO'
]],
body:lista.map((i,idx)=>[
idx+1,
i.municipio||'-',
i.risco||0,
i.focos||0,
i.classificacao||'-'
]),
styles:{fontSize:8},
headStyles:{fillColor:[127,29,29]}
})

}

/*=========================================================
008 TABELA MUNICIPIOS PDF
=========================================================*/
async function adicionarTabelaMunicipiosPDF(doc){

let {data,error}=await client
.from('queimadas_municipios_oficio')
.select('*')
.order('municipio')

if(error)return

doc.addPage()

doc.setFont('helvetica','bold')
doc.setFontSize(16)

doc.text(
'SITUAÇÃO DOS MUNICÍPIOS',
15,
20
)

doc.autoTable({
startY:30,
head:[[
'Nº',
'MUNICÍPIO',
'SITUAÇÃO',
'DOCUMENTO',
'RECEBIMENTO'
]],
body:(data||[]).map((i,idx)=>[
idx+1,
i.municipio||'-',
i.classificacao_ia||'-',
i.lnumerodocenviado||
i.llnumerodocenviado||
'-',
formatarDataBR(i.ldatarecebimentodoc)
]),
styles:{fontSize:7},
headStyles:{fillColor:[15,23,42]},
alternateRowStyles:{fillColor:[245,245,245]}
})

}

/*=========================================================
009 CONCLUSAO AUTOMATICA
=========================================================*/
async function gerarConclusaoAutomatica(){

let {data=[]}=await client
.from('queimadas_heatmap')
.select('*')

let criticos=(data||[])
.filter(i=>
String(i.classificacao||'')
.toUpperCase()
.includes('CRÍT')
).length

let altos=(data||[])
.filter(i=>
String(i.classificacao||'')
.toUpperCase()==='ALTO'
).length

let moderados=(data||[])
.filter(i=>
String(i.classificacao||'')
.toUpperCase()==='MODERADO'
).length

let baixos=(data||[])
.filter(i=>
String(i.classificacao||'')
.toUpperCase()==='BAIXO'
).length

let top=[...(data||[])]
.sort((a,b)=>
Number(b.risco||0)-
Number(a.risco||0)
)
.slice(0,6)

let ranking=top
.map((m,i)=>`${i+1}º ${m.municipio}`)
.join(', ')

return `
Foram identificados
${criticos} municípios classificados como CRÍTICO,
${altos} classificados como ALTO,
${moderados} classificados como MODERADO
e ${baixos} classificados como BAIXO risco.
Os municípios mais críticos são:
${ranking}.
Recomenda-se intensificar prevenção,
fiscalização, monitoramento e resposta integrada.
`
}
/*=========================================================
010 ASSINATURAS PDF
=========================================================*/
function adicionarAssinaturasPDF(doc){
doc.addPage()
doc.setFont('helvetica','bold')
doc.setFontSize(18)
doc.text('ASSINATURAS',15,20)
doc.setFontSize(12)
doc.text('Manoel Fernandes Neto',20,70)
doc.line(20,72,100,72)
doc.setFont('helvetica','normal')
doc.text('Auditor de Controle Externo',20,80)
doc.text('Matrícula n. 275',20,88)
doc.setFont('helvetica','bold')
doc.text('Luís Fernando Bueno',150,70)
doc.line(150,72,230,72)
doc.setFont('helvetica','normal')
doc.text('Assessor Técnico',150,80)
doc.text('Apoio Técnico',150,88)
doc.setFont('helvetica','bold')
doc.text('Raimundo Paulo Dias Barros Vieira',20,140)
doc.line(20,142,120,142)
doc.setFont('helvetica','normal')
doc.text('Supervisor',20,150)
}
/*=========================================================
011 PDF EXECUTIVO TCERO
=========================================================*/
async function gerarPDFExecutivoTCERO(){
const {jsPDF}=window.jspdf
let doc=new jsPDF('p','mm','a4')
adicionarCapa(doc)
doc.addPage()
doc.setFont('helvetica','bold')
doc.setFontSize(18)
doc.text('SUMÁRIO EXECUTIVO',15,20)
let itens=[
'1. Mapa Executivo',
'2. IRIQ Estadual e Heatmap',
'3. Municípios Prioritários',
'4. Focos de Calor',
'5. Alertas Automáticos',
'6. Indicadores Estratégicos',
'7. Top 10 Municípios de Maior Risco',
'8. Conclusão Executiva',
'9. Assinaturas'
]
let y=40
itens.forEach(i=>{
doc.text(i,20,y)
y+=12
})
await adicionarPainelPDF(doc,'MAPA EXECUTIVO','mapaRO')
await adicionarPainelPDF(doc,'IRIQ ESTADUAL E HEATMAP','painelIRIQHeatmapUnificado')
await adicionarPainelPDF(doc,'MUNICÍPIOS PRIORITÁRIOS','painelMunicipiosPrioritarios')
await adicionarPainelPDF(doc,'FOCOS DE CALOR','painelFocosCalor')
await adicionarPainelPDF(doc,'ALERTAS AUTOMÁTICOS','painelAlertas')
await adicionarPainelPDF(doc,'INDICADORES ESTRATÉGICOS','painelIndicadoresEstrategicos')
await adicionarTop10RiscosPDF(doc)
let conclusao=await gerarConclusaoAutomatica()
doc.addPage()
doc.setFont('helvetica','bold')
doc.setFontSize(18)
doc.text('CONCLUSÃO EXECUTIVA',15,20)
doc.setFont('helvetica','normal')
doc.setFontSize(11)
doc.text(doc.splitTextToSize(conclusao,250),15,35)
adicionarAssinaturasPDF(doc)
adicionarRodape(doc)
doc.save('RELATORIO_EXECUTIVO_QUEIMADAS_2026.pdf')
}
/*=========================================================
012 WORD EXECUTIVO TCERO
=========================================================*/
async function gerarWordExecutivoTCERO(){
let conclusao=await gerarConclusaoAutomatica()
let html=`
<h1>MONITORAMENTO INTELIGENTE DE QUEIMADAS 2026</h1>
<h2>TRIBUNAL DE CONTAS DO ESTADO DE RONDÔNIA</h2>
<h3>PCe 0501/2026</h3>
<p>Relatório Executivo consolidado do Monitoramento Inteligente de Queimadas, Incêndios Florestais e Eventos Associados no Estado de Rondônia.</p>
<h2>DASHBOARD EXECUTIVO</h2>
${document.getElementById('painelKPIs')?.innerHTML||''}
<h2>IRIQ ESTADUAL E HEATMAP</h2>
${document.getElementById('painelIRIQHeatmapUnificado')?.innerHTML||''}
<h2>MUNICÍPIOS PRIORITÁRIOS</h2>
${document.getElementById('painelMunicipiosPrioritarios')?.innerHTML||''}
<h2>FOCOS DE CALOR</h2>
${document.getElementById('painelFocosCalor')?.innerHTML||''}
<h2>ALERTAS AUTOMÁTICOS</h2>
${document.getElementById('painelAlertas')?.innerHTML||''}
<h2>UNIDADES DE CONSERVAÇÃO</h2>
${document.getElementById('painelUCs')?.innerHTML||''}
<h2>INDICADORES ESTRATÉGICOS</h2>
${document.getElementById('painelIndicadoresEstrategicos')?.innerHTML||''}
<h2>CONCLUSÃO EXECUTIVA</h2>
<p>${conclusao}</p>
<br><br><br>
<table style="width:100%">
<tr>
<td>
____________________________________<br>
Manoel Fernandes Neto<br>
Auditor de Controle Externo<br>
Matrícula n.275
</td>
<td>
____________________________________<br>
Luís Fernando Bueno<br>
Assessor Técnico
</td>
</tr>
</table>
`
baixarWordQueimadas('relatorio_executivo_queimadas_2026',html)
}
/*=========================================================
13 WORD BASE
=========================================================*/
function baixarWordQueimadas(nome,conteudo){
let html=`
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${nome}</title>
<style>
body{
font-family:Calibri,Arial,sans-serif;
font-size:12pt;
margin:2.5cm;
line-height:1.5;
}
h1{
text-align:center;
}
h2{
margin-top:20px;
}
table{
border-collapse:collapse;
width:100%;
}
td,th{
border:1px solid #000;
padding:4px;
}
</style>
</head>
<body>
${conteudo}
</body>
</html>
`
let blob=new Blob(
['\ufeff',html],
{
type:'application/msword;charset=utf-8'
}
)
let url=URL.createObjectURL(blob)
let a=document.createElement('a')
a.href=url
a.download=nome+'.doc'
document.body.appendChild(a)
a.click()
document.body.removeChild(a)
URL.revokeObjectURL(url)
}
/*=========================================================
014 PDF COMPLETO
=========================================================*/
async function pdfCompletoQueimadas(){
const {jsPDF}=window.jspdf
let doc=new jsPDF('p','mm','a4')

adicionarCapa(doc)

doc.addPage()
doc.setFont('helvetica','bold')
doc.setFontSize(18)
doc.text('SUMÁRIO GERAL',15,20)

let itens=[
'1. Mapa Executivo',
'2. IRIQ Estadual e Heatmap',
'3. Municípios Prioritários',
'4. Focos de Calor',
'5. Alertas Automáticos',
'6. Unidades de Conservação',
'7. Indicadores Estratégicos',
'8. Situação Geral dos Municípios',
'9. Planos Apresentados',
'10. Dilação de Prazo',
'11. Municípios sem Resposta',
'12. Estatísticas Municipais',
'13. CHAP',
'14. IA-CHAP',
'15. Matriz de Risco 5x5',
'16. Top Riscos',
'17. Predição de Queimadas',
'18. Priorização Municipal',
'19. Sugestões Automáticas',
'20. Plano Unificado',
'21. Plano Sedam',
'22. Plano CBMRO',
'23. Cadeia de Valor',
'24. Teoria da Mudança',
'25. ODS',
'26. Cronograma Gantt',
'27. Marcos Estratégicos',
'28. Governança',
'29. Monitoramento 4D',
'30. Execução Física',
'31. Execução Financeira',
'32. Evidências',
'33. Top 10 Municípios de Maior Risco',
'34. Tabela Consolidada dos Municípios',
'35. Assinaturas'
]
let y=35
itens.forEach(i=>{
doc.text(i,20,y)
y+=7
if(y>270){
doc.addPage()
y=20
}
})
await adicionarPainelPDF(doc,'MAPA EXECUTIVO','mapaRO')
/*=========================================================
015 WORD COMPLETO
=========================================================*/
async function gerarWordCompletoQueimadas(){
let conclusao=await gerarConclusaoAutomatica()
let html=`
<h1>QUEIMADAS 2026</h1>
<h2>RELATÓRIO COMPLETO</h2>
<h3>TRIBUNAL DE CONTAS DO ESTADO DE RONDÔNIA</h3>
<h3>DASHBOARD EXECUTIVO</h3>
${document.getElementById('painelKPIs')?.innerHTML||''}
<h3>IRIQ E HEATMAP</h3>
${document.getElementById('painelIRIQHeatmapUnificado')?.innerHTML||''}
<h3>MUNICÍPIOS PRIORITÁRIOS</h3>
${document.getElementById('painelMunicipiosPrioritarios')?.innerHTML||''}
<h3>FOCOS DE CALOR</h3>
${document.getElementById('painelFocosCalor')?.innerHTML||''}
<h3>ALERTAS</h3>
${document.getElementById('painelAlertas')?.innerHTML||''}
<h3>UNIDADES DE CONSERVAÇÃO</h3>
${document.getElementById('painelUCs')?.innerHTML||''}
<h3>INDICADORES ESTRATÉGICOS</h3>
${document.getElementById('painelIndicadoresEstrategicos')?.innerHTML||''}
<h3>CHAP</h3>
${document.getElementById('painelCHAP')?.innerHTML||''}
<h3>IA-CHAP</h3>
${document.getElementById('painelIAChap')?.innerHTML||''}
<h3>MATRIZ DE RISCO 5X5</h3>
${document.getElementById('painelMatriz5x5')?.innerHTML||''}
<h3>PLANO UNIFICADO</h3>
${document.getElementById('painelPlanoUnificado')?.innerHTML||''}
<h3>MONITORAMENTO 4D</h3>
${document.getElementById('painelMonitoramento4D')?.innerHTML||''}
<h3>EVIDÊNCIAS</h3>
${document.getElementById('painelEvidencias')?.innerHTML||''}
<h3>CONCLUSÃO</h3>
<p>${conclusao}</p>
`
baixarWordQueimadas('RELATORIO_COMPLETO_QUEIMADAS_2026',html)
}
