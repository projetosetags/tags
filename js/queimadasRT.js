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
await rtMapaEstadual(doc)
doc.addPage()
await rtMapaMunicipal(doc)
doc.addPage()
await rtMonitoramento4D(doc)
doc.addPage()
await rtReferencias(doc)
doc.addPage()
await rtSiglas(doc)
doc.addPage()
await rtGlossario(doc)
doc.addPage()
await rtFichaTecnica(doc)
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
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text('4. SITUAÇÃO ESTADUAL',15,20)
doc.setFont('helvetica','normal')
doc.setFontSize(12)
let texto='     O Estado de Rondônia apresenta condições ambientais e climáticas que favorecem a ocorrência de queimadas durante o período de estiagem. A combinação entre cobertura vegetal suscetível, expansão das áreas antropizadas, histórico recorrente de focos de calor e condições meteorológicas adversas amplia significativamente os riscos de incêndios florestais e impactos ambientais associados.'
doc.text(doc.splitTextToSize(texto,170),15,35)
let img=await capturarElemento('painelIRIQHeatmapUnificado')
if(img){
doc.addImage(img,'PNG',10,65,190,80)
}
let texto2='     A análise integrada dos indicadores estaduais demonstra a existência de municípios classificados em níveis elevados de criticidade, exigindo atuação coordenada dos órgãos estaduais, municipais e federais. Os resultados obtidos pelo Heatmap Estadual e pelo Índice de Risco Integrado de Queimadas (IRIQ) evidenciam a necessidade de monitoramento permanente e adoção tempestiva de medidas preventivas.'
doc.text(doc.splitTextToSize(texto2,170),15,155)
let texto3='     Considerando os cenários analisados, conclui-se que o Estado deve manter estratégias contínuas de prevenção, preparação e resposta, priorizando os territórios de maior risco e fortalecendo os mecanismos de governança, fiscalização e controle ambiental.'
doc.text(doc.splitTextToSize(texto3,170),15,205)
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
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text('6. HEATMAP ESTADUAL',15,20)
doc.setFont('helvetica','normal')
doc.setFontSize(12)
let texto='     O Heatmap Estadual consolida os resultados do monitoramento das queimadas em Rondônia por meio da classificação dos municípios em diferentes níveis de risco. A metodologia considera indicadores ambientais, históricos de queimadas, focos de calor, vulnerabilidades territoriais e fatores climáticos associados ao período de estiagem.'
doc.text(doc.splitTextToSize(texto,170),15,35)
let img=await capturarElemento('painelIRIQHeatmapUnificado')
if(img){
doc.addImage(img,'PNG',10,60,190,80)
}
let texto2='     A distribuição espacial dos riscos permite identificar áreas prioritárias para atuação preventiva e corretiva. Municípios classificados nas faixas de risco Alto e Crítico demandam maior atenção dos gestores públicos, considerando a probabilidade elevada de ocorrência de queimadas e seus impactos ambientais, sociais e econômicos.'
doc.setFontSize(12)
doc.text(doc.splitTextToSize(texto2,170),15,155)
}
/*=========================================================
408 RT IRIQ
=========================================================*/
async function rtIRIQ(doc){
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text('7. IRIQ ESTADUAL',15,20)
doc.setFont('helvetica','normal')
doc.setFontSize(12)
let texto='     O Índice de Risco Integrado de Queimadas (IRIQ) constitui indicador composto desenvolvido para apoiar a priorização territorial das ações de enfrentamento às queimadas. O índice considera fatores relacionados aos focos de calor, histórico de ocorrências, cobertura vegetal, uso e ocupação do solo, variáveis climáticas e vulnerabilidade ambiental.'
doc.text(doc.splitTextToSize(texto,170),15,35)
let img=await capturarElemento('painelMunicipiosPrioritarios')
if(img){
doc.addImage(img,'PNG',10,60,190,80)
}
let texto2='     Os resultados obtidos permitem hierarquizar os municípios segundo sua criticidade relativa, subsidiando a tomada de decisão, a alocação de recursos públicos e a definição de estratégias preventivas durante o período crítico de queimadas.'
doc.text(doc.splitTextToSize(texto2,170),15,155)
}

