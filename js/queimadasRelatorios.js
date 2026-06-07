/*=========================================================
001 QUEIMADAS RELATORIOS CONFIG
=========================================================*/
const QR={
titulo:'QUEIMADAS 2026',
subtitulo:'Monitoramento Inteligente',
processo:'PCe 0501/2026',
fonte:'TCE-RO • INPE • SEDAM • CBMRO',
assinaturas:[
'Manoel Fernandes Neto',
'Luís Fernando Bueno',
'Raimundo Paulo Dias Barros Vieira'
]
}
/*=========================================================
007 QUEIMADAS RELATORIOS CAPTURAR
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
018 QUEIMADAS RELATORIOS CABECALHO
=========================================================*/
function adicionarCabecalho(doc,titulo){

doc.setFillColor(15,23,42)

doc.rect(
0,
0,
210,
18,
'F'
)

doc.setTextColor(
255,
255,
255
)

doc.setFontSize(12)

doc.text(
'TCE-RO',
10,
12
)

doc.text(
titulo,
200,
12,
{
align:'right'
}
)

doc.setTextColor(
0,
0,
0
)
}
/*=========================================================
017 QUEIMADAS RELATORIOS RODAPE
=========================================================*/
function adicionarRodape(doc){

let total=
doc.internal.getNumberOfPages()

for(let i=1;i<=total;i++){

doc.setPage(i)

doc.setDrawColor(180)

doc.line(
10,
285,
200,
285
)

doc.setFontSize(8)

doc.text(
QR.fonte,
10,
290
)

doc.text(
'Página '+i,
200,
290,
{
align:'right'
}
)

}
}
/*=========================================================
014 QUEIMADAS RELATORIOS TOP MUNICIPIOS
=========================================================*/
async function adicionarTopMunicipios(doc){

let {data=[]}=await client
.from('queimadas_heatmap')
.select('*')

let lista=[...data]
.sort((a,b)=>
Number(b.risco||0)-
Number(a.risco||0)
)
.slice(0,10)

let y=40

doc.setFontSize(16)

doc.text(
'MUNICÍPIOS PRIORITÁRIOS',
15,
20
)

lista.forEach((m,i)=>{

doc.text(
`${i+1}º ${m.municipio}`,
20,
y
)

y+=10

})
}
/*=========================================================
013 QUEIMADAS RELATORIOS MUNICIPIOS
=========================================================*/
async function adicionarTabelaMunicipios(doc){

let {data=[]}=await client
.from('queimadas_municipios_oficio')
.select('*')
.order('municipio')

doc.autoTable({

startY:25,

head:[[
'Município',
'Situação',
'Documento'
]],

body:data.map(i=>[
i.municipio,
i.classificacao_ia||'-',
i.lnumerodocenviado||
i.llnumerodocenviado||
'-'
]),

styles:{
fontSize:7
}

})
}
/*=========================================================
010 QUEIMADAS RELATORIOS PAINEL
=========================================================*/
async function adicionarPaginaPainel(
doc,
titulo,
id
){

let img=
await capturarElemento(id)

if(!img)return

adicionarCabecalho(
doc,
titulo
)

doc.setFontSize(16)

doc.text(
titulo,
15,
30
)

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
015 QUEIMADAS RELATORIOS CONCLUSAO AUTOMATICA
=========================================================*/
async function gerarConclusaoAutomatica(){

let {data=[]}=await client
.from('queimadas_heatmap')
.select('*')

let criticos=
(data||[]).filter(i=>
String(i.classificacao||'')
.toUpperCase()
.includes('CRÍT')
).length

let altos=
(data||[]).filter(i=>
String(i.classificacao||'')
.toUpperCase()==='ALTO'
).length

let moderados=
(data||[]).filter(i=>
String(i.classificacao||'')
.toUpperCase()==='MODERADO'
).length

let baixos=
(data||[]).filter(i=>
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
.map((m,i)=>
`${i+1}º ${m.municipio}`
)
.join(', ')

return `
Foram identificados ${criticos} municípios classificados como CRÍTICO, ${altos} municípios classificados como ALTO, ${moderados} municípios classificados como MODERADO e ${baixos} municípios classificados como BAIXO risco de queimadas.

Os municípios que apresentam os maiores níveis de risco são: ${ranking}.

Os resultados indicam a necessidade de fortalecimento das ações preventivas, monitoramento contínuo, atualização dos planos municipais e atuação integrada entre Estado, Municípios, Defesa Civil, Corpo de Bombeiros Militar, Sedam e demais órgãos envolvidos.
`
}
/*=========================================================
015 QUEIMADAS RELATORIOS ANEXOS
=========================================================*/
function adicionarAnexos(doc){

doc.setFontSize(16)

doc.text(
'ANEXOS',
15,
20
)

let lista=[
'Mapa Executivo',
'Mapa Estadual',
'Heatmap',
'IRIQ',
'CHAP',
'IA-CHAP',
'Matriz 5x5',
'Municípios',
'Evidências'
]

let y=40

lista.forEach((a,i)=>{

doc.text(
`${i+1}. ${a}`,
20,
y
)

y+=10

})
}
/*=========================================================
016 QUEIMADAS RELATORIOS ASSINATURAS
=========================================================*/
function adicionarAssinaturas(doc){

doc.text(
'Manoel Fernandes Neto',
20,
100
)

doc.text(
'Auditor de Controle Externo',
20,
110
)

doc.text(
'Coordenador dos Trabalhos',
20,
120
)

doc.text(
'Luís Fernando Bueno',
120,
100
)

doc.text(
'Assessor Técnico',
120,
110
)

doc.text(
'Raimundo Paulo Dias Barros Vieira',
20,
160
)

doc.text(
'Supervisor dos Trabalhos',
20,
170
)
}
/*=========================================================
019 QUEIMADAS RELATORIOS ADICIONAR PAINEL
=========================================================*/
async function adicionarPainelPDF(doc,titulo,idElemento){
let el=document.getElementById(idElemento)
if(!el)return
let canvas=await html2canvas(el,{
scale:2,
backgroundColor:'#ffffff',
useCORS:true
})
let img=canvas.toDataURL('image/png')
doc.addPage()
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text(titulo,15,20)
doc.addImage(
img,
'PNG',
10,
30,
270,
150
)
}
/*=========================================================
020 QUEIMADAS RELATORIOS ASSINATURAS
=========================================================*/
function adicionarAssinaturasPDF(doc){

doc.setFont('helvetica','bold')
doc.setFontSize(18)

doc.text(
'ASSINATURAS',
15,
20
)

doc.setFontSize(12)

doc.text(
'Manoel Fernandes Neto',
20,
70
)

doc.line(
20,
72,
100,
72
)

doc.setFont(
'helvetica',
'normal'
)

doc.text(
'Auditor de Controle Externo',
20,
80
)

doc.text(
'Coordenador dos Trabalhos',
20,
88
)

doc.setFont(
'helvetica',
'bold'
)

doc.text(
'Luís Fernando Bueno',
150,
70
)

doc.line(
150,
72,
230,
72
)

doc.setFont(
'helvetica',
'normal'
)

doc.text(
'Assessor Técnico',
150,
80
)

doc.text(
'Apoio Técnico',
150,
88
)

}
/*=========================================================
021 QUEIMADAS RELATORIOS TABELAMUNICIPIOSPDF
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

styles:{
fontSize:7
},

headStyles:{
fillColor:[15,23,42]
},

alternateRowStyles:{
fillColor:[245,245,245]
}

})

}
/*=========================================================
022 QUEIMADAS RELATORIOS TOP10RISCOSPDF
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
i.municipio,
i.risco,
i.focos,
i.classificacao
]),

styles:{
fontSize:8
},

headStyles:{
fillColor:[127,29,29]
}

})

}
