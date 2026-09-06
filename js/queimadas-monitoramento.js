/*=========================================================
205 QUEIMADAS BOTOES PDF WORD
=========================================================*/
function montarBotoesPDFQueimadas(tipo){
const botoes={
dashboard:['gerarPDFDashboardQueimadas','gerarWordDashboardQueimadas','PDF DASHBOARD','WORD DASHBOARD'],
resumo:['gerarPDFResumoQueimadas','gerarWordResumoQueimadas','PDF RESUMO','WORD RESUMO'],
monitoramento:['gerarPDFMonitoramentoQueimadas','gerarWordMonitoramentoQueimadas','PDF MONITORAMENTO','WORD MONITORAMENTO']
}
if(!botoes[tipo])return''
return`<button onclick="${botoes[tipo][0]}()" class="btn-pdf">${botoes[tipo][2]}</button><button onclick="${botoes[tipo][1]}()" class="btn-pdf btn-word">${botoes[tipo][3]}</button>`
}

/*=========================================================
206 ATUALIZACAO AUTOMATICA DO PAINEL QUEIMADAS
Base dinamica: PROTEGE/SEDAM + INPE
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
let texto=node.nodeValue||'',novo=texto
for(const[de,para]of trocas)if(novo.includes(de))novo=novo.split(de).join(para)
if(novo!==texto)node.nodeValue=novo
}
document.querySelectorAll('.resumoLinha').forEach(linha=>{
const esquerda=linha.querySelector('.resumoEsquerda span')?.textContent?.trim(),valor=linha.querySelector('.resumoValor')
if(esquerda==='Fonte Oficial'&&valor&&valor.textContent.trim()==='INPE')valor.textContent='PROTEGE/SEDAM + INPE'
})
}catch(error){console.warn('206 Falha ao normalizar fontes do painel:',error)}
}
async function atualizarPainelQueimadasAutomaticamente(){
try{
if(typeof renderTempoReal==='function')await renderTempoReal()
if(typeof carregarKPIsExecutivos==='function')await carregarKPIsExecutivos()
if(typeof renderPainelFocosINPE==='function')await renderPainelFocosINPE()
}catch(error){console.warn('206 Falha na atualização automática do painel:',error)}finally{setTimeout(normalizarRotulosFontesQueimadas,800)}
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
=========================================================*/
function ajustarStatusRioMadeiraSIPAM(){
try{
const aba=document.getElementById('abaRioMadeira');if(!aba)return
let aviso=document.getElementById('rmAvisoFonteSIPAM')
if(!aviso){
aviso=document.createElement('div');aviso.id='rmAvisoFonteSIPAM'
aviso.style.cssText='margin:12px 0;padding:12px 14px;border-radius:10px;background:#eff6ff;border:1px solid #93c5fd;color:#1e3a8a;font-size:12px;font-weight:800;line-height:1.5'
aviso.innerHTML='🌊 <b>RIO MADEIRA • ACOMPANHAMENTO SIPAM</b><br>Base mantida na última medição disponível em <b>13/08/2026</b>. A próxima atualização será realizada somente com nova informação oficial do <b>SIPAM (Sistema de Proteção da Amazônia)</b>.'
const titulo=aba.querySelector('.painelTitulo');if(titulo&&titulo.parentNode)titulo.insertAdjacentElement('afterend',aviso);else aba.prepend(aviso)
}
const status=aba.querySelector('.rmStatusBase');if(status)status.innerHTML='Fonte de acompanhamento: <b>SIPAM (Sistema de Proteção da Amazônia)</b> • última medição disponível: <b>13/08/2026</b> • aguardando nova remessa oficial.'
}catch(error){console.warn('207 Falha ao ajustar status Rio Madeira/SIPAM:',error)}
}
function iniciarAcompanhamentoRioMadeiraSIPAM(){
setTimeout(ajustarStatusRioMadeiraSIPAM,1800)
const observer=new MutationObserver(()=>ajustarStatusRioMadeiraSIPAM());observer.observe(document.body,{subtree:true,childList:true})
}