/*=========================================================
409 RT CHAP
=========================================================*/
async function rtCHAP(doc){
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text('8. CHAP',15,20)
doc.setFont('helvetica','normal')
doc.setFontSize(12)
let texto='     O modelo CHAP foi utilizado como instrumento estruturado de análise de riscos, permitindo avaliar cenários relacionados às queimadas e incêndios florestais a partir da combinação de fatores de ameaça, vulnerabilidade e capacidade de resposta institucional.'
doc.text(doc.splitTextToSize(texto,170),15,35)
let img=await capturarElemento('painelCHAP')
if(img){
doc.addImage(img,'PNG',10,60,190,80)
}
let texto2='     A aplicação do CHAP possibilita identificar fragilidades operacionais, institucionais e ambientais, contribuindo para o aperfeiçoamento das estratégias de prevenção, preparação, resposta e recuperação relacionadas aos eventos críticos monitorados.'
doc.text(doc.splitTextToSize(texto2,170),15,155)
}

/*=========================================================
410 RT IA-CHAP
=========================================================*/
async function rtIACHAP(doc){
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text('9. IA-CHAP',15,20)
doc.setFont('helvetica','normal')
doc.setFontSize(12)
let texto='     A metodologia IA-CHAP representa a evolução analítica do modelo CHAP por meio da utilização de inteligência artificial aplicada ao tratamento e interpretação dos dados monitorados. A ferramenta amplia a capacidade preditiva e analítica dos cenários de risco relacionados às queimadas.'
doc.text(doc.splitTextToSize(texto,170),15,35)
let img=await capturarElemento('painelIAChap')
if(img){
doc.addImage(img,'PNG',10,60,190,80)
}
let texto2='     Os resultados produzidos pela IA permitem identificar padrões de comportamento, tendências de evolução dos riscos e oportunidades de atuação preventiva, fortalecendo a tomada de decisão baseada em evidências e contribuindo para maior efetividade das ações governamentais.'
doc.text(doc.splitTextToSize(texto2,170),15,155)
}
/*=========================================================
411 RT MATRIZ 5X5
=========================================================*/
async function rtMatrizRisco(doc){
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text('10. MATRIZ DE RISCO 5X5',15,20)
doc.setFont('helvetica','normal')
doc.setFontSize(12)
let texto='     A Matriz de Risco 5x5 foi utilizada para classificar os eventos monitorados segundo a combinação entre probabilidade de ocorrência e impacto potencial. A metodologia permite avaliar objetivamente a criticidade dos riscos associados às queimadas e incêndios florestais.'
doc.text(doc.splitTextToSize(texto,170),15,35)
let img=await capturarElemento('painelMatriz5x5')
if(img){
doc.addImage(img,'PNG',10,60,190,80)
}
let texto2='     Os riscos enquadrados nas categorias Alta e Crítica exigem monitoramento contínuo e adoção imediata de medidas mitigadoras. A matriz subsidia a definição de prioridades institucionais e orienta o direcionamento dos recursos disponíveis para as áreas de maior vulnerabilidade.'
doc.text(doc.splitTextToSize(texto2,170),15,155)
}
/*=========================================================
412 RT MUNICIPIOS CRITICOS
=========================================================*/
async function rtMunicipiosCriticos(doc){
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text('11. MUNICÍPIOS CRÍTICOS',15,20)
let {data=[]}=await client.from('queimadas_heatmap').select('*')
let top=[...data].sort((a,b)=>Number(b.risco||0)-Number(a.risco||0)).slice(0,10)
doc.setFont('helvetica','normal')
doc.setFontSize(12)
let texto1='     Com base nos resultados obtidos por meio do Heatmap Estadual, do Índice de Risco Integrado de Queimadas (IRIQ), do modelo CHAP e do IA-CHAP, foram identificados os municípios que apresentam maior criticidade quanto à ocorrência de queimadas e incêndios florestais. A classificação considera fatores históricos, ambientais, climáticos e operacionais, permitindo a priorização das ações preventivas, fiscalizatórias e de resposta.'
doc.text(doc.splitTextToSize(texto1,170),15,35)
doc.autoTable({
startY:75,
head:[['POSIÇÃO','MUNICÍPIO','IRIQ','RISCO','CLASSIFICAÇÃO','FOCOS']],
body:top.map((m,i)=>[
i+1,
m.municipio||'-',
m.iriq||'-',
m.risco||'-',
m.classificacao||'-',
m.focos||'-'
]),
styles:{
fontSize:10,
font:'helvetica',
cellPadding:2
},
headStyles:{
fillColor:[127,29,29],
fontSize:10
},
alternateRowStyles:{
fillColor:[245,245,245]
}
})
let y=(doc.lastAutoTable?.finalY||160)+15
doc.setFont('helvetica','normal')
doc.setFontSize(12)
let texto2='     Observa-se que os municípios constantes na tabela acima demandam atenção prioritária dos órgãos estaduais e municipais, especialmente durante o período crítico de estiagem. Recomenda-se o fortalecimento das ações de monitoramento, prevenção, fiscalização ambiental, combate aos incêndios florestais e acompanhamento contínuo da execução dos planos de ação locais, visando reduzir os impactos ambientais, sociais e econômicos decorrentes das queimadas.'
doc.text(doc.splitTextToSize(texto2,170),15,y)
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
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text('13. EVIDÊNCIAS',15,20)
doc.setFont('helvetica','normal')
doc.setFontSize(12)
let texto='     Foram analisadas evidências documentais provenientes da Secretaria de Estado do Desenvolvimento Ambiental - SEDAM, Corpo de Bombeiros Militar do Estado de Rondônia - CBMRO, municípios rondonienses, bases de dados do Instituto Nacional de Pesquisas Espaciais - INPE, sistemas institucionais e documentos encaminhados em resposta ao Ofício Circular n.16/2026/GABPRES/TCERO.'
doc.text(doc.splitTextToSize(texto,170),15,35)
let y=65
let img1=await capturarElemento('painelEvidencias')
if(img1){
doc.addImage(img1,'PNG',10,y,190,55)
y+=65
}
let img2=await capturarElemento('painelMonitoramento4D')
if(img2&&y<220){
doc.addImage(img2,'PNG',10,y,190,55)
y+=65
}
if(y>220){
doc.addPage()
y=30
}
let img3=await capturarElemento('painelGovernanca')
if(img3){
doc.addImage(img3,'PNG',10,y,190,55)
y+=65
}
if(y>220){
doc.addPage()
y=30
}
let img4=await capturarElemento('painelAcoesSedam')
if(img4){
doc.addImage(img4,'PNG',10,y,190,55)
y+=65
}
if(y>220){
doc.addPage()
y=30
}
let img5=await capturarElemento('painelAcoesCBM')
if(img5){
doc.addImage(img5,'PNG',10,y,190,55)
y+=65
}
if(y>220){
doc.addPage()
y=30
}
doc.setFontSize(11)
let conclusao='     As evidências coletadas e analisadas demonstram a rastreabilidade das informações utilizadas no monitoramento, permitindo verificar a execução das ações planejadas, a situação dos municípios, os níveis de risco identificados e a efetividade das medidas adotadas pelos órgãos responsáveis. As informações apresentadas constituem suporte técnico para os achados, conclusões e propostas constantes deste relatório.'
doc.text(doc.splitTextToSize(conclusao,170),15,y+5)
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
doc.setFont('helvetica','bold')
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
doc.setFont('helvetica','normal')
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
/*=========================================================
419 RT MAPA ESTADUAL
=========================================================*/
async function rtMapaEstadual(doc){
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text('ANEXO I - MAPA ESTADUAL DE RISCO',15,20)
doc.setFont('helvetica','normal')
doc.setFontSize(12)
doc.text(doc.splitTextToSize('O presente mapa apresenta a distribuição espacial dos riscos de queimadas no território do Estado de Rondônia, permitindo identificar áreas prioritárias para atuação preventiva, monitoramento e resposta operacional.',170),15,35)
let img=await capturarElemento('mapaROEstadual')
if(img){
doc.addImage(img,'PNG',10,55,190,130)
}
doc.setFontSize(9)
doc.text('Fonte: TCE-RO • INPE • Sedam • Base Cartográfica Estadual',15,200)
}
/*=========================================================
420 RT MAPA MUNICIPAL
=========================================================*/
async function rtMapaMunicipal(doc){
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text('ANEXO II - MAPA MUNICIPAL DOS PLANOS DE AÇÃO',15,20)
doc.setFont('helvetica','normal')
doc.setFontSize(12)
doc.text(doc.splitTextToSize('O mapa municipal demonstra a situação dos municípios quanto ao atendimento do Ofício Circular n.16/2026/GABPRES/TCERO e à apresentação dos respectivos planos de ação para enfrentamento das queimadas.',170),15,35)
let img=await capturarElemento('mapaMunicipalPlanos')
if(img){
doc.addImage(img,'PNG',10,55,190,130)
}
doc.setFontSize(9)
doc.text('Fonte: Municípios de Rondônia • TCE-RO',15,200)
}
/*=========================================================
421 RT MONITORAMENTO 4D
=========================================================*/
async function rtMonitoramento4D(doc){
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text('ANEXO III - MONITORAMENTO 4D',15,20)
doc.setFont('helvetica','normal')
doc.setFontSize(12)
doc.text(doc.splitTextToSize('O Monitoramento 4D consolida informações relacionadas à execução física, governança, evidências, monitoramento contínuo e acompanhamento institucional das ações previstas nos planos estaduais e municipais.',170),15,35)
let img=await capturarElemento('painelMonitoramento4D')
if(img){
doc.addImage(img,'PNG',10,55,190,130)
}
doc.setFontSize(9)
doc.text('Fonte: Sistema de Monitoramento Inteligente de Queimadas',15,200)
}
/*=========================================================
422 RT REFERENCIAS
=========================================================*/
async function rtReferencias(doc){
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text('18. REFERÊNCIAS',15,20)
doc.setFont('helvetica','normal')
doc.setFontSize(11)
let refs=[
'Instituto Nacional de Pesquisas Espaciais - INPE. Programa Queimadas.',
'MapBiomas Brasil. Coleções de Uso e Cobertura da Terra.',
'Secretaria de Estado do Desenvolvimento Ambiental - Sedam.',
'Corpo de Bombeiros Militar do Estado de Rondônia - CBMRO.',
'Tribunal de Contas do Estado de Rondônia - TCE-RO.',
'Plano de Ação da Sedam para Enfrentamento das Queimadas.',
'Plano Operacional Anual do CBMRO.',
'Plano Unificado de Enfrentamento às Queimadas.',
'Metodologia CHAP.',
'Metodologia IA-CHAP.',
'Heatmap Estadual de Queimadas.',
'Índice de Risco Integrado de Queimadas - IRIQ.',
'Processo PCe 0501/2026.',
'Ofício Circular n.16/2026/GABPRES/TCERO.'
]
let y=40
refs.forEach((r,i)=>{
doc.text((i+1)+'. '+r,20,y)
y+=10
})
}
/*=========================================================
423 RT SIGLAS
=========================================================*/
async function rtSiglas(doc){
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text('19. SIGLAS E ABREVIATURAS',15,20)
doc.setFont('helvetica','normal')
doc.setFontSize(11)
let siglas=[
['CBMRO','Corpo de Bombeiros Militar do Estado de Rondônia'],
['CHAP','Classificação Hierarquizada de Ameaças e Prioridades'],
['IA-CHAP','Inteligência Artificial aplicada ao CHAP'],
['INPE','Instituto Nacional de Pesquisas Espaciais'],
['IRIQ','Índice de Risco Integrado de Queimadas'],
['ODS','Objetivos de Desenvolvimento Sustentável'],
['PCe','Processo de Controle Externo'],
['Sedam','Secretaria de Estado do Desenvolvimento Ambiental'],
['TCE-RO','Tribunal de Contas do Estado de Rondônia'],
['TI','Terra Indígena'],
['UC','Unidade de Conservação']
]
doc.autoTable({
startY:35,
head:[['SIGLA','DESCRIÇÃO']],
body:siglas,
styles:{fontSize:10},
headStyles:{fillColor:[15,23,42]}
})
}
/*=========================================================
424 RT GLOSSARIO
=========================================================*/
async function rtGlossario(doc){
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text('20. GLOSSÁRIO',15,20)
doc.setFont('helvetica','normal')
doc.setFontSize(11)
let texto=[
'Queimada: utilização controlada ou não do fogo em vegetação natural ou antrópica.',
'Foco de Calor: registro orbital de temperatura compatível com presença de fogo.',
'Heatmap: representação gráfica dos níveis de risco por território.',
'IRIQ: indicador composto utilizado para classificação dos riscos de queimadas.',
'Governança: conjunto de mecanismos de coordenação, decisão e controle das ações.',
'Monitoramento 4D: acompanhamento contínuo das ações, evidências, resultados e riscos.',
'CHAP: metodologia de classificação e priorização de riscos.',
'IA-CHAP: aplicação de inteligência artificial inovadora e prática com propósito para análise preditiva dos riscos.',
'Matriz 5x5: ferramenta de avaliação baseada em probabilidade e impacto.',
'Sala de Situação: ambiente destinado ao acompanhamento dos eventos críticos.'
]
let y=40
texto.forEach(t=>{
doc.text(doc.splitTextToSize('• '+t,170),20,y)
y+=18
})
}
/*=========================================================
425 RT FICHA TECNICA
=========================================================*/
async function rtFichaTecnica(doc){
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text('21. FICHA TÉCNICA',15,20)
doc.setFont('helvetica','normal')
doc.setFontSize(11)
doc.text('TRIBUNAL DE CONTAS DO ESTADO DE RONDÔNIA',20,45)
doc.text('Processo: PCe 0501/2026',20,60)
doc.text('Objeto: Monitoramento das Queimadas e Incêndios Florestais',20,72)
doc.text('Relatório Técnico de Monitoramento',20,84)
doc.text('Coordenador dos Trabalhos:',20,110)
doc.text('Manoel Fernandes Neto',40,122)
doc.text('Equipe Técnica:',20,145)
doc.text('Luís Fernando Bueno',40,157)
doc.text('Raimundo Paulo Dias Barros Vieira',40,169)
doc.text('Ferramentas Utilizadas:',20,195)
doc.text('Heatmap Estadual • IRIQ • CHAP • IA-CHAP • Matriz 5x5 • Monitoramento 4D',40,207)
doc.text('Data de Emissão: '+new Date().toLocaleDateString('pt-BR'),20,235)
}
/*=========================================================
426 RT WORD TECNICO 0501
=========================================================*/
async function gerarWordTecnico0501(){
let html=`
<h1>RELATÓRIO TÉCNICO - PCe 0501/2026</h1>
<h2>MONITORAMENTO DAS QUEIMADAS</h2>
<h2>1. INTRODUÇÃO</h2>
<p>O presente relatório técnico apresenta os resultados do monitoramento das ações de prevenção, preparação, resposta e mitigação relacionadas às queimadas e incêndios florestais no Estado de Rondônia.</p>
<h2>2. OBJETO</h2>
<p>Avaliar a implementação dos planos de ação estaduais e municipais destinados ao enfrentamento das queimadas e incêndios florestais.</p>
<h2>3. METODOLOGIA</h2>
<p>Foram utilizados os modelos CHAP, IA-CHAP, Heatmap Estadual, IRIQ, Matriz de Risco 5x5 e monitoramento contínuo das bases de dados institucionais.</p>
<h2>4. SITUAÇÃO ESTADUAL</h2>
<p>Análise consolidada da situação das queimadas e incêndios florestais em Rondônia.</p>
<h2>5. ANÁLISE MUNICIPAL</h2>
<p>Acompanhamento dos municípios quanto aos planos de ação e atendimento ao Ofício Circular n.16/2026/GABPRES/TCERO.</p>
<h2>6. HEATMAP ESTADUAL</h2>
<p>Classificação dos municípios por criticidade e risco.</p>
<h2>7. IRIQ ESTADUAL</h2>
<p>Índice de Risco Integrado de Queimadas.</p>
<h2>8. CHAP</h2>
<p>Classificação Hierarquizada de Ameaças e Prioridades.</p>
<h2>9. IA-CHAP</h2>
<p>Aplicação de Inteligência Artificial para priorização dos riscos.</p>
<h2>10. MATRIZ DE RISCO 5X5</h2>
<p>Avaliação dos riscos por probabilidade e impacto.</p>
<h2>11. MUNICÍPIOS CRÍTICOS</h2>
<p>Municípios classificados como prioritários para atuação preventiva.</p>
<h2>12. ACHADOS DE AUDITORIA</h2>
<p>Principais achados identificados durante o monitoramento.</p>
<h2>13. EVIDÊNCIAS</h2>
<p>Evidências documentais e operacionais utilizadas na análise.</p>
<h2>14. CONCLUSÕES</h2>
<p>Conclusões técnicas do monitoramento realizado.</p>
<h2>15. PROPOSTAS DE ENCAMINHAMENTO</h2>
<p>Propostas para fortalecimento da governança e mitigação dos riscos.</p>
<h2>16. ANEXOS</h2>
<p>Mapas, painéis, indicadores e documentos complementares.</p>
<h2>17. ASSINATURAS</h2>
<p>Manoel Fernandes Neto • Luís Fernando Bueno • Raimundo Paulo Dias Barros Vieira.</p>
<h2>18. REFERÊNCIAS</h2>
<p>INPE • Sedam • CBMRO • TCE-RO • MapBiomas • Plano Unificado.</p>
<h2>19. SIGLAS</h2>
<p>CBMRO • CHAP • IA-CHAP • INPE • IRIQ • ODS • PCe • Sedam • TCE-RO.</p>
<h2>20. GLOSSÁRIO</h2>
<p>Definições técnicas utilizadas no relatório.</p>
<h2>21. FICHA TÉCNICA</h2>
<p>Processo PCe 0501/2026 • Relatório Técnico de Monitoramento das Queimadas.</p>
`
baixarWordQueimadas('RT_2026_QUEIMADAS',html)
}
