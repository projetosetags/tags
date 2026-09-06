/*=========================================================
205 QUEIMADAS BOTOES PDF WORD
=========================================================*/
function montarBotoesPDFQueimadas(tipo){
const botoes={
dashboard:[
'gerarPDFDashboardQueimadas',
'gerarWordDashboardQueimadas',
'PDF DASHBOARD',
'WORD DASHBOARD'
],
resumo:[
'gerarPDFResumoQueimadas',
'gerarWordResumoQueimadas',
'PDF RESUMO',
'WORD RESUMO'
],
monitoramento:[
'gerarPDFMonitoramentoQueimadas',
'gerarWordMonitoramentoQueimadas',
'PDF MONITORAMENTO',
'WORD MONITORAMENTO'
]
}
if(!botoes[tipo])return''
return`
<button onclick="${botoes[tipo][0]}()" class="btn-pdf">${botoes[tipo][2]}</button>
<button onclick="${botoes[tipo][1]}()" class="btn-pdf btn-word">${botoes[tipo][3]}</button>
`
}

/*=========================================================
206 ATUALIZACAO AUTOMATICA DO PAINEL QUEIMADAS
Base dinamica: PROTEGE/SEDAM + INPE
Atualizacao implantada em 05/09/2026
=========================================================*/
function normalizarRotulosFontesQueimadas(){
try{
const trocas=[
['ÚLTIMA DATA INPE','ÚLTIMA DATA DISPONÍVEL'],
['FOCOS NA ÚLTIMA DATA INPE','FOCOS NA ÚLTIMA DATA DISPONÍVEL'],
['Última Data INPE','Última Data Disponível'],
['Última atualização do banco INPE:','Última atualização da base oficial:'],
['Fonte: Programa Queimadas • INPE • Dados oficiais filtrados para os municípios de Rondônia • Atualização automática','Fonte: PROTEGE/SEDAM • INPE • Dados oficiais consolidados para os municípios de Rondônia • Atualização automática'],
['Fonte: INPE • Sistema de Monitoramento Inteligente de Queimadas • TCE-RO','Fonte: PROTEGE/SEDAM • INPE • Sistema de Monitoramento Inteligente de Queimadas • TCE-RO'],
['Fonte: INPE • Ranking Estadual','Fonte: PROTEGE/SEDAM • INPE • Ranking Estadual']
]
const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT)
let node
while(node=walker.nextNode()){
let texto=node.nodeValue||''
let novo=texto
for(const[de,para]of trocas){
if(novo.includes(de))novo=novo.split(de).join(para)
}
if(novo!==texto)node.nodeValue=novo
}
document.querySelectorAll('.resumoLinha').forEach(linha=>{
const esquerda=linha.querySelector('.resumoEsquerda span')?.textContent?.trim()
const valor=linha.querySelector('.resumoValor')
if(esquerda==='Fonte Oficial'&&valor&&valor.textContent.trim()==='INPE'){
valor.textContent='PROTEGE/SEDAM + INPE'
}
})
}catch(error){
console.warn('206 Falha ao normalizar fontes do painel:',error)
}
}

async function atualizarPainelQueimadasAutomaticamente(){
try{
if(typeof renderTempoReal==='function')await renderTempoReal()
if(typeof carregarKPIsExecutivos==='function')await carregarKPIsExecutivos()
if(typeof renderPainelFocosINPE==='function')await renderPainelFocosINPE()
}catch(error){
console.warn('206 Falha na atualização automática do painel:',error)
}finally{
setTimeout(normalizarRotulosFontesQueimadas,800)
}
}

function iniciarAtualizacaoAutomaticaQueimadas(){
normalizarRotulosFontesQueimadas()
const observer=new MutationObserver(()=>normalizarRotulosFontesQueimadas())
observer.observe(document.body,{subtree:true,childList:true,characterData:true})
setTimeout(atualizarPainelQueimadasAutomaticamente,2500)
setInterval(atualizarPainelQueimadasAutomaticamente,300000)
}

/*=========================================================
207 RIO MADEIRA • FONTE DE ACOMPANHAMENTO SIPAM
Manter a base na última data disponível até nova remessa do SIPAM.
Data de referência atual: 13/08/2026.
=========================================================*/
function ajustarStatusRioMadeiraSIPAM(){
try{
const aba=document.getElementById('abaRioMadeira')
if(!aba)return
let aviso=document.getElementById('rmAvisoFonteSIPAM')
if(!aviso){
aviso=document.createElement('div')
aviso.id='rmAvisoFonteSIPAM'
aviso.style.cssText='margin:12px 0;padding:12px 14px;border-radius:10px;background:#eff6ff;border:1px solid #93c5fd;color:#1e3a8a;font-size:12px;font-weight:800;line-height:1.5'
aviso.innerHTML='🌊 <b>RIO MADEIRA • ACOMPANHAMENTO SIPAM</b><br>Base mantida na última medição disponível em <b>13/08/2026</b>. A próxima atualização será realizada somente com nova informação oficial do <b>SIPAM (Sistema de Proteção da Amazônia)</b>.'
const titulo=aba.querySelector('.painelTitulo')
if(titulo&&titulo.parentNode){
titulo.insertAdjacentElement('afterend',aviso)
}else{
aba.prepend(aviso)
}
}
const status=aba.querySelector('.rmStatusBase')
if(status){
status.innerHTML='Fonte de acompanhamento: <b>SIPAM (Sistema de Proteção da Amazônia)</b> • última medição disponível: <b>13/08/2026</b> • aguardando nova remessa oficial.'
}
}catch(error){
console.warn('207 Falha ao ajustar status Rio Madeira/SIPAM:',error)
}
}

function iniciarAcompanhamentoRioMadeiraSIPAM(){
setTimeout(ajustarStatusRioMadeiraSIPAM,1800)
const observer=new MutationObserver(()=>ajustarStatusRioMadeiraSIPAM())
observer.observe(document.body,{subtree:true,childList:true})
}

if(document.readyState==='loading'){
document.addEventListener('DOMContentLoaded',()=>{
iniciarAtualizacaoAutomaticaQueimadas()
iniciarAcompanhamentoRioMadeiraSIPAM()
})
}else{
iniciarAtualizacaoAutomaticaQueimadas()
iniciarAcompanhamentoRioMadeiraSIPAM()
}
