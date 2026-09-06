/*=========================================================
205 QUEIMADAS • BOTOES PDF WORD
=========================================================*/
function montarBotoesPDFQueimadas(tipo){
const botoes={dashboard:['gerarPDFDashboardQueimadas','gerarWordDashboardQueimadas','PDF DASHBOARD','WORD DASHBOARD'],resumo:['gerarPDFResumoQueimadas','gerarWordResumoQueimadas','PDF RESUMO','WORD RESUMO'],monitoramento:['gerarPDFMonitoramentoQueimadas','gerarWordMonitoramentoQueimadas','PDF MONITORAMENTO','WORD MONITORAMENTO']}
if(!botoes[tipo])return''
return`<button onclick="${botoes[tipo][0]}()" class="btn-pdf">${botoes[tipo][2]}</button><button onclick="${botoes[tipo][1]}()" class="btn-pdf btn-word">${botoes[tipo][3]}</button>`
}

/*=========================================================
206 NORMALIZACAO DE FONTES • SEM MUTATIONOBSERVER
Evita loop de DOM que travava o navegador.
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
['Fonte: INPE • Ranking Estadual','Fonte: PROTEGE/SEDAM • INPE • Ranking Estadual'],
['Fonte: ANA • SGB/CPRM • Série histórica da Estação 15400000 • Porto Velho','Dados da série histórica de nível: ANA/CPRM-REPO • Análise e gráficos: CENSIPAM/NUHIDRO CR-PV • Estação 15400000 • Porto Velho'],
['Integração: ANA • SGB/CPRM • GPM/NASA • INPE • TCE-RO','Integração: CENSIPAM/NUHIDRO CR-PV • Série histórica de nível: ANA/CPRM-REPO • Precipitação: GPM/NASA • Queimadas: PROTEGE/SEDAM + INPE • TCE-RO']]
const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT)
let node
while(node=walker.nextNode()){
let texto=node.nodeValue||'',novo=texto
for(const[de,para]of trocas)if(novo.includes(de))novo=novo.split(de).join(para)
if(novo!==texto)node.nodeValue=novo
}
}catch(error){console.warn('206 Fontes:',error)}
}

/*=========================================================
207 RIO MADEIRA • FONTES E STATUS
Fonte conforme planilha/boletim CENSIPAM recebido em 06/09/2026.
=========================================================*/
function ajustarStatusRioMadeiraFontes(){
try{
const aba=document.getElementById('abaRioMadeira');if(!aba)return
let aviso=document.getElementById('rmAvisoFonteSIPAM')
const html='🌊 <b>RIO MADEIRA • BASE ATUALIZADA</b><br>Último nível disponível: <b>04/09/2026 • 4,02 m</b>. Série histórica de nível: <b>ANA/CPRM-REPO</b>. Precipitação: <b>GPM/NASA</b>. Análise e gráficos: <b>CENSIPAM/NUHIDRO CR-PV</b>.'
if(!aviso){aviso=document.createElement('div');aviso.id='rmAvisoFonteSIPAM';aviso.style.cssText='margin:12px 0;padding:12px 14px;border-radius:10px;background:#eff6ff;border:1px solid #93c5fd;color:#1e3a8a;font-size:12px;font-weight:800;line-height:1.5';const titulo=aba.querySelector('.painelTitulo');if(titulo)titulo.insertAdjacentElement('afterend',aviso);else aba.prepend(aviso)}
if(aviso.innerHTML!==html)aviso.innerHTML=html
aba.querySelectorAll('.rioMadeiraFonte').forEach(el=>{if((el.textContent||'').includes('Série histórica')||(el.textContent||'').includes('Integração:')){const novo=(el.textContent||'').includes('Integração:')?'Integração: CENSIPAM/NUHIDRO CR-PV • Série histórica de nível: ANA/CPRM-REPO • Precipitação: GPM/NASA • Queimadas: PROTEGE/SEDAM + INPE • TCE-RO':'Série histórica de nível: ANA/CPRM-REPO • Análise e gráficos: CENSIPAM/NUHIDRO CR-PV • Estação 15400000 • Porto Velho';if(el.textContent!==novo)el.textContent=novo}})
}catch(error){console.warn('207 Rio Madeira fontes:',error)}
}

/*=========================================================
208 RIO MADEIRA • EIXO X DD/MM
=========================================================*/
function rmRotuloDiaMes(dia,ciclo){
const ano=Number(String(ciclo||'').split('-')[0]),d=Number(dia)
if(!Number.isFinite(ano)||!Number.isFinite(d))return String(dia??'')
const data=new Date(Date.UTC(ano,9,1));data.setUTCDate(data.getUTCDate()+d-1)
return`${String(data.getUTCDate()).padStart(2,'0')}/${String(data.getUTCMonth()+1).padStart(2,'0')}`
}
function instalarEixoDataRioMadeira(){
if(typeof Chart==='undefined'||typeof RM_CURVA==='undefined')return
window.renderGraficoRioMadeiraHistorico=function(){
const canvas=document.getElementById('graficoRioMadeiraHistorico');if(!canvas)return
const ciclo=document.getElementById('rmCicloAtual')?.value||rmCicloMaisRecente(),comparacao=document.getElementById('rmCicloComparacao')?.value||''
const dias=RM_CURVA.map(x=>Number(x.dia_ciclo)),labels=dias.map(d=>rmRotuloDiaMes(d,ciclo))
const mapa=new Map(RM_DADOS.filter(x=>x.ciclo_hidrologico===ciclo).map(x=>[Number(x.dia_ciclo),rmNumero(x.nivel_m)])),mapa2=new Map(RM_DADOS.filter(x=>x.ciclo_hidrologico===comparacao).map(x=>[Number(x.dia_ciclo),rmNumero(x.nivel_m)]))
const ds=[{label:`Ciclo ${ciclo}`,data:dias.map(d=>mapa.get(d)??null),borderWidth:3,pointRadius:0,tension:.18},{label:'Mediana histórica',data:RM_CURVA.map(x=>rmCmParaMetros(x.mediana_cm)),borderWidth:2,pointRadius:0},{label:'P10 histórico',data:RM_CURVA.map(x=>rmCmParaMetros(x.p10_cm)),borderWidth:1,pointRadius:0,borderDash:[5,5]},{label:'P90 histórico',data:RM_CURVA.map(x=>rmCmParaMetros(x.p90_cm)),borderWidth:1,pointRadius:0,borderDash:[5,5]}]
if(comparacao)ds.splice(1,0,{label:`Ciclo ${comparacao}`,data:dias.map(d=>mapa2.get(d)??null),borderWidth:2,pointRadius:0})
if(RM_GRAFICO_HISTORICO)RM_GRAFICO_HISTORICO.destroy()
RM_GRAFICO_HISTORICO=new Chart(canvas,{type:'line',data:{labels,datasets:ds},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{datalabels:{display:false}},scales:{x:{title:{display:true,text:'Data (dia/mês)'},ticks:{autoSkip:true,maxTicksLimit:24,maxRotation:0,minRotation:0}},y:{title:{display:true,text:'Nível (m)'}}}}})
}
window.renderGraficoRioMadeiraComparacao=()=>window.renderGraficoRioMadeiraHistorico()
}

