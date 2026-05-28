```javascript
/*=========================================================
001 PDF FUNCTION GERARPDFBACKUP
=========================================================*/
function gerarPDFBackup(d){
const {jsPDF}=window.jspdf
let doc=new jsPDF('p','mm','a4')
doc.setFont('times','normal')
doc.setFontSize(12)
doc.setTextColor(20,20,20)
doc.text('BACKUP DELIBERAÇÕES - TAG SEDAM 2026',10,12)
let rows=d.map(i=>[
i.subitem||'-',
String(i.descricao||'-'),
String(i.setor||i.coordenadoria||'-'),
Math.max(
i.jan||0,
i.fev||0,
i.mar||0,
i.abr||0,
i.mai||0,
i.jun||0,
i.jul||0,
i.ago||0,
i.set||0,
i.out||0,
i.nov||0,
i.dez||0
)+'%'
])
doc.autoTable({
head:[['SUBITEM','DESCRIÇÃO','SETOR','%']],
body:rows,
startY:24,
theme:'striped',
styles:{
fontSize:8,
font:'times',
overflow:'linebreak',
cellPadding:2,
valign:'top',
textColor:[15,23,42],
lineColor:[210,215,220],
lineWidth:.15
},
headStyles:{
fillColor:[30,41,59],
textColor:[255,255,255],
fontStyle:'bold',
fontSize:9
},
alternateRowStyles:{
fillColor:[248,248,248]
},
columnStyles:{
0:{cellWidth:24,halign:'center'},
1:{cellWidth:108},
2:{cellWidth:48},
3:{cellWidth:16,halign:'center'}
},
margin:{
top:20,
bottom:38,
left:5,
right:5
}
})
adicionarRodapePadraoPDF(doc)
doc.save('backup_deliberacoes_tag_sedam.pdf')
}
/*=========================================================
003 PDF FUNCTION GERARPDFRESUMO
=========================================================*/
async function gerarPDFResumo(){
const {jsPDF}=window.jspdf
let doc=new jsPDF('p','mm','a4')
doc.setFont('times','normal')
let lista=[...(window.allData||[])].sort(compareSubitemPDF)
doc.setFontSize(14)
doc.setTextColor(20,20,20)
doc.text('RESUMO EXECUTIVO - TAG SEDAM 2026',10,12)
doc.setFontSize(9)
doc.setTextColor(90)
doc.text('Painel consolidado de acompanhamento técnico e estratégico.',10,18)
let grupos={}
lista.forEach(i=>{
let itemPai=String(i.item||'').trim()
if(!grupos[itemPai]){
grupos[itemPai]=[]
}
grupos[itemPai].push(i)
})
let rows=[]
Object.keys(grupos).sort((a,b)=>{
let pa=String(a).split('.').map(n=>parseInt(n)||0)
let pb=String(b).split('.').map(n=>parseInt(n)||0)
let max=Math.max(pa.length,pb.length)
for(let i=0;i<max;i++){
let va=pa[i]||0
let vb=pb[i]||0
if(va!==vb)return va-vb
}
return 0
}).forEach(item=>{
let regs=(grupos[item]||[]).sort(compareSubitemPDF)
let media=Math.round(
regs.reduce((acc,c)=>acc+getTotal(c),0)/(regs.length||1)
)
let descricaoItem=regs.find(x=>x.descricaoitem&&x.descricaoitem.trim())?.descricaoitem||'-'
rows.push([
'ITEM '+item,
descricaoItem,
'',
media+'%'
])
regs.forEach(i=>{
rows.push([
'SUBITEM '+(i.subitem||'-'),
String(i.descricao||'-'),
String(i.produto||'-'),
getTotal(i)+'%'
])
})
})
doc.autoTable({
startY:26,
head:[['ITEM / SUBITEM','DESCRIÇÃO COMPLETA','PRODUTO ESTRATÉGICO','%']],
body:rows,
theme:'striped',
styles:{
fontSize:8,
font:'times',
overflow:'linebreak',
cellPadding:2,
valign:'top',
textColor:[15,23,42],
lineColor:[210,215,220],
lineWidth:.15
},
headStyles:{
fillColor:[30,41,59],
textColor:[255,255,255],
fontStyle:'bold',
fontSize:9
},
alternateRowStyles:{
fillColor:[248,248,248]
},
columnStyles:{
0:{cellWidth:32},
1:{cellWidth:96},
2:{cellWidth:54},
3:{cellWidth:14,halign:'center'}
},
margin:{
top:20,
bottom:38,
left:5,
right:5
},
didParseCell:function(data){
let txt=String(data.cell.raw||'')
if(txt.startsWith('ITEM ')){
data.cell.styles.fillColor=[30,58,138]
data.cell.styles.textColor=[255,255,255]
data.cell.styles.fontStyle='bold'
}
}
})
adicionarRodapePadraoPDF(doc)
doc.save('pdf_resumo_tag_sedam.pdf')
}
/*=========================================================
00 PDF FUNCTION COMPARESUBITEMPDF
=========================================================*/
function compareSubitemPDF(a,b){
let sa=String(a.subitem||a.item||'0.0').replace(/[^\d\.]/g,'')
let sb=String(b.subitem||b.item||'0.0').replace(/[^\d\.]/g,'')
let pa=sa.split('.').map(n=>parseInt(n)||0)
let pb=sb.split('.').map(n=>parseInt(n)||0)
let max=Math.max(pa.length,pb.length)
for(let i=0;i<max;i++){
let va=pa[i]||0
let vb=pb[i]||0
if(va!==vb)return va-vb
}
return 0
}
/*=========================================================
004 PDF FUNCTION GERARPDFMONITORAMENTO
=========================================================*/
async function gerarPDFMonitoramento(){
const {jsPDF}=window.jspdf
let doc=new jsPDF('l','mm','a4')
doc.setFont('times','normal')
let lista=[...(window.allData||[])].sort(compareSubitemPDF)
let meses=[
{campo:'jan',label:'JAN'},
{campo:'fev',label:'FEV'},
{campo:'mar',label:'MAR'},
{campo:'abr',label:'ABR'},
{campo:'mai',label:'MAI'},
{campo:'jun',label:'JUN'},
{campo:'jul',label:'JUL'},
{campo:'ago',label:'AGO'},
{campo:'set',label:'SET'},
{campo:'out',label:'OUT'},
{campo:'nov',label:'NOV'},
{campo:'dez',label:'DEZ'}
]
let mesAtual=new Date().getMonth()
let mesesAtivos=meses.slice(0,mesAtual+1)
doc.setFontSize(14)
doc.setTextColor(20,20,20)
doc.text('MONITORAMENTO COMPLETO - TAG SEDAM 2026',10,12)
doc.setFontSize(9)
doc.setTextColor(90)
doc.text('Painel consolidado de monitoramento estratégico.',10,18)
let rows=lista.map(i=>{
let total=getTotal(i)
let linha=[
modoTabela==='item'
?String(i.item||'-')
:String(i.subitem||'-'),
modoTabela==='item'
?String(i.descricaoitem||'-')
:String(i.descricao||'-'),
String(i.produto||'-'),
String(i.setor||i.coordenadoria||'-')
]
mesesAtivos.forEach(m=>{
linha.push(Number(i[m.campo]||0)+'%')
})
linha.push(total+'%')
return linha
})
doc.autoTable({
startY:26,
head:[[
modoTabela==='item'
?'ITEM'
:'SUBITEM',
modoTabela==='item'
?'DESCRIÇÃO ITEM'
:'DESCRIÇÃO',
'PRODUTO',
'SETOR',
...mesesAtivos.map(m=>m.label),
'TOTAL'
]],
body:rows,
theme:'grid',
styles:{
fontSize:8,
font:'times',
overflow:'linebreak',
cellPadding:2,
valign:'top',
textColor:[15,23,42],
lineColor:[210,215,220],
lineWidth:.15
},
headStyles:{
fillColor:[30,41,59],
textColor:[255,255,255],
fontStyle:'bold',
fontSize:8
},
alternateRowStyles:{
fillColor:[248,248,248]
},
columnStyles:(()=>{
let estilos={
0:{cellWidth:24,halign:'center'},
1:{cellWidth:104},
2:{cellWidth:58},
3:{cellWidth:38}
}
let indice=4
mesesAtivos.forEach(()=>{
estilos[indice]={
cellWidth:10,
halign:'center'
}
indice++
})
estilos[indice]={
cellWidth:16,
halign:'center'
}
return estilos
})(),
margin:{
top:20,
bottom:38,
left:5,
right:5
}
})
let finalY=(doc.lastAutoTable.finalY||240)+10
doc.setFontSize(10)
doc.setTextColor(60)
let total100=lista.filter(i=>getTotal(i)>=100).length
let media=Math.round(
lista.reduce((acc,c)=>acc+getTotal(c),0)/(lista.length||1)
)
doc.text(
'O monitoramento consolidado demonstra '+lista.length+' registros estratégicos acompanhados, sendo '+total100+' integralmente cumpridos (100%). A média geral consolidada corresponde a '+media+'% de execução.',
10,
finalY,
{
maxWidth:260,
align:'justify'
}
)
adicionarRodapePadraoPDF(doc)
doc.save(
modoTabela==='item'
?'Itens_Monitoramento_TAG_SEDAM_2026.pdf'
:'Subitens_Monitoramento_TAG_SEDAM_2026.pdf'
)
}
/*=========================================================
00 PDF FUNCTION GERARPDFGRAFICOS
=========================================================*/
async function gerarPDFGraficos(){
const {jsPDF}=window.jspdf
let doc=new jsPDF('p','mm','a4')
doc.setFont('times','bold')
doc.setFontSize(16)
doc.setTextColor(20,20,20)
doc.text('ANÁLISE GRÁFICA - TAG SEDAM 2026',105,12,{align:'center'})
doc.setFont('times','normal')
doc.setFontSize(9)
doc.setTextColor(90)
doc.text('Painel consolidado de evolução estratégica.',105,18,{align:'center'})
let y=28
async function adicionarGrafico(canvasId,titulo){
let canvas=document.getElementById(canvasId)
if(!canvas)return
let img=canvas.toDataURL('image/png',1.0)
if(y>185){
doc.addPage()
y=20
}
doc.setFont('times','bold')
doc.setFontSize(11)
doc.setTextColor(25,25,25)
doc.text(titulo,10,y)
y+=5
doc.addImage(
img,
'PNG',
10,
y,
190,
70
)
y+=80
}
await adicionarGrafico('graficoDashboardItens','DESEMPENHO POR ITEM')
await adicionarGrafico('graficoDashboardLinha','EVOLUÇÃO MENSAL')
await adicionarGrafico('graficoDashboardPizza','DISTRIBUIÇÃO DOS SUBITENS')
doc.setFont('times','normal')
doc.setFontSize(9)
doc.setTextColor(60)
doc.text(
'Os gráficos demonstram a evolução consolidada do acompanhamento técnico e estratégico do TAG SEDAM 2026.',
10,
y,
{
maxWidth:188,
align:'justify'
}
)
adicionarRodapePadraoPDF(doc)
doc.save('pdf_graficos_tag_sedam.pdf')
}
/*=========================================================
005 PDF FUNCTION GERARPDFCUMPRIDOS
=========================================================*/
async function gerarPDFCumpridos(){
const {jsPDF}=window.jspdf
let doc=new jsPDF('l','mm','a4')
let lista=(window.allData||[]).filter(i=>{
let total=Math.max(
Number(i.jan||0),
Number(i.fev||0),
Number(i.mar||0),
Number(i.abr||0),
Number(i.mai||0),
Number(i.jun||0),
Number(i.jul||0),
Number(i.ago||0),
Number(i.set||0),
Number(i.out||0),
Number(i.nov||0),
Number(i.dez||0)
)
return total>=100
}).sort(compareSubitemPDF)
doc.setFontSize(16)
doc.setTextColor(0,0,0)
doc.text('SUBITENS 100% CUMPRIDOS - TAG SEDAM 2026',10,12)
doc.setFontSize(10)
doc.setTextColor(70,70,70)
doc.text('TOTAL DE SUBITENS COM 100% DE EXECUÇÃO: '+lista.length,10,19)
let rows=lista.map(i=>{
let total=Math.max(
Number(i.jan||0),
Number(i.fev||0),
Number(i.mar||0),
Number(i.abr||0),
Number(i.mai||0),
Number(i.jun||0),
Number(i.jul||0),
Number(i.ago||0),
Number(i.set||0),
Number(i.out||0),
Number(i.nov||0),
Number(i.dez||0)
)
return[
i.item||'-',
i.subitem||'-',
i.descricao||'-',
String(i.produto||'-'),
String(i.setor||i.coordenadoria||'-'),
total+'%'
]
})
doc.autoTable({
startY:24,
head:[[
'ITEM',
'SUBITEM',
'DESCRIÇÃO COMPLETA',
'PRODUTO',
'SETOR',
'%'
]],
body:rows,
theme:'striped',
styles:{
fontSize:7,
overflow:'linebreak',
cellPadding:1.4,
valign:'top',
textColor:[0,0,0]
},
headStyles:{
fillColor:[34,197,94],
textColor:[255,255,255],
fontStyle:'bold',
fontSize:7
},
alternateRowStyles:{
fillColor:[245,245,245]
},
columnStyles:{
0:{cellWidth:18,halign:'center'},
1:{cellWidth:22,halign:'center'},
2:{cellWidth:118},
3:{cellWidth:82},
4:{cellWidth:46},
5:{cellWidth:14,halign:'center'}
},
margin:{
top:20,
left:8,
right:8,
bottom:38
}
})
adicionarRodapePadraoPDF(doc)
doc.save('pdf_100_cumpridos_tag_sedam.pdf')
}
```
```javascript
/*=========================================================
050 WORD BASE
=========================================================*/
function baixarWord(nome,conteudo){
let html=`
<html xmlns:o='urn:schemas-microsoft-com:office:office'
xmlns:w='urn:schemas-microsoft-com:office:word'
xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${nome}</title>
<style>
body{
margin-top:2.5cm;
margin-right:2cm;
margin-bottom:2cm;
margin-left:3cm;
font-family:Calibri,Arial,sans-serif;
font-size:12pt;
line-height:1.3;
text-align:justify;
color:#111827;
}
table{
width:100%;
border-collapse:collapse;
margin-top:8px;
margin-bottom:18px;
}
th{
background:#1e293b;
color:#ffffff;
font-weight:bold;
text-align:center;
}
th,td{
border:1px solid #cbd5e1;
padding:5px;
vertical-align:top;
}
h1,h2,h3{
margin-top:0;
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
type:'application/msword'
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
051 WORD DASHBOARD
=========================================================*/
function gerarWordDashboard(){
let itens=document.getElementById('dashboardTotalItens')?.innerText||'0'
let subitens=document.getElementById('dashboardTotalSubitens')?.innerText||'0'
let media=document.getElementById('dashboardMediaGeral')?.innerText||'0%'
let html=`
<h1 style="font-family:Calibri,Arial,sans-serif;font-size:18pt;font-weight:700;color:#1e293b;margin-bottom:12px;">
DASHBOARD EXECUTIVO - TAG SEDAM 2026
</h1>
<table border="1" cellspacing="0" cellpadding="6" style="width:100%;border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:10pt;">
<tr style="background:#1e293b;color:#ffffff;font-weight:bold;">
<th>Itens Estratégicos</th>
<th>Subitens</th>
<th>Média Geral</th>
</tr>
<tr>
<td align="center">${itens}</td>
<td align="center">${subitens}</td>
<td align="center">${media}</td>
</tr>
</table>
<br>
<h2 style="font-family:Calibri,Arial,sans-serif;font-size:14pt;color:#1e293b;">
Relatório Executivo
</h2>
<p style="font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.5;text-align:justify;">
Painel consolidado de acompanhamento técnico do TAG SEDAM 2026 contendo indicadores estratégicos, evolução consolidada e análise gerencial.
</p>
<p style="font-family:Calibri,Arial,sans-serif;font-size:9pt;color:#475569;line-height:1.45;text-align:justify;">
As informações constantes neste relatório possuem caráter preliminar e dependem de validação técnica documental pela equipe técnica do Tribunal de Contas do Estado de Rondônia.
</p>
`
baixarWord('dashboard_tag_sedam',html)
}
/*=========================================================
052 WORD RESUMO
=========================================================*/
function gerarWordResumo(){
let lista=[...(window.allData||[])].sort(compareSubitemPDF)
let media=Math.round(lista.reduce((acc,c)=>acc+getTotal(c),0)/(lista.length||1))
let linhas=lista.map(i=>`
<tr>
<td>${i.item||'-'}</td>
<td>${i.subitem||'-'}</td>
<td>${i.descricao||'-'}</td>
<td>${i.produto||'-'}</td>
<td>${i.setor||i.coordenadoria||'-'}</td>
<td>${getTotal(i)}%</td>
</tr>
`).join('')
let html=`
<h1 style="font-size:18pt;font-weight:700;color:#1e293b;margin-bottom:10px;">
RESUMO EXECUTIVO - TAG SEDAM 2026
</h1>
<p style="font-size:11pt;margin-bottom:14px;">
Média Geral Consolidada:
<b>${media}%</b>
</p>
<table border="1" cellspacing="0" cellpadding="5">
<tr>
<th>Item</th>
<th>Subitem</th>
<th>Descrição</th>
<th>Produto</th>
<th>Setor</th>
<th>%</th>
</tr>
${linhas}
</table>
`
baixarWord('resumo_tag_sedam',html)
}
/*=========================================================
053 WORD MONITORAMENTO
=========================================================*/
function gerarWordMonitoramento(){
let lista=[...(window.allData||[])].sort(compareSubitemPDF)
let linhas=lista.map(i=>`
<tr>
<td>${i.item||'-'}</td>
<td>${i.subitem||'-'}</td>
<td>${i.descricao||'-'}</td>
<td>${i.produto||'-'}</td>
<td>${i.setor||i.coordenadoria||'-'}</td>
<td>${getTotal(i)}%</td>
</tr>
`).join('')
let media=Math.round(lista.reduce((acc,c)=>acc+getTotal(c),0)/(lista.length||1))
let html=`
<h1 style="font-size:18pt;font-weight:700;color:#1e293b;margin-bottom:10px;">
MONITORAMENTO COMPLETO - TAG SEDAM 2026
</h1>
<p style="font-size:11pt;margin-bottom:14px;">
Média Geral Consolidada:
<b>${media}%</b>
</p>
<table border="1" cellspacing="0" cellpadding="5">
<tr>
<th>Item</th>
<th>Subitem</th>
<th>Descrição</th>
<th>Produto</th>
<th>Setor</th>
<th>Total</th>
</tr>
${linhas}
</table>
`
baixarWord('monitoramento_tag_sedam',html)
}
/*=========================================================
054 WORD GRAFICOS
=========================================================*/
function gerarWordGraficos(){
let info=window.graficoAtualInfo||{}
let html=`
<h1 style="font-size:18pt;font-weight:700;color:#1e293b;margin-bottom:10px;">
ANÁLISE GRÁFICA - TAG SEDAM 2026
</h1>
<p style="font-size:11pt;line-height:1.5;text-align:justify;margin-bottom:14px;">
Relatório gráfico consolidado do painel estratégico TAG SEDAM 2026.
</p>
<table border="1" cellspacing="0" cellpadding="5">
<tr>
<th>Tipo</th>
<th>Informação</th>
</tr>
<tr>
<td>Item</td>
<td>${info.item||'-'}</td>
</tr>
<tr>
<td>Subitem</td>
<td>${info.subitem||'-'}</td>
</tr>
<tr>
<td>JAN</td>
<td>${info.jan||0}%</td>
</tr>
<tr>
<td>FEV</td>
<td>${info.fev||0}%</td>
</tr>
<tr>
<td>MAR</td>
<td>${info.mar||0}%</td>
</tr>
<tr>
<td>ABR</td>
<td>${info.abr||0}%</td>
</tr>
<tr>
<td>MAI</td>
<td>${info.mai||0}%</td>
</tr>
<tr>
<td>JUN</td>
<td>${info.jun||0}%</td>
</tr>
<tr>
<td>JUL</td>
<td>${info.jul||0}%</td>
</tr>
<tr>
<td>AGO</td>
<td>${info.ago||0}%</td>
</tr>
<tr>
<td>SET</td>
<td>${info.set||0}%</td>
</tr>
<tr>
<td>OUT</td>
<td>${info.out||0}%</td>
</tr>
<tr>
<td>NOV</td>
<td>${info.nov||0}%</td>
</tr>
<tr>
<td>DEZ</td>
<td>${info.dez||0}%</td>
</tr>
</table>
`
baixarWord('graficos_tag_sedam',html)
}
/*=========================================================
055 WORD 100
=========================================================*/
function gerarWordCumpridos(){
let lista=(window.allData||[]).filter(i=>getTotal(i)>=100).sort(compareSubitemPDF)
let linhas=lista.map(i=>`
<tr>
<td>${i.item||'-'}</td>
<td>${i.subitem||'-'}</td>
<td>${i.descricao||'-'}</td>
<td>${i.produto||'-'}</td>
<td>${i.setor||i.coordenadoria||'-'}</td>
<td>100%</td>
</tr>
`).join('')
let html=`
<h1 style="font-size:18pt;font-weight:700;color:#15803d;margin-bottom:10px;">
SUBITENS 100% CUMPRIDOS - TAG SEDAM 2026
</h1>
<p style="font-size:11pt;margin-bottom:14px;">
Total de registros integralmente cumpridos:
<b>${lista.length}</b>
</p>
<table border="1" cellspacing="0" cellpadding="5">
<tr>
<th>Item</th>
<th>Subitem</th>
<th>Descrição</th>
<th>Produto</th>
<th>Setor</th>
<th>%</th>
</tr>
${linhas}
</table>
`
baixarWord('100_tag_sedam',html)
}
```

/*=========================================================
056 PDF DASHBOARD
=========================================================*/
async function gerarPDFDashboard(){
const {jsPDF}=window.jspdf
let pdf=new jsPDF('p','mm','a4')
let margem=10
let y=15
pdf.setFont('times','bold')
pdf.setFontSize(18)
pdf.setTextColor(25,25,25)
pdf.text('DASHBOARD TAG SEDAM 2026',105,y,{align:'center'})
y+=8
pdf.setFont('times','normal')
pdf.setFontSize(9)
pdf.setTextColor(90)
pdf.text('Painel consolidado de acompanhamento técnico e estratégico.',105,y,{align:'center'})
y+=12
let cards=[
['Média Geral',document.getElementById('dashboardMediaGeral')?.innerText||'0%'],
['Itens Estratégicos',document.getElementById('dashboardTotalItensCard')?.innerText||'0'],
['Subitens',document.getElementById('dashboardTotalSubitensCard')?.innerText||'0'],
['100% Cumpridos',document.getElementById('dashboardCumpridos')?.innerText||'0'],
['Críticos',document.getElementById('dashboardCriticos')?.innerText||'0'],
['Em Execução',document.getElementById('dashboardAndamento')?.innerText||'0'],
['Pendentes',document.getElementById('dashPendentes')?.innerText||'0']
]
pdf.autoTable({
startY:y,
head:[['INDICADOR','VALOR']],
body:cards,
theme:'grid',
styles:{
fontSize:9,
cellPadding:3,
halign:'center',
valign:'middle',
lineColor:[220,220,220],
lineWidth:.2,
textColor:[20,20,20]
},
headStyles:{
fillColor:[30,41,59],
textColor:[255,255,255],
fontStyle:'bold'
},
alternateRowStyles:{
fillColor:[248,248,248]
},
columnStyles:{
0:{cellWidth:90},
1:{cellWidth:70}
},
margin:{
left:20,
right:20
}
})
y=pdf.lastAutoTable.finalY+12
async function adicionarGrafico(canvasId,titulo){
let canvas=document.getElementById(canvasId)
if(!canvas)return
let originalChart=Chart.getChart(canvas)
if(!originalChart)return
let tempCanvas=document.createElement('canvas')
tempCanvas.width=2200
tempCanvas.height=900
let tempCtx=tempCanvas.getContext('2d')
new Chart(tempCtx,{
type:originalChart.config.type,
data:JSON.parse(JSON.stringify(originalChart.config.data)),
options:{
...JSON.parse(JSON.stringify(originalChart.config.options)),
responsive:false,
animation:false,
plugins:{
legend:{
labels:{
font:{
size:18,
weight:'bold'
}
}
},
datalabels:{
font:{
size:16,
weight:'bold'
}
}
},
scales:{
x:{
ticks:{
font:{
size:16,
weight:'bold'
}
}
},
y:{
ticks:{
font:{
size:16,
weight:'bold'
}
}
}
}
}
})
await new Promise(r=>setTimeout(r,400))
let img=tempCanvas.toDataURL('image/png',1.0)
if(y>185){
pdf.addPage()
y=20
}
pdf.setFont('times','bold')
pdf.setFontSize(12)
pdf.setTextColor(25,25,25)
pdf.text(titulo,margem,y)
y+=5
pdf.addImage(
img,
'PNG',
10,
y,
190,
78,
undefined,
'FAST'
)
y+=88
}
await adicionarGrafico('graficoDashboardItens','DESEMPENHO POR ITEM')
await adicionarGrafico('graficoDashboardLinha','EVOLUÇÃO MENSAL')
await adicionarGrafico('graficoDashboardPizza','DISTRIBUIÇÃO DOS SUBITENS')
pdf.setFont('times','normal')
pdf.setFontSize(9)
pdf.setTextColor(60)
pdf.text(
'O dashboard executivo demonstra o panorama consolidado das ações monitoradas, evidenciando desempenho, evolução mensal e distribuição dos subitens estratégicos.',
10,
y,
{
maxWidth:188,
align:'justify'
}
)
adicionarRodapePadraoPDF(pdf)
pdf.setProperties({
title:'Dashboard TAG SEDAM 2026',
subject:'Monitoramento TAG SEDAM',
author:'Tribunal de Contas do Estado de Rondônia',
creator:'TCE-RO'
})
pdf.save('dashboard-tag-sedam-2026.pdf')
}
/*=========================================================
057 PDF RODAPE PADRAO
=========================================================*/
function adicionarRodapePadraoPDF(pdf){
let total=pdf.internal.getNumberOfPages()
for(let i=1;i<=total;i++){
pdf.setPage(i)
let pageHeight=pdf.internal.pageSize.height
let pageWidth=pdf.internal.pageSize.width
pdf.setFillColor(255,255,255)
pdf.rect(0,pageHeight-36,pageWidth,36,'F')
pdf.setDrawColor(220,220,220)
pdf.line(8,pageHeight-37,pageWidth-8,pageHeight-37)
pdf.setTextColor(85,85,85)
pdf.setFont('times','normal')
pdf.setFontSize(7)
pdf.text(
'Tribunal de Contas do Estado de Rondônia - TAG SEDAM 2026',
10,
pageHeight-31
)
pdf.setFontSize(5)
let linhas=pdf.splitTextToSize(
NOTA_TECNICA_PDF,
pageWidth-24
)
pdf.text(
linhas,
10,
pageHeight-25,
{
maxWidth:pageWidth-24,
align:'justify'
}
)
pdf.setFontSize(8)
pdf.setTextColor(90)
pdf.text(
'Página '+i+' de '+total,
pageWidth-10,
pageHeight-6,
{
align:'right'
}
)
}
}
/*=========================================================
058 FUNCTION GETTOTAL
=========================================================*/
function getTotal(i){
return Math.max(
Number(i.jan||0),
Number(i.fev||0),
Number(i.mar||0),
Number(i.abr||0),
Number(i.mai||0),
Number(i.jun||0),
Number(i.jul||0),
Number(i.ago||0),
Number(i.set||0),
Number(i.out||0),
Number(i.nov||0),
Number(i.dez||0)
)
}
/*=========================================================
059 CONSTANTE NOTA TECNICA
=========================================================*/
const NOTA_TECNICA_PDF=
'Relatório técnico preliminar elaborado com base nas informações registradas no painel TAG SEDAM 2026. Os dados apresentados estão sujeitos à validação técnica, auditoria e atualização institucional.'
/*=========================================================
060 FUNCTION EXPORTAR TODOS PDF
=========================================================*/
async function exportarTodosPDF(){
await gerarPDFDashboard()
await gerarPDFResumo()
await gerarPDFMonitoramento()
await gerarPDFGraficos()
await gerarPDFCumpridos()
}
/*=========================================================
061 FUNCTION EXPORTAR TODOS WORD
=========================================================*/
async function exportarTodosWord(){
gerarWordDashboard()
gerarWordResumo()
gerarWordMonitoramento()
gerarWordGraficos()
gerarWordCumpridos()
}
/*=========================================================
062 FUNCTION GERARPDFPAINELGERAL
=========================================================*/
async function gerarPDFPainelGeral(){
await gerarPDFDashboard()
}
/*=========================================================
063 FUNCTION GERARWORDPAINELGERAL
=========================================================*/
async function gerarWordPainelGeral(){
gerarWordDashboard()
}
/*=========================================================
064 FUNCTION FORMATAR PERCENTUAL PDF
=========================================================*/
function formatarPercentualPDF(v){
return Number(v||0).toFixed(0)+'%'
}
/*=========================================================
065 FUNCTION FORMATAR TEXTO PDF
=========================================================*/
function formatarTextoPDF(v){
return String(v||'-').trim()
}
/*=========================================================
066 FUNCTION FORMATAR SETOR PDF
=========================================================*/
function formatarSetorPDF(i){
return String(
i.setor||
i.coordenadoria||
'-'
)
}
/*=========================================================
067 FUNCTION FORMATAR PRODUTO PDF
=========================================================*/
function formatarProdutoPDF(i){
return String(i.produto||'-')
}
/*=========================================================
068 FUNCTION FORMATAR DESCRICAO PDF
=========================================================*/
function formatarDescricaoPDF(i){
return String(
i.descricao||
i.descricaoitem||
'-'
)
}
/*=========================================================
069 FUNCTION FORMATAR ITEM PDF
=========================================================*/
function formatarItemPDF(i){
return String(i.item||'-')
}
/*=========================================================
070 FUNCTION FORMATAR SUBITEM PDF
=========================================================*/
function formatarSubitemPDF(i){
return String(i.subitem||'-')
}


