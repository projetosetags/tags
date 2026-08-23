const API='https://zvtzbiqfwhggysiuiuxh.supabase.co/functions/v1/rondonia-focos-calor'
let mapas={}
let charts={}
let rankingMunicipios=[]
let intervaloAtualizacao=null
let intervaloContador=null
let segundosParaAtualizar=300
/*=========================================================
001 FUNCTION FORMATARCONTADOR
=========================================================*/
function formatarContador(segundos){
let min=Math.floor(segundos/60)
let seg=segundos%60
return `${String(min).padStart(2,'0')}:${String(seg).padStart(2,'0')}`
}
/*=========================================================
FUNCTION ATUALIZARCONTADOR
=========================================================*/
function atualizarContador(){
let texto=`PRÓXIMA ATUALIZAÇÃO: ${formatarContador(segundosParaAtualizar)}`
let box=document.getElementById('proximaAtualizacao')
if(box)box.textContent=texto
let executivo=document.getElementById('rfcExecutivoProximaAtualizacao')
if(executivo)executivo.textContent=texto
segundosParaAtualizar--
if(segundosParaAtualizar<0)segundosParaAtualizar=300
}
/*=========================================================
003 FUNCTION INICIARCONTADORATUALIZACAO
=========================================================*/
function iniciarContadorAtualizacao(){
if(intervaloContador)clearInterval(intervaloContador)
segundosParaAtualizar=300
atualizarContador()
intervaloContador=setInterval(atualizarContador,1000)
}
/*=========================================================
004 FUNCTION ATUALIZARPAINELAUTOMATICAMENTE
=========================================================*/
async function atualizarPainelAutomaticamente(){
try{
segundosParaAtualizar=300
await Promise.allSettled([carregarStatus(),carregarRanking(),carregarEvolucao(),carregarMapaRO(7),carregarSatelites(),carregarEventos()])
}catch(erro){
console.error('Erro atualização automática:',erro)
}
}
/*=========================================================
005 FUNCTION INICIARATUALIZACAOAUTOMATICA
=========================================================*/
function iniciarAtualizacaoAutomatica(){
if(intervaloAtualizacao)clearInterval(intervaloAtualizacao)
iniciarContadorAtualizacao()
intervaloAtualizacao=setInterval(atualizarPainelAutomaticamente,300000)
}
/*=========================================================
006 FUNCTION FMT
=========================================================*/
function fmt(v){
return Number(v||0).toLocaleString('pt-BR')
}
/*=========================================================
007 FUNCTION DATABR
=========================================================*/
function dataBR(v){
if(!v)return'—'
try{
return new Date(v).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})
}catch(e){
return v
}
}
/*=========================================================
008 FUNCTION NUMEROBR
=========================================================*/
function numeroBR(v,casas=1){
if(v===null||v===undefined||v==='')return'—'
let n=Number(v)
if(!Number.isFinite(n))return'—'
return n.toLocaleString('pt-BR',{minimumFractionDigits:casas,maximumFractionDigits:casas})
}
/*=========================================================
009 FUNCTION API
=========================================================*/
async function api(action,params={}){
let query=new URLSearchParams({action,...params})
let resposta=await fetch(`${API}?${query}`)
let json=await resposta.json()
if(!resposta.ok||json.ok===false)throw new Error(json.error||'Erro ao consultar a API')
return json
}
/*=========================================================
010 FUNCTION CRIARKPI
=========================================================*/
function criarKPI(rotulo,valor,nota=''){
return `<div class="kpi"><div class="rotulo">${rotulo}</div><div class="valor">${valor}</div><div class="nota">${nota}</div></div>`
}
/*=========================================================
011 FUNCTION TROCARABA
=========================================================*/
function trocarAba(nome){
document.querySelectorAll('.aba').forEach(x=>x.classList.remove('ativa'))
document.querySelectorAll('.abaBtn').forEach(x=>x.classList.remove('ativa'))
let aba=document.getElementById(`aba-${nome}`)
if(aba)aba.classList.add('ativa')
let botao=document.querySelector(`[data-aba="${nome}"]`)
if(botao)botao.classList.add('ativa')
setTimeout(()=>Object.values(mapas).forEach(mapa=>mapa.invalidateSize()),120)
}
/*=========================================================
012 FUNCTION CONFIGURARBOTOESABAS
=========================================================*/
function configurarBotoesAbas(){
document.querySelectorAll('.abaBtn').forEach(botao=>{
botao.onclick=()=>trocarAba(botao.dataset.aba)
})
}
/*=========================================================
013 FUNCTION INICIARMAPA
=========================================================*/
function iniciarMapa(id,centro,zoom){
if(mapas[id])return mapas[id]
let mapa=L.map(id,{zoomControl:true,preferCanvas:true}).setView(centro,zoom)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(mapa)
if(id==='mapaExecutivo'||id==='mapaRO')mapa.fitBounds([[-13.75,-66.95],[-7.85,-59.65]],{padding:[12,12]})
mapas[id]=mapa
return mapa
}
/*=========================================================
014 FUNCTION LIMPARCAMADAS
=========================================================*/
function limparCamadas(mapa){
mapa.eachLayer(camada=>{
if(!(camada instanceof L.TileLayer))mapa.removeLayer(camada)
})
}
/*=========================================================
015 FUNCTION TAMANHOFOCO
=========================================================*/
function tamanhoFoco(frp){
let n=Number(frp||0)
if(!Number.isFinite(n))return 4
return Math.max(3,Math.min(11,3+Math.sqrt(n)/4))
}
/*=========================================================
016 FUNCTION CORFOCO
=========================================================*/
function corFoco(frp){
let n=Number(frp||0)
if(n>=300)return'#7f1d1d'
if(n>=150)return'#dc2626'
if(n>=50)return'#f97316'
if(n>=10)return'#f59e0b'
return'#facc15'
}
/*=========================================================
017 FUNCTION CARREGARSTATUS
=========================================================*/
async function carregarStatus(){
try{
let resultado=await api('status')
let r=resultado.resumo||{}
let total=Number(r.focos_total||0)
let kpis=document.getElementById('kpis')
if(kpis){
kpis.innerHTML=[criarKPI('Focos no banco',fmt(r.focos_total),'Rondônia'),criarKPI('Focos hoje',fmt(r.focos_hoje),'Dia calendário'),criarKPI('Últimas 24h',fmt(r.focos_24h),'Janela móvel'),criarKPI('Municípios atingidos',fmt(r.municipios_atingidos),'Com detecção'),criarKPI('Última detecção',r.ultima_deteccao?new Date(r.ultima_deteccao).toLocaleDateString('pt-BR'):'—',r.ultima_deteccao?new Date(r.ultima_deteccao).toLocaleTimeString('pt-BR'):'Sem carga')].join('')
}
let tempo=document.getElementById('tempoRealCards')
if(tempo){
tempo.innerHTML=[criarKPI('Hoje',fmt(r.focos_hoje)),criarKPI('24 horas',fmt(r.focos_24h)),criarKPI('Municípios',fmt(r.municipios_atingidos)),criarKPI('Última detecção',dataBR(r.ultima_deteccao))].join('')
}
let status=document.getElementById('statusFonte')
if(status){
status.textContent=total>0?'DADOS DISPONÍVEIS':'AGUARDANDO PROTEGE'
status.className=total>0?'status statusOk':'status statusAguardando'
}
let ultima=document.getElementById('ultimaAtualizacao')
if(ultima)ultima.textContent=r.ultima_atualizacao?`ATUALIZADO: ${dataBR(r.ultima_atualizacao)}`:'Banco preparado • sem ingestão'
renderFonte(resultado)
}catch(erro){
console.error('Erro status:',erro)
let status=document.getElementById('statusFonte')
if(status){
status.textContent='ERRO DE CONEXÃO'
status.className='status statusErro'
}
}
}
/*=========================================================
018 PLUGIN PLUGINVALORESEVOLUCAO
=========================================================*/
const pluginValoresEvolucao={
id:'pluginValoresEvolucao',
afterDatasetsDraw(chart){
let ctx=chart.ctx
let meta=chart.getDatasetMeta(0)
let dados=chart.data.datasets[0].data
ctx.save()
ctx.font='bold 11px Inter,Arial,sans-serif'
ctx.fillStyle='#111827'
ctx.textAlign='center'
ctx.textBaseline='bottom'
meta.data.forEach((ponto,i)=>{
let valor=Number(dados[i]||0)
ctx.fillText(valor.toLocaleString('pt-BR'),ponto.x,ponto.y-8)
})
ctx.restore()
}
}
/*=========================================================
019 FUNCTION CARREGAREVOLUCAO
=========================================================*/
async function carregarEvolucao(){
try{
let resultado=await api('evolucao',{days:30})
let dados=resultado.data||[]
let labels=dados.map(x=>new Date(`${x.dia}T12:00:00`).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}))
let valores=dados.map(x=>Number(x.focos||0))
let canvas=document.getElementById('graficoEvolucao')
if(!canvas)return
if(charts.graficoEvolucao)charts.graficoEvolucao.destroy()
charts.graficoEvolucao=new Chart(canvas,{type:'line',data:{labels,datasets:[{label:'Focos por dia',data:valores,borderColor:'#ef3b2d',backgroundColor:'rgba(239,59,45,.14)',pointBackgroundColor:'#ef3b2d',pointBorderColor:'#ffffff',pointBorderWidth:2,pointRadius:4,pointHoverRadius:6,borderWidth:2,tension:.28,fill:true}]},options:{responsive:true,maintainAspectRatio:false,layout:{padding:{top:28,right:10}},plugins:{legend:{display:true,position:'bottom'},tooltip:{enabled:true}},scales:{y:{beginAtZero:true,grid:{color:'#e5e7eb'}},x:{grid:{display:false}}}},plugins:[pluginValoresEvolucao]})
}catch(erro){
console.error('Erro evolução:',erro)
}
}
/*=========================================================
020 PLUGIN PLUGINVALORESRANKING
=========================================================*/
const pluginValoresRanking={
id:'pluginValoresRanking',
afterDatasetsDraw(chart){
let ctx=chart.ctx
let meta=chart.getDatasetMeta(0)
let dados=chart.data.datasets[0].data
ctx.save()
ctx.font='bold 12px Inter,Arial,sans-serif'
ctx.fillStyle='#111827'
ctx.textAlign='left'
ctx.textBaseline='middle'
meta.data.forEach((barra,i)=>{
let valor=Number(dados[i]||0)
ctx.fillText(valor.toLocaleString('pt-BR'),barra.x+7,barra.y)
})
ctx.restore()
}
}
/*=========================================================
021 FUNCTION CARREGARRANKING
=========================================================*/
async function carregarRanking(){
try{
let resultado=await api('ranking')
rankingMunicipios=resultado.data||[]
renderTabelaMunicipios(rankingMunicipios)
let top=rankingMunicipios.slice(0,10)
let canvas=document.getElementById('graficoRanking')
if(!canvas)return
if(charts.graficoRanking)charts.graficoRanking.destroy()
let cores=['#ef4444','#2563eb','#22c55e','#f97316','#7c3aed','#b45309','#ec4899','#64748b','#eab308','#38bdf8']
charts.graficoRanking=new Chart(canvas,{type:'bar',data:{labels:top.map(x=>x.municipality),datasets:[{label:'Focos',data:top.map(x=>Number(x.focos||0)),backgroundColor:top.map((_,i)=>cores[i%cores.length]),borderColor:top.map((_,i)=>cores[i%cores.length]),borderWidth:1}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,layout:{padding:{right:45}},plugins:{legend:{display:false},tooltip:{enabled:true}},scales:{x:{beginAtZero:true,grid:{color:'#e5e7eb'}},y:{grid:{display:false},ticks:{font:{weight:'700'}}}}},plugins:[pluginValoresRanking]})
}catch(erro){
console.error('Erro ranking:',erro)
let box=document.getElementById('tabelaMunicipios')
if(box)box.innerHTML='<div class="vazio">Não foi possível carregar o ranking municipal.</div>'
}
}
/*=========================================================
022 FUNCTION NORMALIZARNOMEMUNICIPIO
=========================================================*/
function normalizarNomeMunicipio(v){
return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,"'").toUpperCase().trim()
}
/*=========================================================
023 FUNCTION GETFAIXAFOCOSMUNICIPIO
=========================================================*/
function getFaixaFocosMunicipio(q){
let n=Number(q||0)
if(n===0)return{rotulo:'0',cor:'#f8fafc'}
if(n<=10)return{rotulo:'1 – 10',cor:'#dcfce7'}
if(n<=25)return{rotulo:'11 – 25',cor:'#bbf7d0'}
if(n<=50)return{rotulo:'26 – 50',cor:'#fef3c7'}
if(n<=100)return{rotulo:'51 – 100',cor:'#fde68a'}
if(n<=250)return{rotulo:'101 – 250',cor:'#fdba74'}
if(n<=500)return{rotulo:'251 – 500',cor:'#fb923c'}
if(n<=750)return{rotulo:'501 – 750',cor:'#ef4444'}
if(n<=1000)return{rotulo:'751 – 1000',cor:'#b91c1c'}
return{rotulo:'1000+',cor:'#7f1d1d'}
}
/*=========================================================
024 FUNCTION AGREGARFOCOSMUNICIPIO
=========================================================*/
function agregarFocosMunicipio(dados){
let mapa={}
;(dados||[]).forEach(foco=>{
let nome=normalizarNomeMunicipio(foco.municipality)
if(!nome)return
if(!mapa[nome])mapa[nome]={quantidade:0,frpMaximo:0,ultima:null,nomeOriginal:foco.municipality}
let m=mapa[nome]
m.quantidade++
let frp=Number(foco.frp||0)
if(Number.isFinite(frp)&&frp>m.frpMaximo)m.frpMaximo=frp
if(!m.ultima||new Date(foco.detected_at)>new Date(m.ultima))m.ultima=foco.detected_at
})
return mapa
}
/*=========================================================
025 FUNCTION OBTERNOMEMUNICIPIOGEOJSON
=========================================================*/
function obterNomeMunicipioGeoJSON(feature){
let p=feature?.properties||{}
return p.nome||p.NM_MUN||p.municipio||p.MUNICIPIO||p.name||p.NAME||p.nome_municipio||p.NM_MUNICIP||''
}
/*=========================================================
026 FUNCTION CARREGARGEOJSONMUNICIPIOS
=========================================================*/
async function carregarGeoJSONMunicipios(){
let caminhos=['../assets/geojson/municipios-ro.geojson','/tags/assets/geojson/municipios-ro.geojson','../queimadas/assets/geojson/municipios-ro.geojson','/tags/queimadas/assets/geojson/municipios-ro.geojson']
for(let caminho of caminhos){
try{
let resposta=await fetch(caminho)
if(resposta.ok)return await resposta.json()
}catch(e){}
}
throw new Error('GeoJSON dos municípios de Rondônia não localizado')
}
/*=========================================================
027 FUNCTION ADICIONARLEGENDAFAIXASMUNICIPAIS
=========================================================*/
function adicionarLegendaFaixasMunicipais(mapa){
if(mapa._legendaFaixasRFC)return
let legenda=L.control({position:'bottomleft'})
legenda.onAdd=function(){
let div=L.DomUtil.create('div','legendaFocos')
let faixas=[getFaixaFocosMunicipio(0),getFaixaFocosMunicipio(1),getFaixaFocosMunicipio(11),getFaixaFocosMunicipio(26),getFaixaFocosMunicipio(51),getFaixaFocosMunicipio(101),getFaixaFocosMunicipio(251),getFaixaFocosMunicipio(501),getFaixaFocosMunicipio(751),getFaixaFocosMunicipio(1001)]
div.innerHTML=`<div class="legendaTitulo">FOCOS POR MUNICÍPIO</div>${faixas.map(f=>`<div><span class="legendaQuadrado" style="background:${f.cor}"></span>${f.rotulo}</div>`).join('')}<div class="legendaNota">Últimas 24h • PROTEGE/SEDAM</div>`
return div
}
legenda.addTo(mapa)
mapa._legendaFaixasRFC=legenda
}

