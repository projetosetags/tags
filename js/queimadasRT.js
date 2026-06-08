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
406 RT ANALISE MUNICIPAL
=========================================================*/
async function rtAnaliseMunicipal(doc){
doc.setFontSize(16)
doc.text('5. ANÁLISE MUNICIPAL',15,20)
let {data=[]}=await client.from('queimadas_municipios_oficio').select('*')
let total=data.length
let respondidos=data.filter(i=>String(i.classificacao_ia||'').toUpperCase().includes('PLANO')).length
let dilacao=data.filter(i=>String(i.classificacao_ia||'').toUpperCase().includes('DILA')).length
let semResposta=total-respondidos-dilacao
let texto=`Foram avaliados ${total} municípios. Identificaram-se ${respondidos} municípios com plano apresentado, ${dilacao} com dilação de prazo e ${semResposta} sem resposta ao Ofício Circular n.16/2026/GABPRES/TCERO.`
doc.setFontSize(10)
doc.text(doc.splitTextToSize(texto,180),15,35)
let img=await capturarElemento('painelEstatisticasMunicipais')
if(img){
doc.addImage(img,'PNG',10,55,190,80)
}
doc.setFontSize(9)
doc.text(doc.splitTextToSize('Os resultados demonstram diferentes níveis de maturidade institucional entre os municípios, exigindo acompanhamento contínuo, priorização dos entes sem resposta e fortalecimento da governança local para enfrentamento das queimadas.',180),15,145)
}

/*=========================================================
407 RT HEATMAP
=========================================================*/
async function rtHeatmap(doc){
doc.setFontSize(16)
doc.text('6. HEATMAP ESTADUAL',15,20)
let texto='O Heatmap Estadual consolida a distribuição espacial dos níveis de risco de queimadas nos municípios rondonienses, permitindo identificar áreas críticas e apoiar a priorização das ações preventivas e de resposta.'
doc.setFontSize(10)
doc.text(doc.splitTextToSize(texto,180),15,35)
let img=await capturarElemento('painelIRIQHeatmapUnificado')
if(img){
doc.addImage(img,'PNG',10,55,190,80)
}
doc.setFontSize(9)
doc.text(doc.splitTextToSize('A análise evidencia concentração de risco em determinados territórios, reforçando a necessidade de ações integradas entre Estado, municípios e órgãos de fiscalização.',180),15,145)
}

/*=========================================================
408 RT IRIQ
=========================================================*/
async function rtIRIQ(doc){
doc.setFontSize(16)
doc.text('7. IRIQ ESTADUAL',15,20)
let texto='O Índice de Risco Integrado de Queimadas considera focos de calor, histórico de queimadas, cobertura vegetal, uso do solo, clima e vulnerabilidade ambiental, permitindo priorização territorial baseada em evidências.'
doc.setFontSize(10)
doc.text(doc.splitTextToSize(texto,180),15,35)
let img=await capturarElemento('painelMunicipiosPrioritarios')
if(img){
doc.addImage(img,'PNG',10,55,190,80)
}
doc.setFontSize(9)
doc.text(doc.splitTextToSize('Os municípios com maiores índices devem receber atenção prioritária das ações preventivas, operacionais e de monitoramento contínuo.',180),15,145)
}

/*=========================================================
409 RT CHAP
=========================================================*/
async function rtCHAP(doc){
doc.setFontSize(16)
doc.text('8. CHAP',15,20)
let texto='O modelo CHAP constitui metodologia estruturada para avaliação de cenários de risco, vulnerabilidade e capacidade de resposta institucional relacionada às queimadas e incêndios florestais.'
doc.setFontSize(10)
doc.text(doc.splitTextToSize(texto,180),15,35)
let img=await capturarElemento('painelCHAP')
if(img){
doc.addImage(img,'PNG',10,55,190,80)
}
doc.setFontSize(9)
doc.text(doc.splitTextToSize('Os resultados do CHAP subsidiam a definição de prioridades estratégicas e operacionais para redução dos riscos identificados.',180),15,145)
}

