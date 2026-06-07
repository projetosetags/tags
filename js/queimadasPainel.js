/*=========================================================
001 QUEIMADASPAINEL FUNCTION GERARPDFEXECUTIVOTCERO
=========================================================*/
async function gerarPDFExecutivoTCERO(){
const {jsPDF}=window.jspdf
let doc=new jsPDF('p','mm','a4')
let y=20

await qpCapa(doc)
doc.addPage()

await qpSumario(doc)
doc.addPage()

await qpDashboardExecutivo(doc)
doc.addPage()

await qpMapaEstadual(doc)
doc.addPage()

await qpHeatmap(doc)
doc.addPage()

await qpMunicipiosPrioritarios(doc)
doc.addPage()

await qpFocosCalor(doc)
doc.addPage()

await qpAlertas(doc)
doc.addPage()

await qpUCs(doc)
doc.addPage()

await qpIndicadores(doc)
doc.addPage()

await qpExecutivoMunicipal(doc)
doc.addPage()

await qpPlanejamento(doc)
doc.addPage()

await qpGovernanca(doc)
doc.addPage()

await qpMonitoramento(doc)
doc.addPage()

await qpIACHAP(doc)
doc.addPage()

await qpSalaSituacao(doc)
doc.addPage()

await qpConclusao(doc)
doc.addPage()

await qpAssinaturas(doc)

doc.save(
'RELATORIO_EXECUTIVO_QUEIMADAS_2026.pdf'
)
}

/*=========================================================
002 CAPA
=========================================================*/
async function qpCapa(doc){
doc.setFont('helvetica','bold')
doc.setFontSize(20)
doc.text(
'TRIBUNAL DE CONTAS DO ESTADO DE RONDÔNIA',
105,
40,
{align:'center'}
)
doc.setFontSize(16)
doc.text(
'QUEIMADAS 2026',
105,
70,
{align:'center'}
)
doc.setFontSize(14)
doc.text(
'RELATÓRIO EXECUTIVO',
105,
85,
{align:'center'}
)
doc.setFontSize(11)
doc.text(
new Date().toLocaleDateString('pt-BR'),
105,
250,
{align:'center'}
)
}

/*=========================================================
003 SUMARIO
=========================================================*/
async function qpSumario(doc){
doc.setFontSize(16)
doc.text('SUMÁRIO',15,20)

let itens=[
'Dashboard Executivo',
'Mapa Estadual',
'Heatmap Estadual',
'Municípios Prioritários',
'Focos de Calor',
'Alertas',
'Unidades de Conservação',
'Indicadores Estratégicos',
'Executivo Municipal',
'Planejamento',
'Governança',
'Monitoramento',
'IA CHAP',
'Sala de Situação',
'Conclusões'
]

let y=40

itens.forEach((i,n)=>{
doc.text(
(n+1)+'. '+i,
20,
y
)
y+=10
})
}

/*=========================================================
004 DASHBOARD EXECUTIVO
=========================================================*/
async function qpDashboardExecutivo(doc){
doc.setFontSize(16)
doc.text(
'DASHBOARD EXECUTIVO',
15,
20
)

let painel=
document.getElementById('painelKPIs')

if(!painel)return

doc.setFontSize(10)

doc.text(
painel.innerText.substring(0,4000),
15,
35
)
}

/*=========================================================
005 MAPA ESTADUAL
=========================================================*/
async function qpMapaEstadual(doc){
doc.setFontSize(16)
doc.text(
'MAPA ESTADUAL',
15,
20
)

if(window.mapaRO){

doc.setFontSize(10)

doc.text(
'Mapa Estadual de Risco de Queimadas.',
15,
40
)

}
}

/*=========================================================
006 HEATMAP
=========================================================*/
async function qpHeatmap(doc){
doc.setFontSize(16)
doc.text(
'HEATMAP ESTADUAL',
15,
20
)

let painel=
document.getElementById(
'painelIRIQHeatmapUnificado'
)

if(!painel)return

doc.setFontSize(10)

doc.text(
painel.innerText.substring(0,5000),
15,
40
)
}

/*=========================================================
007 MUNICIPIOS PRIORITARIOS
=========================================================*/
async function qpMunicipiosPrioritarios(doc){

doc.setFontSize(16)

doc.text(
'MUNICÍPIOS PRIORITÁRIOS',
15,
20
)

let painel=
document.getElementById(
'painelMunicipiosPrioritarios'
)

if(!painel)return

doc.setFontSize(10)

doc.text(
painel.innerText.substring(0,5000),
15,
40
)
}

/*=========================================================
008 FOCOS DE CALOR
=========================================================*/
async function qpFocosCalor(doc){
doc.setFontSize(16)
doc.text(
'FOCOS DE CALOR',
15,
20
)

let painel=
document.getElementById(
'painelFocosINPE'
)

if(!painel)return

doc.setFontSize(10)

doc.text(
painel.innerText.substring(0,5000),
15,
40
)
}

/*=========================================================
009 ALERTAS
=========================================================*/
async function qpAlertas(doc){
doc.setFontSize(16)
doc.text(
'ALERTAS AUTOMÁTICOS',
15,
20
)

let painel=
document.getElementById(
'painelAlertas'
)

if(!painel)return

doc.setFontSize(10)

doc.text(
painel.innerText.substring(0,5000),
15,
40
)
}

/*=========================================================
010 UCS
=========================================================*/
async function qpUCs(doc){
doc.setFontSize(16)
doc.text(
'UNIDADES DE CONSERVAÇÃO',
15,
20
)

let painel=
document.getElementById(
'painelUCs'
)

if(!painel)return

doc.setFontSize(10)

doc.text(
painel.innerText.substring(0,5000),
15,
40
)
}

