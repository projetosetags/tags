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
004A CABECALHO PDF
=========================================================*/
function adicionarCabecalhoPDF(doc,titulo){
doc.setFillColor(22,44,95)
doc.rect(0,0,210,15,'F')
doc.setTextColor(255,255,255)
doc.setFont('helvetica','bold')
doc.setFontSize(12)
doc.text(titulo,15,10)
doc.setTextColor(0,0,0)
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
scale:2,
backgroundColor:'#ffffff',
useCORS:true
})
let img=canvas.toDataURL('image/png')
let pdfW=180
let pdfH=(canvas.height*pdfW)/canvas.width
let pageH=250
let y=0
while(y<pdfH){
doc.addPage()
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text(titulo,15,20)
doc.addImage(
img,
'PNG',
15,
30-y,
pdfW,
pdfH
)
y+=pageH
}
}
/*=========================================================
005A ADICIONAR PAINEL PDF FORCADO
=========================================================*/
async function adicionarPainelPDFForcado(
doc,
titulo,
idElemento
){
let el=document.getElementById(idElemento)
if(!el)return

let hidden=
el.classList.contains('hidden')

let displayOriginal=
el.style.display

el.classList.remove('hidden')
el.style.display='block'

await new Promise(r=>setTimeout(r,500))

for(let i=0;i<8;i++){
await new Promise(r=>requestAnimationFrame(r))
}

await new Promise(r=>setTimeout(r,3000))

await adicionarPainelPDF(
doc,
titulo,
idElemento
)

if(hidden){
el.classList.add('hidden')
}

el.style.display=
displayOriginal
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
