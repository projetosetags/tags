/*=========================================================
000 MONITORAMENTO-PDF.JS TEXTO PADRÃO DISCLAIMER
=========================================================*/
const TEXTO_DISCLAIMER_MONITORAMENTO=
'As informações constantes neste painel, gráficos, indicadores e relatórios possuem caráter preliminar e meramente informativo, sendo baseadas nos dados declarados e apresentados até o presente momento pelos jurisdicionados envolvidos. Ressalta-se que tais informações ainda não passaram pela análise técnica de consistência documental, verificação de evidências, validação metodológica e conferência conclusiva pela equipe técnica de auditores designados.'
  
async function gerarPDFMonitoramento(){
const{jsPDF}=window.jspdf
let pdf=new jsPDF('p','mm','a4')
let largura=pdf.internal.pageSize.getWidth()
let y=20
pdf.setFillColor(15,23,42)
pdf.rect(0,0,210,32,'F')
pdf.setTextColor(255,255,255)
pdf.setFontSize(20)
pdf.setFont('helvetica','bold')
pdf.text('RELATÓRIO DE MONITORAMENTO',105,15,{align:'center'})
pdf.setFontSize(10)
pdf.text('Painel Técnico de Auditoria e Controle',105,23,{align:'center'})
pdf.setTextColor(0,0,0)
y=42
let canvasStatus=document.getElementById('graficoStatus')
if(canvasStatus){
let imgStatus=canvasStatus.toDataURL('image/png',1.0)
pdf.addImage(imgStatus,'PNG',10,y,90,55)
}
let canvasCriticidade=document.getElementById('graficoCriticidade')
if(canvasCriticidade){
let imgCrit=canvasCriticidade.toDataURL('image/png',1.0)
pdf.addImage(imgCrit,'PNG',110,y,90,55)
}
y+=65
let canvasEvolucao=document.getElementById('graficoEvolucao')
if(canvasEvolucao){
let imgEvolucao=canvasEvolucao.toDataURL('image/png',1.0)
pdf.addImage(imgEvolucao,'PNG',10,y,190,60)
}
y+=72
let dataAtual=new Date().toLocaleDateString('pt-BR')
pdf.setFontSize(11)
pdf.setFont('helvetica','normal')
pdf.text(`Data de emissão: ${dataAtual}`,14,y)
y+=10
let{data:monitoramentos,error:monitoramentoError}=await client.from('monitoramentos').select('*').order('titulo',{ascending:true})
if(monitoramentoError){
console.log(monitoramentoError)
return
}
for(let m of(monitoramentos||[])){
if(y>250){
pdf.addPage()
y=20
}
pdf.setFillColor(37,99,235)
pdf.roundedRect(10,y-5,190,12,3,3,'F')
pdf.setTextColor(255,255,255)
pdf.setFontSize(13)
pdf.setFont('helvetica','bold')
pdf.text(m.titulo||'-',14,y+3)
y+=16
pdf.setTextColor(0,0,0)
pdf.setFontSize(10)
pdf.text(`Órgão: ${m.orgao||'-'}`,14,y)
y+=6
pdf.text(`Processo: ${m.processo||'-'}`,14,y)
y+=6
pdf.text(`Acórdão: ${m.acordao||'-'}`,14,y)
y+=6
pdf.text(`Relator: ${m.relator||'-'}`,14,y)
y+=6
pdf.text(`Auditor: ${m.auditor_responsavel||'-'}`,14,y)
y+=6
pdf.text(`Status: ${m.status||'-'}`,14,y)
y+=6
pdf.text(`Origem: ${m.origem||'-'}`,14,y)
y+=10
let{data:itens,error:itensError}=await client.from('monitoramento_itens').select('*').eq('monitoramento_id',m.id)
itens=ordenarDataGlobal(itens)
if(itensError){
console.log(itensError)
continue
}
let body=[]
;(itens||[]).forEach(i=>{
body.push([
i.item||'-',
i.subitem||'-',
i.status||'-',
`${Number(i.percentual||0)}%`,
i.criticidade||'-'
])
})
pdf.autoTable({
startY:y,
head:[['Item','Subitem','Status','%','Criticidade']],
body:body,
theme:'grid',
headStyles:{
fillColor:[30,41,59],
textColor:[255,255,255],
fontStyle:'bold'
},
styles:{
fontSize:8,
cellPadding:2
},
margin:{
left:10,
right:10
}
})
y=pdf.lastAutoTable.finalY+12
for(let item of(itens||[])){
if(y>240){
pdf.addPage()
y=20
}
pdf.setFillColor(241,245,249)
pdf.roundedRect(10,y-4,190,10,2,2,'F')
pdf.setTextColor(0,0,0)
pdf.setFontSize(11)
pdf.setFont('helvetica','bold')
pdf.text(`ITEM ${item.item||'-'} - ${item.subitem||'-'}`,14,y+2)
y+=12
pdf.setFont('helvetica','normal')
pdf.setFontSize(9)
let bloco=''
bloco+=`DELIBERAÇÃO:\n`
bloco+=`${item.deliberacao||'-'}\n\n`
bloco+=`AÇÃO DO GESTOR:\n`
bloco+=`${item.acao_gestor||'-'}\n\n`
bloco+=`PRODUTO ESPERADO:\n`
bloco+=`${item.produto_esperado||'-'}\n\n`
bloco+=`BENEFÍCIO ESPERADO:\n`
bloco+=`${item.beneficio_esperado||'-'}\n\n`
let linhas=pdf.splitTextToSize(bloco,180)
pdf.text(linhas,14,y)
y+=linhas.length*5+8
let{data:analises}=await client.from('monitoramento_analises').select('*').eq('item_id',item.id).order('id',{ascending:false}).limit(1)
if(analises&&analises.length>0){
let a=analises[0]
if(y>230){
pdf.addPage()
y=20
}
pdf.setFillColor(220,252,231)
if(a.situacao==='PARCIALMENTE EXECUTADA'){
pdf.setFillColor(254,249,195)
}
if(a.situacao==='NÃO EXECUTADA'){
pdf.setFillColor(254,226,226)
}
pdf.roundedRect(10,y-4,190,10,2,2,'F')
pdf.setFont('helvetica','bold')
pdf.setFontSize(10)
pdf.text(`ANÁLISE TÉCNICA - ${a.situacao||'-'}`,14,y+2)
y+=12
pdf.setFont('helvetica','normal')
pdf.setFontSize(8)
let analiseTexto=pdf.splitTextToSize(a.analise_tecnica||'-',180)
pdf.text(analiseTexto,14,y)
y+=analiseTexto.length*4+10
}
let{data:evidencias}=await client.from('monitoramento_evidencias').select('*').eq('item_id',item.id)
if(evidencias&&evidencias.length>0){
if(y>230){
pdf.addPage()
y=20
}
pdf.setFont('helvetica','bold')
pdf.setFontSize(10)
pdf.text('EVIDÊNCIAS RELACIONADAS',14,y)
y+=6
let evidBody=[]
;(evidencias||[]).forEach(e=>{
evidBody.push([
e.tipo_evidencia||'-',
e.numero_documento||'-',
e.status_validacao||'-',
e.confiabilidade||'-'
])
})
pdf.autoTable({
startY:y,
head:[['Tipo','Documento','Validação','Confiabilidade']],
body:evidBody,
theme:'striped',
styles:{
fontSize:7
},
headStyles:{
fillColor:[37,99,235]
},
margin:{
left:10,
right:10
}
})
y=pdf.lastAutoTable.finalY+10
}
}
}
if(y>240){
pdf.addPage()
y=20
}
pdf.setFillColor(15,23,42)
pdf.roundedRect(10,y,190,28,4,4,'F')
pdf.setTextColor(255,255,255)
pdf.setFontSize(12)
pdf.setFont('helvetica','bold')
pdf.text('CONCLUSÃO GERAL',14,y+8)
pdf.setFont('helvetica','italic')
pdf.setFontSize(7)
let disclaimerConclusao=pdf.splitTextToSize(
TEXTO_DISCLAIMER_MONITORAMENTO,
176
)
pdf.text(
disclaimerConclusao,
14,
y+14
)
y+=18
pdf.setFont('helvetica','normal')
pdf.setFontSize(9)
pdf.setFont('helvetica','normal')
pdf.setFontSize(9)
let conclusao='O presente relatório consolida as análises técnicas realizadas pela equipe de auditoria, considerando as evidências apresentadas, os resultados alcançados e os benefícios decorrentes das ações implementadas pelos gestores monitorados.'
let linhasConclusao=pdf.splitTextToSize(conclusao,176)
pdf.text(linhasConclusao,14,y+16)
pdf.setFontSize(8)
let paginas=pdf.internal.getNumberOfPages()
for(let i=1;i<=paginas;i++){
pdf.setPage(i)
pdf.setTextColor(120)
pdf.text(`Página ${i} de ${paginas}`,105,290,{align:'center'})
pdf.text('Relatório Técnico de Monitoramento',14,290)
pdf.setFontSize(6)
pdf.setTextColor(110)
let disclaimerLinhas=pdf.splitTextToSize(
TEXTO_DISCLAIMER_MONITORAMENTO,
180
)
pdf.text(
disclaimerLinhas,
14,
282
)
}
pdf.save(`RELATORIO_MONITORAMENTO_${Date.now()}.pdf`)
}