/*=========================================================
011 INDICADORES
=========================================================*/
async function qpIndicadores(doc){
doc.setFontSize(16)
doc.text(
'INDICADORES ESTRATÉGICOS',
15,
20
)

let painel=
document.getElementById(
'painelIndicadoresEstrategicos'
)

if(!painel)return

doc.setFontSize(10)

doc.text(
painel.innerText.substring(0,5000),
15,
40
)
}

/*=========================================================
012 EXECUTIVO MUNICIPAL
=========================================================*/
async function qpExecutivoMunicipal(doc){
doc.setFontSize(16)
doc.text(
'EXECUTIVO MUNICIPAL',
15,
20
)

let painel=
document.getElementById(
'painelEstatisticasMunicipais'
)

if(!painel)return

doc.setFontSize(10)

doc.text(
painel.innerText.substring(0,5000),
15,
40
)
}

/*=========================================================
013 PLANEJAMENTO
=========================================================*/
async function qpPlanejamento(doc){
doc.setFontSize(16)
doc.text(
'PLANEJAMENTO',
15,
20
)
}

/*=========================================================
014 GOVERNANCA
=========================================================*/
async function qpGovernanca(doc){
doc.setFontSize(16)
doc.text(
'GOVERNANÇA',
15,
20
)
}

/*=========================================================
015 MONITORAMENTO
=========================================================*/
async function qpMonitoramento(doc){
doc.setFontSize(16)
doc.text(
'MONITORAMENTO',
15,
20
)
}

/*=========================================================
016 IA CHAP
=========================================================*/
async function qpIACHAP(doc){
doc.setFontSize(16)
doc.text(
'IA CHAP',
15,
20
)
}

/*=========================================================
017 SALA SITUACAO
=========================================================*/
async function qpSalaSituacao(doc){
doc.setFontSize(16)
doc.text(
'SALA DE SITUAÇÃO',
15,
20
)
}

/*=========================================================
018 CONCLUSAO
=========================================================*/
async function qpConclusao(doc){
doc.setFontSize(16)
doc.text(
'CONCLUSÕES',
15,
20
)
}

/*=========================================================
019 ASSINATURAS
=========================================================*/
async function qpAssinaturas(doc){

doc.setFontSize(12)

doc.text(
'Manoel Fernandes Neto',
20,
80
)

doc.text(
'Auditor de Controle Externo',
20,
90
)

doc.text(
'Coordenador dos Trabalhos',
20,
100
)
}
/*=========================================================
020 QUEIMADASPAINEL FUNCTION CAPTURARPAINEL
=========================================================*/
async function capturarPainel(id){
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
021 QUEIMADASPAINEL FUNCTION ADDMAPAEXECUTIVO
=========================================================*/
async function addMapaExecutivoImagem(doc){

let img=await capturarPainel('mapaRO')

if(!img)return

doc.setFontSize(16)

doc.text(
'MAPA EXECUTIVO DE RISCO DE QUEIMADAS',
15,
20
)

doc.addImage(
img,
'PNG',
10,
30,
190,
120
)
}
/*=========================================================
022 QUEIMADASPAINEL FUNCTION ADDMAPAESTADUAL
=========================================================*/
async function addMapaEstadualImagem(doc){

let img=await capturarPainel(
'mapaROEstadual'
)

if(!img)return

doc.setFontSize(16)

doc.text(
'MAPA ESTADUAL',
15,
20
)

doc.addImage(
img,
'PNG',
10,
30,
190,
120
)
}
/*=========================================================
023 QUEIMADASPAINEL FUNCTION ADDHEATMAP
=========================================================*/
async function addHeatmapImagem(doc){

let img=
await capturarPainel(
'painelIRIQHeatmapUnificado'
)

if(!img)return

doc.setFontSize(16)

doc.text(
'HEATMAP ESTADUAL',
15,
20
)

doc.addImage(
img,
'PNG',
10,
30,
190,
110
)
}
/*=========================================================
024 QUEIMADASPAINEL FUNCTION CAPTURARGRAFICO
=========================================================*/
function capturarGrafico(id){

let canvas=
document.getElementById(id)

if(!canvas)return null

return canvas.toDataURL(
'image/png',
1
)
}
/*=========================================================
025 QUEIMADASPAINEL FUNCTION ADDGRAFICOMUNICIPIOS
=========================================================*/
async function addGraficoMunicipios(doc){

let img=
capturarGrafico(
'graficoMunicipiosResposta'
)

if(!img)return

doc.setFontSize(16)

doc.text(
'DISTRIBUIÇÃO DAS RESPOSTAS',
15,
20
)

doc.addImage(
img,
'PNG',
20,
35,
160,
110
)
}
/*=========================================================
026 QUEIMADASPAINEL FUNCTION CABECALHO
=========================================================*/
function qpCabecalho(doc,titulo){

doc.setFillColor(
15,
23,
42
)

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
'TCE-RO • QUEIMADAS 2026',
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
027 QUEIMADASPAINEL FUNCTION RODAPE
=========================================================*/
function qpRodape(doc){

let pagina=
doc.internal.getNumberOfPages()

for(let i=1;i<=pagina;i++){

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
'Fonte: TCE-RO • INPE • SEDAM • CBMRO',
10,
290
)

doc.text(
'Página '+i,
195,
290,
{
align:'right'
}
)

}
}
