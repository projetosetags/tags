/*=========================================================
001 HISTÓRICO AUTOMÁTICO — FONTE DIRETA DOS TAGs
Não depende mais de evolucao_mensal/monitoramento_historico.
=========================================================*/
window.graficoHistoricoObj=null
const HIST_MESES=[['jan','JAN'],['fev','FEV'],['mar','MAR'],['abr','ABR'],['mai','MAI'],['jun','JUN'],['jul','JUL'],['ago','AGO'],['set','SET'],['out','OUT'],['nov','NOV'],['dez','DEZ']]

async function obterHistoricoFonte(monitoramentoId){
const{data:mon,error:eMon}=await client.from('monitoramentos').select('id,origem,titulo').eq('id',Number(monitoramentoId)).single()
if(eMon)throw eMon
const{data,error}=await client.from('vw_monitoramento_integrado').select('origem,codigo_item,codigo_subitem,jan,fev,mar,abr,mai,jun,jul,ago,set,out,nov,dez').eq('origem',String(mon.origem||'').toUpperCase())
if(error)throw error
return{monitoramento:mon,itens:data||[]}
}

function calcularMediaHistorica(itens,campo){
const vals=(itens||[]).map(i=>i[campo]).filter(v=>v!==null&&v!==undefined&&v!=='').map(Number).filter(Number.isFinite)
return vals.length?Number((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1)):null
}

async function carregarHistorico(monitoramentoId=null){
const ctx=document.getElementById('graficoHistorico');if(!ctx)return
if(!monitoramentoId)monitoramentoId=document.getElementById('historicoMonitoramentoSelect')?.value||window.MONITORAMENTO_ATUAL||null
if(!monitoramentoId)return
try{
const pacote=await obterHistoricoFonte(monitoramentoId)
const valores=HIST_MESES.map(([campo])=>calcularMediaHistorica(pacote.itens,campo))
if(window.graficoHistoricoObj?.destroy)window.graficoHistoricoObj.destroy()
window.graficoHistoricoObj=new Chart(ctx,{type:'line',data:{labels:HIST_MESES.map(x=>x[1]),datasets:[{label:`Evolução média declarada — ${pacote.monitoramento.origem}`,data:valores,fill:true,tension:.35,spanGaps:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#fff'}},datalabels:{color:'#fff',anchor:'end',align:'top',formatter:v=>v===null?'':v+'%'}},scales:{x:{ticks:{color:'#fff'},grid:{color:'rgba(255,255,255,.05)'}},y:{ticks:{color:'#fff',callback:v=>v+'%'},grid:{color:'rgba(255,255,255,.05)'},beginAtZero:true,max:100}}},plugins:[ChartDataLabels]})
const lista=document.getElementById('listaHistorico');if(lista){
lista.innerHTML=`<div class="mt-fonte-aviso"><strong>Histórico automático.</strong> Os valores abaixo são calculados diretamente dos lançamentos mensais do TAG ${pacote.monitoramento.origem}; não é necessário copiar ou sincronizar histórico manualmente.</div><div class="mt-resumo-grid">${HIST_MESES.map(([campo,label],idx)=>`<div class="mt-resumo-card"><span>${label}</span><strong>${valores[idx]===null?'-':valores[idx].toFixed(1)+'%'}</strong></div>`).join('')}</div>`
}
}catch(e){console.error('Histórico:',e)}
}

async function popularSelectHistorico(){
const select=document.getElementById('historicoMonitoramentoSelect');if(!select)return
const{data,error}=await client.from('monitoramentos').select('id,titulo,origem').order('id',{ascending:true});if(error){console.error(error);return}
select.innerHTML=(data||[]).map((m,index)=>`<option value="${m.id}" ${Number(window.MONITORAMENTO_ATUAL)===Number(m.id)||(!window.MONITORAMENTO_ATUAL&&index===0)?'selected':''}>${m.titulo||'Monitoramento'} — ${m.origem||''}</option>`).join('')
if(select.value)await carregarHistorico(select.value)
}

async function carregarHistoricoMonitoramento(){const id=document.getElementById('historicoMonitoramentoSelect')?.value;if(id)await carregarHistorico(id)}
async function sincronizarHistoricoTAG(){await carregarHistoricoMonitoramento();alert('Histórico atualizado diretamente a partir do TAG de origem.')}

window.carregarHistorico=carregarHistorico
window.carregarHistoricoMonitoramento=carregarHistoricoMonitoramento
window.popularSelectHistorico=popularSelectHistorico
window.sincronizarHistoricoTAG=sincronizarHistoricoTAG

document.addEventListener('DOMContentLoaded',()=>setTimeout(popularSelectHistorico,900))