/*=========================================================
999 MONITORAMENTO-PDF.JS PDF DASHBOARD COMPLETO
=========================================================*/
async function gerarPDFDashboardCompleto(){

let{jsPDF}=window.jspdf

let pdf=new jsPDF(
'landscape',
'mm',
'a4'
)

let largura=pdf.internal.pageSize.getWidth()
let altura=pdf.internal.pageSize.getHeight()

pdf.setFillColor(5,10,30)
pdf.rect(0,0,largura,altura,'F')

pdf.setTextColor(255,255,255)

pdf.setFontSize(24)
pdf.text(
'MONITORAMENTO TÉCNICO',
14,
18
)

pdf.setFontSize(11)
pdf.text(
'Tribunal de Contas • Dashboard Executivo',
14,
26
)
pdf.setFontSize(7)
pdf.setTextColor(180,180,180)
pdf.text(
TEXTO_DISCLAIMER_MONITORAMENTO,
14,
32,
{maxWidth:250}
)
pdf.setTextColor(255,255,255)
let origem='TODAS'

let filtro=document.getElementById('filtroOrigem')

if(filtro){
origem=filtro.value||'TODAS'
}

pdf.setFontSize(10)
pdf.text(
'Origem: '+origem,
14,
34
)

let usuario=
USER_MONITORAMENTO?.nome_completo||
USER_MONITORAMENTO?.username||
'USUÁRIO'

pdf.text(
'Usuário: '+usuario,
90,
34
)

let total=document.getElementById('kpiTotal')?.innerText||'0'
let exec=document.getElementById('kpiExecutadas')?.innerText||'0'
let parcial=document.getElementById('kpiParciais')?.innerText||'0'
let nao=document.getElementById('kpiNaoExecutadas')?.innerText||'0'
let andamento=document.getElementById('kpiAndamento')?.innerText||'0'

function card(x,y,titulo,valor,cor){

pdf.setFillColor(cor[0],cor[1],cor[2])

pdf.roundedRect(
x,
y,
48,
26,
4,
4,
'F'
)

pdf.setTextColor(255,255,255)

pdf.setFontSize(9)

pdf.text(
titulo,
x+4,
y+8
)

pdf.setFontSize(20)

pdf.text(
String(valor),
x+4,
y+19
)

}

card(14,42,'TOTAL',total,[30,41,59])
card(66,42,'EXECUTADAS',exec,[16,185,129])
card(118,42,'PARCIAIS',parcial,[245,158,11])
card(170,42,'NÃO EXECUTADAS',nao,[239,68,68])
card(222,42,'EM ANDAMENTO',andamento,[59,130,246])

let graficoStatus=document.getElementById('graficoStatus')

if(graficoStatus){

let img=graficoStatus.toDataURL(
'image/png',
1.0
)

pdf.addImage(
img,
'PNG',
12,
78,
120,
72
)

}

let graficoEvolucao=document.getElementById('graficoEvolucao')

if(graficoEvolucao){

let img=graficoEvolucao.toDataURL(
'image/png',
1.0
)

pdf.addImage(
img,
'PNG',
145,
78,
120,
72
)

}

pdf.setFontSize(9)

pdf.setTextColor(220,220,220)

pdf.text(
'Painel gerado automaticamente pelo Monitoramento Técnico.',
14,
196
)

pdf.setFontSize(6)

let disclaimerDashboard=
pdf.splitTextToSize(
TEXTO_DISCLAIMER_MONITORAMENTO,
230
)

pdf.text(
disclaimerDashboard,
14,
186
)

pdf.setFontSize(8)

pdf.text(
'Página 1 de 1',
258,
196
)

pdf.save(
'dashboard-monitoramento.pdf'
)

}
