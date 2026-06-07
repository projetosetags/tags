/*=========================================================
400 QUEIMADAS RT PDF TECNICO 0501
=========================================================*/
async function gerarPDFTecnico0501(){
const {jsPDF}=window.jspdf
let doc=new jsPDF('p','mm','a4')
await rtCapa(doc)
doc.addPage()
await rtIntroducao(doc)
doc.addPage()
await rtObjeto(doc)
doc.addPage()
await rtMetodologia(doc)
doc.addPage()
await rtSituacaoEstadual(doc)
doc.addPage()
await rtAnaliseMunicipal(doc)
doc.addPage()
await rtHeatmap(doc)
doc.addPage()
await rtIRIQ(doc)
doc.addPage()
await rtCHAP(doc)
doc.addPage()
await rtIACHAP(doc)
doc.addPage()
await rtMatrizRisco(doc)
doc.addPage()
await rtMunicipiosCriticos(doc)
doc.addPage()
await rtAchados(doc)
doc.addPage()
await rtEvidencias(doc)
doc.addPage()
await rtConclusoes(doc)
doc.addPage()
await rtPropostas(doc)
doc.addPage()
await rtAnexos(doc)
doc.addPage()
await rtAssinaturas(doc)
doc.save(
'RT_PCe_0501_2026_QUEIMADAS.pdf'
)
}
/*=========================================================
401 RT CAPA
=========================================================*/
async function rtCapa(doc){
doc.setFont('helvetica','bold')
doc.setFontSize(18)
doc.text('TRIBUNAL DE CONTAS DO ESTADO DE RONDÔNIA',105,35,{align:'center'})
doc.setFontSize(16)
doc.text('PCe 0501/2026',105,65,{align:'center'})
doc.text('MONITORAMENTO DAS QUEIMADAS',105,85,{align:'center'})
doc.setFontSize(14)
doc.text('RELATÓRIO TÉCNICO',105,105,{align:'center'})
doc.setFontSize(10)
doc.text(new Date().toLocaleDateString('pt-BR'),105,260,{align:'center'})
}
/*=========================================================
402 RT INTRODUCAO
=========================================================*/
async function rtIntroducao(doc){
doc.setFontSize(16)
doc.text('1. INTRODUÇÃO',15,20)
let texto=`
O presente relatório técnico apresenta os resultados do monitoramento das ações de prevenção, preparação, resposta e mitigação relacionadas às queimadas e incêndios florestais no Estado de Rondônia.
`
let linhas=doc.splitTextToSize(texto,180)
doc.text(linhas,15,35)
}
/*=========================================================
403 RT OBJETO
=========================================================*/
async function rtObjeto(doc){
doc.setFontSize(16)
doc.text('2. OBJETO',15,20)
let texto=`
Avaliar a implementação dos planos de ação estaduais e municipais destinados ao enfrentamento das queimadas e incêndios florestais.
`
doc.text(doc.splitTextToSize(texto,180),15,35)
}
/*=========================================================
404 RT METODOLOGIA
=========================================================*/
async function rtMetodologia(doc){
doc.setFontSize(16)
doc.text('3. METODOLOGIA',15,20)
let texto=`
Foram utilizados os modelos CHAP, IA-CHAP, Heatmap Estadual, IRIQ, Matriz de Risco 5x5 e monitoramento contínuo das bases de dados institucionais.
`
doc.text(doc.splitTextToSize(texto,180),15,35)
}
/*=========================================================
405 RT SITUACAO ESTADUAL
=========================================================*/
async function rtSituacaoEstadual(doc){
doc.setFontSize(16)
doc.text('4. SITUAÇÃO ESTADUAL',15,20)
let painel=
document.getElementById('painelIRIQHeatmapUnificado')
if(!painel)return
doc.setFontSize(10)
doc.text(doc.splitTextToSize(painel.innerText,180),15,35)
}
/*=========================================================
410 RT MUNICIPIOS CRITICOS
=========================================================*/
async function rtMunicipiosCriticos(doc){
doc.setFontSize(16)
doc.text('10. MUNICÍPIOS CRÍTICOS',15,20)
let {data=[]}=await client
.from('queimadas_heatmap')
.select('*')
let top=[...data]
.sort((a,b)=>
Number(b.risco||0)-
Number(a.risco||0)
)
.slice(0,6)
let y=40
top.forEach((m,i)=>{
doc.text(`${i+1}º ${m.municipio} - IRIQ ${m.iriq}`,20,y)
y+=12
})
}
/*=========================================================
411 RT ACHADOS
=========================================================*/
async function rtAchados(doc){
doc.setFontSize(16)
doc.text('11. ACHADOS',15,20)
let y=40
doc.text('• Municípios sem resposta ao Ofício Circular.',20,y)
y+=10
doc.text('• Municípios com dilação de prazo.',20,y)
y+=10
doc.text('• Municípios sem plano de ação apresentado.',20,y)
y+=10
doc.text('• Áreas críticas identificadas pelo Heatmap.',20,y)
}
/*=========================================================
412 RT CONCLUSOES
=========================================================*/
async function rtConclusoes(doc){
doc.setFontSize(16)
doc.text('12. CONCLUSÕES',15,20)
let texto=`
Os dados demonstram necessidade de fortalecimento das ações preventivas, monitoramento contínuo e integração institucional para redução dos riscos de queimadas.
`
doc.text(doc.splitTextToSize(texto,180),15,35)
}
/*=========================================================
413 RT PROPOSTAS
=========================================================*/
async function rtPropostas(doc){
doc.setFontSize(16)
doc.text('13. PROPOSTAS DE ENCAMINHAMENTO',15,20)
let propostas=[
'Fortalecer governança estadual.',
'Atualizar planos municipais.',
'Implementar monitoramento contínuo.',
'Expandir uso do IA-CHAP.',
'Priorizar municípios críticos.'
]
let y=40
propostas.forEach(p=>{doc.text('• '+p,20,y)
y+=10
})
}
/*=========================================================
416 RT ASSINATURAS
=========================================================*/
async function rtAssinaturas(doc){
doc.text('Manoel Fernandes Neto',20,90)
doc.text('Auditor de Controle Externo',20,100)
doc.text('Coordenador dos Trabalhos',20,110)
doc.text('Luís Fernando Bueno',120,90)
doc.text('Assessor Técnico',120,100)}
/*=========================================================
406 RT ANALISE MUNICIPAL
=========================================================*/
async function rtAnaliseMunicipal(doc){
doc.setFontSize(16)
doc.text('5. ANÁLISE MUNICIPAL',15,20)
}

