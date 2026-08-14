/*=========================================================
RIO MADEIRA • MONITORAMENTO HIDROLÓGICO
TCE-RO • ESTAÇÃO 15400000 • PORTO VELHO
=========================================================*/
let RM_DADOS=[]
let RM_CICLOS=[]
let RM_CHEIAS=[]
let RM_SECAS=[]
let RM_CURVA=[]
let RM_GRAFICO_HISTORICO=null
let RM_GRAFICO_EXTREMOS=null
function rmCliente(){
return window.client||window.supabaseClient||null
}
function rmNumero(v){
let n=Number(v)
return Number.isFinite(n)?n:null
}
function rmMetros(v,d=2){
let n=rmNumero(v)
return n===null?'—':`${n.toFixed(d).replace('.',',')} m`
}
function rmCentimetros(v,d=0){
let n=rmNumero(v)
return n===null?'—':`${n.toFixed(d).replace('.',',')} cm`
}
function rmDataBR(v){
if(!v)return'—'
let p=String(v).slice(0,10).split('-')
return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:v
}
function rmCicloMaisRecente(){
if(!RM_CICLOS.length)return''
return [...RM_CICLOS].sort((a,b)=>String(b.ciclo_hidrologico).localeCompare(String(a.ciclo_hidrologico)))[0]?.ciclo_hidrologico||''
}
function rmCorSituacao(nivel,media,p10,p90){
if(nivel===null)return{texto:'SEM DADOS',classe:'rmNeutro'}
if(p10!==null&&nivel<=p10)return{texto:'MUITO ABAIXO DO PADRÃO HISTÓRICO',classe:'rmSeca'}
if(p90!==null&&nivel>=p90)return{texto:'MUITO ACIMA DO PADRÃO HISTÓRICO',classe:'rmCheia'}
if(media!==null&&nivel<media)return{texto:'ABAIXO DA MÉDIA HISTÓRICA',classe:'rmAtencao'}
return{texto:'DENTRO/ACIMA DA MÉDIA HISTÓRICA',classe:'rmNormal'}
}
async function carregarRioMadeira(){
let client=rmCliente()
if(!client){
console.error('Rio Madeira: cliente Supabase não encontrado.')
return
}
try{
let[r1,r2,r3,r4]=await Promise.all([
client.from('rio_madeira_niveis').select('data,ciclo_hidrologico,ano_inicio_ciclo,mes,dia,dia_ciclo,nivel_cm,nivel_m').order('data',{ascending:true}),
client.from('vw_rio_madeira_ciclos').select('*').order('data_inicio',{ascending:true}),
client.from('vw_rio_madeira_ranking_cheias').select('*').order('nivel_cm',{ascending:false}),
client.from('vw_rio_madeira_ranking_secas').select('*').order('nivel_cm',{ascending:true})
])
if(r1.error)throw r1.error
if(r2.error)throw r2.error
if(r3.error)throw r3.error
if(r4.error)throw r4.error
RM_DADOS=r1.data||[]
RM_CICLOS=r2.data||[]
RM_CHEIAS=r3.data||[]
RM_SECAS=r4.data||[]
let curva=await client.from('vw_rio_madeira_curva_historica').select('*').order('dia_ciclo',{ascending:true})
if(curva.error)throw curva.error
RM_CURVA=curva.data||[]
preencherFiltrosRioMadeira()
renderKPIsRioMadeira()
renderRankingRioMadeira()
renderSituacaoRioMadeira()
renderExtremosRioMadeira()
renderGraficoRioMadeiraHistorico()
renderGraficoRioMadeiraExtremos()
renderTabelaRioMadeira()
}catch(e){
console.error('Erro ao carregar Rio Madeira:',e)
let box=document.getElementById('painelRioMadeiraSituacao')
if(box)box.innerHTML=`<div class="alerta-vermelho">Erro ao carregar dados do Rio Madeira: ${e?.message||e}</div>`
}
}
function preencherFiltrosRioMadeira(){
let ciclos=[...new Set(RM_CICLOS.map(x=>x.ciclo_hidrologico).filter(Boolean))].sort().reverse()
let atual=document.getElementById('rmCicloAtual')
let comp=document.getElementById('rmCicloComparacao')
let tab=document.getElementById('rmFiltroCicloTabela')
let selecionado=atual?.value||rmCicloMaisRecente()
if(atual){
atual.innerHTML=ciclos.map(c=>`<option value="${c}" ${c===selecionado?'selected':''}>CICLO ${c}</option>`).join('')
}
if(comp){
let valor=comp.value
comp.innerHTML='<option value="">COMPARAR COM...</option>'+ciclos.filter(c=>c!==selecionado).map(c=>`<option value="${c}">${c}</option>`).join('')
if(ciclos.includes(valor)&&valor!==selecionado)comp.value=valor
}
if(tab){
let valor=tab.value||selecionado
tab.innerHTML=ciclos.map(c=>`<option value="${c}" ${c===valor?'selected':''}>${c}</option>`).join('')
}
}
function renderKPIsRioMadeira(){
let dados=[...RM_DADOS].sort((a,b)=>String(a.data).localeCompare(String(b.data)))
let ultimo=dados[dados.length-1]
let anterior=dados[dados.length-2]
let nivel=rmNumero(ultimo?.nivel_m)
let variacao=nivel!==null&&anterior?nivel-rmNumero(anterior.nivel_m):null
let cheia=RM_CHEIAS[0]
let seca=RM_SECAS[0]
let el=document.getElementById('rmNivelAtual')
if(el)el.innerHTML=`${rmMetros(nivel)}<small class="rmKpiData">${rmDataBR(ultimo?.data)}</small>`
el=document.getElementById('rmVariacao24h')
if(el){
let sinal=variacao!==null&&variacao>0?'+':''
el.innerHTML=variacao===null?'—':`${sinal}${variacao.toFixed(2).replace('.',',')} m`
el.classList.toggle('rmSubindo',variacao!==null&&variacao>0)
el.classList.toggle('rmDescendo',variacao!==null&&variacao<0)
}
el=document.getElementById('rmCheiaHistorica')
if(el)el.innerHTML=`${rmMetros(cheia?.nivel_m)}<small class="rmKpiData">${rmDataBR(cheia?.data)}</small>`
el=document.getElementById('rmSecaHistorica')
if(el)el.innerHTML=`${rmMetros(seca?.nivel_m)}<small class="rmKpiData">${rmDataBR(seca?.data)}</small>`
el=document.getElementById('rmCiclosHistoricos')
if(el)el.textContent=RM_CICLOS.length
}
function renderRankingRioMadeira(){
let cheias=document.getElementById('painelRioMadeiraCheias')
let secas=document.getElementById('painelRioMadeiraSecas')
if(cheias){
let lista=RM_CHEIAS.slice(0,10)
cheias.innerHTML=`<div class="tabelaMunicipiosWrap"><table class="tabelaMunicipios"><thead><tr><th>#</th><th>CICLO</th><th>DATA</th><th>NÍVEL</th></tr></thead><tbody>${lista.map((x,i)=>`<tr><td><b>${i+1}</b></td><td>${x.ciclo_hidrologico}</td><td>${rmDataBR(x.data)}</td><td><b>${rmMetros(rmNumero(x.nivel_m))}</b></td></tr>`).join('')}</tbody></table></div>`
}
if(secas){
let lista=RM_SECAS.slice(0,10)
secas.innerHTML=`<div class="tabelaMunicipiosWrap"><table class="tabelaMunicipios"><thead><tr><th>#</th><th>CICLO</th><th>DATA</th><th>NÍVEL</th></tr></thead><tbody>${lista.map((x,i)=>`<tr><td><b>${i+1}</b></td><td>${x.ciclo_hidrologico}</td><td>${rmDataBR(x.data)}</td><td><b>${rmMetros(rmNumero(x.nivel_m),3)}</b></td></tr>`).join('')}</tbody></table></div>`
}
}
function renderSituacaoRioMadeira(){
let box=document.getElementById('painelRioMadeiraSituacao')
if(!box)return
let ciclo=document.getElementById('rmCicloAtual')?.value||rmCicloMaisRecente()
let dados=RM_DADOS.filter(x=>x.ciclo_hidrologico===ciclo).sort((a,b)=>String(a.data).localeCompare(String(b.data)))
let ultimo=dados[dados.length-1]
if(!ultimo){
box.innerHTML='<div class="rioMadeiraAguardando">Sem dados para o ciclo selecionado.</div>'
return
}
let hist=RM_CURVA.find(x=>Number(x.dia_ciclo)===Number(ultimo.dia_ciclo))
let nivel=rmNumero(ultimo.nivel_cm)
let media=rmNumero(hist?.media_cm)
let p10=rmNumero(hist?.p10_cm)
let p90=rmNumero(hist?.p90_cm)
let situacao=rmCorSituacao(nivel,media,p10,p90)
let diferenca=media===null?null:(nivel-media)/100
box.innerHTML=`<div class="rmSituacao ${situacao.classe}"><div class="rmSituacaoTitulo">${situacao.texto}</div><div class="rmSituacaoNivel">${rmMetros(rmNumero(ultimo.nivel_m))}</div><div class="rmSituacaoData">${rmDataBR(ultimo.data)} • ciclo ${ciclo}</div></div><div class="rmResumoGrid"><div><span>Média histórica do dia</span><b>${rmMetros(media===null?null:media/100)}</b></div><div><span>P10 histórico</span><b>${rmMetros(p10===null?null:p10/100)}</b></div><div><span>P90 histórico</span><b>${rmMetros(p90===null?null:p90/100)}</b></div><div><span>Diferença da média</span><b>${diferenca===null?'—':`${diferenca>0?'+':''}${diferenca.toFixed(2).replace('.',',')} m`}</b></div></div>`
}
function renderExtremosRioMadeira(){
let box=document.getElementById('painelRioMadeiraExtremos')
if(!box)return
let cheia=RM_CHEIAS[0]
let seca=RM_SECAS[0]
let maiorCiclo=RM_CICLOS.reduce((a,b)=>rmNumero(b.maximo_cm)>rmNumero(a?.maximo_cm)?b:a,null)
let menorCiclo=RM_CICLOS.reduce((a,b)=>rmNumero(b.minimo_cm)<rmNumero(a?.minimo_cm)?b:a,null)
box.innerHTML=`<div class="rmExtremosGrid"><div class="rmExtremoCard"><span>🌊 CHEIA RECORDE</span><strong>${rmMetros(rmNumero(cheia?.nivel_m))}</strong><small>${rmDataBR(cheia?.data)} • ${cheia?.ciclo_hidrologico||'—'}</small></div><div class="rmExtremoCard"><span>🏜️ SECA RECORDE</span><strong>${rmMetros(rmNumero(seca?.nivel_m),3)}</strong><small>${rmDataBR(seca?.data)} • ${seca?.ciclo_hidrologico||'—'}</small></div><div class="rmExtremoCard"><span>📚 SÉRIE HISTÓRICA</span><strong>${RM_CICLOS.length} ciclos</strong><small>${rmDataBR(RM_DADOS[0]?.data)} a ${rmDataBR(RM_DADOS[RM_DADOS.length-1]?.data)}</small></div><div class="rmExtremoCard"><span>📍 ESTAÇÃO</span><strong>15400000</strong><small>Porto Velho • Rio Madeira</small></div></div>`
}
function renderGraficoRioMadeiraHistorico(){
let canvas=document.getElementById('graficoRioMadeiraHistorico')
if(!canvas||typeof Chart==='undefined')return
let ciclo=document.getElementById('rmCicloAtual')?.value||rmCicloMaisRecente()
let comparacao=document.getElementById('rmCicloComparacao')?.value||''
let atual=RM_DADOS.filter(x=>x.ciclo_hidrologico===ciclo)
let comp=comparacao?RM_DADOS.filter(x=>x.ciclo_hidrologico===comparacao):[]
let mapaAtual=new Map(atual.map(x=>[Number(x.dia_ciclo),rmNumero(x.nivel_m)]))
let mapaComp=new Map(comp.map(x=>[Number(x.dia_ciclo),rmNumero(x.nivel_m)]))
let labels=RM_CURVA.map(x=>Number(x.dia_ciclo))
let datasets=[
{label:`Ciclo ${ciclo}`,data:labels.map(d=>mapaAtual.get(d)??null),borderWidth:3,pointRadius:0,tension:.18},
{label:'Mediana histórica',data:RM_CURVA.map(x=>rmNumero(x.mediana_cm)/100),borderWidth:2,pointRadius:0,tension:.18},
{label:'P10 histórico',data:RM_CURVA.map(x=>rmNumero(x.p10_cm)/100),borderWidth:1,pointRadius:0,borderDash:[5,5]},
{label:'P90 histórico',data:RM_CURVA.map(x=>rmNumero(x.p90_cm)/100),borderWidth:1,pointRadius:0,borderDash:[5,5]}
]
if(comparacao)datasets.splice(1,0,{label:`Ciclo ${comparacao}`,data:labels.map(d=>mapaComp.get(d)??null),borderWidth:2,pointRadius:0,tension:.18})
if(RM_GRAFICO_HISTORICO)RM_GRAFICO_HISTORICO.destroy()
RM_GRAFICO_HISTORICO=new Chart(canvas,{type:'line',data:{labels,datasets},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{datalabels:{display:false},legend:{position:'top'},tooltip:{callbacks:{title:it=>`Dia do ciclo: ${it[0]?.label||''}`,label:ctx=>`${ctx.dataset.label}: ${ctx.parsed.y===null?'—':ctx.parsed.y.toFixed(2).replace('.',',')+' m'}`}}},scales:{x:{title:{display:true,text:'Dia do ciclo hidrológico'}},y:{title:{display:true,text:'Nível (m)'},beginAtZero:true}}}})
}
function renderGraficoRioMadeiraComparacao(){
renderGraficoRioMadeiraHistorico()
}
function renderGraficoRioMadeiraExtremos(){
let canvas=document.getElementById('graficoRioMadeiraExtremos')
if(!canvas||typeof Chart==='undefined')return
let lista=[...RM_CICLOS].sort((a,b)=>String(a.ciclo_hidrologico).localeCompare(String(b.ciclo_hidrologico)))
if(RM_GRAFICO_EXTREMOS)RM_GRAFICO_EXTREMOS.destroy()
RM_GRAFICO_EXTREMOS=new Chart(canvas,{type:'line',data:{labels:lista.map(x=>x.ciclo_hidrologico),datasets:[{label:'Máxima do ciclo',data:lista.map(x=>rmNumero(x.maximo_cm)/100),borderWidth:2,pointRadius:2,tension:.15},{label:'Mínima do ciclo',data:lista.map(x=>rmNumero(x.minimo_cm)/100),borderWidth:2,pointRadius:2,tension:.15}]},options:{responsive:true,maintainAspectRatio:false,plugins:{datalabels:{display:false},legend:{position:'top'}},scales:{x:{ticks:{maxRotation:70,minRotation:70}},y:{title:{display:true,text:'Nível (m)'},beginAtZero:true}}}})
}
function renderTabelaRioMadeira(){
let box=document.getElementById('painelTabelaRioMadeira')
if(!box)return
let ciclo=document.getElementById('rmFiltroCicloTabela')?.value||document.getElementById('rmCicloAtual')?.value||rmCicloMaisRecente()
let busca=(document.getElementById('rmBuscaTabela')?.value||'').trim()
let lista=RM_DADOS.filter(x=>x.ciclo_hidrologico===ciclo)
if(busca)lista=lista.filter(x=>rmDataBR(x.data).includes(busca)||String(x.data).includes(busca))
lista=[...lista].sort((a,b)=>String(b.data).localeCompare(String(a.data)))
box.innerHTML=`<div class="tabelaMunicipiosWrap"><table class="tabelaMunicipios"><thead><tr><th>DATA</th><th>CICLO</th><th>DIA DO CICLO</th><th>NÍVEL CM</th><th>NÍVEL M</th></tr></thead><tbody>${lista.map(x=>`<tr><td>${rmDataBR(x.data)}</td><td>${x.ciclo_hidrologico}</td><td>${x.dia_ciclo??'—'}</td><td>${rmCentimetros(x.nivel_cm)}</td><td><b>${rmMetros(rmNumero(x.nivel_m),3)}</b></td></tr>`).join('')}</tbody></table></div>`
}