/*=========================================================
208 RIO MADEIRA • EIXO X EM DIA/MÊS
O ciclo hidrológico inicia em 01/10. O eixo deixa de exibir
"dia do ciclo" (1...366) e passa a exibir DD/MM.
=========================================================*/
function rmRotuloDiaMes(dia,ciclo){
const ano=Number(String(ciclo||'').split('-')[0]);const d=Number(dia)
if(!Number.isFinite(ano)||!Number.isFinite(d))return String(dia??'')
const data=new Date(Date.UTC(ano,9,1));data.setUTCDate(data.getUTCDate()+d-1)
return`${String(data.getUTCDate()).padStart(2,'0')}/${String(data.getUTCMonth()+1).padStart(2,'0')}`
}
function instalarEixoDataRioMadeira(){
if(typeof Chart==='undefined'||typeof RM_CURVA==='undefined')return
window.renderGraficoRioMadeiraHistorico=function(){
const canvas=document.getElementById('graficoRioMadeiraHistorico');if(!canvas||typeof Chart==='undefined')return
const ciclo=document.getElementById('rmCicloAtual')?.value||rmCicloMaisRecente()
const comparacao=document.getElementById('rmCicloComparacao')?.value||''
const dias=RM_CURVA.map(x=>Number(x.dia_ciclo))
const labels=dias.map(d=>rmRotuloDiaMes(d,ciclo))
const mapa=new Map(RM_DADOS.filter(x=>x.ciclo_hidrologico===ciclo).map(x=>[Number(x.dia_ciclo),rmNumero(x.nivel_m)]))
const mapa2=new Map(RM_DADOS.filter(x=>x.ciclo_hidrologico===comparacao).map(x=>[Number(x.dia_ciclo),rmNumero(x.nivel_m)]))
const ds=[
{label:`Ciclo ${ciclo}`,data:dias.map(d=>mapa.get(d)??null),borderWidth:3,pointRadius:0,tension:.18},
{label:'Mediana histórica',data:RM_CURVA.map(x=>rmCmParaMetros(x.mediana_cm)),borderWidth:2,pointRadius:0},
{label:'P10 histórico',data:RM_CURVA.map(x=>rmCmParaMetros(x.p10_cm)),borderWidth:1,pointRadius:0,borderDash:[5,5]},
{label:'P90 histórico',data:RM_CURVA.map(x=>rmCmParaMetros(x.p90_cm)),borderWidth:1,pointRadius:0,borderDash:[5,5]}
]
if(comparacao)ds.splice(1,0,{label:`Ciclo ${comparacao}`,data:dias.map(d=>mapa2.get(d)??null),borderWidth:2,pointRadius:0})
if(RM_GRAFICO_HISTORICO)RM_GRAFICO_HISTORICO.destroy()
RM_GRAFICO_HISTORICO=new Chart(canvas,{type:'line',data:{labels,datasets:ds},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{datalabels:{display:false},tooltip:{callbacks:{title:(itens)=>itens?.[0]?.label||''}}},scales:{x:{title:{display:true,text:'Data (dia/mês)'},ticks:{autoSkip:true,maxTicksLimit:24,maxRotation:0,minRotation:0}},y:{title:{display:true,text:'Nível (m)'}}}}})
}
window.renderGraficoRioMadeiraComparacao=function(){window.renderGraficoRioMadeiraHistorico()}
if(typeof RM_CARREGADO!=='undefined'&&RM_CARREGADO)window.renderGraficoRioMadeiraHistorico()
}
function iniciarAjustesRioMadeira(){setTimeout(instalarEixoDataRioMadeira,3500)}

if(document.readyState==='loading'){
document.addEventListener('DOMContentLoaded',()=>{iniciarAtualizacaoAutomaticaQueimadas();iniciarAcompanhamentoRioMadeiraSIPAM();iniciarAjustesRioMadeira()})
}else{
iniciarAtualizacaoAutomaticaQueimadas();iniciarAcompanhamentoRioMadeiraSIPAM();iniciarAjustesRioMadeira()
}
