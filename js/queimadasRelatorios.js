/*=========================================================
002 CAPTURAR ELEMENTO
=========================================================*/
async function capturarElemento(id){
let el=document.getElementById(id)
if(!el)return null
let canvas=await html2canvas(el,{
scale:1.5,
useCORS:true,
backgroundColor:'#ffffff'
})
return canvas.toDataURL('image/png',1)
}

/*=========================================================
003 CABECALHO
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
004 RODAPE
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
005 ADICIONAR PAGINA PAINEL
=========================================================*/
async function adicionarPaginaPainel(
doc,
titulo,
idElemento
){
let img=await capturarElemento(idElemento)
if(!img)return
doc.addPage()
adicionarCabecalho(doc,titulo)
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text(titulo,15,30)
doc.addImage(
img,
'PNG',
10,
40,
190,
220
)
}
/*=========================================================
006 ADICIONAR PAINEL PDF
=========================================================*/
async function adicionarPainelPDF(doc,titulo,idElemento){
let img=await capturarElemento(idElemento)
if(!img)return
doc.addPage()
adicionarCabecalho(doc,titulo)
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text(titulo,15,25)
doc.addImage(img,'PNG',10,35,190,140)
}
/*=========================================================
007 CAPA
=========================================================*/
function adicionarCapa(doc){
doc.setFont('helvetica','bold')
doc.setFontSize(22)
doc.text(QR.titulo,105,70,{align:'center'})
doc.setFontSize(16)
doc.text(QR.subtitulo,105,85,{align:'center'})
doc.text(QR.processo,105,100,{align:'center'})
doc.setFontSize(13)
doc.text('Tribunal de Contas do Estado de Rondônia',105,120,{align:'center'})
}

/*=========================================================
008 TOP 10 RISCOS PDF
=========================================================*/
async function adicionarTop10RiscosPDF(doc){
let {data,error}=await client
.from('queimadas_heatmap')
.select('*')
if(error)return
let lista=[...(data||[])]
.sort((a,b)=>Number(b.risco||0)-Number(a.risco||0))
.slice(0,10)
doc.addPage()
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text('TOP 10 MUNICÍPIOS DE MAIOR RISCO',15,20)
doc.autoTable({
startY:30,
head:[['POS','MUNICÍPIO','RISCO','FOCOS','CLASSIFICAÇÃO']],
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
009 TABELA MUNICIPIOS PDF
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
doc.text('SITUAÇÃO DOS MUNICÍPIOS',15,20)
doc.autoTable({
startY:30,
head:[['Nº','MUNICÍPIO','SITUAÇÃO','DOCUMENTO','RECEBIMENTO']],
body:(data||[]).map((i,idx)=>[
idx+1,
i.municipio||'-',
i.classificacao_ia||'-',
i.lnumerodocenviado||i.llnumerodocenviado||'-',
formatarDataBR(i.ldatarecebimentodoc)
]),
styles:{fontSize:7},
headStyles:{fillColor:[15,23,42]},
alternateRowStyles:{fillColor:[245,245,245]}
})
}

/*=========================================================
010 CONCLUSAO AUTOMATICA
=========================================================*/
async function gerarConclusaoAutomatica(){
let {data=[]}=await client
.from('queimadas_heatmap')
.select('*')
let criticos=(data||[]).filter(i=>String(i.classificacao||'').toUpperCase().includes('CRÍT')).length
let altos=(data||[]).filter(i=>String(i.classificacao||'').toUpperCase()==='ALTO').length
let moderados=(data||[]).filter(i=>String(i.classificacao||'').toUpperCase()==='MODERADO').length
let baixos=(data||[]).filter(i=>String(i.classificacao||'').toUpperCase()==='BAIXO').length
let top=[...(data||[])]
.sort((a,b)=>Number(b.risco||0)-Number(a.risco||0))
.slice(0,6)
let ranking=top.map((m,i)=>`${i+1}º ${m.municipio}`).join(', ')
return `Foram identificados ${criticos} municípios classificados como CRÍTICO, ${altos} classificados como ALTO, ${moderados} classificados como MODERADO e ${baixos} classificados como BAIXO risco. Os municípios mais críticos são: ${ranking}. Recomenda-se intensificar prevenção, fiscalização, monitoramento e resposta integrada.`
}

/*=========================================================
 011 ASSINATURAS PDF
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
doc.text('Coordenador dos Trabalhos',20,88)
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
doc.text('Supervisor dos Trabalhos',20,150)
}
/*=========================================================
012 ANEXOS
=========================================================*/
function adicionarAnexos(doc){
doc.addPage()
doc.setFont('helvetica','bold')
doc.setFontSize(18)
doc.text('ANEXOS',15,20)
let lista=[
'Mapa Executivo',
'Mapa Estadual',
'IRIQ Estadual',
'Heatmap Estadual',
'Painel CHAP',
'Painel IA-CHAP',
'Matriz de Risco 5x5',
'Tabela de Municípios',
'Evidências',
'Monitoramento 4D'
]
let y=40
lista.forEach((item,idx)=>{
doc.setFontSize(12)
doc.text(`${idx+1}. ${item}`,20,y)
y+=10
})
}