/*=========================================================
029 FUNCTION CARREGARPOLIGONOSMUNICIPAIS
=========================================================*/
async function carregarPoligonosMunicipais(mapa,dados){
try{
let geo=await carregarGeoJSONMunicipios()
let resumo=agregarFocosMunicipio(dados)
let camada=null
camada=L.geoJSON(geo,{style:feature=>{
let nome=normalizarNomeMunicipio(obterNomeMunicipioGeoJSON(feature))
let qtd=resumo[nome]?.quantidade||0
let faixa=getFaixaFocosMunicipio(qtd)
return{color:'#64748b',weight:.8,fillColor:faixa.cor,fillOpacity:.48}
},onEachFeature:(feature,layer)=>{
let nomeOriginal=obterNomeMunicipioGeoJSON(feature)
let nome=normalizarNomeMunicipio(nomeOriginal)
let info=resumo[nome]||{quantidade:0,frpMaximo:0,ultima:null}
let faixa=getFaixaFocosMunicipio(info.quantidade)
layer.bindPopup(`<div class="popupExecutivo"><strong>${nomeOriginal||'Município'}</strong><br>Focos nas últimas 24h: <strong>${fmt(info.quantidade)}</strong><br>Faixa: <strong>${faixa.rotulo}</strong><br>FRP máximo: <strong>${numeroBR(info.frpMaximo,1)}</strong><br>Última detecção: ${dataBR(info.ultima)}</div>`)
layer.on({
mouseover:e=>e.target.setStyle({weight:2,color:'#0f172a',fillOpacity:.68}),
mouseout:e=>camada.resetStyle(e.target),
click:e=>{
e.target.openPopup()
}
})
}}).addTo(mapa)
adicionarLegendaFaixasMunicipais(mapa)
return camada
}catch(erro){
console.error('Erro polígonos municipais:',erro)
return null
}
}
/*=========================================================
030 FUNCTION RENDERMAPAEXECUTIVO
=========================================================*/
async function renderMapaExecutivo(dados,eventos=[]){
let mapa=iniciarMapa('mapaExecutivo',[-10.9,-63.3],6)
limparCamadas(mapa)
let camadaMunicipios=await carregarPoligonosMunicipais(mapa,dados)
renderEventosOperacionaisMapa(mapa,dados,eventos)
if(camadaMunicipios&&camadaMunicipios.getBounds().isValid()){
mapa.fitBounds(camadaMunicipios.getBounds(),{padding:[12,12],maxZoom:7})
}else{
mapa.fitBounds([[-13.75,-66.95],[-7.85,-59.65]],{padding:[12,12]})
}
setTimeout(()=>mapa.invalidateSize(true),180)
}
/*=========================================================
031 FUNCTION RENDEREVENTOSOPERACIONAISMAPA
=========================================================*/
function renderEventosOperacionaisMapa(mapa,dados,eventos){
if(!Array.isArray(eventos)||!eventos.length)return
let statusPorEvento={}
eventos.forEach(e=>{
if(e.event_id)statusPorEvento[e.event_id]=e.status_operacional||'sem_status'
})
let agrupados={}
dados.forEach(foco=>{
if(!foco.event_id)return
let status=statusPorEvento[foco.event_id]
if(!['em_combate','em_analise','monitorando'].includes(status))return
let lat=Number(foco.latitude)
let lng=Number(foco.longitude)
if(!Number.isFinite(lat)||!Number.isFinite(lng))return
if(!agrupados[foco.event_id])agrupados[foco.event_id]={event_id:foco.event_id,status,municipio:foco.municipality||'Município não informado',latTotal:0,lngTotal:0,quantidade:0,frpMaximo:0,ultima:null}
let g=agrupados[foco.event_id]
g.latTotal+=lat
g.lngTotal+=lng
g.quantidade++
let frp=Number(foco.frp||0)
if(Number.isFinite(frp)&&frp>g.frpMaximo)g.frpMaximo=frp
if(!g.ultima||new Date(foco.detected_at)>new Date(g.ultima))g.ultima=foco.detected_at
})
Object.values(agrupados).forEach(g=>{
let latitude=g.latTotal/g.quantidade
let longitude=g.lngTotal/g.quantidade
let configuracao=getConfiguracaoStatusEvento(g.status)
let icone=L.divIcon({className:'eventoOperacionalWrapper',html:`<div class="eventoOperacional ${configuracao.classe}"><span>${configuracao.icone}</span></div>`,iconSize:[38,38],iconAnchor:[19,19]})
L.marker([latitude,longitude],{icon:icone,zIndexOffset:1000}).bindPopup(`<div class="popupExecutivo"><strong>${configuracao.titulo}</strong><br><strong>${g.municipio}</strong><br>Detecções associadas: ${fmt(g.quantidade)}<br>FRP máximo: ${numeroBR(g.frpMaximo,1)}<br>Última detecção: ${dataBR(g.ultima)}<br><span style="font-size:9px;color:#64748b">Evento: ${g.event_id}</span></div>`).addTo(mapa)
})
}
/*=========================================================
032 FUNCTION GETCONFIGURACAOSTATUSEVENTO
=========================================================*/
function getConfiguracaoStatusEvento(status){
if(status==='em_combate')return{icone:'🔥',titulo:'EM COMBATE',classe:'eventoEmCombate'}
if(status==='monitorando')return{icone:'👁',titulo:'MONITORANDO',classe:'eventoMonitorandoMapa'}
if(status==='em_analise')return{icone:'🔎',titulo:'EM ANÁLISE',classe:'eventoEmAnalise'}
return{icone:'•',titulo:'EVENTO',classe:'eventoSemClassificacao'}
}
/*=========================================================
033 FUNCTION CALCULARPRIORIDADEMUNICIPIOS
=========================================================*/
function calcularPrioridadeMunicipios(focos,eventos){
let municipios={}
let statusEventos={}
;(eventos||[]).forEach(e=>{
if(e.event_id)statusEventos[e.event_id]=e.status_operacional||'sem_status'
})
;(focos||[]).forEach(f=>{
let municipio=f.municipality||'Não identificado'
if(!municipios[municipio])municipios[municipio]={municipio,focos:0,frpMaximo:0,combate:0,monitorando:0,analise:0,pontuacao:0}
let m=municipios[municipio]
m.focos++
let frp=Number(f.frp||0)
if(Number.isFinite(frp)&&frp>m.frpMaximo)m.frpMaximo=frp
let status=statusEventos[f.event_id]
if(status==='em_combate')m.combate=1
if(status==='monitorando')m.monitorando=1
if(status==='em_analise')m.analise=1
})
return Object.values(municipios).map(m=>{
m.pontuacao=(m.combate*100)+(m.monitorando*60)+(m.analise*40)+Math.min(m.focos,50)+Math.min(m.frpMaximo/10,20)
return m
}).sort((a,b)=>b.pontuacao-a.pontuacao)
}
/*=========================================================
034 FUNCTION CLASSIFICARPRIORIDADEMUNICIPIO
=========================================================*/
function classificarPrioridadeMunicipio(m){
if(m.combate)return{texto:'CRÍTICA',classe:'prioridadeCritica'}
if(m.monitorando)return{texto:'ALTA',classe:'prioridadeAlta'}
if(m.analise)return{texto:'ATENÇÃO',classe:'prioridadeAtencao'}
if(m.focos>=30)return{texto:'ALTA',classe:'prioridadeAlta'}
if(m.focos>=10)return{texto:'ATENÇÃO',classe:'prioridadeAtencao'}
return{texto:'ACOMPANHAR',classe:'prioridadeNormal'}
}
/*=========================================================
035 FUNCTION RENDERPRIORIDADEMUNICIPIOS
=========================================================*/
function renderPrioridadeMunicipios(focos,eventos){
let box=document.getElementById('prioridadeMunicipios')
if(!box)return
let ranking=calcularPrioridadeMunicipios(focos,eventos).slice(0,10)
if(!ranking.length){
box.innerHTML='<div class="vazio">Nenhum município com detecção nas últimas 24h.</div>'
return
}
box.innerHTML=`<div class="tabelaScroll"><table class="tabela"><thead><tr><th>#</th><th>MUNICÍPIO</th><th>PRIORIDADE</th><th>FOCOS 24H</th><th>FRP MÁX.</th><th>SITUAÇÃO</th></tr></thead><tbody>${ranking.map((m,i)=>{
let p=classificarPrioridadeMunicipio(m)
let situacao=m.combate?'🔥 Em combate':m.monitorando?'👁 Monitorando':m.analise?'🔎 Em análise':'Detecção de focos'
return `<tr><td><strong>${i+1}</strong></td><td><strong>${m.municipio}</strong></td><td><span class="badgePrioridade ${p.classe}">${p.texto}</span></td><td><strong>${fmt(m.focos)}</strong></td><td>${numeroBR(m.frpMaximo,1)}</td><td>${situacao}</td></tr>`
}).join('')}</tbody></table></div>`
}
/*=========================================================
036 FUNCTION CARREGARMAPARO
=========================================================*/
async function carregarMapaRO(days=7){
try{
let[resultPeriodo,result24h,resultEventos]=await Promise.all([api('focos',{scope:'RO',days,limit:10000}),api('focos',{scope:'RO',days:1,limit:10000}),api('eventos')])
let dados=resultPeriodo.data||[]
let dados24h=result24h.data||[]
let eventos=resultEventos.data||[]
await renderMapaExecutivo(dados24h,eventos)
renderPrioridadeMunicipios(dados24h,eventos)
let mapa=iniciarMapa('mapaRO',[-10.9,-63.3],6)
limparCamadas(mapa)
mapa.fitBounds([[-13.75,-66.95],[-7.85,-59.65]],{padding:[12,12]})
dados.forEach(foco=>{
let latitude=Number(foco.latitude)
let longitude=Number(foco.longitude)
if(!Number.isFinite(latitude)||!Number.isFinite(longitude))return
let frp=Number(foco.frp||0)
let marcador=L.circleMarker([latitude,longitude],{radius:tamanhoFoco(frp),color:corFoco(frp),weight:1,fillColor:corFoco(frp),fillOpacity:.75})
marcador.bindPopup(`<div class="popupExecutivo"><strong>${foco.municipality||'Município não informado'}</strong><br>${dataBR(foco.detected_at)}<br>Satélite: <strong>${foco.satellite||'—'}</strong><br>FRP: <strong>${numeroBR(foco.frp,1)}</strong><br>Confiança: ${foco.confidence||'—'}<br>Coordenadas: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}</div>`)
marcador.addTo(mapa)
})
renderTempoReal(dados24h.slice(0,100))
setTimeout(()=>mapa.invalidateSize(true),150)
}catch(erro){
console.error('Erro mapa RO:',erro)
renderTempoReal([])
}
}
/*=========================================================
037 FUNCTION CARREGARAMERICA
=========================================================*/
async function carregarAmerica(){
try{
let resultado=await api('focos',{scope:'SOUTH_AMERICA',days:7,limit:10000})
let dados=resultado.data||[]
let mapa=iniciarMapa('mapaAmerica',[-15,-60],4)
limparCamadas(mapa)
dados.forEach(foco=>{
let latitude=Number(foco.latitude)
let longitude=Number(foco.longitude)
if(!Number.isFinite(latitude)||!Number.isFinite(longitude))return
L.circleMarker([latitude,longitude],{radius:3,color:'#f97316',weight:0,fillColor:'#f97316',fillOpacity:.65}).bindPopup(`<strong>${foco.country||'—'}</strong><br>${foco.state||''}<br>${dataBR(foco.detected_at)}`).addTo(mapa)
})
setTimeout(()=>mapa.invalidateSize(),100)
}catch(erro){
console.error('Erro América do Sul:',erro)
}
}
/*=========================================================
038 FUNCTION RENDERTABELAMUNICIPIOS
=========================================================*/
function renderTabelaMunicipios(dados){
let busca=(document.getElementById('buscaMunicipio')?.value||'').toLowerCase()
let lista=(dados||[]).filter(x=>(x.municipality||'').toLowerCase().includes(busca))
let box=document.getElementById('tabelaMunicipios')
if(!box)return
if(!lista.length){
box.innerHTML='<div class="vazio">Nenhum município com dados disponíveis.</div>'
return
}
box.innerHTML=`<div style="overflow:auto;max-height:600px"><table class="tabela"><thead><tr><th>#</th><th>Município</th><th>Focos</th><th>Último foco</th><th>FRP médio</th><th>FRP máximo</th></tr></thead><tbody>${lista.map((x,i)=>`<tr><td>${i+1}</td><td><strong>${x.municipality}</strong></td><td><strong>${fmt(x.focos)}</strong></td><td>${dataBR(x.ultimo_foco)}</td><td>${numeroBR(x.frp_medio,1)}</td><td>${numeroBR(x.frp_maximo,1)}</td></tr>`).join('')}</tbody></table></div>`
}
/*=========================================================
039 FUNCTION RENDERTEMPOREAL
=========================================================*/
function renderTempoReal(dados){
let box=document.getElementById('listaTempoReal')
if(!box)return
if(!dados.length){
box.innerHTML='<div class="vazio">Ainda não há detecções importadas do PROTEGE.</div>'
return
}
box.innerHTML=dados.map(foco=>`<div class="linhaTempo"><span>${dataBR(foco.detected_at)}</span><strong>${foco.municipality||foco.state||'—'}</strong><span>${foco.satellite||'—'}</span><span>FRP ${numeroBR(foco.frp,1)}</span><span>${Number(foco.latitude).toFixed(3)}, ${Number(foco.longitude).toFixed(3)}</span></div>`).join('')
}
/*=========================================================
040 FUNCTION CRIARGRAFICO
=========================================================*/
function criarGrafico(id,tipo,labels,dados,rotulo){
let canvas=document.getElementById(id)
if(!canvas)return
if(charts[id])charts[id].destroy()
let cores=['#ef4444','#2563eb','#22c55e','#f97316','#7c3aed','#b45309','#ec4899','#64748b','#eab308','#38bdf8']
let dataset={label:rotulo,data:dados}
if(tipo==='doughnut'){
dataset.backgroundColor=dados.map((_,i)=>cores[i%cores.length])
dataset.borderWidth=2
}
charts[id]=new Chart(canvas,{type:tipo,data:{labels,datasets:[dataset]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:tipo==='doughnut'}}}})
}
/*=========================================================
041 FUNCTION CARREGARSATELITES
=========================================================*/
async function carregarSatelites(){
try{
let resultado=await api('satelites')
let dados=resultado.data||[]
let ultimoSatelite=document.getElementById('ultimoSatelite')
if(ultimoSatelite){
let principal=dados.length?dados[0]:null
ultimoSatelite.textContent=principal?`SATÉLITE: ${principal.satellite}`:'SATÉLITE: —'
}
criarGrafico('graficoSatelites','doughnut',dados.map(x=>x.satellite),dados.map(x=>x.focos),'Focos')
let box=document.getElementById('listaSatelites')
if(!box)return
if(!dados.length){
box.innerHTML='<div class="vazio">Sem dados de satélite.</div>'
return
}
box.innerHTML=dados.map(x=>`<div class="fonteLinha"><strong>${x.satellite}</strong> — ${fmt(x.focos)} focos • última detecção ${dataBR(x.ultima_deteccao)}</div>`).join('')
}catch(erro){
console.error('Erro satélites:',erro)
}
}
/*=========================================================
042 FUNCTION BADGESTATUS
=========================================================*/
function badgeStatus(status){
if(status==='em_combate')return'<span style="background:#991b1b;color:white;padding:5px 8px;border-radius:999px;font-size:10px;font-weight:900">🔥 EM COMBATE</span>'
if(status==='monitorando')return'<span style="background:#1d4ed8;color:white;padding:5px 8px;border-radius:999px;font-size:10px;font-weight:900">👁 MONITORANDO</span>'
if(status==='em_analise')return'<span style="background:#d97706;color:white;padding:5px 8px;border-radius:999px;font-size:10px;font-weight:900">🔎 EM ANÁLISE</span>'
if(status==='resolvido')return'<span style="background:#15803d;color:white;padding:5px 8px;border-radius:999px;font-size:10px;font-weight:900">✓ RESOLVIDO</span>'
return'<span style="background:#64748b;color:white;padding:5px 8px;border-radius:999px;font-size:10px;font-weight:900">SEM STATUS</span>'
}
/*=========================================================
043 FUNCTION CARREGAREVENTOS
=========================================================*/
async function carregarEventos(){
try{
let resultado=await api('eventos')
let dados=resultado.data||[]
let box=document.getElementById('listaEventos')
if(!dados.length){
if(box)box.innerHTML='<div class="vazio">Nenhum evento de fogo identificado no período.</div>'
return
}
let combate=dados.filter(x=>x.status_operacional==='em_combate')
let monitorando=dados.filter(x=>x.status_operacional==='monitorando')
let analise=dados.filter(x=>x.status_operacional==='em_analise')
let resolvido=dados.filter(x=>x.status_operacional==='resolvido')
let semStatus=dados.filter(x=>!x.status_operacional||x.status_operacional==='sem_status')
let executivo=document.getElementById('eventosExecutivo')
if(executivo){
executivo.innerHTML=`<div class="kpi eventoCombate"><div class="rotulo">🔥 EM COMBATE</div><div class="valor">${combate.length}</div><div class="nota">Eventos em atuação operacional</div></div><div class="kpi eventoMonitorando"><div class="rotulo">👁 MONITORANDO</div><div class="valor">${monitorando.length}</div><div class="nota">Eventos sob acompanhamento</div></div><div class="kpi eventoAnalise"><div class="rotulo">🔎 EM ANÁLISE</div><div class="valor">${analise.length}</div><div class="nota">Eventos em avaliação</div></div><div class="kpi eventoResolvido"><div class="rotulo">✅ RESOLVIDOS</div><div class="valor">${resolvido.length}</div><div class="nota">Eventos encerrados</div></div><div class="kpi eventoSemStatus"><div class="rotulo">⚪ SEM CLASSIFICAÇÃO</div><div class="valor">${semStatus.length}</div><div class="nota">Eventos sem status operacional</div></div>`
}
const prioridade={em_combate:1,monitorando:2,em_analise:3,sem_status:4,resolvido:5}
dados.sort((a,b)=>{
let pa=prioridade[a.status_operacional||'sem_status']||9
let pb=prioridade[b.status_operacional||'sem_status']||9
if(pa!==pb)return pa-pb
return new Date(b.ultima_deteccao)-new Date(a.ultima_deteccao)
})
if(!box)return
box.innerHTML=`<div class="cardTitulo">EVENTOS IDENTIFICADOS PELO PROTEGE</div><div style="overflow:auto;max-height:650px"><table class="tabela"><thead><tr><th>PRIORIDADE</th><th>STATUS</th><th>MUNICÍPIO</th><th>DETECÇÕES</th><th>INÍCIO</th><th>ÚLTIMA DETECÇÃO</th><th>FRP MÁX.</th><th>EVENTO</th></tr></thead><tbody>${dados.map(x=>{
let status=x.status_operacional||'sem_status'
let prioridadeTexto=status==='em_combate'?'CRÍTICA':status==='monitorando'?'ALTA':status==='em_analise'?'ATENÇÃO':status==='resolvido'?'ENCERRADO':'NORMAL'
return `<tr><td><strong>${prioridadeTexto}</strong></td><td>${badgeStatus(status)}</td><td><strong>${x.municipios||'—'}</strong></td><td>${fmt(x.deteccoes)}</td><td>${dataBR(x.inicio)}</td><td>${dataBR(x.ultima_deteccao)}</td><td>${numeroBR(x.frp_maximo,1)}</td><td style="font-size:9px;color:#64748b">${x.event_id}</td></tr>`
}).join('')}</tbody></table></div>`
}catch(erro){
console.error('Erro eventos:',erro)
let box=document.getElementById('listaEventos')
if(box)box.innerHTML='<div class="vazio">Erro ao carregar os eventos de fogo.</div>'
}
}
/*=========================================================
044 FUNCTION RENDERFONTE
=========================================================*/
function renderFonte(resultado){
let configuracoes={}
;(resultado.config||[]).forEach(x=>configuracoes[x.key]=x)
let fonte=document.getElementById('fonteInfo')
if(fonte){
fonte.innerHTML=`<div class="fonteLinha"><strong>Projeto:</strong> ${configuracoes.project_name?.value||'RondoniaFocosdeCalor'}</div><div class="fonteLinha"><strong>Fonte operacional:</strong> PROTEGE / SEDAM</div><div class="fonteLinha"><strong>Portal:</strong> ${configuracoes.portal_url?.value||'https://protege.sedam.ro.gov.br/queimadas'}</div><div class="fonteLinha"><strong>Cobertura:</strong> Rondônia e América do Sul</div><div class="fonteLinha"><strong>Política de integridade:</strong> sem dados simulados</div>`
}
let sincronizacoes=resultado.sync||[]
let box=document.getElementById('syncInfo')
if(!box)return
if(!sincronizacoes.length){
box.innerHTML='<div class="vazio">Nenhuma sincronização executada.</div>'
return
}
box.innerHTML=sincronizacoes.map(x=>`<div class="fonteLinha"><strong>${x.scope}</strong> • ${x.status} • ${dataBR(x.started_at)}<br>Recebidos: ${fmt(x.records_received)} • Gravados: ${fmt(x.records_upserted)}</div>`).join('')
}
/*=========================================================
045 FUNCTION CONFIGURAREVENTOSINTERFACE
=========================================================*/
function configurarEventosInterface(){
let busca=document.getElementById('buscaMunicipio')
if(busca)busca.addEventListener('input',()=>renderTabelaMunicipios(rankingMunicipios))
let botao=document.getElementById('btnAtualizarMapa')
if(botao){
botao.onclick=()=>{
let periodo=document.getElementById('periodoMapa')?.value||7
carregarMapaRO(periodo)
}
}
}
/*=========================================================
046 FUNCTION INICIAR
=========================================================*/
async function iniciar(){
configurarBotoesAbas()
configurarEventosInterface()
await carregarStatus()
await Promise.allSettled([
carregarRanking(),
carregarEvolucao(),
carregarSatelites(),
carregarEventos(),
carregarAmerica()
])
await carregarMapaRO(7)
if(typeof rfcRenderResumoOperacao==='function')await rfcRenderResumoOperacao()
if(typeof rfcRenderResumoTerritorio==='function')await rfcRenderResumoTerritorio()
if(typeof rfcRenderFontes==='function')await rfcRenderFontes()
if(typeof rfcRenderResumoGestao==='function')await rfcRenderResumoGestao()
if(typeof rfcRenderExecutivoKPIs==='function')await rfcRenderExecutivoKPIs()
if(typeof rfcRenderExecutivoAtencao==='function')await rfcRenderExecutivoAtencao()
setTimeout(()=>{
Object.values(mapas).forEach(mapa=>{
try{mapa.invalidateSize(true)}catch(e){}
})
},400)
iniciarAtualizacaoAutomatica()
}
iniciar()
