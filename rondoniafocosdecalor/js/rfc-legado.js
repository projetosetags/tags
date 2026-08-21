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
/*=========================================================
200 FUNCTION RFCCARREGARESTADO
=========================================================*/
async function rfcCarregarEstado(){
if(!RFC_CLIENT_QUEIMADAS)rfcIniciarClienteQueimadas()
if(!RFC_CLIENT_QUEIMADAS)return
await Promise.allSettled([rfcRenderEstadoKPIs(),rfcRenderCadastroEstado(),rfcRenderFormularioEstado(),rfcRenderIndicadoresEstado()])
}
/*=========================================================
201 FUNCTION RFCRENDERESTADOKPIS
=========================================================*/
async function rfcRenderEstadoKPIs(){
let box=document.getElementById('rfcEstadoKPIs')
if(!box)return
try{
let{data,error}=await RFC_CLIENT_QUEIMADAS.from('queimadas_estado_oficio').select('*')
if(error)throw error
let lista=data||[]
let total=lista.length
let respondidos=lista.filter(x=>x.data_recebimento||x.data_resposta||x.respondido===true).length
let pendentes=Math.max(total-respondidos,0)
box.innerHTML=`<div class="kpi"><div class="rotulo">ÓRGÃOS ESTADUAIS</div><div class="valor">${total}</div><div class="nota">Cadastros disponíveis</div></div><div class="kpi"><div class="rotulo">RESPONDIDOS</div><div class="valor">${respondidos}</div><div class="nota">Com retorno registrado</div></div><div class="kpi"><div class="rotulo">PENDENTES</div><div class="valor">${pendentes}</div><div class="nota">Aguardando informação</div></div><div class="kpi"><div class="rotulo">FONTE</div><div class="valor">TCE-RO</div><div class="nota">Base estadual</div></div><div class="kpi"><div class="rotulo">STATUS</div><div class="valor">${total?'ATIVO':'—'}</div><div class="nota">Monitoramento estadual</div></div>`
}catch(erro){
console.error('Erro KPIs Estado:',erro)
box.innerHTML='<div class="vazio">Não foi possível carregar os indicadores estaduais.</div>'
}
}
/*=========================================================
202 FUNCTION RFCRENDERCADASTROESTADO
=========================================================*/
async function rfcRenderCadastroEstado(){
let box=document.getElementById('rfcCadastroEstado')
if(!box)return
try{
let{data,error}=await RFC_CLIENT_QUEIMADAS.from('queimadas_estado_oficio').select('*').order('id',{ascending:true})
if(error)throw error
let lista=data||[]
if(!lista.length){
box.innerHTML='<div class="vazio">Nenhum cadastro estadual localizado.</div>'
return
}
box.innerHTML=`<div class="rfcTabelaScroll"><table class="tabela"><thead><tr><th>#</th><th>ÓRGÃO</th><th>OFÍCIO</th><th>ENVIO</th><th>RECEBIMENTO</th><th>DOCUMENTO</th><th>OBSERVAÇÃO</th></tr></thead><tbody>${lista.map((x,i)=>`<tr><td>${i+1}</td><td><strong>${x.orgao||x.nome||'-'}</strong></td><td>${x.oficio||x.numero_oficio||'-'}</td><td>${x.data_envio?dataBR(x.data_envio):'-'}</td><td>${x.data_recebimento?dataBR(x.data_recebimento):'-'}</td><td>${x.documento||x.numero_documento||'-'}</td><td>${x.observacao||x.obs||'-'}</td></tr>`).join('')}</tbody></table></div>`
}catch(erro){
console.error('Erro cadastro Estado:',erro)
box.innerHTML='<div class="vazio">Erro ao carregar cadastro estadual.</div>'
}
}
/*=========================================================
203 FUNCTION RFCRENDERFORMULARIOESTADO
=========================================================*/
function rfcRenderFormularioEstado(){
let box=document.getElementById('rfcFormularioEstado')
if(!box)return
box.innerHTML=`<div class="rfcFormGrid"><input id="rfcEstadoOrgao" type="text" placeholder="Órgão estadual"><input id="rfcEstadoOficio" type="text" placeholder="Número do ofício"><input id="rfcEstadoDataEnvio" type="date"><input id="rfcEstadoDataRecebimento" type="date"><input id="rfcEstadoDocumento" type="text" placeholder="Documento recebido"><input id="rfcEstadoObservacao" type="text" placeholder="Observação"><button id="rfcBtnSalvarEstado">SALVAR</button></div>`
let btn=document.getElementById('rfcBtnSalvarEstado')
if(btn)btn.onclick=rfcSalvarEstado
}
/*=========================================================
204 FUNCTION RFCSALVARESTADO
=========================================================*/
async function rfcSalvarEstado(){
if(!RFC_CLIENT_QUEIMADAS)return
let registro={orgao:document.getElementById('rfcEstadoOrgao')?.value||null,oficio:document.getElementById('rfcEstadoOficio')?.value||null,data_envio:document.getElementById('rfcEstadoDataEnvio')?.value||null,data_recebimento:document.getElementById('rfcEstadoDataRecebimento')?.value||null,documento:document.getElementById('rfcEstadoDocumento')?.value||null,observacao:document.getElementById('rfcEstadoObservacao')?.value||null}
if(!registro.orgao){
alert('Informe o órgão estadual.')
return
}
let{error}=await RFC_CLIENT_QUEIMADAS.from('queimadas_estado_oficio').insert(registro)
if(error){
console.error('Erro salvar Estado:',error)
alert('Erro ao salvar o cadastro estadual.')
return
}
await rfcCarregarEstado()
}
/*=========================================================
205 FUNCTION RFCRENDERINDICADORESESTADO
=========================================================*/
async function rfcRenderIndicadoresEstado(){
let box=document.getElementById('rfcIndicadoresEstado')
if(!box)return
try{
let resultado=await api('status')
let r=resultado.resumo||{}
box.innerHTML=`<div class="rfcEstatLinha"><span>🔥 Focos no banco</span><strong>${fmt(r.focos_total)}</strong></div><div class="rfcEstatLinha"><span>🔥 Focos hoje</span><strong>${fmt(r.focos_hoje)}</strong></div><div class="rfcEstatLinha"><span>🕒 Focos últimas 24h</span><strong>${fmt(r.focos_24h)}</strong></div><div class="rfcEstatLinha"><span>🏛️ Municípios atingidos</span><strong>${fmt(r.municipios_atingidos)}</strong></div><div class="rfcEstatLinha"><span>🎯 Última detecção</span><strong>${dataBR(r.ultima_deteccao)}</strong></div>`
}catch(erro){
console.error('Erro indicadores Estado:',erro)
box.innerHTML='<div class="vazio">Erro ao carregar os indicadores estaduais.</div>'
}
}
/*=========================================================
206 FUNCTION RFCCONFIGURARESTADO
=========================================================*/
function rfcConfigurarEstado(){
let botao=document.querySelector('[data-aba="estado"]')
if(botao)botao.addEventListener('click',()=>setTimeout(rfcCarregarEstado,120))
}
rfcConfigurarEstado()
/*=========================================================
300 FUNCTION RFCCARREGARPLANEJAMENTO
=========================================================*/
async function rfcCarregarPlanejamento(dias=7){
try{
if(!RFC_MUNICIPIOS_CARREGADOS)await rfcCarregarMunicipios()
let resultado=await api('focos',{scope:'RO',days:dias,limit:10000})
let focos=resultado.data||[]
let resumo=rfcCalcularResumoPlanejamento(focos)
rfcRenderPlanejamentoKPIs(resumo)
rfcRenderResumoPlanejamento(resumo,dias)
rfcRenderInstrumentosPlanejamento()
rfcRenderSituacaoPlanejamento()
rfcRenderPrioridadesPlanejamento(resumo.ranking,dias)
rfcRenderMatrizPlanejamento(resumo.ranking)
let atualizacao=document.getElementById('rfcPlanejamentoAtualizacao')
if(atualizacao)atualizacao.textContent=`ATUALIZADO • ${new Date().toLocaleString('pt-BR')}`
}catch(erro){
console.error('Erro Planejamento:',erro)
let box=document.getElementById('rfcResumoPlanejamento')
if(box)box.innerHTML='<div class="vazio">Não foi possível carregar os dados do planejamento.</div>'
}
}
/*=========================================================
301 FUNCTION RFCCALCULARRESUMOPLANEJAMENTO
=========================================================*/
function rfcCalcularResumoPlanejamento(focos){
let municipios={}
;(focos||[]).forEach(f=>{
let nome=f.municipality||'Não identificado'
if(!municipios[nome])municipios[nome]={municipio:nome,focos:0,frpMaximo:0,ultima:null}
municipios[nome].focos++
let frp=Number(f.frp||0)
if(Number.isFinite(frp)&&frp>municipios[nome].frpMaximo)municipios[nome].frpMaximo=frp
if(!municipios[nome].ultima||new Date(f.detected_at)>new Date(municipios[nome].ultima))municipios[nome].ultima=f.detected_at
})
let ranking=Object.values(municipios).sort((a,b)=>b.focos-a.focos)
let total=focos.length
let atingidos=ranking.filter(x=>x.municipio!=='Não identificado').length
let frpMaximo=ranking.length?Math.max(...ranking.map(x=>x.frpMaximo||0)):0
let verde=RFC_MUNICIPIOS.filter(x=>x.classificacaoRFC==='VERDE').length
let amarelo=RFC_MUNICIPIOS.filter(x=>x.classificacaoRFC==='AMARELO').length
let vermelho=RFC_MUNICIPIOS.filter(x=>x.classificacaoRFC==='VERMELHO').length
return{total,atingidos,frpMaximo,ranking,verde,amarelo,vermelho,totalMunicipios:RFC_MUNICIPIOS.length||52}
}
/*=========================================================
302 FUNCTION RFCRENDERPLANEJAMENTOKPIS
=========================================================*/
function rfcRenderPlanejamentoKPIs(r){
let box=document.getElementById('rfcPlanejamentoKPIs')
if(!box)return
box.innerHTML=`<div class="kpi"><div class="rotulo">📋 PLANOS DE AÇÃO</div><div class="valor">${fmt(r.verde)}</div><div class="nota">Municípios com plano</div></div><div class="kpi"><div class="rotulo">🕒 DILAÇÃO</div><div class="valor">${fmt(r.amarelo)}</div><div class="nota">Prazo prorrogado</div></div><div class="kpi"><div class="rotulo">⚠️ SEM RESPOSTA</div><div class="valor">${fmt(r.vermelho)}</div><div class="nota">Pendência administrativa</div></div><div class="kpi"><div class="rotulo">🔥 FOCOS NO PERÍODO</div><div class="valor">${fmt(r.total)}</div><div class="nota">Detecções PROTEGE</div></div><div class="kpi"><div class="rotulo">🏛️ ATINGIDOS</div><div class="valor">${fmt(r.atingidos)}</div><div class="nota">Municípios com focos</div></div>`
}
/*=========================================================
303 FUNCTION RFCRENDERRESUMOPLANEJAMENTO
=========================================================*/
function rfcRenderResumoPlanejamento(r,dias){
let box=document.getElementById('rfcResumoPlanejamento')
if(!box)return
let cobertura=r.totalMunicipios?((r.verde/r.totalMunicipios)*100):0
let resposta=r.totalMunicipios?(((r.verde+r.amarelo)/r.totalMunicipios)*100):0
let top=r.ranking[0]
box.innerHTML=`<div class="rfcResumoPrincipal"><div class="rfcResumoIndicador"><span>COBERTURA COM PLANO</span><strong>${cobertura.toFixed(1).replace('.',',')}%</strong><small>${r.verde} de ${r.totalMunicipios} municípios</small></div><div class="rfcResumoIndicador"><span>PLANO OU DILAÇÃO</span><strong>${resposta.toFixed(1).replace('.',',')}%</strong><small>${r.verde+r.amarelo} municípios com providência registrada</small></div><div class="rfcResumoIndicador"><span>FOCOS • ${dias===1?'24H':dias+' DIAS'}</span><strong>${fmt(r.total)}</strong><small>${r.atingidos} municípios atingidos</small></div><div class="rfcResumoIndicador rfcResumoAlerta"><span>MAIOR PRESSÃO</span><strong>${top?fmt(top.focos):'0'}</strong><small>${top?top.municipio:'Sem detecções'}</small></div></div>`
}
/*=========================================================
304 FUNCTION RFCRENDERINSTRUMENTOSPLANEJAMENTO
=========================================================*/
function rfcRenderInstrumentosPlanejamento(){
let box=document.getElementById('rfcInstrumentosPlanejamento')
if(!box)return
let itens=[{icone:'📘',titulo:'PIMF',descricao:'Plano Integrado Municipal de Fiscalização e enfrentamento às queimadas',status:'MUNICIPAL'},{icone:'🚒',titulo:'POTIF 2026',descricao:'Planejamento operacional relacionado à atuação integrada no período crítico',status:'ESTADUAL'},{icone:'🏛️',titulo:'PLANOS MUNICIPAIS',descricao:'Instrumentos apresentados pelos municípios em resposta ao acompanhamento do TCE-RO',status:'52 MUNICÍPIOS'},{icone:'📡',titulo:'MONITORAMENTO',descricao:'Acompanhamento contínuo das detecções de focos e evolução territorial',status:'TEMPO REAL'},{icone:'🗺️',titulo:'INTELIGÊNCIA TERRITORIAL',descricao:'Integração de municípios, focos, áreas protegidas e demais camadas geográficas',status:'GEOESPACIAL'}]
box.innerHTML=itens.map(x=>`<div class="rfcInstrumento"><div class="rfcInstrumentoIcone">${x.icone}</div><div class="rfcInstrumentoTexto"><strong>${x.titulo}</strong><span>${x.descricao}</span></div><div class="rfcInstrumentoStatus">${x.status}</div></div>`).join('')
}
/*=========================================================
305 FUNCTION RFCRENDERSITUACAOPLANEJAMENTO
=========================================================*/
function rfcRenderSituacaoPlanejamento(){
let box=document.getElementById('rfcSituacaoPlanejamento')
if(!box)return
let total=RFC_MUNICIPIOS.length||52
let verde=RFC_MUNICIPIOS.filter(x=>x.classificacaoRFC==='VERDE').length
let amarelo=RFC_MUNICIPIOS.filter(x=>x.classificacaoRFC==='AMARELO').length
let vermelho=RFC_MUNICIPIOS.filter(x=>x.classificacaoRFC==='VERMELHO').length
let pct=v=>total?(v/total)*100:0
box.innerHTML=`<div class="rfcBarraSituacao"><div class="rfcBarraSituacaoCab"><span>🟢 Plano de Ação</span><strong>${verde} • ${pct(verde).toFixed(1).replace('.',',')}%</strong></div><div class="rfcBarraFundo"><div class="rfcBarraValor rfcBarraVerde" style="width:${pct(verde)}%"></div></div></div><div class="rfcBarraSituacao"><div class="rfcBarraSituacaoCab"><span>🟡 Dilação de prazo</span><strong>${amarelo} • ${pct(amarelo).toFixed(1).replace('.',',')}%</strong></div><div class="rfcBarraFundo"><div class="rfcBarraValor rfcBarraAmarela" style="width:${pct(amarelo)}%"></div></div></div><div class="rfcBarraSituacao"><div class="rfcBarraSituacaoCab"><span>🔴 Sem resposta</span><strong>${vermelho} • ${pct(vermelho).toFixed(1).replace('.',',')}%</strong></div><div class="rfcBarraFundo"><div class="rfcBarraValor rfcBarraVermelha" style="width:${pct(vermelho)}%"></div></div></div><div class="rfcTotalPlanejamento"><span>TOTAL MONITORADO</span><strong>${total} MUNICÍPIOS</strong></div>`
}
/*=========================================================
306 FUNCTION RFCGETNIVELPRESSAO
=========================================================*/
function rfcGetNivelPressao(focos,maximo){
let n=Number(focos||0)
let max=Number(maximo||0)
let percentual=max>0?(n/max)*100:0
if(percentual>=75)return{nivel:'CRÍTICA',classe:'rfcPressaoCritica'}
if(percentual>=50)return{nivel:'MUITO ALTA',classe:'rfcPressaoMuitoAlta'}
if(percentual>=25)return{nivel:'ALTA',classe:'rfcPressaoAlta'}
if(percentual>=10)return{nivel:'MODERADA',classe:'rfcPressaoModerada'}
return{nivel:'BAIXA',classe:'rfcPressaoBaixa'}
}
/*=========================================================
307 FUNCTION RFCRENDERPRIORIDADESPLANEJAMENTO
=========================================================*/
function rfcRenderPrioridadesPlanejamento(ranking,dias){
let box=document.getElementById('rfcPrioridadesPlanejamento')
if(!box)return
let top=(ranking||[]).slice(0,10)
if(!top.length){
box.innerHTML='<div class="vazio">Sem detecções no período selecionado.</div>'
return
}
let maximo=top[0].focos||1
box.innerHTML=`<div class="rfcRankingPlanejamento">${top.map((x,i)=>{
let nivel=rfcGetNivelPressao(x.focos,maximo)
let largura=Math.max((x.focos/maximo)*100,2)
return`<div class="rfcRankingLinha"><div class="rfcRankingPosicao">${i+1}</div><div class="rfcRankingConteudo"><div class="rfcRankingCab"><strong>${x.municipio}</strong><span class="${nivel.classe}">${nivel.nivel}</span></div><div class="rfcRankingBarra"><div style="width:${largura}%"></div></div></div><div class="rfcRankingValor"><strong>${fmt(x.focos)}</strong><span>focos</span></div></div>`
}).join('')}</div><div class="rfcNotaMetodologica">Pressão relativa calculada a partir da quantidade de detecções do período de ${dias===1?'24 horas':dias+' dias'}. A classificação indica pressão de focos neste painel e não substitui índices oficiais de risco.</div>`
}
/*=========================================================
308 FUNCTION RFCRENDERMATRIZPLANEJAMENTO
=========================================================*/
function rfcRenderMatrizPlanejamento(ranking){
let box=document.getElementById('rfcMatrizPlanejamento')
if(!box)return
let focosPorMunicipio={}
;(ranking||[]).forEach(x=>focosPorMunicipio[rfcNormalizarMunicipio(x.municipio)]=x.focos)
let maximo=ranking?.[0]?.focos||1
let lista=RFC_MUNICIPIOS.map(m=>{
let focos=focosPorMunicipio[rfcNormalizarMunicipio(m.municipio)]||0
let administrativo=m.classificacaoRFC
let pontuacao=(focos/maximo)*70+(administrativo==='VERMELHO'?30:administrativo==='AMARELO'?15:0)
return{municipio:m.municipio,focos,administrativo,pontuacao}
}).sort((a,b)=>b.pontuacao-a.pontuacao).slice(0,8)
box.innerHTML=`<div class="rfcMatrizLista">${lista.map((x,i)=>{
let classe=x.pontuacao>=70?'rfcMatrizCritica':x.pontuacao>=45?'rfcMatrizAlta':x.pontuacao>=20?'rfcMatrizModerada':'rfcMatrizBaixa'
let nivel=x.pontuacao>=70?'PRIORIDADE 1':x.pontuacao>=45?'PRIORIDADE 2':x.pontuacao>=20?'ATENÇÃO':'ACOMPANHAR'
return`<div class="rfcMatrizItem ${classe}"><div class="rfcMatrizPos">${String(i+1).padStart(2,'0')}</div><div class="rfcMatrizNome"><strong>${x.municipio}</strong><span>${rfcStatusHTML(x.administrativo)}</span></div><div class="rfcMatrizFocos"><strong>${fmt(x.focos)}</strong><span>FOCOS</span></div><div class="rfcMatrizNivel">${nivel}</div></div>`
}).join('')}</div><div class="rfcNotaMetodologica">Matriz gerencial do painel: combina pressão relativa de focos com a situação administrativa registrada. Não corresponde a índice oficial de risco.</div>`
}
/*=========================================================
309 FUNCTION RFCCONFIGURARPLANEJAMENTO
=========================================================*/
function rfcConfigurarPlanejamento(){
let botao=document.querySelector('[data-aba="planejamento"]')
if(botao)botao.addEventListener('click',()=>setTimeout(()=>rfcCarregarPlanejamento(7),120))
document.querySelectorAll('[data-rfc-planejamento-dias]').forEach(btn=>btn.addEventListener('click',async()=>{
document.querySelectorAll('[data-rfc-planejamento-dias]').forEach(x=>x.classList.remove('ativa'))
btn.classList.add('ativa')
let dias=Number(btn.dataset.rfcPlanejamentoDias||7)
await rfcCarregarPlanejamento(dias)
}))
}
rfcConfigurarPlanejamento()
let RFC_MAPA_ESTADO=null
let RFC_LAYER_ESTADO_MUNICIPIOS=null
let RFC_LAYER_ESTADO_FOCOS=null
let RFC_LAYER_ESTADO_UCS=null
let RFC_LAYER_ESTADO_TIS=null
let RFC_MAPA_ESTADO_DIAS=7
let RFC_MAPA_ESTADO_ABERTO=false
let RFC_MAPA_ESTADO_DADOS=[]
/*=========================================================
210 FUNCTION RFCTOGGLEMAPAESTADO
=========================================================*/
async function rfcToggleMapaEstado(){
let conteudo=document.getElementById('rfcMapaEstadoConteudo')
let botao=document.getElementById('rfcBtnToggleMapaEstado')
if(!conteudo||!botao)return
RFC_MAPA_ESTADO_ABERTO=!RFC_MAPA_ESTADO_ABERTO
conteudo.classList.toggle('aberto',RFC_MAPA_ESTADO_ABERTO)
botao.textContent=RFC_MAPA_ESTADO_ABERTO?'✕ OCULTAR MAPA':'🗺️ EXIBIR MAPA'
if(RFC_MAPA_ESTADO_ABERTO){
if(!RFC_MAPA_ESTADO)await rfcCarregarMapaEstado(RFC_MAPA_ESTADO_DIAS)
setTimeout(()=>RFC_MAPA_ESTADO?.invalidateSize(true),250)
}
}
/*=========================================================
211 FUNCTION RFCINICIARMAPAESTADO
=========================================================*/
function rfcIniciarMapaEstado(){
let div=document.getElementById('rfcMapaEstado')
if(!div)return null
if(RFC_MAPA_ESTADO)return RFC_MAPA_ESTADO
RFC_MAPA_ESTADO=L.map(div,{preferCanvas:true,zoomControl:true}).setView([-10.9,-63.3],6)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(RFC_MAPA_ESTADO)
return RFC_MAPA_ESTADO
}
/*=========================================================
212 FUNCTION RFCGETFAIXAMAPAESTADO
=========================================================*/
function rfcGetFaixaMapaEstado(q){
let n=Number(q||0)
if(n===0)return{rotulo:'0',cor:'#f8fafc'}
if(n<=10)return{rotulo:'1–10',cor:'#dcfce7'}
if(n<=50)return{rotulo:'11–50',cor:'#fef3c7'}
if(n<=100)return{rotulo:'51–100',cor:'#fdba74'}
if(n<=250)return{rotulo:'101–250',cor:'#fb923c'}
if(n<=500)return{rotulo:'251–500',cor:'#ef4444'}
return{rotulo:'501+',cor:'#991b1b'}
}
/*=========================================================
213 FUNCTION RFCAGRUPARFOCOSMAPAESTADO
=========================================================*/
function rfcAgruparFocosMapaEstado(focos){
let resumo={}
;(focos||[]).forEach(f=>{
let nome=rfcNormalizarMunicipio(f.municipality)
if(!nome)return
if(!resumo[nome])resumo[nome]={quantidade:0,frpMaximo:0,ultima:null,nomeOriginal:f.municipality}
let m=resumo[nome]
m.quantidade++
let frp=Number(f.frp||0)
if(Number.isFinite(frp)&&frp>m.frpMaximo)m.frpMaximo=frp
if(!m.ultima||new Date(f.detected_at)>new Date(m.ultima))m.ultima=f.detected_at
})
return resumo
}
/*=========================================================
214 FUNCTION RFCCARREGARLAYERMUNICIPIOSESTADO
=========================================================*/
async function rfcCarregarLayerMunicipiosEstado(focos){
let mapa=rfcIniciarMapaEstado()
if(!mapa)return
if(RFC_LAYER_ESTADO_MUNICIPIOS)mapa.removeLayer(RFC_LAYER_ESTADO_MUNICIPIOS)
let geo=await rfcBuscarGeoJSONMunicipios()
let resumo=rfcAgruparFocosMapaEstado(focos)
RFC_LAYER_ESTADO_MUNICIPIOS=L.geoJSON(geo,{style:feature=>{
let nome=rfcNormalizarMunicipio(rfcNomeGeoJSON(feature))
let qtd=resumo[nome]?.quantidade||0
let faixa=rfcGetFaixaMapaEstado(qtd)
return{color:'#64748b',weight:.9,fillColor:faixa.cor,fillOpacity:.42}
},onEachFeature:(feature,layer)=>{
let nomeOriginal=rfcNomeGeoJSON(feature)
let nome=rfcNormalizarMunicipio(nomeOriginal)
let info=resumo[nome]||{quantidade:0,frpMaximo:0,ultima:null}
let faixa=rfcGetFaixaMapaEstado(info.quantidade)
layer.bindPopup(`<div class="popupExecutivo"><strong>${nomeOriginal}</strong><br>Focos no período: <strong>${fmt(info.quantidade)}</strong><br>Faixa: <strong>${faixa.rotulo}</strong><br>FRP máximo: <strong>${numeroBR(info.frpMaximo,1)}</strong><br>Última detecção: ${dataBR(info.ultima)}</div>`)
layer.on({mouseover:e=>e.target.setStyle({weight:2,color:'#0f172a',fillOpacity:.58}),mouseout:e=>RFC_LAYER_ESTADO_MUNICIPIOS.resetStyle(e.target)})
}}).addTo(mapa)
if(RFC_LAYER_ESTADO_MUNICIPIOS.getBounds().isValid())mapa.fitBounds(RFC_LAYER_ESTADO_MUNICIPIOS.getBounds(),{padding:[12,12],maxZoom:7})
}
/*=========================================================
215 FUNCTION RFCCARREGARLAYERFOCOSESTADO
=========================================================*/
function rfcCarregarLayerFocosEstado(focos){
let mapa=rfcIniciarMapaEstado()
if(!mapa)return
if(RFC_LAYER_ESTADO_FOCOS)mapa.removeLayer(RFC_LAYER_ESTADO_FOCOS)
RFC_LAYER_ESTADO_FOCOS=L.layerGroup()
;(focos||[]).forEach(f=>{
let lat=Number(f.latitude)
let lng=Number(f.longitude)
if(!Number.isFinite(lat)||!Number.isFinite(lng))return
let frp=Number(f.frp||0)
L.circleMarker([lat,lng],{radius:Math.max(2,Math.min(7,2+Math.sqrt(Math.max(frp,0))/5)),color:corFoco(frp),weight:.7,fillColor:corFoco(frp),fillOpacity:.72}).bindPopup(`<div class="popupExecutivo"><strong>${f.municipality||'Município não informado'}</strong><br>${dataBR(f.detected_at)}<br>Satélite: <strong>${f.satellite||'—'}</strong><br>FRP: <strong>${numeroBR(f.frp,1)}</strong></div>`).addTo(RFC_LAYER_ESTADO_FOCOS)
})
RFC_LAYER_ESTADO_FOCOS.addTo(mapa)
}
/*=========================================================
216 FUNCTION RFCBUSCARGEOJSONESTADO
=========================================================*/
async function rfcBuscarGeoJSONEstado(caminhos){
for(let caminho of caminhos){
try{
let resposta=await fetch(caminho)
if(resposta.ok)return await resposta.json()
}catch(e){}
}
return null
}
/*=========================================================
217 FUNCTION RFCCARREGARLAYERUCSESTADO
=========================================================*/
async function rfcCarregarLayerUCsEstado(){
let mapa=rfcIniciarMapaEstado()
if(!mapa)return
if(RFC_LAYER_ESTADO_UCS)return
let geo=await rfcBuscarGeoJSONEstado(['../queimadas/assets/geojson/ucs-ro.geojson','/tags/queimadas/assets/geojson/ucs-ro.geojson','../assets/geojson/ucs-ro.geojson','/tags/assets/geojson/ucs-ro.geojson'])
if(!geo){
console.warn('GeoJSON de UCs não localizado.')
return
}
RFC_LAYER_ESTADO_UCS=L.geoJSON(geo,{style:feature=>{
let esfera=String(feature.properties?.esfera||'').toUpperCase()
let cor=esfera==='ESTADUAL'?'#16a34a':esfera==='FEDERAL'?'#2563eb':'#f59e0b'
return{color:cor,weight:1.3,fillColor:cor,fillOpacity:.18}
},onEachFeature:(feature,layer)=>{
let p=feature.properties||{}
layer.bindPopup(`<div class="popupExecutivo"><strong>${p.nome_uc||p.nome||'Unidade de Conservação'}</strong><br>Esfera: ${p.esfera||'—'}<br>Categoria: ${p.categoria||'—'}<br>Município(s): ${p.municipio||'—'}</div>`)
}})
}
/*=========================================================
218 FUNCTION RFCCARREGARLAYERTISESTADO
=========================================================*/
async function rfcCarregarLayerTIsEstado(){
let mapa=rfcIniciarMapaEstado()
if(!mapa)return
if(RFC_LAYER_ESTADO_TIS)return
let geo=await rfcBuscarGeoJSONEstado(['../queimadas/assets/geojson/terras-indigenas-ro.geojson','/tags/queimadas/assets/geojson/terras-indigenas-ro.geojson','../assets/geojson/terras-indigenas-ro.geojson','/tags/assets/geojson/terras-indigenas-ro.geojson'])
if(!geo){
console.warn('GeoJSON de Terras Indígenas não localizado.')
return
}
RFC_LAYER_ESTADO_TIS=L.geoJSON(geo,{style:{color:'#7c3aed',weight:1.4,fillColor:'#a78bfa',fillOpacity:.17},onEachFeature:(feature,layer)=>{
let p=feature.properties||{}
layer.bindPopup(`<div class="popupExecutivo"><strong>${p.nome||p.terrai_nom||p.nome_ti||'Terra Indígena'}</strong><br>Município(s): ${p.municipio||p.municipios||'—'}</div>`)
}})
}
/*=========================================================
219 FUNCTION RFCRENDERMAPAESTADOKPIS
=========================================================*/
function rfcRenderMapaEstadoKPIs(focos){
let box=document.getElementById('rfcMapaEstadoKPIs')
if(!box)return
let municipios=new Set((focos||[]).map(x=>x.municipality).filter(Boolean))
let frps=(focos||[]).map(x=>Number(x.frp||0)).filter(Number.isFinite)
let frpMax=frps.length?Math.max(...frps):0
let ultimo=(focos||[]).map(x=>x.detected_at).filter(Boolean).sort().reverse()[0]
box.innerHTML=`<div><span>FOCOS</span><strong>${fmt(focos.length)}</strong></div><div><span>MUNICÍPIOS</span><strong>${fmt(municipios.size)}</strong></div><div><span>FRP MÁX.</span><strong>${numeroBR(frpMax,1)}</strong></div><div><span>PERÍODO</span><strong>${RFC_MAPA_ESTADO_DIAS===1?'24H':RFC_MAPA_ESTADO_DIAS+'D'}</strong></div><div><span>ÚLTIMA DETECÇÃO</span><strong>${ultimo?dataBR(ultimo):'—'}</strong></div>`
}
/*=========================================================
220 FUNCTION RFCCARREGARMAPAESTADO
=========================================================*/
async function rfcCarregarMapaEstado(dias=7){
try{
RFC_MAPA_ESTADO_DIAS=Number(dias||7)
let resultado=await api('focos',{scope:'RO',days:RFC_MAPA_ESTADO_DIAS,limit:10000})
RFC_MAPA_ESTADO_DADOS=resultado.data||[]
rfcIniciarMapaEstado()
await rfcCarregarLayerMunicipiosEstado(RFC_MAPA_ESTADO_DADOS)
rfcCarregarLayerFocosEstado(RFC_MAPA_ESTADO_DADOS)
await Promise.allSettled([rfcCarregarLayerUCsEstado(),rfcCarregarLayerTIsEstado()])
rfcRenderMapaEstadoKPIs(RFC_MAPA_ESTADO_DADOS)
rfcAplicarCamadasMapaEstado()
setTimeout(()=>RFC_MAPA_ESTADO?.invalidateSize(true),150)
}catch(erro){
console.error('Erro mapa estadual integrado:',erro)
}
}
/*=========================================================
221 FUNCTION RFCAPLICARCAMADASMAPAESTADO
=========================================================*/
function rfcAplicarCamadasMapaEstado(){
if(!RFC_MAPA_ESTADO)return
let ativa=nome=>document.querySelector(`[data-rfc-layer="${nome}"]`)?.classList.contains('ativa')
let tratar=(layer,nome)=>{
if(!layer)return
if(ativa(nome)){
if(!RFC_MAPA_ESTADO.hasLayer(layer))layer.addTo(RFC_MAPA_ESTADO)
}else{
if(RFC_MAPA_ESTADO.hasLayer(layer))RFC_MAPA_ESTADO.removeLayer(layer)
}
}
tratar(RFC_LAYER_ESTADO_MUNICIPIOS,'municipios')
tratar(RFC_LAYER_ESTADO_FOCOS,'focos')
tratar(RFC_LAYER_ESTADO_UCS,'ucs')
tratar(RFC_LAYER_ESTADO_TIS,'tis')
}
/*=========================================================
222 FUNCTION RFCTOGGLELAYERMAPAESTADO
=========================================================*/
async function rfcToggleLayerMapaEstado(nome,botao){
botao.classList.toggle('ativa')
if(nome==='ucs'&&!RFC_LAYER_ESTADO_UCS)await rfcCarregarLayerUCsEstado()
if(nome==='tis'&&!RFC_LAYER_ESTADO_TIS)await rfcCarregarLayerTIsEstado()
rfcAplicarCamadasMapaEstado()
}
/*=========================================================
223 FUNCTION RFCCONFIGURARMAPAESTADO
=========================================================*/
function rfcConfigurarMapaEstado(){
let toggle=document.getElementById('rfcBtnToggleMapaEstado')
if(toggle)toggle.addEventListener('click',rfcToggleMapaEstado)
document.querySelectorAll('[data-rfc-mapaestado-dias]').forEach(btn=>btn.addEventListener('click',async()=>{
document.querySelectorAll('[data-rfc-mapaestado-dias]').forEach(x=>x.classList.remove('ativa'))
btn.classList.add('ativa')
await rfcCarregarMapaEstado(Number(btn.dataset.rfcMapaestadoDias||7))
}))
document.querySelectorAll('[data-rfc-layer]').forEach(btn=>btn.addEventListener('click',()=>rfcToggleLayerMapaEstado(btn.dataset.rfcLayer,btn)))
}
rfcConfigurarMapaEstado()
/*=========================================================
500 FUNCTION RFCCONFIGURARHUBS
=========================================================*/
function rfcConfigurarHubs(){
document.querySelectorAll('[data-rfc-destino]').forEach(card=>{
card.addEventListener('click',async()=>{
let destino=card.dataset.rfcDestino
if(!destino)return
trocarAba(destino)
if(card.dataset.rfcAbrirMapa==='1'){
setTimeout(async()=>{
if(!RFC_MAPA_ESTADO_ABERTO)await rfcToggleMapaEstado()
},250)
}
})
})
}
rfcConfigurarHubs()
/*=========================================================
501 FUNCTION RFCVOLTARPARA
=========================================================*/
function rfcVoltarPara(destino){
trocarAba(destino)
window.scrollTo({top:0,behavior:'smooth'})
}
/*=========================================================
503 FUNCTION RFCCONFIGURARSUMARIOSEXECUTIVOS
=========================================================*/
function rfcConfigurarSumariosExecutivos(){
document.querySelectorAll('[data-rfc-sumario]').forEach(btn=>{
btn.addEventListener('click',()=>{
let tipo=btn.dataset.rfcSumario
rfcAbrirSumarioExecutivo(tipo)
})
})
}
/*=========================================================
504 FUNCTION RFCABRIRSUMARIOEXECUTIVO
=========================================================*/
function rfcAbrirSumarioExecutivo(tipo){
if(tipo==='estadual'){
trocarAba('executivo')
return
}
if(tipo==='municipal'){
trocarAba('municipios')
return
}
if(tipo==='prioritarios'){
trocarAba('planejamento')
setTimeout(()=>{
document.getElementById('rfcPrioridadesPlanejamento')?.scrollIntoView({behavior:'smooth',block:'start'})
},250)
return
}
if(tipo==='workshop'){
trocarAba('auditoria')
return
}
}
/*=========================================================
505 FUNCTION RFCCONFIGURARCONTROLE
=========================================================*/
function rfcConfigurarControle(){
rfcConfigurarSumariosExecutivos()
}
rfcConfigurarControle()
