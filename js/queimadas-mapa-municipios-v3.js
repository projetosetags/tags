/*=========================================================
320 MAPA MUNICIPAL • POPUP DOCUMENTAL COMPLETO V3
Mostra todas as movimentações de cada município no mapa.
=========================================================*/
(function(){
function qmmEsc(v){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]))}
function qmmData(v){if(!v)return'—';let p=String(v).slice(0,10).split('-');return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:qmmEsc(v)}
function qmmTipo(t){return({OFICIO_TCE:'OFÍCIO TCE',REITERACAO_TCE:'REITERAÇÃO TCE',RESPOSTA:'RESPOSTA',PEDIDO_DILACAO:'DILAÇÃO',PLANO_ENVIADO:'PLANO',COMPLEMENTACAO:'COMPLEMENTAÇÃO',OUTRO:'OUTRO'})[t]||qmmEsc(t||'OUTRO')}
function qmmIcone(t){return({OFICIO_TCE:'📤',REITERACAO_TCE:'🔁',RESPOSTA:'📥',PEDIDO_DILACAO:'⏳',PLANO_ENVIADO:'📘',COMPLEMENTACAO:'📎',OUTRO:'📝'})[t]||'📝'}
function qmmCor(t){return({OFICIO_TCE:'#2563eb',REITERACAO_TCE:'#7c3aed',RESPOSTA:'#0f766e',PEDIDO_DILACAO:'#d97706',PLANO_ENVIADO:'#16a34a',COMPLEMENTACAO:'#0891b2',OUTRO:'#64748b'})[t]||'#64748b'}
function qmmNormalizar(nome){if(typeof normalizarMunicipio==='function')return normalizarMunicipio(nome);return String(nome||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/['’`´]/g,"'").toUpperCase().trim()}
function qmmMovHtml(x){
let data=x.data_recebimento||x.data_envio||x.data_documento
let detalhes=[]
if(x.numero_documento)detalhes.push(`<b>${qmmEsc(x.numero_documento)}</b>`)
if(data)detalhes.push(qmmData(data))
if(x.pagina)detalhes.push(`pág. ${qmmEsc(x.pagina)}`)
let extras=[]
if(x.referencia)extras.push(qmmEsc(x.referencia))
if(x.situacao_resultante)extras.push(`<b>${qmmEsc(x.situacao_resultante)}</b>`)
if(x.observacao)extras.push(qmmEsc(x.observacao))
return `<div class="qmmMov" style="border-left-color:${qmmCor(x.tipo_evento)}"><div class="qmmMovTitulo">${qmmIcone(x.tipo_evento)} ${qmmTipo(x.tipo_evento)}</div><div class="qmmMovMeta">${detalhes.join(' • ')||'—'}</div>${extras.length?`<div class="qmmMovObs">${extras.join('<br>')}</div>`:''}</div>`
}
function qmmPopup(reg,movs){
let situacao='Sem informação'
if(reg.classificacao_cor==='VERDE')situacao='🟢 Plano apresentado'
if(reg.classificacao_cor==='AMARELO')situacao='🟡 Dilação de prazo'
if(reg.classificacao_cor==='VERMELHO')situacao='🔴 Sem resposta'
let ordenados=[...movs].sort((a,b)=>Number(a.ordem||0)-Number(b.ordem||0)||String(a.data_envio||a.data_recebimento||a.data_documento||'').localeCompare(String(b.data_envio||b.data_recebimento||b.data_documento||'')))
let obsLegado=String(reg.observacao||'').trim()
return `<div class="qmmPopup"><div class="qmmNome">${qmmEsc(reg.municipio)}</div><div class="qmmSituacao"><b>Situação:</b> ${situacao}</div><div class="qmmTituloSecao">HISTÓRICO DOCUMENTAL COMPLETO</div>${ordenados.length?ordenados.map(qmmMovHtml).join(''):'<div class="qmmVazio">Nenhuma movimentação documental cadastrada.</div>'}${obsLegado?`<div class="qmmObsGeral"><b>Observações gerais:</b><br>${qmmEsc(obsLegado)}</div>`:''}</div>`
}
function qmmCss(){if(document.getElementById('qmmStyle'))return;let s=document.createElement('style');s.id='qmmStyle';s.textContent=`
.leaflet-popup-content{margin:13px 16px!important}.leaflet-popup-content-wrapper{border-radius:14px!important}.qmmPopup{width:min(460px,76vw);max-height:520px;overflow-y:auto;padding-right:4px;font-family:inherit;color:#1f2937}.qmmNome{font-size:17px;font-weight:900;border-bottom:1px solid #cbd5e1;padding-bottom:7px;margin-bottom:7px}.qmmSituacao{font-size:12px;margin-bottom:10px}.qmmTituloSecao{font-size:9px;font-weight:900;letter-spacing:.45px;color:#64748b;margin:10px 0 6px}.qmmMov{padding:8px 9px;margin:0 0 7px;border:1px solid #e2e8f0;border-left:5px solid #64748b;border-radius:9px;background:#fff;line-height:1.35}.qmmMovTitulo{font-size:10px;font-weight:900;color:#0f172a;margin-bottom:2px}.qmmMovMeta{font-size:10px;color:#334155}.qmmMovObs{font-size:9px;color:#475569;margin-top:4px;white-space:normal;overflow-wrap:anywhere}.qmmObsGeral{margin-top:9px;padding:8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:9px;line-height:1.4;white-space:normal;overflow-wrap:anywhere}.qmmVazio{font-size:10px;color:#64748b;padding:8px 0}
`;document.head.appendChild(s)}
qmmCss()
window.renderMapaPlanosMunicipais=async function(filtro='TODOS'){
const box=document.getElementById('mapaMunicipalPlanos');if(!box)return
const c=window.clientQueimadas||window.client;if(!c)return
if(!window.mapaPlanosMunicipais&&typeof mapaPlanosMunicipais!=='undefined'&&mapaPlanosMunicipais)window.mapaPlanosMunicipais=mapaPlanosMunicipais
let mapa=window.mapaPlanosMunicipais||((typeof mapaPlanosMunicipais!=='undefined')?mapaPlanosMunicipais:null)
if(!mapa){mapa=L.map('mapaMunicipalPlanos',{zoomControl:true,preferCanvas:false}).setView([-10.9,-63.3],7);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'OpenStreetMap'}).addTo(mapa);window.mapaPlanosMunicipais=mapa;try{mapaPlanosMunicipais=mapa}catch(_){}}
let camada=window.camadaPlanosMunicipais||((typeof camadaPlanosMunicipais!=='undefined')?camadaPlanosMunicipais:null);if(camada){try{mapa.removeLayer(camada)}catch(_){}}
const [{data,error},{data:movs,error:erroMov}]=await Promise.all([c.from('vw_queimadas_municipios_resposta').select('*'),c.from('queimadas_municipios_movimentacoes').select('*').order('municipio').order('ordem')])
if(error||erroMov){console.error('Mapa Municípios:',error||erroMov);return}
const indice={},movIndice={}
;(data||[]).forEach(i=>indice[qmmNormalizar(i.municipio)]=i)
;(movs||[]).forEach(x=>{let k=qmmNormalizar(x.municipio);(movIndice[k]||(movIndice[k]=[])).push(x)})
const geo=await fetch('./assets/geojson/municipios-ro.geojson');const municipiosRO=await geo.json()
camada=L.geoJSON(municipiosRO,{style:function(feature){let nome=qmmNormalizar(feature.properties.nome||feature.properties.NM_MUN),reg=indice[nome];if(!reg)return{fillColor:'#d1d5db',weight:1,color:'#666',fillOpacity:.35};if(filtro!=='TODOS'&&reg.classificacao_cor!==filtro)return{fillColor:'#d1d5db',weight:1,color:'#999',fillOpacity:.20};return{fillColor:typeof corPlanoMunicipio==='function'?corPlanoMunicipio(reg.classificacao_cor):(reg.classificacao_cor==='VERDE'?'#16a34a':reg.classificacao_cor==='AMARELO'?'#facc15':'#dc2626'),fill:true,fillOpacity:.85,color:'#444',weight:2,opacity:1,interactive:true,bubblingMouseEvents:false}},onEachFeature:function(feature,layer){let nome=qmmNormalizar(feature.properties.nome||feature.properties.NM_MUN),reg=indice[nome];if(!reg)return;layer.bindPopup(qmmPopup(reg,movIndice[nome]||[]),{maxWidth:520,minWidth:300});layer.on({mouseover:function(){this.bringToFront();this.setStyle({weight:4,color:'#111'})},mouseout:function(){camada.resetStyle(this)}})}}).addTo(mapa)
window.camadaPlanosMunicipais=camada;try{camadaPlanosMunicipais=camada}catch(_){ }
setTimeout(()=>mapa.invalidateSize(true),120)
}
})();