/*=========================================================
410 RT IA-CHAP
=========================================================*/
async function rtIACHAP(doc){
doc.setFontSize(16)
doc.text('9. IA-CHAP',15,20)
let texto='A metodologia IA-CHAP utiliza inteligência artificial para ampliar a capacidade analítica do modelo CHAP, permitindo identificar padrões, tendências e recomendações automatizadas.'
doc.setFontSize(10)
doc.text(doc.splitTextToSize(texto,180),15,35)
let img=await capturarElemento('painelIAChap')
if(img){
doc.addImage(img,'PNG',10,55,190,80)
}
doc.setFontSize(9)
doc.text(doc.splitTextToSize('As análises produzidas pela IA contribuem para a tomada de decisão baseada em evidências e para a otimização da alocação de recursos.',180),15,145)
}
/*=========================================================
411 RT MATRIZ 5X5
=========================================================*/
async function rtMatrizRisco(doc){
doc.setFontSize(16)
doc.text('10. MATRIZ DE RISCO 5X5',15,20)
let texto='A Matriz de Risco 5x5 combina probabilidade e impacto para classificar eventos relacionados às queimadas, permitindo avaliação padronizada e priorização de respostas.'
doc.setFontSize(10)
doc.text(doc.splitTextToSize(texto,180),15,35)
let img=await capturarElemento('painelMatriz5x5')
if(img){
doc.addImage(img,'PNG',10,55,190,80)
}
doc.setFontSize(9)
doc.text(doc.splitTextToSize('Os riscos classificados como altos e críticos demandam monitoramento permanente e medidas preventivas imediatas.',180),15,145)
}
/*=========================================================
412 RT MUNICIPIOS CRITICOS
=========================================================*/
async function rtMunicipiosCriticos(doc){
doc.setFontSize(16)
doc.text('11. MUNICÍPIOS CRÍTICOS',15,20)
let {data=[]}=await client.from('queimadas_heatmap').select('*')
let top=[...data].sort((a,b)=>Number(b.risco||0)-Number(a.risco||0)).slice(0,10)
doc.autoTable({
startY:35,
head:[['POSIÇÃO','MUNICÍPIO','IRIQ','RISCO','CLASSIFICAÇÃO','FOCOS']],
body:top.map((m,i)=>[
i+1,
m.municipio||'-',
m.iriq||'-',
m.risco||'-',
m.classificacao||'-',
m.focos||'-'
]),
styles:{fontSize:8},
headStyles:{fillColor:[127,29,29]}
})
}
/*=========================================================
413 RT ACHADOS
=========================================================*/
async function rtAchados(doc){
doc.setFontSize(16)
doc.text('12. ACHADOS DE AUDITORIA',15,20)
let y=40
doc.setFontSize(10)
doc.text('• Municípios que não responderam ao Ofício Circular n.16/2026/GABPRES/TCERO.',20,y)
y+=12
doc.text('• Municípios que solicitaram dilação de prazo para apresentação dos planos de ação.',20,y)
y+=12
doc.text('• Municípios que não apresentaram plano de ação ou documentação suficiente.',20,y)
y+=12
doc.text('• Áreas classificadas como críticas e altas pelo Heatmap Estadual.',20,y)
y+=12
doc.text('• Concentração de focos de calor em municípios prioritários segundo o IRIQ.',20,y)
y+=12
doc.text('• Necessidade de fortalecimento da governança interfederativa para prevenção e resposta.',20,y)
y+=20
let texto='Os achados demonstram fragilidades na capacidade institucional de parte dos municípios para planejamento, prevenção e resposta aos eventos relacionados às queimadas, exigindo acompanhamento contínuo e ações coordenadas entre Estado, municípios e órgãos de controle.'
doc.text(doc.splitTextToSize(texto,180),15,y)
}
/*=========================================================
414 RT EVIDENCIAS
=========================================================*/
async function rtEvidencias(doc){
doc.setFontSize(16)
doc.text('13. EVIDÊNCIAS',15,20)
let texto='Foram analisadas evidências documentais provenientes da SEDAM, Corpo de Bombeiros Militar, municípios, bases do INPE, sistemas institucionais, documentos encaminhados em resposta ao Ofício Circular n.16/2026/GABPRES/TCERO e demais fontes oficiais utilizadas no monitoramento.'
doc.setFontSize(10)
doc.text(doc.splitTextToSize(texto,180),15,35)
let img=await capturarElemento('painelEvidencias')
if(img){
doc.addImage(img,'PNG',10,60,190,80)
}
doc.setFontSize(9)
doc.text(doc.splitTextToSize('As evidências analisadas subsidiam os achados, conclusões e propostas apresentadas neste relatório técnico, assegurando rastreabilidade e fundamentação das análises realizadas.',180),15,150)
}
}
/*=========================================================
415 RT CONCLUSOES
=========================================================*/
async function rtConclusoes(doc){
doc.setFontSize(16)
doc.text('14. CONCLUSÕES',15,20)
let texto='Os resultados do monitoramento evidenciam avanços na estruturação das ações de enfrentamento às queimadas em Rondônia, porém persistem riscos relevantes decorrentes de limitações institucionais, ausência de respostas por parte de alguns municípios, fragilidades de planejamento e necessidade de fortalecimento da coordenação interinstitucional.'
doc.setFontSize(10)
doc.text(doc.splitTextToSize(texto,180),15,35)
doc.text(doc.splitTextToSize('O Heatmap Estadual, o IRIQ, o CHAP, o IA-CHAP e a Matriz de Risco 5x5 demonstram que parte significativa do território estadual permanece exposta a riscos elevados, exigindo monitoramento permanente, atualização dos planos de ação e integração das estruturas operacionais estaduais e municipais.',180),15,70)
doc.text(doc.splitTextToSize('Conclui-se pela necessidade de continuidade do acompanhamento técnico e institucional das medidas previstas nos planos de ação, especialmente nos municípios classificados com risco alto e crítico.',180),15,115)
}
/*=========================================================
416 RT PROPOSTAS
=========================================================*/
async function rtPropostas(doc){
doc.setFontSize(16)
doc.text('15. PROPOSTAS DE ENCAMINHAMENTO',15,20)
let propostas=[
'Fortalecer a governança estadual para enfrentamento das queimadas.',
'Atualizar e monitorar continuamente os planos municipais de ação.',
'Priorizar os municípios classificados como críticos e altos pelo IRIQ.',
'Expandir a utilização do modelo IA-CHAP para suporte à tomada de decisão.',
'Integrar bases de dados estaduais, municipais e federais.',
'Fortalecer ações preventivas antes do período crítico de estiagem.',
'Monitorar periodicamente a execução física e financeira dos planos.',
'Manter sala de situação permanente para acompanhamento dos riscos.',
'Intensificar ações de fiscalização e controle ambiental.',
'Promover capacitação contínua das equipes envolvidas.'
]
let y=40
doc.setFontSize(10)
propostas.forEach((p,i)=>{
doc.text((i+1)+'. '+p,20,y)
y+=10
})
}
/*=========================================================
417 RT ANEXOS
=========================================================*/
async function rtAnexos(doc){
doc.setFontSize(16)
doc.text('16. ANEXOS',15,20)
let anexos=[
'Mapa Executivo de Risco de Queimadas.',
'Mapa Estadual de Rondônia.',
'Heatmap Estadual.',
'IRIQ Estadual.',
'Painel CHAP.',
'Painel IA-CHAP.',
'Matriz de Risco 5x5.',
'Tabela Consolidada dos Municípios.',
'Planos de Ação Estaduais.',
'Planos de Ação Municipais.',
'Evidências Documentais.',
'Monitoramento 4D.',
'Indicadores Estratégicos.',
'Relatórios Gerenciais.',
'Demais documentos de suporte utilizados na análise.'
]
let y=40
doc.setFontSize(10)
anexos.forEach((a,i)=>{
doc.text((i+1)+'. '+a,20,y)
y+=10
})
doc.setFontSize(9)
doc.text(doc.splitTextToSize('Os anexos integram o presente relatório técnico e constituem parte das evidências e informações utilizadas para fundamentação das análises, conclusões e propostas apresentadas.',180),15,220)
}
/*=========================================================
418 RT ASSINATURAS
=========================================================*/
async function rtAssinaturas(doc){
doc.setFont('helvetica','bold')
doc.text('Manoel Fernandes Neto',20,90)
doc.line(20,92,90,92)
doc.setFont('helvetica','normal')
doc.text('Auditor de Controle Externo',20,100)
doc.text('Matrícula n. 275',20,108)
doc.setFont('helvetica','bold')
doc.text('Luís Fernando Bueno',120,90)
doc.line(120,92,185,92)
doc.setFont('helvetica','normal')
doc.text('Assessor Técnico',120,100)
doc.text('Apoio Técnico',120,108)
doc.setFont('helvetica','bold')
doc.text('Raimundo Paulo Dias Barros Vieira',20,160)
doc.line(20,162,120,162)
doc.setFont('helvetica','normal')
doc.text('Auditor de Controle Externo',20,170)
doc.text('Supervisor',20,178)
}