/*=========================================================
407 RT HEATMAP
=========================================================*/
async function rtHeatmap(doc){
doc.setFontSize(16)
doc.text('6. HEATMAP ESTADUAL',15,20)
}

/*=========================================================
408 RT IRIQ
=========================================================*/
async function rtIRIQ(doc){
doc.setFontSize(16)
doc.text('7. IRIQ ESTADUAL',15,20)
}

/*=========================================================
409 RT CHAP
=========================================================*/
async function rtCHAP(doc){
doc.setFontSize(16)
doc.text('8. CHAP',15,20)
}

/*=========================================================
410 RT IA-CHAP
=========================================================*/
async function rtIACHAP(doc){
doc.setFontSize(16)
doc.text('9. IA-CHAP',15,20)
}

/*=========================================================
411 RT MATRIZ 5X5
=========================================================*/
async function rtMatrizRisco(doc){
doc.setFontSize(16)
doc.text('10. MATRIZ DE RISCO 5X5',15,20)
}

/*=========================================================
414 RT EVIDENCIAS
=========================================================*/
async function rtEvidencias(doc){
doc.setFontSize(16)
doc.text('14. EVIDÊNCIAS',15,20)
}

/*=========================================================
415 RT ANEXOS
=========================================================*/
async function rtAnexos(doc){
doc.setFontSize(16)
doc.text('15. ANEXOS',15,20)
}
