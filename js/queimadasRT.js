/*=========================================================
300 RT CONFIGURAÇÃO VISUAL E CAPTURAS
=========================================================*/
let RT_IMAGENS={}
async function rtEsperar(ms=700){return new Promise(resolve=>setTimeout(resolve,ms))}
function rtNormalizarNome(valor){return String(valor||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim()}
async function capturarElementoMeta(idElemento){
let el=document.getElementById(idElemento)
if(!el)return null
await rtEsperar(350)
let largura=el.offsetWidth||el.getBoundingClientRect().width
let altura=el.offsetHeight||el.getBoundingClientRect().height
if(largura<10||altura<10)return null
try{
let canvas=await html2canvas(el,{scale:2.4,backgroundColor:'#ffffff',useCORS:true,allowTaint:false,logging:false,scrollX:0,scrollY:-window.scrollY,imageTimeout:20000,onclone:doc=>{
let clone=doc.getElementById(idElemento)
if(clone){
clone.style.opacity='1'
clone.style.visibility='visible'
clone.style.transform='none'
}
}})
if(!canvas||!canvas.width||!canvas.height)return null
return{data:canvas.toDataURL('image/png'),largura:canvas.width,altura:canvas.height}
}catch(error){
console.error('Erro ao capturar '+idElemento,error)
return null
}
}
async function capturarElemento(idElemento){
let img=await capturarElementoMeta(idElemento)
return img?.data||null
}
async function capturarPainelRTAba(aba,ids){
try{
await mostrarAbaQueimadas(aba)
window.scrollTo(0,0)
window.dispatchEvent(new Event('resize'))
await rtEsperar(1100)
for(let id of ids){
let elemento=document.getElementById(id)
if(!elemento)continue
let imagem=await capturarElementoMeta(id)
if(imagem)RT_IMAGENS[id]=imagem
}
}catch(error){
console.error('Erro ao preparar aba '+aba,error)
}
}
async function prepararImagensRelatorioRT(){
RT_IMAGENS={}
await capturarPainelRTAba('executivo',['painelKPIs','painelFocosCalor','painelMunicipiosPrioritarios','painelIRIQHeatmapUnificado'])
await capturarPainelRTAba('executivomunicipal',['painelKPIsMunicipais','painelTabelaMunicipios','mapaMunicipalPlanos','painelEstatisticasMunicipais'])
await capturarPainelRTAba('situacao',['painelSalaSituacaoEstadual','painelTopIAIPT','painelIndicadoresGovernanca'])
await capturarPainelRTAba('monitoramento',['painelAcoesSedam','painelAcoesCBM','painelAcoesTCERO','painelGovernanca','painelMonitoramento4D','painelExecucaoFisica','painelExecucaoFinanceira','painelEvidencias'])
await capturarPainelRTAba('analise',['painelIPT','painelMatriz5x5'])
await capturarPainelRTAba('temporeal',['painelTempoRealKPIs','painelTempoRealFocos','painelTempoRealRanking','graficoTempoReal'])
await capturarPainelRTAba('mapa',['mapaROEstadual','mapaRO'])
await capturarPainelRTAba('auditor',['painelAuditorKPIs','painelTopRiscos','painelAchadosAutomaticos'])
}
function rtImagem(id){return RT_IMAGENS[id]||null}
function rtCabecalhoPagina(doc,titulo){
doc.setFillColor(15,23,42)
doc.rect(0,0,210,17,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(9)
doc.setTextColor(255,255,255)
doc.text('TRIBUNAL DE CONTAS DO ESTADO DE RONDÔNIA',12,7)
doc.setFontSize(7)
doc.text('PCe 0501/2026 • MONITORAMENTO DAS QUEIMADAS E INCÊNDIOS FLORESTAIS',12,12)
doc.setTextColor(15,23,42)
doc.setFont('helvetica','bold')
doc.setFontSize(16)
doc.text(titulo,15,29)
doc.setDrawColor(226,232,240)
doc.line(15,33,195,33)
}
function rtFonte(doc,texto,y=278){
doc.setFont('helvetica','italic')
doc.setFontSize(7)
doc.setTextColor(100,116,139)
doc.text(doc.splitTextToSize(texto,180),15,y)
doc.setTextColor(15,23,42)
}
function rtTexto(doc,texto,y,tamanho=9,largura=180){
doc.setFont('helvetica','normal')
doc.setFontSize(tamanho)
doc.setTextColor(51,65,85)
let linhas=doc.splitTextToSize(texto,largura)
doc.text(linhas,15,y)
return y+(linhas.length*(tamanho*.38))+3
}
function rtAdicionarImagem(doc,id,x=10,y=40,maxW=190,maxH=220){
let img=rtImagem(id)
if(!img)return null
let proporcao=img.largura/img.altura
let w=maxW
let h=w/proporcao
if(h>maxH){
h=maxH
w=h*proporcao
}
let posX=x+(maxW-w)/2
doc.addImage(img.data,'PNG',posX,y,w,h,undefined,'FAST')
return{x:posX,y,w,h}
}
function rtRodape(doc){
let total=doc.internal.getNumberOfPages()
for(let pagina=1;pagina<=total;pagina++){
doc.setPage(pagina)
doc.setDrawColor(226,232,240)
doc.line(15,285,195,285)
doc.setFont('helvetica','normal')
doc.setFontSize(7)
doc.setTextColor(100,116,139)
doc.text('TCE-RO • Sistema de Monitoramento Inteligente de Queimadas • '+new Date().toLocaleDateString('pt-BR'),15,290)
doc.text('Página '+pagina+' de '+total,195,290,{align:'right'})
}
}
/*=========================================================
301 RT GERAR PDF TECNICO 0501
=========================================================*/
async function gerarPDFTecnico0501(){

let botao=document.querySelector('[onclick="gerarPDFTecnico0501()"]')
let textoOriginal=botao?.innerHTML||''

if(botao){
botao.disabled=true
botao.innerHTML='⏳ GERANDO RELATÓRIO...'
}

try{

await prepararImagensRelatorioRT()

const{jsPDF}=window.jspdf
let doc=new jsPDF('p','mm','a4',true)

await rtCapa(doc)

doc.addPage()
await rtSumarioVisual(doc)

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
await rtIPT(doc)

doc.addPage()
await rtMatrizRisco(doc)

doc.addPage()
await rtMunicipiosCriticos(doc)

await adicionarTop10RiscosPDF(doc)

await adicionarTabelaMunicipiosPDF(doc)

doc.addPage()
await rtAchados(doc)

doc.addPage()
await rtEvidencias(doc)

doc.addPage()
await rtConclusoes(doc)

doc.addPage()
await rtPropostas(doc)

doc.addPage()
await rtPainelSituacaoVisual(doc)

doc.addPage()
await rtPainelMonitoramentoVisual(doc)

doc.addPage()
await rtPainelTempoRealVisual(doc)

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

rtRodape(doc)

doc.save('RT_PCe_0501_2026_QUEIMADAS_'+new Date().toISOString().slice(0,10)+'.pdf')

await mostrarAbaQueimadas('auditor')

}catch(error){

console.error('Erro ao gerar relatório técnico:',error)
alert('Erro ao gerar o relatório técnico: '+(error.message||error))

}finally{

if(botao){
botao.disabled=false
botao.innerHTML=textoOriginal
}

}

}
/*=========================================================
302 RT CAPA
=========================================================*/
async function rtCapa(doc){
doc.setFillColor(15,23,42)
doc.rect(0,0,210,297,'F')
doc.setFillColor(30,58,138)
doc.rect(0,0,210,75,'F')
doc.setTextColor(255,255,255)
doc.setFont('helvetica','bold')
doc.setFontSize(17)
doc.text('TRIBUNAL DE CONTAS DO ESTADO DE RONDÔNIA',105,32,{align:'center'})
doc.setFontSize(11)
doc.text('SECRETARIA-GERAL DE CONTROLE EXTERNO',105,44,{align:'center'})
doc.setFontSize(32)
doc.text('QUEIMADAS',105,112,{align:'center'})
doc.setFontSize(24)
doc.text('2026',105,128,{align:'center'})
doc.setFontSize(15)
doc.text('RELATÓRIO TÉCNICO DE MONITORAMENTO',105,157,{align:'center'})
doc.setFontSize(11)
doc.text('PCe 0501/2026',105,173,{align:'center'})
doc.setFont('helvetica','normal')
doc.setFontSize(9)
doc.text('Prevenção • Preparação • Resposta • Mitigação • Governança',105,188,{align:'center'})
doc.setDrawColor(249,115,22)
doc.setLineWidth(1.4)
doc.line(55,200,155,200)
doc.setFontSize(9)
doc.text('Sistema de Monitoramento Inteligente de Queimadas',105,220,{align:'center'})
doc.text('Estado de Rondônia',105,230,{align:'center'})
doc.setFontSize(8)
doc.text('Data de emissão: '+new Date().toLocaleDateString('pt-BR'),105,268,{align:'center'})
}
/*=========================================================
303 RT SUMARIO EXECUTIVO
=========================================================*/
async function rtSumarioVisual(doc){
rtCabecalhoPagina(doc,'SUMÁRIO EXECUTIVO')
let hoje=new Date()
let ano=hoje.getFullYear()
let dataInicial=`${ano}-01-01`
let dataFinal=`${ano}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`
let[
{count:totalFocos,error:erroFocos},
{data:municipios=[],error:erroMunicipios},
{data:executivo,error:erroExecutivo},
{data:rankingFocos=[],error:erroRankingFocos},
{data:rankingIRIQ=[],error:erroRankingIRIQ}
]=await Promise.all([
client.from('queimadas_focos_inpe').select('id',{count:'exact',head:true}).gte('data_foco',dataInicial).lte('data_foco',dataFinal),
client.from('vw_queimadas_municipios_resposta').select('*'),
client.from('vw_queimadas_executivo').select('*').maybeSingle(),
client.from('vw_queimadas_ranking_focos_atual').select('municipio,focos').order('focos',{ascending:false}).limit(5),
client.from('queimadas_heatmap').select('municipio,iriq,risco,classificacao,focos').order('iriq',{ascending:false}).limit(5)
])
if(erroFocos)console.error('RT Sumário - focos:',erroFocos)
if(erroMunicipios)console.error('RT Sumário - municípios:',erroMunicipios)
if(erroExecutivo)console.error('RT Sumário - executivo:',erroExecutivo)
if(erroRankingFocos)console.error('RT Sumário - ranking focos:',erroRankingFocos)
if(erroRankingIRIQ)console.error('RT Sumário - ranking IRIQ:',erroRankingIRIQ)
executivo=executivo||{}
let totalMunicipios=municipios.length
let comPlano=municipios.filter(i=>String(i.classificacao_ia||'').toUpperCase().includes('PLANO')).length
let dilacao=municipios.filter(i=>String(i.classificacao_ia||'').toUpperCase().includes('DILA')).length
let semResposta=municipios.filter(i=>String(i.classificacao_ia||'').toUpperCase().includes('SEM RESPOSTA')).length
if(!semResposta)semResposta=Math.max(0,totalMunicipios-comPlano-dilacao)
let focos=Number(totalFocos||0)
let criticos=Number(executivo.municipios_criticos||0)
let prioritarios=Number(executivo.municipios_prioritarios||0)
let iriqEstadual=Number(executivo.iriq_estadual||0)
let top5IRIQ=(rankingIRIQ||[]).filter(i=>Number.isFinite(Number(i.iriq))).slice(0,5)
let mediaTop5=top5IRIQ.length?top5IRIQ.reduce((s,i)=>s+Number(i.iriq||0),0)/top5IRIQ.length:0
let top3IRIQ=top5IRIQ.slice(0,3)
let faixaEstado=iriqEstadual>=75?'CRÍTICO':iriqEstadual>=50?'ALTO':iriqEstadual>=25?'MODERADO':'BAIXO'
let faixaTop5=mediaTop5>=75?'CRÍTICO':mediaTop5>=50?'ALTO':mediaTop5>=25?'MODERADO':'BAIXO'
let corEstado=iriqEstadual>=75?[220,38,38]:iriqEstadual>=50?[249,115,22]:iriqEstadual>=25?[202,138,4]:[22,163,74]
let corTop5=mediaTop5>=75?[220,38,38]:mediaTop5>=50?[249,115,22]:mediaTop5>=25?[202,138,4]:[22,163,74]
let y=39
/* CABEÇALHO VISUAL */
let img1=rtAdicionarImagem(doc,'painelTempoRealKPIs',15,y,56,34)
let img2=rtAdicionarImagem(doc,'painelKPIsMunicipais',77,y,56,34)
let img3=rtAdicionarImagem(doc,'painelTopIAIPT',139,y,56,34)
if(!img1){
doc.setFillColor(239,246,255)
doc.roundedRect(15,y,56,30,3,3,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(13)
doc.setTextColor(37,99,235)
doc.text(focos.toLocaleString('pt-BR'),43,y+12,{align:'center'})
doc.setFontSize(6.5)
doc.setTextColor(51,65,85)
doc.text('FOCOS EM '+ano,43,y+20,{align:'center'})
}
if(!img2){
doc.setFillColor(240,253,244)
doc.roundedRect(77,y,56,30,3,3,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(13)
doc.setTextColor(22,163,74)
doc.text(`${comPlano}/${totalMunicipios}`,105,y+12,{align:'center'})
doc.setFontSize(6.5)
doc.setTextColor(51,65,85)
doc.text('PLANOS DE AÇÃO',105,y+20,{align:'center'})
}
if(!img3){
doc.setFillColor(255,247,237)
doc.roundedRect(139,y,56,30,3,3,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(13)
doc.setTextColor(249,115,22)
doc.text(String(prioritarios),167,y+12,{align:'center'})
doc.setFontSize(6.5)
doc.setTextColor(51,65,85)
doc.text('PRIORITÁRIOS',167,y+20,{align:'center'})
}
y+=38
/* VISÃO GERAL */
doc.setFillColor(15,23,42)
doc.roundedRect(15,y,180,9,2,2,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(7.8)
doc.setTextColor(255,255,255)
doc.text('VISÃO GERAL DO MONITORAMENTO',20,y+6)
y+=14
doc.setFont('helvetica','normal')
doc.setFontSize(7.7)
doc.setTextColor(51,65,85)
let textoGeral=`O monitoramento concomitante consolida a resposta institucional às queimadas e incêndios florestais em Rondônia, abrangendo os ${totalMunicipios} municípios, ações estaduais, riscos ambientais, focos de calor, governança, capacidade de resposta e evidências produzidas pelos órgãos responsáveis. No período de 01/01/${ano} a ${hoje.toLocaleDateString('pt-BR')}, foram registrados ${focos.toLocaleString('pt-BR')} focos de calor no Estado.`
let linhasGeral=doc.splitTextToSize(textoGeral,180)
doc.text(linhasGeral,15,y)
y+=linhasGeral.length*3.5+4
/* INDICADORES PRINCIPAIS */
let indicadores=[
{titulo:'FOCOS 2026',valor:focos.toLocaleString('pt-BR'),cor:[220,38,38]},
{titulo:'COM PLANO',valor:String(comPlano),cor:[22,163,74]},
{titulo:'DILAÇÃO',valor:String(dilacao),cor:[202,138,4]},
{titulo:'SEM RESPOSTA',valor:String(semResposta),cor:[220,38,38]},
{titulo:'CRÍTICOS',valor:String(criticos),cor:[220,38,38]},
{titulo:'PRIORITÁRIOS',valor:String(prioritarios),cor:[249,115,22]}
]
let gap=3
let largura=(180-(gap*5))/6
indicadores.forEach((item,i)=>{
let x=15+i*(largura+gap)
doc.setFillColor(248,250,252)
doc.setDrawColor(226,232,240)
doc.roundedRect(x,y,largura,21,2.5,2.5,'FD')
doc.setFont('helvetica','bold')
doc.setFontSize(11)
doc.setTextColor(...item.cor)
doc.text(item.valor,x+largura/2,y+9,{align:'center'})
doc.setFontSize(5.3)
doc.setTextColor(51,65,85)
doc.text(item.titulo,x+largura/2,y+15,{align:'center'})
})
y+=27
/* BLOCO IRIQ */
doc.setFillColor(15,23,42)
doc.roundedRect(15,y,180,9,2,2,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(7.8)
doc.setTextColor(255,255,255)
doc.text('IRIQ - CONCENTRAÇÃO TERRITORIAL DO RISCO',20,y+6)
y+=14
let larguraIRIQ=(180-6)/3
let iriQCards=[
{titulo:'IRIQ ESTADUAL',valor:iriqEstadual.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}),sub:faixaEstado,cor:corEstado},
{titulo:'MÉDIA TOP 5',valor:mediaTop5.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}),sub:faixaTop5,cor:corTop5},
{titulo:'MAIOR IRIQ',valor:top3IRIQ.length?Number(top3IRIQ[0].iriq||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}):'0,00',sub:top3IRIQ[0]?.municipio||'-',cor:[220,38,38]}
]
iriQCards.forEach((item,i)=>{
let x=15+i*(larguraIRIQ+3)
doc.setFillColor(248,250,252)
doc.setDrawColor(226,232,240)
doc.roundedRect(x,y,larguraIRIQ,27,3,3,'FD')
doc.setFont('helvetica','bold')
doc.setFontSize(6)
doc.setTextColor(71,85,105)
doc.text(item.titulo,x+larguraIRIQ/2,y+6,{align:'center'})
doc.setFontSize(15)
doc.setTextColor(...item.cor)
doc.text(item.valor,x+larguraIRIQ/2,y+16,{align:'center'})
doc.setFontSize(5.6)
doc.setTextColor(51,65,85)
doc.text(doc.splitTextToSize(item.sub,larguraIRIQ-6),x+larguraIRIQ/2,y+22,{align:'center'})
})
y+=33
/* TOP 3 IRIQ */
doc.setFont('helvetica','bold')
doc.setFontSize(7.4)
doc.setTextColor(15,23,42)
doc.text('3 MAIORES IRIQ MUNICIPAIS',15,y)
y+=3
doc.autoTable({
startY:y,
head:[['POS.','MUNICÍPIO','IRIQ','RISCO','CLASSIFICAÇÃO']],
body:top3IRIQ.map((item,indice)=>[
`${indice+1}º`,
item.municipio||'-',
Number(item.iriq||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}),
item.risco||'-',
item.classificacao||'-'
]),
styles:{fontSize:6.4,cellPadding:1.3,textColor:[51,65,85]},
headStyles:{fillColor:[30,58,138],textColor:[255,255,255],fontStyle:'bold'},
alternateRowStyles:{fillColor:[248,250,252]},
columnStyles:{0:{cellWidth:15,halign:'center'},1:{cellWidth:72},2:{cellWidth:30,halign:'right'},3:{cellWidth:28,halign:'right'},4:{cellWidth:35}},
margin:{left:15,right:15}
})
y=(doc.lastAutoTable?.finalY||y+25)+5
/* TOP FOCOS */
doc.setFont('helvetica','bold')
doc.setFontSize(7.4)
doc.setTextColor(15,23,42)
doc.text('MUNICÍPIOS COM MAIOR CONCENTRAÇÃO DE FOCOS',15,y)
y+=3
doc.autoTable({
startY:y,
head:[['POS.','MUNICÍPIO','FOCOS']],
body:(rankingFocos||[]).slice(0,5).map((item,indice)=>[
`${indice+1}º`,
item.municipio||'-',
Number(item.focos||0).toLocaleString('pt-BR')
]),
styles:{fontSize:6.3,cellPadding:1.2,textColor:[51,65,85]},
headStyles:{fillColor:[127,29,29],textColor:[255,255,255],fontStyle:'bold'},
alternateRowStyles:{fillColor:[254,242,242]},
columnStyles:{0:{cellWidth:18,halign:'center'},1:{cellWidth:127},2:{cellWidth:35,halign:'right'}},
margin:{left:15,right:15}
})
y=(doc.lastAutoTable?.finalY||y+35)+5
/* GRÁFICO / IMAGEM EXECUTIVA */
if(y<232){
let imgGrafico=rtAdicionarImagem(doc,'graficoTempoReal',15,y,112,43)
let imgRanking=rtAdicionarImagem(doc,'painelTempoRealRanking',133,y,62,43)
if(imgGrafico||imgRanking)y+=47
}
/* SÍNTESE */
if(y<261){
doc.setFillColor(239,246,255)
doc.setDrawColor(191,219,254)
doc.roundedRect(15,y,180,Math.min(27,276-y),3,3,'FD')
doc.setFont('helvetica','bold')
doc.setFontSize(7)
doc.setTextColor(30,58,138)
doc.text('SÍNTESE EXECUTIVA',20,y+6)
doc.setFont('helvetica','normal')
doc.setFontSize(6.3)
doc.setTextColor(51,65,85)
let maior1=top3IRIQ[0]
let maior2=top3IRIQ[1]
let maior3=top3IRIQ[2]
let textoSintese=`Embora o IRIQ estadual seja ${iriqEstadual.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})} (${faixaEstado}), a média dos cinco municípios com maiores índices alcança ${mediaTop5.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})} (${faixaTop5}), evidenciando concentração territorial do risco. Destacam-se ${maior1?.municipio||'-'} (${Number(maior1?.iriq||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}), ${maior2?.municipio||'-'} (${Number(maior2?.iriq||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}) e ${maior3?.municipio||'-'} (${Number(maior3?.iriq||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}). O cenário recomenda manutenção do acompanhamento concomitante e priorização dos territórios de maior risco, dos municípios sem resposta e dos entes ainda em dilação.`
doc.text(doc.splitTextToSize(textoSintese,168),20,y+12)
}
rtFonte(doc,'Fonte: TCE-RO • INPE Programa Queimadas • IRIQ • IPT • Heatmap Estadual • Ofício Circular n.16/2026/GABPRES/TCERO e Ofício nº 180/2026/GABPRES/TCERO• atualização automática')
}
/*=========================================================
304 RT INTRODUCAO
=========================================================*/
async function rtIntroducao(doc){
rtCabecalhoPagina(doc,'1. INTRODUÇÃO')
let y=45
y=rtTexto(doc,'O presente relatório técnico apresenta os resultados do monitoramento das ações de prevenção, preparação, resposta e mitigação relacionadas às queimadas e incêndios florestais no Estado de Rondônia.',y,11)
y+=8
y=rtTexto(doc,'O acompanhamento consolida informações ambientais, operacionais, institucionais e territoriais, possibilitando a identificação de riscos, prioridades, fragilidades de governança e oportunidades de atuação preventiva e corretiva.',y,11)
y+=8
rtTexto(doc,'A utilização de painéis gerenciais, bases oficiais, mapas, indicadores e metodologias de avaliação de risco amplia a capacidade de análise e proporciona rastreabilidade às informações utilizadas no processo de controle externo.',y,11)
rtFonte(doc,'Fonte: TCE-RO • Processo PCe 0501/2026')
}
/*=========================================================
305 RT OBJETO
=========================================================*/
async function rtObjeto(doc){
rtCabecalhoPagina(doc,'2. OBJETO')
let y=45
y=rtTexto(doc,'Avaliar a implementação dos planos de ação estaduais e municipais destinados ao enfrentamento das queimadas e incêndios florestais, verificando a capacidade de planejamento, prevenção, resposta, monitoramento e governança dos entes envolvidos.',y,11)
y+=12
rtTexto(doc,'O monitoramento também busca apoiar a tomada de decisão, priorizar territórios e riscos relevantes e acompanhar a produção das evidências necessárias à verificação do cumprimento das ações planejadas.',y,11)
rtFonte(doc,'Fonte: PCe 0501/2026 • TCE-RO')
}
/*=========================================================
306 RT METODOLOGIA
=========================================================*/
async function rtMetodologia(doc){
rtCabecalhoPagina(doc,'3. METODOLOGIA')
let y=45
y=rtTexto(doc,'A metodologia empregada combina monitoramento contínuo de bases institucionais, informações oficiais provenientes dos órgãos públicos e ferramentas analíticas destinadas à classificação, priorização e acompanhamento dos riscos.',y,10)
let itens=['IPT para mensuração da pressão territorial e apoio à priorização municipal.','IRIQ para hierarquização territorial dos riscos de queimadas.','CHAP/M-RAIG para análise da competência organizacional, considerando Conhecimento, Habilidade, Atitude e Propósito.','Heatmap Estadual para representação da criticidade municipal.','Matriz de Risco 5x5 para avaliação da combinação entre probabilidade e impacto.','Monitoramento 4D para acompanhamento de execução, resultados, impactos e riscos.','INPE, PRODES, MapBiomas, planos de ação, documentos e evidências institucionais como fontes de dados.']
y+=8
doc.setFontSize(9)
doc.setTextColor(51,65,85)
itens.forEach((item,i)=>{
let linhas=doc.splitTextToSize((i+1)+'. '+item,172)
doc.text(linhas,20,y)
y+=linhas.length*4.5+4
})
rtFonte(doc,'Fonte: TCE-RO • INPE • PRODES • MapBiomas • SEDAM • CBMRO • municípios de Rondônia')
}
/*=========================================================
307 RT SITUACAO ESTADUAL
=========================================================*/
async function rtSituacaoEstadual(doc){
rtCabecalhoPagina(doc,'4. SITUAÇÃO ESTADUAL')
let y=43
y=rtTexto(doc,'A análise estadual consolida os indicadores relativos a focos de calor, área queimada, desmatamento, criticidade, priorização territorial e risco integrado, proporcionando visão objetiva da situação de Rondônia.',y,9)
let img=rtAdicionarImagem(doc,'painelSalaSituacaoEstadual',10,y+5,190,205)
if(!img)img=rtAdicionarImagem(doc,'painelKPIs',10,y+5,190,90)
if(!img)rtAdicionarImagem(doc,'painelIRIQHeatmapUnificado',10,y+5,190,180)
rtFonte(doc,'Fonte: INPE Programa Queimadas • PRODES • MapBiomas • IRIQ/TCE-RO • atualização automática')
}
/*=========================================================
308 RT ANALISE MUNICIPAL
=========================================================*/
async function rtAnaliseMunicipal(doc){
rtCabecalhoPagina(doc,'5. ANÁLISE MUNICIPAL')
let{data=[]}=await client.from('vw_queimadas_municipios_resposta').select('*')
let total=data.length
let respondidos=data.filter(i=>String(i.classificacao_ia||'').toUpperCase().includes('PLANO')).length
let dilacao=data.filter(i=>String(i.classificacao_ia||'').toUpperCase().includes('DILA')).length
let semResposta=data.filter(i=>String(i.classificacao_ia||'').toUpperCase().includes('SEM RESPOSTA')).length
if(!semResposta)semResposta=Math.max(0,total-respondidos-dilacao)
let y=43
y=rtTexto(doc,`Foram avaliados ${total} municípios. Identificaram-se ${respondidos} municípios com plano apresentado, ${dilacao} com dilação de prazo e ${semResposta} classificados como sem resposta ao Ofício Circular n.16/2026/GABPRES/TCERO.`,y,9)
let img1=rtAdicionarImagem(doc,'painelKPIsMunicipais',10,y+5,190,75)
let proximo=img1?img1.y+img1.h+8:y+82
let img2=rtAdicionarImagem(doc,'painelEstatisticasMunicipais',10,proximo,190,125)
if(!img2)rtAdicionarImagem(doc,'painelTabelaMunicipios',10,proximo,190,125)
rtFonte(doc,'Fonte: Ofício Circular n.16/2026/GABPRES/TCERO • respostas municipais • TCE-RO')
}
/*=========================================================
309 RT HEATMAP
=========================================================*/
async function rtHeatmap(doc){
rtCabecalhoPagina(doc,'6. HEATMAP ESTADUAL')
let y=43
y=rtTexto(doc,'O Heatmap Estadual consolida os resultados do monitoramento por meio da classificação territorial dos municípios, considerando indicadores ambientais, históricos, climáticos e institucionais relacionados às queimadas.',y,9)
let img=rtAdicionarImagem(doc,'painelIRIQHeatmapUnificado',10,y+5,190,200)
if(!img)rtAdicionarImagem(doc,'mapaROEstadual',10,y+5,190,200)
rtFonte(doc,'Fonte: Heatmap Estadual • TCE-RO • INPE • bases ambientais e territoriais')
}
/*=========================================================
310 RT IRIQ
=========================================================*/
async function rtIRIQ(doc){
rtCabecalhoPagina(doc,'7. IRIQ ESTADUAL')
let y=43
y=rtTexto(doc,'O Índice de Risco Integrado de Queimadas - IRIQ constitui indicador composto utilizado para apoiar a priorização territorial das ações preventivas, de fiscalização, preparação e resposta.',y,9)
let img=rtAdicionarImagem(doc,'painelMunicipiosPrioritarios',10,y+5,190,205)
if(!img)rtAdicionarImagem(doc,'painelSalaSituacaoEstadual',10,y+5,190,205)
rtFonte(doc,'Fonte: IRIQ • TCE-RO • INPE • indicadores ambientais e históricos')
}
/*=========================================================
311 RT IPT
=========================================================*/
async function rtIPT(doc){
rtCabecalhoPagina(doc,'8. IPT — ÍNDICE DE PRESSÃO TERRITORIAL')
let y=43
y=rtTexto(doc,'O Índice de Pressão Territorial (IPT) representa a pressão territorial associada às queimadas e incêndios florestais, permitindo a comparação entre os municípios e apoiando a identificação dos territórios que demandam maior prioridade de prevenção, monitoramento, fiscalização e resposta.',y,9)
rtAdicionarImagem(doc,'painelIPT',10,y+6,190,205)
rtFonte(doc,'Fonte: IPT • TCE-RO')
}
/*=========================================================
313 RT MATRIZ RISCO
=========================================================*/
async function rtMatrizRisco(doc){
rtCabecalhoPagina(doc,'10. MATRIZ DE RISCO 5X5')
let y=43
y=rtTexto(doc,'A Matriz de Risco 5x5 classifica os eventos monitorados segundo a combinação entre probabilidade de ocorrência e impacto potencial, permitindo identificar os riscos que demandam atuação prioritária.',y,9)
rtAdicionarImagem(doc,'painelMatriz5x5',10,y+6,190,205)
rtFonte(doc,'Fonte: Matriz de Risco 5x5 • TCE-RO')
}
/*=========================================================
314 RT MUNICIPIOS CRITICOS
=========================================================*/
async function rtMunicipiosCriticos(doc){
rtCabecalhoPagina(doc,'11. MUNICÍPIOS DE MAIOR CRITICIDADE')
let[{data:heat=[]},{data:rankingFocos=[]}]=await Promise.all([
client.from('queimadas_heatmap').select('*'),
client.from('vw_queimadas_ranking_focos_atual').select('municipio,focos')
])
let focosPorMunicipio={}
rankingFocos.forEach(i=>{focosPorMunicipio[rtNormalizarNome(i.municipio)]=Number(i.focos||0)})
let top=[...heat].sort((a,b)=>Number(b.risco||0)-Number(a.risco||0)).slice(0,10)
let y=43
y=rtTexto(doc,'A priorização dos municípios considera a combinação entre criticidade, risco integrado, histórico ambiental, capacidade institucional e intensidade recente dos focos de calor.',y,9)
doc.autoTable({startY:y+4,head:[['POS','MUNICÍPIO','IRIQ','RISCO','CLASSIFICAÇÃO','FOCOS 2026']],body:top.map((m,i)=>[i+1,m.municipio||'-',Number(m.iriq||0).toFixed(2),m.risco||'-',m.classificacao||'-',focosPorMunicipio[rtNormalizarNome(m.municipio)]??Number(m.focos||0)]),styles:{fontSize:8,font:'helvetica',cellPadding:2.2,textColor:[51,65,85]},headStyles:{fillColor:[127,29,29],textColor:[255,255,255],fontStyle:'bold'},alternateRowStyles:{fillColor:[248,250,252]},margin:{left:15,right:15}})
let finalY=(doc.lastAutoTable?.finalY||170)+10
rtTexto(doc,'Os municípios classificados nas faixas de maior criticidade demandam intensificação das ações de prevenção, fiscalização, resposta operacional e acompanhamento da execução dos respectivos planos de ação.',finalY,9)
rtFonte(doc,'Fonte: Heatmap Estadual • IRIQ • INPE Programa Queimadas • TCE-RO')
}
/*=========================================================
315 TOP 10 RISCOS PDF
=========================================================*/
async function adicionarTop10RiscosPDF(doc){
let{data=[]}=await client.from('queimadas_heatmap').select('*')
let lista=[...(data||[])].sort((a,b)=>Number(b.risco||0)-Number(a.risco||0)).slice(0,10)
doc.addPage()
rtCabecalhoPagina(doc,'TOP 10 MUNICÍPIOS DE MAIOR RISCO')
doc.autoTable({startY:42,head:[['POS','MUNICÍPIO','RISCO','CLASSIFICAÇÃO']],body:lista.map((i,idx)=>[idx+1,i.municipio||'-',i.risco||0,i.classificacao||'-']),styles:{fontSize:9,cellPadding:3,textColor:[51,65,85]},headStyles:{fillColor:[127,29,29],textColor:[255,255,255]},alternateRowStyles:{fillColor:[248,250,252]},margin:{left:15,right:15}})
let img=rtAdicionarImagem(doc,'painelMunicipiosPrioritarios',10,(doc.lastAutoTable?.finalY||150)+10,190,95)
rtFonte(doc,'Fonte: Heatmap Estadual • IRIQ • TCE-RO')
}
/*=========================================================
316 TABELA MUNICIPIOS PDF
=========================================================*/
async function adicionarTabelaMunicipiosPDF(doc){
let{data,error}=await client.from('vw_queimadas_municipios_resposta').select('*').order('municipio')
if(error)return
doc.addPage()
rtCabecalhoPagina(doc,'SITUAÇÃO DOS 52 MUNICÍPIOS')
doc.autoTable({startY:42,head:[['Nº','MUNICÍPIO','SITUAÇÃO','DOCUMENTO','RECEBIMENTO']],body:(data||[]).map((i,idx)=>[idx+1,i.municipio||'-',i.classificacao_ia||'-',i.lnumerodocenviado||i.llnumerodocenviado||'-',formatarDataBR(i.ldatarecebimentodoc)]),styles:{fontSize:6.6,cellPadding:1.8,textColor:[51,65,85]},headStyles:{fillColor:[15,23,42],textColor:[255,255,255]},alternateRowStyles:{fillColor:[245,245,245]},margin:{left:10,right:10}})
rtFonte(doc,'Fonte: Ofício Circular n.16/2026/GABPRES/TCERO • respostas e documentos constantes dos autos')
}
/*=========================================================
317 RT ACHADOS
=========================================================*/
async function rtAchados(doc){
rtCabecalhoPagina(doc,'12. ACHADOS DE AUDITORIA')
let achados=['Municípios que não responderam ao Ofício Circular n.16/2026/GABPRES/TCERO.','Municípios que solicitaram dilação de prazo para apresentação dos planos de ação.','Municípios que não apresentaram plano de ação ou documentação suficiente.','Áreas classificadas como críticas e altas pelos instrumentos de análise territorial.','Concentração de focos de calor em municípios prioritários.','Necessidade de fortalecimento da governança interfederativa para prevenção e resposta.']
let y=45
achados.forEach((texto,i)=>{
doc.setFillColor(i<3?254:248,i<3?242:250,i<3?242:252)
doc.roundedRect(15,y-5,180,17,3,3,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(9)
doc.setTextColor(i<3?185:51,i<3?28:65,i<3?28:85)
doc.text((i+1)+'.',20,y+2)
doc.setFont('helvetica','normal')
let linhas=doc.splitTextToSize(texto,160)
doc.text(linhas,28,y+2)
y+=22
})
y+=4
rtTexto(doc,'Os achados evidenciam fragilidades que demandam acompanhamento contínuo e atuação coordenada entre Estado, municípios, órgãos ambientais, estruturas operacionais e controle externo.',y,9)
let img=rtAdicionarImagem(doc,'painelAchadosAutomaticos',10,y+25,190,75)
rtFonte(doc,'Fonte: monitoramento concomitante • bases institucionais • evidências • TCE-RO')
}
/*=========================================================
318 RT EVIDENCIAS
=========================================================*/
async function rtEvidencias(doc){
rtCabecalhoPagina(doc,'13. EVIDÊNCIAS')
let y=43
y=rtTexto(doc,'Foram analisadas evidências provenientes da SEDAM e CBMRO, com documentos encaminhados em resposta ao Ofício nº 180/2026/GABPRES/TCERO.',y,9)
let img1=rtAdicionarImagem(doc,'painelEvidencias',10,y+5,190,82)
let proximo=img1?img1.y+img1.h+8:y+90
let img2=rtAdicionarImagem(doc,'painelMonitoramento4D',10,proximo,190,92)
if(!img2)rtAdicionarImagem(doc,'painelGovernanca',10,proximo,190,92)
rtFonte(doc,'Fonte: SEDAM • CBMRO • documentos dos autos • Sistema de Monitoramento')
}
/*=========================================================
319 RT CONCLUSOES
=========================================================*/
async function rtConclusoes(doc){
rtCabecalhoPagina(doc,'14. CONCLUSÕES')
let{data:rankingIRIQ=[],error}=await client.from('queimadas_heatmap').select('municipio,iriq').order('iriq',{ascending:false}).limit(5)
if(error)console.error('Erro ao consultar Top 5 IRIQ:',error)
let top5=(rankingIRIQ||[]).filter(i=>Number.isFinite(Number(i.iriq)))
let mediaTop5=top5.length?top5.reduce((s,i)=>s+Number(i.iriq||0),0)/top5.length:0
let maiorIRIQ=top5.length?Number(top5[0].iriq||0):0
let municipiosTop5=top5.map(i=>i.municipio).join(', ')
let y=45
y=rtTexto(doc,'Os resultados do monitoramento evidenciam avanços na estruturação das ações de enfrentamento às queimadas em Rondônia, porém persistem riscos relevantes associados à ausência de respostas municipais, fragilidades de planejamento e necessidade de fortalecimento da coordenação interinstitucional.',y,10)
y+=8
y=rtTexto(doc,'Os instrumentos de priorização e análise demonstram que parte do território permanece sujeita a níveis relevantes de risco, exigindo atualização permanente dos dados, execução efetiva dos planos de ação e integração das estruturas estaduais e municipais.',y,10)
y+=8
if(top5.length){
let textoIRIQ=`Embora o IRIQ agregado do Estado se encontre atualmente classificado na faixa baixa, essa leitura estadual não deve ser interpretada isoladamente. Os cinco municípios com maiores índices apresentam IRIQ médio de ${mediaTop5.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}, alcançando o maior deles ${maiorIRIQ.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}. Esse resultado evidencia concentração territorial relevante do risco e demonstra que, mesmo diante de um indicador estadual reduzido, determinados municípios apresentam situação significativamente mais elevada e demandam acompanhamento prioritário. Os cinco municípios considerados são: ${municipiosTop5}.`
y=rtTexto(doc,textoIRIQ,y,10)
y+=8
}
y=rtTexto(doc,'Conclui-se pela necessidade de continuidade do acompanhamento técnico e institucional, com prioridade para os municípios e territórios que apresentem maior criticidade, concentração de focos de calor ou baixa capacidade de resposta.',y,10)
let img=rtAdicionarImagem(doc,'painelIndicadoresGovernanca',10,y+12,190,90)
rtFonte(doc,'Fonte: consolidação do monitoramento • IRIQ • TCE-RO')
}
/*=========================================================
320 RT PROPOSTAS
=========================================================*/
async function rtPropostas(doc){
rtCabecalhoPagina(doc,'15. PROPOSTAS DE ENCAMINHAMENTO')
let propostas=['Fortalecer a governança estadual e interfederativa para enfrentamento das queimadas.','Atualizar e monitorar continuamente os planos municipais de ação.','Priorizar os municípios e territórios classificados nos níveis de maior risco.','Utilizar IRIQ, IPT e demais instrumentos de priorização como apoio à tomada de decisão.','Integrar bases de dados estaduais, municipais e federais.','Fortalecer ações preventivas antes e durante o período crítico de estiagem.','Monitorar periodicamente a execução física e financeira dos planos.','Manter mecanismos permanentes de sala de situação e acompanhamento dos riscos.','Intensificar ações de fiscalização e controle ambiental nos territórios prioritários.','Promover capacitação contínua e aperfeiçoamento das equipes envolvidas.']
let y=44
propostas.forEach((p,i)=>{
doc.setFillColor(248,250,252)
doc.roundedRect(15,y-5,180,16,3,3,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(9)
doc.setTextColor(37,99,235)
doc.text(String(i+1).padStart(2,'0'),20,y+2)
doc.setFont('helvetica','normal')
doc.setTextColor(51,65,85)
let linhas=doc.splitTextToSize(p,158)
doc.text(linhas,31,y+2)
y+=21
})
rtFonte(doc,'Fonte: consolidação das análises e achados do monitoramento • TCE-RO')
}
/*=========================================================
321 RT PAINEL SITUACAO VISUAL
=========================================================*/
async function rtPainelSituacaoVisual(doc){
rtCabecalhoPagina(doc,'PAINEL DE SITUAÇÃO E GOVERNANÇA')
let img1=rtAdicionarImagem(doc,'painelSalaSituacaoEstadual',10,40,190,135)
let y=img1?img1.y+img1.h+8:48
let img2=rtAdicionarImagem(doc,'painelTopIAIPT',10,y,190,95)
if(!img2)rtAdicionarImagem(doc,'painelIndicadoresGovernanca',10,y,190,95)
rtFonte(doc,'Fonte: INPE • PRODES • MapBiomas • IRIQ • IPT • IA-CHAP • TCE-RO')
}
/*=========================================================
322 RT PAINEL MONITORAMENTO VISUAL
=========================================================*/
async function rtPainelMonitoramentoVisual(doc){
rtCabecalhoPagina(doc,'MONITORAMENTO INTEGRADO')
let img1=rtAdicionarImagem(doc,'painelMonitoramento4D',10,40,190,95)
let y=img1?img1.y+img1.h+8:48
let img2=rtAdicionarImagem(doc,'painelExecucaoFisica',10,y,91,85)
rtAdicionarImagem(doc,'painelExecucaoFinanceira',109,y,91,85)
let proximo=img2?img2.y+img2.h+8:y+92
rtAdicionarImagem(doc,'painelEvidencias',10,proximo,190,78)
rtFonte(doc,'Fonte: SEDAM • CBMRO • TCE-RO • planos de ação • evidências apresentadas')
}
/*=========================================================
323 RT PAINEL TEMPO REAL
=========================================================*/
async function rtPainelTempoRealVisual(doc){
rtCabecalhoPagina(doc,'EVOLUÇÃO DOS FOCOS DE CALOR')
let img1=rtAdicionarImagem(doc,'painelTempoRealKPIs',10,40,190,68)
let y=img1?img1.y+img1.h+8:48
let img2=rtAdicionarImagem(doc,'graficoTempoReal',10,y,190,100)
let proximo=img2?img2.y+img2.h+8:y+108
rtAdicionarImagem(doc,'painelTempoRealRanking',10,proximo,190,82)
rtFonte(doc,'Fonte: INPE Programa Queimadas • dados filtrados para Rondônia • atualização automática')
}
/*=========================================================
324 RT ANEXOS
=========================================================*/
async function rtAnexos(doc){
rtCabecalhoPagina(doc,'16. ANEXOS')
let anexos=['Mapa Estadual de Risco e áreas ambientais monitoradas.','Mapa Municipal dos Planos de Ação.','Painel de Situação e Governança.','Heatmap Estadual.','IRIQ Estadual.','Painel IPT.','Matriz de Risco 5x5.','Tabela Consolidada dos 52 Municípios.','Planos de Ação Estaduais e Municipais.','Evidências Documentais.','Monitoramento 4D.','Indicadores Estratégicos.','Evolução dos Focos de Calor.','Demais documentos de suporte utilizados na análise.']
let y=45
doc.setFontSize(9)
doc.setTextColor(51,65,85)
anexos.forEach((a,i)=>{
doc.text((i+1)+'. '+a,20,y)
y+=11
})
y+=10
rtTexto(doc,'Os anexos integram o relatório técnico e constituem parte das evidências, bases informacionais e instrumentos analíticos utilizados para fundamentação das análises, conclusões e propostas de encaminhamento.',y,9)
rtFonte(doc,'Fonte: Sistema de Monitoramento Inteligente de Queimadas • TCE-RO')
}
/*=========================================================
325 RT MAPA ESTADUAL
=========================================================*/
async function rtMapaEstadual(doc){
rtCabecalhoPagina(doc,'ANEXO I - MAPA ESTADUAL')
let y=43
y=rtTexto(doc,'O mapa apresenta a distribuição espacial das áreas e riscos monitorados no território de Rondônia, possibilitando identificar regiões prioritárias para prevenção, fiscalização e resposta operacional.',y,9)
let img=rtAdicionarImagem(doc,'mapaROEstadual',10,y+6,190,205)
if(!img)rtAdicionarImagem(doc,'mapaRO',10,y+6,190,205)
rtFonte(doc,'Fonte: TCE-RO • INPE • SEDAM • Base Cartográfica Estadual • OpenStreetMap')
}
/*=========================================================
323 RT MAPA MUNICIPAL
=========================================================*/
async function rtMapaMunicipal(doc){
rtCabecalhoPagina(doc,'ANEXO II - MAPA MUNICIPAL DOS PLANOS DE AÇÃO')
doc.setFont('helvetica','normal')
doc.setFontSize(10)
doc.setTextColor(51,65,85)
let texto='O mapa municipal demonstra a situação dos 52 municípios quanto ao atendimento do Ofício Circular n.16/2026/GABPRES/TCERO e à apresentação dos respectivos Planos de Ação para prevenção e enfrentamento das queimadas e incêndios florestais.'
doc.text(doc.splitTextToSize(texto,180),15,38)
await mostrarAbaQueimadas('executivomunicipal')
await new Promise(r=>setTimeout(r,1000))
if(window.mapaPlanosMunicipais&&window.camadaPlanosMunicipais){
try{
window.mapaPlanosMunicipais.invalidateSize(true)
let bounds=window.camadaPlanosMunicipais.getBounds()
if(bounds&&bounds.isValid()){
window.mapaPlanosMunicipais.fitBounds(bounds,{
padding:[12,12],
maxZoom:7
})
}
}catch(e){
console.warn('Erro ao reenquadrar mapa municipal:',e)
}
}
await new Promise(r=>setTimeout(r,1200))
let img=await capturarElemento('mapaMunicipalPlanos')
if(img){
let props=doc.getImageProperties(img)
let largura=180
let altura=(props.height*largura)/props.width
let alturaMaxima=150
if(altura>alturaMaxima){
altura=alturaMaxima
largura=(props.width*altura)/props.height
}
let x=(210-largura)/2
let y=58
doc.setFillColor(248,250,252)
doc.setDrawColor(203,213,225)
doc.roundedRect(x-2,y-2,largura+4,altura+4,3,3,'FD')
doc.addImage(img,'PNG',x,y,largura,altura,undefined,'FAST')
let yLegenda=y+altura+10
doc.setFont('helvetica','bold')
doc.setFontSize(7)
doc.setTextColor(15,23,42)
doc.text('SITUAÇÃO DOS MUNICÍPIOS',15,yLegenda)
let legenda=[
['PLANO DE AÇÃO',[22,163,74]],
['DILAÇÃO DE PRAZO',[250,204,21]],
['SEM RESPOSTA',[220,38,38]]
]
let lx=15
legenda.forEach(item=>{
doc.setFillColor(...item[1])
doc.roundedRect(lx,yLegenda+4,5,5,1,1,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(6.2)
doc.setTextColor(17,24,39)
doc.text(item[0],lx+8,yLegenda+8)
lx+=58
})
}
doc.setFont('helvetica','italic')
doc.setFontSize(7)
doc.setTextColor(100,116,139)
doc.text('Fonte: Municípios do Estado de Rondônia • TCE-RO',15,273)
}
/*=========================================================
327 RT MONITORAMENTO 4D
=========================================================*/
async function rtMonitoramento4D(doc){
rtCabecalhoPagina(doc,'ANEXO III - MONITORAMENTO 4D')
let y=43
y=rtTexto(doc,'O Monitoramento 4D consolida informações relacionadas à execução, resultados, impactos, riscos, governança e evidências produzidas no acompanhamento das ações estaduais e municipais.',y,9)
let img1=rtAdicionarImagem(doc,'painelMonitoramento4D',10,y+6,190,110)
let proximo=img1?img1.y+img1.h+8:y+125
let img2=rtAdicionarImagem(doc,'painelGovernanca',10,proximo,190,90)
if(!img2)rtAdicionarImagem(doc,'painelEvidencias',10,proximo,190,90)
rtFonte(doc,'Fonte: Sistema de Monitoramento Inteligente de Queimadas • TCE-RO')
}
/*=========================================================
328 RT REFERENCIAS
=========================================================*/
async function rtReferencias(doc){
rtCabecalhoPagina(doc,'17. REFERÊNCIAS')
let refs=['Instituto Nacional de Pesquisas Espaciais - INPE. Programa Queimadas.','MapBiomas Brasil. Coleções de Uso e Cobertura da Terra.','Projeto de Monitoramento do Desmatamento na Amazônia Legal por Satélite - PRODES.','Secretaria de Estado do Desenvolvimento Ambiental - SEDAM.','Corpo de Bombeiros Militar do Estado de Rondônia - CBMRO.','Tribunal de Contas do Estado de Rondônia - TCE-RO.','Plano de Ação da SEDAM para Enfrentamento das Queimadas.','Plano Operacional relacionado às ações do CBMRO.','Plano Unificado de Enfrentamento às Queimadas.','Índice de Pressão Territorial - IPT.','Modelo de Competência Organizacional CHAP e metodologia M-RAIG.','Heatmap Estadual de Queimadas.','Índice de Risco Integrado de Queimadas - IRIQ.','Processo PCe 0501/2026.','Ofício Circular n.16/2026/GABPRES/TCERO.']
let y=45
doc.setFont('helvetica','normal')
doc.setFontSize(9)
doc.setTextColor(51,65,85)
refs.forEach((r,i)=>{
let linhas=doc.splitTextToSize((i+1)+'. '+r,170)
doc.text(linhas,20,y)
y+=linhas.length*4.5+4
})
rtFonte(doc,'Referências institucionais e bases utilizadas no monitoramento')
}
/*=========================================================
329 RT SIGLAS
=========================================================*/
async function rtSiglas(doc){
rtCabecalhoPagina(doc,'18. SIGLAS E ABREVIATURAS')
let siglas=[['CBMRO','Corpo de Bombeiros Militar do Estado de Rondônia'],['CHAP','Conhecimento, Habilidade, Atitude e Propósito'],['INPE','Instituto Nacional de Pesquisas Espaciais'],['IPT','Índice de Pressão Territorial'],['IRIQ','Índice de Risco Integrado de Queimadas'],['M-RAIG','Metodologia de Referência para Avaliação Integrada de Governança'],['ODS','Objetivos de Desenvolvimento Sustentável'],['PCe','Processo de Controle Externo'],['PRODES','Projeto de Monitoramento do Desmatamento na Amazônia Legal por Satélite'],['SEDAM','Secretaria de Estado do Desenvolvimento Ambiental'],['TCE-RO','Tribunal de Contas do Estado de Rondônia'],['TI','Terra Indígena'],['UC','Unidade de Conservação']]
doc.autoTable({startY:42,head:[['SIGLA','DESCRIÇÃO']],body:siglas,styles:{fontSize:9,cellPadding:3,textColor:[51,65,85]},headStyles:{fillColor:[15,23,42],textColor:[255,255,255]},alternateRowStyles:{fillColor:[248,250,252]},margin:{left:15,right:15}})
}
/*=========================================================
330 RT GLOSSARIO
=========================================================*/
async function rtGlossario(doc){
rtCabecalhoPagina(doc,'19. GLOSSÁRIO')
let termos=[['Queimada','Utilização controlada ou não do fogo em vegetação natural ou antrópica.'],['Foco de Calor','Registro orbital de temperatura compatível com a ocorrência de fogo.'],['Heatmap','Representação gráfica dos níveis de risco por território.'],['IRIQ','Indicador composto utilizado para classificação e priorização dos riscos de queimadas.'],['IPT','Índice de Pressão Territorial utilizado para mensurar comparativamente a pressão territorial associada às queimadas e incêndios florestais.'],['Governança','Conjunto de mecanismos de coordenação, decisão, acompanhamento e controle das ações.'],['Monitoramento 4D','Acompanhamento integrado da execução, resultados, impactos e riscos.'],['CHAP','Modelo de Competência Organizacional estruturado nas dimensões Conhecimento, Habilidade, Atitude e Propósito.'],['Matriz 5x5','Ferramenta de avaliação de risco baseada em probabilidade e impacto.'],['Sala de Situação','Ambiente de acompanhamento integrado dos eventos e indicadores críticos.']]
let y=45
termos.forEach(([titulo,texto])=>{
doc.setFont('helvetica','bold')
doc.setFontSize(9)
doc.setTextColor(15,23,42)
doc.text(titulo+':',20,y)
doc.setFont('helvetica','normal')
doc.setTextColor(51,65,85)
let linhas=doc.splitTextToSize(texto,145)
doc.text(linhas,48,y)
y+=Math.max(12,linhas.length*5+5)
})
}
/*=========================================================
331 RT FICHA TECNICA
=========================================================*/
async function rtFichaTecnica(doc){
rtCabecalhoPagina(doc,'20. FICHA TÉCNICA')
doc.setFillColor(248,250,252)
doc.roundedRect(15,42,180,190,5,5,'F')
doc.setFont('helvetica','bold')
doc.setFontSize(12)
doc.setTextColor(15,23,42)
doc.text('TRIBUNAL DE CONTAS DO ESTADO DE RONDÔNIA',25,60)
doc.setFont('helvetica','normal')
doc.setFontSize(10)
doc.setTextColor(51,65,85)
let linhas=[['Processo','PCe 0501/2026'],['Objeto','Monitoramento das Queimadas e Incêndios Florestais'],['Documento','Relatório Técnico de Monitoramento'],['Coordenador dos Trabalhos','Manoel Fernandes Neto'],['Equipe Técnica','Luís Fernando Bueno'],['Supervisão','Raimundo Paulo Dias Barros Vieira'],['Ferramentas','Heatmap • IRIQ • IPT • CHAP/M-RAIG • Matriz 5x5 • Monitoramento 4D'],['Data de Emissão',new Date().toLocaleDateString('pt-BR')]]
let y=82
linhas.forEach(([campo,valor])=>{
doc.setFont('helvetica','bold')
doc.text(campo+':',25,y)
doc.setFont('helvetica','normal')
let txt=doc.splitTextToSize(valor,120)
doc.text(txt,70,y)
y+=Math.max(16,txt.length*5+8)
})
rtFonte(doc,'TCE-RO • PCe 0501/2026')
}
/*=========================================================
332 RT ASSINATURAS
=========================================================*/
async function rtAssinaturas(doc){
rtCabecalhoPagina(doc,'21. RESPONSABILIDADE TÉCNICA')
doc.setFontSize(11)
doc.setTextColor(15,23,42)
doc.setFont('helvetica','bold')
doc.text('Manoel Fernandes Neto',55,90,{align:'center'})
doc.setDrawColor(100,116,139)
doc.line(20,95,90,95)
doc.setFont('helvetica','normal')
doc.setFontSize(9)
doc.text('Auditor de Controle Externo',55,105,{align:'center'})
doc.text('Matrícula n. 275',55,113,{align:'center'})
doc.setFont('helvetica','bold')
doc.setFontSize(11)
doc.text('Luís Fernando Bueno',155,90,{align:'center'})
doc.line(120,95,190,95)
doc.setFont('helvetica','normal')
doc.setFontSize(9)
doc.text('Assessor Técnico',155,105,{align:'center'})
doc.text('Apoio Técnico',155,113,{align:'center'})
doc.setFont('helvetica','bold')
doc.setFontSize(11)
doc.text('Raimundo Paulo Dias Barros Vieira',105,170,{align:'center'})
doc.line(55,175,155,175)
doc.setFont('helvetica','normal')
doc.setFontSize(9)
doc.text('Auditor de Controle Externo',105,185,{align:'center'})
doc.text('Supervisor',105,193,{align:'center'})
}
/*=========================================================
333 RT FUNCTION GERARWORDTECNICO0501
=========================================================*/
async function gerarWordTecnico0501(){
let botao=document.querySelector('[onclick="gerarWordTecnico0501()"]')
let textoOriginal=botao?.innerHTML||''
if(botao){
botao.disabled=true
botao.innerHTML='⏳ GERANDO WORD...'
}
try{
await prepararImagensRelatorioRT()
function imagemWord(id){
let img=rtImagem(id)
return img?`<img src="${img.data}" style="display:block;width:100%;max-width:900px;height:auto;margin:18px auto;border:1px solid #e2e8f0;border-radius:8px">`:''
}
let html=''
html+='<!DOCTYPE html><html><head><meta charset="utf-8"><style>'
html+='body{font-family:Arial,sans-serif;color:#0f172a;margin:40px;line-height:1.55}'
html+='h1{font-size:28px;color:#0f172a;text-align:center}'
html+='h2{font-size:20px;color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin-top:28px}'
html+='h3{font-size:16px;color:#1e3a8a}'
html+='p{font-size:11pt;text-align:justify}'
html+='.capa{background:#0f172a;color:white;padding:80px 40px;text-align:center}'
html+='.capa h1,.capa h2{color:white;border:0}'
html+='.fonte{font-size:8pt;color:#64748b;font-style:italic;border-top:1px solid #e2e8f0;padding-top:6px;margin-top:8px}'
html+='table{width:100%;border-collapse:collapse;font-size:9pt}th{background:#0f172a;color:white;padding:7px}td{padding:6px;border-bottom:1px solid #e2e8f0}'
html+='</style></head><body>'
html+='<div class="capa"><h1>TRIBUNAL DE CONTAS DO ESTADO DE RONDÔNIA</h1><h2>PCe 0501/2026</h2><h1>MONITORAMENTO DAS QUEIMADAS</h1><h2>RELATÓRIO TÉCNICO</h2><p style="text-align:center;color:white">'+new Date().toLocaleDateString('pt-BR')+'</p></div>'
html+='<h2>SUMÁRIO EXECUTIVO</h2><p>Visão consolidada dos principais indicadores do monitoramento das queimadas e incêndios florestais no Estado de Rondônia.</p>'+imagemWord('painelKPIs')+imagemWord('painelFocosCalor')+'<div class="fonte">Fonte: TCE-RO • INPE • PRODES • MapBiomas</div>'
html+='<h2>1. INTRODUÇÃO</h2><p>O presente relatório técnico apresenta os resultados do monitoramento das ações de prevenção, preparação, resposta e mitigação relacionadas às queimadas e incêndios florestais no Estado de Rondônia.</p>'
html+='<h2>2. OBJETO</h2><p>Avaliar a implementação dos planos de ação estaduais e municipais destinados ao enfrentamento das queimadas e incêndios florestais.</p>'
html+='<h2>3. METODOLOGIA</h2><p>Foram utilizados IPT, IRIQ, Heatmap Estadual, Matriz de Risco 5x5, Monitoramento 4D e bases oficiais e institucionais. O CHAP/M-RAIG é utilizado especificamente na análise de competência organizacional e governança, não se confundindo com o IPT territorial.</p>'
html+='<h2>4. SITUAÇÃO ESTADUAL</h2>'+imagemWord('painelSalaSituacaoEstadual')+'<div class="fonte">Fonte: INPE • PRODES • MapBiomas • IRIQ/TCE-RO</div>'
html+='<h2>5. ANÁLISE MUNICIPAL</h2><p>Acompanhamento dos 52 municípios quanto à situação dos planos de ação e atendimento ao Ofício Circular n.16/2026/GABPRES/TCERO.</p>'+imagemWord('painelKPIsMunicipais')+imagemWord('painelEstatisticasMunicipais')+'<div class="fonte">Fonte: Municípios de Rondônia • TCE-RO</div>'
html+='<h2>6. HEATMAP ESTADUAL</h2>'+imagemWord('painelIRIQHeatmapUnificado')+'<p>O Heatmap permite visualizar territorialmente os diferentes níveis de criticidade.</p>'
html+='<h2>7. IRIQ ESTADUAL</h2>'+imagemWord('painelMunicipiosPrioritarios')+'<p>O IRIQ subsidia a priorização territorial das ações de controle, prevenção e resposta.</p>'
html+='<h2>8. IPT — ÍNDICE DE PRESSÃO TERRITORIAL</h2>'+imagemWord('painelIPT')+'<p>O IPT representa a pressão territorial associada às queimadas e incêndios florestais e subsidia a comparação e a priorização dos municípios monitorados.</p>'
html+='<h2>9. CHAP / M-RAIG — COMPETÊNCIA ORGANIZACIONAL</h2>'+imagemWord('painelTopIAIPT')+'<p>O CHAP, no âmbito da metodologia M-RAIG do TCE-RO, é utilizado para análise estruturada da competência organizacional, considerando Conhecimento, Habilidade, Atitude e Propósito. Sua aplicação é distinta do IPT, que possui natureza territorial.</p>'
html+='<h2>10. MATRIZ DE RISCO 5X5</h2>'+imagemWord('painelMatriz5x5')+'<p>A matriz combina probabilidade e impacto potencial para classificar os eventos monitorados.</p>'
html+='<h2>11. SITUAÇÃO E GOVERNANÇA</h2>'+imagemWord('painelIndicadoresGovernanca')+'<div class="fonte">Fonte: TCE-RO • IRIQ • IPT • CHAP/M-RAIG</div>'
html+='<h2>12. MONITORAMENTO INTEGRADO</h2>'+imagemWord('painelMonitoramento4D')+imagemWord('painelExecucaoFisica')+imagemWord('painelExecucaoFinanceira')+imagemWord('painelEvidencias')+'<div class="fonte">Fonte: SEDAM • CBMRO • TCE-RO</div>'
html+='<h2>13. EVOLUÇÃO DOS FOCOS</h2>'+imagemWord('painelTempoRealKPIs')+imagemWord('graficoTempoReal')+imagemWord('painelTempoRealRanking')+'<div class="fonte">Fonte: INPE Programa Queimadas</div>'
html+='<h2>14. MAPA ESTADUAL</h2>'+imagemWord('mapaROEstadual')+'<div class="fonte">Fonte: TCE-RO • INPE • SEDAM • Base Cartográfica Estadual</div>'
html+='<h2>15. MAPA MUNICIPAL</h2>'+imagemWord('mapaMunicipalPlanos')+'<div class="fonte">Fonte: Municípios de Rondônia • TCE-RO</div>'
html+='<h2>16. ACHADOS</h2>'+imagemWord('painelAchadosAutomaticos')+'<p>Os achados identificados orientam a priorização das providências de controle e acompanhamento concomitante.</p>'
html+='<h2>17. CONCLUSÕES</h2><p>Os resultados demonstram a necessidade de continuidade do monitoramento, fortalecimento da governança, integração institucional e priorização dos municípios e territórios de maior risco.</p>'
html+='<h2>18. PROPOSTAS DE ENCAMINHAMENTO</h2><p>Recomenda-se fortalecer a governança, ampliar o monitoramento, integrar bases de dados, acompanhar a execução física e financeira e priorizar os municípios e territórios classificados nos maiores níveis de risco.</p>'
html+='<h2>19. RESPONSABILIDADE TÉCNICA</h2><p><b>Manoel Fernandes Neto</b><br>Auditor de Controle Externo • Coordenador dos Trabalhos</p><p><b>Luís Fernando Bueno</b><br>Assessor Técnico • Apoio Técnico</p><p><b>Raimundo Paulo Dias Barros Vieira</b><br>Auditor de Controle Externo • Supervisor</p>'
html+='</body></html>'
baixarWordQueimadas('Relatório Técnico PCe 0501 2026 QUEIMADAS',html)
await mostrarAbaQueimadas('auditor')
}catch(error){
console.error('Erro ao gerar relatório Word:',error)
alert('Erro ao gerar o Word: '+(error.message||error))
}finally{
if(botao){
botao.disabled=false
botao.innerHTML=textoOriginal
}
}
}
