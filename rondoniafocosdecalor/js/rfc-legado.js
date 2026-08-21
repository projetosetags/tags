let RFC_CLIENT_QUEIMADAS=null
let RFC_MUNICIPIOS=[]
let RFC_MAPA_MUNICIPIOS=null
let RFC_CAMADA_MUNICIPIOS=null
let RFC_GRAFICO_RESPOSTAS=null
let RFC_MUNICIPIOS_CARREGADOS=false
/*=========================================================
100 FUNCTION RFCINICIARCLIENTEQUEIMADAS
=========================================================*/
function rfcIniciarClienteQueimadas(){
RFC_CLIENT_QUEIMADAS=window.clientQueimadas||null
if(!RFC_CLIENT_QUEIMADAS)console.error('Cliente Supabase schema queimadas não disponível.')
}
/*=========================================================
101 FUNCTION RFCNORMALIZARMUNICIPIO
=========================================================*/
function rfcNormalizarMunicipio(v){
return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,"'").toUpperCase().trim()
}
/*=========================================================
102 FUNCTION RFCCLASSIFICARMUNICIPIO
=========================================================*/
function rfcClassificarMunicipio(i){
let plano=i.plano_acao===true||i.plano_acao==='true'||i.plano_acao===1||i.plano_acao==='1'
let dilacao=i.dilacao_prazo===true||i.dilacao_prazo==='true'||i.dilacao_prazo===1||i.dilacao_prazo==='1'
let semResposta=i.sem_resposta===true||i.sem_resposta==='true'||i.sem_resposta===1||i.sem_resposta==='1'
let classificacao='VERMELHO'
if(plano)classificacao='VERDE'
else if(dilacao)classificacao='AMARELO'
else if(semResposta)classificacao='VERMELHO'
return{...i,classificacaoRFC:classificacao}
}
/*=========================================================
103 FUNCTION RFCSTATUSHTML
=========================================================*/
function rfcStatusHTML(status){
if(status==='VERDE')return'<span class="rfcBadgeStatus rfcBadgeVerde">🟢 PLANO DE AÇÃO</span>'
if(status==='AMARELO')return'<span class="rfcBadgeStatus rfcBadgeAmarelo">🟡 DILAÇÃO</span>'
return'<span class="rfcBadgeStatus rfcBadgeVermelho">🔴 SEM RESPOSTA</span>'
}
/*=========================================================
104 FUNCTION RFCCORSTATUS
=========================================================*/
function rfcCorStatus(status){
if(status==='VERDE')return'#16a34a'
if(status==='AMARELO')return'#facc15'
if(status==='VERMELHO')return'#dc2626'
return'#cbd5e1'
}
/*=========================================================
105 FUNCTION RFCCARREGARMUNICIPIOS
=========================================================*/
async function rfcCarregarMunicipios(){
if(!RFC_CLIENT_QUEIMADAS)rfcIniciarClienteQueimadas()
if(!RFC_CLIENT_QUEIMADAS)return
let{data,error}=await RFC_CLIENT_QUEIMADAS.from('vw_queimadas_municipios_resposta').select('*').order('municipio')
if(error){
console.error('Erro municípios:',error)
let box=document.getElementById('rfcTabelaMunicipios')
if(box)box.innerHTML='<div class="vazio">Erro ao carregar os dados municipais.</div>'
return
}
RFC_MUNICIPIOS=(data||[]).map(rfcClassificarMunicipio)
RFC_MUNICIPIOS_CARREGADOS=true
rfcRenderKPIsMunicipios()
rfcRenderTabelaMunicipios()
rfcRenderEstatisticasMunicipais()
rfcRenderGraficoRespostas()
await rfcRenderMapaMunicipios('TODOS')
await rfcCarregarRankingFocosMunicipios()
}
/*=========================================================
106 FUNCTION RFCRENDERKPISMUNICIPIOS
=========================================================*/
function rfcRenderKPIsMunicipios(){
let box=document.getElementById('rfcMunicipiosKPIs')
if(!box)return
let total=RFC_MUNICIPIOS.length
let verde=RFC_MUNICIPIOS.filter(x=>x.classificacaoRFC==='VERDE').length
let amarelo=RFC_MUNICIPIOS.filter(x=>x.classificacaoRFC==='AMARELO').length
let vermelho=RFC_MUNICIPIOS.filter(x=>x.classificacaoRFC==='VERMELHO').length
let atendidos=verde+amarelo
box.innerHTML=`<div class="kpi"><div class="rotulo">MUNICÍPIOS</div><div class="valor">${total||52}</div><div class="nota">Estado de Rondônia</div></div><div class="kpi"><div class="rotulo">🟢 PLANO DE AÇÃO</div><div class="valor">${verde}</div><div class="nota">Resposta apresentada</div></div><div class="kpi"><div class="rotulo">🟡 DILAÇÃO</div><div class="valor">${amarelo}</div><div class="nota">Prazo prorrogado</div></div><div class="kpi"><div class="rotulo">🔴 SEM RESPOSTA</div><div class="valor">${vermelho}</div><div class="nota">Pendência</div></div><div class="kpi"><div class="rotulo">ATENDIMENTO</div><div class="valor">${total?((atendidos/total)*100).toFixed(1).replace('.',','):0}%</div><div class="nota">Plano ou dilação</div></div>`
}
/*=========================================================
107 FUNCTION RFCFILTRARMUNICIPIOS
=========================================================*/
function rfcFiltrarMunicipios(){
let situacao=document.getElementById('rfcFiltroMunicipioSituacao')?.value||''
let busca=(document.getElementById('rfcBuscaMunicipio')?.value||'').toLowerCase().trim()
return RFC_MUNICIPIOS.filter(x=>{
let okSituacao=!situacao||x.classificacaoRFC===situacao
let okBusca=!busca||String(x.municipio||'').toLowerCase().includes(busca)
return okSituacao&&okBusca
})
}
/*=========================================================
108 FUNCTION RFCRENDERTABELAMUNICIPIOS
=========================================================*/
function rfcRenderTabelaMunicipios(){
let box=document.getElementById('rfcTabelaMunicipios')
if(!box)return
let lista=rfcFiltrarMunicipios()
if(!lista.length){
box.innerHTML='<div class="vazio">Nenhum município encontrado.</div>'
return
}
box.innerHTML=`<div class="rfcTabelaScroll"><table class="tabela"><thead><tr><th>#</th><th>MUNICÍPIO</th><th>SITUAÇÃO</th><th>DOCUMENTO</th><th>RECEBIMENTO</th><th>OBSERVAÇÃO</th></tr></thead><tbody>${lista.map((x,i)=>{
let documento=x.llnumerodocenviado||x.lnumerodocenviado||x.documento||'-'
let recebimento=x.lldatarecebimentodoc||x.ldatarecebimentodoc||x.data_recebimento||''
let observacao=x.observacao||x.observacoes||x.obs||'-'
return`<tr><td>${i+1}</td><td><strong>${x.municipio||'-'}</strong></td><td>${rfcStatusHTML(x.classificacaoRFC)}</td><td>${documento||'-'}</td><td>${recebimento?dataBR(recebimento):'-'}</td><td>${observacao||'-'}</td></tr>`
}).join('')}</tbody></table></div>`
}
/*=========================================================
109 FUNCTION RFCRENDERESTATISTICASMUNICIPAIS
=========================================================*/
function rfcRenderEstatisticasMunicipais(){
let box=document.getElementById('rfcEstatisticasMunicipais')
if(!box)return
let total=RFC_MUNICIPIOS.length||52
let verde=RFC_MUNICIPIOS.filter(x=>x.classificacaoRFC==='VERDE').length
let amarelo=RFC_MUNICIPIOS.filter(x=>x.classificacaoRFC==='AMARELO').length
let vermelho=RFC_MUNICIPIOS.filter(x=>x.classificacaoRFC==='VERMELHO').length
let pct=v=>total?((v/total)*100).toFixed(1).replace('.',','):'0,0'
box.innerHTML=`<div class="rfcEstatLinha"><span>🟢 Plano de Ação</span><strong>${verde} • ${pct(verde)}%</strong></div><div class="rfcEstatLinha"><span>🟡 Dilação de prazo</span><strong>${amarelo} • ${pct(amarelo)}%</strong></div><div class="rfcEstatLinha"><span>🔴 Sem resposta</span><strong>${vermelho} • ${pct(vermelho)}%</strong></div><div class="rfcEstatLinha rfcEstatTotal"><span>Total</span><strong>${total}</strong></div>`
}
/*=========================================================
110 FUNCTION RFCRENDERGRAFICORESPOSTAS
=========================================================*/
function rfcRenderGraficoRespostas(){
let canvas=document.getElementById('rfcGraficoMunicipiosResposta')
if(!canvas)return
let verde=RFC_MUNICIPIOS.filter(x=>x.classificacaoRFC==='VERDE').length
let amarelo=RFC_MUNICIPIOS.filter(x=>x.classificacaoRFC==='AMARELO').length
let vermelho=RFC_MUNICIPIOS.filter(x=>x.classificacaoRFC==='VERMELHO').length
if(RFC_GRAFICO_RESPOSTAS)RFC_GRAFICO_RESPOSTAS.destroy()
RFC_GRAFICO_RESPOSTAS=new Chart(canvas,{type:'doughnut',data:{labels:['Plano de Ação','Dilação','Sem Resposta'],datasets:[{data:[verde,amarelo,vermelho],backgroundColor:['#16a34a','#facc15','#dc2626'],borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}})
}
/*=========================================================
111 FUNCTION RFCBUSCARGEOJSONMUNICIPIOS
=========================================================*/
async function rfcBuscarGeoJSONMunicipios(){
let caminhos=['../queimadas/assets/geojson/municipios-ro.geojson','/tags/queimadas/assets/geojson/municipios-ro.geojson','../assets/geojson/municipios-ro.geojson','/tags/assets/geojson/municipios-ro.geojson']
for(let caminho of caminhos){
try{
let r=await fetch(caminho)
if(r.ok)return await r.json()
}catch(e){}
}
throw new Error('GeoJSON municipal não localizado')
}
/*=========================================================
112 FUNCTION RFCNOMEGEOJSON
=========================================================*/
function rfcNomeGeoJSON(feature){
let p=feature?.properties||{}
return p.nome||p.NM_MUN||p.municipio||p.MUNICIPIO||p.name||p.NAME||p.nome_municipio||''
}
/*=========================================================
113 FUNCTION RFCRENDERMAPAMUNICIPIOS
=========================================================*/
async function rfcRenderMapaMunicipios(filtro='TODOS'){
let div=document.getElementById('rfcMapaMunicipios')
if(!div)return
try{
if(!RFC_MAPA_MUNICIPIOS){
RFC_MAPA_MUNICIPIOS=L.map(div,{preferCanvas:true,zoomControl:true}).setView([-10.9,-63.3],6)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(RFC_MAPA_MUNICIPIOS)
}
if(RFC_CAMADA_MUNICIPIOS)RFC_MAPA_MUNICIPIOS.removeLayer(RFC_CAMADA_MUNICIPIOS)
let geo=await rfcBuscarGeoJSONMunicipios()
let porNome={}
RFC_MUNICIPIOS.forEach(x=>porNome[rfcNormalizarMunicipio(x.municipio)]=x)
RFC_CAMADA_MUNICIPIOS=L.geoJSON(geo,{style:feature=>{
let nome=rfcNormalizarMunicipio(rfcNomeGeoJSON(feature))
let item=porNome[nome]
let status=item?.classificacaoRFC||'VERMELHO'
let visivel=filtro==='TODOS'||status===filtro
return{color:visivel?'#475569':'#cbd5e1',weight:visivel?1.2:.4,fillColor:visivel?rfcCorStatus(status):'#f8fafc',fillOpacity:visivel?.48:.08}
},onEachFeature:(feature,layer)=>{
let nomeOriginal=rfcNomeGeoJSON(feature)
let item=porNome[rfcNormalizarMunicipio(nomeOriginal)]
let status=item?.classificacaoRFC||'VERMELHO'
layer.bindPopup(`<div class="popupExecutivo"><strong>${nomeOriginal}</strong><br>Situação: ${rfcStatusHTML(status)}<br>Documento: ${item?.llnumerodocenviado||item?.lnumerodocenviado||'-'}<br>Recebimento: ${item?.lldatarecebimentodoc||item?.ldatarecebimentodoc?dataBR(item?.lldatarecebimentodoc||item?.ldatarecebimentodoc):'-'}</div>`)
}}).addTo(RFC_MAPA_MUNICIPIOS)
if(RFC_CAMADA_MUNICIPIOS.getBounds().isValid())RFC_MAPA_MUNICIPIOS.fitBounds(RFC_CAMADA_MUNICIPIOS.getBounds(),{padding:[15,15],maxZoom:7})
setTimeout(()=>RFC_MAPA_MUNICIPIOS.invalidateSize(true),150)
}catch(erro){
console.error('Erro mapa municipal:',erro)
div.innerHTML='<div class="vazio">Não foi possível carregar o mapa municipal.</div>'
}
}
/*=========================================================
114 FUNCTION RFCCARREGARRANKINGFOCOSMUNICIPIOS
=========================================================*/
async function rfcCarregarRankingFocosMunicipios(){
let box=document.getElementById('rfcRankingFocosMunicipios')
if(!box)return
try{
let dias=Number(document.getElementById('rfcPeriodoFocosMunicipio')?.value||7)
let resultado=await api('focos',{scope:'RO',days:dias,limit:10000})
let focos=resultado.data||[]
let mapa={}
focos.forEach(f=>{
let nome=f.municipality||'Não identificado'
if(!mapa[nome])mapa[nome]={municipio:nome,focos:0,frpMaximo:0,ultima:null}
mapa[nome].focos++
let frp=Number(f.frp||0)
if(frp>mapa[nome].frpMaximo)mapa[nome].frpMaximo=frp
if(!mapa[nome].ultima||new Date(f.detected_at)>new Date(mapa[nome].ultima))mapa[nome].ultima=f.detected_at
})
let busca=(document.getElementById('rfcBuscaFocosMunicipio')?.value||'').toLowerCase()
let lista=Object.values(mapa).filter(x=>!busca||x.municipio.toLowerCase().includes(busca)).sort((a,b)=>b.focos-a.focos)
box.innerHTML=`<div class="rfcTabelaScroll"><table class="tabela"><thead><tr><th>#</th><th>MUNICÍPIO</th><th>FOCOS</th><th>FRP MÁX.</th><th>ÚLTIMA DETECÇÃO</th></tr></thead><tbody>${lista.map((x,i)=>`<tr><td>${i+1}</td><td><strong>${x.municipio}</strong></td><td><strong>${fmt(x.focos)}</strong></td><td>${numeroBR(x.frpMaximo,1)}</td><td>${dataBR(x.ultima)}</td></tr>`).join('')}</tbody></table></div>`
}catch(erro){
console.error('Erro ranking focos município:',erro)
box.innerHTML='<div class="vazio">Erro ao carregar focos municipais.</div>'
}
}
/*=========================================================
115 FUNCTION RFCCONFIGURARMUNICIPIOS
=========================================================*/
function rfcConfigurarMunicipios(){
let filtro=document.getElementById('rfcFiltroMunicipioSituacao')
let busca=document.getElementById('rfcBuscaMunicipio')
let buscaFocos=document.getElementById('rfcBuscaFocosMunicipio')
let periodo=document.getElementById('rfcPeriodoFocosMunicipio')
if(filtro)filtro.addEventListener('change',rfcRenderTabelaMunicipios)
if(busca)busca.addEventListener('input',rfcRenderTabelaMunicipios)
if(buscaFocos)buscaFocos.addEventListener('input',rfcCarregarRankingFocosMunicipios)
if(periodo)periodo.addEventListener('change',rfcCarregarRankingFocosMunicipios)
document.querySelectorAll('[data-rfc-mapa]').forEach(btn=>btn.addEventListener('click',()=>rfcRenderMapaMunicipios(btn.dataset.rfcMapa)))
let botaoAba=document.querySelector('[data-aba="municipios"]')
if(botaoAba)botaoAba.addEventListener('click',()=>{
setTimeout(async()=>{
if(!RFC_MUNICIPIOS_CARREGADOS)await rfcCarregarMunicipios()
else if(RFC_MAPA_MUNICIPIOS)RFC_MAPA_MUNICIPIOS.invalidateSize(true)
},120)
})
}
/*=========================================================
116 FUNCTION RFCINICIARLEGADO
=========================================================*/
function rfcIniciarLegado(){
rfcIniciarClienteQueimadas()
rfcConfigurarMunicipios()
}
rfcIniciarLegado()