/*=========================================================
209 INTEGRACAO HIDROCLIMATICA • SOB DEMANDA
Não executa consultas pesadas enquanto a tela de login está aberta.
=========================================================*/
function fmtBR(v,d=2){let n=Number(v);return Number.isFinite(n)?n.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d}):'—'}
function dataCurta(v){if(!v)return'—';let p=String(v).slice(0,10).split('-');return p.length===3?`${p[2]}/${p[1]}`:'—'}
async function atualizarIntegracaoHidroclimatica(){
const box=document.getElementById('painelRioMadeiraIntegracao');if(!box||!window.clientPublic)return
try{
const [{data:niveis,error:e1},{data:chuvas,error:e2}]=await Promise.all([window.clientPublic.from('rio_madeira_niveis').select('data,nivel_m,nivel_cm').order('data',{ascending:false}).limit(2),window.clientPublic.from('rio_madeira_precipitacao').select('data,total_bacia,beni,mamore,guapore,abuna,outros').order('data',{ascending:false}).limit(1)])
if(e1)throw e1;if(e2)throw e2
const atual=niveis?.[0],anterior=niveis?.[1],chuva=chuvas?.[0];let variacao=atual&&anterior?Number(atual.nivel_m)-Number(anterior.nivel_m):null
let focos='—';try{if(window.clientQueimadas){const{count,error}=await window.clientQueimadas.from('queimadas_focos_inpe').select('*',{count:'exact',head:true}).gte('data','2026-01-01');if(!error&&Number.isFinite(count))focos=Number(count).toLocaleString('pt-BR')}}catch(_){ }
const tendencia=variacao===null?'SEM COMPARAÇÃO':variacao<0?`QUEDA ${fmtBR(Math.abs(variacao),2)} m/24h`:variacao>0?`ALTA ${fmtBR(variacao,2)} m/24h`:'ESTÁVEL 24h'
box.innerHTML=`<div class="rioMadeiraIntegracaoFluxo"><div><strong>PRECIPITAÇÃO</strong><span>🌧️</span><b>${fmtBR(chuva?.total_bacia,2)} mm</b><small>${dataCurta(chuva?.data)} • média da bacia</small></div><div class="rmSetaFluxo">→</div><div><strong>RIO MADEIRA</strong><span>🌊</span><b>${fmtBR(atual?.nivel_m,2)} m</b><small>${dataCurta(atual?.data)} • Estação 15400000</small></div><div class="rmSetaFluxo">→</div><div><strong>ESTIAGEM</strong><span>☀️</span><b>${tendencia}</b><small>variação do nível</small></div><div class="rmSetaFluxo">→</div><div><strong>QUEIMADAS</strong><span>🔥</span><b>${focos} focos</b><small>Rondônia • 2026</small></div><div class="rmSetaFluxo">→</div><div><strong>RISCO</strong><span>🚨</span><b>MONITORAMENTO INTEGRADO</b><small>ver IRIQ e situação estadual</small></div></div><div class="rioMadeiraFonte">Integração: CENSIPAM/NUHIDRO CR-PV • Série histórica de nível: ANA/CPRM-REPO • Precipitação: GPM/NASA • Queimadas: PROTEGE/SEDAM + INPE • TCE-RO</div>`
}catch(error){console.warn('209 Integração hidroclimática:',error)}
}

/*=========================================================
210 INICIALIZACAO LEVE E SEGURA
=========================================================*/
function atualizarComplementosAbaAtual(){
normalizarRotulosFontesQueimadas()
const aba=document.getElementById('abaRioMadeira')
if(aba&&!aba.classList.contains('hidden')){ajustarStatusRioMadeiraFontes();atualizarIntegracaoHidroclimatica()}
}
function iniciarMonitoramentoComplementar(){
normalizarRotulosFontesQueimadas()
setTimeout(instalarEixoDataRioMadeira,1200)
setInterval(atualizarComplementosAbaAtual,300000)
document.addEventListener('click',e=>{if(e.target?.id==='btnAbaRioMadeira')setTimeout(()=>{ajustarStatusRioMadeiraFontes();instalarEixoDataRioMadeira();atualizarIntegracaoHidroclimatica()},600)})
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciarMonitoramentoComplementar,{once:true});else iniciarMonitoramentoComplementar()
